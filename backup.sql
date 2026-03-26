--
-- PostgreSQL database dump
--

\restrict AGvlAE0zchaFI0puyWVcQ0DyJCVJe2DTwELjhHNmOKvihRJPziK2wLbjjEf3Gvh

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
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
-- Name: cart; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart (
    id integer NOT NULL,
    user_id integer,
    product_id integer,
    quantity integer DEFAULT 1,
    size integer NOT NULL,
    added_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.cart OWNER TO postgres;

--
-- Name: cart_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cart_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cart_id_seq OWNER TO postgres;

--
-- Name: cart_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cart_id_seq OWNED BY public.cart.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer,
    product_id integer,
    product_name character varying(255) NOT NULL,
    quantity integer NOT NULL,
    price numeric(10,2) NOT NULL,
    size integer NOT NULL
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_items_id_seq OWNER TO postgres;

--
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    user_id integer,
    order_number character varying(50) NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    payment_method character varying(50),
    delivery_address text NOT NULL,
    delivery_method character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO postgres;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    brand character varying(100) NOT NULL,
    price numeric(10,2) NOT NULL,
    size integer[] NOT NULL,
    color character varying(50),
    description text,
    image_url character varying(500),
    category character varying(100),
    stock integer DEFAULT 0,
    rating numeric(3,2) DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: sales_statistics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales_statistics (
    id integer NOT NULL,
    date date NOT NULL,
    total_sales numeric(10,2) DEFAULT 0,
    total_orders integer DEFAULT 0,
    avg_order_value numeric(10,2) DEFAULT 0
);


ALTER TABLE public.sales_statistics OWNER TO postgres;

--
-- Name: sales_statistics_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sales_statistics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sales_statistics_id_seq OWNER TO postgres;

--
-- Name: sales_statistics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sales_statistics_id_seq OWNED BY public.sales_statistics.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(255) NOT NULL,
    phone character varying(20),
    address text,
    birth_date date,
    registration_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_login timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: visit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.visit_logs (
    id integer NOT NULL,
    user_id integer,
    session_id character varying(255),
    page_url character varying(500),
    ip_address character varying(45),
    user_agent text,
    visit_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.visit_logs OWNER TO postgres;

--
-- Name: visit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.visit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.visit_logs_id_seq OWNER TO postgres;

--
-- Name: visit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.visit_logs_id_seq OWNED BY public.visit_logs.id;


--
-- Name: cart id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart ALTER COLUMN id SET DEFAULT nextval('public.cart_id_seq'::regclass);


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: sales_statistics id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_statistics ALTER COLUMN id SET DEFAULT nextval('public.sales_statistics_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: visit_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visit_logs ALTER COLUMN id SET DEFAULT nextval('public.visit_logs_id_seq'::regclass);


--
-- Data for Name: cart; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart (id, user_id, product_id, quantity, size, added_at) FROM stdin;
4	2	2	1	45	2026-03-24 16:03:10.547734
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, order_id, product_id, product_name, quantity, price, size) FROM stdin;
1	1	3	New Balance 574	1	8999.00	39
2	1	2	Adidas Ultraboost 22	1	15999.00	39
3	2	1	Nike Air Max 90	2	12999.00	40
4	3	1	Nike Air Max 90	1	12999.00	40
5	4	1	Nike Air Max 90	1	12999.00	43
8	7	3	New Balance 574	2	8999.00	41
9	8	6	Reebok Classic	2	6999.00	41
10	9	7	Saucony Triumph 20	2	14999.00	40
11	9	2	Adidas Ultraboost 22	2	15999.00	41
12	10	6	Reebok Classic	1	6999.00	44
13	10	1	Nike Air Max 90	1	12999.00	39
14	10	2	Adidas Ultraboost 22	2	15999.00	44
15	11	5	Puma RS-X	2	10999.00	41
16	11	5	Puma RS-X	1	10999.00	41
17	12	2	Adidas Ultraboost 22	1	15999.00	43
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, user_id, order_number, total_amount, status, payment_method, delivery_address, delivery_method, created_at, updated_at) FROM stdin;
7	1	ORDER-1-1774359918	17998.00	completed	card	г. Москва, ул. Тестовая, д. 1	courier	2026-03-04 06:10:38.628978	2026-03-24 16:45:17.98814
8	1	ORDER-2-1774359918	13998.00	completed	card	г. Москва, ул. Тестовая, д. 2	courier	2026-03-01 06:46:48.717381	2026-03-24 16:45:17.98814
9	1	ORDER-3-1774359918	61996.00	completed	card	г. Москва, ул. Тестовая, д. 3	courier	2026-03-13 02:09:19.101488	2026-03-24 16:45:17.98814
10	1	ORDER-4-1774359918	51996.00	completed	card	г. Москва, ул. Тестовая, д. 4	courier	2026-03-13 06:30:26.470494	2026-03-24 16:45:17.98814
11	1	ORDER-5-1774359918	32997.00	completed	card	г. Москва, ул. Тестовая, д. 5	courier	2026-03-09 02:16:33.324642	2026-03-24 16:45:17.98814
1	2	ORD-1774356718830-237	24998.00	completed	card	Якутск, Чиряева 5, корп 1, кв35	post	2026-03-24 15:51:58.827187	2026-03-24 15:51:58.827187
2	2	ORD-1774357353211-634	25998.00	completed	card	Санкт-Петербург, Тосина 6, кв 1066	courier	2026-03-24 16:02:33.208318	2026-03-24 16:02:33.208318
3	4	ORD-1774359133857-612	12999.00	completed	card	г. Москва, Иваново, 6	pickup	2026-03-24 16:32:13.8539	2026-03-24 16:32:13.8539
4	4	ORD-1774359181274-428	12999.00	completed	cash	г. Санкт-Петербург, ул. Тосина, корп 6, кв 1066	pickup	2026-03-24 16:33:01.272874	2026-03-24 16:33:01.272874
12	4	ORD-1774361770843-961	15999.00	pending	cash	г. Санкт-Петербург, ул. Тосина, корп 6, кв 1066	courier	2026-03-24 17:16:10.840296	2026-03-24 17:16:10.840296
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, name, brand, price, size, color, description, image_url, category, stock, rating, created_at) FROM stdin;
1	Nike Air Max 90	Nike	12999.00	{39,40,41,42,43,44}	Белый/Черный	Классические кроссовки Nike Air Max 90 с видимой амортизацией Air. Идеальный выбор для повседневной носки.	https://fridaywear.ru/upload/dev2fun.imagecompress/webp/resize_cache/iblock/0c4/676_1352_1/80xcdv1hwl8we1lmo0xpybratp822b0r.webp	Кроссовки	46	4.80	2026-03-24 15:20:35.773782
2	Adidas Ultraboost 22	Adidas	15999.00	{39,40,41,42,43,44,45}	Черный	Беговые кроссовки с технологией Boost для максимальной энергии возврата. Обеспечивают непревзойденный комфорт.	https://static.sportpoint.ru/upload/product_images/base/gz/gz01/gz0127/gz0127_00.jpg@486x697?1663947723	Беговые	33	4.90	2026-03-24 15:20:35.773782
4	ASICS Gel-Kayano 29	ASICS	13999.00	{40,41,42,43,44,45}	Синий	Профессиональные беговые кроссовки с максимальной поддержкой. Разработаны для длительных тренировок.	https://tirol.ru/upload/resize_cache/iblock/92f/600_600_2c8d3b8bf8904cd61d95b56a4a9832795/e0ysy49i3jmbqkbu3e8um37n74z1r6jy.jpg	Беговые	25	4.70	2026-03-24 15:20:35.773782
5	Puma RS-X	Puma	10999.00	{39,40,41,42,43,44}	Белый	Модель в стиле chunky с амортизацией RS. Яркий дизайн для смелых образов.	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxitPo2iTeLsglwDaHN0xT9SHre4k96Wdqbg&s	Кроссовки	45	4.50	2026-03-24 15:20:35.773782
6	Reebok Classic	Reebok	6999.00	{38,39,40,41,42,43}	Белый	Легендарные классические кроссовки Reebok Classic Leather. Нестареющая классика.	https://www.basketshop.ru/files/catalog/45012/100074346(9).JPG	Повседневные	60	4.40	2026-03-24 15:20:35.773782
7	Saucony Triumph 20	Saucony	14999.00	{40,41,42,43,44}	Оранжевый	Максимально амортизированные кроссовки для длительных забегов. Лучший выбор для марафонов.	https://www.tradeinn.com/f/13887/138876473/saucony-triumph-20-running-shoes.webp	Беговые	20	4.80	2026-03-24 15:20:35.773782
3	New Balance 574	New Balance	8999.00	{38,39,40,41,42,43}	Серый	Классические повседневные кроссовки с премиальной отделкой. Универсальная модель для любого стиля.	https://static.sportpoint.ru/upload/product_images/base/u5/u574/u574bk/u574bkr_00.jpg@486x697?1744753253	Повседневные	39	4.60	2026-03-24 15:20:35.773782
\.


