--
-- PostgreSQL database dump
--

\restrict M35ShE9Vn7WmoP9Q9c3NrEsNPzbLJYedLPWgffKTl1slwYCoFQ8NO6j1em82fet

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

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

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: scale_admin
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO scale_admin;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: scale_admin
--

COMMENT ON SCHEMA public IS '';


--
-- Name: BannerStatus; Type: TYPE; Schema: public; Owner: scale_admin
--

CREATE TYPE public."BannerStatus" AS ENUM (
    'active',
    'inactive',
    'archived'
);


ALTER TYPE public."BannerStatus" OWNER TO scale_admin;

--
-- Name: CatalogStatus; Type: TYPE; Schema: public; Owner: scale_admin
--

CREATE TYPE public."CatalogStatus" AS ENUM (
    'active',
    'inactive',
    'archived'
);


ALTER TYPE public."CatalogStatus" OWNER TO scale_admin;

--
-- Name: CatalogVersionStatus; Type: TYPE; Schema: public; Owner: scale_admin
--

CREATE TYPE public."CatalogVersionStatus" AS ENUM (
    'published'
);


ALTER TYPE public."CatalogVersionStatus" OWNER TO scale_admin;

--
-- Name: CategoryStatus; Type: TYPE; Schema: public; Owner: scale_admin
--

CREATE TYPE public."CategoryStatus" AS ENUM (
    'active',
    'inactive',
    'archived'
);


ALTER TYPE public."CategoryStatus" OWNER TO scale_admin;

--
-- Name: PlacementStatus; Type: TYPE; Schema: public; Owner: scale_admin
--

CREATE TYPE public."PlacementStatus" AS ENUM (
    'active',
    'inactive',
    'archived'
);


ALTER TYPE public."PlacementStatus" OWNER TO scale_admin;

--
-- Name: PriceStatus; Type: TYPE; Schema: public; Owner: scale_admin
--

CREATE TYPE public."PriceStatus" AS ENUM (
    'active',
    'inactive',
    'archived'
);


ALTER TYPE public."PriceStatus" OWNER TO scale_admin;

--
-- Name: ProductStatus; Type: TYPE; Schema: public; Owner: scale_admin
--

CREATE TYPE public."ProductStatus" AS ENUM (
    'active',
    'inactive',
    'archived'
);


ALTER TYPE public."ProductStatus" OWNER TO scale_admin;

--
-- Name: ProductUnit; Type: TYPE; Schema: public; Owner: scale_admin
--

CREATE TYPE public."ProductUnit" AS ENUM (
    'kg',
    'g',
    'piece'
);


ALTER TYPE public."ProductUnit" OWNER TO scale_admin;

--
-- Name: ScaleDeviceStatus; Type: TYPE; Schema: public; Owner: scale_admin
--

CREATE TYPE public."ScaleDeviceStatus" AS ENUM (
    'active',
    'inactive',
    'blocked',
    'archived'
);


ALTER TYPE public."ScaleDeviceStatus" OWNER TO scale_admin;

--
-- Name: ScaleSyncStatus; Type: TYPE; Schema: public; Owner: scale_admin
--

CREATE TYPE public."ScaleSyncStatus" AS ENUM (
    'no_update',
    'update_available',
    'package_delivered',
    'ack_received',
    'auth_failed',
    'error'
);


ALTER TYPE public."ScaleSyncStatus" OWNER TO scale_admin;

--
-- Name: StoreStatus; Type: TYPE; Schema: public; Owner: scale_admin
--

CREATE TYPE public."StoreStatus" AS ENUM (
    'active',
    'inactive',
    'archived'
);


ALTER TYPE public."StoreStatus" OWNER TO scale_admin;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: scale_admin
--

CREATE TYPE public."UserRole" AS ENUM (
    'admin',
    'operator'
);


ALTER TYPE public."UserRole" OWNER TO scale_admin;

--
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: scale_admin
--

CREATE TYPE public."UserStatus" AS ENUM (
    'active',
    'blocked',
    'invited'
);


ALTER TYPE public."UserStatus" OWNER TO scale_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: scale_admin
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


ALTER TABLE public._prisma_migrations OWNER TO scale_admin;

--
-- Name: advertising_banners; Type: TABLE; Schema: public; Owner: scale_admin
--

