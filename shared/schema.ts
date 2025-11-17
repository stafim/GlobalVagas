import { sql } from "drizzle-orm";
import { pgTable, text, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  companyName: text("company_name").notNull(),
  cnpj: text("cnpj").notNull().unique(),
  phone: text("phone").notNull(),
  website: text("website"),
  description: text("description"),
  industry: text("industry"),
  size: text("size"),
  logoUrl: text("logo_url"),
}, (table) => ({
  emailIdx: index("companies_email_idx").on(table.email),
  cnpjIdx: index("companies_cnpj_idx").on(table.cnpj),
}));

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
});

export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;

export const operators = pgTable("operators", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  cpf: text("cpf").notNull().unique(),
  phone: text("phone").notNull(),
  birthDate: text("birth_date"),
  profession: text("profession").notNull(),
  experienceYears: text("experience_years"),
  certifications: text("certifications"),
  availability: text("availability"),
  preferredLocation: text("preferred_location"),
  workType: text("work_type"),
  skills: text("skills"),
  bio: text("bio"),
  profilePhotoUrl: text("profile_photo_url"),
}, (table) => ({
  emailIdx: index("operators_email_idx").on(table.email),
  cpfIdx: index("operators_cpf_idx").on(table.cpf),
}));

export const insertOperatorSchema = createInsertSchema(operators).omit({
  id: true,
});

export type InsertOperator = z.infer<typeof insertOperatorSchema>;
export type Operator = typeof operators.$inferSelect;

export const experiences = pgTable("experiences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  operatorId: varchar("operator_id").notNull().references(() => operators.id, { onDelete: 'cascade' }),
  company: text("company").notNull(),
  position: text("position").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  isCurrent: text("is_current").notNull().default('false'),
  description: text("description"),
  location: text("location"),
});

export const insertExperienceSchema = createInsertSchema(experiences).omit({
  id: true,
});

export type InsertExperience = z.infer<typeof insertExperienceSchema>;
export type Experience = typeof experiences.$inferSelect;

export const admins = pgTable("admins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
}, (table) => ({
  emailIdx: index("admins_email_idx").on(table.email),
}));

export const insertAdminSchema = createInsertSchema(admins).omit({
  id: true,
});

export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Admin = typeof admins.$inferSelect;

export const plans = pgTable("plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: text("price").notNull(),
  vacancyQuantity: text("vacancy_quantity").notNull(),
  features: text("features").notNull(),
  isActive: text("is_active").notNull().default('true'),
});

export const insertPlanSchema = createInsertSchema(plans).omit({
  id: true,
});

export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type Plan = typeof plans.$inferSelect;

export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyName: text("company_name").notNull(),
  cnpj: text("cnpj").notNull().unique(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  website: text("website"),
  contactName: text("contact_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone").notNull(),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").notNull().default('#8b5cf6'),
  secondaryColor: text("secondary_color").notNull().default('#a78bfa'),
  accentColor: text("accent_color").notNull().default('#c4b5fd'),
  isActive: text("is_active").notNull().default('true'),
}, (table) => ({
  emailIdx: index("clients_email_idx").on(table.email),
  cnpjIdx: index("clients_cnpj_idx").on(table.cnpj),
}));

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
});

export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

export const purchases = pgTable("purchases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => clients.id, { onDelete: 'cascade' }),
  planId: varchar("plan_id").notNull().references(() => plans.id),
  purchaseDate: text("purchase_date").notNull(),
  expiryDate: text("expiry_date").notNull(),
  amount: text("amount").notNull(),
  status: text("status").notNull().default('active'),
  paymentMethod: text("payment_method"),
  transactionId: text("transaction_id"),
}, (table) => ({
  clientIdIdx: index("purchases_client_id_idx").on(table.clientId),
}));

export const insertPurchaseSchema = createInsertSchema(purchases).omit({
  id: true,
});

export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type Purchase = typeof purchases.$inferSelect;

export const emailSettings = pgTable("email_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  provider: text("provider").notNull(),
  apiKey: text("api_key"),
  senderEmail: text("sender_email").notNull(),
  senderName: text("sender_name").notNull(),
  smtpHost: text("smtp_host"),
  smtpPort: text("smtp_port"),
  smtpUser: text("smtp_user"),
  smtpPassword: text("smtp_password"),
  isActive: text("is_active").notNull().default('true'),
});