--
-- Data for Name: sales_statistics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales_statistics (id, date, total_sales, total_orders, avg_order_value) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password_hash, full_name, phone, address, birth_date, registration_date, last_login, created_at) FROM stdin;
1	test@example.com	$2b$10$5PjXqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXq	Иван Иванов	+7 (999) 123-45-67	г. Москва, ул. Примерная, д. 1	1990-01-01	2026-03-24 15:20:35.773782	\N	2026-03-24 15:20:35.773782
2	muraway2004@mail.ru	$2b$10$pn2WwAKEJ3eiJ3pm/eO6CepwFNcJ5SajhdBqkd1bTSAwI4J1tjETy	Антонова Вера Аркадьевна	79142601596	Тосина 6 	2004-07-27	2026-03-24 15:36:31.460806	2026-03-24 16:52:34.17479	2026-03-24 15:36:31.460806
4	spiridang@mail.ru	$2b$10$ODuwaLmpqzhU.Ns.79OFFu95QZl0Bsuar7/4eiu3GjvCtQsWpnb6K	Спиридонов Дмитрий Николаевич	79142556765	г. Санкт-Петербург, ул. Тосина, корп 6, кв 1066	2003-04-12	2026-03-24 16:30:41.687815	2026-03-24 17:15:59.448238	2026-03-24 16:30:41.687815
\.


