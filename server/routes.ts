import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCompanySchema, insertOperatorSchema, insertAdminSchema, insertPlanSchema, insertClientSchema, insertSectorSchema, insertSubsectorSchema, insertEventSchema, insertBannerSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/companies/register", async (req, res) => {
    try {
      const result = insertCompanySchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: fromZodError(result.error).message 
        });
      }

      const existingEmail = await storage.getCompanyByEmail(result.data.email);
      if (existingEmail) {
        return res.status(400).json({ 
          message: "E-mail já cadastrado" 
        });
      }

      const existingCnpj = await storage.getCompanyByCnpj(result.data.cnpj);
      if (existingCnpj) {
        return res.status(400).json({ 
          message: "CNPJ já cadastrado" 
        });
      }

      const company = await storage.createCompany(result.data);
      
      req.session.userId = company.id;
      req.session.userType = 'company';
      
      const { password, ...companyWithoutPassword } = company;
      
      return res.status(201).json(companyWithoutPassword);
    } catch (error) {
      console.error("Error registering company:", error);
      return res.status(500).json({ 
        message: "Erro ao criar conta" 
      });
    }
  });

  app.post("/api/companies/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ 
          message: "E-mail e senha são obrigatórios" 
        });
      }

      const company = await storage.getCompanyByEmail(email);
      
      if (!company || company.password !== password) {
        return res.status(401).json({ 
          message: "E-mail ou senha inválidos" 
        });
      }

      req.session.userId = company.id;
      req.session.userType = 'company';

      const { password: _, ...companyWithoutPassword } = company;
      
      return res.status(200).json(companyWithoutPassword);
    } catch (error) {
      console.error("Error logging in company:", error);
      return res.status(500).json({ 
        message: "Erro ao fazer login" 
      });
    }
  });

  app.post("/api/operators/register", async (req, res) => {
    try {
      const result = insertOperatorSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: fromZodError(result.error).message 
        });
      }

      const existingEmail = await storage.getOperatorByEmail(result.data.email);
      if (existingEmail) {
        return res.status(400).json({ 
          message: "E-mail já cadastrado" 
        });
      }

      const existingCpf = await storage.getOperatorByCpf(result.data.cpf);
      if (existingCpf) {
        return res.status(400).json({ 
          message: "CPF já cadastrado" 
        });
      }

      const operator = await storage.createOperator(result.data);
      
      req.session.userId = operator.id;
      req.session.userType = 'operator';
      
      const { password, ...operatorWithoutPassword } = operator;
      
      return res.status(201).json(operatorWithoutPassword);
    } catch (error) {
      console.error("Error registering operator:", error);
      return res.status(500).json({ 
        message: "Erro ao criar conta" 
      });
    }
  });

  app.post("/api/operators/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ 
          message: "E-mail e senha são obrigatórios" 
        });
      }

      const operator = await storage.getOperatorByEmail(email);
      
      if (!operator || operator.password !== password) {
        return res.status(401).json({ 
          message: "E-mail ou senha inválidos" 
        });
      }

      req.session.userId = operator.id;
      req.session.userType = 'operator';

      const { password: _, ...operatorWithoutPassword } = operator;
      
      return res.status(200).json(operatorWithoutPassword);
    } catch (error) {
      console.error("Error logging in operator:", error);
      return res.status(500).json({ 
        message: "Erro ao fazer login" 
      });
    }
  });

  app.patch("/api/operators/profile", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'operator') {
        return res.status(401).json({ message: "Não autenticado" });
      }

      const updateData = req.body;
      delete updateData.id;
      delete updateData.password;
      delete updateData.cpf;
      delete updateData.email;

      const updatedOperator = await storage.updateOperator(req.session.userId, updateData);
      const { password: _, ...operatorWithoutPassword } = updatedOperator;
      
      return res.status(200).json(operatorWithoutPassword);
    } catch (error) {
      console.error("Error updating operator profile:", error);
      return res.status(500).json({ message: "Erro ao atualizar perfil" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ 
          message: "E-mail e senha são obrigatórios" 
        });
      }

      const company = await storage.getCompanyByEmail(email);
      if (company && company.password === password) {
        req.session.userId = company.id;
        req.session.userType = 'company';
        const { password: _, ...companyWithoutPassword } = company;
        return res.status(200).json({ 
          user: companyWithoutPassword, 
          userType: 'company' 
        });
      }

      const operator = await storage.getOperatorByEmail(email);
      if (operator && operator.password === password) {
        req.session.userId = operator.id;
        req.session.userType = 'operator';
        const { password: _, ...operatorWithoutPassword } = operator;
        return res.status(200).json({ 
          user: operatorWithoutPassword, 
          userType: 'operator' 
        });
      }

      return res.status(401).json({ 
        message: "E-mail ou senha inválidos" 
      });
    } catch (error) {
      console.error("Error logging in:", error);
      return res.status(500).json({ 
        message: "Erro ao fazer login" 
      });
    }
  });

  app.get("/api/users/list", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(403).json({ 
          message: "Acesso negado. Apenas administradores podem acessar esta página." 
        });
      }

      const companies = await storage.getAllCompanies();
      const operators = await storage.getAllOperators();
      const clients = await storage.getAllClients();

      const companiesWithoutPassword = companies.map(({ password, ...company }) => company);
      const operatorsWithoutPassword = operators.map(({ password, ...operator }) => operator);

      return res.status(200).json({
        companies: companiesWithoutPassword,
        operators: operatorsWithoutPassword,
        clients: clients,
        total: {
          companies: companies.length,
          operators: operators.length,
          clients: clients.length,
        },
      });
    } catch (error) {
      console.error("Error listing users:", error);
      return res.status(500).json({ message: "Erro ao listar usuários" });
    }
  });

  app.get("/api/stats", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(403).json({ 
          message: "Acesso negado" 
        });
      }

      const stats = await storage.getStats();
      return res.status(200).json(stats);
    } catch (error) {
      console.error("Error getting stats:", error);
      return res.status(500).json({ message: "Erro ao obter estatísticas" });
    }
  });

  app.get("/api/plans", async (req, res) => {
    try {
      const plans = await storage.getAllPlans();
      return res.status(200).json(plans);
    } catch (error) {
      console.error("Error listing plans:", error);
      return res.status(500).json({ message: "Erro ao listar planos" });
    }
  });

  app.post("/api/plans", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(403).json({ 
          message: "Acesso negado. Apenas administradores podem criar planos." 
        });
      }

      const result = insertPlanSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: fromZodError(result.error).message 
        });
      }

      const plan = await storage.createPlan(result.data);
      return res.status(201).json(plan);
    } catch (error) {
      console.error("Error creating plan:", error);
      return res.status(500).json({ message: "Erro ao criar plano" });
    }
  });

  app.put("/api/plans/:id", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(403).json({ 
          message: "Acesso negado. Apenas administradores podem editar planos." 
        });
      }

      const plan = await storage.updatePlan(req.params.id, req.body);
      return res.status(200).json(plan);
    } catch (error) {
      console.error("Error updating plan:", error);
      return res.status(500).json({ message: "Erro ao atualizar plano" });
    }
  });

  app.delete("/api/plans/:id", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(403).json({ 
          message: "Acesso negado. Apenas administradores podem excluir planos." 
        });
      }

      const purchases = await storage.getPurchasesByPlan(req.params.id);
      
      if (purchases.length > 0) {
        return res.status(400).json({ 
          message: `Não é possível excluir este plano pois existem ${purchases.length} compra(s) associada(s) a ele. Desative o plano ao invés de excluí-lo.`
        });
      }

      await storage.deletePlan(req.params.id);
      return res.status(200).json({ message: "Plano excluído com sucesso" });
    } catch (error) {
      console.error("Error deleting plan:", error);
      return res.status(500).json({ message: "Erro ao excluir plano" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      if (!req.session.userId || !req.session.userType) {
        return res.status(401).json({ message: "Não autenticado" });
      }

      if (req.session.userType === 'company') {
        const company = await storage.getCompany(req.session.userId);
        if (!company) {
          req.session.destroy(() => {});
          return res.status(401).json({ message: "Usuário não encontrado" });
        }
        const { password, ...companyWithoutPassword } = company;
        return res.status(200).json({ 
          user: companyWithoutPassword, 
          userType: 'company' 
        });
      } else if (req.session.userType === 'operator') {
        const operator = await storage.getOperator(req.session.userId);
        if (!operator) {
          req.session.destroy(() => {});
          return res.status(401).json({ message: "Usuário não encontrado" });
        }
        const { password, ...operatorWithoutPassword } = operator;
        return res.status(200).json({ 
          user: operatorWithoutPassword, 
          userType: 'operator' 
        });
      } else if (req.session.userType === 'admin') {
        const admin = await storage.getAdmin(req.session.userId);
        if (!admin) {
          req.session.destroy(() => {});
          return res.status(401).json({ message: "Usuário não encontrado" });
        }
        const { password, ...adminWithoutPassword } = admin;
        return res.status(200).json({ 
          user: adminWithoutPassword, 
          userType: 'admin' 
        });
      }
    } catch (error) {
      console.error("Error getting current user:", error);
      return res.status(500).json({ message: "Erro ao verificar autenticação" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
          return res.status(500).json({ message: "Erro ao fazer logout" });
        }
        res.clearCookie('connect.sid');
        return res.status(200).json({ message: "Logout realizado com sucesso" });
      });
    } catch (error) {
      console.error("Error logging out:", error);
      return res.status(500).json({ message: "Erro ao fazer logout" });
    }
  });

  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ 
          message: "E-mail e senha são obrigatórios" 
        });
      }

      const admin = await storage.getAdminByEmail(email);
      
      if (!admin || admin.password !== password) {
        return res.status(401).json({ 
          message: "E-mail ou senha inválidos" 
        });
      }

      req.session.userId = admin.id;
      req.session.userType = 'admin';

      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            console.error("❌ Error saving session:", err);
            reject(err);
          } else {
            console.log("✅ Admin session saved:", {
              userId: req.session.userId,
              userType: req.session.userType,
              sessionID: req.sessionID
            });
            resolve();
          }
        });
      });

      const { password: _, ...adminWithoutPassword } = admin;
      
      return res.status(200).json({ 
        user: adminWithoutPassword, 
        userType: 'admin' 
      });
    } catch (error) {
      console.error("Error logging in admin:", error);
      return res.status(500).json({ 
        message: "Erro ao fazer login" 
      });
    }
  });

  app.get("/api/experiences/:operatorId", async (req, res) => {
    try {
      const { operatorId } = req.params;
      const experiences = await storage.getExperiencesByOperator(operatorId);
      return res.status(200).json(experiences);
    } catch (error) {
      console.error("Error getting experiences:", error);
      return res.status(500).json({ message: "Erro ao buscar experiências" });
    }
  });

  app.post("/api/experiences", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'operator') {
        return res.status(401).json({ message: "Não autenticado" });
      }

      const experienceData = {
        ...req.body,
        operatorId: req.session.userId,
      };

      const experience = await storage.createExperience(experienceData);
      return res.status(201).json(experience);
    } catch (error) {
      console.error("Error creating experience:", error);
      return res.status(500).json({ message: "Erro ao criar experiência" });
    }
  });

  app.patch("/api/experiences/:id", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'operator') {
        return res.status(401).json({ message: "Não autenticado" });
      }

      const { id } = req.params;
      const experience = await storage.getExperience(id);

      if (!experience || experience.operatorId !== req.session.userId) {
        return res.status(404).json({ message: "Experiência não encontrada" });
      }

      const updated = await storage.updateExperience(id, req.body);
      return res.status(200).json(updated);
    } catch (error) {
      console.error("Error updating experience:", error);
      return res.status(500).json({ message: "Erro ao atualizar experiência" });
    }
  });

  app.delete("/api/experiences/:id", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'operator') {
        return res.status(401).json({ message: "Não autenticado" });
      }

      const { id } = req.params;
      const experience = await storage.getExperience(id);

      if (!experience || experience.operatorId !== req.session.userId) {
        return res.status(404).json({ message: "Experiência não encontrada" });
      }

      await storage.deleteExperience(id);
      return res.status(200).json({ message: "Experiência deletada com sucesso" });
    } catch (error) {
      console.error("Error deleting experience:", error);
      return res.status(500).json({ message: "Erro ao deletar experiência" });
    }
  });

  app.get("/api/operators", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const operators = await storage.getAllOperators();
      return res.status(200).json(operators);
    } catch (error) {
      console.error("Error getting operators:", error);
      return res.status(500).json({ message: "Erro ao buscar operadores" });
    }
  });

  app.get("/api/clients", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const clients = await storage.getAllClients();
      const companies = await storage.getAllCompanies();

      const clientsWithSource = clients.map(client => ({
        ...client,
        source: 'admin_client' as const,
      }));

      const companiesAsClients = companies.map(company => ({
        id: company.id,
        companyName: company.companyName,
        cnpj: company.cnpj,
        email: company.email,
        phone: company.phone,
        website: company.website || '',
        contactName: company.companyName,
        contactEmail: company.email,
        contactPhone: company.phone,
        logoUrl: null,
        primaryColor: '#8b5cf6',
        secondaryColor: '#a78bfa',
        accentColor: '#c4b5fd',
        isActive: 'true',
        source: 'registered_company' as const,
      }));

      const allClients = [...clientsWithSource, ...companiesAsClients];
      
      return res.status(200).json(allClients);
    } catch (error) {
      console.error("Error getting clients:", error);
      return res.status(500).json({ message: "Erro ao buscar clientes" });
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const result = insertClientSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: fromZodError(result.error).message 
        });
      }

      const existingEmail = await storage.getClientByEmail(result.data.email);
      if (existingEmail) {
        return res.status(400).json({ 
          message: "E-mail já cadastrado" 
        });
      }

      const existingCnpj = await storage.getClientByCnpj(result.data.cnpj);
      if (existingCnpj) {
        return res.status(400).json({ 
          message: "CNPJ já cadastrado" 
        });
      }

      const client = await storage.createClient(result.data);
      return res.status(201).json(client);
    } catch (error) {
      console.error("Error creating client:", error);
      return res.status(500).json({ message: "Erro ao criar cliente" });
    }
  });

  app.put("/api/clients/:id", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const client = await storage.updateClient(req.params.id, req.body);
      return res.status(200).json(client);
    } catch (error) {
      console.error("Error updating client:", error);
      return res.status(500).json({ message: "Erro ao atualizar cliente" });
    }
  });

  app.delete("/api/clients/:id", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      await storage.deleteClient(req.params.id);
      return res.status(200).json({ message: "Cliente deletado com sucesso" });
    } catch (error) {
      console.error("Error deleting client:", error);
      return res.status(500).json({ message: "Erro ao deletar cliente" });
    }
  });

  app.post("/api/clients/upload-logo", async (req, res) => {
    try {
      console.log("📸 Upload logo request - Session:", {
        userId: req.session.userId,
        userType: req.session.userType,
        sessionID: req.sessionID
      });

      if (!req.session.userId || req.session.userType !== 'admin') {
        console.log("❌ Access denied - userId:", req.session.userId, "userType:", req.session.userType);
        return res.status(403).json({ message: "Acesso negado. Apenas administradores podem fazer upload de logos de clientes" });
      }

      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      console.log("✅ Upload URL generated successfully");
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL for client logo:", error);
      return res.status(500).json({ message: "Erro ao obter URL de upload" });
    }
  });

  app.get("/api/clients/:id/purchases", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const clientPurchases = await storage.getPurchasesByClient(req.params.id);
      
      const purchasesWithPlans = await Promise.all(
        clientPurchases.map(async (purchase) => {
          const plan = await storage.getPlan(purchase.planId);
          return {
            ...purchase,
            planName: plan?.name || 'Plano não encontrado',
            planDescription: plan?.description,
          };
        })
      );
      
      return res.status(200).json(purchasesWithPlans);
    } catch (error) {
      console.error("Error fetching client purchases:", error);
      return res.status(500).json({ message: "Erro ao buscar compras do cliente" });
    }
  });

  app.post("/api/clients/set-logo", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      if (!req.body.logoURL) {
        return res.status(400).json({ message: "logoURL é obrigatório" });
      }

      const objectStorageService = new ObjectStorageService();
      
      let objectPath;
      let retries = 3;
      let lastError;

      while (retries > 0) {
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
            req.body.logoURL,
            {
              owner: req.session.userId,
              visibility: "public",
            }
          );
          break;
        } catch (error) {
          lastError = error;
          retries--;
          console.log(`⚠️ Retry setting logo permissions (${retries} left)...`);
          if (retries === 0) throw error;
        }
      }

      console.log("✅ Logo set as public:", objectPath);
      res.status(200).json({ objectPath });
    } catch (error) {
      console.error("Error setting logo as public:", error);
      res.status(500).json({ message: "Erro ao configurar logo. Tente novamente em alguns segundos." });
    }
  });

  app.post("/api/objects/upload", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Não autenticado" });
      }

      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      return res.status(500).json({ message: "Erro ao obter URL de upload" });
    }
  });

  app.put("/api/operators/profile-photo", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'operator') {
        return res.status(401).json({ message: "Não autenticado" });
      }

      if (!req.body.profilePhotoURL) {
        return res.status(400).json({ message: "profilePhotoURL é obrigatório" });
      }

      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.profilePhotoURL,
        {
          owner: req.session.userId,
          visibility: "public",
        }
      );

      await storage.updateOperator(req.session.userId, { profilePhotoUrl: objectPath });

      res.status(200).json({ objectPath });
    } catch (error) {
      console.error("Error setting profile photo:", error);
      res.status(500).json({ message: "Erro ao atualizar foto de perfil" });
    }
  });

  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.get("/api/email-settings", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const settings = await storage.getEmailSettings();
      return res.status(200).json(settings || null);
    } catch (error) {
      console.error("Error getting email settings:", error);
      return res.status(500).json({ message: "Erro ao buscar configurações de email" });
    }
  });

  app.post("/api/email-settings", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const existingSettings = await storage.getEmailSettings();
      
      if (existingSettings) {
        const updated = await storage.updateEmailSettings(existingSettings.id, req.body);
        return res.status(200).json(updated);
      } else {
        const created = await storage.createEmailSettings(req.body);
        return res.status(201).json(created);
      }
    } catch (error) {
      console.error("Error saving email settings:", error);
      return res.status(500).json({ message: "Erro ao salvar configurações de email" });
    }
  });

  app.get("/api/sectors", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const sectors = await storage.getAllSectors();
      return res.json(sectors);
    } catch (error) {
      console.error("Error fetching sectors:", error);
      return res.status(500).json({ message: "Erro ao buscar setores" });
    }
  });

  app.post("/api/sectors", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const result = insertSectorSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: fromZodError(result.error).message 
        });
      }

      const sector = await storage.createSector(result.data);
      return res.status(201).json(sector);
    } catch (error) {
      console.error("Error creating sector:", error);
      return res.status(500).json({ message: "Erro ao criar setor" });
    }
  });

  app.patch("/api/sectors/:id", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const sector = await storage.updateSector(req.params.id, req.body);
      return res.json(sector);
    } catch (error) {
      console.error("Error updating sector:", error);
      return res.status(500).json({ message: "Erro ao atualizar setor" });
    }
  });

  app.delete("/api/sectors/:id", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      await storage.deleteSector(req.params.id);
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting sector:", error);
      return res.status(500).json({ message: "Erro ao deletar setor" });
    }
  });

  app.get("/api/subsectors", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const subsectors = await storage.getAllSubsectors();
      return res.json(subsectors);
    } catch (error) {
      console.error("Error fetching subsectors:", error);
      return res.status(500).json({ message: "Erro ao buscar subsetores" });
    }
  });

  app.get("/api/subsectors/sector/:sectorId", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const subsectors = await storage.getSubsectorsBySector(req.params.sectorId);
      return res.json(subsectors);
    } catch (error) {
      console.error("Error fetching subsectors by sector:", error);
      return res.status(500).json({ message: "Erro ao buscar subsetores" });
    }
  });

  app.post("/api/subsectors", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const result = insertSubsectorSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: fromZodError(result.error).message 
        });
      }

      const subsector = await storage.createSubsector(result.data);
      return res.status(201).json(subsector);
    } catch (error) {
      console.error("Error creating subsector:", error);
      return res.status(500).json({ message: "Erro ao criar subsetor" });
    }
  });

  app.patch("/api/subsectors/:id", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const subsector = await storage.updateSubsector(req.params.id, req.body);
      return res.json(subsector);
    } catch (error) {
      console.error("Error updating subsector:", error);
      return res.status(500).json({ message: "Erro ao atualizar subsetor" });
    }
  });

  app.delete("/api/subsectors/:id", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      await storage.deleteSubsector(req.params.id);
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting subsector:", error);
      return res.status(500).json({ message: "Erro ao deletar subsetor" });
    }
  });

  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getAllEvents();
      return res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      return res.status(500).json({ message: "Erro ao buscar eventos" });
    }
  });

  app.get("/api/events/active", async (req, res) => {
    try {
      const events = await storage.getActiveEvents();
      return res.json(events);
    } catch (error) {
      console.error("Error fetching active events:", error);
      return res.status(500).json({ message: "Erro ao buscar eventos ativos" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Evento não encontrado" });
      }
      return res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      return res.status(500).json({ message: "Erro ao buscar evento" });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const result = insertEventSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: fromZodError(result.error).message 
        });
      }

      const event = await storage.createEvent(result.data);
      return res.status(201).json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      return res.status(500).json({ message: "Erro ao criar evento" });
    }
  });

  app.patch("/api/events/:id", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const event = await storage.updateEvent(req.params.id, req.body);
      return res.json(event);
    } catch (error) {
      console.error("Error updating event:", error);
      return res.status(500).json({ message: "Erro ao atualizar evento" });
    }
  });

  app.delete("/api/events/:id", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      await storage.deleteEvent(req.params.id);
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting event:", error);
      return res.status(500).json({ message: "Erro ao deletar evento" });
    }
  });

  app.post("/api/events/upload-cover", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL for event cover:", error);
      return res.status(500).json({ message: "Erro ao obter URL de upload" });
    }
  });

  app.post("/api/events/set-cover", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      if (!req.body.coverURL) {
        return res.status(400).json({ message: "coverURL é obrigatório" });
      }

      const objectStorageService = new ObjectStorageService();
      
      let objectPath;
      let retries = 3;
      let lastError;

      while (retries > 0) {
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
            req.body.coverURL,
            {
              owner: req.session.userId,
              visibility: "public",
            }
          );
          
          break;
        } catch (error) {
          lastError = error;
          retries--;
          console.log(`Retry setting cover ACL, ${retries} retries remaining`);
          if (retries === 0) {
            throw lastError;
          }
        }
      }

      return res.json({ objectPath });
    } catch (error) {
      console.error("Error setting event cover ACL:", error);
      return res.status(500).json({ message: "Erro ao processar imagem de capa" });
    }
  });

  app.get("/api/banners", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }
      const banners = await storage.getAllBanners();
      return res.json(banners);
    } catch (error) {
      console.error("Error fetching banners:", error);
      return res.status(500).json({ message: "Erro ao buscar banners" });
    }
  });

  app.get("/api/banners/active", async (req, res) => {
    try {
      const banners = await storage.getActiveBanners();
      return res.json(banners);
    } catch (error) {
      console.error("Error fetching active banners:", error);
      return res.status(500).json({ message: "Erro ao buscar banners ativos" });
    }
  });

  app.post("/api/banners", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const result = insertBannerSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: fromZodError(result.error).message 
        });
      }

      const banner = await storage.createBanner(result.data);
      return res.status(201).json(banner);
    } catch (error) {
      console.error("Error creating banner:", error);
      return res.status(500).json({ message: "Erro ao criar banner" });
    }
  });

  app.patch("/api/banners/:id", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const banner = await storage.updateBanner(req.params.id, req.body);
      return res.json(banner);
    } catch (error) {
      console.error("Error updating banner:", error);
      return res.status(500).json({ message: "Erro ao atualizar banner" });
    }
  });

  app.delete("/api/banners/:id", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      await storage.deleteBanner(req.params.id);
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting banner:", error);
      return res.status(500).json({ message: "Erro ao deletar banner" });
    }
  });

  app.post("/api/banners/upload-image", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL for banner image:", error);
      return res.status(500).json({ message: "Erro ao obter URL de upload" });
    }
  });

  app.post("/api/banners/set-image", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      if (!req.body.imageURL) {
        return res.status(400).json({ message: "imageURL é obrigatório" });
      }

      const objectStorageService = new ObjectStorageService();
      
      let objectPath;
      let retries = 3;
      let lastError;

      while (retries > 0) {
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
            req.body.imageURL,
            {
              owner: req.session.userId,
              visibility: "public",
            }
          );
          
          break;
        } catch (error) {
          lastError = error;
          retries--;
          console.log(`Retry setting banner image ACL, ${retries} retries remaining`);
          if (retries === 0) {
            throw lastError;
          }
        }
      }

      return res.json({ objectPath });
    } catch (error) {
      console.error("Error setting banner image ACL:", error);
      return res.status(500).json({ message: "Erro ao processar imagem do banner" });
    }
  });

  app.get("/api/settings", async (req, res) => {
    try {
      const settingsData = await storage.getAllSettings();
      const settingsMap: Record<string, string> = {};
      settingsData.forEach(s => {
        settingsMap[s.key] = s.value;
      });
      return res.json(settingsMap);
    } catch (error) {
      console.error("Error fetching settings:", error);
      return res.status(500).json({ message: "Erro ao buscar configurações" });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const { key, value } = req.body;
      if (!key || value === undefined) {
        return res.status(400).json({ message: "key e value são obrigatórios" });
      }

      const setting = await storage.upsertSetting({ key, value });
      return res.json(setting);
    } catch (error) {
      console.error("Error upserting setting:", error);
      return res.status(500).json({ message: "Erro ao salvar configuração" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