CREATE TABLE public.advertising_banners (
    id uuid NOT NULL,
    "storeId" uuid NOT NULL,
    "imageUrl" text NOT NULL,
    "imageFileAssetId" uuid,
    status public."BannerStatus" DEFAULT 'active'::public."BannerStatus" NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.advertising_banners OWNER TO scale_admin;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: scale_admin
--

CREATE TABLE public.audit_logs (
    id uuid NOT NULL,
    "actorUserId" uuid,
    action text NOT NULL,
    "entityType" text NOT NULL,
    "entityId" text,
    "storeId" uuid,
    "beforeData" jsonb,
    "afterData" jsonb,
    metadata jsonb,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO scale_admin;

--
-- Name: catalog_product_placements; Type: TABLE; Schema: public; Owner: scale_admin
--

CREATE TABLE public.catalog_product_placements (
    id uuid NOT NULL,
    "catalogId" uuid NOT NULL,
    "categoryId" uuid NOT NULL,
    "productId" uuid NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    status public."PlacementStatus" DEFAULT 'active'::public."PlacementStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.catalog_product_placements OWNER TO scale_admin;

--
-- Name: catalog_versions; Type: TABLE; Schema: public; Owner: scale_admin
--

CREATE TABLE public.catalog_versions (
    id uuid NOT NULL,
    "catalogId" uuid NOT NULL,
    "storeId" uuid NOT NULL,
    "versionNumber" integer NOT NULL,
    status public."CatalogVersionStatus" DEFAULT 'published'::public."CatalogVersionStatus" NOT NULL,
    "publishedByUserId" uuid,
    "publishedAt" timestamp(3) without time zone,
    "basedOnVersionId" uuid,
    "packageData" jsonb NOT NULL,
    "packageUrl" text,
    "packageChecksum" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.catalog_versions OWNER TO scale_admin;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: scale_admin
--

CREATE TABLE public.categories (
    id uuid NOT NULL,
    "catalogId" uuid NOT NULL,
    "parentId" uuid,
    name text NOT NULL,
    "shortName" text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    status public."CategoryStatus" DEFAULT 'active'::public."CategoryStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    CONSTRAINT categories_not_self_parent_check CHECK ((("parentId" IS NULL) OR ("parentId" <> id)))
);


ALTER TABLE public.categories OWNER TO scale_admin;

--
-- Name: file_assets; Type: TABLE; Schema: public; Owner: scale_admin
--

CREATE TABLE public.file_assets (
    id uuid NOT NULL,
    "storeId" uuid,
    "originalFileName" text NOT NULL,
    "storagePath" text NOT NULL,
    "publicUrl" text NOT NULL,
    "mimeType" text NOT NULL,
    "sizeBytes" bigint NOT NULL,
    "uploadedByUserId" uuid,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "file_assets_sizeBytes_non_negative_check" CHECK (("sizeBytes" >= 0))
);


ALTER TABLE public.file_assets OWNER TO scale_admin;

--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: scale_admin
--

CREATE TABLE public.password_reset_tokens (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    "tokenHash" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "usedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.password_reset_tokens OWNER TO scale_admin;

--
-- Name: products; Type: TABLE; Schema: public; Owner: scale_admin
--

CREATE TABLE public.products (
    id uuid NOT NULL,
    "defaultPluCode" text NOT NULL,
    name text NOT NULL,
    "shortName" text NOT NULL,
    description text,
    "imageUrl" text,
    "imageFileAssetId" uuid,
    barcode text,
    sku text,
    unit public."ProductUnit" NOT NULL,
    status public."ProductStatus" DEFAULT 'active'::public."ProductStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.products OWNER TO scale_admin;

--
-- Name: scale_devices; Type: TABLE; Schema: public; Owner: scale_admin
--

CREATE TABLE public.scale_devices (
    id uuid NOT NULL,
    "storeId" uuid NOT NULL,
    "deviceCode" text NOT NULL,
    "apiTokenHash" text NOT NULL,
    name text NOT NULL,
    model text,
    status public."ScaleDeviceStatus" DEFAULT 'active'::public."ScaleDeviceStatus" NOT NULL,
    "lastSeenAt" timestamp(3) without time zone,
    "lastSyncAt" timestamp(3) without time zone,
    "currentCatalogVersionId" uuid,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.scale_devices OWNER TO scale_admin;

--
-- Name: scale_sync_logs; Type: TABLE; Schema: public; Owner: scale_admin
--

CREATE TABLE public.scale_sync_logs (
    id uuid NOT NULL,
    "scaleDeviceId" uuid,
    "storeId" uuid,
    "requestedVersionId" uuid,
    "deliveredVersionId" uuid,
    status public."ScaleSyncStatus" NOT NULL,
    "errorMessage" text,
    "requestIp" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.scale_sync_logs OWNER TO scale_admin;

--
-- Name: store_catalogs; Type: TABLE; Schema: public; Owner: scale_admin
--

CREATE TABLE public.store_catalogs (
    id uuid NOT NULL,
    "storeId" uuid NOT NULL,
    name text NOT NULL,
    status public."CatalogStatus" DEFAULT 'active'::public."CatalogStatus" NOT NULL,
    "currentVersionId" uuid,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.store_catalogs OWNER TO scale_admin;

--
-- Name: store_product_prices; Type: TABLE; Schema: public; Owner: scale_admin
--

CREATE TABLE public.store_product_prices (
    id uuid NOT NULL,
    "storeId" uuid NOT NULL,
    "productId" uuid NOT NULL,
    price numeric(12,2) NOT NULL,
    currency text DEFAULT 'RUB'::text NOT NULL,
    status public."PriceStatus" DEFAULT 'active'::public."PriceStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    CONSTRAINT store_product_prices_price_positive_check CHECK ((price > (0)::numeric))
);


ALTER TABLE public.store_product_prices OWNER TO scale_admin;

--
-- Name: stores; Type: TABLE; Schema: public; Owner: scale_admin
--

CREATE TABLE public.stores (
    id uuid NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    address text,
    timezone text DEFAULT 'Europe/Moscow'::text NOT NULL,
    status public."StoreStatus" DEFAULT 'active'::public."StoreStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.stores OWNER TO scale_admin;

--
-- Name: user_credentials; Type: TABLE; Schema: public; Owner: scale_admin
--

CREATE TABLE public.user_credentials (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    "passwordHash" text NOT NULL,
    "passwordHashAlgorithm" text NOT NULL,
    "passwordHashParams" jsonb,
    "passwordChangedAt" timestamp(3) without time zone,
    "mustChangePassword" boolean DEFAULT false NOT NULL,
    "failedLoginCount" integer DEFAULT 0 NOT NULL,
    "lastFailedLoginAt" timestamp(3) without time zone,
    "lockedUntil" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.user_credentials OWNER TO scale_admin;

--
-- Name: user_invites; Type: TABLE; Schema: public; Owner: scale_admin
--

CREATE TABLE public.user_invites (
    id uuid NOT NULL,
    email text NOT NULL,
    role public."UserRole" NOT NULL,
    "tokenHash" text NOT NULL,
    "invitedByUserId" uuid,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "acceptedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.user_invites OWNER TO scale_admin;

--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: scale_admin
--

CREATE TABLE public.user_sessions (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    "sessionTokenHash" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "lastUsedAt" timestamp(3) without time zone,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "revokedAt" timestamp(3) without time zone,
    "revokedReason" text,
    "ipAddress" text,
    "userAgent" text
);


ALTER TABLE public.user_sessions OWNER TO scale_admin;

--
-- Name: user_store_accesses; Type: TABLE; Schema: public; Owner: scale_admin
--

CREATE TABLE public.user_store_accesses (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    "storeId" uuid NOT NULL,
    "grantedByUserId" uuid,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "revokedAt" timestamp(3) without time zone
);


ALTER TABLE public.user_store_accesses OWNER TO scale_admin;

--
-- Name: users; Type: TABLE; Schema: public; Owner: scale_admin
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email text NOT NULL,
    "emailNormalized" text NOT NULL,
    "emailVerifiedAt" timestamp(3) without time zone,
    "fullName" text NOT NULL,
    role public."UserRole" NOT NULL,
    status public."UserStatus" DEFAULT 'invited'::public."UserStatus" NOT NULL,
    "lastLoginAt" timestamp(3) without time zone,
    "createdByUserId" uuid,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.users OWNER TO scale_admin;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: scale_admin
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
ec1e8378-113a-40f0-8aad-0651aa1e90fc	dc9ada41f460fac4585f55e6f4414dbd72b5d9440bd324d7e6171f60b3bfebc6	2026-05-14 11:46:38.202032+00	20260513183000_init_auth_access	\N	\N	2026-05-14 11:46:38.107759+00	1
cfa52235-a71f-4e68-a1af-ad8a2eadc5e6	4ad721d73d69d105c9f43dd27a98a0673cae746ee06e5a78157b419ea48c834e	2026-05-14 11:46:38.405288+00	20260514074500_add_business_models	\N	\N	2026-05-14 11:46:38.203335+00	1
\.


--
-- Data for Name: advertising_banners; Type: TABLE DATA; Schema: public; Owner: scale_admin
--

COPY public.advertising_banners (id, "storeId", "imageUrl", "imageFileAssetId", status, "sortOrder", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: scale_admin
--

COPY public.audit_logs (id, "actorUserId", action, "entityType", "entityId", "storeId", "beforeData", "afterData", metadata, "ipAddress", "userAgent", "createdAt") FROM stdin;
1f80602f-6153-4b72-8e27-b268a93e22ee	4ea0b245-abad-4768-8e86-7de0c018ae6d	user_invite.created	UserInvite	ac8442f9-22a5-4c38-b8c1-3604319e82eb	\N	\N	{"role": "operator", "email": "task010-1778776582-16305@example.com", "expiresAt": "2026-05-14T17:36:22.573Z"}	{"emailNormalized": "task010-1778776582-16305@example.com"}	127.0.0.1	curl/8.5.0	2026-05-14 16:36:22.616
ec816745-e158-4f95-84dd-ea6fbdc67dd8	351bee49-cbcd-4d68-859a-fa5ded93ddf0	user_invite.accepted	UserInvite	ac8442f9-22a5-4c38-b8c1-3604319e82eb	\N	\N	{"role": "operator", "email": "task010-1778776582-16305@example.com", "userId": "351bee49-cbcd-4d68-859a-fa5ded93ddf0", "acceptedAt": "2026-05-14T16:36:22.712Z"}	{"emailNormalized": "task010-1778776582-16305@example.com"}	127.0.0.1	curl/8.5.0	2026-05-14 16:36:22.856
26d15730-4757-4ba1-b869-b32d22acbd2e	4ea0b245-abad-4768-8e86-7de0c018ae6d	user_invite.created	UserInvite	47c775ac-0eaf-4a3b-b52a-4a84a877157a	\N	\N	{"role": "operator", "email": "task010-expired-1778776583-21986@example.com", "expiresAt": "2026-05-14T15:36:23.109Z"}	{"emailNormalized": "task010-expired-1778776583-21986@example.com"}	127.0.0.1	curl/8.5.0	2026-05-14 16:36:23.142
b6dec1ee-432a-4c8a-81c3-10a3788f77c0	4ea0b245-abad-4768-8e86-7de0c018ae6d	user_invite.created	UserInvite	c172cb13-f832-4d13-9232-e3e947ff02c6	\N	\N	{"role": "operator", "email": "task010-1778776616-3640@example.com", "expiresAt": "2026-05-14T17:36:56.381Z"}	{"emailNormalized": "task010-1778776616-3640@example.com"}	127.0.0.1	curl/8.5.0	2026-05-14 16:36:56.415
c528652a-796a-4c34-9541-3c440b59e80b	cb7e1101-4c13-4bf0-a327-85a2719ad265	user_invite.accepted	UserInvite	c172cb13-f832-4d13-9232-e3e947ff02c6	\N	\N	{"role": "operator", "email": "task010-1778776616-3640@example.com", "userId": "cb7e1101-4c13-4bf0-a327-85a2719ad265", "acceptedAt": "2026-05-14T16:36:56.509Z"}	{"emailNormalized": "task010-1778776616-3640@example.com"}	127.0.0.1	curl/8.5.0	2026-05-14 16:36:56.624
9f853f33-59e9-42e9-8130-0095d20cadae	4ea0b245-abad-4768-8e86-7de0c018ae6d	user_invite.created	UserInvite	0dbaf2bb-c205-4f54-888b-d0c0c717d482	\N	\N	{"role": "operator", "email": "task010-expired-1778776616-345@example.com", "expiresAt": "2026-05-14T15:36:56.875Z"}	{"emailNormalized": "task010-expired-1778776616-345@example.com"}	127.0.0.1	curl/8.5.0	2026-05-14 16:36:56.926
52bb17b1-ef76-4bda-bf25-20c20159043e	4ea0b245-abad-4768-8e86-7de0c018ae6d	user_invite.created	UserInvite	fc6993b4-3710-4a33-b25d-d764a1877163	\N	\N	{"role": "operator", "email": "task010-final-1778776838-31443@example.com", "expiresAt": "2026-05-14T17:40:38.224Z"}	{"emailNormalized": "task010-final-1778776838-31443@example.com"}	127.0.0.1	curl/8.5.0	2026-05-14 16:40:38.259
74c23640-a1c9-4d86-82fd-e434c3edb243	41835af1-c798-401d-8733-ec1d95b757e6	user_invite.accepted	UserInvite	fc6993b4-3710-4a33-b25d-d764a1877163	\N	\N	{"role": "operator", "email": "task010-final-1778776838-31443@example.com", "userId": "41835af1-c798-401d-8733-ec1d95b757e6", "acceptedAt": "2026-05-14T16:40:38.352Z"}	{"emailNormalized": "task010-final-1778776838-31443@example.com"}	127.0.0.1	curl/8.5.0	2026-05-14 16:40:38.47
7adf5701-bc9d-4c57-9f18-41ce61cdcce9	4ea0b245-abad-4768-8e86-7de0c018ae6d	user_invite.created	UserInvite	bf019773-b152-4ebf-adf8-c9076091d255	\N	\N	{"role": "operator", "email": "task010-final-expired-1778776838-29804@example.com", "expiresAt": "2026-05-14T15:40:38.718Z"}	{"emailNormalized": "task010-final-expired-1778776838-29804@example.com"}	127.0.0.1	curl/8.5.0	2026-05-14 16:40:38.748
3fd924c7-f69a-472d-af4c-2964c9bfd1d3	4ea0b245-abad-4768-8e86-7de0c018ae6d	password_reset.requested	PasswordResetToken	a66f1a11-7e4c-4261-8f88-9cde3b01c58a	\N	\N	{"userId": "4ea0b245-abad-4768-8e86-7de0c018ae6d", "expiresAt": "2026-05-14T17:55:39.071Z"}	{"emailNormalized": "admin@example.com"}	127.0.0.1	curl/8.5.0	2026-05-14 16:55:39.083
51138179-a60b-44e2-ad49-9159770fc0b0	4ea0b245-abad-4768-8e86-7de0c018ae6d	password_reset.completed	PasswordResetToken	a66f1a11-7e4c-4261-8f88-9cde3b01c58a	\N	\N	{"usedAt": "2026-05-14T16:55:39.372Z", "userId": "4ea0b245-abad-4768-8e86-7de0c018ae6d", "sessionsRevoked": true}	{"emailNormalized": "admin@example.com"}	127.0.0.1	curl/8.5.0	2026-05-14 16:55:39.495
921a2480-6476-4dcc-9e57-5f16d5641fc6	4ea0b245-abad-4768-8e86-7de0c018ae6d	password_reset.requested	PasswordResetToken	50e2ae4e-3ce7-4366-abfe-3b22ba460d73	\N	\N	{"userId": "4ea0b245-abad-4768-8e86-7de0c018ae6d", "expiresAt": "2026-05-14T17:57:18.520Z"}	{"emailNormalized": "admin@example.com"}	127.0.0.1	curl/8.5.0	2026-05-14 16:57:18.529
f1c09c99-e7f9-4f7a-8ac2-1613ef6511b8	4ea0b245-abad-4768-8e86-7de0c018ae6d	password_reset.completed	PasswordResetToken	50e2ae4e-3ce7-4366-abfe-3b22ba460d73	\N	\N	{"usedAt": "2026-05-14T16:57:18.748Z", "userId": "4ea0b245-abad-4768-8e86-7de0c018ae6d", "sessionsRevoked": true}	{"emailNormalized": "admin@example.com"}	127.0.0.1	curl/8.5.0	2026-05-14 16:57:18.866
8bb6cbf4-0a1d-4fda-98b0-88b5c23bcfae	4ea0b245-abad-4768-8e86-7de0c018ae6d	user.role_changed	User	00000000-0000-0000-0000-000000000912	\N	{"role": "operator"}	{"role": "admin"}	\N	127.0.0.1	curl/8.5.0	2026-05-14 17:18:16.751
5853c315-edec-4100-b010-790404cc89d1	4ea0b245-abad-4768-8e86-7de0c018ae6d	user.blocked	User	00000000-0000-0000-0000-000000000912	\N	{"status": "active"}	{"status": "blocked"}	\N	127.0.0.1	curl/8.5.0	2026-05-14 17:18:16.776
af81b670-30b3-4116-8919-25e6375904f9	4ea0b245-abad-4768-8e86-7de0c018ae6d	user.unblocked	User	00000000-0000-0000-0000-000000000912	\N	{"status": "blocked"}	{"status": "active"}	\N	127.0.0.1	curl/8.5.0	2026-05-14 17:18:16.812
54f8df95-d7ed-47d6-a4ac-a22098565205	4ea0b245-abad-4768-8e86-7de0c018ae6d	user.soft_deleted	User	00000000-0000-0000-0000-000000000912	\N	{"deletedAt": null}	{"deletedAt": "2026-05-14T17:18:16.828Z"}	\N	127.0.0.1	curl/8.5.0	2026-05-14 17:18:16.83
31f5558c-1590-423a-a493-1eb157190d30	4ea0b245-abad-4768-8e86-7de0c018ae6d	user_invite.created	UserInvite	08236384-2e5f-4178-bc11-b280332037fd	\N	\N	{"role": "operator", "email": "task012-manager-1778779346@example.com", "expiresAt": "2026-05-14T18:22:26.426Z"}	{"emailNormalized": "task012-manager-1778779346@example.com"}	127.0.0.1	curl/8.5.0	2026-05-14 17:22:26.501
b40e39f0-ebcc-409e-8b91-f134a4a46b23	673b95cd-7fd6-40a7-8901-b5d5e4125b9f	user_invite.accepted	UserInvite	08236384-2e5f-4178-bc11-b280332037fd	\N	\N	{"role": "operator", "email": "task012-manager-1778779346@example.com", "userId": "673b95cd-7fd6-40a7-8901-b5d5e4125b9f", "acceptedAt": "2026-05-14T17:22:26.611Z"}	{"emailNormalized": "task012-manager-1778779346@example.com"}	127.0.0.1	curl/8.5.0	2026-05-14 17:22:26.73
05510fa9-91ff-4b2f-b62c-9c88366c8e0d	4ea0b245-abad-4768-8e86-7de0c018ae6d	user.role_changed	User	673b95cd-7fd6-40a7-8901-b5d5e4125b9f	\N	{"role": "operator"}	{"role": "admin"}	\N	127.0.0.1	curl/8.5.0	2026-05-14 17:22:26.859
f03c2301-47ab-4ac4-841c-550cd1e5511e	4ea0b245-abad-4768-8e86-7de0c018ae6d	user.blocked	User	673b95cd-7fd6-40a7-8901-b5d5e4125b9f	\N	{"status": "active"}	{"status": "blocked"}	\N	127.0.0.1	curl/8.5.0	2026-05-14 17:22:26.924
a419728e-208f-4c82-9da3-52b2c8351ff6	4ea0b245-abad-4768-8e86-7de0c018ae6d	user.unblocked	User	673b95cd-7fd6-40a7-8901-b5d5e4125b9f	\N	{"status": "blocked"}	{"status": "active"}	\N	127.0.0.1	curl/8.5.0	2026-05-14 17:22:27.05
4dc3d2e8-5590-4699-8c19-b08a60282c09	4ea0b245-abad-4768-8e86-7de0c018ae6d	user.soft_deleted	User	673b95cd-7fd6-40a7-8901-b5d5e4125b9f	\N	{"deletedAt": null}	{"deletedAt": "2026-05-14T17:22:27.075Z"}	\N	127.0.0.1	curl/8.5.0	2026-05-14 17:22:27.079
163192a8-84d0-4256-972b-b8048efdbab1	4ea0b245-abad-4768-8e86-7de0c018ae6d	user_store_access.granted	UserStoreAccess	ca447fe2-cd71-4dbf-a499-acf76a3d584b	9624578d-a8c9-45a4-8dbf-006c961c0adf	\N	{"userId": "00000000-0000-0000-0000-000000000913", "storeId": "9624578d-a8c9-45a4-8dbf-006c961c0adf", "grantedByUserId": "4ea0b245-abad-4768-8e86-7de0c018ae6d"}	{"storeCode": "TASK013-A", "userEmail": "task013-operator@example.com"}	127.0.0.1	curl/8.5.0	2026-05-14 17:41:32.225
dabb6c2e-c02d-4851-b908-7afdebd7ef43	4ea0b245-abad-4768-8e86-7de0c018ae6d	user_store_access.revoked	UserStoreAccess	ca447fe2-cd71-4dbf-a499-acf76a3d584b	9624578d-a8c9-45a4-8dbf-006c961c0adf	{"userId": "00000000-0000-0000-0000-000000000913", "storeId": "9624578d-a8c9-45a4-8dbf-006c961c0adf", "revokedAt": null}	{"userId": "00000000-0000-0000-0000-000000000913", "storeId": "9624578d-a8c9-45a4-8dbf-006c961c0adf", "revokedAt": "2026-05-14T17:41:32.678Z"}	{"storeCode": "TASK013-A", "userEmail": "task013-operator@example.com"}	127.0.0.1	curl/8.5.0	2026-05-14 17:41:32.682
8609109d-cda6-4fa7-9c8e-2b478801e200	4ea0b245-abad-4768-8e86-7de0c018ae6d	store.created	Store	2f686ecd-90b5-4e9d-87ea-43ea93efa76e	2f686ecd-90b5-4e9d-87ea-43ea93efa76e	\N	{"code": "TASK016-ACTIVE", "name": "Task 016 Active Store", "status": "active", "address": "16 Task Street", "timezone": "Europe/Amsterdam", "mainCatalogId": "2eba1cc9-b239-4000-8c99-54a46217c9db"}	\N	127.0.0.1	curl/8.5.0	2026-05-14 20:03:28.277
f585f46a-c623-4a61-bb9e-f502b18f6406	4ea0b245-abad-4768-8e86-7de0c018ae6d	store.updated	Store	2f686ecd-90b5-4e9d-87ea-43ea93efa76e	2f686ecd-90b5-4e9d-87ea-43ea93efa76e	{"code": "TASK016-ACTIVE", "name": "Task 016 Active Store", "status": "active", "address": "16 Task Street", "timezone": "Europe/Amsterdam"}	{"code": "TASK016-ACTIVE", "name": "Task 016 Updated Store", "status": "inactive", "address": "Updated Task Street", "timezone": "Europe/Amsterdam"}	\N	127.0.0.1	curl/8.5.0	2026-05-14 20:03:28.546
bef302e6-5296-4a29-94a7-effc84246ae7	4ea0b245-abad-4768-8e86-7de0c018ae6d	store.created	Store	5e8b8ffc-bfce-436d-ba8c-cf8f55fdf4d4	5e8b8ffc-bfce-436d-ba8c-cf8f55fdf4d4	\N	{"code": "T17A-1778790425", "name": "Task 017 Store A", "status": "active", "address": "A2A test address A", "timezone": "Europe/Moscow", "mainCatalogId": "45bc0add-deea-4111-9008-0d0aadb8bdde"}	\N	172.18.0.1	curl/8.5.0	2026-05-14 20:27:05.281
c44b23fa-b3e5-4b04-ab9d-6205c808ffb6	4ea0b245-abad-4768-8e86-7de0c018ae6d	store.created	Store	435de0ee-9c38-409c-9359-5237f09bf4ea	435de0ee-9c38-409c-9359-5237f09bf4ea	\N	{"code": "T17B-1778790425", "name": "Task 017 Store B", "status": "active", "address": "A2A test address B", "timezone": "Europe/Moscow", "mainCatalogId": "2dbde66f-4f48-4b26-bee1-ab9c9b458917"}	\N	172.18.0.1	curl/8.5.0	2026-05-14 20:27:05.336
6da3c151-2c49-4dd3-9100-c07004fe80e6	4ea0b245-abad-4768-8e86-7de0c018ae6d	store.updated	Store	5e8b8ffc-bfce-436d-ba8c-cf8f55fdf4d4	5e8b8ffc-bfce-436d-ba8c-cf8f55fdf4d4	{"code": "T17A-1778790425", "name": "Task 017 Store A", "status": "active", "address": "A2A test address A", "timezone": "Europe/Moscow"}	{"code": "T17A-1778790425", "name": "Task 017 Store A Edited", "status": "active", "address": "A2A test address A", "timezone": "Europe/Moscow"}	\N	172.18.0.1	curl/8.5.0	2026-05-14 20:27:05.392
1295d777-c78a-410c-84c5-5d8360f87103	4ea0b245-abad-4768-8e86-7de0c018ae6d	user_invite.created	UserInvite	dfbff88c-5c98-441e-a41d-631742bf2fe7	\N	\N	{"role": "operator", "email": "task017-operator-1778790425@example.com", "expiresAt": "2026-05-15T20:27:05.000Z"}	{"emailNormalized": "task017-operator-1778790425@example.com"}	172.18.0.1	curl/8.5.0	2026-05-14 20:27:05.47
24e81cd7-6087-4f5c-8a35-05bdfd7bc536	571453dd-d1c9-40ce-8d27-8cbc72c4bfff	user_invite.accepted	UserInvite	dfbff88c-5c98-441e-a41d-631742bf2fe7	\N	\N	{"role": "operator", "email": "task017-operator-1778790425@example.com", "userId": "571453dd-d1c9-40ce-8d27-8cbc72c4bfff", "acceptedAt": "2026-05-14T20:27:05.566Z"}	{"emailNormalized": "task017-operator-1778790425@example.com"}	172.18.0.1	curl/8.5.0	2026-05-14 20:27:05.686
974c5ffd-20e4-44c6-854b-66d44961f841	4ea0b245-abad-4768-8e86-7de0c018ae6d	user_store_access.granted	UserStoreAccess	65ccde8c-33f5-4435-bb07-74c0e04bcccf	5e8b8ffc-bfce-436d-ba8c-cf8f55fdf4d4	\N	{"userId": "571453dd-d1c9-40ce-8d27-8cbc72c4bfff", "storeId": "5e8b8ffc-bfce-436d-ba8c-cf8f55fdf4d4", "grantedByUserId": "4ea0b245-abad-4768-8e86-7de0c018ae6d"}	{"storeCode": "T17A-1778790425", "userEmail": "task017-operator-1778790425@example.com"}	172.18.0.1	curl/8.5.0	2026-05-14 20:27:05.752
6e05be63-fafa-4aba-b7fe-a19477683dd7	4ea0b245-abad-4768-8e86-7de0c018ae6d	scale_device.created	ScaleDevice	0058f6d8-35b5-475b-8d90-97c3793fd49b	c223a7cd-43cc-4404-a765-d3a0e4f4af1c	\N	{"name": "Task 019 Scale", "model": "MVP-Scale", "status": "active", "storeId": "c223a7cd-43cc-4404-a765-d3a0e4f4af1c", "deviceCode": "TASK019-SCALE-001", "apiTokenIssued": true}	{"storeCode": "TASK019-STORE", "tokenIssued": true}	127.0.0.1	curl/8.5.0	2026-05-14 22:06:00.587
78a8d47d-aeea-431a-9002-0fd91ec3b29a	4ea0b245-abad-4768-8e86-7de0c018ae6d	scale_device.status_changed	ScaleDevice	0058f6d8-35b5-475b-8d90-97c3793fd49b	c223a7cd-43cc-4404-a765-d3a0e4f4af1c	{"status": "active"}	{"status": "blocked"}	\N	127.0.0.1	curl/8.5.0	2026-05-14 22:06:00.937
2789d5ce-bdfb-4b1b-851d-284505a3be3c	4ea0b245-abad-4768-8e86-7de0c018ae6d	scale_device.status_changed	ScaleDevice	0058f6d8-35b5-475b-8d90-97c3793fd49b	c223a7cd-43cc-4404-a765-d3a0e4f4af1c	{"status": "blocked"}	{"status": "inactive"}	\N	127.0.0.1	curl/8.5.0	2026-05-14 22:06:01.005
7bdfd45c-481a-428a-8a8f-84ed95ca47c2	4ea0b245-abad-4768-8e86-7de0c018ae6d	scale_device.api_token_regenerated	ScaleDevice	0058f6d8-35b5-475b-8d90-97c3793fd49b	c223a7cd-43cc-4404-a765-d3a0e4f4af1c	{"tokenRotated": true}	{"tokenIssued": true}	\N	127.0.0.1	curl/8.5.0	2026-05-14 22:06:01.253
dcf1e0c9-1d59-4cc2-a478-d673cde0c314	4ea0b245-abad-4768-8e86-7de0c018ae6d	product.created	Product	a09d089e-6baf-491f-9e3b-ef9c214360f7	\N	\N	{"sku": "TASK021-SKU-001", "name": "Task 021 Gala Apples", "unit": "kg", "status": "active", "barcode": "4600000000211", "imageUrl": null, "shortName": "Gala Apples", "description": "Task 021 verification product", "defaultPluCode": "TASK021-PLU-001", "imageFileAssetId": null}	\N	127.0.0.1	curl/8.5.0	2026-05-15 01:03:33.892
86e26580-e195-4247-bc59-279d9e1ea842	00000000-0000-0000-0000-000000000921	product.created	Product	58b48f52-dbc6-43dd-b3b3-9a901ce2a2a5	\N	\N	{"sku": "TASK021-SKU-OP", "name": "Task 021 Operator Pears", "unit": "piece", "status": "active", "barcode": "4600000000212", "imageUrl": null, "shortName": "Op Pears", "description": null, "defaultPluCode": "TASK021-PLU-OP", "imageFileAssetId": null}	\N	127.0.0.1	curl/8.5.0	2026-05-15 01:03:34.005
18c2aca1-1396-460b-9673-0b33ddce6e8e	4ea0b245-abad-4768-8e86-7de0c018ae6d	product.updated	Product	a09d089e-6baf-491f-9e3b-ef9c214360f7	\N	{"sku": "TASK021-SKU-001", "name": "Task 021 Gala Apples", "unit": "kg", "status": "active", "barcode": "4600000000211", "imageUrl": null, "shortName": "Gala Apples", "description": "Task 021 verification product", "defaultPluCode": "TASK021-PLU-001", "imageFileAssetId": null}	{"sku": "TASK021-SKU-001", "name": "Task 021 Gala Apples", "unit": "kg", "status": "archived", "barcode": "4600000000211", "imageUrl": null, "shortName": "Gala Apples", "description": "Task 021 verification product", "defaultPluCode": "TASK021-PLU-001", "imageFileAssetId": null}	\N	127.0.0.1	curl/8.5.0	2026-05-15 01:03:34.363
17eb0a0a-3287-4ee9-b630-140972261c43	4ea0b245-abad-4768-8e86-7de0c018ae6d	product.updated	Product	a09d089e-6baf-491f-9e3b-ef9c214360f7	\N	{"sku": "TASK021-SKU-001", "name": "Task 021 Gala Apples", "unit": "kg", "status": "archived", "barcode": "4600000000211", "imageUrl": null, "shortName": "Gala Apples", "description": "Task 021 verification product", "defaultPluCode": "TASK021-PLU-001", "imageFileAssetId": null}	{"sku": "TASK021-SKU-001", "name": "Task 021 Gala Apples", "unit": "kg", "status": "active", "barcode": "4600000000211", "imageUrl": null, "shortName": "Gala Apples", "description": "Task 021 verification product", "defaultPluCode": "TASK021-PLU-001", "imageFileAssetId": null}	\N	127.0.0.1	curl/8.5.0	2026-05-15 01:03:34.428
edfd9876-7e27-485f-b818-f6ef7d5f5246	4ea0b245-abad-4768-8e86-7de0c018ae6d	product.updated	Product	a09d089e-6baf-491f-9e3b-ef9c214360f7	\N	{"sku": "TASK021-SKU-001", "name": "Task 021 Gala Apples", "unit": "kg", "status": "active", "barcode": "4600000000211", "imageUrl": null, "shortName": "Gala Apples", "description": "Task 021 verification product", "defaultPluCode": "TASK021-PLU-001", "imageFileAssetId": null}	{"sku": "TASK021-SKU-001", "name": "Task 021 Gala Apples Updated", "unit": "kg", "status": "active", "barcode": "4600000000211", "imageUrl": null, "shortName": "Gala Apples", "description": "Task 021 verification product", "defaultPluCode": "TASK021-PLU-001", "imageFileAssetId": null}	{"warning": {"code": "PRODUCT_USED_IN_ACTIVE_CATALOG_PLACEMENTS", "message": "Product is used in active catalog placements; catalog consumers may be affected by this update.", "activePlacementCount": 1}}	127.0.0.1	curl/8.5.0	2026-05-15 01:03:34.622
b1c81417-4397-48cc-a084-1da5dc5086cf	00000000-0000-0000-0000-000000000921	product.updated	Product	58b48f52-dbc6-43dd-b3b3-9a901ce2a2a5	\N	{"sku": "TASK021-SKU-OP", "name": "Task 021 Operator Pears", "unit": "piece", "status": "active", "barcode": "4600000000212", "imageUrl": null, "shortName": "Op Pears", "description": null, "defaultPluCode": "TASK021-PLU-OP", "imageFileAssetId": null}	{"sku": "TASK021-SKU-OP", "name": "Task 021 Operator Pears", "unit": "piece", "status": "active", "barcode": "4600000000212", "imageUrl": null, "shortName": "Op Pears Updated", "description": null, "defaultPluCode": "TASK021-PLU-OP", "imageFileAssetId": null}	\N	127.0.0.1	curl/8.5.0	2026-05-15 01:03:34.728
cc44b75d-9cf1-4d53-a961-4a9fa5335874	4ea0b245-abad-4768-8e86-7de0c018ae6d	auth.login_failed	AuthLogin	4ea0b245-abad-4768-8e86-7de0c018ae6d	\N	\N	{"success": false}	{"reason": "invalid_credentials", "emailNormalized": "admin@example.com"}	172.18.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-15 10:43:07.142
03eb84c5-f982-4d22-9151-9948dc2f9fe7	4ea0b245-abad-4768-8e86-7de0c018ae6d	auth.login_failed	AuthLogin	4ea0b245-abad-4768-8e86-7de0c018ae6d	\N	\N	{"success": false}	{"reason": "invalid_credentials", "emailNormalized": "admin@example.com"}	172.18.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-15 10:43:11.407
b61dbd2e-9b6d-484f-b1e3-5cfdfb4ecec9	4ea0b245-abad-4768-8e86-7de0c018ae6d	auth.login_failed	AuthLogin	4ea0b245-abad-4768-8e86-7de0c018ae6d	\N	\N	{"success": false}	{"reason": "invalid_credentials", "emailNormalized": "admin@example.com"}	92.108.76.71	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-15 10:53:30.53
6ffd16ce-e70d-43c1-9925-7717ea8530ca	4ea0b245-abad-4768-8e86-7de0c018ae6d	auth.login_failed	AuthLogin	4ea0b245-abad-4768-8e86-7de0c018ae6d	\N	\N	{"success": false}	{"reason": "invalid_credentials", "emailNormalized": "admin@example.com"}	92.108.76.71	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-15 10:55:23.627
6e28102b-94ac-420c-a885-45aa2d2a462e	4ea0b245-abad-4768-8e86-7de0c018ae6d	auth.login_succeeded	UserSession	ab7dbe23-2d8a-450f-81ed-6af93d181518	\N	\N	{"userId": "4ea0b245-abad-4768-8e86-7de0c018ae6d", "expiresAt": "2026-05-29T10:59:14.584Z"}	{"emailNormalized": "admin@example.com"}	92.108.76.71	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-15 10:59:14.703
5ab3520c-36b3-4104-b2f7-6438705268b7	4ea0b245-abad-4768-8e86-7de0c018ae6d	auth.login_succeeded	UserSession	f604f0b3-41e2-48a8-a073-026326c0db9e	\N	\N	{"userId": "4ea0b245-abad-4768-8e86-7de0c018ae6d", "expiresAt": "2026-05-29T17:08:19.265Z"}	{"emailNormalized": "admin@example.com"}	92.108.76.71	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-15 17:08:19.385
\.


--
-- Data for Name: catalog_product_placements; Type: TABLE DATA; Schema: public; Owner: scale_admin
--

COPY public.catalog_product_placements (id, "catalogId", "categoryId", "productId", "sortOrder", status, "createdAt", "updatedAt") FROM stdin;
99e738b3-28f9-4b54-8d2c-64676266d3a5	08ba590a-f09d-48fe-a28d-f4ce69271c45	b00f6e03-2a15-4a98-b885-66ece9c613db	a09d089e-6baf-491f-9e3b-ef9c214360f7	0	active	2026-05-15 01:03:34.582	2026-05-15 01:03:34.582
\.


--
-- Data for Name: catalog_versions; Type: TABLE DATA; Schema: public; Owner: scale_admin
--

COPY public.catalog_versions (id, "catalogId", "storeId", "versionNumber", status, "publishedByUserId", "publishedAt", "basedOnVersionId", "packageData", "packageUrl", "packageChecksum", "createdAt") FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: scale_admin
--

COPY public.categories (id, "catalogId", "parentId", name, "shortName", "sortOrder", status, "createdAt", "updatedAt") FROM stdin;
b00f6e03-2a15-4a98-b885-66ece9c613db	08ba590a-f09d-48fe-a28d-f4ce69271c45	\N	Task 021 Category	T021	0	active	2026-05-15 01:02:42.095	2026-05-15 01:02:42.095
\.


--
-- Data for Name: file_assets; Type: TABLE DATA; Schema: public; Owner: scale_admin
--

COPY public.file_assets (id, "storeId", "originalFileName", "storagePath", "publicUrl", "mimeType", "sizeBytes", "uploadedByUserId", "createdAt") FROM stdin;
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: scale_admin
--

COPY public.password_reset_tokens (id, "userId", "tokenHash", "expiresAt", "usedAt", "createdAt") FROM stdin;
a66f1a11-7e4c-4261-8f88-9cde3b01c58a	4ea0b245-abad-4768-8e86-7de0c018ae6d	rFHXFGVlnB00-8EKD9k4T_KQw2HIY0reQRInu-gVizc	2026-05-14 17:55:39.071	2026-05-14 16:55:39.372	2026-05-14 16:55:39.08
1a9836ec-f42c-4107-9055-77705c6fde3c	4ea0b245-abad-4768-8e86-7de0c018ae6d	EJIEu6I1JjEQotJVf1_Zzyxx5olu2OWkuXcM9w_8xMs	2026-05-14 16:54:40.056	\N	2026-05-14 16:55:40.057
50e2ae4e-3ce7-4366-abfe-3b22ba460d73	4ea0b245-abad-4768-8e86-7de0c018ae6d	mrQeAZ45Y_PIyMHqPKZN-E95CVPzR1iI7WYJlo2UXgM	2026-05-14 17:57:18.52	2026-05-14 16:57:18.748	2026-05-14 16:57:18.527
4e6fa8fc-c2fe-455f-b1da-4b926cfd6f57	4ea0b245-abad-4768-8e86-7de0c018ae6d	4jwcmeG5sP2RCsMDZhqOKzoFmrL_BcXNi55ZeP_nKww	2026-05-14 16:56:19.346	\N	2026-05-14 16:57:19.347
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: scale_admin
--

COPY public.products (id, "defaultPluCode", name, "shortName", description, "imageUrl", "imageFileAssetId", barcode, sku, unit, status, "createdAt", "updatedAt") FROM stdin;
a09d089e-6baf-491f-9e3b-ef9c214360f7	TASK021-PLU-001	Task 021 Gala Apples Updated	Gala Apples	Task 021 verification product	\N	\N	4600000000211	TASK021-SKU-001	kg	active	2026-05-15 01:03:33.887	2026-05-15 01:03:34.619
58b48f52-dbc6-43dd-b3b3-9a901ce2a2a5	TASK021-PLU-OP	Task 021 Operator Pears	Op Pears Updated	\N	\N	\N	4600000000212	TASK021-SKU-OP	piece	active	2026-05-15 01:03:34.003	2026-05-15 01:03:34.726
3cee0f49-fb88-45d1-9f24-b511474c386d	1001	Apples Red Weighted	Red Apples	Local development sample weighted apples	\N	\N	4600000000011	APL-RED-001	kg	active	2026-05-14 11:46:40.745	2026-05-15 17:07:01.287
0076c724-1cac-45f1-8bba-c3838f471d7e	1002	Bananas Weighted	Bananas	Local development sample bananas	\N	\N	4600000000028	BAN-001	kg	active	2026-05-14 11:46:40.751	2026-05-15 17:07:01.291
6f345350-a694-42a6-a67f-5d2a36e6ce39	2001	Milk Bottle 1L	Milk 1L	Local development sample piece product	\N	\N	4600000000035	MILK-1L-001	piece	active	2026-05-14 11:46:40.754	2026-05-15 17:07:01.294
\.


--
-- Data for Name: scale_devices; Type: TABLE DATA; Schema: public; Owner: scale_admin
--

COPY public.scale_devices (id, "storeId", "deviceCode", "apiTokenHash", name, model, status, "lastSeenAt", "lastSyncAt", "currentCatalogVersionId", "createdAt", "updatedAt") FROM stdin;
0058f6d8-35b5-475b-8d90-97c3793fd49b	c223a7cd-43cc-4404-a765-d3a0e4f4af1c	TASK019-SCALE-001	MDK7S8eaB4ippoZI9IbN4UhQ8C_XxsJFYZkaOLmVAPw	Task 019 Scale	MVP-Scale	inactive	\N	\N	\N	2026-05-14 22:06:00.584	2026-05-14 22:06:01.244
\.


--
-- Data for Name: scale_sync_logs; Type: TABLE DATA; Schema: public; Owner: scale_admin
--

COPY public.scale_sync_logs (id, "scaleDeviceId", "storeId", "requestedVersionId", "deliveredVersionId", status, "errorMessage", "requestIp", "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: store_catalogs; Type: TABLE DATA; Schema: public; Owner: scale_admin
--

COPY public.store_catalogs (id, "storeId", name, status, "currentVersionId", "createdAt", "updatedAt") FROM stdin;
2eba1cc9-b239-4000-8c99-54a46217c9db	2f686ecd-90b5-4e9d-87ea-43ea93efa76e	Main catalog	active	\N	2026-05-14 20:03:28.273	2026-05-14 20:03:28.273
45bc0add-deea-4111-9008-0d0aadb8bdde	5e8b8ffc-bfce-436d-ba8c-cf8f55fdf4d4	Main catalog	active	\N	2026-05-14 20:27:05.278	2026-05-14 20:27:05.278
2dbde66f-4f48-4b26-bee1-ab9c9b458917	435de0ee-9c38-409c-9359-5237f09bf4ea	Main catalog	active	\N	2026-05-14 20:27:05.335	2026-05-14 20:27:05.335
edd3bee6-60c1-46eb-b391-3d5a15afe2fa	68558068-8fa7-4de5-a527-b4ecaf7d8200	Main catalog	active	\N	2026-05-14 20:46:10.641	2026-05-14 20:46:10.641
513ace54-3228-4a90-945d-abe0187242f2	32552567-495c-4505-b12a-270148880198	Main catalog	active	\N	2026-05-14 20:46:10.645	2026-05-14 20:46:10.645
08ba590a-f09d-48fe-a28d-f4ce69271c45	6a2281d5-a181-4867-82f7-14e4fd4af0ce	Main catalog	active	\N	2026-05-15 01:02:42.09	2026-05-15 01:02:42.09
febebb65-0f27-413f-adfd-9ed697676831	21a4e45c-1c52-4f0f-b2ac-854b32bbd7a4	Main Catalog	active	\N	2026-05-14 11:46:40.741	2026-05-15 17:07:01.284
\.


--
-- Data for Name: store_product_prices; Type: TABLE DATA; Schema: public; Owner: scale_admin
--

COPY public.store_product_prices (id, "storeId", "productId", price, currency, status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: stores; Type: TABLE DATA; Schema: public; Owner: scale_admin
--

COPY public.stores (id, code, name, address, timezone, status, "createdAt", "updatedAt") FROM stdin;
adc14d18-59b7-43f1-995f-f079c2ef0b96	STORE-002	Manager Verify Store 002	\N	Europe/Moscow	active	2026-05-14 11:46:40.987	2026-05-14 11:46:40.987
9624578d-a8c9-45a4-8dbf-006c961c0adf	TASK013-A	Task 013 Store A	\N	Europe/Moscow	active	2026-05-14 17:40:43.174	2026-05-14 17:40:43.174
1b28a00c-b4bf-454c-b1c0-43428ee60e76	TASK013-B	Task 013 Store B	\N	Europe/Moscow	active	2026-05-14 17:40:43.177	2026-05-14 17:40:43.177
2f686ecd-90b5-4e9d-87ea-43ea93efa76e	TASK016-ACTIVE	Task 016 Updated Store	Updated Task Street	Europe/Amsterdam	inactive	2026-05-14 20:03:28.271	2026-05-14 20:03:28.543
435de0ee-9c38-409c-9359-5237f09bf4ea	T17B-1778790425	Task 017 Store B	A2A test address B	Europe/Moscow	active	2026-05-14 20:27:05.334	2026-05-14 20:27:05.334
5e8b8ffc-bfce-436d-ba8c-cf8f55fdf4d4	T17A-1778790425	Task 017 Store A Edited	A2A test address A	Europe/Moscow	active	2026-05-14 20:27:05.276	2026-05-14 20:27:05.39
68558068-8fa7-4de5-a527-b4ecaf7d8200	TASK018-ALLOWED	Task 018 Allowed Store	\N	Europe/Amsterdam	active	2026-05-14 20:46:10.631	2026-05-14 20:46:10.631
32552567-495c-4505-b12a-270148880198	TASK018-DENIED	Task 018 Denied Store	\N	Europe/Amsterdam	active	2026-05-14 20:46:10.634	2026-05-14 20:46:10.634
c223a7cd-43cc-4404-a765-d3a0e4f4af1c	TASK019-STORE	Task 019 Store	\N	Europe/Amsterdam	active	2026-05-14 22:02:56.875	2026-05-14 22:02:56.875
6a2281d5-a181-4867-82f7-14e4fd4af0ce	TASK021-STORE	Task 021 Store	\N	Europe/Amsterdam	active	2026-05-15 01:02:42.083	2026-05-15 01:02:42.083
21a4e45c-1c52-4f0f-b2ac-854b32bbd7a4	STORE-001	Sample Store 001	Local development sample store	Europe/Moscow	active	2026-05-14 11:46:40.733	2026-05-15 17:07:01.275
\.


--
-- Data for Name: user_credentials; Type: TABLE DATA; Schema: public; Owner: scale_admin
--

COPY public.user_credentials (id, "userId", "passwordHash", "passwordHashAlgorithm", "passwordHashParams", "passwordChangedAt", "mustChangePassword", "failedLoginCount", "lastFailedLoginAt", "lockedUntil", "createdAt", "updatedAt") FROM stdin;
36d637be-0bc8-4907-9130-7b23de34fc9c	351bee49-cbcd-4d68-859a-fa5ded93ddf0	d4sHfHWMK0Yuwnx+iOWBtGIcnAA7rc5jvsjkcg5HpkVSRaHqYkabNvNc+q1o8gV7A3eac3RW32dj4SjBzmHZUQ==	pbkdf2_sha512	{"salt": "AFKXVagbRdlG7ePg8vrUcVWWN1PiUUgtrN0nPOtGNV4=", "digest": "sha512", "encoding": "base64", "keyLength": 64, "iterations": 210000}	2026-05-14 16:36:22.712	f	0	\N	\N	2026-05-14 16:36:22.854	2026-05-14 16:56:46.044
6bb9a23d-593d-480e-ac90-42f36eefbab7	cb7e1101-4c13-4bf0-a327-85a2719ad265	/oSRL75mFRc/aScCQY3Z0MN6HMhRDpr2WazGA5vhB/IrDo/nbSjGaN+Z0pO2AMPieFGo5iJhsgPwFk2Eju/07Q==	pbkdf2_sha512	{"salt": "awJDlvu1K3JGSuabdjz3ElfZ+zsAlgc6cDiNzOpUUkc=", "digest": "sha512", "encoding": "base64", "keyLength": 64, "iterations": 210000}	2026-05-14 16:36:56.509	f	0	\N	\N	2026-05-14 16:36:56.623	2026-05-14 16:56:46.044
83007221-58fc-4aa8-a92b-582dc4dd6a4c	41835af1-c798-401d-8733-ec1d95b757e6	Ahds9ztJwaL8ddSzYM8OlMsoHqRF7nZuXAg4sWZ2O1H9gO4JNWkHeYT3bWybXYu+gAa5awCILLice/qwP+BZ9w==	pbkdf2_sha512	{"salt": "l3b+mQ8IkqcTzBEfekK3IYlHW+dCQZZ8q4WN4uWDdtY=", "digest": "sha512", "encoding": "base64", "keyLength": 64, "iterations": 210000}	2026-05-14 16:40:38.352	f	0	\N	\N	2026-05-14 16:40:38.468	2026-05-14 16:56:46.044
5fdbb145-63ce-4ba5-8110-f1236c0f479f	00000000-0000-0000-0000-000000000888	k4hfPa5tEqYYBZ7ADUbaUexatQte1qzYndRZXuJLL0lWN8EvxZJfVXUZxQcTGMW1AXX/Yjk1Jw+32P8CBcL1iA==	pbkdf2_sha512	{"salt": "9eAyICaXM3jweYiYfYDQY390oXwMAH2DE6iwPfAzXnI=", "digest": "sha512", "encoding": "base64", "keyLength": 64, "iterations": 210000}	2026-05-14 11:46:40.995	f	0	\N	\N	2026-05-14 11:46:40.996	2026-05-14 16:56:46.044
37117dd9-cdee-4d2e-a67b-8dfbfe5bde9b	673b95cd-7fd6-40a7-8901-b5d5e4125b9f	+tyoMGeJNoz8wtVXsal1qNSo9UOUPdXKSHYOSbQ4kO8S+fEPsK6NE3MNO1fjT0M3pAOMS3iFqx4HATxP7W0qBA==	pbkdf2_sha512	{"salt": "DiJPAIA6SDRkke3Yy+lmih3rcrjr1K1RryC3iiPqAYU=", "digest": "sha512", "encoding": "base64", "keyLength": 64, "iterations": 210000}	2026-05-14 17:22:26.611	f	0	\N	\N	2026-05-14 17:22:26.727	2026-05-14 17:22:26.727
049fc760-133c-4f05-b664-f45d1eabbde6	00000000-0000-0000-0000-000000000913	XzQr8Y1NYDRQJFr3rnlPTYKO7wYnt41RpLYvak1BO/NuZAAOXz6rdrUmJKYEWwUcPld6FqA3hn//RkH6MaBFKQ==	pbkdf2_sha512	{"salt": "s//3fvLZcUdwf5ckdqld2jDeJTwRCTNyXEO8MXBP0mY=", "digest": "sha512", "encoding": "base64", "keyLength": 64, "iterations": 210000}	2026-05-14 17:40:43.169	f	0	\N	\N	2026-05-14 17:40:43.17	2026-05-14 17:41:32.829
b82f36d0-7d34-4769-8200-ae57f4a07ef0	571453dd-d1c9-40ce-8d27-8cbc72c4bfff	D1D9JffWStpCAOR5CZAwRKG6QJiFuV/epA8KXKHJllCEiDKlBF6JkG5cmM5NvhZvxz5Yx54DpZZPsuVO2DQCzg==	pbkdf2_sha512	{"salt": "jicyh1eZhhlnbvUO2vx4jmXYxfDNZCO2OQruwpsvOAw=", "digest": "sha512", "encoding": "base64", "keyLength": 64, "iterations": 210000}	2026-05-14 20:27:05.566	f	0	\N	\N	2026-05-14 20:27:05.684	2026-05-14 20:27:05.922
ee5d9705-8cf1-4855-904c-2510f5814f79	00000000-0000-0000-0000-000000000921	JsSSwPTcRRDsE9G1357q0D+XllVffcTjeT9Zki9RNU6uT1wgEAko7W2MMmr+5UUf1km4gfbsGEVI4ks//fwD6g==	pbkdf2_sha512	{"salt": "jz9XpHxYQO40ITiPcAeRnkhdfgI2ifvXybUFBY43Nls=", "digest": "sha512", "encoding": "base64", "keyLength": 64, "iterations": 210000}	2026-05-15 01:02:42.062	f	0	\N	\N	2026-05-15 01:02:42.063	2026-05-15 01:03:33.858
7b339d9d-18a8-4de6-af51-4b1744e29d6e	00000000-0000-0000-0000-000000000912	Jn55ySfgC/2Nw1qrDPyMvoYNFexKU92K3tXZ02A6/Xj4XSmi+hZRtT7f3yVHR8HNcW9ZqjMKjYs0q+sYUMx6qQ==	pbkdf2_sha512	{"salt": "t8D4IrUXjt40H3KxXfHz5cLXI9k3R6v6pUdYq6jtS6k=", "digest": "sha512", "encoding": "base64", "keyLength": 64, "iterations": 210000}	2026-05-14 17:17:38.392	f	0	\N	\N	2026-05-14 17:17:38.393	2026-05-14 17:17:38.393
d5930c26-899b-4b3f-b69f-aaac8276e018	00000000-0000-0000-0000-000000000918	hzfxSB14hDD9f1usjnCQrTK5vRTmn2mf4ezzZ2r/ly3SAo0wBgZhOhERmBSQXlufgUMUWerVcoolwakR+mJM8w==	pbkdf2_sha512	{"salt": "537biPeealJ0M5/FY/CM0CzEF348vvXNmr7OCxMzQOI=", "digest": "sha512", "encoding": "base64", "keyLength": 64, "iterations": 210000}	2026-05-14 20:46:10.625	f	0	\N	\N	2026-05-14 20:46:10.626	2026-05-14 20:46:45.415
6ac0354f-b611-4e81-9b6d-6d2f78113800	4ea0b245-abad-4768-8e86-7de0c018ae6d	b1Qh6pJJ3+qH3Fidp6luWtyBrqGl++X7pPngkzdTx5muMts7RO4BU79u2IQXN7rvTgxpSUgJHMoVFjKdwovgMQ==	pbkdf2_sha512	{"salt": "KH+rk3q4vOYTiPO4K9gdEisKx8Eg08gxO42pw5GDk9g=", "digest": "sha512", "encoding": "base64", "keyLength": 64, "iterations": 210000}	2026-05-15 17:07:01.144	f	0	\N	\N	2026-05-14 11:46:40.622	2026-05-15 17:08:19.374
63fc0b73-6f80-4877-824f-781015012850	00000000-0000-0000-0000-000000000916	Ro0bf9heiIoXQuZZF18fyJHxPjrSCoEiH/Y5UDIBZtzO1AFi0SFeA/uwq+OLNFW0sbsPuvEIyr1YoMq+QvguOg==	pbkdf2_sha512	{"salt": "BtpPqOR7EotNW+s/E+NjmGBytRjnjYF+sVz8USSLLxY=", "digest": "sha512", "encoding": "base64", "keyLength": 64, "iterations": 210000}	2026-05-14 20:02:46.568	f	0	\N	\N	2026-05-14 20:02:46.569	2026-05-14 20:03:28.676
\.


--
-- Data for Name: user_invites; Type: TABLE DATA; Schema: public; Owner: scale_admin
--

COPY public.user_invites (id, email, role, "tokenHash", "invitedByUserId", "expiresAt", "acceptedAt", "createdAt") FROM stdin;
ac8442f9-22a5-4c38-b8c1-3604319e82eb	task010-1778776582-16305@example.com	operator	azobcZDH_572a06wuGjeNfyF_ueURM-nt1Z1vq0n_4g	4ea0b245-abad-4768-8e86-7de0c018ae6d	2026-05-14 17:36:22.573	2026-05-14 16:36:22.712	2026-05-14 16:36:22.612
47c775ac-0eaf-4a3b-b52a-4a84a877157a	task010-expired-1778776583-21986@example.com	operator	Ml32MkSm22OuklF_c1mqvOGNMHMsQtFcWS5yeCmfY4s	4ea0b245-abad-4768-8e86-7de0c018ae6d	2026-05-14 15:36:23.109	\N	2026-05-14 16:36:23.14
c172cb13-f832-4d13-9232-e3e947ff02c6	task010-1778776616-3640@example.com	operator	GquyYXRMvse2Hu3EAPqPiS3t7UuH_CnZEphdBnsBsZI	4ea0b245-abad-4768-8e86-7de0c018ae6d	2026-05-14 17:36:56.381	2026-05-14 16:36:56.509	2026-05-14 16:36:56.414
0dbaf2bb-c205-4f54-888b-d0c0c717d482	task010-expired-1778776616-345@example.com	operator	79ULf4SZMNhe4fEk0vdByH8jwC1Zpxo6VqqH81HoU1U	4ea0b245-abad-4768-8e86-7de0c018ae6d	2026-05-14 15:36:56.875	\N	2026-05-14 16:36:56.922
fc6993b4-3710-4a33-b25d-d764a1877163	task010-final-1778776838-31443@example.com	operator	3HF-JuDZk5tmyQX4ZeW-pD5ruSBVSEbKXRRdRghzzrY	4ea0b245-abad-4768-8e86-7de0c018ae6d	2026-05-14 17:40:38.224	2026-05-14 16:40:38.352	2026-05-14 16:40:38.256
bf019773-b152-4ebf-adf8-c9076091d255	task010-final-expired-1778776838-29804@example.com	operator	XRZ9flbgo2Snglnw5B8wqTkNaCYW9Vn9f8yBtJ8m_Pk	4ea0b245-abad-4768-8e86-7de0c018ae6d	2026-05-14 15:40:38.718	\N	2026-05-14 16:40:38.745
08236384-2e5f-4178-bc11-b280332037fd	task012-manager-1778779346@example.com	operator	_drtv-dBQ1N4hn_ouy7OszHjcZgQFAJ5c7bgWM0QZwk	4ea0b245-abad-4768-8e86-7de0c018ae6d	2026-05-14 18:22:26.426	2026-05-14 17:22:26.611	2026-05-14 17:22:26.497
dfbff88c-5c98-441e-a41d-631742bf2fe7	task017-operator-1778790425@example.com	operator	i5kQFUwW7i2mr0kuiQdlMNA6dmpPs5-VDMW2ubs20BE	4ea0b245-abad-4768-8e86-7de0c018ae6d	2026-05-15 20:27:05	2026-05-14 20:27:05.566	2026-05-14 20:27:05.467
\.


--
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: scale_admin
--

COPY public.user_sessions (id, "userId", "sessionTokenHash", "createdAt", "lastUsedAt", "expiresAt", "revokedAt", "revokedReason", "ipAddress", "userAgent") FROM stdin;
4adec1d7-2162-41cb-b09b-f041891c9d6b	4ea0b245-abad-4768-8e86-7de0c018ae6d	Rs2XpZQfbcVG9awstOuN5w5FHq1qVzhOcvwlyJoKVI8	2026-05-14 20:03:28.124	2026-05-14 20:03:28.537	2026-05-28 20:03:28.124	\N	\N	127.0.0.1	curl/8.5.0
d6836e42-0955-4013-870e-a077a00e185c	00000000-0000-0000-0000-000000000888	Uhrq1vy67y8zh5xCpvHhxsk4FkZjnDRvspXclyEUDtk	2026-05-14 11:47:02.917	2026-05-14 11:47:02.983	2026-05-28 11:47:02.917	\N	\N	127.0.0.1	curl/8.5.0
7450c325-553c-4102-a58d-36f400535e55	00000000-0000-0000-0000-000000000916	ZdBVxd9_svzlPj-imb5MAiUX_YC6qclR-RIealuHz3k	2026-05-14 20:03:28.567	2026-05-14 20:03:28.72	2026-05-28 20:03:28.567	\N	\N	127.0.0.1	curl/8.5.0
e4fdbfd5-ef6c-4ba5-a1d6-5a4b2d4b70b7	4ea0b245-abad-4768-8e86-7de0c018ae6d	Y9_-x1YP1nWLQnJmWera-ZgsOZ5HVQoCzN1oNwTMZq0	2026-05-14 17:22:26.273	2026-05-14 17:22:27.135	2026-05-28 17:22:26.273	\N	\N	127.0.0.1	curl/8.5.0
6437ceea-84f9-442f-a095-94368c5e476a	4ea0b245-abad-4768-8e86-7de0c018ae6d	iz4-BKAgUX5a2yfixSzBSwtqOlG9RY2ee-etVHsRmBg	2026-05-14 14:04:40.582	2026-05-14 14:04:40.582	2026-05-28 14:04:40.582	2026-05-14 14:04:40.716	logout	127.0.0.1	curl/8.5.0
af869cf4-516c-47f5-b049-19be322faf76	4ea0b245-abad-4768-8e86-7de0c018ae6d	JNVbnrGBQeduNPQHivE0MEYKRtMq6cMkaZb7AAiFmS0	2026-05-14 14:06:51.267	2026-05-14 14:06:51.267	2026-05-28 14:06:51.267	2026-05-14 14:06:51.406	logout	127.0.0.1	curl/8.5.0
69f87fb2-b1f0-4c85-97c8-f7dcd5239c14	351bee49-cbcd-4d68-859a-fa5ded93ddf0	m8L8dWRdtGlhdERXApARaBV3FpKhK0ltWcavVN0b7jI	2026-05-14 16:36:22.961	2026-05-14 16:36:22.961	2026-05-28 16:36:22.961	\N	\N	127.0.0.1	curl/8.5.0
c9e076c3-3bb5-499f-be8f-c08934c4d3cf	cb7e1101-4c13-4bf0-a327-85a2719ad265	7o2uXsTq9CRQDp6LBTdpESMnJZD4eyLMf-XM3iENT1k	2026-05-14 16:36:56.72	2026-05-14 16:36:56.72	2026-05-28 16:36:56.72	\N	\N	127.0.0.1	curl/8.5.0
ab7dbe23-2d8a-450f-81ed-6af93d181518	4ea0b245-abad-4768-8e86-7de0c018ae6d	4QaacFyyOxyS6KdTmEso1xb0B5-OA1sL6BqSYlHHEfQ	2026-05-15 10:59:14.584	2026-05-15 10:59:37.868	2026-05-29 10:59:14.584	2026-05-15 11:46:25.728	idle_timeout	92.108.76.71	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36
89f49c30-ccf1-4b87-a977-fc3e48bfcb22	41835af1-c798-401d-8733-ec1d95b757e6	9shjCURrD4StNmjUoMZWUn_EN_cCv8Q6H6fWRfjo6Sw	2026-05-14 16:40:38.557	2026-05-14 16:40:38.557	2026-05-28 16:40:38.557	\N	\N	127.0.0.1	curl/8.5.0
5c98d76b-c7d7-4f32-97e7-035d4746cd84	4ea0b245-abad-4768-8e86-7de0c018ae6d	geXmrs5LG8QGvVy92eLsWVlSOQefSlJFgIw9UDtQNYM	2026-05-14 11:47:03.101	2026-05-14 11:47:03.161	2026-05-28 11:47:03.101	2026-05-14 16:55:39.372	password_reset	127.0.0.1	curl/8.5.0
df519045-5af1-40b0-af6f-28aa8cf498e6	4ea0b245-abad-4768-8e86-7de0c018ae6d	g036jomwC7DquAYGP1_8MTsfjgQuy8SCmg0S8tiChcc	2026-05-14 16:36:22.409	2026-05-14 16:36:23.133	2026-05-28 16:36:22.409	2026-05-14 16:55:39.372	password_reset	127.0.0.1	curl/8.5.0
977dd535-7085-415d-9bea-33960682ab35	4ea0b245-abad-4768-8e86-7de0c018ae6d	urzgQ9oqkwAK05HI6E28qPCRIKCZ15aiZ7k248LUsH0	2026-05-14 16:36:56.216	2026-05-14 16:36:56.902	2026-05-28 16:36:56.216	2026-05-14 16:55:39.372	password_reset	127.0.0.1	curl/8.5.0
39a773b1-c4a3-44cf-abae-348093b995ac	4ea0b245-abad-4768-8e86-7de0c018ae6d	NIILmGon6GxpZNq3GWNTRnrr08MAk3uDXy6a-oEt2js	2026-05-14 16:40:38.075	2026-05-14 16:40:38.74	2026-05-28 16:40:38.075	2026-05-14 16:55:39.372	password_reset	127.0.0.1	curl/8.5.0
0ea43fa6-1dcc-4ab3-856e-00a31ee9e319	4ea0b245-abad-4768-8e86-7de0c018ae6d	Gys9w574rIMa90BYkhmBy-N2GxW4sp6MZbv7cDfNLKs	2026-05-14 16:55:38.936	2026-05-14 16:55:38.936	2026-05-28 16:55:38.936	2026-05-14 16:55:39.372	password_reset	127.0.0.1	curl/8.5.0
b3561ed3-3f46-44ee-a457-a871af91a73a	4ea0b245-abad-4768-8e86-7de0c018ae6d	BFb5Qjd7I3IeO-HY76HPmG8qgme-4gljxEtCqr-DZG4	2026-05-14 16:55:39.696	2026-05-14 16:55:39.696	2026-05-28 16:55:39.696	2026-05-14 16:57:18.748	password_reset	127.0.0.1	curl/8.5.0
eea41f89-ddc0-43b7-8060-41c02d00f9b7	4ea0b245-abad-4768-8e86-7de0c018ae6d	0hciVIja1Z2Z3WH_dxiPmp-f0kohCv457VGcXf02skg	2026-05-14 16:57:18.388	2026-05-14 16:57:18.388	2026-05-28 16:57:18.388	2026-05-14 16:57:18.748	password_reset	127.0.0.1	curl/8.5.0
08ead7fc-928b-4f40-97ec-79aea809cf98	4ea0b245-abad-4768-8e86-7de0c018ae6d	Lsgu21QgNSAV82Xafo51OMdRSVHPYg5T5IYqA1mZAKg	2026-05-14 16:57:19.025	2026-05-14 16:57:19.025	2026-05-28 16:57:19.025	\N	\N	127.0.0.1	curl/8.5.0
3be596d9-dd24-479f-b1fd-4f714f632c05	4ea0b245-abad-4768-8e86-7de0c018ae6d	Lk-nVpSLsiPqzF6KKsDeQRRQyheVi2AMewtebZ_Pjaw	2026-05-14 22:03:51.059	2026-05-14 22:03:51.784	2026-05-28 22:03:51.059	\N	\N	127.0.0.1	curl/8.5.0
8440af97-1d2f-40e5-8dfd-c528dfd1966e	4ea0b245-abad-4768-8e86-7de0c018ae6d	fBtqO1IpnA7UiN2h-9kqdnAl-8oxVoJZBpVVAg2ZSAg	2026-05-14 17:41:32.077	2026-05-14 17:41:32.672	2026-05-28 17:41:32.077	\N	\N	127.0.0.1	curl/8.5.0
073de357-69dc-4fe7-b769-8c6642e05ae2	00000000-0000-0000-0000-000000000913	JMGfwr6z3kjnz_shl3gQXfYMuDLyevxfCmsuIqjNNFY	2026-05-14 17:41:32.246	2026-05-14 17:41:32.458	2026-05-28 17:41:32.246	2026-05-14 17:41:32.684	store_access_changed	127.0.0.1	curl/8.5.0
e7782a74-0b33-4c60-8425-347975b6755a	00000000-0000-0000-0000-000000000913	Kg8pQpS9QcNZDGylG5Y35-2vkE7W_iVZsiSCg8jQqqs	2026-05-14 17:41:32.718	2026-05-14 17:41:32.849	2026-05-28 17:41:32.718	\N	\N	127.0.0.1	curl/8.5.0
958a7a6c-8462-4bde-a139-c5ae5cf0983f	4ea0b245-abad-4768-8e86-7de0c018ae6d	CqGnsPNN_7WK4afC8vg6jLY2mlF3gTQj-UXGr5dfR8s	2026-05-14 17:18:16.55	2026-05-14 17:18:16.847	2026-05-28 17:18:16.55	\N	\N	127.0.0.1	curl/8.5.0
f604f0b3-41e2-48a8-a073-026326c0db9e	4ea0b245-abad-4768-8e86-7de0c018ae6d	t_ZXrljkxNq-ZDyAGdO_d49c7RxROSxFDIhOVMkctfU	2026-05-15 17:08:19.265	2026-05-15 17:08:53.172	2026-05-29 17:08:19.265	\N	\N	92.108.76.71	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36
2d18fa93-05e0-4f00-ac56-8fab206de32e	4ea0b245-abad-4768-8e86-7de0c018ae6d	fRKqoFl8jcH3GIatNmmyXW1n47cPrz0KLKenQKJIE4c	2026-05-14 18:09:05.977	2026-05-14 18:09:06.109	2026-05-28 18:09:05.977	2026-05-14 18:09:06.128	logout	172.18.0.1	curl/8.5.0
da13a933-f39d-4b38-a7f0-e96bad4a695b	4ea0b245-abad-4768-8e86-7de0c018ae6d	oGJVsmqubZBnhUVQd3vNev1VV7pzSRwiunlN9lUHnZc	2026-05-14 18:10:22.316	2026-05-14 18:10:22.454	2026-05-28 18:10:22.316	2026-05-14 18:10:22.474	logout	172.18.0.1	curl/8.5.0
73d7379d-3bb9-4545-bb83-015ea58d4afc	4ea0b245-abad-4768-8e86-7de0c018ae6d	-UXI8lwwTjSSLTEzRg3l6HsnwBYGZzKKXmO67zNaafE	2026-05-14 20:27:05.106	2026-05-14 20:27:05.738	2026-05-28 20:27:05.106	\N	\N	172.18.0.1	curl/8.5.0
b663dd23-b33b-486c-b5c0-30d216a2a5c5	4ea0b245-abad-4768-8e86-7de0c018ae6d	mfdGd6iCh6bRUZyuRFYtIHkChj3Hkc3wUcdRJsR_WPc	2026-05-14 18:21:43.504	2026-05-14 18:21:43.681	2026-05-28 18:21:43.504	2026-05-14 18:21:43.737	logout	172.18.0.1	curl/8.5.0
03684467-5e1e-422c-a2fd-825ee6ae9869	571453dd-d1c9-40ce-8d27-8cbc72c4bfff	jlF1jdAYbarji7Qr9l1z7k_9b0PZt-3QhoQLASRIIc4	2026-05-14 20:27:05.815	2026-05-14 20:27:05.97	2026-05-28 20:27:05.815	\N	\N	172.18.0.1	curl/8.5.0
7a3abebb-78e0-492f-81a6-d4a1325d2fe6	4ea0b245-abad-4768-8e86-7de0c018ae6d	ag5fr4UJ9Sor0ylzTWoVABqK0IOZacx5wUgda9HqZR0	2026-05-14 20:46:45.174	2026-05-14 20:46:45.438	2026-05-28 20:46:45.174	\N	\N	127.0.0.1	curl/8.5.0
6a120bfc-3f48-4c87-bc0e-70f541d19bf6	4ea0b245-abad-4768-8e86-7de0c018ae6d	ie8ICzuVwtF6vqjzNil9-imaOqRVglbhSgzAlGhEdI8	2026-05-14 22:06:00.443	2026-05-14 22:06:01.229	2026-05-28 22:06:00.443	\N	\N	127.0.0.1	curl/8.5.0
c7f3acd1-490e-4ff4-98a6-b0a188605ab0	00000000-0000-0000-0000-000000000918	sfL6cGav_eUDSj7Nb8DaM1I2C2aIpdW1BIuuEb0ak3U	2026-05-14 20:46:45.304	2026-05-14 20:46:45.634	2026-05-28 20:46:45.304	\N	\N	127.0.0.1	curl/8.5.0
87c69859-a43a-434b-9815-f21cb677e8e1	4ea0b245-abad-4768-8e86-7de0c018ae6d	oQ4mf4fCNb6icBzZ-J5K0BjIXBz7mORkbqiRx2zprv8	2026-05-15 01:03:33.61	2026-05-15 01:03:34.614	2026-05-29 01:03:33.61	\N	\N	127.0.0.1	curl/8.5.0
3592f840-3183-4758-9faf-85f154e294fa	00000000-0000-0000-0000-000000000921	4_D1j9AizRe8sjdzeDI2aKgBVwbn7LqIWIUHDaXKKa0	2026-05-15 01:03:33.743	2026-05-15 01:03:34.72	2026-05-29 01:03:33.743	\N	\N	127.0.0.1	curl/8.5.0
\.


--
-- Data for Name: user_store_accesses; Type: TABLE DATA; Schema: public; Owner: scale_admin
--

COPY public.user_store_accesses (id, "userId", "storeId", "grantedByUserId", "createdAt", "revokedAt") FROM stdin;
00000000-0000-0000-0000-000000008888	00000000-0000-0000-0000-000000000888	21a4e45c-1c52-4f0f-b2ac-854b32bbd7a4	\N	2026-05-14 11:46:41	\N
ca447fe2-cd71-4dbf-a499-acf76a3d584b	00000000-0000-0000-0000-000000000913	9624578d-a8c9-45a4-8dbf-006c961c0adf	4ea0b245-abad-4768-8e86-7de0c018ae6d	2026-05-14 17:41:32.222	2026-05-14 17:41:32.678
65ccde8c-33f5-4435-bb07-74c0e04bcccf	571453dd-d1c9-40ce-8d27-8cbc72c4bfff	5e8b8ffc-bfce-436d-ba8c-cf8f55fdf4d4	4ea0b245-abad-4768-8e86-7de0c018ae6d	2026-05-14 20:27:05.749	\N
47ecb2b1-d2cf-4a5e-b30a-b7e8294e61af	00000000-0000-0000-0000-000000000918	68558068-8fa7-4de5-a527-b4ecaf7d8200	\N	2026-05-14 20:46:10.653	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: scale_admin
--

COPY public.users (id, email, "emailNormalized", "emailVerifiedAt", "fullName", role, status, "lastLoginAt", "createdByUserId", "createdAt", "updatedAt", "deletedAt") FROM stdin;
00000000-0000-0000-0000-000000000888	operator-manager@example.com	operator-manager@example.com	2026-05-14 11:46:40.99	Manager Verify Operator	operator	active	2026-05-14 11:47:02.917	\N	2026-05-14 11:46:40.991	2026-05-14 11:47:02.92	\N
351bee49-cbcd-4d68-859a-fa5ded93ddf0	task010-1778776582-16305@example.com	task010-1778776582-16305@example.com	2026-05-14 16:36:22.712	Task010 Operator	operator	active	2026-05-14 16:36:22.961	4ea0b245-abad-4768-8e86-7de0c018ae6d	2026-05-14 16:36:22.851	2026-05-14 16:36:23.068	\N
cb7e1101-4c13-4bf0-a327-85a2719ad265	task010-1778776616-3640@example.com	task010-1778776616-3640@example.com	2026-05-14 16:36:56.509	Task010 Operator	operator	active	2026-05-14 16:36:56.72	4ea0b245-abad-4768-8e86-7de0c018ae6d	2026-05-14 16:36:56.622	2026-05-14 16:36:56.826	\N
00000000-0000-0000-0000-000000000916	task016-operator@example.com	task016-operator@example.com	2026-05-14 20:02:46.487	Task 016 Operator	operator	active	2026-05-14 20:03:28.567	\N	2026-05-14 20:02:46.562	2026-05-14 20:03:28.676	\N
41835af1-c798-401d-8733-ec1d95b757e6	task010-final-1778776838-31443@example.com	task010-final-1778776838-31443@example.com	2026-05-14 16:40:38.352	Task010 Operator	operator	active	2026-05-14 16:40:38.557	4ea0b245-abad-4768-8e86-7de0c018ae6d	2026-05-14 16:40:38.466	2026-05-14 16:40:38.674	\N
571453dd-d1c9-40ce-8d27-8cbc72c4bfff	task017-operator-1778790425@example.com	task017-operator-1778790425@example.com	2026-05-14 20:27:05.566	Task 017 Operator	operator	active	2026-05-14 20:27:05.815	4ea0b245-abad-4768-8e86-7de0c018ae6d	2026-05-14 20:27:05.682	2026-05-14 20:27:05.922	\N
00000000-0000-0000-0000-000000000918	task018-operator@example.com	task018-operator@example.com	2026-05-14 20:46:10.54	Task 018 Operator	operator	active	2026-05-14 20:46:45.304	\N	2026-05-14 20:46:10.619	2026-05-14 20:46:45.415	\N
00000000-0000-0000-0000-000000000912	task012-user@example.com	task012-user@example.com	2026-05-14 17:17:38.308	Task 012 User	admin	active	\N	\N	2026-05-14 17:17:38.385	2026-05-14 17:18:16.829	2026-05-14 17:18:16.828
00000000-0000-0000-0000-000000000921	task021-operator@example.com	task021-operator@example.com	2026-05-15 01:02:41.98	Task 021 Operator	operator	active	2026-05-15 01:03:33.743	\N	2026-05-15 01:02:42.055	2026-05-15 01:03:33.858	\N
673b95cd-7fd6-40a7-8901-b5d5e4125b9f	task012-manager-1778779346@example.com	task012-manager-1778779346@example.com	2026-05-14 17:22:26.611	TASK-012 Manager Verify	admin	active	\N	4ea0b245-abad-4768-8e86-7de0c018ae6d	2026-05-14 17:22:26.725	2026-05-14 17:22:27.076	2026-05-14 17:22:27.075
4ea0b245-abad-4768-8e86-7de0c018ae6d	admin@example.com	admin@example.com	2026-05-14 11:46:40.51	Local Admin	admin	active	2026-05-15 17:08:19.265	\N	2026-05-14 11:46:40.512	2026-05-15 17:08:19.377	\N
00000000-0000-0000-0000-000000000913	task013-operator@example.com	task013-operator@example.com	2026-05-14 17:40:43.084	Task 013 Operator	operator	active	2026-05-14 17:41:32.718	\N	2026-05-14 17:40:43.161	2026-05-14 17:41:32.829	\N
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: advertising_banners advertising_banners_pkey; Type: CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.advertising_banners
    ADD CONSTRAINT advertising_banners_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: catalog_product_placements catalog_product_placements_pkey; Type: CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.catalog_product_placements
    ADD CONSTRAINT catalog_product_placements_pkey PRIMARY KEY (id);


--
-- Name: catalog_versions catalog_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.catalog_versions
    ADD CONSTRAINT catalog_versions_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: file_assets file_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.file_assets
    ADD CONSTRAINT file_assets_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: scale_devices scale_devices_pkey; Type: CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.scale_devices
    ADD CONSTRAINT scale_devices_pkey PRIMARY KEY (id);


--
-- Name: scale_sync_logs scale_sync_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.scale_sync_logs
    ADD CONSTRAINT scale_sync_logs_pkey PRIMARY KEY (id);


--
-- Name: store_catalogs store_catalogs_pkey; Type: CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.store_catalogs
    ADD CONSTRAINT store_catalogs_pkey PRIMARY KEY (id);


--
-- Name: store_product_prices store_product_prices_pkey; Type: CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.store_product_prices
    ADD CONSTRAINT store_product_prices_pkey PRIMARY KEY (id);


--
-- Name: stores stores_pkey; Type: CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.stores
    ADD CONSTRAINT stores_pkey PRIMARY KEY (id);


--
-- Name: user_credentials user_credentials_pkey; Type: CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.user_credentials
    ADD CONSTRAINT user_credentials_pkey PRIMARY KEY (id);


--
-- Name: user_invites user_invites_pkey; Type: CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.user_invites
    ADD CONSTRAINT user_invites_pkey PRIMARY KEY (id);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- Name: user_store_accesses user_store_accesses_pkey; Type: CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.user_store_accesses
    ADD CONSTRAINT user_store_accesses_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: advertising_banners_status_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX advertising_banners_status_idx ON public.advertising_banners USING btree (status);


--
-- Name: advertising_banners_storeId_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX "advertising_banners_storeId_idx" ON public.advertising_banners USING btree ("storeId");


--
-- Name: advertising_banners_storeId_sortOrder_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX "advertising_banners_storeId_sortOrder_idx" ON public.advertising_banners USING btree ("storeId", "sortOrder");


--
-- Name: audit_logs_actorUserId_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX "audit_logs_actorUserId_idx" ON public.audit_logs USING btree ("actorUserId");


--
-- Name: audit_logs_createdAt_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX "audit_logs_createdAt_idx" ON public.audit_logs USING btree ("createdAt");


--
-- Name: audit_logs_entityType_entityId_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX "audit_logs_entityType_entityId_idx" ON public.audit_logs USING btree ("entityType", "entityId");


--
-- Name: audit_logs_storeId_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX "audit_logs_storeId_idx" ON public.audit_logs USING btree ("storeId");


--
-- Name: catalog_product_placements_active_product_catalog_key; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE UNIQUE INDEX catalog_product_placements_active_product_catalog_key ON public.catalog_product_placements USING btree ("catalogId", "productId") WHERE (status = 'active'::public."PlacementStatus");


--
-- Name: catalog_product_placements_catalogId_categoryId_sortOrder_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX "catalog_product_placements_catalogId_categoryId_sortOrder_idx" ON public.catalog_product_placements USING btree ("catalogId", "categoryId", "sortOrder");


--
-- Name: catalog_product_placements_catalogId_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX "catalog_product_placements_catalogId_idx" ON public.catalog_product_placements USING btree ("catalogId");


--
-- Name: catalog_product_placements_categoryId_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX "catalog_product_placements_categoryId_idx" ON public.catalog_product_placements USING btree ("categoryId");


--
-- Name: catalog_product_placements_productId_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX "catalog_product_placements_productId_idx" ON public.catalog_product_placements USING btree ("productId");


--
-- Name: catalog_product_placements_status_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX catalog_product_placements_status_idx ON public.catalog_product_placements USING btree (status);


--
-- Name: catalog_versions_catalogId_id_key; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE UNIQUE INDEX "catalog_versions_catalogId_id_key" ON public.catalog_versions USING btree ("catalogId", id);


--
-- Name: catalog_versions_catalogId_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX "catalog_versions_catalogId_idx" ON public.catalog_versions USING btree ("catalogId");


--
-- Name: catalog_versions_catalogId_versionNumber_key; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE UNIQUE INDEX "catalog_versions_catalogId_versionNumber_key" ON public.catalog_versions USING btree ("catalogId", "versionNumber");


--
-- Name: catalog_versions_publishedAt_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX "catalog_versions_publishedAt_idx" ON public.catalog_versions USING btree ("publishedAt");


--
-- Name: catalog_versions_publishedByUserId_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX "catalog_versions_publishedByUserId_idx" ON public.catalog_versions USING btree ("publishedByUserId");


--
-- Name: catalog_versions_storeId_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX "catalog_versions_storeId_idx" ON public.catalog_versions USING btree ("storeId");


--
-- Name: categories_catalogId_id_key; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE UNIQUE INDEX "categories_catalogId_id_key" ON public.categories USING btree ("catalogId", id);


--
-- Name: categories_catalogId_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX "categories_catalogId_idx" ON public.categories USING btree ("catalogId");


--
-- Name: categories_catalogId_parentId_sortOrder_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX "categories_catalogId_parentId_sortOrder_idx" ON public.categories USING btree ("catalogId", "parentId", "sortOrder");


--
-- Name: categories_parentId_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX "categories_parentId_idx" ON public.categories USING btree ("parentId");


--
-- Name: categories_status_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX categories_status_idx ON public.categories USING btree (status);


--
-- Name: file_assets_createdAt_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX "file_assets_createdAt_idx" ON public.file_assets USING btree ("createdAt");


--
-- Name: file_assets_storeId_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX "file_assets_storeId_idx" ON public.file_assets USING btree ("storeId");


--
-- Name: file_assets_uploadedByUserId_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX "file_assets_uploadedByUserId_idx" ON public.file_assets USING btree ("uploadedByUserId");


--
-- Name: password_reset_tokens_expiresAt_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX "password_reset_tokens_expiresAt_idx" ON public.password_reset_tokens USING btree ("expiresAt");


--
-- Name: password_reset_tokens_tokenHash_key; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE UNIQUE INDEX "password_reset_tokens_tokenHash_key" ON public.password_reset_tokens USING btree ("tokenHash");


--
-- Name: password_reset_tokens_userId_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX "password_reset_tokens_userId_idx" ON public.password_reset_tokens USING btree ("userId");


--
-- Name: products_barcode_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX products_barcode_idx ON public.products USING btree (barcode);


--
-- Name: products_defaultPluCode_key; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE UNIQUE INDEX "products_defaultPluCode_key" ON public.products USING btree ("defaultPluCode");


--
-- Name: products_name_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX products_name_idx ON public.products USING btree (name);


--
-- Name: products_shortName_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX "products_shortName_idx" ON public.products USING btree ("shortName");


--
-- Name: products_sku_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX products_sku_idx ON public.products USING btree (sku);


--
-- Name: products_status_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX products_status_idx ON public.products USING btree (status);


--
-- Name: scale_devices_currentCatalogVersionId_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX "scale_devices_currentCatalogVersionId_idx" ON public.scale_devices USING btree ("currentCatalogVersionId");


--
-- Name: scale_devices_deviceCode_key; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE UNIQUE INDEX "scale_devices_deviceCode_key" ON public.scale_devices USING btree ("deviceCode");


--
-- Name: scale_devices_status_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX scale_devices_status_idx ON public.scale_devices USING btree (status);


--
-- Name: scale_devices_storeId_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX "scale_devices_storeId_idx" ON public.scale_devices USING btree ("storeId");


--
-- Name: scale_sync_logs_createdAt_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX "scale_sync_logs_createdAt_idx" ON public.scale_sync_logs USING btree ("createdAt");


--
-- Name: scale_sync_logs_deliveredVersionId_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX "scale_sync_logs_deliveredVersionId_idx" ON public.scale_sync_logs USING btree ("deliveredVersionId");


--
-- Name: scale_sync_logs_requestedVersionId_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX "scale_sync_logs_requestedVersionId_idx" ON public.scale_sync_logs USING btree ("requestedVersionId");


--
-- Name: scale_sync_logs_scaleDeviceId_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX "scale_sync_logs_scaleDeviceId_idx" ON public.scale_sync_logs USING btree ("scaleDeviceId");


--
-- Name: scale_sync_logs_status_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX scale_sync_logs_status_idx ON public.scale_sync_logs USING btree (status);


--
-- Name: scale_sync_logs_storeId_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX "scale_sync_logs_storeId_idx" ON public.scale_sync_logs USING btree ("storeId");


--
-- Name: store_catalogs_active_store_key; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE UNIQUE INDEX store_catalogs_active_store_key ON public.store_catalogs USING btree ("storeId") WHERE (status = 'active'::public."CatalogStatus");


--
-- Name: store_catalogs_currentVersionId_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX "store_catalogs_currentVersionId_idx" ON public.store_catalogs USING btree ("currentVersionId");


--
-- Name: store_catalogs_id_storeId_key; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE UNIQUE INDEX "store_catalogs_id_storeId_key" ON public.store_catalogs USING btree (id, "storeId");


--
-- Name: store_catalogs_status_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX store_catalogs_status_idx ON public.store_catalogs USING btree (status);


--
-- Name: store_catalogs_storeId_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX "store_catalogs_storeId_idx" ON public.store_catalogs USING btree ("storeId");


--
-- Name: store_product_prices_active_store_product_key; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE UNIQUE INDEX store_product_prices_active_store_product_key ON public.store_product_prices USING btree ("storeId", "productId") WHERE (status = 'active'::public."PriceStatus");


--
-- Name: store_product_prices_productId_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX "store_product_prices_productId_idx" ON public.store_product_prices USING btree ("productId");


--
-- Name: store_product_prices_status_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX store_product_prices_status_idx ON public.store_product_prices USING btree (status);


--
-- Name: store_product_prices_storeId_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX "store_product_prices_storeId_idx" ON public.store_product_prices USING btree ("storeId");


--
-- Name: stores_code_key; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE UNIQUE INDEX stores_code_key ON public.stores USING btree (code);


--
-- Name: stores_status_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX stores_status_idx ON public.stores USING btree (status);


--
-- Name: user_credentials_userId_key; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE UNIQUE INDEX "user_credentials_userId_key" ON public.user_credentials USING btree ("userId");


--
-- Name: user_invites_email_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX user_invites_email_idx ON public.user_invites USING btree (email);


--
-- Name: user_invites_expiresAt_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX "user_invites_expiresAt_idx" ON public.user_invites USING btree ("expiresAt");


--
-- Name: user_invites_tokenHash_key; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE UNIQUE INDEX "user_invites_tokenHash_key" ON public.user_invites USING btree ("tokenHash");


--
-- Name: user_sessions_expiresAt_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX "user_sessions_expiresAt_idx" ON public.user_sessions USING btree ("expiresAt");


--
-- Name: user_sessions_revokedAt_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX "user_sessions_revokedAt_idx" ON public.user_sessions USING btree ("revokedAt");


--
-- Name: user_sessions_sessionTokenHash_key; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE UNIQUE INDEX "user_sessions_sessionTokenHash_key" ON public.user_sessions USING btree ("sessionTokenHash");


--
-- Name: user_sessions_userId_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX "user_sessions_userId_idx" ON public.user_sessions USING btree ("userId");


--
-- Name: user_store_accesses_active_key; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE UNIQUE INDEX user_store_accesses_active_key ON public.user_store_accesses USING btree ("userId", "storeId") WHERE ("revokedAt" IS NULL);


--
-- Name: user_store_accesses_revokedAt_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX "user_store_accesses_revokedAt_idx" ON public.user_store_accesses USING btree ("revokedAt");


--
-- Name: user_store_accesses_storeId_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX "user_store_accesses_storeId_idx" ON public.user_store_accesses USING btree ("storeId");


--
-- Name: user_store_accesses_userId_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX "user_store_accesses_userId_idx" ON public.user_store_accesses USING btree ("userId");


--
-- Name: users_deletedAt_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX "users_deletedAt_idx" ON public.users USING btree ("deletedAt");


--
-- Name: users_emailNormalized_active_key; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE UNIQUE INDEX "users_emailNormalized_active_key" ON public.users USING btree ("emailNormalized") WHERE ("deletedAt" IS NULL);


--
-- Name: users_emailNormalized_idx; Type: INDEX; Schema: public; Owner: scale_admin
--

CREATE INDEX "users_emailNormalized_idx" ON public.users USING btree ("emailNormalized");


--
-- Name: advertising_banners advertising_banners_imageFileAssetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.advertising_banners
    ADD CONSTRAINT "advertising_banners_imageFileAssetId_fkey" FOREIGN KEY ("imageFileAssetId") REFERENCES public.file_assets(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: advertising_banners advertising_banners_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.advertising_banners
    ADD CONSTRAINT "advertising_banners_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public.stores(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_actorUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "audit_logs_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: audit_logs audit_logs_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "audit_logs_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public.stores(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: catalog_product_placements catalog_product_placements_catalogId_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.catalog_product_placements
    ADD CONSTRAINT "catalog_product_placements_catalogId_categoryId_fkey" FOREIGN KEY ("catalogId", "categoryId") REFERENCES public.categories("catalogId", id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: catalog_product_placements catalog_product_placements_catalogId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.catalog_product_placements
    ADD CONSTRAINT "catalog_product_placements_catalogId_fkey" FOREIGN KEY ("catalogId") REFERENCES public.store_catalogs(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: catalog_product_placements catalog_product_placements_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.catalog_product_placements
    ADD CONSTRAINT "catalog_product_placements_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: catalog_versions catalog_versions_basedOnVersionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.catalog_versions
    ADD CONSTRAINT "catalog_versions_basedOnVersionId_fkey" FOREIGN KEY ("basedOnVersionId") REFERENCES public.catalog_versions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: catalog_versions catalog_versions_catalogId_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.catalog_versions
    ADD CONSTRAINT "catalog_versions_catalogId_storeId_fkey" FOREIGN KEY ("catalogId", "storeId") REFERENCES public.store_catalogs(id, "storeId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: catalog_versions catalog_versions_publishedByUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.catalog_versions
    ADD CONSTRAINT "catalog_versions_publishedByUserId_fkey" FOREIGN KEY ("publishedByUserId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: catalog_versions catalog_versions_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.catalog_versions
    ADD CONSTRAINT "catalog_versions_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public.stores(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: categories categories_catalogId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "categories_catalogId_fkey" FOREIGN KEY ("catalogId") REFERENCES public.store_catalogs(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: categories categories_catalogId_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "categories_catalogId_parentId_fkey" FOREIGN KEY ("catalogId", "parentId") REFERENCES public.categories("catalogId", id) ON UPDATE CASCADE;


--
-- Name: file_assets file_assets_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.file_assets
    ADD CONSTRAINT "file_assets_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public.stores(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: file_assets file_assets_uploadedByUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.file_assets
    ADD CONSTRAINT "file_assets_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: password_reset_tokens password_reset_tokens_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: products products_imageFileAssetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_imageFileAssetId_fkey" FOREIGN KEY ("imageFileAssetId") REFERENCES public.file_assets(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: scale_devices scale_devices_currentCatalogVersionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.scale_devices
    ADD CONSTRAINT "scale_devices_currentCatalogVersionId_fkey" FOREIGN KEY ("currentCatalogVersionId") REFERENCES public.catalog_versions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: scale_devices scale_devices_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.scale_devices
    ADD CONSTRAINT "scale_devices_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public.stores(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: scale_sync_logs scale_sync_logs_deliveredVersionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.scale_sync_logs
    ADD CONSTRAINT "scale_sync_logs_deliveredVersionId_fkey" FOREIGN KEY ("deliveredVersionId") REFERENCES public.catalog_versions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: scale_sync_logs scale_sync_logs_requestedVersionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.scale_sync_logs
    ADD CONSTRAINT "scale_sync_logs_requestedVersionId_fkey" FOREIGN KEY ("requestedVersionId") REFERENCES public.catalog_versions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: scale_sync_logs scale_sync_logs_scaleDeviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.scale_sync_logs
    ADD CONSTRAINT "scale_sync_logs_scaleDeviceId_fkey" FOREIGN KEY ("scaleDeviceId") REFERENCES public.scale_devices(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: scale_sync_logs scale_sync_logs_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.scale_sync_logs
    ADD CONSTRAINT "scale_sync_logs_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public.stores(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: store_catalogs store_catalogs_id_currentVersionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.store_catalogs
    ADD CONSTRAINT "store_catalogs_id_currentVersionId_fkey" FOREIGN KEY (id, "currentVersionId") REFERENCES public.catalog_versions("catalogId", id) ON UPDATE CASCADE;


--
-- Name: store_catalogs store_catalogs_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.store_catalogs
    ADD CONSTRAINT "store_catalogs_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public.stores(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: store_product_prices store_product_prices_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.store_product_prices
    ADD CONSTRAINT "store_product_prices_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: store_product_prices store_product_prices_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.store_product_prices
    ADD CONSTRAINT "store_product_prices_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public.stores(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_credentials user_credentials_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.user_credentials
    ADD CONSTRAINT "user_credentials_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_invites user_invites_invitedByUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.user_invites
    ADD CONSTRAINT "user_invites_invitedByUserId_fkey" FOREIGN KEY ("invitedByUserId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: user_sessions user_sessions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT "user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_store_accesses user_store_accesses_grantedByUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.user_store_accesses
    ADD CONSTRAINT "user_store_accesses_grantedByUserId_fkey" FOREIGN KEY ("grantedByUserId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: user_store_accesses user_store_accesses_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.user_store_accesses
    ADD CONSTRAINT "user_store_accesses_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public.stores(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_store_accesses user_store_accesses_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.user_store_accesses
    ADD CONSTRAINT "user_store_accesses_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_createdByUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scale_admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: scale_admin
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict M35ShE9Vn7WmoP9Q9c3NrEsNPzbLJYedLPWgffKTl1slwYCoFQ8NO6j1em82fet

