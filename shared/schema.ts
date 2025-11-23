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
  about: text("about"),
  mission: text("mission"),
  culture: text("culture"),
  bannerUrl: text("banner_url"),
  credits: text("credits").notNull().default('0'),
  lastLoginAt: text("last_login_at"),
}, (table) => ({
  emailIdx: index("companies_email_idx").on(table.email),
  cnpjIdx: index("companies_cnpj_idx").on(table.cnpj),
}));

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
});

export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;

export const companyTopics = pgTable("company_topics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  order: text("order").notNull().default('0'),
}, (table) => ({
  companyIdIdx: index("company_topics_company_id_idx").on(table.companyId),
}));

export const insertCompanyTopicSchema = createInsertSchema(companyTopics).omit({
  id: true,
});

export type InsertCompanyTopic = z.infer<typeof insertCompanyTopicSchema>;
export type CompanyTopic = typeof companyTopics.$inferSelect;

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
  lastLoginAt: text("last_login_at"),
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
  lastLoginAt: text("last_login_at"),
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

export const operatorProfileFields = pgTable("operator_profile_fields", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fieldName: text("field_name").notNull().unique(),
  fieldLabel: text("field_label").notNull(),
  isRequired: text("is_required").notNull().default('false'),
  weight: text("weight").notNull().default('1'),
}, (table) => ({
  fieldNameIdx: index("operator_profile_fields_field_name_idx").on(table.fieldName),
}));

export const insertOperatorProfileFieldSchema = createInsertSchema(operatorProfileFields).omit({
  id: true,
});

export type InsertOperatorProfileField = z.infer<typeof insertOperatorProfileFieldSchema>;
export type OperatorProfileField = typeof operatorProfileFields.$inferSelect;

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
  tags: text("tags").array(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at"),
  expiryDate: text("expiry_date"),
  vacancies: text("vacancies").notNull().default('1'),
  viewCount: text("view_count").notNull().default('0'),
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

export const applications = pgTable("applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  operatorId: varchar("operator_id").notNull().references(() => operators.id, { onDelete: 'cascade' }),
  status: text("status").notNull().default('pending'),
  appliedAt: text("applied_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  notes: text("notes"),
}, (table) => ({
  jobIdIdx: index("applications_job_id_idx").on(table.jobId),
  operatorIdIdx: index("applications_operator_id_idx").on(table.operatorId),
  statusIdx: index("applications_status_idx").on(table.status),
}));

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  appliedAt: true,
});

export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;

export const savedJobs = pgTable("saved_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  operatorId: varchar("operator_id").notNull().references(() => operators.id, { onDelete: 'cascade' }),
  jobId: varchar("job_id").notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  savedAt: text("saved_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  operatorIdIdx: index("saved_jobs_operator_id_idx").on(table.operatorId),
  jobIdIdx: index("saved_jobs_job_id_idx").on(table.jobId),
  uniqueSave: index("saved_jobs_unique_save").on(table.operatorId, table.jobId),
}));

export const insertSavedJobSchema = createInsertSchema(savedJobs).omit({
  id: true,
  savedAt: true,
});

export type InsertSavedJob = z.infer<typeof insertSavedJobSchema>;
export type SavedJob = typeof savedJobs.$inferSelect;

export const questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").references(() => companies.id, { onDelete: 'cascade' }),
  clientId: varchar("client_id").references(() => clients.id, { onDelete: 'cascade' }),
  questionText: text("question_text").notNull(),
  questionType: text("question_type").notNull(),
  options: text("options"),
  isActive: text("is_active").notNull().default('true'),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  companyIdIdx: index("questions_company_id_idx").on(table.companyId),
  clientIdIdx: index("questions_client_id_idx").on(table.clientId),
}));

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
  createdAt: true,
});

export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questions.$inferSelect;

export const jobQuestions = pgTable("job_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  questionId: varchar("question_id").notNull().references(() => questions.id, { onDelete: 'cascade' }),
  isRequired: text("is_required").notNull().default('false'),
  displayOrder: text("display_order"),
}, (table) => ({
  jobIdIdx: index("job_questions_job_id_idx").on(table.jobId),
  questionIdIdx: index("job_questions_question_id_idx").on(table.questionId),
}));

export const insertJobQuestionSchema = createInsertSchema(jobQuestions).omit({
  id: true,
});

export type InsertJobQuestion = z.infer<typeof insertJobQuestionSchema>;
export type JobQuestion = typeof jobQuestions.$inferSelect;

export type QuestionWithRequired = Question & { isRequired: string };

export const applicationAnswers = pgTable("application_answers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  applicationId: varchar("application_id").notNull().references(() => applications.id, { onDelete: 'cascade' }),
  questionId: varchar("question_id").notNull().references(() => questions.id, { onDelete: 'cascade' }),
  answerText: text("answer_text"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  applicationIdIdx: index("application_answers_application_id_idx").on(table.applicationId),
  questionIdIdx: index("application_answers_question_id_idx").on(table.questionId),
}));

export const insertApplicationAnswerSchema = createInsertSchema(applicationAnswers).omit({
  id: true,
  createdAt: true,
});

export type InsertApplicationAnswer = z.infer<typeof insertApplicationAnswerSchema>;
export type ApplicationAnswer = typeof applicationAnswers.$inferSelect;

export const siteVisits = pgTable("site_visits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ipAddress: text("ip_address").notNull(),
  country: text("country"),
  city: text("city"),
  region: text("region"),
  userAgent: text("user_agent"),
  visitedAt: text("visited_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  visitedAtIdx: index("site_visits_visited_at_idx").on(table.visitedAt),
  ipAddressIdx: index("site_visits_ip_address_idx").on(table.ipAddress),
}));

