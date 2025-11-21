import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCompanySchema, insertOperatorSchema, insertAdminSchema, insertPlanSchema, insertClientSchema, insertSectorSchema, insertSubsectorSchema, insertEventSchema, insertBannerSchema, insertJobSchema, insertQuestionSchema, insertJobQuestionSchema, insertApplicationAnswerSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { EmailService } from "./emailService";

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

  app.get("/api/operators/check-cpf/:cpf", async (req, res) => {
    try {
      const { cpf } = req.params;
      
      if (!cpf) {
        return res.status(400).json({ 
          message: "CPF é obrigatório" 
        });
      }

      const existingOperator = await storage.getOperatorByCpf(cpf);
      
      return res.status(200).json({ 
        exists: !!existingOperator 
      });
    } catch (error) {
      console.error("Error checking CPF:", error);
      return res.status(500).json({ 
        message: "Erro ao verificar CPF" 
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

  app.get("/api/companies/dashboard-stats", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'company') {
        return res.status(401).json({ message: "Não autenticado" });
      }

      const stats = await storage.getCompanyDashboardStats(req.session.userId);
      return res.status(200).json(stats);
    } catch (error: any) {
      console.error(`Error getting company dashboard stats: ${error.message}`);
      return res.status(500).json({ message: "Erro ao buscar estatísticas" });
    }
  });

  app.patch("/api/companies/profile", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'company') {
        return res.status(401).json({ message: "Não autenticado" });
      }

      const updateData = req.body;
      delete updateData.id;
      delete updateData.password;
      delete updateData.cnpj;
      delete updateData.email;

      const updatedCompany = await storage.updateCompany(req.session.userId, updateData);
      const { password: _, ...companyWithoutPassword } = updatedCompany;
      
      return res.status(200).json(companyWithoutPassword);
    } catch (error) {
      console.error("Error updating company profile:", error);
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
        logoUrl: company.logoUrl || null,
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

      // Check if this is a client (admin-created) or company (site-registered)
      const existingClient = await storage.getClient(req.params.id);
      
      if (existingClient) {
        // Update in clients table
        const client = await storage.updateClient(req.params.id, req.body);
        return res.status(200).json(client);
      } else {
        // Check if it's a company
        const existingCompany = await storage.getCompany(req.params.id);
        
        if (existingCompany) {
          // Update in companies table
          const company = await storage.updateCompany(req.params.id, req.body);
          return res.status(200).json(company);
        } else {
          return res.status(404).json({ message: "Cliente não encontrado" });
        }
      }
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

  app.put("/api/companies/logo", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'company') {
        return res.status(401).json({ message: "Não autenticado" });
      }

      if (!req.body.logoURL) {
        return res.status(400).json({ message: "logoURL é obrigatório" });
      }

      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.logoURL,
        {
          owner: req.session.userId,
          visibility: "public",
        }
      );

      await storage.updateCompany(req.session.userId, { logoUrl: objectPath });

      res.status(200).json({ objectPath });
    } catch (error) {
      console.error("Error setting company logo:", error);
      res.status(500).json({ message: "Erro ao atualizar logo da empresa" });
    }
  });

  app.put("/api/companies/banner", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'company') {
        return res.status(401).json({ message: "Não autenticado" });
      }

      if (!req.body.bannerURL) {
        return res.status(400).json({ message: "bannerURL é obrigatório" });
      }

      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.bannerURL,
        {
          owner: req.session.userId,
          visibility: "public",
        }
      );

      await storage.updateCompany(req.session.userId, { bannerUrl: objectPath });

      res.status(200).json({ objectPath });
    } catch (error) {
      console.error("Error setting company banner:", error);
      res.status(500).json({ message: "Erro ao atualizar banner da empresa" });
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

  app.post("/api/email-settings/test", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const { recipientEmail } = req.body;
      
      if (!recipientEmail) {
        return res.status(400).json({ message: "Email do destinatário é obrigatório" });
      }

      const settings = await storage.getEmailSettings();
      
      if (!settings) {
        return res.status(400).json({ message: "Configurações de email não encontradas. Configure o SMTP primeiro." });
      }

      if (settings.isActive !== 'true') {
        return res.status(400).json({ message: "Serviço de email está inativo. Ative nas configurações primeiro." });
      }

      await EmailService.sendTestEmail(settings, recipientEmail);
      
      return res.status(200).json({ 
        message: "Email de teste enviado com sucesso!",
        recipient: recipientEmail 
      });
    } catch (error) {
      console.error("Error sending test email:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      return res.status(500).json({ 
        message: "Erro ao enviar email de teste",
        error: errorMessage
      });
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

  app.get("/api/purchases", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const { startDate, endDate, clientId, minAmount, maxAmount } = req.query;

      const filters: {
        startDate?: string;
        endDate?: string;
        clientId?: string;
        minAmount?: number;
        maxAmount?: number;
      } = {};

      if (startDate) filters.startDate = startDate as string;
      if (endDate) filters.endDate = endDate as string;
      if (clientId) filters.clientId = clientId as string;
      if (minAmount) filters.minAmount = parseFloat(minAmount as string);
      if (maxAmount) filters.maxAmount = parseFloat(maxAmount as string);

      const purchases = Object.keys(filters).length > 0 
        ? await storage.getPurchasesWithFilters(filters)
        : await storage.getAllPurchases();

      return res.json(purchases);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      return res.status(500).json({ message: "Erro ao buscar vendas" });
    }
  });

  app.get("/api/purchases/stats", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const allPurchases = await storage.getAllPurchases();
      
      const totalRevenue = allPurchases.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const totalSales = allPurchases.length;
      const activePurchases = allPurchases.filter(p => p.status === 'active').length;
      
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const recentPurchases = allPurchases.filter(p => new Date(p.purchaseDate) >= thirtyDaysAgo);
      const recentRevenue = recentPurchases.reduce((sum, p) => sum + parseFloat(p.amount), 0);

      const clientPurchases = allPurchases.reduce((acc, p) => {
        acc[p.clientId] = (acc[p.clientId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const totalClients = Object.keys(clientPurchases).length;

      return res.json({
        totalRevenue,
        totalSales,
        activePurchases,
        totalClients,
        recentRevenue,
        recentSales: recentPurchases.length,
      });
    } catch (error) {
      console.error("Error fetching purchase stats:", error);
      return res.status(500).json({ message: "Erro ao buscar estatísticas" });
    }
  });

  // Public endpoint - list all active jobs with company info
  app.get("/api/public/jobs", async (req, res) => {
    try {
      const jobs = await storage.getActiveJobs();
      
      // Enrich jobs with company information
      const jobsWithCompany = await Promise.all(
        jobs.map(async (job) => {
          if (job.companyId) {
            const company = await storage.getCompany(job.companyId);
            return {
              ...job,
              companyName: company?.companyName,
              companyLogo: company?.logoUrl,
            };
          }
          return job;
        })
      );

      return res.status(200).json(jobsWithCompany);
    } catch (error) {
      console.error("Error getting public jobs:", error);
      return res.status(500).json({ message: "Erro ao buscar vagas" });
    }
  });

  app.get("/api/jobs", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Não autorizado" });
      }

      let jobs;
      
      if (req.session.userType === 'company') {
        jobs = await storage.getJobsByCompany(req.session.userId);
      } else if (req.session.userType === 'admin') {
        jobs = await storage.getAllJobs();
      } else {
        return res.status(403).json({ message: "Acesso negado" });
      }

      // Enrich jobs with application count
      const jobsWithApplicationCount = await Promise.all(
        jobs.map(async (job) => {
          const applications = await storage.getApplicationsByJob(job.id);
          return {
            ...job,
            applicationCount: applications.length,
          };
        })
      );

      return res.status(200).json(jobsWithApplicationCount);
    } catch (error) {
      console.error("Error getting jobs:", error);
      return res.status(500).json({ message: "Erro ao buscar vagas" });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const job = await storage.getJob(req.params.id);
      
      if (!job) {
        return res.status(404).json({ message: "Vaga não encontrada" });
      }

      // Get company information
      let company = null;
      if (job.companyId) {
        company = await storage.getCompany(job.companyId);
        if (company) {
          // Remove sensitive data
          const { password: _, ...companyWithoutPassword } = company;
          company = companyWithoutPassword as any;
        }
      }

      return res.status(200).json({ job, company });
    } catch (error) {
      console.error("Error getting job:", error);
      return res.status(500).json({ message: "Erro ao buscar vaga" });
    }
  });

  app.post("/api/jobs", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Não autorizado" });
      }

      if (req.session.userType !== 'company') {
        return res.status(403).json({ message: "Apenas empresas podem criar vagas" });
      }

      const result = insertJobSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: fromZodError(result.error).message 
        });
      }

      const jobData = {
        ...result.data,
        companyId: req.session.userId,
        clientId: null,
      };

      const job = await storage.createJob(jobData);
      return res.status(201).json(job);
    } catch (error) {
      console.error("Error creating job:", error);
      return res.status(500).json({ message: "Erro ao criar vaga" });
    }
  });

  app.put("/api/jobs/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const existingJob = await storage.getJob(req.params.id);
      
      if (!existingJob) {
        return res.status(404).json({ message: "Vaga não encontrada" });
      }

      if (req.session.userType === 'company' && existingJob.companyId !== req.session.userId) {
        return res.status(403).json({ message: "Você não tem permissão para editar esta vaga" });
      }

      if (req.session.userType === 'admin' && existingJob.clientId && existingJob.clientId !== req.session.userId) {
        return res.status(403).json({ message: "Você não tem permissão para editar esta vaga" });
      }

      const job = await storage.updateJob(req.params.id, req.body);
      return res.status(200).json(job);
    } catch (error) {
      console.error("Error updating job:", error);
      return res.status(500).json({ message: "Erro ao atualizar vaga" });
    }
  });

  app.delete("/api/jobs/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const existingJob = await storage.getJob(req.params.id);
      
      if (!existingJob) {
        return res.status(404).json({ message: "Vaga não encontrada" });
      }

      if (req.session.userType === 'company' && existingJob.companyId !== req.session.userId) {
        return res.status(403).json({ message: "Você não tem permissão para deletar esta vaga" });
      }

      if (req.session.userType === 'admin' && existingJob.clientId && existingJob.clientId !== req.session.userId) {
        return res.status(403).json({ message: "Você não tem permissão para deletar esta vaga" });
      }

      await storage.deleteJob(req.params.id);
      return res.status(200).json({ message: "Vaga deletada com sucesso" });
    } catch (error) {
      console.error("Error deleting job:", error);
      return res.status(500).json({ message: "Erro ao deletar vaga" });
    }
  });

  app.patch("/api/jobs/:id/status", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const { status } = req.body;

      if (!status || !['active', 'suspended'].includes(status)) {
        return res.status(400).json({ message: "Status inválido. Use 'active' ou 'suspended'" });
      }

      const existingJob = await storage.getJob(req.params.id);
      
      if (!existingJob) {
        return res.status(404).json({ message: "Vaga não encontrada" });
      }

      if (req.session.userType === 'company' && existingJob.companyId !== req.session.userId) {
        return res.status(403).json({ message: "Você não tem permissão para alterar esta vaga" });
      }

      if (req.session.userType === 'admin' && existingJob.clientId && existingJob.clientId !== req.session.userId) {
        return res.status(403).json({ message: "Você não tem permissão para alterar esta vaga" });
      }

      const updatedJob = await storage.updateJob(req.params.id, { status });
      return res.status(200).json(updatedJob);
    } catch (error) {
      console.error("Error updating job status:", error);
      return res.status(500).json({ message: "Erro ao atualizar status da vaga" });
    }
  });

  // Applications endpoints
  app.post("/api/applications", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'operator') {
        return res.status(401).json({ message: "Apenas operadores podem se candidatar a vagas" });
      }

      const { jobId, answers } = req.body;

      if (!jobId) {
        return res.status(400).json({ message: "jobId é obrigatório" });
      }

      // Check if job exists
      const job = await storage.getJob(jobId);
      if (!job) {
        return res.status(404).json({ message: "Vaga não encontrada" });
      }

      // Check if already applied
      const existingApplication = await storage.checkExistingApplication(jobId, req.session.userId);
      if (existingApplication) {
        return res.status(400).json({ message: "Você já se candidatou a esta vaga" });
      }

      const application = await storage.createApplication({
        jobId,
        operatorId: req.session.userId,
        status: 'pending',
      });

      // Save answers if provided
      if (answers && typeof answers === 'object') {
        for (const [questionId, answerText] of Object.entries(answers)) {
          if (typeof answerText === 'string' && answerText.trim()) {
            await storage.createApplicationAnswer({
              applicationId: application.id,
              questionId,
              answerText: answerText.trim(),
            });
          }
        }
      }

      return res.status(201).json(application);
    } catch (error) {
      console.error("Error creating application:", error);
      return res.status(500).json({ message: "Erro ao se candidatar à vaga" });
    }
  });

  app.get("/api/applications/check/:jobId", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'operator') {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const application = await storage.checkExistingApplication(req.params.jobId, req.session.userId);
      return res.status(200).json({ hasApplied: !!application });
    } catch (error) {
      console.error("Error checking application:", error);
      return res.status(500).json({ message: "Erro ao verificar candidatura" });
    }
  });

  app.get("/api/jobs/:jobId/applications", async (req, res) => {
    try {
      if (!req.session.userId || (req.session.userType !== 'company' && req.session.userType !== 'admin')) {
        return res.status(401).json({ message: "Apenas empresas podem ver candidatos" });
      }

      const jobId = req.params.jobId;
      
      // Verify the job belongs to the company (unless admin)
      if (req.session.userType === 'company') {
        const job = await storage.getJob(jobId);
        if (!job) {
          return res.status(404).json({ message: "Vaga não encontrada" });
        }
        if (job.companyId !== req.session.userId && job.clientId !== req.session.userId) {
          return res.status(403).json({ message: "Você não tem permissão para ver candidatos desta vaga" });
        }
      }

      const applicationsWithOperators = await storage.getApplicationsWithOperatorByJob(jobId);
      return res.status(200).json(applicationsWithOperators);
    } catch (error) {
      console.error("Error fetching job applications:", error);
      return res.status(500).json({ message: "Erro ao buscar candidatos" });
    }
  });

  app.get("/api/companies/my-purchases", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Não autorizado" });
      }

      if (req.session.userType !== 'company') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const company = await storage.getCompany(req.session.userId);
      if (!company) {
        return res.status(404).json({ message: "Empresa não encontrada" });
      }

      const client = await storage.getClientByCnpj(company.cnpj);
      
      if (!client) {
        return res.status(200).json([]);
      }

      const purchases = await storage.getPurchasesByClient(client.id);
      
      const purchasesWithPlans = await Promise.all(
        purchases.map(async (purchase) => {
          const plan = await storage.getPlan(purchase.planId);
          return {
            ...purchase,
            plan,
          };
        })
      );

      return res.status(200).json(purchasesWithPlans);
    } catch (error) {
      console.error("Error getting company purchases:", error);
      return res.status(500).json({ message: "Erro ao buscar planos" });
    }
  });

  // Public endpoint - track visit to home page
  // Only counts if user doesn't have a valid cookie (30 minutes expiration)
  app.post("/api/track-visit", async (req, res) => {
    try {
      // Check if user has already been tracked in the last 30 minutes
      const hasVisitCookie = req.cookies?.visit_tracked === 'true';
      
      // Get IP address
      const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                        req.socket.remoteAddress || 
                        'unknown';
      
      // Get geolocation from IP
      let country = null;
      let city = null;
      let region = null;
      
      if (ipAddress && ipAddress !== 'unknown' && ipAddress !== '::1' && !ipAddress.startsWith('127.')) {
        try {
          const geoip = (await import('geoip-lite')).default;
          const geo = geoip.lookup(ipAddress);
          if (geo) {
            country = geo.country || null;
            city = null; // geoip-lite doesn't provide city in free version
            region = geo.region || null;
          }
        } catch (geoError) {
          console.error('Error getting geolocation:', geoError);
        }
      }
      
      // Always save visit details to database
      const userAgent = req.headers['user-agent'] || null;
      await storage.createSiteVisit({
        ipAddress: ipAddress || 'unknown',
        country,
        city,
        region,
        userAgent,
      });
      
      if (hasVisitCookie) {
        // User already counted, don't increment
        return res.status(200).json({ 
          counted: false,
          message: "Visita já registrada" 
        });
      }
      
      // Increment counter and set cookie
      const totalVisits = await storage.incrementVisitCounter();
      
      // Set cookie to expire in 30 minutes (1800000 milliseconds)
      res.cookie('visit_tracked', 'true', {
        maxAge: 30 * 60 * 1000, // 30 minutes in milliseconds
        httpOnly: true, // Prevent JavaScript access (security)
        sameSite: 'lax', // CSRF protection
      });
      
      return res.status(200).json({ 
        counted: true,
        totalVisits 
      });
    } catch (error) {
      console.error("Error tracking visit:", error);
      return res.status(500).json({ message: "Erro ao registrar visita" });
    }
  });

  // Admin endpoint - get visit statistics
  app.get("/api/admin/visit-stats", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const stats = await storage.getVisitStats();
      return res.status(200).json(stats);
    } catch (error) {
      console.error("Error getting visit stats:", error);
      return res.status(500).json({ message: "Erro ao buscar estatísticas" });
    }
  });

  // Admin endpoint - get all site visits with details
  app.get("/api/admin/site-visits", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const visits = await storage.getAllSiteVisits();
      return res.status(200).json(visits);
    } catch (error) {
      console.error("Error getting site visits:", error);
      return res.status(500).json({ message: "Erro ao buscar visitas" });
    }
  });

  // Questions endpoints
  app.get("/api/company/questions", async (req, res) => {
    try {
      if (!req.session.userId || (req.session.userType !== 'company' && req.session.userType !== 'admin')) {
        return res.status(401).json({ message: "Não autorizado" });
      }

      let questions;
      if (req.session.userType === 'company') {
        questions = await storage.getQuestionsByCompany(req.session.userId);
      } else {
        questions = await storage.getQuestionsByClient(req.session.userId);
      }

      return res.status(200).json(questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      return res.status(500).json({ message: "Erro ao buscar perguntas" });
    }
  });

  app.post("/api/company/questions", async (req, res) => {
    try {
      if (!req.session.userId || (req.session.userType !== 'company' && req.session.userType !== 'admin')) {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const result = insertQuestionSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: fromZodError(result.error).message 
        });
      }

      let questionData = result.data;
      if (req.session.userType === 'company') {
        questionData = { ...questionData, companyId: req.session.userId, clientId: null };
      } else {
        questionData = { ...questionData, clientId: req.session.userId, companyId: null };
      }

      const question = await storage.createQuestion(questionData);
      return res.status(201).json(question);
    } catch (error) {
      console.error("Error creating question:", error);
      return res.status(500).json({ message: "Erro ao criar pergunta" });
    }
  });

  app.patch("/api/company/questions/:id", async (req, res) => {
    try {
      if (!req.session.userId || (req.session.userType !== 'company' && req.session.userType !== 'admin')) {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const existingQuestion = await storage.getQuestion(req.params.id);
      if (!existingQuestion) {
        return res.status(404).json({ message: "Pergunta não encontrada" });
      }

      if (req.session.userType === 'company' && existingQuestion.companyId !== req.session.userId) {
        return res.status(403).json({ message: "Você não tem permissão para editar esta pergunta" });
      }

      if (req.session.userType === 'admin' && existingQuestion.clientId !== req.session.userId) {
        return res.status(403).json({ message: "Você não tem permissão para editar esta pergunta" });
      }

      const question = await storage.updateQuestion(req.params.id, req.body);
      return res.status(200).json(question);
    } catch (error) {
      console.error("Error updating question:", error);
      return res.status(500).json({ message: "Erro ao atualizar pergunta" });
    }
  });

  app.delete("/api/company/questions/:id", async (req, res) => {
    try {
      if (!req.session.userId || (req.session.userType !== 'company' && req.session.userType !== 'admin')) {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const existingQuestion = await storage.getQuestion(req.params.id);
      if (!existingQuestion) {
        return res.status(404).json({ message: "Pergunta não encontrada" });
      }

      if (req.session.userType === 'company' && existingQuestion.companyId !== req.session.userId) {
        return res.status(403).json({ message: "Você não tem permissão para deletar esta pergunta" });
      }

      if (req.session.userType === 'admin' && existingQuestion.clientId !== req.session.userId) {
        return res.status(403).json({ message: "Você não tem permissão para deletar esta pergunta" });
      }

      await storage.deleteQuestion(req.params.id);
      return res.status(200).json({ message: "Pergunta deletada com sucesso" });
    } catch (error) {
      console.error("Error deleting question:", error);
      return res.status(500).json({ message: "Erro ao deletar pergunta" });
    }
  });

  // Job Questions endpoints
  app.get("/api/jobs/:jobId/questions", async (req, res) => {
    try {
      const jobQuestions = await storage.getJobQuestionsByJob(req.params.jobId);
      // Extract only the questions from the results
      const questions = jobQuestions.map(jq => jq.question);
      return res.status(200).json(questions);
    } catch (error) {
      console.error("Error fetching job questions:", error);
      return res.status(500).json({ message: "Erro ao buscar perguntas da vaga" });
    }
  });

  app.post("/api/jobs/:jobId/questions", async (req, res) => {
    try {
      if (!req.session.userId || (req.session.userType !== 'company' && req.session.userType !== 'admin')) {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const job = await storage.getJob(req.params.jobId);
      if (!job) {
        return res.status(404).json({ message: "Vaga não encontrada" });
      }

      if (req.session.userType === 'company' && job.companyId !== req.session.userId) {
        return res.status(403).json({ message: "Você não tem permissão para adicionar perguntas a esta vaga" });
      }

      if (req.session.userType === 'admin' && job.clientId !== req.session.userId) {
        return res.status(403).json({ message: "Você não tem permissão para adicionar perguntas a esta vaga" });
      }

      const { questionIds } = req.body;

      if (!Array.isArray(questionIds) || questionIds.length === 0) {
        return res.status(400).json({ message: "questionIds deve ser um array não vazio" });
      }

      const createdJobQuestions = [];
      for (let i = 0; i < questionIds.length; i++) {
        const questionId = questionIds[i];
        const result = insertJobQuestionSchema.safeParse({
          jobId: req.params.jobId,
          questionId,
          displayOrder: i + 1,
        });
        
        if (!result.success) {
          return res.status(400).json({ 
            message: fromZodError(result.error).message 
          });
        }

        const jobQuestion = await storage.createJobQuestion(result.data);
        createdJobQuestions.push(jobQuestion);
      }

      return res.status(201).json(createdJobQuestions);
    } catch (error) {
      console.error("Error creating job question:", error);
      return res.status(500).json({ message: "Erro ao adicionar pergunta à vaga" });
    }
  });

  app.delete("/api/job-questions/:id", async (req, res) => {
    try {
      if (!req.session.userId || (req.session.userType !== 'company' && req.session.userType !== 'admin')) {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const jobQuestion = await storage.getJobQuestion(req.params.id);
      if (!jobQuestion) {
        return res.status(404).json({ message: "Associação não encontrada" });
      }

      await storage.deleteJobQuestion(req.params.id);
      return res.status(200).json({ message: "Pergunta removida da vaga com sucesso" });
    } catch (error) {
      console.error("Error deleting job question:", error);
      return res.status(500).json({ message: "Erro ao remover pergunta da vaga" });
    }
  });

  // Application Answers endpoints
  app.get("/api/applications/:applicationId/answers", async (req, res) => {
    try {
      if (!req.session.userId || (req.session.userType !== 'company' && req.session.userType !== 'admin' && req.session.userType !== 'operator')) {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const answers = await storage.getApplicationAnswersByApplication(req.params.applicationId);
      return res.status(200).json(answers);
    } catch (error) {
      console.error("Error fetching application answers:", error);
      return res.status(500).json({ message: "Erro ao buscar respostas" });
    }
  });

  app.post("/api/applications/:applicationId/answers", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'operator') {
        return res.status(401).json({ message: "Apenas operadores podem enviar respostas" });
      }

      const { answers } = req.body;

      if (!Array.isArray(answers)) {
        return res.status(400).json({ message: "Respostas devem ser um array" });
      }

      const createdAnswers = [];
      for (const answer of answers) {
        const result = insertApplicationAnswerSchema.safeParse({
          ...answer,
          applicationId: req.params.applicationId,
        });
        
        if (!result.success) {
          return res.status(400).json({ 
            message: fromZodError(result.error).message 
          });
        }

        const createdAnswer = await storage.createApplicationAnswer(result.data);
        createdAnswers.push(createdAnswer);
      }

      return res.status(201).json(createdAnswers);
    } catch (error) {
      console.error("Error creating application answers:", error);
      return res.status(500).json({ message: "Erro ao salvar respostas" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
