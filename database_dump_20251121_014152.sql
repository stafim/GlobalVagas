--
-- PostgreSQL database dump
--

\restrict yi4hKOLFS409kxCIdUn28449O03ntoAKjL3wJOS91wtyoXlUHBW4shuDACpo5A7

-- Dumped from database version 16.9 (415ebe8)
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admins; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.admins (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.admins OWNER TO neondb_owner;

--
-- Name: application_answers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.application_answers (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    application_id character varying NOT NULL,
    question_id character varying NOT NULL,
    answer_text text,
    created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.application_answers OWNER TO neondb_owner;

--
-- Name: applications; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.applications (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    job_id character varying NOT NULL,
    operator_id character varying NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    applied_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
    notes text
);


ALTER TABLE public.applications OWNER TO neondb_owner;

--
-- Name: banners; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.banners (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    subtitle text,
    image_url text NOT NULL,
    link_url text,
    display_order text DEFAULT '0'::text NOT NULL,
    is_active text DEFAULT 'true'::text NOT NULL
);


ALTER TABLE public.banners OWNER TO neondb_owner;

--
-- Name: clients; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.clients (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_name text NOT NULL,
    cnpj text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    website text,
    contact_name text NOT NULL,
    contact_email text NOT NULL,
    contact_phone text NOT NULL,
    logo_url text,
    primary_color text DEFAULT '#8b5cf6'::text NOT NULL,
    secondary_color text DEFAULT '#a78bfa'::text NOT NULL,
    accent_color text DEFAULT '#c4b5fd'::text NOT NULL,
    is_active text DEFAULT 'true'::text NOT NULL
);


ALTER TABLE public.clients OWNER TO neondb_owner;

--
-- Name: companies; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.companies (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    company_name text NOT NULL,
    cnpj text NOT NULL,
    phone text NOT NULL,
    website text,
    description text,
    industry text,
    size text,
    logo_url text,
    about text,
    mission text,
    culture text,
    banner_url text
);


ALTER TABLE public.companies OWNER TO neondb_owner;

--
-- Name: email_settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.email_settings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    provider text NOT NULL,
    api_key text,
    sender_email text NOT NULL,
    sender_name text NOT NULL,
    smtp_host text,
    smtp_port text,
    smtp_user text,
    smtp_password text,
    is_active text DEFAULT 'true'::text NOT NULL
);


ALTER TABLE public.email_settings OWNER TO neondb_owner;

--
-- Name: events; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.events (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    event_date text NOT NULL,
    end_date text,
    location text NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    country text NOT NULL,
    is_free text DEFAULT 'true'::text NOT NULL,
    price text,
    cover_image_url text,
    organizer_name text NOT NULL,
    organizer_email text NOT NULL,
    organizer_phone text,
    website text,
    capacity text,
    category text,
    is_active text DEFAULT 'true'::text NOT NULL
);


ALTER TABLE public.events OWNER TO neondb_owner;

--
-- Name: experiences; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.experiences (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    operator_id character varying NOT NULL,
    company text NOT NULL,
    "position" text NOT NULL,
    start_date text NOT NULL,
    end_date text,
    is_current text DEFAULT 'false'::text NOT NULL,
    description text,
    location text
);


ALTER TABLE public.experiences OWNER TO neondb_owner;

--
-- Name: job_questions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.job_questions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    job_id character varying NOT NULL,
    question_id character varying NOT NULL,
    is_required text DEFAULT 'false'::text NOT NULL,
    display_order text
);


ALTER TABLE public.job_questions OWNER TO neondb_owner;

--
-- Name: jobs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.jobs (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying,
    client_id character varying,
    title text NOT NULL,
    description text NOT NULL,
    requirements text,
    responsibilities text,
    benefits text,
    location text NOT NULL,
    city text,
    state text,
    work_type text NOT NULL,
    contract_type text NOT NULL,
    salary text,
    salary_period text,
    sector_id character varying,
    subsector_id character varying,
    experience_level text,
    education_level text,
    status text DEFAULT 'active'::text NOT NULL,
    created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at text,
    expiry_date text,
    vacancies text DEFAULT '1'::text NOT NULL
);


ALTER TABLE public.jobs OWNER TO neondb_owner;

--
-- Name: operators; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.operators (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    full_name text NOT NULL,
    cpf text NOT NULL,
    phone text NOT NULL,
    birth_date text,
    profession text NOT NULL,
    experience_years text,
    certifications text,
    availability text,
    preferred_location text,
    work_type text,
    skills text,
    bio text,
    profile_photo_url text
);


ALTER TABLE public.operators OWNER TO neondb_owner;

