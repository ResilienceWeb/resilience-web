--
-- PostgreSQL database dump
--

-- Dumped from database version 13.5
-- Dumped by pg_dump version 13.2

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
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: prisma-crw
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO "prisma-crw";

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: prisma-crw
--

CREATE TABLE public.accounts (
    id integer NOT NULL,
    compound_id text NOT NULL,
    user_id integer NOT NULL,
    provider_type text NOT NULL,
    provider_id text NOT NULL,
    provider_account_id text NOT NULL,
    refresh_token text,
    access_token text,
    access_token_expires timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.accounts OWNER TO "prisma-crw";

--
-- Name: accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: prisma-crw
--

CREATE SEQUENCE public.accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.accounts_id_seq OWNER TO "prisma-crw";

--
-- Name: accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prisma-crw
--

ALTER SEQUENCE public.accounts_id_seq OWNED BY public.accounts.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: prisma-crw
--

CREATE TABLE public.categories (
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    label text NOT NULL,
    color text DEFAULT 'f1f1f1'::text,
    id integer NOT NULL
);


ALTER TABLE public.categories OWNER TO "prisma-crw";

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: prisma-crw
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.categories_id_seq OWNER TO "prisma-crw";

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prisma-crw
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: edit_permissions; Type: TABLE; Schema: public; Owner: prisma-crw
--

CREATE TABLE public.edit_permissions (
    id integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "listingId" integer NOT NULL,
    email text DEFAULT 'TOREPLACE'::text NOT NULL
);


ALTER TABLE public.edit_permissions OWNER TO "prisma-crw";

--
-- Name: edit_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: prisma-crw
--

CREATE SEQUENCE public.edit_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.edit_permissions_id_seq OWNER TO "prisma-crw";

--
-- Name: edit_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prisma-crw
--

ALTER SEQUENCE public.edit_permissions_id_seq OWNED BY public.edit_permissions.id;


--
-- Name: listings; Type: TABLE; Schema: public; Owner: prisma-crw
--

CREATE TABLE public.listings (
    id integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    title text NOT NULL,
    website text,
    description text,
    facebook text,
    twitter text,
    instagram text,
    email text,
    notes text,
    inactive boolean DEFAULT false NOT NULL,
    seeking_volunteers boolean,
    "categoryId" integer,
    image text,
    slug text
);


ALTER TABLE public.listings OWNER TO "prisma-crw";

--
-- Name: listings_id_seq; Type: SEQUENCE; Schema: public; Owner: prisma-crw
--

CREATE SEQUENCE public.listings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.listings_id_seq OWNER TO "prisma-crw";

--
-- Name: listings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prisma-crw
--

ALTER SEQUENCE public.listings_id_seq OWNED BY public.listings.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: prisma-crw
--

CREATE TABLE public.sessions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    expires timestamp(3) without time zone NOT NULL,
    session_token text NOT NULL,
    access_token text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.sessions OWNER TO "prisma-crw";

--
-- Name: sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: prisma-crw
--

CREATE SEQUENCE public.sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sessions_id_seq OWNER TO "prisma-crw";

--
-- Name: sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prisma-crw
--

ALTER SEQUENCE public.sessions_id_seq OWNED BY public.sessions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: prisma-crw
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name text,
    email text,
    email_verified timestamp(3) without time zone,
    image text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    admin boolean DEFAULT false NOT NULL
);


ALTER TABLE public.users OWNER TO "prisma-crw";

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: prisma-crw
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO "prisma-crw";

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prisma-crw
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: verification_requests; Type: TABLE; Schema: public; Owner: prisma-crw
--

