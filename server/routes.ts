import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import path from "path";
import multer from "multer";
import { randomUUID } from "crypto";
import fs from "fs";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { insertCompanySchema, insertOperatorSchema, insertAdminSchema, insertPlanSchema, insertClientSchema, insertSectorSchema, insertSubsectorSchema, insertEventSchema, insertBannerSchema, insertJobSchema, insertQuestionSchema, insertJobQuestionSchema, insertApplicationAnswerSchema, insertNewsletterSubscriptionSchema, insertPasswordResetCodeSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { EmailService } from "./emailService";

// Configure multer for local file uploads
const uploadsDir = path.join(process.cwd(), 'attached_assets', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${randomUUID()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: multerStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido. Use apenas imagens (JPEG, PNG, GIF, WebP).'));
    }
  }
});

async function verifyPasswordAndMigrate(
  plainPassword: string,
  storedPassword: string,
  userId: string,
  userType: 'company' | 'operator' | 'admin'
): Promise<boolean> {
  try {
    const isHashedValid = await bcrypt.compare(plainPassword, storedPassword);
    if (isHashedValid) {
      return true;
    }
  } catch (error) {
    console.log(`Password comparison failed for ${userType} ${userId}, checking plaintext fallback`);
  }
  
  if (plainPassword === storedPassword) {
    console.log(`Migrating plaintext password to bcrypt hash for ${userType} ${userId}`);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    
    if (userType === 'company') {
      await storage.updateCompany(userId, { password: hashedPassword });
    } else if (userType === 'operator') {
      await storage.updateOperator(userId, { password: hashedPassword });
    } else if (userType === 'admin') {
      await storage.updateAdmin(userId, { password: hashedPassword });
    }
    
    console.log(`Successfully migrated password for ${userType} ${userId}`);
    return true;
  }
  
  return false;
}

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

      const hashedPassword = await bcrypt.hash(result.data.password, 10);
      const company = await storage.createCompany({
        ...result.data,
        password: hashedPassword
      });
      
      req.session.userId = company.id;
      req.session.userType = 'company';
      await storage.updateCompanyLastLogin(company.id);
      
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
      
      if (!company) {
        return res.status(401).json({ 
          message: "E-mail ou senha inválidos" 
        });
      }

      const isPasswordValid = await verifyPasswordAndMigrate(password, company.password, company.id, 'company');
      if (!isPasswordValid) {
        return res.status(401).json({ 
          message: "E-mail ou senha inválidos" 
        });
      }

      req.session.userId = company.id;
      req.session.userType = 'company';
      await storage.updateCompanyLastLogin(company.id);

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

      const hashedPassword = await bcrypt.hash(result.data.password, 10);
      const operator = await storage.createOperator({
        ...result.data,
        password: hashedPassword
      });
      
      req.session.userId = operator.id;
      req.session.userType = 'operator';
      await storage.updateOperatorLastLogin(operator.id);
      
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
      
      if (!operator) {
        return res.status(401).json({ 
          message: "E-mail ou senha inválidos" 
        });
      }

      const isPasswordValid = await verifyPasswordAndMigrate(password, operator.password, operator.id, 'operator');
      if (!isPasswordValid) {
        return res.status(401).json({ 
          message: "E-mail ou senha inválidos" 
        });
      }

      req.session.userId = operator.id;
      req.session.userType = 'operator';
      await storage.updateOperatorLastLogin(operator.id);

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

  app.get("/api/operator/profile-complete", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'operator') {
        return res.status(401).json({ message: "Não autenticado" });
      }

      const profileCheck = await storage.isOperatorProfileComplete(req.session.userId);
      return res.status(200).json(profileCheck);
    } catch (error) {
      console.error("Error checking profile completion:", error);
      return res.status(500).json({ message: "Erro ao verificar perfil" });
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

  // Company Topics
  app.get("/api/companies/topics", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'company') {
        return res.status(401).json({ message: "Não autenticado" });
      }

      const topics = await storage.getCompanyTopicsByCompany(req.session.userId);
      return res.status(200).json(topics);
    } catch (error) {
      console.error("Error getting company topics:", error);
      return res.status(500).json({ message: "Erro ao buscar tópicos" });
    }
  });

  app.post("/api/companies/topics", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'company') {
        return res.status(401).json({ message: "Não autenticado" });
      }

      const newTopic = await storage.createCompanyTopic({
        companyId: req.session.userId,
        title: req.body.title,
        content: req.body.content,
        icon: req.body.icon || 'Star',
        order: req.body.order || '0',
      });

      return res.status(201).json(newTopic);
    } catch (error) {
      console.error("Error creating company topic:", error);
      return res.status(500).json({ message: "Erro ao criar tópico" });
    }
  });

  app.patch("/api/companies/topics/:id", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'company') {
        return res.status(401).json({ message: "Não autenticado" });
      }

      const updatedTopic = await storage.updateCompanyTopic(req.params.id, req.body);
      return res.status(200).json(updatedTopic);
    } catch (error) {
      console.error("Error updating company topic:", error);
      return res.status(500).json({ message: "Erro ao atualizar tópico" });
    }
  });

  app.delete("/api/companies/topics/:id", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'company') {
        return res.status(401).json({ message: "Não autenticado" });
      }

      await storage.deleteCompanyTopic(req.params.id);
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting company topic:", error);
      return res.status(500).json({ message: "Erro ao deletar tópico" });
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
      if (company) {
        const isPasswordValid = await verifyPasswordAndMigrate(password, company.password, company.id, 'company');
        if (isPasswordValid) {
          req.session.userId = company.id;
          req.session.userType = 'company';
          await storage.updateCompanyLastLogin(company.id);
          const { password: _, ...companyWithoutPassword } = company;
          return res.status(200).json({ 
            user: companyWithoutPassword, 
            userType: 'company' 
          });
        }
      }

      const operator = await storage.getOperatorByEmail(email);
      if (operator) {
        const isPasswordValid = await verifyPasswordAndMigrate(password, operator.password, operator.id, 'operator');
        if (isPasswordValid) {
          req.session.userId = operator.id;
          req.session.userType = 'operator';
          await storage.updateOperatorLastLogin(operator.id);
          const { password: _, ...operatorWithoutPassword } = operator;
          return res.status(200).json({ 
            user: operatorWithoutPassword, 
            userType: 'operator' 
          });
        }
      }

      const admin = await storage.getAdminByEmail(email);
      if (admin) {
        const isPasswordValid = await verifyPasswordAndMigrate(password, admin.password, admin.id, 'admin');
        if (isPasswordValid) {
          req.session.userId = admin.id;
          req.session.userType = 'admin';
          await storage.updateAdminLastLogin(admin.id);
          
          await new Promise<void>((resolve, reject) => {
            req.session.save((err) => {
              if (err) {
                console.error("❌ Error saving admin session:", err);
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
        }
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

  app.get("/api/users/login-history", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(403).json({ 
          message: "Acesso negado. Apenas administradores podem acessar esta página." 
        });
      }

      const companies = await storage.getAllCompanies();
      const operators = await storage.getAllOperators();
      const admins = await storage.getAllAdmins();

      const companiesLoginData = companies.map(({ password, ...company }) => ({
        id: company.id,
        name: company.companyName,
        email: company.email,
        type: 'company' as const,
        lastLoginAt: company.lastLoginAt,
      }));

      const operatorsLoginData = operators.map(({ password, ...operator }) => ({
        id: operator.id,
        name: operator.fullName,
        email: operator.email,
        type: 'operator' as const,
        lastLoginAt: operator.lastLoginAt,
      }));

      const adminsLoginData = admins.map(({ password, ...admin }) => ({
        id: admin.id,
        name: admin.name || admin.email,
        email: admin.email,
        type: 'admin' as const,
        lastLoginAt: admin.lastLoginAt,
      }));

      const allUsers = [...companiesLoginData, ...operatorsLoginData, ...adminsLoginData];
      allUsers.sort((a, b) => {
        if (!a.lastLoginAt) return 1;
        if (!b.lastLoginAt) return -1;
        return new Date(b.lastLoginAt).getTime() - new Date(a.lastLoginAt).getTime();
      });

      return res.status(200).json({
        users: allUsers,
        total: allUsers.length,
      });
    } catch (error) {
      console.error("Error fetching login history:", error);
      return res.status(500).json({ message: "Erro ao buscar histórico de logins" });
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

  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ 
          message: "Email é obrigatório" 
        });
      }

      // Auto-detect user type by checking both tables
      let userName = '';
      let userType = '';

      // Check company first
      const company = await storage.getCompanyByEmail(email);
      if (company) {
        userName = company.companyName;
        userType = 'company';
      } else {
        // Check operator
        const operator = await storage.getOperatorByEmail(email);
        if (operator) {
          userName = operator.fullName;
          userType = 'operator';
        } else {
          return res.status(404).json({ 
            message: "Usuário não encontrado" 
          });
        }
      }

      const code = Math.floor(1000 + Math.random() * 9000).toString();
      
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15);

      await storage.createPasswordResetCode({
        email,
        code,
        userType,
        expiresAt: expiresAt.toISOString(),
        isUsed: 'false',
      });

      const emailSettings = await storage.getEmailSettings();
      if (emailSettings) {
        const emailService = new EmailService(emailSettings);
        await emailService.sendPasswordResetCode(email, code, userName);
      }

      return res.status(200).json({ 
        message: "Código de recuperação enviado para seu e-mail" 
      });
    } catch (error) {
      console.error("Error sending reset code:", error);
      return res.status(500).json({ 
        message: "Erro ao enviar código de recuperação" 
      });
    }
  });

  app.post("/api/auth/verify-reset-code", async (req, res) => {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        return res.status(400).json({ 
          message: "Email e código são obrigatórios" 
        });
      }

      const resetCode = await storage.getPasswordResetCode(email, code);

      if (!resetCode) {
        return res.status(400).json({ 
          message: "Código inválido ou expirado" 
        });
      }

      const now = new Date();
      const expiresAt = new Date(resetCode.expiresAt);

      if (now > expiresAt) {
        return res.status(400).json({ 
          message: "Código expirado. Solicite um novo código." 
        });
      }

      return res.status(200).json({ 
        message: "Código verificado com sucesso",
        userType: resetCode.userType 
      });
    } catch (error) {
      console.error("Error verifying reset code:", error);
      return res.status(500).json({ 
        message: "Erro ao verificar código" 
      });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { email, code, newPassword } = req.body;

      if (!email || !code || !newPassword) {
        return res.status(400).json({ 
          message: "Email, código e nova senha são obrigatórios" 
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ 
          message: "A senha deve ter pelo menos 6 caracteres" 
        });
      }

      const resetCode = await storage.getPasswordResetCode(email, code);

      if (!resetCode) {
        return res.status(400).json({ 
          message: "Código inválido ou expirado" 
        });
      }

      const now = new Date();
      const expiresAt = new Date(resetCode.expiresAt);

      if (now > expiresAt) {
        return res.status(400).json({ 
          message: "Código expirado. Solicite um novo código." 
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      if (resetCode.userType === 'company') {
        const company = await storage.getCompanyByEmail(email);
        if (company) {
          await storage.updateCompany(company.id, { password: hashedPassword });
        }
      } else if (resetCode.userType === 'operator') {
        const operator = await storage.getOperatorByEmail(email);
        if (operator) {
          await storage.updateOperator(operator.id, { password: hashedPassword });
        }
      }

      await storage.markPasswordResetCodeAsUsed(resetCode.id);

      return res.status(200).json({ 
        message: "Senha alterada com sucesso" 
      });
    } catch (error) {
      console.error("Error resetting password:", error);
      return res.status(500).json({ 
        message: "Erro ao resetar senha" 
      });
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
      
      if (!admin) {
        return res.status(401).json({ 
          message: "E-mail ou senha inválidos" 
        });
      }

      const isPasswordValid = await verifyPasswordAndMigrate(password, admin.password, admin.id, 'admin');
      if (!isPasswordValid) {
        return res.status(401).json({ 
          message: "E-mail ou senha inválidos" 
        });
      }

      req.session.userId = admin.id;
      req.session.userType = 'admin';
      await storage.updateAdminLastLogin(admin.id);

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

  app.get("/api/companies", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const companies = await storage.getAllCompanies();
      const companiesWithoutPassword = companies.map(({ password, ...company }) => company);
      return res.status(200).json(companiesWithoutPassword);
    } catch (error) {
      console.error("Error getting companies:", error);
      return res.status(500).json({ message: "Erro ao buscar empresas" });
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

      try {
        const objectStorageService = new ObjectStorageService();
        const uploadURL = await objectStorageService.getObjectEntityUploadURL();
        console.log("✅ Upload URL generated successfully");
        res.json({ uploadURL });
      } catch (objectStorageError) {
        console.log("Object Storage not available, falling back to local upload for client logo");
        return res.json({ 
          uploadURL: "/api/upload/local",
          useLocal: true 
        });
      }
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

      let objectPath = req.body.logoURL;
      
      // Check if it's a local upload (starts with /attached_assets)
      if (objectPath.startsWith('/attached_assets/')) {
        // Local upload - just return the path
        console.log("✅ Logo set (local):", objectPath);
        res.status(200).json({ objectPath });
        return;
      }

      // Object Storage upload - set ACL with retry logic
      const objectStorageService = new ObjectStorageService();
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

  // Local file upload endpoint (fallback when Object Storage fails)
  app.post("/api/upload/local", upload.single('file'), async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Não autenticado" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Nenhum arquivo enviado" });
      }

      const filePath = `/attached_assets/uploads/${req.file.filename}`;
      res.json({ 
        success: true,
        filePath,
        uploadURL: filePath 
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      return res.status(500).json({ message: "Erro ao fazer upload" });
    }
  });

  app.post("/api/objects/upload", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Não autenticado" });
      }

      try {
        const objectStorageService = new ObjectStorageService();
        const uploadURL = await objectStorageService.getObjectEntityUploadURL();
        res.json({ uploadURL });
      } catch (storageError) {
        console.error("Object Storage not available, using local upload:", storageError);
        // Fallback: return local upload endpoint
        res.json({ 
          uploadURL: "/api/upload/local",
          useLocal: true 
        });
      }
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

      let objectPath = req.body.profilePhotoURL;
      
      // Check if it's a local upload (starts with /attached_assets)
      if (objectPath.startsWith('/attached_assets/')) {
        // Local upload - just save the path
        await storage.updateOperator(req.session.userId, { profilePhotoUrl: objectPath });
        res.status(200).json({ objectPath });
        return;
      }

      // Object Storage upload - set ACL
      const objectStorageService = new ObjectStorageService();
      objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
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

      let objectPath = req.body.logoURL;
      
      // Check if it's a local upload (starts with /attached_assets)
      if (objectPath.startsWith('/attached_assets/')) {
        // Local upload - just save the path
        await storage.updateCompany(req.session.userId, { logoUrl: objectPath });
        res.status(200).json({ objectPath });
        return;
      }

      // Object Storage upload - set ACL
      const objectStorageService = new ObjectStorageService();
      objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
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

      let objectPath = req.body.bannerURL;
      
      // Check if it's a local upload (starts with /attached_assets)
      if (objectPath.startsWith('/attached_assets/')) {
        // Local upload - just save the path
        await storage.updateCompany(req.session.userId, { bannerUrl: objectPath });
        res.status(200).json({ objectPath });
        return;
      }

      // Object Storage upload - set ACL
      const objectStorageService = new ObjectStorageService();
      objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
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
      if (!req.session.userId || (req.session.userType !== 'admin' && req.session.userType !== 'company')) {
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
      if (!req.session.userId || (req.session.userType !== 'admin' && req.session.userType !== 'company')) {
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
      if (!req.session.userId || (req.session.userType !== 'admin' && req.session.userType !== 'company')) {
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

      try {
        const objectStorageService = new ObjectStorageService();
        const uploadURL = await objectStorageService.getObjectEntityUploadURL();
        res.json({ uploadURL });
      } catch (objectStorageError) {
        console.log("Object Storage not available, falling back to local upload for event cover");
        return res.json({ 
          uploadURL: "/api/upload/local",
          useLocal: true 
        });
      }
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

      let objectPath = req.body.coverURL;
      
      // Check if it's a local upload (starts with /attached_assets)
      if (objectPath.startsWith('/attached_assets/')) {
        // Local upload - just return the path
        return res.json({ objectPath });
      }

      // Object Storage upload - set ACL with retry logic
      const objectStorageService = new ObjectStorageService();
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
      const position = req.query.position as string | undefined;
      const banners = position 
        ? await storage.getActiveBannersByPosition(position)
        : await storage.getActiveBanners();
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

      try {
        const objectStorageService = new ObjectStorageService();
        const uploadURL = await objectStorageService.getObjectEntityUploadURL();
        res.json({ uploadURL });
      } catch (objectStorageError) {
        console.log("Object Storage not available, falling back to local upload for banner image");
        return res.json({ 
          uploadURL: "/api/upload/local",
          useLocal: true 
        });
      }
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

      let objectPath = req.body.imageURL;
      
      // Check if it's a local upload (starts with /attached_assets)
      if (objectPath.startsWith('/attached_assets/')) {
        // Local upload - just return the path
        return res.json({ objectPath });
      }

      // Object Storage upload - set ACL with retry logic
      const objectStorageService = new ObjectStorageService();
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

  app.get("/api/featured-companies", async (req, res) => {
    try {
      const { featuredCompanyIds } = req.query;
      
      if (!featuredCompanyIds) {
        return res.json([]);
      }

      const ids = JSON.parse(featuredCompanyIds as string);
      
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.json([]);
      }

      const companies = await storage.getCompaniesByIds(ids);
      return res.json(companies);
    } catch (error) {
      console.error("Error fetching featured companies:", error);
      return res.status(500).json({ message: "Erro ao buscar empresas em destaque" });
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

  // Public endpoint - get company details by ID
  app.get("/api/public/companies/:id", async (req, res) => {
    try {
      const company = await storage.getCompany(req.params.id);
      
      if (!company) {
        return res.status(404).json({ message: "Empresa não encontrada" });
      }

      // Remove sensitive data (password)
      const { password: _, ...companyPublicData } = company;

      // Get company topics
      const topics = await storage.getCompanyTopicsByCompany(req.params.id);

      return res.status(200).json({
        ...companyPublicData,
        topics
      });
    } catch (error) {
      console.error("Error getting public company:", error);
      return res.status(500).json({ message: "Erro ao buscar empresa" });
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

  app.post("/api/jobs/:id/increment-view", async (req, res) => {
    try {
      const jobId = req.params.id;
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Vaga não encontrada" });
      }

      await storage.incrementJobViewCount(jobId);
      
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error incrementing job view count:", error);
      return res.status(500).json({ message: "Erro ao incrementar visualização" });
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

      // Verificar se a empresa tem créditos suficientes
      const companyCredits = await storage.getCompanyCredits(req.session.userId);
      if (companyCredits < 1) {
        return res.status(400).json({ 
          message: "Créditos insuficientes. Adquira mais créditos para publicar vagas.",
          insufficientCredits: true
        });
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

      // Debitar 1 crédito da empresa
      await storage.deductCreditsFromCompany(
        req.session.userId,
        1,
        `Publicação da vaga: ${job.title}`,
        job.id
      );

      return res.status(201).json(job);
    } catch (error: any) {
      console.error("Error creating job:", error);
      if (error.message && error.message.includes('Créditos insuficientes')) {
        return res.status(400).json({ 
          message: error.message,
          insufficientCredits: true
        });
      }
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

  // PATCH endpoint para edição completa (compatibilidade com frontend)
  app.patch("/api/jobs/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const existingJob = await storage.getJob(req.params.id);
      
      if (!existingJob) {
        return res.status(404).json({ message: "Vaga não encontrada" });
      }

      // Admin pode editar qualquer vaga
      if (req.session.userType === 'admin') {
        const job = await storage.updateJob(req.params.id, req.body);
        return res.status(200).json(job);
      }

      // Company pode editar apenas suas próprias vagas
      if (req.session.userType === 'company' && existingJob.companyId !== req.session.userId) {
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

      // Check if operator profile is complete
      const profileCheck = await storage.isOperatorProfileComplete(req.session.userId);
      if (!profileCheck.complete) {
        return res.status(400).json({ 
          message: "Seu perfil está incompleto. Complete seu perfil para se candidatar a vagas.",
          profileIncomplete: true,
          missingFields: profileCheck.missingFields
        });
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

  app.patch("/api/applications/:id/status", async (req, res) => {
    try {
      if (!req.session.userId || (req.session.userType !== 'company' && req.session.userType !== 'admin')) {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const { status } = req.body;
      const applicationId = req.params.id;

      if (!status || !['pending', 'accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Status inválido. Use 'pending', 'accepted' ou 'rejected'" });
      }

      // Get the application
      const application = await storage.getApplication(applicationId);
      if (!application) {
        return res.status(404).json({ message: "Candidatura não encontrada" });
      }

      // Verify the job belongs to the company (unless admin)
      if (req.session.userType === 'company') {
        const job = await storage.getJob(application.jobId);
        if (!job) {
          return res.status(404).json({ message: "Vaga não encontrada" });
        }
        if (job.companyId !== req.session.userId && job.clientId !== req.session.userId) {
          return res.status(403).json({ message: "Você não tem permissão para alterar esta candidatura" });
        }
      }

      // Update the status
      const updatedApplication = await storage.updateApplicationStatus(applicationId, status);
      return res.status(200).json(updatedApplication);
    } catch (error) {
      console.error("Error updating application status:", error);
      return res.status(500).json({ message: "Erro ao atualizar status da candidatura" });
    }
  });

  // Saved Jobs Routes
  app.post("/api/jobs/:id/save", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'operator') {
        return res.status(401).json({ message: "Apenas operadores podem salvar vagas" });
      }

      const jobId = req.params.id;
      const operatorId = req.session.userId;

      // Check if job exists
      const job = await storage.getJob(jobId);
      if (!job) {
        return res.status(404).json({ message: "Vaga não encontrada" });
      }

      // Check if already saved
      const alreadySaved = await storage.checkIfJobIsSaved(operatorId, jobId);
      if (alreadySaved) {
        return res.status(400).json({ message: "Vaga já está salva" });
      }

      const savedJob = await storage.saveJob(operatorId, jobId);
      return res.status(201).json(savedJob);
    } catch (error) {
      console.error("Error saving job:", error);
      return res.status(500).json({ message: "Erro ao salvar vaga" });
    }
  });

  app.delete("/api/jobs/:id/save", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'operator') {
        return res.status(401).json({ message: "Apenas operadores podem remover vagas salvas" });
      }

      const jobId = req.params.id;
      const operatorId = req.session.userId;

      await storage.unsaveJob(operatorId, jobId);
      return res.status(200).json({ message: "Vaga removida dos favoritos" });
    } catch (error) {
      console.error("Error unsaving job:", error);
      return res.status(500).json({ message: "Erro ao remover vaga dos favoritos" });
    }
  });

  app.get("/api/jobs/:id/is-saved", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'operator') {
        return res.status(200).json({ isSaved: false });
      }

      const jobId = req.params.id;
      const operatorId = req.session.userId;

      const isSaved = await storage.checkIfJobIsSaved(operatorId, jobId);
      return res.status(200).json({ isSaved });
    } catch (error) {
      console.error("Error checking if job is saved:", error);
      return res.status(500).json({ message: "Erro ao verificar vaga salva" });
    }
  });

  app.get("/api/operator/saved-jobs", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'operator') {
        return res.status(401).json({ message: "Apenas operadores podem ver vagas salvas" });
      }

      const operatorId = req.session.userId;
      const savedJobs = await storage.getSavedJobsByOperator(operatorId);
      return res.status(200).json(savedJobs);
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
      return res.status(500).json({ message: "Erro ao buscar vagas salvas" });
    }
  });

  app.get("/api/operator/applications", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'operator') {
        return res.status(401).json({ message: "Apenas operadores podem ver suas candidaturas" });
      }

      const operatorId = req.session.userId;
      const applications = await storage.getApplicationsWithJobByOperator(operatorId);
      return res.status(200).json(applications);
    } catch (error) {
      console.error("Error fetching operator applications:", error);
      return res.status(500).json({ message: "Erro ao buscar candidaturas" });
    }
  });

  app.post("/api/companies/purchase-plan", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'company') {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const { planId } = req.body;

      if (!planId) {
        return res.status(400).json({ message: "ID do plano é obrigatório" });
      }

      const company = await storage.getCompany(req.session.userId);
      if (!company) {
        return res.status(404).json({ message: "Empresa não encontrada" });
      }

      const plan = await storage.getPlan(planId);
      if (!plan) {
        return res.status(404).json({ message: "Plano não encontrado" });
      }

      if (plan.isActive !== 'true') {
        return res.status(400).json({ message: "Este plano não está mais disponível" });
      }

      let client = await storage.getClientByCnpj(company.cnpj);
      
      if (!client) {
        client = await storage.createClient({
          companyName: company.companyName,
          cnpj: company.cnpj,
          email: company.email,
          phone: company.phone,
          website: company.website || '',
          contactName: company.companyName,
          contactEmail: company.email,
          contactPhone: company.phone,
          primaryColor: '#8b5cf6',
          secondaryColor: '#a78bfa',
          accentColor: '#c4b5fd',
          isActive: 'true',
        });
      }

      const purchaseDate = new Date().toISOString();
      const expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

      const purchase = await storage.createPurchase({
        clientId: client.id,
        planId: plan.id,
        purchaseDate,
        expiryDate,
        amount: plan.price,
        status: 'active',
      });

      const creditsToAdd = parseInt(plan.vacancyQuantity);
      
      await storage.addCreditsToCompany(
        company.id,
        creditsToAdd,
        `Créditos do plano ${plan.name}`,
        plan.id
      );

      return res.status(201).json({ 
        message: "Plano adquirido com sucesso",
        purchase,
        creditsAdded: creditsToAdd
      });
    } catch (error) {
      console.error("Error purchasing plan:", error);
      return res.status(500).json({ message: "Erro ao adquirir plano" });
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

  // Admin endpoint - get all jobs
  app.get("/api/admin/jobs", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const jobs = await storage.getAllJobsWithCompany();
      return res.status(200).json(jobs);
    } catch (error) {
      console.error("Error fetching all jobs:", error);
      return res.status(500).json({ message: "Erro ao buscar vagas" });
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

  // Admin endpoint - get live statistics dashboard
  app.get("/api/admin/live-stats", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(401).json({ message: "Não autorizado" });
      }

      // Get all statistics in parallel
      const [
        allCompanies,
        allOperators,
        allAdmins,
        allJobs,
        visitStats
      ] = await Promise.all([
        storage.getAllCompanies(),
        storage.getAllOperators(),
        storage.getAllAdmins(),
        storage.getAllJobs(),
        storage.getVisitStats()
      ]);

      // Calculate statistics
      const activeJobs = allJobs.filter((job: any) => job.status === 'active').length;
      const suspendedJobs = allJobs.filter((job: any) => job.status === 'suspended').length;
      
      // Create login data from all users
      const companiesLoginData = allCompanies.map((company: any) => ({
        id: company.id,
        name: company.companyName,
        email: company.email,
        userType: 'company',
        lastLoginAt: company.lastLoginAt
      }));

      const operatorsLoginData = allOperators.map((operator: any) => ({
        id: operator.id,
        name: operator.fullName,
        email: operator.email,
        userType: 'operator',
        lastLoginAt: operator.lastLoginAt
      }));

      const adminsLoginData = allAdmins.map((admin: any) => ({
        id: admin.id,
        name: admin.name || admin.email,
        email: admin.email,
        userType: 'admin',
        lastLoginAt: admin.lastLoginAt
      }));

      // Combine and sort by last login
      const allUsers = [...companiesLoginData, ...operatorsLoginData, ...adminsLoginData];
      const recentLogins = allUsers
        .filter((user: any) => user.lastLoginAt)
        .sort((a: any, b: any) => new Date(b.lastLoginAt).getTime() - new Date(a.lastLoginAt).getTime())
        .slice(0, 10)
        .map((user: any, index: number) => ({
          id: index + 1,
          userId: user.id,
          userType: user.userType,
          loginDate: user.lastLoginAt,
          ipAddress: undefined,
          userAgent: undefined
        }));

      // Get company statistics
      const companiesWithLastLogin = allCompanies.map((company: any) => ({
        id: company.id,
        companyName: company.companyName,
        email: company.email,
        lastLogin: company.lastLoginAt
      })).sort((a: any, b: any) => {
        if (!a.lastLogin) return 1;
        if (!b.lastLogin) return -1;
        return new Date(b.lastLogin).getTime() - new Date(a.lastLogin).getTime();
      });

      // Calculate jobs ranking by company
      const jobsByCompany = new Map<string, { companyId: string, companyName: string, totalJobs: number, activeJobs: number }>();
      
      allJobs.forEach((job: any) => {
        if (job.companyId) {
          const existing = jobsByCompany.get(job.companyId);
          const company = allCompanies.find((c: any) => c.id === job.companyId);
          const companyName = company?.companyName || 'Empresa não encontrada';
          
          if (existing) {
            existing.totalJobs++;
            if (job.status === 'active') {
              existing.activeJobs++;
            }
          } else {
            jobsByCompany.set(job.companyId, {
              companyId: job.companyId,
              companyName,
              totalJobs: 1,
              activeJobs: job.status === 'active' ? 1 : 0
            });
          }
        }
      });

      // Convert to array and sort by total jobs (descending)
      const companiesJobsRanking = Array.from(jobsByCompany.values())
        .sort((a, b) => b.totalJobs - a.totalJobs)
        .slice(0, 10); // Top 10 companies

      return res.status(200).json({
        totalCompanies: allCompanies.length,
        totalOperators: allOperators.length,
        totalJobs: allJobs.length,
        activeJobs,
        suspendedJobs,
        totalVisits: visitStats?.totalVisits || 0,
        todayVisits: visitStats?.todayVisits || 0,
        recentLogins,
        companiesWithLastLogin: companiesWithLastLogin.slice(0, 20),
        companiesJobsRanking
      });
    } catch (error) {
      console.error("Error getting live stats:", error);
      return res.status(500).json({ message: "Erro ao buscar estatísticas ao vivo" });
    }
  });

  // Get detailed company summary for admin
  app.get("/api/admin/company-summary/:companyId", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const companyId = req.params.companyId;

      // Get company info
      const company = await storage.getCompany(companyId);
      if (!company) {
        return res.status(404).json({ message: "Empresa não encontrada" });
      }

      // Get company jobs
      const allJobs = await storage.getAllJobs();
      const companyJobs = allJobs.filter((job: any) => job.companyId === companyId);
      const activeJobs = companyJobs.filter((job: any) => job.status === 'active').length;
      const suspendedJobs = companyJobs.filter((job: any) => job.status === 'suspended').length;

      // Get company purchases
      const allPurchases = await storage.getAllPurchases();
      const companyPurchases = allPurchases.filter((purchase: any) => purchase.companyId === companyId);

      // Get company credits
      const companyCredits = await storage.getCompanyCredits(companyId);

      return res.status(200).json({
        company: {
          id: company.id,
          companyName: company.companyName,
          email: company.email,
          cnpj: company.cnpj,
          industry: company.industry,
          companySize: company.size,
          lastLoginAt: company.lastLoginAt,
          createdAt: new Date().toISOString() // Company table doesn't have a createdAt field
        },
        stats: {
          totalJobs: companyJobs.length,
          activeJobs,
          suspendedJobs,
          totalPurchases: companyPurchases.length,
          availableCredits: companyCredits
        },
        purchases: companyPurchases.map((purchase: any) => ({
          id: purchase.id,
          planName: purchase.planName,
          credits: purchase.credits,
          usedCredits: purchase.usedCredits,
          price: purchase.price,
          status: purchase.status,
          purchaseDate: purchase.purchaseDate
        })),
        recentJobs: companyJobs
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
          .map((job: any) => ({
            id: job.id,
            title: job.title,
            status: job.status,
            createdAt: job.createdAt,
            viewCount: job.viewCount || 0
          }))
      });
    } catch (error) {
      console.error("Error getting company summary:", error);
      return res.status(500).json({ message: "Erro ao buscar resumo da empresa" });
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

  // Work Types endpoints
  app.get("/api/company/work-types", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'company') {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const workTypes = await storage.getWorkTypesByCompany(req.session.userId);
      return res.status(200).json(workTypes);
    } catch (error) {
      console.error("Error fetching work types:", error);
      return res.status(500).json({ message: "Erro ao buscar tipos de trabalho" });
    }
  });

  app.post("/api/company/work-types", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'company') {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const workType = await storage.createWorkType({
        ...req.body,
        companyId: req.session.userId,
      });
      return res.status(201).json(workType);
    } catch (error) {
      console.error("Error creating work type:", error);
      return res.status(500).json({ message: "Erro ao criar tipo de trabalho" });
    }
  });

  app.patch("/api/company/work-types/:id", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'company') {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const existingWorkType = await storage.getWorkType(req.params.id);
      if (!existingWorkType) {
        return res.status(404).json({ message: "Tipo de trabalho não encontrado" });
      }

      if (existingWorkType.companyId !== req.session.userId) {
        return res.status(403).json({ message: "Você não tem permissão para editar este tipo de trabalho" });
      }

      const workType = await storage.updateWorkType(req.params.id, req.body);
      return res.status(200).json(workType);
    } catch (error) {
      console.error("Error updating work type:", error);
      return res.status(500).json({ message: "Erro ao atualizar tipo de trabalho" });
    }
  });

  app.delete("/api/company/work-types/:id", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'company') {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const existingWorkType = await storage.getWorkType(req.params.id);
      if (!existingWorkType) {
        return res.status(404).json({ message: "Tipo de trabalho não encontrado" });
      }

      if (existingWorkType.companyId !== req.session.userId) {
        return res.status(403).json({ message: "Você não tem permissão para deletar este tipo de trabalho" });
      }

      await storage.deleteWorkType(req.params.id);
      return res.status(200).json({ message: "Tipo de trabalho deletado com sucesso" });
    } catch (error) {
      console.error("Error deleting work type:", error);
      return res.status(500).json({ message: "Erro ao deletar tipo de trabalho" });
    }
  });

  // Contract Types endpoints
  app.get("/api/company/contract-types", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'company') {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const contractTypes = await storage.getContractTypesByCompany(req.session.userId);
      return res.status(200).json(contractTypes);
    } catch (error) {
      console.error("Error fetching contract types:", error);
      return res.status(500).json({ message: "Erro ao buscar tipos de contrato" });
    }
  });

  app.post("/api/company/contract-types", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'company') {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const contractType = await storage.createContractType({
        ...req.body,
        companyId: req.session.userId,
      });
      return res.status(201).json(contractType);
    } catch (error) {
      console.error("Error creating contract type:", error);
      return res.status(500).json({ message: "Erro ao criar tipo de contrato" });
    }
  });

  app.patch("/api/company/contract-types/:id", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'company') {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const existingContractType = await storage.getContractType(req.params.id);
      if (!existingContractType) {
        return res.status(404).json({ message: "Tipo de contrato não encontrado" });
      }

      if (existingContractType.companyId !== req.session.userId) {
        return res.status(403).json({ message: "Você não tem permissão para editar este tipo de contrato" });
      }

      const contractType = await storage.updateContractType(req.params.id, req.body);
      return res.status(200).json(contractType);
    } catch (error) {
      console.error("Error updating contract type:", error);
      return res.status(500).json({ message: "Erro ao atualizar tipo de contrato" });
    }
  });

  app.delete("/api/company/contract-types/:id", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'company') {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const existingContractType = await storage.getContractType(req.params.id);
      if (!existingContractType) {
        return res.status(404).json({ message: "Tipo de contrato não encontrado" });
      }

      if (existingContractType.companyId !== req.session.userId) {
        return res.status(403).json({ message: "Você não tem permissão para deletar este tipo de contrato" });
      }

      await storage.deleteContractType(req.params.id);
      return res.status(200).json({ message: "Tipo de contrato deletado com sucesso" });
    } catch (error) {
      console.error("Error deleting contract type:", error);
      return res.status(500).json({ message: "Erro ao deletar tipo de contrato" });
    }
  });

  // Tags endpoints (GET is public for authenticated users, others admin only)
  app.get("/api/admin/tags", async (req, res) => {
    try {
      // Allow any authenticated user to read tags
      const tags = await storage.getAllTags();
      return res.status(200).json(tags);
    } catch (error) {
      console.error("Error fetching tags:", error);
      return res.status(500).json({ message: "Erro ao buscar tags" });
    }
  });

  app.post("/api/admin/tags", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const tag = await storage.createTag(req.body);
      return res.status(201).json(tag);
    } catch (error) {
      console.error("Error creating tag:", error);
      return res.status(500).json({ message: "Erro ao criar tag" });
    }
  });

  app.patch("/api/admin/tags/:id", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const existingTag = await storage.getTag(req.params.id);
      if (!existingTag) {
        return res.status(404).json({ message: "Tag não encontrada" });
      }

      const tag = await storage.updateTag(req.params.id, req.body);
      return res.status(200).json(tag);
    } catch (error) {
      console.error("Error updating tag:", error);
      return res.status(500).json({ message: "Erro ao atualizar tag" });
    }
  });

  app.delete("/api/admin/tags/:id", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const existingTag = await storage.getTag(req.params.id);
      if (!existingTag) {
        return res.status(404).json({ message: "Tag não encontrada" });
      }

      await storage.deleteTag(req.params.id);
      return res.status(200).json({ message: "Tag deletada com sucesso" });
    } catch (error) {
      console.error("Error deleting tag:", error);
      return res.status(500).json({ message: "Erro ao deletar tag" });
    }
  });

  // Global Work Types endpoints (GET is public for authenticated users, others admin only)
  app.get("/api/admin/global-work-types", async (req, res) => {
    try {
      // Allow any authenticated user to read work types
      const workTypes = await storage.getAllGlobalWorkTypes();
      return res.status(200).json(workTypes);
    } catch (error) {
      console.error("Error fetching global work types:", error);
      return res.status(500).json({ message: "Erro ao buscar tipos de trabalho" });
    }
  });

  app.post("/api/admin/global-work-types", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const workType = await storage.createGlobalWorkType(req.body);
      return res.status(201).json(workType);
    } catch (error) {
      console.error("Error creating global work type:", error);
      return res.status(500).json({ message: "Erro ao criar tipo de trabalho" });
    }
  });

  app.patch("/api/admin/global-work-types/:id", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const existingWorkType = await storage.getGlobalWorkType(req.params.id);
      if (!existingWorkType) {
        return res.status(404).json({ message: "Tipo de trabalho não encontrado" });
      }

      const workType = await storage.updateGlobalWorkType(req.params.id, req.body);
      return res.status(200).json(workType);
    } catch (error) {
      console.error("Error updating global work type:", error);
      return res.status(500).json({ message: "Erro ao atualizar tipo de trabalho" });
    }
  });

  app.delete("/api/admin/global-work-types/:id", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const existingWorkType = await storage.getGlobalWorkType(req.params.id);
      if (!existingWorkType) {
        return res.status(404).json({ message: "Tipo de trabalho não encontrado" });
      }

      await storage.deleteGlobalWorkType(req.params.id);
      return res.status(200).json({ message: "Tipo de trabalho deletado com sucesso" });
    } catch (error) {
      console.error("Error deleting global work type:", error);
      return res.status(500).json({ message: "Erro ao deletar tipo de trabalho" });
    }
  });

  // Global Contract Types endpoints (GET is public for authenticated users, others admin only)
  app.get("/api/admin/global-contract-types", async (req, res) => {
    try {
      // Allow any authenticated user to read contract types
      const contractTypes = await storage.getAllGlobalContractTypes();
      return res.status(200).json(contractTypes);
    } catch (error) {
      console.error("Error fetching global contract types:", error);
      return res.status(500).json({ message: "Erro ao buscar tipos de contrato" });
    }
  });

  app.post("/api/admin/global-contract-types", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const contractType = await storage.createGlobalContractType(req.body);
      return res.status(201).json(contractType);
    } catch (error) {
      console.error("Error creating global contract type:", error);
      return res.status(500).json({ message: "Erro ao criar tipo de contrato" });
    }
  });

  app.patch("/api/admin/global-contract-types/:id", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const existingContractType = await storage.getGlobalContractType(req.params.id);
      if (!existingContractType) {
        return res.status(404).json({ message: "Tipo de contrato não encontrado" });
      }

      const contractType = await storage.updateGlobalContractType(req.params.id, req.body);
      return res.status(200).json(contractType);
    } catch (error) {
      console.error("Error updating global contract type:", error);
      return res.status(500).json({ message: "Erro ao atualizar tipo de contrato" });
    }
  });

  app.delete("/api/admin/global-contract-types/:id", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const existingContractType = await storage.getGlobalContractType(req.params.id);
      if (!existingContractType) {
        return res.status(404).json({ message: "Tipo de contrato não encontrado" });
      }

      await storage.deleteGlobalContractType(req.params.id);
      return res.status(200).json({ message: "Tipo de contrato deletado com sucesso" });
    } catch (error) {
      console.error("Error deleting global contract type:", error);
      return res.status(500).json({ message: "Erro ao deletar tipo de contrato" });
    }
  });

  // Credits endpoints
  app.get("/api/company/credits", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'company') {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const balance = await storage.getCompanyCredits(req.session.userId);
      return res.status(200).json(balance);
    } catch (error) {
      console.error("Error fetching company credits:", error);
      return res.status(500).json({ message: "Erro ao buscar créditos" });
    }
  });

  app.get("/api/company/credit-transactions", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'company') {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const transactions = await storage.getCreditTransactionsByCompany(req.session.userId);
      return res.status(200).json(transactions);
    } catch (error) {
      console.error("Error fetching credit transactions:", error);
      return res.status(500).json({ message: "Erro ao buscar transações" });
    }
  });

  app.get("/api/company/plans", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'company') {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const companyPlans = await storage.getCompanyPlansByCompany(req.session.userId);
      return res.status(200).json(companyPlans);
    } catch (error) {
      console.error("Error fetching company plans:", error);
      return res.status(500).json({ message: "Erro ao buscar planos" });
    }
  });

  app.post("/api/company/credits/add", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'company') {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const { amount, description, relatedPlanId } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Valor inválido" });
      }

      if (!description) {
        return res.status(400).json({ message: "Descrição é obrigatória" });
      }

      const transaction = await storage.addCreditsToCompany(
        req.session.userId,
        Number(amount),
        description,
        relatedPlanId
      );

      return res.status(201).json(transaction);
    } catch (error) {
      console.error("Error adding credits:", error);
      return res.status(500).json({ message: "Erro ao adicionar créditos" });
    }
  });

  // AI Candidate Analysis endpoint
  app.post("/api/company/analyze-candidate", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'company') {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const { jobId, applicationId } = req.body;

      if (!jobId || !applicationId) {
        return res.status(400).json({ message: "jobId e applicationId são obrigatórios" });
      }

      // Buscar configurações de IA
      const aiEnabledSetting = await storage.getSetting('ai_enabled');
      if (aiEnabledSetting?.value !== 'true') {
        return res.status(400).json({ message: "IA não está habilitada no sistema" });
      }

      const apiKeySetting = await storage.getSetting('ai_api_key');
      if (!apiKeySetting?.value) {
        return res.status(400).json({ message: "API Key da IA não configurada" });
      }
      const apiKey = apiKeySetting.value;

      const modelSetting = await storage.getSetting('ai_model');
      const model = modelSetting?.value || 'grok-3';
      
      const temperatureSetting = await storage.getSetting('ai_temperature');
      const temperature = parseFloat(temperatureSetting?.value || '0.7');
      
      const maxTokensSetting = await storage.getSetting('ai_max_tokens');
      const maxTokens = parseInt(maxTokensSetting?.value || '2000');
      
      const systemPromptSetting = await storage.getSetting('ai_system_prompt');
      const systemPrompt = systemPromptSetting?.value || 'Você é um assistente útil da plataforma Operlist.';

      // Buscar dados da vaga
      const job = await storage.getJob(jobId);
      if (!job) {
        return res.status(404).json({ message: "Vaga não encontrada" });
      }

      // Verificar se a vaga pertence à empresa
      if (job.companyId !== req.session.userId) {
        return res.status(403).json({ message: "Você não tem permissão para analisar candidatos desta vaga" });
      }

      // Buscar dados da aplicação
      const application = await storage.getApplication(applicationId);
      if (!application) {
        return res.status(404).json({ message: "Candidatura não encontrada" });
      }

      if (application.jobId !== jobId) {
        return res.status(400).json({ message: "Candidatura não pertence a esta vaga" });
      }

      // Buscar dados do operador/candidato
      const operator = await storage.getOperator(application.operatorId);
      if (!operator) {
        return res.status(404).json({ message: "Candidato não encontrado" });
      }

      // Buscar respostas do questionário
      const answers = await storage.getApplicationAnswersByApplication(applicationId);

      // Montar prompt estruturado para análise
      const userPrompt = `Analise a compatibilidade entre o candidato e a vaga abaixo. Forneça uma resposta estruturada em JSON com os seguintes campos:
{
  "jobSummary": "Resumo breve da vaga (máximo 150 caracteres)",
  "candidateSummary": "Resumo breve do candidato (máximo 150 caracteres)",
  "strengths": ["Ponto forte 1", "Ponto forte 2", "Ponto forte 3"],
  "weaknesses": ["Ponto fraco 1", "Ponto fraco 2"],
  "matchPercentage": 85,
  "recommendation": "Recomendação final (Recomendado, Recomendado com ressalvas, ou Não recomendado)"
}

DADOS DA VAGA:
- Título: ${job.title}
- Descrição: ${job.description}
- Localização: ${job.location}
- Tipo de Trabalho: ${job.workType || 'Não especificado'}
- Tipo de Contrato: ${job.contractType || 'Não especificado'}
- Salário: ${job.salary || 'Não informado'}
- Requisitos: ${job.requirements || 'Não especificado'}
- Benefícios: ${job.benefits || 'Não especificado'}

DADOS DO CANDIDATO:
- Nome: ${operator.fullName}
- Profissão: ${operator.profession || 'Não especificado'}
- Localização Preferida: ${operator.preferredLocation || 'Não especificado'}
- Anos de Experiência: ${operator.experienceYears || 'Não informado'}
- Tipo de Trabalho Preferido: ${operator.workType || 'Não especificado'}
- Disponibilidade: ${operator.availability || 'Não especificado'}
- Habilidades: ${operator.skills || 'Não especificado'}
- Certificações: ${operator.certifications || 'Não especificado'}
- Bio: ${operator.bio || 'Não especificado'}

${answers.length > 0 ? `RESPOSTAS DO QUESTIONÁRIO:
${answers.map((a, i) => `${i + 1}. ${a.question.questionText}\nResposta: ${a.answerText}`).join('\n\n')}` : ''}

Analise cuidadosamente a compatibilidade entre os requisitos da vaga e as qualificações do candidato. Seja objetivo e baseie-se em fatos concretos.`;

      // Chamar API do xAI Grok
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: temperature,
          max_tokens: maxTokens,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("xAI API error:", errorData);
        return res.status(500).json({ message: "Erro ao processar análise com IA" });
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      console.log("🤖 xAI Raw Response:", JSON.stringify(data, null, 2));
      console.log("🤖 Content extracted:", content);

      if (!content) {
        console.error("❌ Empty response from AI");
        return res.status(500).json({ message: "Resposta vazia da IA" });
      }

      // Parse do JSON retornado
      let analysis;
      try {
        analysis = JSON.parse(content);
        console.log("✅ Parsed AI Analysis:", JSON.stringify(analysis, null, 2));
        
        // Verificar e corrigir estrutura se necessário
        if (!analysis.strengths || !Array.isArray(analysis.strengths)) {
          console.warn("⚠️ Missing or invalid strengths array, creating default");
          analysis.strengths = [];
        }
        if (!analysis.weaknesses || !Array.isArray(analysis.weaknesses)) {
          console.warn("⚠️ Missing or invalid weaknesses array, creating default");
          analysis.weaknesses = [];
        }
        if (typeof analysis.matchPercentage !== 'number') {
          console.warn("⚠️ Missing or invalid matchPercentage, setting to 0");
          analysis.matchPercentage = 0;
        }
        
      } catch (error) {
        console.error("❌ Error parsing AI response:", error);
        console.error("Raw content that failed to parse:", content);
        return res.status(500).json({ message: "Erro ao processar resposta da IA" });
      }

      console.log("📤 Sending analysis to frontend:", JSON.stringify(analysis, null, 2));
      return res.status(200).json(analysis);
    } catch (error) {
      console.error("Error analyzing candidate with AI:", error);
      return res.status(500).json({ message: "Erro ao analisar candidato" });
    }
  });

  // Job Questions endpoints
  app.get("/api/jobs/:jobId/questions", async (req, res) => {
    try {
      const jobQuestions = await storage.getJobQuestionsByJob(req.params.jobId);
      // Include isRequired field from jobQuestions along with question data
      const questionsWithRequired = jobQuestions.map(jq => ({
        ...jq.question,
        isRequired: jq.isRequired
      }));
      return res.status(200).json(questionsWithRequired);
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
      
      console.log("Received questionIds:", questionIds, "Type:", typeof questionIds, "Is Array:", Array.isArray(questionIds));

      if (!Array.isArray(questionIds)) {
        console.error("questionIds is not an array:", questionIds);
        return res.status(400).json({ message: "questionIds deve ser um array" });
      }

      // Se não houver perguntas, retorna array vazio sem erro
      if (questionIds.length === 0) {
        console.log("No questions to add, returning empty array");
        return res.status(201).json([]);
      }
      
      console.log("Processing", questionIds.length, "questions");

      const createdJobQuestions = [];
      for (let i = 0; i < questionIds.length; i++) {
        const questionId = questionIds[i];
        const result = insertJobQuestionSchema.safeParse({
          jobId: req.params.jobId,
          questionId,
          displayOrder: String(i + 1), // Converter para string
        });
        
        if (!result.success) {
          console.error("Validation error for question:", result.error);
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

  // Newsletter subscription endpoint (public)
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const result = insertNewsletterSubscriptionSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: fromZodError(result.error).message 
        });
      }

      const subscription = await storage.subscribeToNewsletter(result.data.email);
      return res.status(201).json({ 
        message: "Inscrição realizada com sucesso!",
        subscription 
      });
    } catch (error) {
      console.error("Error subscribing to newsletter:", error);
      return res.status(500).json({ message: "Erro ao realizar inscrição" });
    }
  });

  // Get all newsletter subscriptions (admin only)
  app.get("/api/admin/newsletter-subscriptions", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const subscriptions = await storage.getAllNewsletterSubscriptions();
      return res.status(200).json(subscriptions);
    } catch (error) {
      console.error("Error fetching newsletter subscriptions:", error);
      return res.status(500).json({ message: "Erro ao buscar inscrições" });
    }
  });

  // Get AI settings (admin only)
  app.get("/api/admin/ai-settings", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const settings = await storage.getAllSettings();
      const aiSettings: Record<string, string> = {};
      
      // Filter AI-related settings
      const aiKeys = ['ai_enabled', 'ai_model', 'ai_temperature', 'ai_max_tokens', 'ai_system_prompt', 'ai_api_key'];
      settings.forEach(s => {
        if (aiKeys.includes(s.key)) {
          aiSettings[s.key] = s.value;
        }
      });

      // Set defaults if not configured
      if (!aiSettings.ai_enabled) aiSettings.ai_enabled = 'false';
      if (!aiSettings.ai_model) aiSettings.ai_model = 'grok-4';
      if (!aiSettings.ai_temperature) aiSettings.ai_temperature = '0.7';
      if (!aiSettings.ai_max_tokens) aiSettings.ai_max_tokens = '1000';
      if (!aiSettings.ai_system_prompt) aiSettings.ai_system_prompt = 'Você é um assistente útil da plataforma Operlist.';

      return res.json(aiSettings);
    } catch (error) {
      console.error("Error fetching AI settings:", error);
      return res.status(500).json({ message: "Erro ao buscar configurações de IA" });
    }
  });

  // Save AI settings (admin only)
  app.post("/api/admin/ai-settings", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const { ai_enabled, ai_model, ai_temperature, ai_max_tokens, ai_system_prompt, ai_api_key } = req.body;

      // Validate settings
      if (ai_temperature && (parseFloat(ai_temperature) < 0 || parseFloat(ai_temperature) > 2)) {
        return res.status(400).json({ message: "Temperatura deve estar entre 0 e 2" });
      }

      if (ai_max_tokens && (parseInt(ai_max_tokens) < 1 || parseInt(ai_max_tokens) > 256000)) {
        return res.status(400).json({ message: "Max tokens deve estar entre 1 e 256000" });
      }

      const validModels = ['grok-4', 'grok-3', 'grok-3-mini', 'grok-vision-beta'];
      if (ai_model && !validModels.includes(ai_model)) {
        return res.status(400).json({ message: "Modelo inválido" });
      }

      // Save all settings
      const settingsToSave = [
        { key: 'ai_enabled', value: ai_enabled || 'false' },
        { key: 'ai_model', value: ai_model || 'grok-4' },
        { key: 'ai_temperature', value: ai_temperature || '0.7' },
        { key: 'ai_max_tokens', value: ai_max_tokens || '1000' },
        { key: 'ai_system_prompt', value: ai_system_prompt || 'Você é um assistente útil da plataforma Operlist.' }
      ];

      // Only save API key if provided
      if (ai_api_key) {
        settingsToSave.push({ key: 'ai_api_key', value: ai_api_key });
      }

      for (const setting of settingsToSave) {
        await storage.upsertSetting(setting);
      }

      return res.json({ message: "Configurações salvas com sucesso" });
    } catch (error) {
      console.error("Error saving AI settings:", error);
      return res.status(500).json({ message: "Erro ao salvar configurações de IA" });
    }
  });

  // Test AI connection (admin only)
  app.post("/api/admin/ai-settings/test", async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const { apiKey } = req.body;

      if (!apiKey) {
        return res.status(400).json({ message: "API Key é obrigatória para testar" });
      }

      // Test connection to xAI API
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'grok-3-mini',
          messages: [
            { role: 'user', content: 'Teste de conexão. Responda apenas: OK' }
          ],
          max_tokens: 10
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('xAI API error:', errorData);
        return res.status(400).json({ 
          success: false,
          message: "Falha ao conectar com a API do xAI. Verifique sua chave de API.",
          error: errorData
        });
      }

      const data = await response.json();
      return res.json({ 
        success: true,
        message: "Conexão com xAI estabelecida com sucesso!",
        response: data.choices[0]?.message?.content || 'OK'
      });
    } catch (error) {
      console.error("Error testing AI connection:", error);
      return res.status(500).json({ 
        success: false,
        message: "Erro ao testar conexão com a API" 
      });
    }
  });

  // Serve static files from attached_assets directory
  app.use('/attached_assets', express.static(path.join(process.cwd(), 'attached_assets')));

  const httpServer = createServer(app);

  return httpServer;
}
