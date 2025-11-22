import { users, companies, operators, experiences, admins, plans, clients, purchases, emailSettings, sectors, subsectors, events, banners, settings, jobs, applications, savedJobs, questions, jobQuestions, applicationAnswers, siteVisits, newsletterSubscriptions, passwordResetCodes, creditTransactions, workTypes, contractTypes, tags, type User, type InsertUser, type Company, type InsertCompany, type Operator, type InsertOperator, type Experience, type InsertExperience, type Admin, type InsertAdmin, type Plan, type InsertPlan, type Client, type InsertClient, type Purchase, type InsertPurchase, type EmailSettings, type InsertEmailSettings, type Sector, type InsertSector, type Subsector, type InsertSubsector, type Event, type InsertEvent, type Banner, type InsertBanner, type Setting, type InsertSetting, type Job, type InsertJob, type Application, type InsertApplication, type SavedJob, type InsertSavedJob, type Question, type InsertQuestion, type JobQuestion, type InsertJobQuestion, type ApplicationAnswer, type InsertApplicationAnswer, type SiteVisit, type InsertSiteVisit, type NewsletterSubscription, type InsertNewsletterSubscription, type PasswordResetCode, type InsertPasswordResetCode, type CreditTransaction, type InsertCreditTransaction, type WorkType, type InsertWorkType, type ContractType, type InsertContractType, type Tag, type InsertTag } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, not, like, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getCompany(id: string): Promise<Company | undefined>;
  getCompanyByEmail(email: string): Promise<Company | undefined>;
  getCompanyByCnpj(cnpj: string): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: string, company: Partial<InsertCompany>): Promise<Company>;
  getAllCompanies(): Promise<Company[]>;
  
  getOperator(id: string): Promise<Operator | undefined>;
  getOperatorByEmail(email: string): Promise<Operator | undefined>;
  getOperatorByCpf(cpf: string): Promise<Operator | undefined>;
  createOperator(operator: InsertOperator): Promise<Operator>;
  updateOperator(id: string, operator: Partial<InsertOperator>): Promise<Operator>;
  getAllOperators(): Promise<Operator[]>;
  isOperatorProfileComplete(operatorId: string): Promise<{ complete: boolean; missingFields: string[] }>;
  
  getExperience(id: string): Promise<Experience | undefined>;
  getExperiencesByOperator(operatorId: string): Promise<Experience[]>;
  createExperience(experience: InsertExperience): Promise<Experience>;
  updateExperience(id: string, experience: Partial<InsertExperience>): Promise<Experience>;
  deleteExperience(id: string): Promise<void>;
  
  getAdmin(id: string): Promise<Admin | undefined>;
  getAdminByEmail(email: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  getAllAdmins(): Promise<Admin[]>;
  
  getPlan(id: string): Promise<Plan | undefined>;
  getAllPlans(): Promise<Plan[]>;
  createPlan(plan: InsertPlan): Promise<Plan>;
  updatePlan(id: string, plan: Partial<InsertPlan>): Promise<Plan>;
  deletePlan(id: string): Promise<void>;
  
  getClient(id: string): Promise<Client | undefined>;
  getClientByEmail(email: string): Promise<Client | undefined>;
  getClientByCnpj(cnpj: string): Promise<Client | undefined>;
  getAllClients(): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, client: Partial<InsertClient>): Promise<Client>;
  deleteClient(id: string): Promise<void>;
  
  getPurchase(id: string): Promise<Purchase | undefined>;
  getPurchasesByClient(clientId: string): Promise<Purchase[]>;
  getPurchasesByPlan(planId: string): Promise<Purchase[]>;
  getAllPurchases(): Promise<Purchase[]>;
  getPurchasesWithFilters(filters: {
    startDate?: string;
    endDate?: string;
    clientId?: string;
    minAmount?: number;
    maxAmount?: number;
  }): Promise<Purchase[]>;
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  
  getEmailSettings(): Promise<EmailSettings | undefined>;
  createEmailSettings(settings: InsertEmailSettings): Promise<EmailSettings>;
  updateEmailSettings(id: string, settings: Partial<InsertEmailSettings>): Promise<EmailSettings>;
  
  getSector(id: string): Promise<Sector | undefined>;
  getAllSectors(): Promise<Sector[]>;
  createSector(sector: InsertSector): Promise<Sector>;
  updateSector(id: string, sector: Partial<InsertSector>): Promise<Sector>;
  deleteSector(id: string): Promise<void>;
  
  getSubsector(id: string): Promise<Subsector | undefined>;
  getSubsectorsBySector(sectorId: string): Promise<Subsector[]>;
  getAllSubsectors(): Promise<Subsector[]>;
  createSubsector(subsector: InsertSubsector): Promise<Subsector>;
  updateSubsector(id: string, subsector: Partial<InsertSubsector>): Promise<Subsector>;
  deleteSubsector(id: string): Promise<void>;
  
  getEvent(id: string): Promise<Event | undefined>;
  getAllEvents(): Promise<Event[]>;
  getActiveEvents(): Promise<Event[]>;
  getUpcomingEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event>;
  deleteEvent(id: string): Promise<void>;
  
  getBanner(id: string): Promise<Banner | undefined>;
  getAllBanners(): Promise<Banner[]>;
  getActiveBanners(): Promise<Banner[]>;
  createBanner(banner: InsertBanner): Promise<Banner>;
  updateBanner(id: string, banner: Partial<InsertBanner>): Promise<Banner>;
  deleteBanner(id: string): Promise<void>;
  
  getSetting(key: string): Promise<Setting | undefined>;
  getAllSettings(): Promise<Setting[]>;
  upsertSetting(setting: InsertSetting): Promise<Setting>;
  incrementVisitCounter(): Promise<number>;
  getVisitStats(): Promise<{ totalVisits: number; todayVisits: number }>;
  
  createSiteVisit(visit: InsertSiteVisit): Promise<SiteVisit>;
  getAllSiteVisits(): Promise<SiteVisit[]>;
  getSiteVisitsByDateRange(startDate: string, endDate: string): Promise<SiteVisit[]>;
  
  getJob(id: string): Promise<Job | undefined>;
  getAllJobs(): Promise<Job[]>;
  getAllJobsWithCompany(): Promise<Array<Job & { company: { id: string; name: string } | null }>>;
  getActiveJobs(): Promise<Job[]>;
  getJobsByCompany(companyId: string): Promise<Job[]>;
  getJobsByClient(clientId: string): Promise<Job[]>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: string, job: Partial<InsertJob>): Promise<Job>;
  deleteJob(id: string): Promise<void>;
  
  getApplication(id: string): Promise<Application | undefined>;
  getApplicationsByJob(jobId: string): Promise<Application[]>;
  getApplicationsWithOperatorByJob(jobId: string): Promise<Array<Application & { operator: Operator }>>;
  getApplicationsByOperator(operatorId: string): Promise<Application[]>;
  checkExistingApplication(jobId: string, operatorId: string): Promise<Application | undefined>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplicationStatus(id: string, status: string): Promise<Application>;
  
  saveJob(operatorId: string, jobId: string): Promise<SavedJob>;
  unsaveJob(operatorId: string, jobId: string): Promise<void>;
  getSavedJobsByOperator(operatorId: string): Promise<Array<SavedJob & { job: Job }>>;
  checkIfJobIsSaved(operatorId: string, jobId: string): Promise<boolean>;
  
  subscribeToNewsletter(email: string): Promise<NewsletterSubscription>;
  getNewsletterSubscription(email: string): Promise<NewsletterSubscription | undefined>;
  getAllNewsletterSubscriptions(): Promise<NewsletterSubscription[]>;
  getActiveNewsletterSubscriptions(): Promise<NewsletterSubscription[]>;
  
  createPasswordResetCode(resetCode: InsertPasswordResetCode): Promise<PasswordResetCode>;
  getPasswordResetCode(email: string, code: string): Promise<PasswordResetCode | undefined>;
  markPasswordResetCodeAsUsed(id: string): Promise<void>;
  deleteExpiredPasswordResetCodes(): Promise<void>;
  
  getQuestion(id: string): Promise<Question | undefined>;
  getQuestionsByCompany(companyId: string): Promise<Question[]>;
  getQuestionsByClient(clientId: string): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  updateQuestion(id: string, question: Partial<InsertQuestion>): Promise<Question>;
  deleteQuestion(id: string): Promise<void>;
  
  getWorkType(id: string): Promise<WorkType | undefined>;
  getWorkTypesByCompany(companyId: string): Promise<WorkType[]>;
  createWorkType(workType: InsertWorkType): Promise<WorkType>;
  updateWorkType(id: string, workType: Partial<InsertWorkType>): Promise<WorkType>;
  deleteWorkType(id: string): Promise<void>;
  
  getContractType(id: string): Promise<ContractType | undefined>;
  getContractTypesByCompany(companyId: string): Promise<ContractType[]>;
  createContractType(contractType: InsertContractType): Promise<ContractType>;
  updateContractType(id: string, contractType: Partial<InsertContractType>): Promise<ContractType>;
  deleteContractType(id: string): Promise<void>;
  
  getTag(id: string): Promise<Tag | undefined>;
  getAllTags(): Promise<Tag[]>;
  getActiveTags(): Promise<Tag[]>;
  createTag(tag: InsertTag): Promise<Tag>;
  updateTag(id: string, tag: Partial<InsertTag>): Promise<Tag>;
  deleteTag(id: string): Promise<void>;
  
  getJobQuestion(id: string): Promise<JobQuestion | undefined>;
  getJobQuestionsByJob(jobId: string): Promise<Array<JobQuestion & { question: Question }>>;
  createJobQuestion(jobQuestion: InsertJobQuestion): Promise<JobQuestion>;
  deleteJobQuestion(id: string): Promise<void>;
  
  getApplicationAnswer(id: string): Promise<ApplicationAnswer | undefined>;
  getApplicationAnswersByApplication(applicationId: string): Promise<Array<ApplicationAnswer & { question: Question }>>;
  createApplicationAnswer(answer: InsertApplicationAnswer): Promise<ApplicationAnswer>;
  
  getStats(): Promise<{
    totalCompanies: number;
    totalOperators: number;
    totalClients: number;
  }>;
  
  getCompanyDashboardStats(companyId: string): Promise<{
    activeJobs: number;
    totalJobs: number;
    totalApplications: number;
    recentApplications: number;
  }>;
  
  getCreditTransactionsByCompany(companyId: string): Promise<CreditTransaction[]>;
  createCreditTransaction(transaction: InsertCreditTransaction): Promise<CreditTransaction>;
  getCompanyCredits(companyId: string): Promise<number>;
  addCreditsToCompany(companyId: string, amount: number, description: string, relatedPlanId?: string): Promise<CreditTransaction>;
  deductCreditsFromCompany(companyId: string, amount: number, description: string, relatedJobId?: string): Promise<CreditTransaction>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getCompany(id: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company || undefined;
  }

  async getCompanyByEmail(email: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.email, email));
    return company || undefined;
  }

  async getCompanyByCnpj(cnpj: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.cnpj, cnpj));
    return company || undefined;
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const [company] = await db
      .insert(companies)
      .values(insertCompany)
      .returning();
    return company;
  }

  async updateCompany(id: string, updateData: Partial<InsertCompany>): Promise<Company> {
    const [company] = await db
      .update(companies)
      .set(updateData)
      .where(eq(companies.id, id))
      .returning();
    return company;
  }

  async getAllCompanies(): Promise<Company[]> {
    return await db.select().from(companies);
  }

  async getOperator(id: string): Promise<Operator | undefined> {
    const [operator] = await db.select().from(operators).where(eq(operators.id, id));
    return operator || undefined;
  }

  async getOperatorByEmail(email: string): Promise<Operator | undefined> {
    const [operator] = await db.select().from(operators).where(eq(operators.email, email));
    return operator || undefined;
  }

  async getOperatorByCpf(cpf: string): Promise<Operator | undefined> {
    const [operator] = await db.select().from(operators).where(eq(operators.cpf, cpf));
    return operator || undefined;
  }

  async createOperator(insertOperator: InsertOperator): Promise<Operator> {
    const [operator] = await db
      .insert(operators)
      .values(insertOperator)
      .returning();
    return operator;
  }

  async updateOperator(id: string, updateData: Partial<InsertOperator>): Promise<Operator> {
    const [operator] = await db
      .update(operators)
      .set(updateData)
      .where(eq(operators.id, id))
      .returning();
    return operator;
  }

  async getAllOperators(): Promise<Operator[]> {
    return await db.select().from(operators);
  }

  async isOperatorProfileComplete(operatorId: string): Promise<{ complete: boolean; missingFields: string[] }> {
    const operator = await this.getOperator(operatorId);
    if (!operator) {
      return { complete: false, missingFields: ['operator_not_found'] };
    }

    const missingFields: string[] = [];
    
    // Required fields for complete profile
    if (!operator.birthDate) missingFields.push('birthDate');
    if (!operator.experienceYears) missingFields.push('experienceYears');
    if (!operator.preferredLocation) missingFields.push('preferredLocation');
    if (!operator.skills) missingFields.push('skills');
    if (!operator.bio) missingFields.push('bio');

    return {
      complete: missingFields.length === 0,
      missingFields
    };
  }

  async getExperience(id: string): Promise<Experience | undefined> {
    const [experience] = await db.select().from(experiences).where(eq(experiences.id, id));
    return experience || undefined;
  }

  async getExperiencesByOperator(operatorId: string): Promise<Experience[]> {
    return await db
      .select()
      .from(experiences)
      .where(eq(experiences.operatorId, operatorId))
      .orderBy(desc(experiences.startDate));
  }

  async createExperience(insertExperience: InsertExperience): Promise<Experience> {
    const [experience] = await db
      .insert(experiences)
      .values(insertExperience)
      .returning();
    return experience;
  }

  async updateExperience(id: string, updateData: Partial<InsertExperience>): Promise<Experience> {
    const [experience] = await db
      .update(experiences)
      .set(updateData)
      .where(eq(experiences.id, id))
      .returning();
    return experience;
  }

  async deleteExperience(id: string): Promise<void> {
    await db.delete(experiences).where(eq(experiences.id, id));
  }

  async getAdmin(id: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.id, id));
    return admin || undefined;
  }

  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.email, email));
    return admin || undefined;
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const [admin] = await db
      .insert(admins)
      .values(insertAdmin)
      .returning();
    return admin;
  }

  async getAllAdmins(): Promise<Admin[]> {
    return await db.select().from(admins);
  }

  async getPlan(id: string): Promise<Plan | undefined> {
    const [plan] = await db.select().from(plans).where(eq(plans.id, id));
    return plan || undefined;
  }

  async getAllPlans(): Promise<Plan[]> {
    return await db.select().from(plans);
  }

  async createPlan(insertPlan: InsertPlan): Promise<Plan> {
    const [plan] = await db
      .insert(plans)
      .values(insertPlan)
      .returning();
    return plan;
  }

  async updatePlan(id: string, updateData: Partial<InsertPlan>): Promise<Plan> {
    const [plan] = await db
      .update(plans)
      .set(updateData)
      .where(eq(plans.id, id))
      .returning();
    return plan;
  }

  async deletePlan(id: string): Promise<void> {
    await db.delete(plans).where(eq(plans.id, id));
  }

  async getClient(id: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  async getClientByEmail(email: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.email, email));
    return client || undefined;
  }

  async getClientByCnpj(cnpj: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.cnpj, cnpj));
    return client || undefined;
  }

  async getAllClients(): Promise<Client[]> {
    return await db.select().from(clients);
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db
      .insert(clients)
      .values(insertClient)
      .returning();
    return client;
  }

  async updateClient(id: string, updateData: Partial<InsertClient>): Promise<Client> {
    const [client] = await db
      .update(clients)
      .set(updateData)
      .where(eq(clients.id, id))
      .returning();
    return client;
  }

  async deleteClient(id: string): Promise<void> {
    await db.delete(clients).where(eq(clients.id, id));
  }

  async getPurchase(id: string): Promise<Purchase | undefined> {
    const [purchase] = await db.select().from(purchases).where(eq(purchases.id, id));
    return purchase || undefined;
  }

  async getPurchasesByClient(clientId: string): Promise<Purchase[]> {
    return await db.select().from(purchases).where(eq(purchases.clientId, clientId)).orderBy(desc(purchases.purchaseDate));
  }

  async getPurchasesByPlan(planId: string): Promise<Purchase[]> {
    return await db.select().from(purchases).where(eq(purchases.planId, planId));
  }

  async getAllPurchases(): Promise<Purchase[]> {
    return await db.select().from(purchases).orderBy(desc(purchases.purchaseDate));
  }

  async getPurchasesWithFilters(filters: {
    startDate?: string;
    endDate?: string;
    clientId?: string;
    minAmount?: number;
    maxAmount?: number;
  }): Promise<Purchase[]> {
    let query = db.select().from(purchases);
    const conditions = [];

    if (filters.startDate) {
      conditions.push(gte(purchases.purchaseDate, filters.startDate));
    }
    if (filters.endDate) {
      conditions.push(lte(purchases.purchaseDate, filters.endDate));
    }
    if (filters.clientId) {
      conditions.push(eq(purchases.clientId, filters.clientId));
    }
    if (filters.minAmount !== undefined) {
      conditions.push(gte(purchases.amount, filters.minAmount.toString()));
    }
    if (filters.maxAmount !== undefined) {
      conditions.push(lte(purchases.amount, filters.maxAmount.toString()));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return await query.orderBy(desc(purchases.purchaseDate));
  }

  async createPurchase(insertPurchase: InsertPurchase): Promise<Purchase> {
    const [purchase] = await db
      .insert(purchases)
      .values(insertPurchase)
      .returning();
    return purchase;
  }

  async getEmailSettings(): Promise<EmailSettings | undefined> {
    const [settings] = await db.select().from(emailSettings).limit(1);
    return settings || undefined;
  }

  async createEmailSettings(insertSettings: InsertEmailSettings): Promise<EmailSettings> {
    const [settings] = await db
      .insert(emailSettings)
      .values(insertSettings)
      .returning();
    return settings;
  }

  async updateEmailSettings(id: string, updateData: Partial<InsertEmailSettings>): Promise<EmailSettings> {
    const [settings] = await db
      .update(emailSettings)
      .set(updateData)
      .where(eq(emailSettings.id, id))
      .returning();
    return settings;
  }

  async getSector(id: string): Promise<Sector | undefined> {
    const [sector] = await db.select().from(sectors).where(eq(sectors.id, id));
    return sector || undefined;
  }

  async getAllSectors(): Promise<Sector[]> {
    return await db.select().from(sectors).orderBy(sectors.name);
  }

  async createSector(insertSector: InsertSector): Promise<Sector> {
    const [sector] = await db
      .insert(sectors)
      .values(insertSector)
      .returning();
    return sector;
  }

  async updateSector(id: string, updateData: Partial<InsertSector>): Promise<Sector> {
    const [sector] = await db
      .update(sectors)
      .set(updateData)
      .where(eq(sectors.id, id))
      .returning();
    return sector;
  }

  async deleteSector(id: string): Promise<void> {
    await db.delete(sectors).where(eq(sectors.id, id));
  }

  async getSubsector(id: string): Promise<Subsector | undefined> {
    const [subsector] = await db.select().from(subsectors).where(eq(subsectors.id, id));
    return subsector || undefined;
  }

  async getSubsectorsBySector(sectorId: string): Promise<Subsector[]> {
    return await db.select().from(subsectors).where(eq(subsectors.sectorId, sectorId)).orderBy(subsectors.name);
  }

  async getAllSubsectors(): Promise<Subsector[]> {
    return await db.select().from(subsectors).orderBy(subsectors.name);
  }

  async createSubsector(insertSubsector: InsertSubsector): Promise<Subsector> {
    const [subsector] = await db
      .insert(subsectors)
      .values(insertSubsector)
      .returning();
    return subsector;
  }

  async updateSubsector(id: string, updateData: Partial<InsertSubsector>): Promise<Subsector> {
    const [subsector] = await db
      .update(subsectors)
      .set(updateData)
      .where(eq(subsectors.id, id))
      .returning();
    return subsector;
  }

  async deleteSubsector(id: string): Promise<void> {
    await db.delete(subsectors).where(eq(subsectors.id, id));
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
  }

  async getAllEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(desc(events.eventDate));
  }

  async getActiveEvents(): Promise<Event[]> {
    const today = new Date().toISOString().split('T')[0];
    const allActiveEvents = await db.select().from(events).where(eq(events.isActive, 'true')).orderBy(desc(events.eventDate));
    
    return allActiveEvents.filter(event => {
      if (!event.endDate) return true;
      return event.endDate >= today;
    });
  }

  async getUpcomingEvents(): Promise<Event[]> {
    const today = new Date().toISOString().split('T')[0];
    return await db.select().from(events)
      .where(eq(events.isActive, 'true'))
      .orderBy(events.eventDate);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const [event] = await db
      .insert(events)
      .values(insertEvent)
      .returning();
    return event;
  }

  async updateEvent(id: string, updateData: Partial<InsertEvent>): Promise<Event> {
    const [event] = await db
      .update(events)
      .set(updateData)
      .where(eq(events.id, id))
      .returning();
    return event;
  }

  async deleteEvent(id: string): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  async getBanner(id: string): Promise<Banner | undefined> {
    const [banner] = await db.select().from(banners).where(eq(banners.id, id));
    return banner || undefined;
  }

  async getAllBanners(): Promise<Banner[]> {
    return await db.select().from(banners).orderBy(banners.displayOrder);
  }

  async getActiveBanners(): Promise<Banner[]> {
    return await db.select().from(banners)
      .where(eq(banners.isActive, 'true'))
      .orderBy(banners.displayOrder);
  }

  async createBanner(insertBanner: InsertBanner): Promise<Banner> {
    const [banner] = await db
      .insert(banners)
      .values(insertBanner)
      .returning();
    return banner;
  }

  async updateBanner(id: string, updateData: Partial<InsertBanner>): Promise<Banner> {
    const [banner] = await db
      .update(banners)
      .set(updateData)
      .where(eq(banners.id, id))
      .returning();
    return banner;
  }

  async deleteBanner(id: string): Promise<void> {
    await db.delete(banners).where(eq(banners.id, id));
  }

  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting || undefined;
  }

  async getAllSettings(): Promise<Setting[]> {
    return await db.select().from(settings);
  }

  async upsertSetting(insertSetting: InsertSetting): Promise<Setting> {
    const existing = await this.getSetting(insertSetting.key);
    
    if (existing) {
      const [updated] = await db
        .update(settings)
        .set({ value: insertSetting.value })
        .where(eq(settings.key, insertSetting.key))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(settings)
        .values(insertSetting)
        .returning();
      return created;
    }
  }

  async incrementVisitCounter(): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    
    // Get current counters
    const totalSetting = await this.getSetting('visit_counter_total');
    const todaySetting = await this.getSetting('visit_counter_today');
    const dateSetting = await this.getSetting('visit_counter_date');
    
    const currentTotal = totalSetting ? parseInt(totalSetting.value) : 0;
    const currentToday = todaySetting ? parseInt(todaySetting.value) : 0;
    const lastDate = dateSetting?.value || '';
    
    // Increment total
    const newTotal = currentTotal + 1;
    await this.upsertSetting({ key: 'visit_counter_total', value: newTotal.toString() });
    
    // Reset today counter if date changed
    if (lastDate !== today) {
      await this.upsertSetting({ key: 'visit_counter_today', value: '1' });
      await this.upsertSetting({ key: 'visit_counter_date', value: today });
    } else {
      const newToday = currentToday + 1;
      await this.upsertSetting({ key: 'visit_counter_today', value: newToday.toString() });
    }
    
    return newTotal;
  }

  async getVisitStats(): Promise<{ totalVisits: number; todayVisits: number }> {
    const today = new Date().toISOString().split('T')[0];
    
    const totalSetting = await this.getSetting('visit_counter_total');
    const todaySetting = await this.getSetting('visit_counter_today');
    const dateSetting = await this.getSetting('visit_counter_date');
    
    const totalVisits = totalSetting ? parseInt(totalSetting.value) : 0;
    let todayVisits = 0;
    
    // Only count today's visits if the date matches
    if (dateSetting?.value === today && todaySetting) {
      todayVisits = parseInt(todaySetting.value);
    }
    
    return { totalVisits, todayVisits };
  }

  async createSiteVisit(visit: InsertSiteVisit): Promise<SiteVisit> {
    const [siteVisit] = await db
      .insert(siteVisits)
      .values(visit)
      .returning();
    return siteVisit;
  }

  async getAllSiteVisits(): Promise<SiteVisit[]> {
    // Filter out localhost IPs (127.0.0.1, ::1, etc)
    return await db
      .select()
      .from(siteVisits)
      .where(
        and(
          not(like(siteVisits.ipAddress, '127.%')),
          not(eq(siteVisits.ipAddress, '::1')),
          not(eq(siteVisits.ipAddress, 'unknown'))
        )
      )
      .orderBy(desc(siteVisits.visitedAt));
  }

  async getSiteVisitsByDateRange(startDate: string, endDate: string): Promise<SiteVisit[]> {
    return await db
      .select()
      .from(siteVisits)
      .where(and(
        gte(siteVisits.visitedAt, startDate),
        lte(siteVisits.visitedAt, endDate)
      ))
      .orderBy(desc(siteVisits.visitedAt));
  }

  async getJob(id: string): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job || undefined;
  }

  async getAllJobs(): Promise<Job[]> {
    return await db.select().from(jobs).orderBy(desc(jobs.createdAt));
  }

  async getAllJobsWithCompany(): Promise<Array<Job & { company: { id: string; name: string } | null }>> {
    const results = await db
      .select()
      .from(jobs)
      .leftJoin(companies, eq(jobs.companyId, companies.id))
      .orderBy(desc(jobs.createdAt));

    return results.map((result: any) => ({
      ...result.jobs,
      company: result.companies ? { 
        id: result.companies.id, 
        name: result.companies.companyName || result.companies.name || 'Empresa'
      } : null,
    }));
  }

  async getActiveJobs(): Promise<Job[]> {
    return await db.select().from(jobs).where(eq(jobs.status, 'active')).orderBy(desc(jobs.createdAt));
  }

  async getJobsByCompany(companyId: string): Promise<Job[]> {
    return await db.select().from(jobs).where(eq(jobs.companyId, companyId)).orderBy(desc(jobs.createdAt));
  }

  async getJobsByClient(clientId: string): Promise<Job[]> {
    return await db.select().from(jobs).where(eq(jobs.clientId, clientId)).orderBy(desc(jobs.createdAt));
  }

  async createJob(insertJob: InsertJob): Promise<Job> {
    const [job] = await db
      .insert(jobs)
      .values(insertJob)
      .returning();
    return job;
  }

  async updateJob(id: string, updateData: Partial<InsertJob>): Promise<Job> {
    const [job] = await db
      .update(jobs)
      .set({ ...updateData, updatedAt: new Date().toISOString() })
      .where(eq(jobs.id, id))
      .returning();
    return job;
  }

  async deleteJob(id: string): Promise<void> {
    await db.delete(jobs).where(eq(jobs.id, id));
  }

  async getApplication(id: string): Promise<Application | undefined> {
    const [application] = await db.select().from(applications).where(eq(applications.id, id));
    return application || undefined;
  }

  async getApplicationsByJob(jobId: string): Promise<Application[]> {
    return await db.select().from(applications).where(eq(applications.jobId, jobId));
  }

  async getApplicationsWithOperatorByJob(jobId: string): Promise<Array<Application & { operator: Operator }>> {
    const results = await db
      .select({
        application: applications,
        operator: operators,
      })
      .from(applications)
      .innerJoin(operators, eq(applications.operatorId, operators.id))
      .where(eq(applications.jobId, jobId))
      .orderBy(desc(applications.appliedAt));

    return results.map((result) => ({
      ...result.application,
      operator: result.operator,
    }));
  }

  async getApplicationsByOperator(operatorId: string): Promise<Application[]> {
    return await db.select().from(applications).where(eq(applications.operatorId, operatorId)).orderBy(desc(applications.appliedAt));
  }

  async getApplicationsWithJobByOperator(operatorId: string): Promise<Array<Application & { job: Job & { company: Company } }>> {
    const results = await db
      .select({
        application: applications,
        job: jobs,
        company: companies,
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .where(eq(applications.operatorId, operatorId))
      .orderBy(desc(applications.appliedAt));

    return results.map((result) => ({
      ...result.application,
      job: {
        ...result.job,
        company: result.company,
      },
    }));
  }

  async checkExistingApplication(jobId: string, operatorId: string): Promise<Application | undefined> {
    const [application] = await db.select().from(applications).where(
      and(
        eq(applications.jobId, jobId),
        eq(applications.operatorId, operatorId)
      )
    );
    return application || undefined;
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const [application] = await db
      .insert(applications)
      .values(insertApplication)
      .returning();
    return application;
  }

  async updateApplicationStatus(id: string, status: string): Promise<Application> {
    const [application] = await db
      .update(applications)
      .set({ status })
      .where(eq(applications.id, id))
      .returning();
    return application;
  }

  async saveJob(operatorId: string, jobId: string): Promise<SavedJob> {
    const [savedJob] = await db
      .insert(savedJobs)
      .values({ operatorId, jobId })
      .returning();
    return savedJob;
  }

  async unsaveJob(operatorId: string, jobId: string): Promise<void> {
    await db
      .delete(savedJobs)
      .where(and(
        eq(savedJobs.operatorId, operatorId),
        eq(savedJobs.jobId, jobId)
      ));
  }

  async getSavedJobsByOperator(operatorId: string): Promise<Array<SavedJob & { job: Job }>> {
    const results = await db
      .select()
      .from(savedJobs)
      .leftJoin(jobs, eq(savedJobs.jobId, jobs.id))
      .where(eq(savedJobs.operatorId, operatorId))
      .orderBy(desc(savedJobs.savedAt));
    
    return results.map(row => ({
      ...row.saved_jobs,
      job: row.jobs!
    }));
  }

  async checkIfJobIsSaved(operatorId: string, jobId: string): Promise<boolean> {
    const [result] = await db
      .select()
      .from(savedJobs)
      .where(and(
        eq(savedJobs.operatorId, operatorId),
        eq(savedJobs.jobId, jobId)
      ))
      .limit(1);
    
    return !!result;
  }

  async getStats(): Promise<{
    totalCompanies: number;
    totalOperators: number;
    totalClients: number;
  }> {
    const [companiesResult] = await db.select({ count: db.$count(companies) }).from(companies);
    const [operatorsResult] = await db.select({ count: db.$count(operators) }).from(operators);
    const [clientsResult] = await db.select({ count: db.$count(clients) }).from(clients);
    
    return {
      totalCompanies: companiesResult?.count || 0,
      totalOperators: operatorsResult?.count || 0,
      totalClients: clientsResult?.count || 0,
    };
  }
  
  async getCompanyDashboardStats(companyId: string): Promise<{
    activeJobs: number;
    totalJobs: number;
    totalApplications: number;
    recentApplications: number;
  }> {
    // Buscar todos os jobs da empresa
    const companyJobs = await this.getJobsByCompany(companyId);
    const totalJobs = companyJobs.length;
    const activeJobs = companyJobs.filter(job => job.status === 'active').length;
    
    // Buscar todas as candidaturas para as vagas da empresa
    const jobIds = companyJobs.map(job => job.id);
    let totalApplications = 0;
    let recentApplications = 0;
    
    if (jobIds.length > 0) {
      for (const jobId of jobIds) {
        const jobApplications = await this.getApplicationsByJob(jobId);
        totalApplications += jobApplications.length;
        
        // Candidaturas dos últimos 7 dias
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        recentApplications += jobApplications.filter(app => 
          new Date(app.appliedAt) >= sevenDaysAgo
        ).length;
      }
    }
    
    return {
      activeJobs,
      totalJobs,
      totalApplications,
      recentApplications,
    };
  }

  async getQuestion(id: string): Promise<Question | undefined> {
    const [question] = await db.select().from(questions).where(eq(questions.id, id));
    return question || undefined;
  }

  async getQuestionsByCompany(companyId: string): Promise<Question[]> {
    return await db.select().from(questions)
      .where(eq(questions.companyId, companyId))
      .orderBy(desc(questions.createdAt));
  }

  async getQuestionsByClient(clientId: string): Promise<Question[]> {
    return await db.select().from(questions)
      .where(eq(questions.clientId, clientId))
      .orderBy(desc(questions.createdAt));
  }

  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const [question] = await db
      .insert(questions)
      .values(insertQuestion)
      .returning();
    return question;
  }

  async updateQuestion(id: string, updateData: Partial<InsertQuestion>): Promise<Question> {
    const [question] = await db
      .update(questions)
      .set(updateData)
      .where(eq(questions.id, id))
      .returning();
    return question;
  }

  async deleteQuestion(id: string): Promise<void> {
    await db.delete(questions).where(eq(questions.id, id));
  }

  async getWorkType(id: string): Promise<WorkType | undefined> {
    const [workType] = await db.select().from(workTypes).where(eq(workTypes.id, id));
    return workType || undefined;
  }

  async getWorkTypesByCompany(companyId: string): Promise<WorkType[]> {
    return await db.select().from(workTypes)
      .where(eq(workTypes.companyId, companyId))
      .orderBy(desc(workTypes.createdAt));
  }

  async createWorkType(insertWorkType: InsertWorkType): Promise<WorkType> {
    const [workType] = await db
      .insert(workTypes)
      .values(insertWorkType)
      .returning();
    return workType;
  }

  async updateWorkType(id: string, updateData: Partial<InsertWorkType>): Promise<WorkType> {
    const [workType] = await db
      .update(workTypes)
      .set(updateData)
      .where(eq(workTypes.id, id))
      .returning();
    return workType;
  }

  async deleteWorkType(id: string): Promise<void> {
    await db.delete(workTypes).where(eq(workTypes.id, id));
  }

  async getContractType(id: string): Promise<ContractType | undefined> {
    const [contractType] = await db.select().from(contractTypes).where(eq(contractTypes.id, id));
    return contractType || undefined;
  }

  async getContractTypesByCompany(companyId: string): Promise<ContractType[]> {
    return await db.select().from(contractTypes)
      .where(eq(contractTypes.companyId, companyId))
      .orderBy(desc(contractTypes.createdAt));
  }

  async createContractType(insertContractType: InsertContractType): Promise<ContractType> {
    const [contractType] = await db
      .insert(contractTypes)
      .values(insertContractType)
      .returning();
    return contractType;
  }

  async updateContractType(id: string, updateData: Partial<InsertContractType>): Promise<ContractType> {
    const [contractType] = await db
      .update(contractTypes)
      .set(updateData)
      .where(eq(contractTypes.id, id))
      .returning();
    return contractType;
  }

  async deleteContractType(id: string): Promise<void> {
    await db.delete(contractTypes).where(eq(contractTypes.id, id));
  }

  async getTag(id: string): Promise<Tag | undefined> {
    const [tag] = await db.select().from(tags).where(eq(tags.id, id));
    return tag || undefined;
  }

  async getAllTags(): Promise<Tag[]> {
    return await db.select().from(tags).orderBy(desc(tags.createdAt));
  }

  async getActiveTags(): Promise<Tag[]> {
    return await db.select().from(tags)
      .where(eq(tags.isActive, 'true'))
      .orderBy(desc(tags.createdAt));
  }

  async createTag(insertTag: InsertTag): Promise<Tag> {
    const [tag] = await db
      .insert(tags)
      .values(insertTag)
      .returning();
    return tag;
  }

  async updateTag(id: string, updateData: Partial<InsertTag>): Promise<Tag> {
    const [tag] = await db
      .update(tags)
      .set(updateData)
      .where(eq(tags.id, id))
      .returning();
    return tag;
  }

  async deleteTag(id: string): Promise<void> {
    await db.delete(tags).where(eq(tags.id, id));
  }

  async getJobQuestion(id: string): Promise<JobQuestion | undefined> {
    const [jobQuestion] = await db.select().from(jobQuestions).where(eq(jobQuestions.id, id));
    return jobQuestion || undefined;
  }

  async getJobQuestionsByJob(jobId: string): Promise<Array<JobQuestion & { question: Question }>> {
    const results = await db
      .select({
        jobQuestion: jobQuestions,
        question: questions,
      })
      .from(jobQuestions)
      .innerJoin(questions, eq(jobQuestions.questionId, questions.id))
      .where(eq(jobQuestions.jobId, jobId))
      .orderBy(jobQuestions.displayOrder);

    return results.map((result) => ({
      ...result.jobQuestion,
      question: result.question,
    }));
  }

  async createJobQuestion(insertJobQuestion: InsertJobQuestion): Promise<JobQuestion> {
    const [jobQuestion] = await db
      .insert(jobQuestions)
      .values(insertJobQuestion)
      .returning();
    return jobQuestion;
  }

  async deleteJobQuestion(id: string): Promise<void> {
    await db.delete(jobQuestions).where(eq(jobQuestions.id, id));
  }

  async getApplicationAnswer(id: string): Promise<ApplicationAnswer | undefined> {
    const [answer] = await db.select().from(applicationAnswers).where(eq(applicationAnswers.id, id));
    return answer || undefined;
  }

  async getApplicationAnswersByApplication(applicationId: string): Promise<Array<ApplicationAnswer & { question: Question }>> {
    const results = await db
      .select({
        answer: applicationAnswers,
        question: questions,
      })
      .from(applicationAnswers)
      .innerJoin(questions, eq(applicationAnswers.questionId, questions.id))
      .where(eq(applicationAnswers.applicationId, applicationId))
      .orderBy(applicationAnswers.createdAt);

    return results.map((result) => ({
      ...result.answer,
      question: result.question,
    }));
  }

  async createApplicationAnswer(insertAnswer: InsertApplicationAnswer): Promise<ApplicationAnswer> {
    const [answer] = await db
      .insert(applicationAnswers)
      .values(insertAnswer)
      .returning();
    return answer;
  }

  async subscribeToNewsletter(email: string): Promise<NewsletterSubscription> {
    const existing = await this.getNewsletterSubscription(email);
    
    if (existing) {
      if (existing.isActive === 'false') {
        const [updated] = await db
          .update(newsletterSubscriptions)
          .set({ isActive: 'true' })
          .where(eq(newsletterSubscriptions.email, email))
          .returning();
        return updated;
      }
      return existing;
    }

    const [subscription] = await db
      .insert(newsletterSubscriptions)
      .values({ email })
      .returning();
    return subscription;
  }

  async getNewsletterSubscription(email: string): Promise<NewsletterSubscription | undefined> {
    const [subscription] = await db
      .select()
      .from(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.email, email));
    return subscription || undefined;
  }

  async getAllNewsletterSubscriptions(): Promise<NewsletterSubscription[]> {
    return await db
      .select()
      .from(newsletterSubscriptions)
      .orderBy(desc(newsletterSubscriptions.subscribedAt));
  }

  async getActiveNewsletterSubscriptions(): Promise<NewsletterSubscription[]> {
    return await db
      .select()
      .from(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.isActive, 'true'))
      .orderBy(desc(newsletterSubscriptions.subscribedAt));
  }

  async createPasswordResetCode(resetCode: InsertPasswordResetCode): Promise<PasswordResetCode> {
    const [code] = await db
      .insert(passwordResetCodes)
      .values(resetCode)
      .returning();
    return code;
  }

  async getPasswordResetCode(email: string, code: string): Promise<PasswordResetCode | undefined> {
    const [resetCode] = await db
      .select()
      .from(passwordResetCodes)
      .where(
        and(
          eq(passwordResetCodes.email, email),
          eq(passwordResetCodes.code, code),
          eq(passwordResetCodes.isUsed, 'false')
        )
      );
    return resetCode || undefined;
  }

  async markPasswordResetCodeAsUsed(id: string): Promise<void> {
    await db
      .update(passwordResetCodes)
      .set({ isUsed: 'true' })
      .where(eq(passwordResetCodes.id, id));
  }

  async deleteExpiredPasswordResetCodes(): Promise<void> {
    const now = new Date().toISOString();
    await db
      .delete(passwordResetCodes)
      .where(lte(passwordResetCodes.expiresAt, now));
  }

  async getCreditTransactionsByCompany(companyId: string): Promise<CreditTransaction[]> {
    return await db
      .select()
      .from(creditTransactions)
      .where(eq(creditTransactions.companyId, companyId))
      .orderBy(desc(creditTransactions.createdAt));
  }

  async createCreditTransaction(transaction: InsertCreditTransaction): Promise<CreditTransaction> {
    const [newTransaction] = await db
      .insert(creditTransactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async getCompanyCredits(companyId: string): Promise<number> {
    const [company] = await db
      .select()
      .from(companies)
      .where(eq(companies.id, companyId));
    return company ? parseInt(company.credits) : 0;
  }

  async addCreditsToCompany(
    companyId: string,
    amount: number,
    description: string,
    relatedPlanId?: string
  ): Promise<CreditTransaction> {
    const currentCredits = await this.getCompanyCredits(companyId);
    const newBalance = currentCredits + amount;

    await db
      .update(companies)
      .set({ credits: newBalance.toString() })
      .where(eq(companies.id, companyId));

    const transaction = await this.createCreditTransaction({
      companyId,
      type: 'credit',
      amount: amount.toString(),
      description,
      relatedPlanId,
      balanceAfter: newBalance.toString(),
    });

    return transaction;
  }

  async deductCreditsFromCompany(
    companyId: string,
    amount: number,
    description: string,
    relatedJobId?: string
  ): Promise<CreditTransaction> {
    const currentCredits = await this.getCompanyCredits(companyId);
    
    if (currentCredits < amount) {
      throw new Error('Créditos insuficientes');
    }

    const newBalance = currentCredits - amount;

    await db
      .update(companies)
      .set({ credits: newBalance.toString() })
      .where(eq(companies.id, companyId));

    const transaction = await this.createCreditTransaction({
      companyId,
      type: 'debit',
      amount: amount.toString(),
      description,
      relatedJobId,
      balanceAfter: newBalance.toString(),
    });

    return transaction;
  }
}

export const storage = new DatabaseStorage();