export const insertEmailSettingsSchema = createInsertSchema(emailSettings).omit({
  id: true,
});

export type InsertEmailSettings = z.infer<typeof insertEmailSettingsSchema>;
export type EmailSettings = typeof emailSettings.$inferSelect;

export const sectors = pgTable("sectors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  isActive: text("is_active").notNull().default('true'),
}, (table) => ({
  nameIdx: index("sectors_name_idx").on(table.name),
}));

export const insertSectorSchema = createInsertSchema(sectors).omit({
  id: true,
});

export type InsertSector = z.infer<typeof insertSectorSchema>;
export type Sector = typeof sectors.$inferSelect;

export const subsectors = pgTable("subsectors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sectorId: varchar("sector_id").notNull().references(() => sectors.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  description: text("description"),
  isActive: text("is_active").notNull().default('true'),
}, (table) => ({
  sectorIdIdx: index("subsectors_sector_id_idx").on(table.sectorId),
  nameIdx: index("subsectors_name_idx").on(table.name),
}));

export const insertSubsectorSchema = createInsertSchema(subsectors).omit({
  id: true,
});

export type InsertSubsector = z.infer<typeof insertSubsectorSchema>;
export type Subsector = typeof subsectors.$inferSelect;

export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  eventDate: text("event_date").notNull(),
  endDate: text("end_date"),
  location: text("location").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  country: text("country").notNull(),
  isFree: text("is_free").notNull().default('true'),
  price: text("price"),
  coverImageUrl: text("cover_image_url"),
  organizerName: text("organizer_name").notNull(),
  organizerEmail: text("organizer_email").notNull(),
  organizerPhone: text("organizer_phone"),
  website: text("website"),
  capacity: text("capacity"),
  category: text("category"),
  isActive: text("is_active").notNull().default('true'),
}, (table) => ({
  eventDateIdx: index("events_event_date_idx").on(table.eventDate),
  cityIdx: index("events_city_idx").on(table.city),
}));

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
});

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

export const banners = pgTable("banners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  imageUrl: text("image_url").notNull(),
  linkUrl: text("link_url"),
  displayOrder: text("display_order").notNull().default('0'),
  isActive: text("is_active").notNull().default('true'),
}, (table) => ({
  displayOrderIdx: index("banners_display_order_idx").on(table.displayOrder),
}));

export const insertBannerSchema = createInsertSchema(banners).omit({
  id: true,
});

export type InsertBanner = z.infer<typeof insertBannerSchema>;
export type Banner = typeof banners.$inferSelect;

export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
}, (table) => ({
  keyIdx: index("settings_key_idx").on(table.key),
}));

export const insertSettingSchema = createInsertSchema(settings).omit({
  id: true,
});

export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Setting = typeof settings.$inferSelect;

export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").references(() => companies.id, { onDelete: 'cascade' }),
  clientId: varchar("client_id").references(() => clients.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements"),
  responsibilities: text("responsibilities"),
  benefits: text("benefits"),
  location: text("location").notNull(),
  city: text("city"),
  state: text("state"),
  workType: text("work_type").notNull(),
  contractType: text("contract_type").notNull(),
  salary: text("salary"),
  salaryPeriod: text("salary_period"),
  sectorId: varchar("sector_id").references(() => sectors.id),
  subsectorId: varchar("subsector_id").references(() => subsectors.id),
  experienceLevel: text("experience_level"),
  educationLevel: text("education_level"),
  status: text("status").notNull().default('active'),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at"),
  expiryDate: text("expiry_date"),
  vacancies: text("vacancies").notNull().default('1'),
}, (table) => ({
  companyIdIdx: index("jobs_company_id_idx").on(table.companyId),
  clientIdIdx: index("jobs_client_id_idx").on(table.clientId),
  statusIdx: index("jobs_status_idx").on(table.status),
  sectorIdIdx: index("jobs_sector_id_idx").on(table.sectorId),
}));

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
});

export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;