export const insertSiteVisitSchema = createInsertSchema(siteVisits).omit({
  id: true,
  visitedAt: true,
});

export type InsertSiteVisit = z.infer<typeof insertSiteVisitSchema>;
export type SiteVisit = typeof siteVisits.$inferSelect;

export const newsletterSubscriptions = pgTable("newsletter_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  subscribedAt: text("subscribed_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  isActive: text("is_active").notNull().default('true'),
}, (table) => ({
  emailIdx: index("newsletter_subscriptions_email_idx").on(table.email),
  subscribedAtIdx: index("newsletter_subscriptions_subscribed_at_idx").on(table.subscribedAt),
}));

export const insertNewsletterSubscriptionSchema = createInsertSchema(newsletterSubscriptions).omit({
  id: true,
  subscribedAt: true,
});

export type InsertNewsletterSubscription = z.infer<typeof insertNewsletterSubscriptionSchema>;
export type NewsletterSubscription = typeof newsletterSubscriptions.$inferSelect;

export const passwordResetCodes = pgTable("password_reset_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  code: text("code").notNull(),
  userType: text("user_type").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  expiresAt: text("expires_at").notNull(),
  isUsed: text("is_used").notNull().default('false'),
}, (table) => ({
  emailIdx: index("password_reset_codes_email_idx").on(table.email),
  codeIdx: index("password_reset_codes_code_idx").on(table.code),
  expiresAtIdx: index("password_reset_codes_expires_at_idx").on(table.expiresAt),
}));

export const insertPasswordResetCodeSchema = createInsertSchema(passwordResetCodes).omit({
  id: true,
  createdAt: true,
});

export type InsertPasswordResetCode = z.infer<typeof insertPasswordResetCodeSchema>;
export type PasswordResetCode = typeof passwordResetCodes.$inferSelect;

export const companyPlans = pgTable("company_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: 'cascade' }),
  planId: varchar("plan_id").notNull().references(() => plans.id),
  totalCredits: text("total_credits").notNull(),
  usedCredits: text("used_credits").notNull().default('0'),
  status: text("status").notNull().default('disponivel'),
  purchaseDate: text("purchase_date").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  companyIdIdx: index("company_plans_company_id_idx").on(table.companyId),
  statusIdx: index("company_plans_status_idx").on(table.status),
}));

export const insertCompanyPlanSchema = createInsertSchema(companyPlans).omit({
  id: true,
  purchaseDate: true,
});

export type InsertCompanyPlan = z.infer<typeof insertCompanyPlanSchema>;
export type CompanyPlan = typeof companyPlans.$inferSelect;

export const creditTransactions = pgTable("credit_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: 'cascade' }),
  type: text("type").notNull(),
  amount: text("amount").notNull(),
  description: text("description").notNull(),
  relatedPlanId: varchar("related_plan_id").references(() => plans.id),
  relatedCompanyPlanId: varchar("related_company_plan_id").references(() => companyPlans.id),
  relatedJobId: varchar("related_job_id").references(() => jobs.id),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  balanceAfter: text("balance_after").notNull(),
}, (table) => ({
  companyIdIdx: index("credit_transactions_company_id_idx").on(table.companyId),
  createdAtIdx: index("credit_transactions_created_at_idx").on(table.createdAt),
  typeIdx: index("credit_transactions_type_idx").on(table.type),
}));

export const insertCreditTransactionSchema = createInsertSchema(creditTransactions).omit({
  id: true,
  createdAt: true,
});

export type InsertCreditTransaction = z.infer<typeof insertCreditTransactionSchema>;
export type CreditTransaction = typeof creditTransactions.$inferSelect;

export const workTypes = pgTable("work_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  description: text("description"),
  isActive: text("is_active").notNull().default('true'),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  companyIdIdx: index("work_types_company_id_idx").on(table.companyId),
}));

export const insertWorkTypeSchema = createInsertSchema(workTypes).omit({
  id: true,
  createdAt: true,
});

export type InsertWorkType = z.infer<typeof insertWorkTypeSchema>;
export type WorkType = typeof workTypes.$inferSelect;

export const contractTypes = pgTable("contract_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  description: text("description"),
  isActive: text("is_active").notNull().default('true'),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  companyIdIdx: index("contract_types_company_id_idx").on(table.companyId),
}));

export const insertContractTypeSchema = createInsertSchema(contractTypes).omit({
  id: true,
  createdAt: true,
});

export type InsertContractType = z.infer<typeof insertContractTypeSchema>;
export type ContractType = typeof contractTypes.$inferSelect;

export const tags = pgTable("tags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  color: text("color"),
  isActive: text("is_active").notNull().default('true'),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  slugIdx: index("tags_slug_idx").on(table.slug),
}));

export const insertTagSchema = createInsertSchema(tags).omit({
  id: true,
  createdAt: true,
});

export type InsertTag = z.infer<typeof insertTagSchema>;
export type Tag = typeof tags.$inferSelect;

export const globalWorkTypes = pgTable("global_work_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  isActive: text("is_active").notNull().default('true'),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertGlobalWorkTypeSchema = createInsertSchema(globalWorkTypes).omit({
  id: true,
  createdAt: true,
});

export type InsertGlobalWorkType = z.infer<typeof insertGlobalWorkTypeSchema>;
export type GlobalWorkType = typeof globalWorkTypes.$inferSelect;

export const globalContractTypes = pgTable("global_contract_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  isActive: text("is_active").notNull().default('true'),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertGlobalContractTypeSchema = createInsertSchema(globalContractTypes).omit({
  id: true,
  createdAt: true,
});

export type InsertGlobalContractType = z.infer<typeof insertGlobalContractTypeSchema>;
export type GlobalContractType = typeof globalContractTypes.$inferSelect;