--
-- Name: plans; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.plans (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    price text NOT NULL,
    vacancy_quantity text NOT NULL,
    features text NOT NULL,
    is_active text DEFAULT 'true'::text NOT NULL
);


ALTER TABLE public.plans OWNER TO neondb_owner;

--
-- Name: purchases; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.purchases (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    client_id character varying NOT NULL,
    plan_id character varying NOT NULL,
    purchase_date text NOT NULL,
    expiry_date text NOT NULL,
    amount text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    payment_method text,
    transaction_id text
);


ALTER TABLE public.purchases OWNER TO neondb_owner;

--
-- Name: questions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.questions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying,
    client_id character varying,
    question_text text NOT NULL,
    question_type text NOT NULL,
    options text,
    is_active text DEFAULT 'true'::text NOT NULL,
    created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.questions OWNER TO neondb_owner;

--
-- Name: sectors; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sectors (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    is_active text DEFAULT 'true'::text NOT NULL
);


ALTER TABLE public.sectors OWNER TO neondb_owner;

--
-- Name: settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.settings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    value text NOT NULL
);


ALTER TABLE public.settings OWNER TO neondb_owner;

--
-- Name: subsectors; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.subsectors (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    sector_id character varying NOT NULL,
    name text NOT NULL,
    description text,
    is_active text DEFAULT 'true'::text NOT NULL
);


ALTER TABLE public.subsectors OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    username text NOT NULL,
    password text NOT NULL
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.admins (id, email, password, name) FROM stdin;
c0770673-4b2f-44dd-a9b7-f54456f16424	admin@operlist.com	admin123	Administrador
\.


--
-- Data for Name: application_answers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.application_answers (id, application_id, question_id, answer_text, created_at) FROM stdin;
\.


--
-- Data for Name: applications; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.applications (id, job_id, operator_id, status, applied_at, notes) FROM stdin;
74d32698-5565-49a2-af24-3b4b4c7dc1bf	423def7a-4129-4c17-bf45-b64325e9f155	260cd458-aab1-470c-8907-669f14e7eb4c	pending	2025-11-20 20:46:02.903489+00	\N
054e3709-79ae-47e6-bbf8-e62186dc5037	683b92e7-cd09-41c2-b5ea-e2de881375ed	c266d20e-b84a-46a0-8542-e92f78d8aa7a	pending	2025-11-20 23:46:08.466165+00	Tenho 10 anos de experiência com guindastes.
c019b16c-8f52-4c8f-959e-844999f8c941	683b92e7-cd09-41c2-b5ea-e2de881375ed	260cd458-aab1-470c-8907-669f14e7eb4c	pending	2025-11-20 23:46:08.466165+00	Estou disponível para começar imediatamente.
fe5f6ea0-5e72-43b9-8d8c-9253d49060d5	2ee0f1ac-8146-4573-af3a-36495c87ec94	c266d20e-b84a-46a0-8542-e92f78d8aa7a	pending	2025-11-20 23:46:08.466165+00	Especialista em empilhadeiras.
44142aac-7082-4b3a-94ca-600b080f21df	0cb59fe9-909b-4c35-93e5-3901cdc73abc	260cd458-aab1-470c-8907-669f14e7eb4c	pending	2025-11-20 23:51:42.845603+00	\N
\.


--
-- Data for Name: banners; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.banners (id, title, subtitle, image_url, link_url, display_order, is_active) FROM stdin;
130e0eff-17b9-4119-ac26-56a0bab83fe1	Agitaí APP	Agitaí no seu evento	/objects/uploads/77581356-3b0e-402d-9384-dd10a7656b5b	www.agitai.com.br	1	true
17ef1b07-1206-4306-af4e-d47100574a22	Mineração na Amazonia	Mineração na grande amazonia	/objects/uploads/586c289b-d85c-4b6e-a87d-942132aab756	www.agitai.com.br	2	true
17c14fda-55e9-4f48-a6aa-48691ef6bfd3	Tecnologia em Máquinas	Máquinas	/objects/uploads/f4905d79-7b79-4fb4-b0d7-9f8c0aeb4401	www.agitai.com.br	3	true
\.