CREATE TABLE public.verification_requests (
    id integer NOT NULL,
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.verification_requests OWNER TO "prisma-crw";

--
-- Name: verification_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: prisma-crw
--

CREATE SEQUENCE public.verification_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.verification_requests_id_seq OWNER TO "prisma-crw";

--
-- Name: verification_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prisma-crw
--

ALTER SEQUENCE public.verification_requests_id_seq OWNED BY public.verification_requests.id;


--
-- Name: accounts id; Type: DEFAULT; Schema: public; Owner: prisma-crw
--

ALTER TABLE ONLY public.accounts ALTER COLUMN id SET DEFAULT nextval('public.accounts_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: prisma-crw
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: edit_permissions id; Type: DEFAULT; Schema: public; Owner: prisma-crw
--

ALTER TABLE ONLY public.edit_permissions ALTER COLUMN id SET DEFAULT nextval('public.edit_permissions_id_seq'::regclass);


--
-- Name: listings id; Type: DEFAULT; Schema: public; Owner: prisma-crw
--

ALTER TABLE ONLY public.listings ALTER COLUMN id SET DEFAULT nextval('public.listings_id_seq'::regclass);


--
-- Name: sessions id; Type: DEFAULT; Schema: public; Owner: prisma-crw
--

ALTER TABLE ONLY public.sessions ALTER COLUMN id SET DEFAULT nextval('public.sessions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: prisma-crw
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: verification_requests id; Type: DEFAULT; Schema: public; Owner: prisma-crw
--

ALTER TABLE ONLY public.verification_requests ALTER COLUMN id SET DEFAULT nextval('public.verification_requests_id_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: prisma-crw
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
7edf89d1-95ff-4b73-8e89-ef34b2ac233a	b204ec8cba0a013bd1f0da665775d07ab78db3cfff388c04e7d3af6b0bf0b6f4	2021-06-07 22:53:03.156813+00	20210508110419_initial_migration		\N	2021-06-07 22:53:03.156813+00	0
61438cc4-d493-4d0e-83c9-a92efca3e360	52d73a2c8f5927da07492f83ffc94ce4a3cdc93232be0291d0faf77bc5ba8eed	2021-06-07 22:53:35.262529+00	20210508110826_add_admin_field_to_users		\N	2021-06-07 22:53:35.262529+00	0
de09f52f-0046-4c47-9a62-06f0a0ea7c34	346f9f817eb4d6cadf127425a1a3a9927277d08967c1d7ff07934f2e6d79b9d8	2021-06-07 22:53:48.091203+00	20210509123508_remove_category_unique_constraint		\N	2021-06-07 22:53:48.091203+00	0
4c2498f3-76f3-4dee-82a2-d77530f6456b	de275eb443fbb302e6a66b7a79390f675395d4c3231abcfb4a55840638fe340a	2021-06-07 22:54:05.242886+00	20210511233111_rename_organization_table_to_listing		\N	2021-06-07 22:54:05.242886+00	0
3d93f6a6-352c-4661-b188-185bbd366d32	34a96584268d7ef69c73b6a89808f7722cfbf188ea164395db48ffef40fe587b	2021-06-07 22:54:21.076312+00	20210513101906_add_edit_permissions_table		\N	2021-06-07 22:54:21.076312+00	0
4aa5ef08-8357-46fd-87df-035a4a85224c	51e60b80abf0ad0568d4fbaa055a6288284fe769ff64ee4b31251f43fc5ec918	2021-06-07 22:54:34.755159+00	20210607223855_add_inactive_and_seekingvolunteers_fields		\N	2021-06-07 22:54:34.755159+00	0
d185bff9-67a2-4a53-894b-f76834aef70f	4dc0832d34a276f6bd347f15c80ea701a3722e809cf581456c118cbfe97e37ae	2021-07-10 17:14:01.669693+00	20210706212152_add_color_field_to_listing_table	\N	\N	2021-07-10 17:14:01.533402+00	1
5dc1210c-d18f-4842-9407-4820b942b6b5	a0fc016e7659ebadf768eac54695dde5185c8ac4691145f264f8b775974817d5	2021-07-10 17:14:01.872731+00	20210706231152_create_category_table_and_relate_to_listings_table	\N	\N	2021-07-10 17:14:01.717798+00	1
ac9f08aa-4d7d-4369-9dbe-a1fb2c6e4f7d	5ec89fe286515681c59e57f5eeb0442887fe48feec6dd9c918de8e0f58fdf5a2	2021-07-10 17:14:02.066853+00	20210707192400_change_id_field_to_autoincrement_int	\N	\N	2021-07-10 17:14:01.921708+00	1
08b2d6d0-18ca-4875-b641-64517dd50bdc	1cd0819c45469f8dd9f424cff8c5d79913314db05ca49447e6d2414ec39853e1	2021-07-24 23:28:41.888543+00	20210720222849_replace_user_id_with_email_in_edit_permissions	\N	\N	2021-07-24 23:28:41.737448+00	1
77557584-b797-4ebe-8fc4-a5e28c007d6c	99539704273577211063dfaefa21de4122ad914c5141761e660aea3f1091ed2c	2021-07-24 23:28:42.07037+00	20210724221230_link_edit_permissions_table_to_listing_entity	\N	\N	2021-07-24 23:28:41.941706+00	1
e97aa2d3-723f-41ef-98ba-84a37417b0df	977fec854dbbd980df7794e37a597983e8831345556ebde014f3f0f2bc3dc422	2021-09-17 08:49:47.106006+00	20210911212039_add_image_field_on_listing	\N	\N	2021-09-17 08:49:47.016448+00	1
706b0c24-6a04-4ae7-81ba-6b323e20ec2c	5f5ccc9f8b9d4dcb93d366a9b79583c1b119fb8f61c816a19a4a17666fe9b3e2	2021-10-09 18:45:22.477945+00	20211008213456_add_slug_to_listing_schema	\N	\N	2021-10-09 18:45:22.219614+00	1
46d48886-932c-4560-ba46-bfb25d854a68	3e1c565eadc461dc677f092d9cf8e09c263380cd9a24daedf0a89dfd19ee3dea	2021-10-09 18:45:22.819728+00	20211008220550_make_slug_nullable	\N	\N	2021-10-09 18:45:22.513293+00	1
d5f592a5-4ce2-4fa8-801f-868ae78a85a4	619db4e4a3b2b57e83f055705e62af5187e64afd63fa4f0d4bed821093034732	2021-10-17 19:08:27.820648+00	20211011225106_make_slug_a_unique_field	\N	\N	2021-10-17 19:08:27.728681+00	1
\.


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: prisma-crw
--

COPY public.accounts (id, compound_id, user_id, provider_type, provider_id, provider_account_id, refresh_token, access_token, access_token_expires, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: prisma-crw
--

COPY public.categories (created_at, updated_at, label, color, id) FROM stdin;
2021-07-10 17:18:28.304	2021-07-10 17:18:28.304	Environment	7ed957	1
2021-07-10 17:18:28.305	2021-07-10 17:18:28.304	Housing	cb6ce6	2
2021-07-10 17:18:28.305	2021-07-10 17:18:28.305	Social business	778ffc	3
2021-07-10 17:18:28.305	2021-07-10 17:18:28.305	Transportation	737373	4
2021-07-10 17:18:28.306	2021-07-10 17:18:28.306	Connectivity	5ce1e6	5
2021-07-10 17:18:28.306	2021-07-10 17:18:28.306	Equity	ff66c4	6
2021-07-10 17:18:28.306	2021-07-10 17:18:28.306	Community	ffde59	7
2021-07-10 17:18:28.307	2021-07-10 17:18:28.307	Animal rights	ff914d	8
2021-07-10 17:18:28.307	2021-07-10 17:18:28.307	Conservation	008037	9
2021-07-10 17:18:28.308	2021-07-10 17:18:28.307	Education	c9e265	10
2021-07-10 17:18:28.308	2021-07-10 17:18:28.308	Food	a4791b	11
2021-07-10 17:18:28.308	2021-07-10 17:18:28.308	Technology	a2b342	12
2021-07-10 17:18:28.308	2021-07-10 17:18:28.308	Art	77fcd0	13
2021-07-10 17:18:28.309	2021-07-10 17:18:28.309	Union	fff780	14
2021-07-10 17:18:28.31	2021-07-10 17:18:28.31	Community garden	2cb868	16
2021-07-10 17:18:28.309	2021-07-10 17:18:28.309	Social justice	ff5757	15
\.


--
-- Data for Name: edit_permissions; Type: TABLE DATA; Schema: public; Owner: prisma-crw
--

COPY public.edit_permissions (id, created_at, updated_at, "listingId", email) FROM stdin;
3	2021-07-25 23:36:48.289	2021-07-25 23:36:48.289	25	ismail.diner+test1@gmail.com
2	2021-07-25 00:01:54.241	2021-07-25 00:01:54.241	23	ismail.diner+admin@gmail.com
4	2021-07-27 22:32:22.112	2021-07-27 22:32:22.112	6	ismail.diner+admin2@gmail.com
5	2021-07-27 23:31:56.442	2021-07-27 23:31:56.442	29	ismail.diner+admin5@gmail.com
6	2021-07-27 23:33:06.396	2021-07-27 23:33:06.396	16	ismail.diner+admin6@gmail.com
7	2021-07-28 23:28:06.921	2021-07-28 23:28:06.921	5	ismail.diner+admin9@gmail.com
8	2021-07-28 23:28:49.098	2021-07-28 23:28:49.098	6	ismail.diner+admin10@gmail.com
9	2021-07-28 23:37:57.819	2021-07-28 23:37:57.819	13	ismail.diner+admin11@gmail.com
10	2021-07-28 23:41:30.729	2021-07-28 23:41:30.729	18	ismail.diner+admin12@gmail.com
13	2021-08-07 18:03:23.825	2021-08-07 18:03:23.825	5	ismail.diner+admin13@gmail.com
14	2021-08-07 18:03:40.106	2021-08-07 18:03:40.106	5	ismail.diner+admin13@gmail.com
16	2021-08-07 20:15:26.24	2021-08-07 20:15:26.24	6	diner.ismail@protonmail.com
17	2021-08-07 20:18:05.889	2021-08-07 20:18:05.889	8	diner.ismail@protonmail.com
18	2021-08-08 13:10:51.722	2021-08-08 13:10:51.722	8	ismail.diner+admin14@gmail.com
20	2021-08-09 22:08:30.54	2021-08-09 22:08:30.54	5	ismail.diner+test28@gmail.com
21	2021-08-09 22:10:44.752	2021-08-09 22:10:44.752	110	ismail.diner+test28@gmail.com
22	2021-08-09 22:13:41.888	2021-08-09 22:13:41.888	5	ismail.diner+test29@gmail.com
23	2021-08-09 22:14:12.282	2021-08-09 22:14:12.282	99	meg.clarke@phonecoop.coop
24	2021-08-10 22:21:05.004	2021-08-10 22:21:05.005	15	ismail.diner+test30@gmail.com
25	2021-08-10 22:32:49.753	2021-08-10 22:32:49.753	20	ismail.diner+test31007@gmail.com
26	2021-08-14 08:31:26.561	2021-08-14 08:31:26.561	29	beeny.harwoodpurkiss@gmail.com
27	2021-08-18 20:26:12.413	2021-08-18 20:26:12.413	19	nicole@cambridgecarbonfootprint.org
28	2021-08-18 22:00:34.656	2021-08-18 22:00:34.656	60	lydz_instone@hotmail.com
29	2021-08-19 19:13:32.44	2021-08-19 19:13:32.44	25	lm687@cam.ac.uk
30	2021-09-05 21:41:47.13	2021-09-05 21:41:47.13	19	nicole@cambridgecarbonfootprint.org
31	2021-09-16 20:48:25.75	2021-09-16 20:48:25.75	98	ismail.diner+test20@gmail.com
32	2021-09-16 20:51:45.642	2021-09-16 20:51:45.642	62	ismail.diner+test20@gmail.com
33	2021-10-06 13:19:41.508	2021-10-06 13:19:41.508	5	info@abbeypeople.org.uk
34	2021-10-06 13:20:12.498	2021-10-06 13:20:12.498	6	cambridge@acorntheunion.org.uk
35	2021-10-06 13:20:41.043	2021-10-06 13:20:41.043	7	learnandtrain@cap.education
36	2021-10-06 13:30:44.021	2021-10-06 13:30:44.021	8	webmaster@allotments.net
37	2021-10-06 13:40:01.082	2021-10-06 13:40:01.082	110	arcambstech@gmail.com
38	2021-10-06 13:40:17.155	2021-10-06 13:40:17.155	110	arcambstech@gmail.com
39	2021-10-06 13:42:05.688	2021-10-06 13:42:05.688	10	Chair@ash.coop
40	2021-10-06 13:42:29.268	2021-10-06 13:42:29.268	11	contact@arjunawholefoods.co.uk
41	2021-10-06 13:42:53.418	2021-10-06 13:42:53.418	12	breadonabike@gmail.com
42	2021-10-06 13:43:05.367	2021-10-06 13:43:05.367	13	info@burwellprint.co.uk
43	2021-10-06 13:43:24.453	2021-10-06 13:43:24.453	14	river.manager@camconservators.org.uk
44	2021-10-07 13:00:27.192	2021-10-07 13:00:27.192	15	info@camvalleyforum.uk
45	2021-10-07 13:01:50.772	2021-10-07 13:01:50.772	113	secretary@cambstuc.org
46	2021-10-07 13:02:09.316	2021-10-07 13:02:09.316	17	contact.cabu@gmail.com
47	2021-10-07 13:02:48.186	2021-10-07 13:02:48.186	21	info@cchp.org.uk
48	2021-10-07 13:05:01.909	2021-10-07 13:05:01.909	22	info@ccfb.org.uk
49	2021-10-07 13:05:26.632	2021-10-07 13:05:26.632	23	admin@cambridgecleantech.org.uk
50	2021-10-07 13:05:52.62	2021-10-07 13:05:52.62	26	cambridgeconservationforum@gmail.com
51	2021-10-07 13:06:43.985	2021-10-07 13:06:43.985	27	cciea@jbs.cam.ac.uk
52	2021-10-07 13:07:28.749	2021-10-07 13:07:28.749	43	contact@camcycle.org.uk
53	2021-10-07 13:09:21.178	2021-10-07 13:09:21.178	119	info@cambridgeelectrictransport.co.uk
54	2021-10-07 13:11:27.263	2021-10-07 13:11:27.263	30	info@cambridgefoodhub.org
55	2021-10-07 13:13:27.226	2021-10-07 13:13:27.226	122	hello@cambridgehedgehogs.org
56	2021-10-07 13:17:18.925	2021-10-07 13:17:18.925	123	secretary@cnhs.org.uk
57	2021-10-07 13:18:26.816	2021-10-07 13:18:26.816	123	secretary@cnhs.org.uk
58	2021-10-07 13:24:27.665	2021-10-07 13:24:27.665	36	enquiries@cambridgeppf.org
59	2021-10-07 13:24:48.562	2021-10-07 13:24:48.562	114	cambridgepeoplesassembly@outlook.com
60	2021-10-07 13:25:48.778	2021-10-07 13:25:48.778	40	James.Youd@unitetheunion.org
61	2021-10-07 13:26:29.124	2021-10-07 13:26:29.124	42	cambsals@cambridgeshire.gov.uk
62	2021-10-07 13:26:51.337	2021-10-07 13:26:51.337	118	info@camnexus.co.uk
63	2021-10-07 13:27:47.065	2021-10-07 13:27:47.065	46	hello@circularcambridge.org
64	2021-10-07 13:28:24.417	2021-10-07 13:28:24.417	47	caba@cambridgecab.org.uk
65	2021-10-07 15:52:52.726	2021-10-07 15:52:52.726	35	info@cambridgefoodhub.org
66	2021-10-07 15:53:02.797	2021-10-07 15:53:02.797	75	info@cambridgefoodhub.org
67	2021-10-18 13:55:30.164	2021-10-18 13:55:30.164	134	jo@camraredisease.org
68	2021-11-21 17:17:39.329	2021-11-21 17:17:39.329	137	sam@illuminatecharity.org.uk
69	2021-11-21 20:51:29.842	2021-11-21 20:51:29.842	50	playeast@cambridge.gov.uk
70	2021-11-21 20:51:58.628	2021-11-21 20:51:58.628	52	cambridge@cropshare.org.uk
71	2021-11-21 20:52:20.004	2021-11-21 20:52:20.004	54	cambridge@dailybread.co.uk
72	2021-11-21 20:52:42.092	2021-11-21 20:52:42.092	55	christine.millar@cpft.nhs.uk
73	2021-11-21 20:52:57.278	2021-11-21 20:52:57.278	56	reception@cciservices.co.uk
74	2021-11-21 20:53:12.314	2021-11-21 20:53:12.314	107	xryouthcambridge@protonmail.com
75	2021-11-21 20:53:50.75	2021-11-21 20:53:50.751	65	chair2019@friendsofcherryhintonbrook.org.uk
76	2021-11-21 20:54:04.277	2021-11-21 20:54:04.277	66	chhfriends@gmail.com
77	2021-11-21 20:54:23.714	2021-11-21 20:54:23.714	69	Friendsofmillroadcemetary@gmail.com
78	2021-11-21 20:54:35.62	2021-11-21 20:54:35.62	70	friendsofstourbridge@gmail.com
79	2021-11-21 20:54:51.274	2021-11-21 20:54:51.274	132	camfoe@yahoo.co.uk
80	2021-11-21 20:55:07.33	2021-11-21 20:55:07.33	76	coordinator@ittakesacity.org.uk
81	2021-11-21 20:55:24.095	2021-11-21 20:55:24.095	78	cambridgegroup@livingstreets.org.uk
82	2021-11-21 20:55:40.46	2021-11-21 20:55:40.46	117	admin@maxwell.cam.ac.uk
83	2021-11-21 20:55:55.172	2021-11-21 20:55:55.172	82	info@naturalcambridgeshire.org.uk
84	2021-11-21 20:56:11.319	2021-11-21 20:56:11.319	84	info@nightingalegarden.org.uk
85	2021-11-21 20:56:28.8	2021-11-21 20:56:28.8	85	onthevergecambridge@gmail.com
86	2021-11-21 20:56:46.14	2021-11-21 20:56:46.14	89	radmorefarmshop@outlook.com
87	2021-11-21 20:56:58.987	2021-11-21 20:56:58.987	90	info@reachsolarfarm.co.uk
88	2021-11-21 20:57:55.056	2021-11-21 20:57:55.056	91	sarah.crick@redhenproject.org
89	2021-11-21 20:58:42.389	2021-11-21 20:58:42.389	92	hello@circularcambridge.org
90	2021-11-21 20:59:00.918	2021-11-21 20:59:00.918	94	info@rowanhumberstone.co.uk
91	2021-11-21 20:59:13.174	2021-11-21 20:59:13.174	96	info@smartertransport.uk
92	2021-11-21 20:59:32.595	2021-11-21 20:59:32.595	105	cambridgeshire@wildlifebcn.org
93	2021-11-21 21:00:03.214	2021-11-21 21:00:03.214	100	trumpingtonmeadows@wildlifebcn.org
94	2021-11-21 21:01:06.104	2021-11-21 21:01:06.104	101	office@u3ac.org.uk
95	2021-11-21 21:01:22.829	2021-11-21 21:01:22.829	115	unison@cambridgeshire.gov.uk
96	2021-11-21 21:01:47.927	2021-11-21 21:01:47.927	103	enquiries@cambridgeppf.org
97	2021-11-21 21:02:01.111	2021-11-21 21:02:01.111	106	info@cwrc.org.uk
98	2021-11-21 21:02:14.387	2021-11-21 21:02:14.387	120	cambridge@zedify.co.uk
99	2021-11-21 21:05:07.642	2021-11-21 21:05:07.642	5	info@abbeypeople.org.uk
102	2021-11-21 21:06:21.975	2021-11-21 21:06:21.975	8	webmaster@allotments.net
103	2021-11-21 21:06:38.106	2021-11-21 21:06:38.106	9	localgroups@animalrebellion.org
105	2021-11-21 21:07:09.306	2021-11-21 21:07:09.306	10	Chair@ash.coop
111	2021-11-21 21:09:54.849	2021-11-21 21:09:54.849	17	contact.cabu@gmail.com
113	2021-11-21 21:12:47.758	2021-11-21 21:12:47.758	22	info@ccfb.org.uk
115	2021-11-21 21:14:06.364	2021-11-21 21:14:06.364	26	cambridgeconservationforum@gmail.com
116	2021-11-21 21:14:23.483	2021-11-21 21:14:23.483	27	cciea@jbs.cam.ac.uk
118	2021-11-21 21:15:18.432	2021-11-21 21:15:18.432	30	info@cambridgefoodhub.org
119	2021-11-21 21:15:31.385	2021-11-21 21:15:31.385	122	hello@cambridgehedgehogs.org
123	2021-11-21 21:16:42.725	2021-11-21 21:16:42.725	42	cambsals@cambridgeshire.gov.uk
124	2021-11-21 21:17:01.22	2021-11-21 21:17:01.22	118	info@camnexus.co.uk
100	2021-11-21 21:05:50.8	2021-11-21 21:05:50.8	6	cambridge@acorntheunion.org.uk
101	2021-11-21 21:06:05.39	2021-11-21 21:06:05.39	7	learnandtrain@cap.education
104	2021-11-21 21:06:53.963	2021-11-21 21:06:53.963	110	arcambstech@gmail.com
106	2021-11-21 21:07:23.683	2021-11-21 21:07:23.683	11	contact@arjunawholefoods.co.uk
107	2021-11-21 21:07:39.414	2021-11-21 21:07:39.414	13	info@burwellprint.co.uk
108	2021-11-21 21:07:53.47	2021-11-21 21:07:53.47	14	river.manager@camconservators.org.uk
109	2021-11-21 21:08:05.872	2021-11-21 21:08:05.872	15	info@camvalleyforum.uk
110	2021-11-21 21:08:23.809	2021-11-21 21:08:23.809	113	secretary@cambstuc.org
112	2021-11-21 21:11:50.184	2021-11-21 21:11:50.184	21	info@cchp.org.uk
114	2021-11-21 21:13:01.216	2021-11-21 21:13:01.216	23	admin@cambridgecleantech.org.uk
117	2021-11-21 21:14:55.196	2021-11-21 21:14:55.196	119	info@cambridgeelectrictransport.co.uk
120	2021-11-21 21:15:45.06	2021-11-21 21:15:45.06	123	secretary@cnhs.org.uk
121	2021-11-21 21:16:02.742	2021-11-21 21:16:02.742	36	enquiries@cambridgeppf.org
122	2021-11-21 21:16:23.807	2021-11-21 21:16:23.807	40	James.Youd@unitetheunion.org
\.


--
-- Data for Name: listings; Type: TABLE DATA; Schema: public; Owner: prisma-crw
--

COPY public.listings (id, created_at, updated_at, title, website, description, facebook, twitter, instagram, email, notes, inactive, seeking_volunteers, "categoryId", image, slug) FROM stdin;
68	2021-05-22 15:17:43.188	2021-05-22 15:17:43.188	Friends of Midsummer Common	https://www.midsummercommon.org.uk/	Friends of Midsummer Common (FoMC) is a group of Cambridge people who are concerned with the good management and responsible use of this ancient grassland. FoMC established and looks after the Community Orchard on part of the Common. Volunteers help plant trees and wildflowers, cut grass and clear weeds in a sociable environment. Our mission is to make the Common a place for everyone to enjoy. FoMC welcomes new members from any part of Cambridge.	https://facebook.com/friendsofmidsummercommon	https://twitter/FoMCCambridge		form	\N	f	\N	7	\N	friends-of-midsummer-common
69	2021-05-22 15:17:43.188	2021-05-22 15:17:43.188	Friends of Mill Road Cemetery	http://millroadcemetery.org.uk/	Mill Road Cemetery was created and consecrated in 1848 to provide more burial space for the city centre parishes. It is now full. It is still consecrated and owned by the parishes, and maintained as a churchyard and open space by Cambridge City Council. It is an English Heritage Grade II listed site, with several listed monuments and war graves. There are public art installations by Gordon Young, on the theme of birds and birdsong. It is always open.	https://www.facebook.com/groups/FriendsofMillRoadCemetary			Friendsofmillroadcemetary@gmail.com	\N	f	\N	7	\N	friends-of-mill-road-cemetery
70	2021-05-22 15:17:43.188	2021-05-22 15:17:43.188	Friends of Stourbridge Common	https://stourbridgecommon.wordpress.com/	Friends of Stourbridge Common protect and enhance the biodiversity of Stourbridge Common as well as ensuring it is a safe, enjoyable place to visit for all users. Stourbridge Common in Cambridge is a part of the rich history of Cambridge. It is widely used by many people – it is a green space worth preserving and maintaining.	https://www.facebook.com/FriendsofStourbridgeCommon			friendsofstourbridge@gmail.com	\N	f	\N	7	\N	friends-of-stourbridge-common
81	2021-05-22 15:17:43.189	2021-05-22 15:17:43.189	Mutual Aid	https://www.mutual-aid.co.uk/area/cambridgeshire	Informal local support networks set up during C19 pandemic by residents in their districts  - each area has own group and runs autonomously. Listings and contact details on Cambridgeshire County Council website	many Fb groups, see website	\N	\N	\N	\N	f	\N	7	\N	mutual-aid
85	2021-05-22 15:17:43.19	2021-05-22 15:17:43.19	On the Verge	https://www.onthevergecambridge.org.uk/	Promotes the growing of nectar rich flowers throughout the city for the benefit of insects which are in catastrophic decline. Aiming to make Cambridge welcoming to pollinators by providing them with 'food corridors' so they dont have to fly long distances, plus increasing bodiversity in Cambridge.				onthevergecambridge@gmail.com	\N	f	\N	9	\N	on-the-verge
86	2021-05-22 15:17:43.19	2021-05-22 15:17:43.19	Open Eco Homes	http://openecohomes.org/	Promotes awareness of how to create beautiful, high functioning, low energy homes by finding local householders who have renovated or built new ecohomes and helping them pass on their knowledge to visitors, organising free tours in their homes each September				form on website	\N	f	\N	2	\N	open-eco-homes
88	2021-05-22 15:17:43.19	2021-05-22 15:17:43.19	Prospects Trust (Snakehall Farm)	https://prospectstrust.org.uk/	Working organic care farm near Ely with an onsite farm shop, providing placements and offering therapeutic horticulture and farm based work experience to people with learning difficulties, disabilities and those with varying health needs.	https://www.facebook.com/tilly.tractor	https://www.twitter.com/TillyTractor		form on website	\N	f	\N	3	\N	prospects-trust-snakehall-farm
89	2021-05-22 15:17:43.19	2021-05-22 15:17:43.19	Radmore Farm Shop	https://radmorefarmshop.co.uk/	Local outlet for family farm in Northants. selling meats and free range eggs from the farm plus a large range of produce from other local farms and suppliers, including Fairtrade.	https://www.facebook.com/radmorefarmshop/			radmorefarmshop@outlook.com	\N	f	\N	11	\N	radmore-farm-shop
90	2021-05-22 15:17:43.191	2021-05-22 15:17:43.191	Reach Solar Farm CBS	http://www.reachsolarfarm.co.uk/	Community solar farm near the village of Reach, providing up to half of the village's electricity. Owned and run by a co-operative of local people as a Community Benefit Society with the object of benefitting the community as well as giving a dividend to investors	https://www.facebook.com/Reachsolarfarm/	https://www.twitter.com/reachsolarfarm		info@reachsolarfarm.co.uk	\N	f	\N	3	\N	reach-solar-farm-cbs
91	2021-05-22 15:17:43.191	2021-05-22 15:17:43.191	Red Hen Project	https://redhenproject.org	Small charity run by Soroptimists International in Cambridge, working with 5 primary schools in North Cambridge, to support children and their families in overcoming barriers to learning and provide a link between home and school.	https://www.facebook.com/theredhenproject/	https://www.twitter.com/redhencambridge/	https://www.instagram.com/redhenproject/	sarah.crick@redhenproject/	\N	f	\N	10	\N	red-hen-project
92	2021-05-22 15:17:43.191	2021-05-22 15:17:43.191	Repair Cafes	http://circularcambridge.org/repair-cafes/	Get things fixed for free at a repair cafe jointly run by Cambridge Carbon Footprint and Transition Cambridge in a local church hall. There will be a cafe to have a drink while you wait for your repair on mobile phone, bicycle,clothes tec..				hello@circularcambridge.org	\N	f	\N	12	\N	repair-cafes
96	2021-05-22 15:17:43.191	2021-05-22 15:17:43.191	Smarter Cambridge Transport	https://www.smartertransport.uk	Think tank initiative of impartial local volunteers, developing and promoting a modern vision for integrated transport in Cambridge and the surrounding region. with a focus on ensuring that the Greater Cambridge City deal money is spent in the best possible way.				info@smartertransport.uk	\N	f	\N	4	\N	smarter-cambridge-transport
5	2021-05-22 15:17:43.181	2021-05-22 15:17:43.181	Abbey People	https://www.abbeypeople.org.uk	Abbey People is a vibrant community charity improving the lives and wellbeing of Abbey residents.	https://www.facebook.com/AbbeyPeople/	https://twitter.com/abbeypeople		info@abbeypeople.org.uk	\N	f	f	7	https://resilienceweb.ams3.digitaloceanspaces.com/upload_35326b562bad76712cb60babfeca9012.jpg	abbey-people
6	2021-05-22 15:17:43.181	2021-05-22 15:17:43.181	Acorn Union	https://www.acorntheunion.org.uk	ACORN is a mass membership organisation and network of low-income people organising for a fairer deal for our communities.	https://www.facebook.com/ACORN.Cambridge/	https://twitter.com/ACORNunion		cambridge@acorntheunion.org.uk	\N	f	f	2	https://resilienceweb.ams3.digitaloceanspaces.com/upload_cde078c1892ce1b527a3c2bd40ad466b.jpg	acorn-union
8	2021-05-22 15:17:43.182	2021-05-22 15:17:43.182	Allotment Societies	https://allotments.net/	Directory of allotments in Cambridge				webmaster@allotments.net	\N	f	\N	11	\N	allotment-societies
97	2021-05-22 15:17:43.192	2021-05-22 15:17:43.192	Solar Together	https://www.solartogether.co.uk/cambridgeshire/home	A group buying scheme to help Cambs. residents buy high quality and competitively priced solar panels with battery storage systems, run by loacal authorities with a group buying specialist in the field.	https://www.facebook.com/SolarTogetherUK/?utm	https://www.twitter.com/SolarTogether/?utm	https://www.instagram/soartogetheruk/?utm	form	\N	f	\N	1	\N	solar-together
99	2021-05-22 15:17:43.192	2021-05-22 15:17:43.192	Transition Cambridge	https://www.transitioncambridge.org/	Transition Cambridge is working towards building a stronger, more resilient community with the capacity to adapt to climate change and energy price hikes, while supporting local people to thrive. Current projects include community gardens, community supported agriculture, home energy usage, repair cafes and more. Volunteers are invited to get involved in a variety of ways to support Cambridge's transition to more sustainable and environmentally friendly ways of living.	https://www.facebook.com/Transition-Cambridge-743786736015935	https://twitter.com/TransitionCambs	https://www.instagram.com/transitioncam/	transitioncambridge@gmail.com	\N	f	t	7	\N	transition-cambridge
25	2021-05-22 15:17:43.184	2021-05-22 15:17:43.184	Cambridge Community Kitchen	https://cckitchen.uk	<p>We are a food solidarity collective dedicated to tackling food poverty in Cambridge. As a collaboration between The Lockon, the local community and other independent volunteers, we aim to provide hot, hearty, vegan meals for anyone who needs one, while strengthening our community and building new systems for mutual care.</p>\r\n<p>We hold the &ldquo;radical&rdquo; belief that everyone deserves good food and community support (and more!). The sad truth of our pandemic year is that many of us&mdash;especially those most vulnerable to the changing whims of a racist, violent, and exploitative political and economic system&mdash;are in more precarious situations than ever before (even as Pfizer, Amazon, and Serco reap record profits). Capitalism and the government have failed us all. By finding new ways to take care of each other, we are resisting these systems and shifting power from corporations and the state and back into our local communities.</p>	https://www.facebook.com/pg/cambridgecommunitykitchen	https://twitter.com/CamCommunity	https://www.instagram.com/cambridgecommunitykitchen	cambscommunitykitchen@gmail.com	\N	f	t	11	https://resilienceweb.ams3.digitaloceanspaces.com/upload_4c29ad83b13989319439ddf4a5ca3717.png	cambridge-community-kitchen
24	2021-05-22 15:17:43.183	2021-05-22 15:17:43.183	Cambridge Commons	https://www.thecambridgecommons.org/	<p>Cambridge Commons is a collective of local volunteers motivated to raise awareness of the harmful impact of inequality, so that local people can take action to address it.</p>	https://www.facebook.com/groups/CamCom.Org.uk/about/	https://twitter.com/cam_commons			\N	f	f	6	https://resilienceweb.ams3.digitaloceanspaces.com/upload_d8fe5129aa6739d998a99ee8ab2636cf.jpg	cambridge-commons
82	2021-05-22 15:17:43.189	2021-05-22 15:17:43.189	Natural Cambridgeshire	https://naturalcambridgeshire.org.uk/	<p>Natural Cambridgeshire is the local nature partnership for Cambridgeshire and Peterborough. It champions the 'doubling nature' vision, and runs a variety of initiatives with the aim of putting nature at the very heart of decision-making and communities at all levels across the county.</p>	https://www.facebook.com/NaturalCambs	https://twitter/naturalcambs		info@naturalcambridgeshire.org.uk	\N	f	f	1	\N	natural-cambridgeshire
26	2021-05-22 15:17:43.184	2021-05-22 15:17:43.184	Cambridge Conservation Forum	https://www.cambridgeconservationforum.org.uk/	Cambridge Conservation Forum was established in 1998 with the purpose of connecting the diverse community of conservation practitioners and researchers who are based in and around Cambridge, but may work at local, national or international levels.				cambridgeconservationforum@gmail.com	\N	f	\N	9	\N	cambridge-conservation-forum
27	2021-05-22 15:17:43.184	2021-05-22 15:17:43.184	Cambridge Conservation Initiative	https://cambridgeconservation.org	The Cambridge Conservation Initiative aims to transform the global understanding and conservation of biodiversity by catalysing strategic partnerships between leaders in research, education, policy and practice, to secure a sustainable future for biodiversity and society.				cciea@jbs.cam.ac.uk	\N	f	\N	9	\N	cambridge-conservation-initiative
28	2021-05-22 15:17:43.184	2021-05-22 15:17:43.184	Cambridge Convoy Refugee Action Group	https://camcrag.org.uk/	CamCRAG is a registered charity that sends regular convoys of volunteers and aid from the Cambridge region to help refugees in Europe. We collect donations, hold fundraising events, fund projects overseas and raise awareness of the refugee crisis.	https://www.facebook.com/camb4calais	https://twitter.com/Camb4Calais	https://www.instagram.com/camb4calais/	volunteer@camcrag.org.uk	\N	f	\N	15	\N	cambridge-convoy-refugee-action-group
75	2021-05-22 15:17:43.189	2021-05-22 15:17:43.189	Healthy Start Veg Box Scheme	https://cambridgefoodhub.org/2020/09/08/healthy-start-veg-box-scheme/	Run by Cambridge Food Hub and Cambridge Sustainable Food to make good quality organic fruit and veg more accessibe to families on low incomes who can apply if they receive Healthy Start Vouchers.	https://www.facebook.com/cambridgefoodhub/			cambridgefoodhub@gmail.com	\N	f	f	11	\N	healthy-start-veg-box-scheme
109	2021-05-22 15:17:43.193	2021-05-22 15:17:43.193	Anonymous for the Voiceless	https://www.anonymousforthevoiceless.org/	Anonymous for the Voiceless (AV) is an animal rights organisation that specialises in edifying the public on animal abuse and fostering highly effective activism groups worldwide. We hold an abolitionist stance against all forms of animal exploitation and promote a clear animal rights message.				via website	\N	f	\N	8	\N	anonymous-for-the-voiceless
110	2021-05-22 15:17:43.193	2021-05-22 15:17:43.193	Animal Rights Cambridge	https://animalrightscambridge.wordpress.com/	All volunteer, intergenerational group of people committed to strategies to end the exploitation of non- human animals. Focus on crucial isseues and confronting companies and institutions to raise public awareness and bring forth meaningful change for animals.	https://www.facebook.com/arcambridge	https://www.twitter.com/ARCambridge		arcambstech@gmail.com	\N	f	\N	8	\N	animal-rights-cambridge
43	2021-05-22 15:17:43.185	2021-05-22 15:17:43.185	Cambridge Cycling Campaign	https://www.camcycle.org.uk/	Cambridge Cycling Campaign is a charity run by volunteers. Founded in 1995, our aim is safer, better and more cycling in the Cambridge area, where about half of the local population uses a bike at least once a month. Many of the cycle facilities such as paths, lanes, traffic signals, bridges and cycle parks would not exist without the work done by our members. 	www.facebook.com/CambridgeCyclingCampaign	https://twitter.com/camcycle		contact@camcycle.org.uk	\N	f	\N	4	\N	cambridge-cycling-campaign
45	2021-05-22 15:17:43.186	2021-05-22 15:17:43.186	Carbon Neutral Cambridge	https://carbonneutralcambridge.org/	Carbon Neutral Cambridge is a not-for-profit community based organisation, focussed on accelerating the transition to fair and healthy carbon neutrality within the Greater Cambridge region. 		https://twitter.com/carbonNtrlCambs			\N	f	\N	1	\N	carbon-neutral-cambridge
46	2021-05-22 15:17:43.186	2021-05-22 15:17:43.186	Circular Cambridge	https://cambridgecarbonfootprint.org/what-we-do/circular-cambridge/	Circular Cambridge celebrates progressive ways to design, manufacture, access, repair and reuse the things that we want and need in our lives.				hello@circularcambridge.org	\N	f	\N	1	\N	circular-cambridge
51	2021-05-22 15:17:43.186	2021-05-22 15:17:43.186	Community Wardrobe	https://www.facebook.com/communitywardrobecambridge/	Women supporting women in hard times. Free clothes, repairs, alterations food, fun, solidarity. Supported by C L P Women's Forum & Ethnic Minority Forum					\N	t	f	7	\N	community-wardrobe
62	2021-05-22 15:17:43.187	2021-05-22 15:17:43.187	Foodcycle	https://www.foodcycle.org.uk/	Local part of national charity that builds communities through surplus food donated from suppliers and supermarkets, volunteers who collect and cook delicious meals with the food, and spare community kitchen and dining spaces where the food is served free to all in need.  Welcomes new volunteers.	https://www.facebook.com/foodcyclecambridge/	https://twitter.com/foodcycle			\N	f	f	11	\N	foodcycle
63	2021-05-22 15:17:43.187	2021-05-22 15:17:43.187	Fosters Mill	https://www.priorsflour.co.uk/	The Prior’s Flour comprises a delicious range of stoneground organic flours milled, where possible, by wind power at the 160 year old Fosters Mill in Swaffham Prior. 		https://twitter/fostersmill/	https://instagram/fostersmill/		\N	f	f	11	\N	fosters-mill
64	2021-05-22 15:17:43.187	2021-05-22 15:17:43.187	Free Fruit Map	https://www.transitioncambridge.org/wiki/TTFood/LocalSources	\N	\N	\N	\N	\N	\N	f	\N	11	\N	free-fruit-map
65	2021-05-22 15:17:43.188	2021-05-22 15:17:43.188	Friends of Cherry Hinton Brook	https://friendsofcherryhintonbrook.org.uk/	Friends of Cherry Hinton Brook are a group of mainly local residents who banded together in June 2009, initially triggered by the need to clear the rubbish from the Brook and its environs.  we organise regular litter picks in early Spring and late summer/autumn, and as part of the Rivercare network have equipment for this purpose.				chair2019@friendsofcherryhintonbrook.org.uk	\N	f	\N	7	\N	friends-of-cherry-hinton-brook
66	2021-05-22 15:17:43.188	2021-05-22 15:17:43.188	Friends of Cherry Hinton Hall	http://www.cherryhintonhall.com/	The Friends act as advocates and champions of Cherry Hinton Hall grounds and provide an effective communication channel between the Council and the public.	https://www.facebook.com/The-Friends-of-Cherry-Hinton-Hall-249504465100148/?fref=ts			chhfriends@gmail.com	\N	f	\N	7	\N	friends-of-cherry-hinton-hall
73	2021-05-22 15:17:43.188	2021-05-22 15:17:43.188	Growing Spaces	http://www.cambridge.growingspaces.org/	Cambridge Growing Spaces is a Transition Cambridge project. The project aims to reclaim unloved and underused public spaces around the city of Cambridge and transform them using edible landscaping.	https://www.facebook.com/groups/CambridgeGrowingSpaces/	\N	\N	\N	\N	f	\N	16	\N	growing-spaces
116	2021-05-22 15:17:43.193	2021-05-22 15:17:43.193	Global Sustainability Institute	https://aru.ac.uk/global-sustainability-institute-gsi	We're committed to playing a key role in developing practical solutions to the sustainability challenges we all face, both locally and globally. We do this through research and education - bringing together the information needed to make decisions, with the people capable of taking action.	https://www.facebook.com/GlobalSustainabilityInstitute	https://twitter.com/GSI_ARU	\N	\N	\N	f	\N	1	\N	global-sustainability-institute
117	2021-05-22 15:17:43.194	2021-05-22 15:17:43.194	Maxwell Centre	https://www.maxwell.cam.ac.uk/	The Maxwell Centre is the centrepiece for industrial engagement with the physical scientists and engineers working on the West Cambridge Science and Technology Campus.				admin@maxwell.cam.ac.uk	\N	f	\N	5	\N	maxwell-centre
118	2021-05-22 15:17:43.194	2021-05-22 15:17:43.194	Camnexus	https://www.camnexus.io/	Helping efficiently manage resources, taking care of the environment, with remote monitoring and predictive analytics				info@camnexus.co.uk	\N	f	\N	12	\N	camnexus
119	2021-05-22 15:17:43.194	2021-05-22 15:17:43.194	Cambridge Electric Transport	https://cambridgeelectrictransport.co.uk/	Our corporate electric bike scheme saves employees time getting to work, reduces stress from sitting in traffic and their carbon footprint. It is available free to sstaff of subscribing companies. E-bikes can be booked and collected from Cambridge North Busway, Milton and Longstanton Park & Ride.				info@cambridgeelectrictransport.co.uk	\N	f	\N	4	\N	cambridge-electric-transport
122	2021-05-22 15:17:43.194	2021-05-22 15:17:43.194	Cambridge Hedgehogs	https://www.cambridgehedgehogs.org	Cambridge Hedgehogs (test) is a new charity in Cambridge, UK that is raising awareness of how the public can help our native hedgehog populations. In the longer term, we are hoping to find a suitable site to open a hedgehog hospital to treat sick, injured or orphaned hedgehogs and rehabilitate them.	https://www.facebook.com/CambridgeHedgehogs/			hello@cambridgehedgehogs.org	\N	f	\N	9	\N	cambridge-hedgehogs
123	2021-05-22 15:17:43.194	2021-05-22 15:17:43.194	Cambridge Natural History Society	https://www.cnhs.org.uk	Long standing local history society, running talks and field trips teaching identification skills. Regular surveys of local wildlife.	https://www.facebook.com/CNHS1857	https://twitter.com/CamNatHistSoc		secretary@cnhs.org.uk	\N	f	\N	9	\N	cambridge-natural-history-society
124	2021-05-22 15:17:43.194	2021-05-22 15:17:43.194	Karim Foundation	https://karimfoundation.co.uk/	Charity that aims to relieve poverty by providing food, help with domestic costs and emergency support for those in financial hardship.		https://twitter.com/Karim_Fdn	\N	\N	\N	f	\N	6	\N	karim-foundation
125	2021-05-22 15:17:43.194	2021-05-22 15:17:43.194	Cambridge Ethnic Community Forum	https://www.cecf.co.uk/	CECF is an umbrella organisation for Cambridge and district that provides racial equality services to individuals and groups. CECF provides a cultural diversity service that helps promote an understanding between people from different ethnic groups and help them be a natural part of Cambridge life. We give special social, cultural, moral and practical support to groups and develop particular projects where needed. One of our key services is the Cambridgeshire Human Rights and Equality Support Service (CHESS). CECF is also developing a refugee service.	https://www.facebook.com/CambridgeEthnicCommunityForum	https://www.twitter.com/cecf_uk	\N	\N	\N	f	\N	7	\N	cambridge-ethnic-community-forum
130	2021-06-30 11:43:42.615	2021-06-30 11:43:42.615	Pesticide Free Cambridge	https://www.pesticidefreecambridge.org	Working with On the Verge Cambridge and Pesticide Action Network's  (PAN UK) Pesticide-Free Towns campaigns.	https://www.facebook.com/Pesticide-Free-Cambridge-105536024678396	https://twitter.com/PANUKPFC			\N	f	\N	1	\N	pesticide-free-cambridge
58	2021-05-22 15:17:43.187	2021-05-22 15:17:43.187	Empty Common Community Garden	https://emptycommongarden.blogspot.com/	Large community garden in the City designed and run on permaculture principles with support from Transition Cambridge, welcomes volunteers, runs weekly community gardening sessions, no experience needed.	\N	\N	\N	\N	\N	f	\N	16	\N	empty-common-community-garden
59	2021-05-22 15:17:43.187	2021-05-22 15:17:43.187	Energy Group	https://www.transitioncambridge.org/wiki/TTEnergy/HomePage	Regular meetings to increase understanding and raise public awareness of energy saving/generating opportunities and promote renewable energy, welcomes new members.					\N	f	f	12	\N	energy-group
61	2021-05-22 15:17:43.187	2021-05-22 15:17:43.187	Federation of Cambridge Residents Associations	https://www.fecra.org.uk	A grassroots civic voice, dedicated to maintaining and enhancing beautiful Cambridge as a wonderful city in which to live, work, study and relax and to grow in a way that will achieve balanced communities and quality of life.	https://www.facebook.com/groups/CambridgeRAs	https://twitter.com/fecra2	\N	\N	\N	f	\N	2	\N	federation-of-cambridge-residents-associations
77	2021-05-22 15:17:43.189	2021-05-22 15:17:43.189	Kings Hedges Family Support Project	https://khfsp.org.uk/	At KHFSP, we aim to help parents to feel confident to make the choices that are important to them. We work in a welcoming and non-judgemental way. We help to reduce feelings of isolation and increase a sense of community and offer a high quality, safe place to play, relax and talk. At KHFSP, we work actively with partners and connect families to them, ensuring they have access to relevant information and advice.	https://www.facebook.com/The-Kings-Hedges-Family-Support-Project-451692688214593/			form	\N	f	\N	7	\N	kings-hedges-family-support-project
79	2021-05-22 15:17:43.189	2021-05-22 15:17:43.189	Movement Against Racism	https://www.facebook.com/MovementAgainstRaciism/	Peaceful Cambridge anti-racism group standing against social injustice and systemic racism, welcomes new members	https://www.facebook.com/MovementAgainstRaciism	\N	\N	\N	\N	f	\N	15	\N	movement-against-racism
80	2021-05-22 15:17:43.189	2021-05-22 15:17:43.189	Movement for a Democratic Society	https://www.facebook.com/Movement-for-a-Democratic-Society-Cambridge-356298144962954/	Local branch of movement formed to work towards a democratic society in which people are free and equal, living in communities based on common ownership that guarantee housing, food and a place to belong	https://www.facebook.com/Movement-for-a-Democratic-Society-Cambridge-356298144962954/				\N	t	f	6	\N	movement-for-a-democratic-society
78	2021-05-22 15:17:43.189	2021-05-22 15:17:43.189	Living Streets Cambridge	https://www.livingstreets.org.uk/get-involved/local-groups/cambridge	<p>Living Streets Cambridge is the local branch of the UK charity, Living Streets, promoting everyday walking. Our mission is to achieve a better walking environment and inspire people to walk more. We want a nation where walking is the natural choice for everyday local journeys.</p>				cambridgegroup@livingstreets.org.uk	\N	f	t	4	\N	living-streets
94	2021-05-22 15:17:43.191	2021-05-22 15:17:43.191	Rowan Art Centre	http://www.rowanhumberstone.co.uk/	Arts Centre for people with learning disabilities, providing a safe, creative and welcoming place to use the arts as a tool to bring people together, break down social exclusion and improve health and wellbeing. Evening classes for all.	https://www.facebook.com/RowanCambridge	https://www.twitter.com/RowanCambridge	https://www.instsgram.com/RowanCambridge	info@rowanhumberstone.co.uk	\N	f	\N	13	\N	rowan-art-centre
95	2021-05-22 15:17:43.191	2021-05-22 15:17:43.191	Simons Vegetable Stall	https://www.facebook.com/pages/category/Community/Simons-Local-Vegetable-Stall-on-the-Sunday-Farmers-Market-in-Cambridge-536598633028253/	Local grower from the Fens, selling organic produce on Cambridge Sunday market come rain or shine, always there. Self service stall opposite Great St. Mary's church	https://www.facebook.com/Simons-Local-Vegetable-Stall- on-the-Sunday-Farmers-Market-in-Cambridge-536598633028253	\N	\N	\N	\N	f	\N	11	\N	simons-vegetable-stall
98	2021-05-22 15:17:43.192	2021-05-22 15:17:43.192	Stand up to Racism	https://www.facebook.com/CambridgeSUTR/	Campaigning to combat racism and bigotry of all kinds while working towards a community united by mutual respect	https://www.facebook.com/SUTR/	\N	\N	\N	\N	f	\N	15	\N	stand-up-to-racism
100	2021-05-22 15:17:43.192	2021-05-22 15:17:43.192	Trumpington Meadows Reserve	https://www.wildlifebcn.org/nature-reserves/trumpington-meadows	Expansive nature reserve created for wildlife and people and run by Wildlife Trust. A place to discover and enjoy nature, explore diverse habitats, wander by the river and through flower filled meadows all managed for wildlife. Wildlife Trust office and garden.	https://www.facebook.com/groups/trumpingtonmeadowsNR/			trumpingtonmeadows@wildlifebcn.org	\N	f	\N	9	\N	trumpington-meadow-reserve
101	2021-05-22 15:17:43.192	2021-05-22 15:17:43.192	University of the Third Age (U3AC)	https://www.u3ac.org.uk/	Independent organisation organising educational, social and fitness activities for Cambridge people who are not, or no longer in full time employment. There are no age restrictions, welcomes new members.				office@u3ac.org.uk	\N	f	\N	10	\N	university-of-the-third-age-cambridge
102	2021-05-22 15:17:43.192	2021-05-22 15:17:43.192	University and College Union	http://www.ucu.cam.ac.uk/	\N	\N	\N	\N	\N	\N	f	\N	14	\N	university-and-college-union
103	2021-05-22 15:17:43.192	2021-05-22 15:17:43.192	Wandlebury Country Park	https://www.cambridgeppf.org/pages/category/wandlebury-country-park	Large country park on remains of a circular Iron Age hillfort on  the Gog Magog Hills just South of Cambridge, with wildflower meadows, woodland and viewpoints, plenty of space to walk and play. Has one of the most diverse range of tree species in the area, plus many interesting species of all kinds of wild flowers, insects, birds, pond life. Car park (charged). Magog Down is opposite.	https://www.facebook.com/CambridgePPF/	https://www.twitter.com/cambridgeppf	https://instagram.com/wandleburywarden/	enquiries@cambridgeppf.org	\N	f	\N	9	\N	wandlebury-country-park
104	2021-05-22 15:17:43.192	2021-05-22 15:17:43.192	Waterland Organics	https://www.waterlandorganics.com/	Small family run farm running community supported agriculture scheme (CSA) in Lode, growing organic vegetables and fruit, delivering local grown veg boxes throughout Cambridge. Welcomes volunteers via Cambridge Cropshare.  	https://www.facebook.com/WaterlandOrganics			form on website	\N	f	\N	11	\N	waterland-organics
134	2021-10-18 13:54:19.777	2021-10-18 13:54:19.777	Cambridge Rare Disease Network	https://www.camraredisease.org	Cambridge Rare Disease Network support families affected by rare diseases across the region helping reduce the isolation they feel and empowering them to have a purposeful and recognised voice within their community to raise awareness and influence policy development. 	https://www.facebook.com/CambridgeRareDisease/	https://twitter.com/camraredisease	https://www.instagram.com/camraredisease/	jo@camraredisease.org	\N	f	t	1	https://resilienceweb.ams3.digitaloceanspaces.com/upload_f1c83d5a6c81df46adc5ab6ff9292589.jpg	cambridge-rare-disease-network
107	2021-05-22 15:17:43.193	2021-05-22 15:17:43.193	Extinction Rebellion Youth	https://xrcambridge.org/youth	Local Extinction Rebellion group run by and for young people	https://www.facebook.com/xryouthcambridge	https://www.twitter.com/xryouthcambs	https://www.instagram.com/xryouthcambridge	xryouthcambridge@protonmail.com	\N	f	t	1	\N	extinction-rebellion-youth
112	2021-05-22 15:17:43.193	2021-05-22 15:17:43.193	The Lockon	https://www.facebook.com/thelockon	The Lockon is a reclaimed space for the community. They host Cambridge Community Kitchen and 2 community fridges, supporting many people in need.	https://www.facebook.com/thelockon	\N	\N	\N	\N	f	\N	7	\N	the-lockon
106	2021-05-22 15:17:43.192	2021-05-22 15:17:43.192	Women's Resource Centre	https://www.cwrc.org.uk/	Women's community space which offers a safe welcoming environment plus a realm of services to make life and living a little bit easier. Practical support and advice on issues uncluding debt, family and parenting, together with a mix of fun and practicial informal groups, workshops and networking events. Coffee room and free wifi.	https://www.facebook.com/CambridgeWomensResourcesCentre	https://www.twitter.com/CWRCPhoenix		info@cwrc.org.uk	\N	f	f	6	\N	womens-resource-centre
111	2021-05-22 15:17:43.193	2021-05-22 15:17:43.193	Cambridge Hunt Saboteurs	https://www.facebook.com/Cambridgehuntsabs	Protecting wildlife from hunting and persecution in East Anglia. Welcomes volunteers.	https://www.facebook.com/cambridgehuntsabs	\N	\N	\N	\N	f	\N	8	\N	cambridge-hunt-saboteours
113	2021-05-22 15:17:43.193	2021-05-22 15:17:43.193	Cambridge & District Trades Council	https://cambstuc.org/	Trades union councils are local groups of trade unionists. CambsTUC is the Trades Council for Cambridge and its surrounding areas.		https://www.twitter.com/CambsTUC/		secretary@cambstuc.org	\N	f	\N	14	\N	cambridge-and-district-trades-council
114	2021-05-22 15:17:43.193	2021-05-22 15:17:43.193	Cambridge People's Assembly	https://thepeoplesassembly.org.uk	Broad united national campaign against austerity, cuts and privatisation in our workplaces, community and welfare services	https://facebook.com/CambridgePeoplesAssembly/			cambridgepeoplesassembly@outlook.com	\N	f	\N	15	\N	cambridge-peoples-assembly
115	2021-05-22 15:17:43.193	2021-05-22 15:17:43.193	Unison Cambridgeshire County	https://unisoncambridgeshire.org.uk	Largest single trade union branch in Cambridgeshire, and part of the largest public services trade union, UNISON; with members working across hundreds of organisations and employers.	https://www.facebook.com/cambsunison			unison@cambridgeshire.gov.uk	\N	f	\N	14	\N	unison-cambridgeshire-county
135	2021-10-20 12:55:11.344	2021-10-20 12:55:11.344	Global Shapers Cambridge	https://www.globalshaperscambridge.org/	The Global Shapers Community is a network of Hubs developed and led by young people who are exceptional in their potential, their achievements and their drive to make a contribution to their communities. Communities focus on impact-driven projects and are organised locally. The Global Shapers Community was set up by the World Economic Forum.	https://www.facebook.com/cambridgeglobalshapers/	https://twitter.com/GSCambridge			\N	f	f	6	\N	global-shapers-cambridge
136	2021-10-20 12:58:30.93	2021-10-20 12:58:30.93	Cambridge CVS	https://cambridgecvs.org.uk	\r\nCambridge Council for Voluntary Service\r\n\r\n    A A A\r\n    High Contrast\r\n    Login or Register\r\n\r\n    Home\r\n    Covid 19\r\n    About\r\n    Join\r\n    Support\r\n    Training & Events\r\n    Funding\r\n    Volunteering\r\n    Documents\r\n    News\r\n    Jobs\r\n\r\nHow to find funding\r\n\r\nHow can we help you find funds\r\n\r\nGo\r\nHow to find support & advice\r\n\r\nCCVS provide services to member groups which include support, advice and one to one sessions fully tailored to your needs\r\n\r\nGo\r\nCoronaVirus Update\r\n\r\nGo\r\nVolunteering\r\n\r\nFind a volunteering opportunity\r\n\r\n \r\n\r\nHelp with volunteers\r\n\r\n \r\n\r\nSupported volunteering\r\n\r\nGo\r\n\r\n \r\n\r\nCCVS is a registered charity set up to champion and support community and voluntary groups, and promote volunteering across Cambridge City, South Cambridgeshire and Fenland.		https://twitter.com/CambridgeCVS			\N	f	f	5	https://resilienceweb.ams3.digitaloceanspaces.com/upload_a1983b94f6afa0f5f587bb579b0a41b8.jpg	cambridge-cvs
44	2021-05-22 15:17:43.186	2021-05-22 15:17:43.186	Camlets Local Trading	https://www.cam.letslink.org/	CamLETS enables members to exchange skills by means of a sophisticated barter system. You get things done for yourself by doing things for other people. We welcome members from all over the Cambridgeshire area and all kinds of skills are both valued and needed. Trading events that are open to prospective members are normally held the first Sunday of each month. Occasionally there are larger trading events that are open to the public. Click on the links below for further information.					\N	f	\N	5	\N	camlets-local-trading
29	2021-05-22 15:17:43.184	2021-05-22 15:17:43.184	Cambridge Doughnut	https://cambridgedoughnut.org.uk/	<p class="eplus-WqZmGP">We are a community group in Cambridge who are planning the Cambridge Doughnut project. We are building relationships with local government and other key organisations to help deliver this vision for Cambridge as a more just and environmentally sustainable city.</p>\r\n<p class="eplus-64oJzl">We seek to adopt the&nbsp;<a href="https://www.kateraworth.com/doughnut/" target="_blank" rel="noreferrer noopener">Doughnut Economics approach</a>&nbsp;for the city ensuring that&nbsp;<a href="https://www.un.org/sustainabledevelopment/" target="_blank" rel="noreferrer noopener">life&rsquo;s essentials</a>&nbsp;(access to nutritious food, decent housing, etc.) are afforded to all those who work and live in Cambridge without surpassing the climate and ecological boundaries of the planet.</p>\r\n<p class="eplus-YS2j82"><a href="https://cambridgedoughnut.org.uk/faq">Visit the FAQs page</a>&nbsp;to learn more about our initiative and the&nbsp;<a href="https://cambridgedoughnut.org.uk/join">Join Us page</a>&nbsp;if you&rsquo;d like to join our community action group.</p>	https://www.facebook.com/CamDoughnut			info@cambridgedoughnut.org.uk	\N	f	t	6	https://resilienceweb.ams3.digitaloceanspaces.com/upload_97a0ca66ea1be30bd6f4dfc49d8bde7d.jpeg	cambridge-doughnut
67	2021-05-22 15:17:43.188	2021-05-22 15:17:43.188	Friends of Logans Meadow	https://logansmeadow.wordpress.com	The Friends of Logan’s Meadow is a community group based in northeast Cambridge (UK) which supports our local nature reserve. We were formed in 2019 to promote the expansion and sustainable management of the Logan’s Meadow Local Nature Reserve, an important area of green space in the City of Cambridge.  We are keen to help secure a landscape which maintains the floodplain capability, is environmentally friendly and supports an increase in  biodiversity. We also want to promote increased public participation and involvement. Membership is free and open to all.		https://twitter/FLOM_Cambridge	\N	\N	\N	f	\N	7	\N	friends-of-logans-meadow
71	2021-05-22 15:17:43.188	2021-05-22 15:17:43.188	Friends of the Earth	http://www.cambridgefriendsoftheearth.co.uk/	Challenging environmentally damaging activities and policies by promoting sustainable alternatives.	https://www.facebook.com/groups/567182159981591/			camfoe@yahoo.co.uk	\N	f	\N	1	\N	friends-of-the-earth
72	2021-05-22 15:17:43.188	2021-05-22 15:17:43.188	Greenpeace	https://www.cambridgegreenpeace.org/	Cambridge Greenpeace are a diverse and dedicated team of environmental activists. We are creative and passionate in protecting planet Earth. We run campaigns in and around the city of Cambridge, as well as fundraising and putting on events, such as pub quiz and film nights. 	https://www.facebook.com/CambridgeGreenpeace/	https://twitter/CambsGreenpeace/	https://www.instagram.com/cambridge_greenpeace	form	\N	f	\N	1	\N	greenpeace
74	2021-05-22 15:17:43.189	2021-05-22 15:17:43.189	Hawthorn Farm Market Stall	https://cambridgesustainablefood.org/food-directory/cambridge-farmers-market	Local traditional free range farm selling eggs and poultry at their regular stall on Cambridge Sunday market (mornings only). All produce grown and prepared on the farm	\N	\N	\N	\N	\N	f	\N	11	\N	hawthorn-farm-market-stall
76	2021-05-22 15:17:43.189	2021-05-22 15:17:43.189	It Takes A City	https://streetsupport.net/cambridgeshire/it-takes-a-city/	It Takes A City – A Cambridge Homelessness Partnership. It Takes a City is a partnership providing a framework and mechanism to enable public, private and third sector bodies, and individuals, to work together in new ways to end rough sleeping due to homelessness. Our aim is not to deliver services, but to convene, clarify and coordinate, working with partners from across the community in new ways.		https://twitter/ittakesacity		coordinator@ittakesacity.org.uk	\N	f	\N	2	\N	it-takes-a-city
83	2021-05-22 15:17:43.19	2021-05-22 15:17:43.19	Net Zero Now	https://cambridgecarbonfootprint.org/what-we-do/net-zero/	Project supporting individuals and community groups to deliver carbon reduction activities in South Cambridgeshire, run by Cambridge Carbon Footprint with support from South Cambs. District Council	https://facebook.com/CamCarbonFootprint	\N	\N	\N	\N	f	\N	1	\N	net-zero-now
108	2021-05-22 15:17:43.193	2021-05-22 15:17:43.193	Cambridge Zero	https://www.zero.cam.ac.uk/	\N	\N	\N	\N	\N	\N	f	\N	1	\N	cambridge-zero
120	2021-05-22 15:17:43.194	2021-05-22 15:17:43.194	Zedify	https://www.zedify.co.uk/cambridge	Zero emission first and last mile deliveries by bike. Our 'ZEND' services offers national deliveries and a range of services with our partners Hermes and DHL. You'll get full visibility on all the deliveries from one portal and your customers will receive timely notifications and the ability to track and alter the delivery requirements as necessary.		https://twitter.com/ZedifyUK		cambridge@zedify.co.uk	\N	f	\N	4	\N	zedify
121	2021-05-22 15:17:43.194	2021-05-22 15:17:43.194	Green Pages	https://greenpages.org.uk/	Set up by a group of volunteers based in Cambridge, this website is a guide to living sustainably in and around Cambridge. Check out our directory for local businesses and online retailers who have everything you need to live more sustainably.		https://twitter.com/GreenPagesUK1		form	\N	f	\N	5	\N	green-pages
38	2021-05-22 15:17:43.185	2021-05-22 15:17:43.185	Cambridgeshire Community Foundation	https://cambscf.org.uk	<p>At the Cambridgeshire Community Foundation, we're dedicated to improving the quality of life for the people of Cambridgeshire.</p>\r\n<p>To advance our mission:</p>\r\n<ul>\r\n<li>we work with many partners to actively inspire philanthropy and increase permanent resources for the county of Cambridgeshire</li>\r\n<li>we invest in important community programmes through grants</li>\r\n<li>we provide leadership and a forum for dialogue on critical community issues</li>\r\n</ul>	https://www.facebook.com/cambridgeshirecf	https://twitter.com/cambscf		info@cambscf.org.uk	\N	f	f	7	\N	cambridgeshire-community-foundation
22	2021-05-22 15:17:43.183	2021-05-22 15:17:43.183	Cambridge City Foodbank	https://cambridgecity.foodbank.org.uk/	Cambridge city foodbank provides three days’ nutritionally balanced emergency food and support to local people who are referred to us in crisis. We are part of a nationwide network of foodbanks, supported by The Trussell Trust, working to combat poverty and hunger across the UK.				info@ccfb.org.uk	\N	f	\N	11	\N	cambridge-city-foodbank
39	2021-05-22 15:17:43.185	2021-05-22 15:17:43.185	Cambridge Sustainable Food	https://cambridgesustainablefood.org/	Cambridge Sustainable Food is an innovative and growing partnership of public, private and community organisations in Cambridge and the surrounding villages. We work with each other to promote a vibrant local food system all along the supply chain and in our community.					\N	f	f	11	\N	cambridge-sustainable-food
93	2021-05-22 15:17:43.191	2021-05-22 15:17:43.191	Romsey Town Community Garden	https://www.transitioncambridge.org/wiki/TTFood/RomseyCommunityGarden	Beautiful sustainable garden off Mill Road, aiming to bring the local community together in a space for leisure and relaxation. Grass area, flower and vegetable beds, herb garden, children's garden, wildflower area. Welcomes volunteers.				form on website	\N	f	\N	16	\N	romsey-town-community-garden
7	2021-05-22 15:17:43.181	2021-05-22 15:17:43.181	Adult Learn + Train	https://adultlearning.education/	Adult Learn and Train offer leisure and vocational courses in Cambridge throughout the year. Courses run in the evening,  daytime and occasional weekends. Course length varies on the provision. 				learnandtrain@cap.education	\N	f	\N	10	\N	adult-learn-and-train
9	2021-05-22 15:17:43.182	2021-05-22 15:17:43.182	Animal Rebellion Cambridge	https://www.facebook.com/animalrebellioncambridge/	Animal Rebellion is a just and sustainable mass volunteer movement that uses methods of nonviolent civil disobedience to end the animal agriculture and fishing industries, halt mass extinction and minimize the risk of climate breakdown and social collapse. 	https://www.facebook.com/animalrebellioncambridge/	https://twitter.com/RebelsAnimal		localgroups@animalrebellion.org	\N	f	f	8	https://resilienceweb.ams3.digitaloceanspaces.com/upload_613fefbdb2eb078c07cc216383440e69.jpg	animal-rebellion-cambridge
10	2021-05-22 15:17:43.182	2021-05-22 15:17:43.182	Argyle Street Housing Coop	https://www.ash.coop/	The Argyle Street Housing Co-operative is a housing co-operative in Cambridge offering shared accommodation for individuals who wish to have greater control over their housing situation than that offered by ordinary rented accommodation.				Chair@ash.coop	\N	f	\N	2	\N	argyle-street-housing-coop
11	2021-05-22 15:17:43.182	2021-05-22 15:17:43.182	Arjuna Wholefoods	https://arjunawholefoods.co.uk/	Arjuna Wholefoods is a workers’ co-operative in Cambridge fully and equally owned by those who work here. Offering delicious organic fruit and veg, a curated range of beautiful vegetarian and vegan products from tofu to chocolate, and also offer 100% vegan catering,				contact@arjunawholefoods.co.uk	\N	f	f	11	https://resilienceweb.ams3.digitaloceanspaces.com/upload_f48cb56877694d10745eda32270bdced.jpg	arjuna-wholefoods
12	2021-05-22 15:17:43.182	2021-05-22 15:17:43.182	Bread on a Bike	https://cambridgesustainablefood.org/food-directory/bread-on-a-bike	Bread on a Bike is a micro bakery based in Cambridge, run by Alison from her domestic kitchen just off Mill Road. Fresh naturally leavened bread is baked to order and available for individual customers to collect on Wednesdays and Fridays, while she bakes for commercial customers on other days. 			https://www.instagram.com/breadonabike/	breadonabike@gmail.com	\N	f	f	11	\N	bread-on-a-bike
13	2021-05-22 15:17:43.182	2021-05-22 15:17:43.182	Burwell Print	https://www.burwellprint.co.uk/	A social enterprise, training and supporting adults with learning disabilities, providing quality design and print.	https://www.facebook.com/BurwellPrintCentre/	https://twitter.com/BurwellPrint	https://www.instagram.com/burwellprint_centre/	info@burwellprint.co.uk	\N	f	\N	3	\N	burwell-print
14	2021-05-22 15:17:43.182	2021-05-22 15:17:43.182	Cam Conservators	https://www.camconservancy.org/	Conservators of the River Cam are the statutory navigation authority for the River Cam from Bottisham Lock to the Mill Pond in Cambridge.				river.manager@camconservators.org.uk	\N	f	\N	9	\N	cam-conservators
15	2021-05-22 15:17:43.183	2021-05-22 15:17:43.183	Cam Valley Forum	https://camvalleyforum.uk/	The Cam Valley Forum is a voluntary group, established in 2001. We work with our extensive network of partners to protect and improve the environment of the River Cam and its tributaries.				info@camvalleyforum.uk	\N	f	\N	9	\N	cam-valley-forum
131	2021-07-08 12:20:57.583	2021-07-08 12:20:57.583	The Edge Café Recovery Hub	https://theedgecafecambridge.com/	The Edge is a social enterprise run to provide a welcoming and supportive community space. We promote community-led recovery to support people to turn their lives around, the Edge is run by individuals who are on this challenging journey themselves. \nThe Edge is a place where community groups can come to meet, and where individuals can come to find more social interaction in their lives.	https://www.facebook.com/theedgecafecambridge/	https://twitter.com/home	https://www.instagram.com/theedgerecoverycafe/	gail@theedgecafecambridge.com	\N	f	f	3	\N	the-edge-cafe-recovery-hub
132	2021-07-12 21:42:30.87	2021-07-12 21:42:30.87	Friends of the River Cam	https://www.friendsofthecam.org/	\nYou are here\nHome » About\nAbout\n\nFriends of the Cam are a Cambridge based campaigning group committed to restoring the health of the river Cam and its tributaries for the benefit of nature. We are pledged to ending pollution of the river and overabstraction linked to unsustainable growth in the area. We have developed a charter to express these commitments which we invite others to sign.				contact@friendsofthecam.org	\N	f	f	1	\N	friends-of-the-river-cam
105	2021-05-22 15:17:43.192	2021-05-22 15:17:43.192	The Wildlife Trusts BCN	https://www.wildlifebcn.org/	<p>Manage local nature reserves, runs courses,advises on wildlife, mission to create a wilder future by protecting and restoring wildlife and wild places across the county. Welcomes volunteers.</p>	https://www.facebook.com/wildlifebcn	https://www.twitter.com/wildlifebcn	https://www.instagram.com/wildlifebcn/	cambridgeshire@wildlifebcn.org	\N	f	t	9	\N	the-wildlife-trusts-bcn
137	2021-11-21 17:15:22.186	2021-11-21 17:15:22.186	Illuminate	https://illuminatecharity.org.uk/	<p>Illuminate is a professional, not-for-profit specialising in wellbeing coaching and training to help people and organisations make positive changes.</p>	https://www.facebook.com/IlluminateCharity			info@illuminatecharity.org.uk	\N	f	f	3	https://resilienceweb.ams3.digitaloceanspaces.com/upload_51d888079a59241ada7938f7c602848a.jpg	illuminate
16	2021-05-22 15:17:43.183	2021-05-22 15:17:43.183	Cambridge 2030	https://cambridge2030.org/	Cambridge 2030 is a campaign group established in 2020 to address inequalities in Cambridge, UK.		https://twitter.com/cambridge2030		enquiries@cambridge2030.org	\N	f	f	6	https://resilienceweb.ams3.digitaloceanspaces.com/upload_ccb3491721b8013eaf3c7a85e512005a.jpg	cambridge-2030
17	2021-05-22 15:17:43.183	2021-05-22 15:17:43.183	Cambridge Area Bus Users	https://cbgbususers.wordpress.com/	Working for bus passengers in and around Cambridge				contact.cabu@gmail.com	\N	f	\N	4	\N	cambridge-area-bus-users
18	2021-05-22 15:17:43.183	2021-05-22 15:17:43.183	Cambridge Canopy Project	https://www.cambridge.gov.uk/cambridge-canopy-project	The Cambridge Canopy Project is a pilot project of the Cambridge City Council aiming to increase tree canopy cover in the city, which will help the city adapt to climate change.		https://twitter.com/CamCanopyProj	https://www.instagram.com/camtrees/		\N	f	\N	9	\N	cambridge-canopy-project
19	2021-05-22 15:17:43.183	2021-05-22 15:17:43.183	Cambridge Carbon Footprint	https://cambridgecarbonfootprint.org/	Raising awareness of climate change issues and supporting people in the move to low-carbon living	https://www.facebook.com/CamCarbonFootprint	https://twitter.com/ccfcambridge	https://www.instagram.com/camcarbonfootprint		\N	f	\N	1	\N	cambridge-carbon-footprint
21	2021-05-22 15:17:43.183	2021-05-22 15:17:43.183	Cambridge Churches Homeless Project	https://www.cchp.org.uk/	The Cambridge Churches Homeless Project (CCHP) is a collection of churches and a synagogue that work together to offer practical care and support to people who would otherwise be sleeping rough in our city each winter.				info@cchp.org.uk	\N	f	\N	2	\N	cambridge-churches-homeless-project
23	2021-05-22 15:17:43.183	2021-05-22 15:17:43.183	Cambridge Cleantech	https://cambridgecleantech.org.uk/	Cambridge Cleantech is a network organisation supporting the growth of sustainable, ‘clean technology’ companies in the United Kingdom. Our members range from start-ups with smart ideas in sustainable energy, water and waste, to multinational conglomerates working to reduce their environmental impact.	https://www.facebook.com/CamCleantech/	https://twitter.com/camcleantech		admin@cambridgecleantech.org.uk	\N	f	\N	12	\N	cambridge-cleantech
30	2021-05-22 15:17:43.184	2021-05-22 15:17:43.184	Cambridge Food Hub	https://cambridgefoodhub.org/	The Cambridge Food Hub is an innovative food distribution system for the Cambridge area, aiming to increase the accessibility of sustainable food whilst supporting local producers and small businesses. 	https://www.facebook.com/cambridgefoodhub/	https://twitter.com/camfoodhub	https://www.instagram.com/cambridgefoodhub/	info@cambridgefoodhub.org	\N	f	f	11	https://resilienceweb.ams3.digitaloceanspaces.com/upload_5f31c94fd7ece2e5c3bfc7e6e0a5f347.jpg	cambridge-food-hub
31	2021-05-22 15:17:43.184	2021-05-22 15:17:43.184	Cambridge For Black Lives	https://www.facebook.com/Cambridgeforblacklives-112964063781671/	Black Lives Matter Cambridge is part of the movement to end structural racism both locally, nationally and internationally. 	https://www.facebook.com/Cambridgeforblacklives-112964063781671/	\N	\N	\N	\N	f	\N	15	\N	cambridge-for-black-lives
32	2021-05-22 15:17:43.184	2021-05-22 15:17:43.184	Cambridge Housing Associations	https://www.chsgroup.org.uk/	CHS are a social enterprise and charitable housing association that run a broad range of services across Cambridgeshire offering people opportunities to achieve a better quality of life.	https://www.facebook.com/CambridgeHousingSociety	https://twitter.com/chsgroup			\N	f	\N	2	\N	cambridge-housing-associations
33	2021-05-22 15:17:43.184	2021-05-22 15:17:43.184	Cambridge Hub Directory	https://www.cambridgehub.org/activities/ethical-network	The Ethical Network is a community of student societies working on social and environmental issues, campaigning, fundraising, volunteering and promoting engagement with the challenges in which they are involved. 		https://twitter.com/cambridgehub?lang=en	\N	\N	\N	f	\N	5	\N	cambridge-hub-directory
35	2021-05-22 15:17:43.185	2021-05-22 15:17:43.185	Cambridge Organic	https://cambridgeorganic.co.uk/	Fruit and veg box delivery service sourced from organic farms in the local area. We pack our veg boxes in Haslingfield just outside of Cambridge, and deliver them to homes in Cambridge and the villages and surrounding towns. 	https://www.facebook.com/camorganic	https://twitter.com/camorganic	https://www.instagram.com/camorganic/	info@cofco.co.uk	\N	f	f	11	\N	cambridge-organic
36	2021-05-22 15:17:43.185	2021-05-22 15:17:43.185	Cambridge Past Present and Future	https://www.cambridgeppf.org/	Local charity working to protect and enhance the green setting of Cambridge, and to celebrate and improve the important built heritage of the Cambridge area.	https://www.facebook.com/CambridgePPF	https://twitter.com/cambridgeppf	https://www.instagram.com/wandleburywarden/	enquiries@cambridgeppf.org	\N	f	\N	9	\N	cambridge-past-present-and-future
37	2021-05-22 15:17:43.185	2021-05-22 15:17:43.185	Cambridge Schools Eco Council	https://www.cambschoolsecocouncil.uk/	Cambridge Schools Eco Council, are a group of young people who normally meet the first Saturday of the month to discuss the climate crisis and how we can tackle it, and to organize the YouthStrike4Climate protests.	https://www.facebook.com/YouthStrike4ClimateCambridge	https://twitter.com/CamEco_Council	https://www.instagram.com/camschoolsecocouncil		\N	f	\N	1	\N	cambridge-schools-eco-council
40	2021-05-22 15:17:43.185	2021-05-22 15:17:43.185	Cambridge Unite the Union	https://cambridgeuniteunion.com/	Unite Cambridge Community Union is part of a national network of groups that form part of the Unite trade union. We are a campaigning organisation, which believes in solidarity and direct action.	www.facebook.com/groups/438650269531040	https://www.twitter.com/CambsUnite		James.Youd@unitetheunion.org	\N	f	\N	14	\N	cambridge-unite-the-union
41	2021-05-22 15:17:43.185	2021-05-22 15:17:43.185	Cambridgeshire Climate Emergency	http://camemergency.org	Leading a campaign to reduce total CO2 emissions for your area by 15% by end of 2020.	www.facebook.com/camemergency	https://www.twitter.com/CambsEmergency			\N	f	\N	1	\N	cambridgeshire-climate-emergency
42	2021-05-22 15:17:43.185	2021-05-22 15:17:43.185	Cambridgeshire Skills	https://www.cambsals.co.uk/	Cambridgeshire Skills is a well-respected adult and community learning service offering online and in person courses.	www.facebook.com/cambridgeshireSkills/	https://twitter.com/cambsskills		cambsals@cambridgeshire.gov.uk	\N	f	\N	10	\N	cambridgeshire-skills
20	2021-05-22 15:17:43.183	2021-05-22 15:17:43.183	Cambridge Central Library	https://www.cambridgeshire.gov.uk/directory/listings/Cambridge-Central-Library	<p>Cambridge central library, operated by Cambridgeshire County Council</p>					\N	f	f	7	\N	cambridge-central-library
47	2021-05-22 15:17:43.186	2021-05-22 15:17:43.186	Citizens Advice	https://cambridgecab.org.uk	We provide free, impartial, and confidential service offering advice on a wide range of issue, including benefits, debts, housing, relationships and employment.	https://www.facebook.com/cambridgeCAB	https://www.twitter.com/CambridgeCAB		caba@cambridgecab.org.uk	\N	f	f	6	\N	citizens-advice
48	2021-05-22 15:17:43.186	2021-05-22 15:17:43.186	Clean Wheels	https://www.transitioncambridge.org/wiki/CleanWheels/HomePage	Our intention is to promote the development of clean car clubs in Cambridge as key element of sustainable mobility. Clean means plug-in electric vehicles that create no tailpipe emissions on local journeys. Car clubs are able to offer their members the benefits of these advanced technologies without the costs and hassle of car ownership. 					\N	f	\N	4	\N	clean-wheels
50	2021-05-22 15:17:43.186	2021-05-22 15:17:43.186	Community Scrapstore	https://www.cambridge.gov.uk/scrapstore	Our Cambridge Community Scrapstore sources interesting and unusual arts and crafts items that members can buy at a low cost. We encourage reuse and recycling – materials are often unwanted goods from local businesses and individuals.	https://www.facebook/camscrapstore		https://www.instagram/camscrapstore/	playeast@cambridge.gov.uk	\N	f	\N	7	\N	community-scrapstore
52	2021-05-22 15:17:43.186	2021-05-22 15:17:43.186	Crop Share	https://cambridge.cropshare.org.uk/	Cambridge CropShare is a small-scale community-supported agriculture (CSA) scheme in Cambridge that started in 2011 and is run as a partnership between Transition Cambridge and Waterland Organics. We organise trips to the farm where anyone can join in with seasonal tasks, e.g. sowing seed, planting (on the tractor-pulled planting machine), weeding (perhaps on the lay-down weeder), harvesting (perhaps trailer loads of multicoloured squash). You then get to take away whatever freshly picked veg or fruit is available on the farm on the day, and have a bring and share meal back at the farmhouse. And of course enjoy a fun and social day filled with farming in the Fen!		https://twitter.com/CamCropShare		cambridge@cropshare.org.uk	\N	f	\N	11	\N	crop-share
53	2021-05-22 15:17:43.186	2021-05-22 15:17:43.186	Curiosity and Imagination	https://www.cambridgecandi.org.uk/	Cambridge Curiosity and Imagination is an arts and well-being charity working with artists to build creatively healthy communities. We enable people of all ages to discover their own powers of imagination and curiosity and enjoy living, learning and working alongside each other.  	https://www.facebook/cambridgecandi/	https://twitter.com/CambridgeCandI			\N	f	f	13	\N	curiosity-and-imagination
54	2021-05-22 15:17:43.187	2021-05-22 15:17:43.186	Daily Bread Co-operative	http://dailybreadcambridge.org/	Daily Bread is a workers co-operative. Our co-operative is a business that is owned and controlled by its workers, so we are not accountable to outside share holders.  We are committed to providing good, wholesome food at a fair price, avoiding the exploitation of others, including our customers. 	https://www.facebook.com/DailyBreadCambridge	https://twitter.com/DB_Cambridge	https://www.instagram.com/dailybreadcamb/	cambridge@dailybread.co.uk	\N	f	\N	11	\N	daily-bread-cooperative
55	2021-05-22 15:17:43.187	2021-05-22 15:17:43.187	Darwin Nurseries	https://www.cpft.nhs.uk/darwinnurseries/	Social business running shop and plant nursery supporting adults with learning disabilities. Our farm shop is well stocked with a wide range of produce from local producers. Explore our 7.5 acres and meet the ever expanding menagerie of goats, sheep and pigs, chickens and rabbits. Take a wander round the fledgling woodland with its lovely mini cottage nestled amongst the trees for the children to investigate then check out the greenhouse stocked with seasonal plants, hanging baskets and vegetable plants. Relax with a drink and a delicious cake in our drinks area or if it’s lovely weather why not have a picnic outside in the woodland area.				christine.millar@cpft.nhs.uk	\N	f	\N	3	\N	darwin-nurseries
56	2021-05-22 15:17:43.187	2021-05-22 15:17:43.187	David Attenborough Building	https://www.cambridgeconservation.org/david-attenborough-building-synergy-project/	The David Attenborough Building in central Cambridge is a hub for global biodiversity conservation. The Building is home to academics and practitioners engaged in many aspects of understanding and conserving the natural world, ranging from zoological research through to work to protect the world’s pristine habitats and precious species from destruction.	https://www.facebook/cambridgeconservation.org			reception@cciservices.co.uk	\N	f	\N	5	\N	david-attenborough-building
57	2021-05-22 15:17:43.187	2021-05-22 15:17:43.187	DIY Thermal Imaging	https://cambridgecarbonfootprint.org/what-we-do/thermal-imaging/	Come to a short training session to learn how to use our thermal cameras and interpret their images – then you can borrow a camera to survey your home, those of friends or family and (we hope) others in your neighbourhood. It’s great to see your home in a new light and it provides good motivation to fix any problems that are revealed.	https://www.facebook.com/CamCarbonFootprint	https://www.twitter.cpm/ccfcambridge	https://www.instagram/camcarbonfootprint	\N	\N	f	\N	1	\N	diy-thermal-imaging
60	2021-05-22 15:17:43.187	2021-05-22 15:17:43.187	Extinction Rebellion Cambridge	https://xrcambridge.org/	Part of the national movement taking direct action to raise awareness of the climate and ecological breakdown and the sixth mass extinction happening now, welcomes new members.	https://www.facebook.com/groups/xrcambridge/	https://twitter.com/xr_cambridge	https://www.instsgram/xrcambridge		\N	f	t	1	https://resilienceweb.ams3.digitaloceanspaces.com/upload_aa8179cf8810e297972e0acb20d42033.jpg	extinction-rebellion-cambridge
84	2021-05-22 15:17:43.19	2021-05-22 15:17:43.19	Nightingale Garden	http://www.nightingalegarden.org.uk/	<p>A 'biodiverse garden for everyone to enjoy', created by volunteers. In a former bowling green in the corner of a City Council recreation ground. Open everyday during daylight hours - always free. Wide variety of plants, nature pond for careful pond dipping, covered places to sit and meet, simple activities for all ages. Regular garden volunteering (currently in small groups) and calendar of social events. Friends Group for support. Small car park for the park (3 hours max). No toilet access until park pavilion is rebuilt (expected 'sometime in 2022').&nbsp;</p>	https://facebook.com/NightingaleGardenCambridgeUK			info@nightingalegarden.org.uk	\N	f	t	16	https://resilienceweb.ams3.digitaloceanspaces.com/upload_f5b70502f9e4d3bee633451077d8c78f.jpg	nightingale-community-garden
49	2021-05-22 15:17:43.186	2021-05-22 15:17:43.186	CoFarm Cambridge	https://www.cofarm.co/cambridge	<p>Addressing multiple impact areas - climate, biodiversity, health equality, community cohesion, inclusive economies - through a new model of community-based agroecological farming we call &lsquo;cofarming&rsquo;. You can support them through volunteering or using their grocery services.</p>	https://www.facebook.com/CofarmHQ	https://www.twitter.com/COFARMHQ	https://www.instagram.com/cofarmCambridge		\N	f	t	16	\N	cofarm-cambridge
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: prisma-crw
--

COPY public.sessions (id, user_id, expires, session_token, access_token, created_at, updated_at) FROM stdin;
1	1	2021-06-21 14:23:12.95	fc129b17bdf0b5e8697c8cc1e8d5ceb5b8ec0bac84dd35600aa13545af5f12ec	66cde815929c6fa71d31dd276a7e3cd0a24c94666922514a4ae67a74c91dee7d	2021-05-22 14:23:12.953	2021-05-22 14:23:12.953
2	1	2021-06-21 14:31:44.351	5d770460d4e7c7b3bef1014c2da7e77f5b9de3be1f6a567aa2e941b7e440502c	47396de70cfa45b81f8c3f42fc4ea47adb99f2174186d4ec58164684170de09d	2021-05-22 14:31:44.352	2021-05-22 14:31:44.352
10	6	2021-08-17 22:51:20.684	8dc7a909f68916d18cca4629928bd00fb043a545ed06e97655c4ffe4dc0a5534	d3bb6b49fa8359ce1023bdb73bbb7d1dfea1c29252cc88210e16c9e25e4536b3	2021-07-18 22:51:20.686	2021-07-18 22:51:20.686
28	7	2021-08-27 23:42:33.444	70b410d10044e1c85dc2853f5bcbf0cca0d86ad737c8fb28cfbf58d04acf69ed	62aa47903bc540833a4d9f20183d26a16d1f254b446783424826805bdf7899fd	2021-07-28 23:42:33.445	2021-07-28 23:42:33.445
5	2	2021-07-03 19:09:56.386	b801af2485300e106dc75964f523f0a3dd287fea229ca3938d27e1644104d37d	a2f058eec1302df16ae3f38a5eb5ab23a495d6216d74de60713c1e3608084fea	2021-06-03 19:09:56.386	2021-06-03 19:09:56.387
6	3	2021-07-03 19:18:45.635	4d1a4594e7fd0f84da4979b917a07e338b6b2fa4bf2278f0eae9737f70817433	585d83e249e611d19e4f22a5667bebeaad0f1d625abe6cba037ddc8c6ef02e9a	2021-06-03 19:18:45.636	2021-06-03 19:18:45.636
41	7	2021-09-09 00:35:11.147	a0f3a63065504ea78c367713d8399f9687b1d44749022422490a47b382621de5	b598a0e8f85eeac0e6a2ccd7487e6ff6ed83b19e98f297a2e714d51287047b0e	2021-08-10 00:35:11.148	2021-08-10 00:35:11.148
42	7	2021-09-09 00:45:37.026	faae9537a66c836c08befd6f5c72bc5876af9ac0944b40e37eaa8131fd928486	77682c1a2348146782ff9d937a7cbdf1be9c68c6f671a65f5d53f7063b11ecd9	2021-08-10 00:45:37.027	2021-08-10 00:45:37.027
49	18	2021-09-16 13:58:49.54	e7018202ef1a96ca1c29e6fa50d72b6c29fafe219d17e9513860a7d809abc166	1d3bb2c0b1f17d4e56e86cb587959bc927d7efbb154f93328a5617da8855decd	2021-08-17 13:58:49.542	2021-08-17 13:58:49.542
50	18	2021-09-16 13:58:49.562	c1c46fd38ba3c438cfe70d82168ae58db9ba99de7063d599ea903c84f74d3304	52044c9077b2b71ede627ae89b4a272848a038b07ea7c2cdc7f8f44a687a1b96	2021-08-17 13:58:49.563	2021-08-17 13:58:49.563
29	7	2021-09-02 17:14:03.271	cff61ee263b62c5382beb27c2809f4b55c5304a52c7f107562e1fff2d2ccbf04	529b34c2238c0749574c7a4005a29c721c2a75a4a582d570f14dfbff24f6c75a	2021-08-03 17:14:03.272	2021-08-03 17:14:03.272
7	4	2021-09-03 18:06:00.335	a6bc01e7ce8a14ea6fb56bd498bb816d638579f6ec4813a211cc0c66ba24ffe5	011a2eeac3b80fd6e3e75e1707e851759e5172f5320815b96b8827dc627b3088	2021-06-03 20:04:49.22	2021-06-03 20:04:49.22
51	4	2021-09-17 18:28:15.269	cac8c45123a037dd598706268fea4e4c1b9b73eba14ec51790b42737463578ee	eec73cd718ab9d47e33e3fc4b6685c9edfb7f665391444a72cc4b87e35d04f38	2021-08-18 18:28:15.27	2021-08-18 18:28:15.27
8	5	2021-07-26 13:54:12.462	0f263f050447478721388472c1e219dd00b57540d4193386c83fb40e3e35607b	88210d94e843227f15b11593b3cee794e37982b6aeae3de89c8994fbc710a98d	2021-06-24 17:30:54.193	2021-06-24 17:30:54.193
18	1	2021-08-26 23:32:49.483	e0c774efb5561efc551188bc1570901204ab45a90d6d3095cc74a853f3675328	1d52d172327b77fb8d0fbe55be17bb55bfb8712a0ecf7f32abf7194d8b2f2936	2021-07-27 23:32:49.484	2021-07-27 23:32:49.484
19	1	2021-08-26 23:37:35.823	4b5ac6a683c5c5062770c2f7884b5d77291d1d78c0f5640c04b44a4820837fc5	5215f7df54bd928608516c648ff52158ed4b4426b56e69439ec1a83c0f41d475	2021-07-27 23:37:35.824	2021-07-27 23:37:35.824
24	1	2021-08-27 23:37:41.403	6b393c042286bf1fa840128d3cb01703ab89899b9b59ed9dfd37b7188e9ed527	929c50f00289edcfc58e8e40b39a7587b82f18e4f671d680646ad35189565f30	2021-07-28 23:37:41.404	2021-07-28 23:37:41.404
25	12	2021-08-27 23:38:16.33	5c296bd0bdb96cf7969ce0010bb0cd9a5187a913aea0f43cd2adceea4e7f94ea	e53f6675e5a4812679b90dfba7cc59934692978ce4c3bd47c061af579b4b8f89	2021-07-28 23:38:16.331	2021-07-28 23:38:16.331
31	7	2021-09-06 18:05:26.07	0a49601c1871c478a8e200f0cdfa87620e5081329ecee80c52ed794855a71aff	ba26414903880abceb7555a72da943ffa0bb870452851bda4e14e470ffac478b	2021-08-07 18:05:26.071	2021-08-07 18:05:26.071
32	7	2021-09-06 18:05:26.186	29c5229d9f710c862c74a2ad358417d0a64b86e0ec5222b7ddfaa54c66b41ed7	610821ec0124fabe7a67885e001d06c011dfae2d260e1a664676e4b99f25ecb9	2021-08-07 18:05:26.187	2021-08-07 18:05:26.187
33	7	2021-09-06 19:31:21.612	a1ef73fcd5629821145cfa3710889486c4200f80b76892bac54192866de959f8	cde5de73fa31b713e110ffdbdff41c404c8d2cbf202ae68b98ce26817b4fc948	2021-08-07 19:31:21.613	2021-08-07 19:31:21.613
34	7	2021-09-06 19:31:47.555	bb28a3f3a5af234a6db2e31bf12d55434dee99876ba39de8093b42f1fe01c0ff	6b1c8142ce47c14121167ebadba68a026ba71cb903e05ada4fad7b04a0607626	2021-08-07 19:31:47.556	2021-08-07 19:31:47.556
35	7	2021-09-06 19:31:47.641	57cb3660de2d9d44b944fbfe564cab22dad0338db5155f65514cfb319b34f5de	61ed5b7778bc44595ad11917898bd68dc03450f6f4c948d0b4bbfdfbfb5915ac	2021-08-07 19:31:47.642	2021-08-07 19:31:47.642
38	15	2021-09-06 20:18:38.986	5520c57583aa47803c52ea1f11007de8735341696979cb835d1eaad2e6f179aa	6fb824f72ce3eaaec2efde138a455146a9617a30b047f147e479c5dc087f6e19	2021-08-07 20:18:38.987	2021-08-07 20:18:38.987
40	16	2021-09-07 14:23:13.995	92ae567944267d5cd5875ea25d3c7ba4c2e6b31fbf173e6f661d80a3cc899b91	76501f213ef2d69f586c7291496e8d45ccdf3f66e8898e2729f7c3421bbaf022	2021-08-08 14:23:13.996	2021-08-08 14:23:13.997
52	19	2021-09-17 22:01:19.892	5826cf89fb209aa7c7e2d449cea9382cb33ce3b550ae1bb9ba366b9d958b8141	b047e77d7e6bdf96588d6d61301ae8db5cc97bbd592f79d470dccff5870652dc	2021-08-18 22:01:19.893	2021-08-18 22:01:19.893
53	20	2021-09-18 19:14:09.221	84e2e2c3b961b84ecf91845ef0561e19c77e0d28e677d479bd90270096e5c8e1	5d78f1f0cf03ef4331b129a1c4c6882254875e57069e0df3e93429f891be8646	2021-08-19 19:14:09.222	2021-08-19 19:14:09.222
45	1	2021-09-12 21:42:17.632	5dab639beda46a1bb35930e97f26bc38f163a406590380afb13096db41aaeb77	de7362839fe0e801aee3f9b6c5d47fae37eec39e51414dd1b0dca8bb962585e5	2021-08-10 22:23:44.816	2021-08-10 22:23:44.816
55	4	2021-10-05 21:40:48.307	ec66c3298f85aa4767f72f9ba24c9bad534a95193add9b5df9b4479164a1eb37	c2d274d4c68d3131ed0e21bc154f184d7212c9d69ae696eb0de6271169991727	2021-09-05 21:40:48.308	2021-09-05 21:40:48.308
61	1	2022-01-11 08:47:16.684	d27f088eb1725ba7dc7d6ae47fc7fb5317090774db724181e9bb54436a2bcb99	598b55f9c651a5216b5447f553a288d8dabf04236f02fcc7d74b32ef0bec2381	2021-09-22 22:28:20.112	2021-09-22 22:28:20.112
47	18	2021-09-16 10:04:46.988	253952bf02fa9c2206f3305f36b974045bb905af7485cf9bd85b4433c40b0c5e	e9803f59924939af79525fe068e05b19e3a1dbbb2b1e1f34f5517dc4662c1455	2021-08-17 10:04:46.989	2021-08-17 10:04:46.99
48	18	2021-09-16 10:06:03.621	b6fa195a12a663fe98cf75c49aff5ab1694fe79aabfdd20fea5439a7b1ab79b1	fec1a71516745102296a77778edf4c9b22eb9b06edae1c5a9c0abbf651da7d13	2021-08-17 10:06:03.622	2021-08-17 10:06:03.622
56	1	2021-10-13 23:01:23.446	a4b49707553e3df843c8dc339c526db967d2d60fbbf5fd03f61ee0f26038ffa3	abcf19c60bf147d2ca49b65bcc2d3bc29ea69f035124793a0f8aa48d468ae226	2021-09-13 23:01:23.447	2021-09-13 23:01:23.447
62	23	2021-11-06 15:15:35.79	0949f3f58219aa701f3c88bbca90f012541fcb2026538da227857ba53ec61d75	86c43230244db2a56c895559fb628025c70b78f2a1e9dede3bc190d3a567f0be	2021-10-06 14:18:39.315	2021-10-06 14:18:39.315
37	1	2021-10-13 22:54:27.781	f860d663bfeeacc6fc800b20dac9859165bec8000012550f8b8316fe5af90457	aff61e4e7d2bcc659e4695a25fe5a69170af6372eec072a801b6ed65d4066d69	2021-08-07 20:17:32.647	2021-08-07 20:17:32.647
58	22	2021-10-16 20:51:01.893	bf99f12c2e5020c85ee62f68fdf5dae684efd05bcbf5550bbc0fa5c29c7534fc	98b3ddebc311906f4c2ea87407e7d902f2fde651eef9de253ecf269e929ac5db	2021-09-16 20:51:01.894	2021-09-16 20:51:01.894
54	21	2021-10-16 21:01:54.973	304fee8a2d261765ce75f668816f1a407a2da7da90f990adbc1f0cbee9599d64	3cdd469f17b897e743c500f076c2b988caf00f0eeb9dfb894f16f317cc9623c2	2021-09-05 17:44:39.677	2021-09-05 17:44:39.677
59	1	2021-10-19 14:47:17.14	64291baf9da1010a5f63a31772f74652ae81a1935f985d1179458428150f16b0	5d6f4044ebeb189cea56ac05a8197340007cd025e4d8a54d20c41633db6dba9e	2021-09-17 08:52:29.807	2021-09-17 08:52:29.807
4	1	2021-11-17 13:51:21.75	4df512bbc911775d716ee766984e2ae935e73e86ccbbe06eb319d058a74d089d	6001d1f6ef67da6761edda6f22b375359a7b94bbcffb9748df6d7d07f7ffaa15	2021-06-03 14:03:49.929	2021-06-03 14:03:49.929
57	1	2021-11-19 09:41:53.259	1955230a2978dc72782f7279f9e0620f18b224a7887b082c4351715287545ef2	2688114663afc7ee26bdd6fbb1992ad4192a286375496ce996f42f39fee4653f	2021-09-13 23:03:23.191	2021-09-13 23:03:23.191
63	24	2021-11-06 13:13:25.364	5b4f00ea2112d63955f2a9493979bc2e81130c611732401944b51e20207bf462	ffe8396e3556ca3c0b4cb3a1cb18f3d513de648a2f55f1d2bd61283e97bc2592	2021-10-07 13:13:25.365	2021-10-07 13:13:25.365
64	24	2021-11-06 13:21:07.51	fd94589c7f0791599d6f35ffa478846f51bfc9c0ec4ac35a092e6fe27528dff2	c06fa9c062a67c5963e410b9bf951edb5e34a28f72d30bd4675548103b316dbf	2021-10-07 13:21:07.511	2021-10-07 13:21:07.511
66	25	2021-11-06 13:29:24.721	4e3f2bb6cb4dc3ef7aaa8b64b8b13c235cc5b3001aeddefc56d49535c96f65d5	56e0eebaa6220758c4e332c8fe4178d9494d60cb2091db0e9c7771ac921686cc	2021-10-07 13:29:24.722	2021-10-07 13:29:24.722
67	25	2021-11-06 13:29:34.221	98cb5f950c7b5008262abc5f3e7a626145d6c1e9f7d8a4a0f8d3fa3d6a1249f3	b630727bebd2961ddda434765d7ae792e7cec069879747f87c04bfebfaad4055	2021-10-07 13:29:34.221	2021-10-07 13:29:34.221
68	26	2021-11-06 16:10:15.569	0fb2274647ed9cb269b762ecdd80d53b77be593023bd696c651200d695954bcf	1a5c16bef1eae7c735864c3c76aeb5e425898c49c26d8302e80d5ec868fc54d4	2021-10-07 16:10:15.57	2021-10-07 16:10:15.57
69	27	2021-11-06 21:12:47.292	57b873ab9487310583a041260dba1fe589936d0d2657e92f01acf1effe533115	72a475f7d0ae78e7560de0a8dab068100cf9c2310e0ea7b0a694fd888cad9f9e	2021-10-07 21:12:47.293	2021-10-07 21:12:47.293
78	32	2021-12-22 13:29:49.015	a386a93bf6a7c350e8350443b7ce841045ddc38c21b504c8b5fd21887b0e2297	35b7d238ae53bded3c95acf6a542efd6391978f029fc8e40bcffe6bb717760db	2021-11-22 13:29:49.019	2021-11-22 13:29:49.019
79	32	2021-12-22 13:30:16.076	c6224582cc5437fbd8eee607fdb0c06cd3264abf9fc6bedf385b5a63eb84b094	ec8acb56e2cc48831d2f2f81095a12bc3880f966e7ed153cc4ab205638eb92b1	2021-11-22 13:30:16.077	2021-11-22 13:30:16.077
80	32	2021-12-22 13:32:00.196	89e1952693d3907f55db129b6cd1daafe18f2f1d5b6c5a662132a165f4bef512	ccf3fc568a74ea94c5d03afe7e9b73a8b90b2d4b0bb23df67025d8f612d337e7	2021-11-22 13:32:00.197	2021-11-22 13:32:00.197
65	24	2021-11-14 15:23:16.942	5c1b93b33d1786ef5ee0c5a9a9d2f5b8ab380a2ebe9b925f0a18b7784a8143dd	4659239d2ed245d4b99a960d5a8d1e0dfffce02d7c3870fe9d8710c4723eb3c7	2021-10-07 13:25:07.977	2021-10-07 13:25:07.977
81	33	2021-12-25 23:04:47.21	8b2ef9cd8f81aaa49f595969254c1f09f2ed2da72bbc6bc8474d1a71b73d0654	91ade34a6a14dc906d25c62af1be913dd0f1886a5309e9d53b320b2a323df650	2021-11-25 23:04:47.211	2021-11-25 23:04:47.211
82	34	2021-12-26 23:24:51.619	014b83e721f92e9b4dc09fffa52d82d8cb0d405605403752b5e0c368a2b911d6	dbc96e4bc9b13e9f192a2f3bad0e9c2ddefff227da9407dcb10a2f5a1e831cd5	2021-11-26 23:24:51.62	2021-11-26 23:24:51.62
70	28	2021-11-17 16:29:46.932	c97803ad6eb9b154ca0c0c11ac7e5819737c32c535b2a057860a6e9bac12a1f6	493741ffd4ee296f6bd7a3b21bfa38e46288c7ca4c006a686ad0ce31392463d1	2021-10-18 16:29:46.932	2021-10-18 16:29:46.932
60	5	2021-11-18 12:02:23.982	b0366b5b666f9fef18b82c79dfb6430afdfe18fe2dd27ba90037e001d4411547	d6fdde85777e93a472d4822b3090201f4844450d593b3741773dc301300e3fe8	2021-09-18 11:18:27.642	2021-09-18 11:18:27.642
72	1	2021-11-19 09:46:13.28	417498dfb376d076d596050ea989ed50e779db355d900190570c81b76a87fe13	6b83547782281fe0e534d6f95bc6adaf762b1a0896fd20324cf8c4678c1ccaa0	2021-10-20 09:46:13.281	2021-10-20 09:46:13.281
74	5	2022-01-14 13:37:21.978	37dba708d76ddca9f0f5d28f2600f7023deb38f4b06a6660ab8a3002831df295	17ee82a040dc4d9d10ebfe5b93705ff32d159c1b48a245ba82ed8330aa16e5f2	2021-11-21 20:49:18.884	2021-11-21 20:49:18.884
88	4	2022-01-19 16:47:40.652	a96892240564908cd9385e64dc36b7d84a91eadaec0e514e9b5f274c27e14778	d9167576911da9f138b325a33f150ad8ac75d259cadec0384ef3818bb327be1b	2021-12-20 16:47:40.653	2021-12-20 16:47:40.653
89	4	2022-01-19 16:47:41.351	785bda09e5a46e210afc57928d991dac18535046acbb0494ccbe5f60bca49f47	81af4c3f87e63ffe8673148411e82644f49b1a086ec638e34b98ceb73eab09db	2021-12-20 16:47:41.352	2021-12-20 16:47:41.352
90	37	2022-01-19 16:48:15.168	70f7f3b89f9dac73bb073c557f9c676b516bb87ce945817d231e4e5fb287120b	25f8365df2b16675c82933c6f385b6461ba2510e60bdc311e092dd9933fc18dc	2021-12-20 16:48:15.169	2021-12-20 16:48:15.169
83	35	2022-01-05 17:14:38.26	0840de2e5cb793e71933bdeb8e6467fdce90502f4c98d044045c871146659c48	ff08d0a57bdbc77868f6b48a9296a63193a932c5c8bfbd98a47f52fa92156103	2021-12-06 17:14:38.261	2021-12-06 17:14:38.261
84	35	2022-01-05 17:14:38.3	2e417c327006dd7831795768caae26e03c12ecc5c84757f0c7c12c6a22e757b6	3abf5d1275b09881743632811fd7dcfa9aac533be70d26b9b8b9f408ee50bca4	2021-12-06 17:14:38.301	2021-12-06 17:14:38.301
91	1	2022-01-19 16:56:12.813	8cbee00442e45ec682637a486a5962b12db59f3aff4e37ab94cd600ef1ba4cde	72e73d01247cf369e4af58470d10af28cdb4c23256e144e2e2ac7c7f5f9fe2cc	2021-12-20 16:56:12.814	2021-12-20 16:56:12.814
85	35	2022-01-05 20:16:07.93	9eb4b6f7e7b0cf00fd5373a94b34034915608a9718cde381c4b8f47768dd24e7	408c0e11b7c4b044225ecd044717d1d3aeeb395d65f52cdcc32775d2d48ca1a8	2021-12-06 20:16:07.93	2021-12-06 20:16:07.93
86	36	2022-01-06 09:13:48.134	94887ed76946fca1378fe7a5e6f54fd9e498e5a20a4e67cdae15309161b176c6	7b8b0bbb9904a9ec99c4ef5a1967dda4d4c80391b72c44ed9ca444db3ce64056	2021-12-07 09:13:48.135	2021-12-07 09:13:48.135
92	4	2022-01-23 07:54:14.813	15363922f23a4f9a71c0034cbbd2f9f1a38e871540ef2bfba719d43c2e2b630d	99c178af3b64afd173d4a0356a60e0ef910d8596b949f4a464709d727dacc92c	2021-12-24 07:54:14.814	2021-12-24 07:54:14.814
75	29	2021-12-22 04:47:07.577	b5ea0df7c057127cc4ff4e19a4ec3304046df97375e5348d43959a338f875f47	2bc012f0c2d517602647202357030545b615b5ce6fc3897d73387bda535b6eab	2021-11-22 04:47:07.578	2021-11-22 04:47:07.578
76	30	2021-12-22 11:52:20.303	35ba02653579e39f1329aca88a207f6b276f7401c34a58abd34d14eaff58dc39	4104ddb804f3d0dc0b11c07d23f767cdd869416690071cb6dcefda73b1dd2e68	2021-11-22 11:52:20.304	2021-11-22 11:52:20.304
77	31	2021-12-22 13:01:22.468	12bdf610af6d37233970b92a030dc01cf931a1eb5c48cb4a408515fa635b3eb6	ef885daf3ce3a6dd768fc111c3be1b7b07c008c597108890587d7e89bcc41de6	2021-11-22 13:01:22.469	2021-11-22 13:01:22.469
87	35	2022-01-10 21:21:21.358	4738fc39db46052d54788636097c74fac410a9870784179e22f0f67d235c13e8	e0b423865a1d35ca8759e43570d7035963a612f6f8cfcb91c8cc6f433441c399	2021-12-11 21:21:21.359	2021-12-11 21:21:21.359
73	1	2022-01-27 00:15:18.381	e3ca9fe2d60f73501a660315bd2274fbfa6129c586f9c2403d3641d34cdf5759	b2c73c417300cb53c05fb90cc463a6752a46bcefaa3134c4110f4170aafdaa3a	2021-10-20 12:54:03.42	2021-10-20 12:54:03.42
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: prisma-crw
--

COPY public.users (id, name, email, email_verified, image, created_at, updated_at, admin) FROM stdin;
26	\N	contact@camcycle.org.uk	2021-10-07 16:10:15.558	\N	2021-10-07 16:10:15.561	2021-10-07 16:10:15.561	f
27	\N	cambridgepeoplesassembly@outlook.com	2021-10-07 21:12:47.282	\N	2021-10-07 21:12:47.283	2021-10-07 21:12:47.283	f
28	\N	jo@camraredisease.org	2021-10-18 16:29:46.913	\N	2021-10-18 16:29:46.914	2021-10-18 16:29:46.914	f
2	\N	ismail.diner+admin1@gmail.com	2021-06-03 19:09:56.285	\N	2021-06-03 19:09:56.287	2021-06-03 19:09:56.287	f
3	\N	morrill.lena@gmail.com	2021-06-03 19:18:45.543	\N	2021-06-03 19:18:45.544	2021-06-03 19:18:45.544	t
6	\N	cambscommunitykitchen@gmail.com	2021-07-18 22:51:20.58	\N	2021-07-18 22:51:20.582	2021-07-18 22:51:20.582	f
5	\N	helen.cook@gmail.com	2021-11-21 20:49:18.864	\N	2021-06-24 17:30:54.089	2021-06-24 17:30:54.089	t
29	\N	info@nightingalegarden.org.uk	2021-11-22 04:47:07.554	\N	2021-11-22 04:47:07.555	2021-11-22 04:47:07.555	f
30	\N	info@naturalcambridgeshire.org.uk	2021-11-22 11:52:20.285	\N	2021-11-22 11:52:20.287	2021-11-22 11:52:20.287	f
31	\N	cambridgegroup@livingstreets.org.uk	2021-11-22 13:01:22.457	\N	2021-11-22 13:01:22.458	2021-11-22 13:01:22.458	f
8	\N	ismail.diner+admin2@gmail.com	2021-07-27 22:32:49.474	\N	2021-07-27 16:50:06.662	2021-07-27 16:50:06.662	t
32	\N	playeast@cambridge.gov.uk	2021-11-22 13:32:00.172	\N	2021-11-22 13:29:48.993	2021-11-22 13:29:48.993	f
9	\N	ismail.diner+admin5@gmail.com	2021-07-27 23:32:08.942	\N	2021-07-27 23:32:08.944	2021-07-27 23:32:08.944	f
33	\N	camfoe@yahoo.co.uk	2021-11-25 23:04:47.186	\N	2021-11-25 23:04:47.189	2021-11-25 23:04:47.189	f
34	\N	cambridge@acorntheunion.org.uk	2021-11-26 23:24:51.589	\N	2021-11-26 23:24:51.59	2021-11-26 23:24:51.59	f
10	\N	ismail.diner+admin9@gmail.com	2021-07-28 23:30:29.428	\N	2021-07-28 23:30:29.43	2021-07-28 23:30:29.43	f
11	\N	ismail.diner+admin10@gmail.com	2021-07-28 23:30:58.98	\N	2021-07-28 23:30:58.983	2021-07-28 23:30:58.983	f
12	\N	ismail.diner+admin11@gmail.com	2021-07-28 23:38:16.151	\N	2021-07-28 23:38:16.153	2021-07-28 23:38:16.153	f
36	\N	sam@illuminatecharity.org.uk	2021-12-07 09:13:48.118	\N	2021-12-07 09:13:48.119	2021-12-07 09:13:48.119	f
13	\N	ismail.diner+admin12@gmail.com	2021-07-28 23:41:47.3	\N	2021-07-28 23:41:47.301	2021-07-28 23:41:47.301	f
35	\N	secretary@cnhs.org.uk	2021-12-11 21:21:21.33	\N	2021-12-06 17:14:38.246	2021-12-06 17:14:38.246	f
14	\N	ismail.diner+admin13@gmail.com	2021-08-07 18:04:40.259	\N	2021-08-07 18:04:40.262	2021-08-07 18:04:40.262	f
1	\N	ismail.diner+admin@gmail.com	2021-12-20 16:56:12.797	\N	2021-05-22 14:23:12.771	2021-05-22 14:23:12.771	t
37	\N	transitioncambridge@gmail.com	2021-12-20 16:48:15.151	\N	2021-12-20 16:48:15.152	2021-12-20 16:48:15.152	t
4	\N	anna.mcivor@gmail.com	2021-12-24 07:54:14.796	\N	2021-06-03 20:04:49.125	2021-06-03 20:04:49.125	t
15	\N	diner.ismail@protonmail.com	2021-08-07 20:18:38.866	\N	2021-08-07 20:16:43.177	2021-08-07 20:16:43.177	f
16	\N	ismail.diner+admin14@gmail.com	2021-08-08 14:23:13.855	\N	2021-08-07 20:37:10.935	2021-08-07 20:37:10.935	f
17	\N	ismail.diner+test31@gmail.com	2021-08-10 22:33:42.078	\N	2021-08-10 22:33:42.08	2021-08-10 22:33:42.08	f
18	\N	meg.clarke@phonecoop.coop	2021-08-17 13:58:49.434	\N	2021-08-17 10:04:46.893	2021-08-17 10:04:46.893	f
19	\N	lydz_instone@hotmail.com	2021-08-18 22:01:19.775	\N	2021-08-18 22:01:19.776	2021-08-18 22:01:19.776	f
20	\N	lm687@cam.ac.uk	2021-08-19 19:14:09.117	\N	2021-08-19 19:14:09.118	2021-08-19 19:14:09.118	f
21	\N	mchakiachvili@protonmail.com	2021-09-05 17:44:39.536	\N	2021-09-05 17:44:39.538	2021-09-05 17:44:39.538	f
22	\N	ismail.diner+test20@gmail.com	2021-09-16 20:51:01.837	\N	2021-09-16 20:51:01.838	2021-09-16 20:51:01.838	f
23	\N	breadonabike@gmail.com	2021-10-06 14:18:39.301	\N	2021-10-06 14:18:39.302	2021-10-06 14:18:39.302	f
24	\N	info@cambridgefoodhub.org	2021-10-07 13:25:07.961	\N	2021-10-07 13:13:25.353	2021-10-07 13:13:25.353	f
25	\N	caba@cambridgecab.org.uk	2021-10-07 13:29:34.205	\N	2021-10-07 13:29:24.715	2021-10-07 13:29:24.715	f
\.


--
-- Data for Name: verification_requests; Type: TABLE DATA; Schema: public; Owner: prisma-crw
--

COPY public.verification_requests (id, identifier, token, expires, created_at, updated_at) FROM stdin;
7	helen.cook@gmail.com	8a9ae1f3b5fe52e84604dfe2cb3069ccf5334a22c5a0922f861f902edf40eb9b	2021-06-04 19:37:39.85	2021-06-03 19:37:39.852	2021-06-03 19:37:39.852
8	clarabara@gmail.com	753ea5288073ee763ad5dfcc2f01a2b7bce133358dc0b98a9cf63a2d3cc04dd4	2021-06-04 19:37:42.422	2021-06-03 19:37:42.423	2021-06-03 19:37:42.423
11	ismail.diner+admin@gmail.com	dd987e13ffff0c020a4807663b7a74bab20cd81ffaf44c11879615040a352982	2021-07-12 15:28:44.693	2021-07-11 15:28:44.696	2021-07-11 15:28:44.696
14	ismail.diner+admin1@gmail.com	d5019c7cb7ea0fa943df4dd7a146edfb13822116dd9a16cbd9586415c51391c7	2021-07-25 23:31:13.323	2021-07-24 23:31:13.326	2021-07-24 23:31:13.326
15	ismail.diner+admin@gmail.com	107faaad94f1fe319f388e87e83bc1f2cc2480badb52b3671a406ebd4becd8fd	2021-07-25 23:31:40.954	2021-07-24 23:31:40.955	2021-07-24 23:31:40.955
16	ismail.diner+test1@gmail.com	80abd625c023268e107a6518d13866de9835e04f59ac0ca28de97d1c409b7edd	2021-07-25 23:31:54.928	2021-07-24 23:31:54.928	2021-07-24 23:31:54.928
17	ismail.diner+admin@gmail.com	ccf0ee3fb78c77dd5093da929ee7ff5ec4bbad91859dd2658bf8f9a7bd9c54eb	2021-07-25 23:33:40.769	2021-07-24 23:33:40.77	2021-07-24 23:33:40.77
18	ismail.diner+admin@gmail.com	8f63d8a71516002d9ebc78770f015718456c9485c809534e021ee823d5f153db	2021-07-25 23:34:15.967	2021-07-24 23:34:15.968	2021-07-24 23:34:15.968
19	ismail.diner+admin@gmail.com	1d8f2025006a424ae4ba4bd07b40a598db2b15a7f442f155e670e97f552e5e66	2021-07-25 23:35:07.61	2021-07-24 23:35:07.61	2021-07-24 23:35:07.61
20	ismail.diner+test7@gmail.com	685d46b28542dfdbabbe26ca90329f49606b72ef124155346777d4056cec3217	2021-07-25 23:36:44.7	2021-07-24 23:36:44.701	2021-07-24 23:36:44.701
21	ismail.diner+test7@gmail.com	fb3901de2f9daddc690941698bc8972e46d08edbcd39c07821f689b962ca2b79	2021-07-25 23:37:59.407	2021-07-24 23:37:59.409	2021-07-24 23:37:59.409
22	ismail.diner+admin@gmail.com	84a133643ac901d4532f0f7599f593ede5245fe80685adf0cd84de5436637069	2021-07-25 23:38:52.466	2021-07-24 23:38:52.468	2021-07-24 23:38:52.468
23	ismail.diner+admin@gmail.com	94351142dae791a6ea3a0dedb380fd54edd72b43ac65808a7da3122568c3a064	2021-07-25 23:39:28.583	2021-07-24 23:39:28.584	2021-07-24 23:39:28.584
24	ismail.diner+admin@gmail.com	89313edb2b9571858e1ef79af615d1a6773d282d107be9044c4b662a433d3ef4	2021-07-25 23:40:42.641	2021-07-24 23:40:42.644	2021-07-24 23:40:42.644
25	ismail.diner+admin@gmail.com	9402fad986860e77a70ae26bb5ec02450ed4428352f9f22b8defdd337d8c5946	2021-07-25 23:45:46.067	2021-07-24 23:45:46.069	2021-07-24 23:45:46.069
26	ismail.diner+admin@gmail.com	da547ddbaf77b5f07463a11b5be2cfb5db07f3f3e29a52ad5aa8110b27b10fdd	2021-07-25 23:46:13.088	2021-07-24 23:46:13.09	2021-07-24 23:46:13.09
27	ismail.diner@gmail.com	18446274415330d63bd448be51e0646c4634761d56c4873cf5730bed25277435	2021-07-25 23:46:35.121	2021-07-24 23:46:35.122	2021-07-24 23:46:35.122
28	ismail.diner+test7@gmail.com	9460d020f060f8f34eb85fbcdacd778a0b99afe3dbf47a438225b92a4dffaaa7	2021-07-25 23:49:18.74	2021-07-24 23:49:18.749	2021-07-24 23:49:18.748
29	ismail.diner+test7@gmail.com	020d89e609183503fd29ec6236e3ef821b2dbc725fe3d3db32846cba802416bb	2021-07-25 23:50:45.769	2021-07-24 23:50:45.797	2021-07-24 23:50:45.797
30	ismail.diner+test7@gmail.com	1128c1a85d4fa23fc712ea0d25c97138cdc22bb9f1ba320240f9bcd2bd521f1f	2021-07-25 23:51:52.087	2021-07-24 23:51:52.116	2021-07-24 23:51:52.116
31	ismail.diner+test7@gmail.com	f3f2bf50cd9acdda1fcd05a49362e8e39046c2fb1621757bc11219c34dd9f512	2021-07-25 23:52:39.819	2021-07-24 23:52:39.848	2021-07-24 23:52:39.848
32	ismail.diner+test7@gmail.com	c58a73ac85fafe2486d7dfd23f318712b6e1169ed02f0aab2df372f251cea745	2021-07-25 23:53:16.463	2021-07-24 23:53:16.491	2021-07-24 23:53:16.491
33	ismail.diner+test7@gmail.com	0f7f6928cb933c62c11d4197b70318d187ad1f5901590f00c48da229d97ed03d	2021-07-25 23:53:47.952	2021-07-24 23:53:47.983	2021-07-24 23:53:47.983
34	ismail.diner+test7@gmail.com	4feb4e4a47943c40b2b575cab338ba9d033d58be29ad1b29a04bc74c32573456	2021-07-25 23:54:06.694	2021-07-24 23:54:06.696	2021-07-24 23:54:06.696
35	ismail.diner+test7@gmail.com	31a22eda70278709a2f3ae294a79a0b4b09eade1094b39586f030bfd4bb0e576	2021-07-25 23:54:33.346	2021-07-24 23:54:33.348	2021-07-24 23:54:33.348
36	ismail.diner+test7@gmail.com	a168ae8b57b8242bf711839ccf6ce430bb3ffe8b2f3f842142ba5b0e00037fdf	2021-07-25 23:54:54.265	2021-07-24 23:54:54.266	2021-07-24 23:54:54.266
37	ismail.diner+test7@gmail.com	3a19bca39c9925282464f7ab9ae9a40125ae8a7b6c5357e55f75b16d9ee25929	2021-07-25 23:55:52.911	2021-07-24 23:55:52.912	2021-07-24 23:55:52.912
38	ismail.diner+test7@gmail.com	57d0f53ba1ad673ca95f35d1ccb0d7dd38276935ce398df2ec180eefe407a05c	2021-07-25 23:57:50.206	2021-07-24 23:57:50.207	2021-07-24 23:57:50.207
40	ismail.diner+test1@gmail.com	a4c2baf2cd2338317c641f89a60f7793005de1fa1be49f584753cc8ffd6bd6f4	2021-07-26 00:01:54.532	2021-07-25 00:01:54.535	2021-07-25 00:01:54.535
41	ismail.diner+test1@gmail.com	0ea7721ebdb3c9370238ef59a295245f92e470fa9452d9f9b76bae0b048862e3	2021-07-26 23:29:55.422	2021-07-25 23:29:55.454	2021-07-25 23:29:55.454
42	ismail.diner+admin@gmail.com	6b56dd4a1a9d5845e2d730ac3cf05cd9de18d64536de4ac1ed32b8353af0ceaa	2021-07-26 23:31:15.889	2021-07-25 23:31:15.891	2021-07-25 23:31:15.891
43	ismail.diner+test2@gmail.com	8797fd138f76f2e4b6a1693adbcf857a81b6a9b0ab6f06901de37ee60c145436	2021-07-26 23:33:57.585	2021-07-25 23:33:57.614	2021-07-25 23:33:57.614
44	ismail.diner+test3@gmail.com	72db5a437f086ec971911006d38c059ba2b6dca63152680762d2f41c889bb7c8	2021-07-26 23:34:45.132	2021-07-25 23:34:45.16	2021-07-25 23:34:45.16
45	ismail.diner+test4@gmail.com	94af950c1ef2c979e17e4502f383ace8509fe70aabb90332d0e905243976ec8c	2021-07-26 23:35:23.106	2021-07-25 23:35:23.134	2021-07-25 23:35:23.134
47	ismail.diner+test1@gmail.com	5a8bdee645621cc9ccf5df139e6e626c98d7e0137566e6817b516a612b9aa978	2021-07-26 23:36:48.65	2021-07-25 23:36:48.652	2021-07-25 23:36:48.652
48	meg.clarke@phonecoop.coop	fee6cbb7e122eb05badff3356ca6d2131876ae9ea38e65e448235bc69a592f2c	2021-07-28 11:17:17.997	2021-07-27 11:17:18	2021-07-27 11:17:18
49	meg.clarke@phonecoop.coop	36166162baf3e734e99efd091d6fcc39a678b47df2fc58bcea394a8536ec6f13	2021-07-28 11:17:18.847	2021-07-27 11:17:18.85	2021-07-27 11:17:18.85
50	ismail.diner+admin2@gmail.com	cba869df56eaeeca29e7127a82648fb92906e89cd5389223cf5c02cc85e866bf	2021-07-28 16:48:00.125	2021-07-27 16:48:00.127	2021-07-27 16:48:00.127
51	ismail.diner+admin2@gmail.com	5aff4cc925f3d80c477f652eb265606590abf2b69b590d349a7817efc4ecbe70	2021-07-28 16:50:18.767	2021-07-27 16:50:18.768	2021-07-27 16:50:18.768
52	ismail.diner+admin2@gmail.com	35745168715386f85497183444af2739abd8b367facc6dd3bbd32a9eef9bc4cb	2021-07-28 16:50:34.905	2021-07-27 16:50:34.906	2021-07-27 16:50:34.906
53	ismail.diner+admin@gmail.com	0a1bf138ad994b1cf5251978d4370db9e59c2dd0b10ed940b6afd9115cbbbd08	2021-07-28 16:50:58.015	2021-07-27 16:50:58.016	2021-07-27 16:50:58.016
54	ismail.diner+admin@gmail.com	77ebc0ed4ba1258f50185e672794027700d120491e5f7b2aa06739f282bc6773	2021-07-28 16:51:55.355	2021-07-27 16:51:55.357	2021-07-27 16:51:55.357
55	ismail.diner+admin@gmail.com	f1f959b3aa21568e05b22c002689235760fc51b9b22bc633386ea6b28985688c	2021-07-28 16:53:02.979	2021-07-27 16:53:02.98	2021-07-27 16:53:02.98
56	ismail.diner+admin1@gmail.com	5ab642d164fccf68ee2632167b6cc44c23791a86b59a4748e7bb4a7fca4da0a8	2021-07-28 16:53:43.725	2021-07-27 16:53:43.726	2021-07-27 16:53:43.726
57	ismail.diner+admin@gmail.com	4d722575f3945615942696c9a6d6efbc9e457ae414e0d29702b3fa31ec78d847	2021-07-28 16:54:52.307	2021-07-27 16:54:52.308	2021-07-27 16:54:52.308
58	ismail.diner+admin1@gmail.com	884cd3a82611324a747bce951aef1891b46a65cc0d6686a661ec494742aff1f8	2021-07-28 21:46:44.599	2021-07-27 21:46:44.602	2021-07-27 21:46:44.602
59	ismail.diner+admin@gmail.com	847ae75e8748d725ac647172cb575c106d49607b086043645249e0cd48ff64db	2021-07-28 21:56:44.748	2021-07-27 21:56:44.751	2021-07-27 21:56:44.751
60	ismail.diner+admin@gmail.com	0dafc921130a635652bd72e773583303bac1978affe48a14df460ad8f48035e3	2021-07-28 21:58:54.223	2021-07-27 21:58:54.226	2021-07-27 21:58:54.226
61	ismail.diner+admin@gmail.com	3d9df686c2daf1961f7d9d57357f46a73ca92fa2e6d956c1b42b98763a51c65a	2021-07-28 22:01:59.933	2021-07-27 22:01:59.935	2021-07-27 22:01:59.935
62	ismail.diner+admin2@gmail.com	217ceaedb6dce24cc4a6a7a40cb15b334e6bc1aaf9f5b5016ae50e1e705b0507	2021-07-28 22:02:16.455	2021-07-27 22:02:16.456	2021-07-27 22:02:16.456
63	ismail.diner+admin2@gmail.com	1f73a3fb5e844fe5bf7596b4ac4efb5d6c99ba8d192b75a704d0e19fd2ce0a9e	2021-07-28 22:05:50.071	2021-07-27 22:05:50.071	2021-07-27 22:05:50.071
64	ismail.diner+admin2@gmail.com	1b89b0beddccfb12d379a61d4933a46f24a853bd6fa85f524ceafda7d98c9167	2021-07-28 22:10:03.073	2021-07-27 22:10:03.075	2021-07-27 22:10:03.075
65	ismail.diner+admin@gmail.com	57f73c87577a12c280a6039c6c81c0eb7e27b086d3b1b83bbf53fce67fa46543	2021-07-28 22:17:51.131	2021-07-27 22:17:51.133	2021-07-27 22:17:51.133
66	ismail.diner+admin@gmail.com	b3f661a862bc5befc15f028abd756a1586175ef0d712ed80e555cdc0a67a1e81	2021-07-28 22:21:25.33	2021-07-27 22:21:25.332	2021-07-27 22:21:25.332
67	ismail.diner+admin@gmail.com	650dd0982607f4a9d73214d5be05825b1114a204dd085d36757021b8fe2717ed	2021-07-28 22:22:21.782	2021-07-27 22:22:21.783	2021-07-27 22:22:21.783
68	ismail.diner+admin@gmail.com	8486c0e16c781b1693eb600dab41bb2367dd85cb1f26e81a52820971dc1357e7	2021-07-28 22:23:18.834	2021-07-27 22:23:18.834	2021-07-27 22:23:18.834
69	ismail.diner+admin@gmail.com	34df68c2dcb8a16cf891cae86af7978700b74c7e630fbc5483c3b79de929965a	2021-07-28 22:27:12.519	2021-07-27 22:27:12.522	2021-07-27 22:27:12.522
70	ismail.diner+admin@gmail.com	5ed9b2d648dd417a8b8381dd3746661215e0bbcf3528f79d6960a340e8c60760	2021-07-28 22:27:57.768	2021-07-27 22:27:57.769	2021-07-27 22:27:57.769
162	cambridgeconservationforum@gmail.com	b5226452d3ac2252cf3945f092026a34cd00cd23ef44aefd5db8355fc61b312c	2021-11-29 14:09:03.397	2021-11-26 14:09:03.4	2021-11-26 14:09:03.4
73	ismail.diner+admin2@gmail.com	7103b4580ac781be18d8a01428ea29b3d299442b12db9d887c868c9c2260f8e1	2021-07-28 22:33:13.861	2021-07-27 22:33:13.878	2021-07-27 22:33:13.878
74	ismail.diner+admin2@gmail.com	f4e2276fa80ce6261363df8e5d0b60b87c451b5236fa1c23ab23cfb6b4745199	2021-07-28 22:33:49.671	2021-07-27 22:33:49.673	2021-07-27 22:33:49.673
75	ismail.diner+admin@gmail.com	c3c41835f34855de0735611fa18325f4fb77f8342f08cdfe9bc038e4e3901754	2021-07-28 22:37:35.913	2021-07-27 22:37:35.915	2021-07-27 22:37:35.915
76	ismail.diner+admin@gmail.com	e609220cb1dc28762628ad18f2d46183ec5b2e65d34698842621c9d9419297c6	2021-07-28 22:43:13.065	2021-07-27 22:43:13.085	2021-07-27 22:43:13.085
77	ismail.diner+admin4@gmail.com	c1c7fc7c9944f2919b829f7d7585c0a11795c5e76ec531793b117d0d7fc04195	2021-07-28 22:44:12.545	2021-07-27 22:44:12.568	2021-07-27 22:44:12.568
78	ismail.diner+admin@gmail.com	bf94f1151aa41e5fb4d220c5e45c528a4b741c456737334cfae09f8fa88b7dac	2021-07-28 22:47:40.198	2021-07-27 22:47:40.215	2021-07-27 22:47:40.215
79	ismail.diner+admin2@gmail.com	365d146893f9c9d9e8897343cf508cae6ff2b77e6743efe3f8795e0d5fbcf10e	2021-07-28 22:48:39.218	2021-07-27 22:48:39.219	2021-07-27 22:48:39.219
80	ismail.diner+admin@gmail.com	f1b9fdba5513e75ae975772461db2d4221bcef5227aeeecd40e0d89c56052382	2021-07-28 23:00:07.121	2021-07-27 23:00:07.123	2021-07-27 23:00:07.123
81	ismail.diner+admin@gmail.com	5bbd6e5a20a66741b63d663af285d500394f018f79e13224c9be707406656a2c	2021-07-28 23:03:56.097	2021-07-27 23:03:56.099	2021-07-27 23:03:56.099
82	ismail.diner+admin@gmail.com	942b6692e8af47304cab55b93917b09bc38d23ea34283dbf9ad9251544e08b4c	2021-07-28 23:05:51.803	2021-07-27 23:05:51.805	2021-07-27 23:05:51.805
83	ismail.diner+admin@gmail.com	3e0004fa16ffbc321027ff86c6ae3e4b04f22781aab88a9851dab2c107b6110f	2021-07-28 23:09:59.142	2021-07-27 23:09:59.143	2021-07-27 23:09:59.143
84	ismail.diner+admin@gmail.com	b2aaf3d0bc3ff7906d3fa293ae1047ff91f47dae298dbc6bc252d9af36bd0e79	2021-07-28 23:12:54.319	2021-07-27 23:12:54.32	2021-07-27 23:12:54.32
85	ismail.diner+admin@gmail.com	b6c8bd9e64568b90bb52a4bc2ab013537c48a0ab31fa3208e85cd4ef1c7eaf8e	2021-07-28 23:14:10.252	2021-07-27 23:14:10.253	2021-07-27 23:14:10.253
86	ismail.diner+admin@gmail.com	1eb10a63d8e0450d89e15ac26457e06d92666326a38f4eeba7ee0627491fd682	2021-07-28 23:18:34.885	2021-07-27 23:18:34.885	2021-07-27 23:18:34.885
87	ismail.diner+admin@gmail.com	0817f019ca7755576535d39d49098985ae005d6a3c52bb56114b2cc76bc1ae12	2021-07-28 23:18:54.559	2021-07-27 23:18:54.56	2021-07-27 23:18:54.56
88	ismail.diner+admin@gmail.com	9bd98b2c169e361351914b41fe98abbd9e680fd6d147aa1a764514145bc43276	2021-07-28 23:21:56.263	2021-07-27 23:21:56.264	2021-07-27 23:21:56.264
89	ismail.diner+admin@gmail.com	73eb80444eec4813e696b2cafb5ae67cd85c16c5ac139255ff29c8bf107e5629	2021-07-28 23:26:59.582	2021-07-27 23:26:59.583	2021-07-27 23:26:59.583
163	cambridgeconservationforum@gmail.com	9c2159e00f05678ba6521e00c05fbbd36b1ce53829b10ba94a2a14534aa30eaa	2021-11-29 14:09:03.403	2021-11-26 14:09:03.405	2021-11-26 14:09:03.405
196	cambridge@acorntheunion.org.uk	35e98dc64083521fd7813cd45bc9442a07b9cdc763cb074846ee3bb419946b88	2021-11-29 23:24:46.998	2021-11-26 23:24:47	2021-11-26 23:24:47
197	cambridgeconservationforum@gmail.com	17fdbfdad0fe18258431c19d2c5e5dd2b1720a115aee2e698838ba51d98db021	2021-11-30 10:13:29.571	2021-11-27 10:13:29.574	2021-11-27 10:13:29.574
94	ismail.diner+admin6@gmail.com	365014d4c08933cb3c71334d15424efeb6693bbbe90f8645ab8346b9558e5f15	2021-07-28 23:33:06.555	2021-07-27 23:33:06.558	2021-07-27 23:33:06.558
198	edward.darling@redlistrevival.org	4f83f5990030fe571a0bd14c748f78e6127fe2300366b94d00f684691804cae6	2021-11-30 10:15:01.601	2021-11-27 10:15:01.602	2021-11-27 10:15:01.602
106	ismail.diner+admin13@gmail.com	8ec596b84d1d26940a488faf92034fe5bae0549efa6c27ff09158792e909bbf2	2021-08-08 18:03:24.182	2021-08-07 18:03:24.183	2021-08-07 18:03:24.183
117	ismail.diner+admin@gmail.com	c409103d2686927aa6bd44410e1d9091a4ca1c134d369518d4df7cc47351e827	2021-08-09 21:53:09.534	2021-08-08 21:53:09.615	2021-08-08 21:53:09.615
137	ismail.diner+admin@gmail.com	3e851bf51602f92214982c4e4a4d6ccaaf1003781a678e6da690849bf35b6ed0	2021-09-25 22:27:54.778	2021-09-22 22:27:54.78	2021-09-22 22:27:54.78
145	contact@camcycle.org.uk	18c16b8fd2e3c73802967de546c8d242654ab4e0ea3bbe66352e4c8dc8a0254b	2021-10-10 14:00:02.746	2021-10-07 14:00:02.748	2021-10-07 14:00:02.748
148	info@camvalleyforum.uk	7c2718136993ad7a0321bd75d502ed3ecf6cf8e5433dae70653fe1f3158d91c5	2021-10-11 07:49:19.197	2021-10-08 07:49:19.199	2021-10-08 07:49:19.199
149	info@camvalleyforum.uk	3d430e1740b5fd5fb1e4653296229d5d402d5e51f13517130b535ed617347c08	2021-10-11 08:38:22.363	2021-10-08 08:38:22.366	2021-10-08 08:38:22.366
\.


--
-- Name: accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prisma-crw
--

SELECT pg_catalog.setval('public.accounts_id_seq', 1, false);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prisma-crw
--

SELECT pg_catalog.setval('public.categories_id_seq', 16, true);


--
-- Name: edit_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prisma-crw
--

SELECT pg_catalog.setval('public.edit_permissions_id_seq', 124, true);


--
-- Name: listings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prisma-crw
--

SELECT pg_catalog.setval('public.listings_id_seq', 137, true);


--
-- Name: sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prisma-crw
--

SELECT pg_catalog.setval('public.sessions_id_seq', 92, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prisma-crw
--

SELECT pg_catalog.setval('public.users_id_seq', 37, true);


--
-- Name: verification_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prisma-crw
--

SELECT pg_catalog.setval('public.verification_requests_id_seq', 207, true);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma-crw
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma-crw
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma-crw
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: edit_permissions edit_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma-crw
--

ALTER TABLE ONLY public.edit_permissions
    ADD CONSTRAINT edit_permissions_pkey PRIMARY KEY (id);


--
-- Name: listings listings_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma-crw
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma-crw
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma-crw
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: verification_requests verification_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma-crw
--

ALTER TABLE ONLY public.verification_requests
    ADD CONSTRAINT verification_requests_pkey PRIMARY KEY (id);


--
-- Name: accounts.compound_id_unique; Type: INDEX; Schema: public; Owner: prisma-crw
--

CREATE UNIQUE INDEX "accounts.compound_id_unique" ON public.accounts USING btree (compound_id);


--
-- Name: categories.label_unique; Type: INDEX; Schema: public; Owner: prisma-crw
--

CREATE UNIQUE INDEX "categories.label_unique" ON public.categories USING btree (label);


--
-- Name: listings_slug_key; Type: INDEX; Schema: public; Owner: prisma-crw
--

CREATE UNIQUE INDEX listings_slug_key ON public.listings USING btree (slug);


--
-- Name: providerAccountId; Type: INDEX; Schema: public; Owner: prisma-crw
--

CREATE INDEX "providerAccountId" ON public.accounts USING btree (provider_account_id);


--
-- Name: providerId; Type: INDEX; Schema: public; Owner: prisma-crw
--

CREATE INDEX "providerId" ON public.accounts USING btree (provider_id);


--
-- Name: sessions.access_token_unique; Type: INDEX; Schema: public; Owner: prisma-crw
--

CREATE UNIQUE INDEX "sessions.access_token_unique" ON public.sessions USING btree (access_token);


--
-- Name: sessions.session_token_unique; Type: INDEX; Schema: public; Owner: prisma-crw
--

CREATE UNIQUE INDEX "sessions.session_token_unique" ON public.sessions USING btree (session_token);


--
-- Name: userId; Type: INDEX; Schema: public; Owner: prisma-crw
--

CREATE INDEX "userId" ON public.accounts USING btree (user_id);


--
-- Name: users.email_unique; Type: INDEX; Schema: public; Owner: prisma-crw
--

CREATE UNIQUE INDEX "users.email_unique" ON public.users USING btree (email);


--
-- Name: verification_requests.token_unique; Type: INDEX; Schema: public; Owner: prisma-crw
--

CREATE UNIQUE INDEX "verification_requests.token_unique" ON public.verification_requests USING btree (token);


--
-- Name: edit_permissions edit_permissions_listingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma-crw
--

ALTER TABLE ONLY public.edit_permissions
    ADD CONSTRAINT "edit_permissions_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES public.listings(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: listings listings_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma-crw
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT "listings_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: doadmin
--

ALTER DEFAULT PRIVILEGES FOR ROLE doadmin IN SCHEMA public REVOKE ALL ON TABLES  FROM doadmin;
ALTER DEFAULT PRIVILEGES FOR ROLE doadmin IN SCHEMA public GRANT SELECT ON TABLES  TO "prisma-crw";


--
-- PostgreSQL database dump complete
--