--
-- Data for Name: visit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.visit_logs (id, user_id, session_id, page_url, ip_address, user_agent, visit_time) FROM stdin;
17	\N	NxCiu125TOtlfMZydGDLNoEmnZuVdjJg	/catalog	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-24 15:20:54.845133
18	\N	NxCiu125TOtlfMZydGDLNoEmnZuVdjJg	/product/1	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-24 15:21:09.861501
19	\N	wPvSqc3Cmq-OcCOwNbDUh1UznNF4hZxT	/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-24 15:29:32.396845
20	\N	wPvSqc3Cmq-OcCOwNbDUh1UznNF4hZxT	/catalog	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-24 15:29:46.685587
21	\N	wPvSqc3Cmq-OcCOwNbDUh1UznNF4hZxT	/catalog	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-24 15:30:04.242593
22	\N	0BzS4qCaP91g8NFAVQmIvY9ji08Dv4dq	/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-24 15:30:20.397812
23	\N	0BzS4qCaP91g8NFAVQmIvY9ji08Dv4dq	/catalog	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-24 15:30:54.860912
24	\N	0BzS4qCaP91g8NFAVQmIvY9ji08Dv4dq	/product/4	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-24 15:31:14.508358
25	\N	CcDBAT2YT4Dk8YRo0RoRy3QvuIj5KFoT	/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-24 15:33:21.438671
26	\N	CcDBAT2YT4Dk8YRo0RoRy3QvuIj5KFoT	/catalog	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-24 15:33:22.760707
27	\N	CcDBAT2YT4Dk8YRo0RoRy3QvuIj5KFoT	/catalog	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-24 15:34:40.046504
28	\N	CcDBAT2YT4Dk8YRo0RoRy3QvuIj5KFoT	/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-24 15:34:43.125691
29	\N	2T7QNC6Lp4T1OAFvW39F1uBgnANDQNqx	/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-24 15:35:03.351313
30	2	2T7QNC6Lp4T1OAFvW39F1uBgnANDQNqx	/cart	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-24 15:36:37.627451
31	2	2T7QNC6Lp4T1OAFvW39F1uBgnANDQNqx	/catalog	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-24 15:36:40.224229
32	2	2T7QNC6Lp4T1OAFvW39F1uBgnANDQNqx	/product/1	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-24 15:36:42.309669
33	2	2T7QNC6Lp4T1OAFvW39F1uBgnANDQNqx	/cart	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-24 15:36:56.258234
34	2	2T7QNC6Lp4T1OAFvW39F1uBgnANDQNqx	/catalog	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-24 15:36:57.957016
35	2	2T7QNC6Lp4T1OAFvW39F1uBgnANDQNqx	/cart	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-24 15:37:03.65826
36	2	2T7QNC6Lp4T1OAFvW39F1uBgnANDQNqx	/catalog	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-24 15:37:04.324817
37	\N	4Ruek5GS5eLsPNfdRebJDvKYUmJaVHf6	/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-24 15:37:14.390713
\.


--
-- Name: cart_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cart_id_seq', 7, true);


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_items_id_seq', 17, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_id_seq', 12, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 7, true);


--
-- Name: sales_statistics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sales_statistics_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- Name: visit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.visit_logs_id_seq', 37, true);


--
-- Name: cart cart_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: sales_statistics sales_statistics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_statistics
    ADD CONSTRAINT sales_statistics_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: visit_logs visit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visit_logs
    ADD CONSTRAINT visit_logs_pkey PRIMARY KEY (id);


--
-- Name: cart cart_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: cart cart_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: visit_logs visit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visit_logs
    ADD CONSTRAINT visit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict AGvlAE0zchaFI0puyWVcQ0DyJCVJe2DTwELjhHNmOKvihRJPziK2wLbjjEf3Gvh