--
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.clients (id, company_name, cnpj, email, phone, website, contact_name, contact_email, contact_phone, logo_url, primary_color, secondary_color, accent_color, is_active) FROM stdin;
e0b63735-f60e-4a0f-9a46-2a0e741a3dc3	OTD Transportes	392832983289	contato@pesaequipamentos.com.br	41992392227	www.agitai.com.br	Ricardo	contato@pesaequipamentos.com.br	41992392227	/objects/uploads/031db20b-7e12-4db7-850e-3b7eadfe884e	#8b5cf6	#a78bfa	#c4b5fd	true
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.companies (id, email, password, company_name, cnpj, phone, website, description, industry, size, logo_url, about, mission, culture, banner_url) FROM stdin;
e1b28cd1-f83f-4bd3-8907-5060d6b2d250	empresa@teste.com	senha123	Empresa Teste	12.345.678/0001-90	(11) 98765-4321	\N	\N	\N	\N	\N	\N	\N	\N	\N
b65dc97a-ec09-4462-8c49-13d0683d63f3	renato@vale.com.gg	tq62md88	Vale	465645465456	41992392227	www.vale.com.br	Vale mineradora	industria	11-50	/objects/uploads/2356eb3c-0452-4044-8aac-506c2fae2910	A Vale é uma das maiores mineradoras globais, comprometida com uma mineração mais segura e sustentável. Atuamos também em logística, energia e siderurgia\n	Acreditamos que a mineração é essencial para o desenvolvimento do mundo e só servimos à sociedade ao gerar prosperidade para todos e cuidar do planeta.	Investimos em times diversos e estamos comprometidos com a inclusão porque acreditamos que só desta forma vamos caminhar para uma mineração mais inovadora, sustentável e eficiente. Conheça as pessoas que fazem parte dessa história.	/objects/uploads/06e62827-b88f-40c0-a025-4bba4e3e9b37
\.


--
-- Data for Name: email_settings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.email_settings (id, provider, api_key, sender_email, sender_name, smtp_host, smtp_port, smtp_user, smtp_password, is_active) FROM stdin;
54a129b6-891b-4378-beb1-fa87b7c9c170	smtp	\N	replitvagas@gmail.com	Operlist	smtp.gmail.com	587	replitvagas@gmail.com	gfsp cawf lzwa wrhx	true
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.events (id, title, description, event_date, end_date, location, address, city, state, country, is_free, price, cover_image_url, organizer_name, organizer_email, organizer_phone, website, capacity, category, is_active) FROM stdin;
ae6f5f91-9973-41ac-9537-6257208b36fe	Workshop: Operação Segura de Equipamentos Pesados	Workshop intensivo de 2 dias focado em treinamento prático para operação de escavadeiras, retroescavadeiras e carregadeiras. Instrutores certificados e equipamentos de última geração. Inclui certificado reconhecido nacionalmente.	2026-02-20	2026-02-21	Centro de Treinamento TechMaq	Rodovia BR-381, Km 450	Itabira	MG	Brasil	false	890.00	attached_assets/generated_images/heavy_machinery_training_workshop.png	TechMaq Treinamentos	treinamento@techmaq.com.br	(31) 3842-5500	https://www.techmaq.com.br/workshops	30	Workshop	true
98edd60b-c3e0-459c-aafe-87ccfba39725	Expo Mineração & Tecnologia 2025	A maior feira de equipamentos de mineração da América Latina. Apresentação das mais recentes tecnologias em escavadeiras, caminhões fora de estrada, perfuratrizes e sistemas de automação. Oportunidade única para conhecer fornecedores, fabricantes e especialistas do setor.	2026-03-15	2026-03-18	Centro de Convenções Expo Minas	Av. Amazonas, 7600 - Gameleira	Belo Horizonte	MG	Brasil	false	150.00	attached_assets/generated_images/mining_equipment_trade_show.png	Associação Brasileira de Mineração	contato@expomineracao.com.br	(31) 3555-8000	https://www.expomineracao.com.br	5000	Feira	true
82335f0a-5b81-400e-a630-d8bf62840393	Congresso Internacional de Mineração	Evento internacional reunindo líderes do setor de mineração. Palestras sobre sustentabilidade, inovação tecnológica, automação de processos e segurança operacional. Exposição de equipamentos de grande porte e networking com empresas multinacionais.	2026-04-10	2026-04-13	ExpoCenter Norte	Rua José Bernardo Pinto, 333 - Vila Guilherme	São Paulo	SP	Brasil	false	450.00	attached_assets/generated_images/mining_industry_conference.png	IBRAM - Instituto Brasileiro de Mineração	eventos@ibram.org.br	(61) 3704-1100	https://www.congressomineracao.org.br	3000	Congresso	true
2871dd5b-26c7-4b61-bb1e-6983b59e9139	Agitaí Workshop	Workshop de música com Matheus KUD.	2025-11-21	2025-11-20	Expo Campo Largo	Rua Ubaldino do Amaral, 300	Curitiba	PR	Brasil	true		/objects/uploads/817e725d-5c0c-48f4-b7fa-f7c2d4fc262b	Matheus	kud@gmail.com	41992392227	www.agitai.com.br	50	Workshop	true
3198b8c6-244c-4f48-9226-3ffc78db77c3	Feira de Tecnologia para Mineração Subterrânea	Evento especializado em soluções para mineração subterrânea. Demonstração de perfuratrizes, veículos de transporte subterrâneo, sistemas de ventilação e equipamentos de segurança. Área dedicada a inovações em automação e controle remoto.	2026-05-22	2026-05-24	Parque de Exposições do Anhembi	Av. Olavo Fontoura, 1209 - Santana	São Paulo	SP	Brasil	false	200.00	attached_assets/generated_images/underground_mining_tech_fair.png	MiningTech Brasil	contato@miningtech.com.br	(11) 2226-3400	https://www.miningtech.com.br	2500	Feira	true
674ebca1-bfa1-4015-ad21-2511e2ba50ae	Expo Máquinas Pesadas & Construção	Grande exposição de equipamentos de construção e mineração. Bulldozers, pás carregadeiras, caminhões articulados, escavadeiras hidráulicas e dumpers de grande porte. Demonstrações ao vivo, test drives e condições especiais de financiamento.	2026-06-05	2026-06-08	Riocentro	Av. Salvador Allende, 6555 - Barra da Tijuca	Rio de Janeiro	RJ	Brasil	true	\N	attached_assets/generated_images/construction_equipment_expo.png	SOBRATEMA - Associação Brasileira de Tecnologia para Construção e Mineração	eventos@sobratema.org.br	(21) 3139-8200	https://www.expomaquinaspesadas.com.br	10000	Feira	true
\.


