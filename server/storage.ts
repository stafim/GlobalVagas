import { users, companies, operators, experiences, admins, plans, clients, purchases, emailSettings, sectors, subsectors, events, banners, settings, type User, type InsertUser, type Company, type InsertCompany, type Operator, type InsertOperator, type Experience, type InsertExperience, type Admin, type InsertAdmin, type Plan, type InsertPlan, type Client, type InsertClient, type Purchase, type InsertPurchase, type EmailSettings, type InsertEmailSettings, type Sector, type InsertSector, type Subsector, type InsertSubsector, type Event, type InsertEvent, type Banner, type InsertBanner, type Setting, type InsertSetting } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getCompany(id: string): Promise<Company | undefined>;
  getCompanyByEmail(email: string): Promise<Company | undefined>;
  getCompanyByCnpj(cnpj: string): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  getAllCompanies(): Promise<Company[]>;
  
  getOperator(id: string): Promise<Operator | undefined>;
  getOperatorByEmail(email: string): Promise<Operator | undefined>;
  getOperatorByCpf(cpf: string): Promise<Operator | undefined>;
  createOperator(operator: InsertOperator): Promise<Operator>;
  updateOperator(id: string, operator: Partial<InsertOperator>): Promise<Operator>;
  getAllOperators(): Promise<Operator[]>;
  
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
  
  getStats(): Promise<{
    totalCompanies: number;
    totalOperators: number;
    totalClients: number;
  }>;
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
}

export const storage = new DatabaseStorage();