--
-- Data for Name: experiences; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.experiences (id, operator_id, company, "position", start_date, end_date, is_current, description, location) FROM stdin;
9572b6aa-3b6c-4a1c-bf47-dfd60d7dd202	260cd458-aab1-470c-8907-669f14e7eb4c	Pesa equipamentos	Operador	2005-06	2006-01	false	operador de empilhadeira	Curitiba - PR
b8408c53-7cba-4121-bd6c-ff6206754b2f	260cd458-aab1-470c-8907-669f14e7eb4c	Vetel equipamentos	Operador SR	2007-06	2025-12	false	Operador SR	Curitiba - PR
\.


--
-- Data for Name: job_questions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.job_questions (id, job_id, question_id, is_required, display_order) FROM stdin;
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.jobs (id, company_id, client_id, title, description, requirements, responsibilities, benefits, location, city, state, work_type, contract_type, salary, salary_period, sector_id, subsector_id, experience_level, education_level, status, created_at, updated_at, expiry_date, vacancies) FROM stdin;
683b92e7-cd09-41c2-b5ea-e2de881375ed	e1b28cd1-f83f-4bd3-8907-5060d6b2d250	\N	Operador de Guindaste Sênior	Procuramos operador experiente para operar guindaste em obras de grande porte. Responsável por movimentação de cargas pesadas com segurança.	- Certificação NR-11\n- 5 anos de experiência\n- Carteira de habilitação categoria C	- Operar guindaste conforme normas de segurança\n- Fazer inspeções diárias\n- Preencher checklist	- Vale transporte\n- Vale refeição\n- Plano de saúde	São Paulo, SP	São Paulo	SP	presencial	clt	R$ 6.500,00	mensal	\N	\N	senior	medio	active	2025-11-17 19:17:18.220185+00	\N	\N	2
2ee0f1ac-8146-4573-af3a-36495c87ec94	e1b28cd1-f83f-4bd3-8907-5060d6b2d250	\N	Operador de Empilhadeira	Vaga para operador de empilhadeira em centro de distribuição. Turno diurno.	- CNH categoria B\n- Curso de operador de empilhadeira\n- Experiência mínima de 1 ano	\N	\N	Santos, SP	\N	\N	presencial	clt	R$ 3.200,00	\N	\N	\N	junior	\N	active	2025-11-17 19:18:18.502665+00	\N	\N	3
6148daf6-9c3c-41d0-990e-c51f03752200	b65dc97a-ec09-4462-8c49-13d0683d63f3	\N	Operador de Empilhadeira SR	Operador  de máquinas pesadas 	Experiencia de 5 anos como operador	Digirir, empilhar, caminhar.		São José dos Pinhais, PR	São José dos Pinhais	PR	presencial	pj		mensal	\N	\N			active	2025-11-17 19:39:02.98913+00	\N	\N	1
0cb59fe9-909b-4c35-93e5-3901cdc73abc	b65dc97a-ec09-4462-8c49-13d0683d63f3	\N	Operador de Maquina II	adsadsdsaasdadsdasasddas	adsadsadsasdadsdasadsdas	adsasdadsasdasdadsdasadsdas	adsadsadsadsadsasdasd	Curitiba, PR	Curitiba	PR	presencial	clt	1300	mensal	\N	\N	pleno	tecnico	active	2025-11-17 19:54:49.227654+00	\N	\N	1
423def7a-4129-4c17-bf45-b64325e9f155	b65dc97a-ec09-4462-8c49-13d0683d63f3	\N	Empilhador Senior	Teste vagasddfkjfdksj	teste vagate te ett e	kjfsdjkfdskjsdfjksdfkjfsd	rerewrewwererw	Curitiba, PR	Curitiba	PR	presencial	pj	1300	mensal	\N	\N	especialista	tecnico	active	2025-11-18 00:15:25.765269+00	2025-11-20T18:29:40.522Z	\N	1
46277eb1-012b-4ca4-a688-596ac2a0b872	b65dc97a-ec09-4462-8c49-13d0683d63f3	\N	Operado de Retroescavadeira	teste bvagafeefefefef	teste vbafefeefef	teste bagaeffefeef		São Paulo, SP	São Paulo	SP	presencial	clt		mensal	\N	\N			active	2025-11-17 19:52:17.796936+00	2025-11-20T18:29:53.809Z	\N	1
78551c5d-e986-40c4-bebb-e96256675add	b65dc97a-ec09-4462-8c49-13d0683d63f3	\N	Operador Junior	Opção 1 (Foco na Eficiência):\n\nVenha fazer parte do nosso time como Operador(a de Empilhadeira! Buscamos um profissional ágil e atencioso para garantir a movimentação e o armazenamento eficiente de materiais em nosso estoque/armazém. Sua atuação é vital para a fluidez da nossa operação logística.\n\nOpção 2 (Foco na Segurança):\n\nOportunidade para Operador(a de Empilhadeira! Se você valoriza a segurança e possui experiência na operação de equipamentos, venha trabalhar conosco. Você será responsável por manusear, carregar e descarregar mercadorias, mantendo a organização e a integridade dos produtos.	Opção 1 (Listagem Objetiva):\n\nEnsino Médio completo.\n\nExperiência comprovada na função.\n\nCurso de Operador de Empilhadeira válido (NR-11).\n\nCNH Categoria B (ou superior) em dia.\n\nDisponibilidade para turnos (se aplicável).\n\nOpção 2 (Foco em Habilidades):\n\nPara esta vaga, é essencial ter Curso de Operador de Empilhadeira (NR-11) e CNH válida. Buscamos candidatos com experiência prévia, forte atenção à segurança e habilidade para trabalhar em equipe e sob pressão em um ambiente de armazém.	Responsabilidades (Responsibilities)\nOpção 1 (Foco nas Tarefas Diárias):\n\nAs responsabilidades incluem a operação segura da empilhadeira para carregar e descarregar caminhões, transportar materiais entre as áreas de produção e armazenamento, e empilhar paletes de forma organizada e segura.\n\nOpção 2 (Foco em Processo e Cuidado):\n\nVocê será responsável por realizar a inspeção diária (checklist) do equipamento antes do uso, movimentar o estoque seguindo as normas da empresa e garantir a precisão na separação e no endereçamento de materiais. É obrigatório zelar pela sua segurança e a dos colegas.	💰 Benefícios (Benefits)\nAqui estão algumas opções de benefícios comuns e atrativos que você pode incluir na sua vaga de Operador de Empilhadeira:\n\n🌟 Benefícios Essenciais (Básicos)\nSalário: Compatível com o mercado e a experiência.\n\nVale Transporte (VT): Cobertura total ou parcial do deslocamento.\n\nVale Alimentação (VA) / Vale Refeição (VR): Para despesas com alimentação.\n\nSeguro de Vida: Proteção financeira para o colaborador e a família.\n\n📈 Benefícios de Desenvolvimento e Performance\nPlano de Carreira: Oportunidades de crescimento e desenvolvimento profissional na área de Logística.\n\nTreinamentos e Reciclagem: Investimento em cursos e atualizações para a função (ex: novas certificações NR-11).\n\nParticipação nos Lucros e Resultados (PLR): Ganhos extras atrelados ao desempenho da	São José dos Pinhais, PR	São José dos Pinhais	PR	presencial	clt	5000	mensal	\N	\N	especialista	tecnico	suspended	2025-11-20 18:11:11.076415+00	2025-11-20T20:43:48.232Z	\N	5
3d72e782-b87e-4652-8905-bf7296b14fc8	b65dc97a-ec09-4462-8c49-13d0683d63f3	\N	Operador II	Descrição da Vaga (Job Description)\nOpção 1 (Foco na Eficiência):\n\nVenha fazer parte do nosso time como Operador(a de Empilhadeira! Buscamos um profissional ágil e atencioso para garantir a movimentação e o armazenamento eficiente de materiais em nosso estoque/armazém. Sua atuação é vital para a fluidez da nossa operação logística.\n\nOpção 2 (Foco na Segurança):\n\nOportunidade para Operador(a de Empilhadeira! Se você valoriza a segurança e possui experiência na operação de equipamentos, venha trabalhar conosco. Você será responsável por manusear, carregar e descarregar mercadorias, mantendo a organização e a integridade dos produtos.	Requisitos (Requirements)\nOpção 1 (Listagem Objetiva):\n\nEnsino Médio completo.\n\nExperiência comprovada na função.\n\nCurso de Operador de Empilhadeira válido (NR-11).\n\nCNH Categoria B (ou superior) em dia.\n\nDisponibilidade para turnos (se aplicável).\n\nOpção 2 (Foco em Habilidades):\n\nPara esta vaga, é essencial ter Curso de Operador de Empilhadeira (NR-11) e CNH válida. Buscamos candidatos com experiência prévia, forte atenção à segurança e habilidade para trabalhar em equipe e sob pressão em um ambiente de armazém.	Responsabilidades (Responsibilities)\nOpção 1 (Foco nas Tarefas Diárias):\n\nAs responsabilidades incluem a operação segura da empilhadeira para carregar e descarregar caminhões, transportar materiais entre as áreas de produção e armazenamento, e empilhar paletes de forma organizada e segura.\n\nOpção 2 (Foco em Processo e Cuidado):\n\nVocê será responsável por realizar a inspeção diária (checklist) do equipamento antes do uso, movimentar o estoque seguindo as normas da empresa e garantir a precisão na separação e no endereçamento de materiais. É obrigatório zelar pela sua segurança e a dos colegas.	Benefícios (Benefits)\nAqui estão algumas opções de benefícios comuns e atrativos que você pode incluir na sua vaga de Operador de Empilhadeira:\n\n🌟 Benefícios Essenciais (Básicos)\nSalário: Compatível com o mercado e a experiência.\n\nVale Transporte (VT): Cobertura total ou parcial do deslocamento.\n\nVale Alimentação (VA) / Vale Refeição (VR): Para despesas com alimentação.\n\nSeguro de Vida: Proteção financeira para o colaborador e a família.\n\n📈 Benefícios de Desenvolvimento e Performance\nPlano de Carreira: Oportunidades de crescimento e desenvolvimento profissional na área de Logística.\n\nTreinamentos e Reciclagem: Investimento em cursos e atualizações para a função (ex: novas certificações NR-11).\n\nParticipação nos Lucros e Resultados (PLR): Ganhos extras atrelados ao desempenho da empresa.\n\n🛡️ Benefícios de Saúde e Bem-Estar\nAssistência Médica: Plano de saúde (com ou sem coparticipação).\n\nAssistência Odontológica: Plano odontológico.\n\nConvênio com Farmácias: Descontos em medicamentos.	Araguaína, TO	Araguaína	TO	hibrido	temporario	2600,00	mensal	\N	\N	especialista	pos	active	2025-11-21 00:32:15.844721+00	\N	\N	1
\.


--
-- Data for Name: operators; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.operators (id, email, password, full_name, cpf, phone, birth_date, profession, experience_years, certifications, availability, preferred_location, work_type, skills, bio, profile_photo_url) FROM stdin;
c266d20e-b84a-46a0-8542-e92f78d8aa7a	stafim2@gmail.com	tq62md88	Ricardo Stafim	05458000994	419923922227	1987-02-01	Especialista em Empilhadeira	5-10	C12, C13, G34	30-dias	Curitiba - PR	remoto	Mto foda na empilhas.	João Silva (35): Dedicado operador de empilhadeira com 10 anos de experiência. Habilidoso em movimentação de cargas, segurança em armazéns e controle de estoque. Certificado e focado na eficiência operacional e zero acidentes.	\N
260cd458-aab1-470c-8907-669f14e7eb4c	operador@gmail.com	tq62md88	Ricardo Operador	74482655040	41992392227	1987-02-01	Operador de Empilhadeira	3-5	C12				🛠️ O Maestro da Logística: Operador de Empilhadeira 🛠️\nO operador de empilhadeira é um profissional	Sou especialista em operaçao de máquinas empilhadeiras	/objects/uploads/40aca9ee-27fe-4212-ad00-6c9db576f92c
\.


--
-- Data for Name: plans; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.plans (id, name, description, price, vacancy_quantity, features, is_active) FROM stdin;
ddc481ba-11f0-4696-8c17-e914db87aa0a	1 vaga	compra de 1 vaga	99,00	1	comprar 1 vaga	true
\.


--
-- Data for Name: purchases; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.purchases (id, client_id, plan_id, purchase_date, expiry_date, amount, status, payment_method, transaction_id) FROM stdin;
\.


--
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.questions (id, company_id, client_id, question_text, question_type, options, is_active, created_at) FROM stdin;
f5b59ec1-6d2b-4f26-8ad1-2fa41d019050	b65dc97a-ec09-4462-8c49-13d0683d63f3	\N	Voce prerere ?	multiple_choice	Praia\nCampo\nPiscina\nMontanhas	true	2025-11-21 00:16:07.033217+00
\.


--
-- Data for Name: sectors; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sectors (id, name, description, is_active) FROM stdin;
3dede1ad-d38e-474a-a5bb-afeef510d25f	Mineração		true
387e5ad7-a226-4266-828f-c74253fe805f	Linha Amarela		true
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.settings (id, key, value) FROM stdin;
573f601c-1d1a-4ad2-97c3-b291a9e88650	visit_counter_total	27
1f7de0f1-1f61-45d0-884b-1241e6832d37	visit_counter_today	8
f554ce51-bcaf-4da2-9f2d-c70824225e4a	hero_title	Encontre seu Emprego em qualquer lugar do MUNDO !
4b6cfbc6-d644-4aa6-b0ac-e5e5bc751644	hero_subtitle	Mais de 40.000 vagas em 130+ países
2a9b8f3b-120c-49ea-987b-3d4a62968402	visit_counter_date	2025-11-21
\.


--
-- Data for Name: subsectors; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.subsectors (id, sector_id, name, description, is_active) FROM stdin;
38146ecd-9451-4b1f-a131-1dc83da4a6b8	3dede1ad-d38e-474a-a5bb-afeef510d25f	Veiculos pesados		true
aa9d8742-482d-48ba-afc2-d91931a32dce	387e5ad7-a226-4266-828f-c74253fe805f	Empilhadeira		true
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, username, password) FROM stdin;
\.


--
-- Name: admins admins_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_email_unique UNIQUE (email);


--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);


--
-- Name: application_answers application_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.application_answers
    ADD CONSTRAINT application_answers_pkey PRIMARY KEY (id);


--
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- Name: banners banners_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.banners
    ADD CONSTRAINT banners_pkey PRIMARY KEY (id);


--
-- Name: clients clients_cnpj_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_cnpj_unique UNIQUE (cnpj);


--
-- Name: clients clients_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_email_unique UNIQUE (email);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: companies companies_cnpj_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_cnpj_unique UNIQUE (cnpj);


--
-- Name: companies companies_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_email_unique UNIQUE (email);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: email_settings email_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.email_settings
    ADD CONSTRAINT email_settings_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: experiences experiences_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.experiences
    ADD CONSTRAINT experiences_pkey PRIMARY KEY (id);


--
-- Name: job_questions job_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.job_questions
    ADD CONSTRAINT job_questions_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: operators operators_cpf_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.operators
    ADD CONSTRAINT operators_cpf_unique UNIQUE (cpf);


--
-- Name: operators operators_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.operators
    ADD CONSTRAINT operators_email_unique UNIQUE (email);


--
-- Name: operators operators_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.operators
    ADD CONSTRAINT operators_pkey PRIMARY KEY (id);


--
-- Name: plans plans_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.plans
    ADD CONSTRAINT plans_pkey PRIMARY KEY (id);


--
-- Name: purchases purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_pkey PRIMARY KEY (id);


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);


--
-- Name: sectors sectors_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sectors
    ADD CONSTRAINT sectors_pkey PRIMARY KEY (id);


--
-- Name: settings settings_key_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_key_unique UNIQUE (key);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: subsectors subsectors_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.subsectors
    ADD CONSTRAINT subsectors_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: admins_email_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX admins_email_idx ON public.admins USING btree (email);


--
-- Name: application_answers_application_id_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX application_answers_application_id_idx ON public.application_answers USING btree (application_id);


--
-- Name: application_answers_question_id_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX application_answers_question_id_idx ON public.application_answers USING btree (question_id);


--
-- Name: applications_job_id_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX applications_job_id_idx ON public.applications USING btree (job_id);


--
-- Name: applications_operator_id_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX applications_operator_id_idx ON public.applications USING btree (operator_id);


--
-- Name: applications_status_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX applications_status_idx ON public.applications USING btree (status);


--
-- Name: banners_display_order_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX banners_display_order_idx ON public.banners USING btree (display_order);


--
-- Name: clients_cnpj_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX clients_cnpj_idx ON public.clients USING btree (cnpj);


--
-- Name: clients_email_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX clients_email_idx ON public.clients USING btree (email);


--
-- Name: companies_cnpj_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX companies_cnpj_idx ON public.companies USING btree (cnpj);


--
-- Name: companies_email_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX companies_email_idx ON public.companies USING btree (email);


--
-- Name: events_city_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX events_city_idx ON public.events USING btree (city);


--
-- Name: events_event_date_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX events_event_date_idx ON public.events USING btree (event_date);


--
-- Name: job_questions_job_id_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX job_questions_job_id_idx ON public.job_questions USING btree (job_id);


--
-- Name: job_questions_question_id_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX job_questions_question_id_idx ON public.job_questions USING btree (question_id);


--
-- Name: jobs_client_id_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX jobs_client_id_idx ON public.jobs USING btree (client_id);


--
-- Name: jobs_company_id_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX jobs_company_id_idx ON public.jobs USING btree (company_id);


--
-- Name: jobs_sector_id_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX jobs_sector_id_idx ON public.jobs USING btree (sector_id);


--
-- Name: jobs_status_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX jobs_status_idx ON public.jobs USING btree (status);


--
-- Name: operators_cpf_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX operators_cpf_idx ON public.operators USING btree (cpf);


--
-- Name: operators_email_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX operators_email_idx ON public.operators USING btree (email);


--
-- Name: purchases_client_id_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX purchases_client_id_idx ON public.purchases USING btree (client_id);


--
-- Name: questions_client_id_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX questions_client_id_idx ON public.questions USING btree (client_id);


--
-- Name: questions_company_id_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX questions_company_id_idx ON public.questions USING btree (company_id);


--
-- Name: sectors_name_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX sectors_name_idx ON public.sectors USING btree (name);


--
-- Name: settings_key_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX settings_key_idx ON public.settings USING btree (key);


--
-- Name: subsectors_name_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX subsectors_name_idx ON public.subsectors USING btree (name);


--
-- Name: subsectors_sector_id_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX subsectors_sector_id_idx ON public.subsectors USING btree (sector_id);


--
-- Name: application_answers application_answers_application_id_applications_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.application_answers
    ADD CONSTRAINT application_answers_application_id_applications_id_fk FOREIGN KEY (application_id) REFERENCES public.applications(id) ON DELETE CASCADE;


--
-- Name: application_answers application_answers_question_id_questions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.application_answers
    ADD CONSTRAINT application_answers_question_id_questions_id_fk FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;


--
-- Name: applications applications_job_id_jobs_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_job_id_jobs_id_fk FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: applications applications_operator_id_operators_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_operator_id_operators_id_fk FOREIGN KEY (operator_id) REFERENCES public.operators(id) ON DELETE CASCADE;


--
-- Name: experiences experiences_operator_id_operators_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.experiences
    ADD CONSTRAINT experiences_operator_id_operators_id_fk FOREIGN KEY (operator_id) REFERENCES public.operators(id) ON DELETE CASCADE;


--
-- Name: job_questions job_questions_job_id_jobs_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.job_questions
    ADD CONSTRAINT job_questions_job_id_jobs_id_fk FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: job_questions job_questions_question_id_questions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.job_questions
    ADD CONSTRAINT job_questions_question_id_questions_id_fk FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;


--
-- Name: jobs jobs_client_id_clients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_client_id_clients_id_fk FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: jobs jobs_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: jobs jobs_sector_id_sectors_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_sector_id_sectors_id_fk FOREIGN KEY (sector_id) REFERENCES public.sectors(id);


--
-- Name: jobs jobs_subsector_id_subsectors_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_subsector_id_subsectors_id_fk FOREIGN KEY (subsector_id) REFERENCES public.subsectors(id);


--
-- Name: purchases purchases_client_id_clients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_client_id_clients_id_fk FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: purchases purchases_plan_id_plans_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_plan_id_plans_id_fk FOREIGN KEY (plan_id) REFERENCES public.plans(id);


--
-- Name: questions questions_client_id_clients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_client_id_clients_id_fk FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: questions questions_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: subsectors subsectors_sector_id_sectors_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.subsectors
    ADD CONSTRAINT subsectors_sector_id_sectors_id_fk FOREIGN KEY (sector_id) REFERENCES public.sectors(id) ON DELETE CASCADE;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

\unrestrict yi4hKOLFS409kxCIdUn28449O03ntoAKjL3wJOS91wtyoXlUHBW4shuDACpo5A7

