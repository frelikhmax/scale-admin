-- CreateEnum
CREATE TYPE "StoreStatus" AS ENUM ('active', 'inactive', 'archived');

-- CreateEnum
CREATE TYPE "CatalogStatus" AS ENUM ('active', 'inactive', 'archived');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('active', 'inactive', 'archived');

-- CreateEnum
CREATE TYPE "ProductUnit" AS ENUM ('kg', 'g', 'piece');

-- CreateEnum
CREATE TYPE "CategoryStatus" AS ENUM ('active', 'inactive', 'archived');

-- CreateEnum
CREATE TYPE "PlacementStatus" AS ENUM ('active', 'inactive', 'archived');

-- CreateEnum
CREATE TYPE "PriceStatus" AS ENUM ('active', 'inactive', 'archived');

-- CreateEnum
CREATE TYPE "BannerStatus" AS ENUM ('active', 'inactive', 'archived');

-- CreateEnum
CREATE TYPE "CatalogVersionStatus" AS ENUM ('published');

-- CreateEnum
CREATE TYPE "ScaleDeviceStatus" AS ENUM ('active', 'inactive', 'blocked', 'archived');

-- CreateEnum
CREATE TYPE "ScaleSyncStatus" AS ENUM ('no_update', 'update_available', 'package_delivered', 'ack_received', 'auth_failed', 'error');

-- CreateTable
CREATE TABLE "stores" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Moscow',
    "status" "StoreStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store_catalogs" (
    "id" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "status" "CatalogStatus" NOT NULL DEFAULT 'active',
    "currentVersionId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_catalogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "defaultPluCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "imageFileAssetId" UUID,
    "barcode" TEXT,
    "sku" TEXT,
    "unit" "ProductUnit" NOT NULL,
    "status" "ProductStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "catalogId" UUID NOT NULL,
    "parentId" UUID,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "CategoryStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog_product_placements" (
    "id" UUID NOT NULL,
    "catalogId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "PlacementStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalog_product_placements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store_product_prices" (
    "id" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RUB',
    "status" "PriceStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_product_prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advertising_banners" (
    "id" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageFileAssetId" UUID,
    "status" "BannerStatus" NOT NULL DEFAULT 'active',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "advertising_banners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog_versions" (
    "id" UUID NOT NULL,
    "catalogId" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "status" "CatalogVersionStatus" NOT NULL DEFAULT 'published',
    "publishedByUserId" UUID,
    "publishedAt" TIMESTAMP(3),
    "basedOnVersionId" UUID,
    "packageData" JSONB NOT NULL,
    "packageUrl" TEXT,
    "packageChecksum" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "catalog_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scale_devices" (
    "id" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "deviceCode" TEXT NOT NULL,
    "apiTokenHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "model" TEXT,
    "status" "ScaleDeviceStatus" NOT NULL DEFAULT 'active',
    "lastSeenAt" TIMESTAMP(3),
    "lastSyncAt" TIMESTAMP(3),
    "currentCatalogVersionId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scale_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scale_sync_logs" (
    "id" UUID NOT NULL,
    "scaleDeviceId" UUID,
    "storeId" UUID,
    "requestedVersionId" UUID,
    "deliveredVersionId" UUID,
    "status" "ScaleSyncStatus" NOT NULL,
    "errorMessage" TEXT,
    "requestIp" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scale_sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_assets" (
    "id" UUID NOT NULL,
    "storeId" UUID,
    "originalFileName" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "publicUrl" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" BIGINT NOT NULL,
    "uploadedByUserId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_assets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stores_code_key" ON "stores"("code");

-- CreateIndex
CREATE INDEX "stores_status_idx" ON "stores"("status");

-- CreateIndex
CREATE INDEX "store_catalogs_storeId_idx" ON "store_catalogs"("storeId");

-- CreateIndex
CREATE INDEX "store_catalogs_status_idx" ON "store_catalogs"("status");

-- CreateIndex
CREATE INDEX "store_catalogs_currentVersionId_idx" ON "store_catalogs"("currentVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "store_catalogs_id_storeId_key" ON "store_catalogs"("id", "storeId");

-- CreateIndex
CREATE UNIQUE INDEX "products_defaultPluCode_key" ON "products"("defaultPluCode");

-- CreateIndex
CREATE INDEX "products_name_idx" ON "products"("name");

-- CreateIndex
CREATE INDEX "products_shortName_idx" ON "products"("shortName");

-- CreateIndex
CREATE INDEX "products_barcode_idx" ON "products"("barcode");

-- CreateIndex
CREATE INDEX "products_sku_idx" ON "products"("sku");

-- CreateIndex
CREATE INDEX "products_status_idx" ON "products"("status");

-- CreateIndex
CREATE INDEX "categories_catalogId_idx" ON "categories"("catalogId");

-- CreateIndex
CREATE INDEX "categories_parentId_idx" ON "categories"("parentId");

-- CreateIndex
CREATE INDEX "categories_status_idx" ON "categories"("status");

-- CreateIndex
CREATE INDEX "categories_catalogId_parentId_sortOrder_idx" ON "categories"("catalogId", "parentId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "categories_catalogId_id_key" ON "categories"("catalogId", "id");

-- CreateIndex
CREATE INDEX "catalog_product_placements_catalogId_idx" ON "catalog_product_placements"("catalogId");

-- CreateIndex
CREATE INDEX "catalog_product_placements_categoryId_idx" ON "catalog_product_placements"("categoryId");

-- CreateIndex
CREATE INDEX "catalog_product_placements_productId_idx" ON "catalog_product_placements"("productId");

-- CreateIndex
CREATE INDEX "catalog_product_placements_status_idx" ON "catalog_product_placements"("status");

-- CreateIndex
CREATE INDEX "catalog_product_placements_catalogId_categoryId_sortOrder_idx" ON "catalog_product_placements"("catalogId", "categoryId", "sortOrder");

-- CreateIndex
CREATE INDEX "store_product_prices_storeId_idx" ON "store_product_prices"("storeId");

-- CreateIndex
CREATE INDEX "store_product_prices_productId_idx" ON "store_product_prices"("productId");

-- CreateIndex
CREATE INDEX "store_product_prices_status_idx" ON "store_product_prices"("status");

-- CreateIndex
CREATE INDEX "advertising_banners_storeId_idx" ON "advertising_banners"("storeId");

-- CreateIndex
CREATE INDEX "advertising_banners_status_idx" ON "advertising_banners"("status");

-- CreateIndex
CREATE INDEX "advertising_banners_storeId_sortOrder_idx" ON "advertising_banners"("storeId", "sortOrder");

-- CreateIndex
CREATE INDEX "catalog_versions_catalogId_idx" ON "catalog_versions"("catalogId");

-- CreateIndex
CREATE INDEX "catalog_versions_storeId_idx" ON "catalog_versions"("storeId");

-- CreateIndex
CREATE INDEX "catalog_versions_publishedByUserId_idx" ON "catalog_versions"("publishedByUserId");

-- CreateIndex
CREATE INDEX "catalog_versions_publishedAt_idx" ON "catalog_versions"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "catalog_versions_catalogId_versionNumber_key" ON "catalog_versions"("catalogId", "versionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "catalog_versions_catalogId_id_key" ON "catalog_versions"("catalogId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "scale_devices_deviceCode_key" ON "scale_devices"("deviceCode");

-- CreateIndex
CREATE INDEX "scale_devices_storeId_idx" ON "scale_devices"("storeId");

-- CreateIndex
CREATE INDEX "scale_devices_status_idx" ON "scale_devices"("status");

-- CreateIndex
CREATE INDEX "scale_devices_currentCatalogVersionId_idx" ON "scale_devices"("currentCatalogVersionId");

-- CreateIndex
CREATE INDEX "scale_sync_logs_scaleDeviceId_idx" ON "scale_sync_logs"("scaleDeviceId");

-- CreateIndex
CREATE INDEX "scale_sync_logs_storeId_idx" ON "scale_sync_logs"("storeId");

-- CreateIndex
CREATE INDEX "scale_sync_logs_requestedVersionId_idx" ON "scale_sync_logs"("requestedVersionId");

-- CreateIndex
CREATE INDEX "scale_sync_logs_deliveredVersionId_idx" ON "scale_sync_logs"("deliveredVersionId");

-- CreateIndex
CREATE INDEX "scale_sync_logs_status_idx" ON "scale_sync_logs"("status");

-- CreateIndex
CREATE INDEX "scale_sync_logs_createdAt_idx" ON "scale_sync_logs"("createdAt");

-- CreateIndex
CREATE INDEX "file_assets_storeId_idx" ON "file_assets"("storeId");

-- CreateIndex
CREATE INDEX "file_assets_uploadedByUserId_idx" ON "file_assets"("uploadedByUserId");

-- CreateIndex
CREATE INDEX "file_assets_createdAt_idx" ON "file_assets"("createdAt");

-- AddForeignKey
ALTER TABLE "user_store_accesses" ADD CONSTRAINT "user_store_accesses_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_catalogs" ADD CONSTRAINT "store_catalogs_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_catalogs" ADD CONSTRAINT "store_catalogs_id_currentVersionId_fkey" FOREIGN KEY ("id", "currentVersionId") REFERENCES "catalog_versions"("catalogId", "id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_imageFileAssetId_fkey" FOREIGN KEY ("imageFileAssetId") REFERENCES "file_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_catalogId_fkey" FOREIGN KEY ("catalogId") REFERENCES "store_catalogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_catalogId_parentId_fkey" FOREIGN KEY ("catalogId", "parentId") REFERENCES "categories"("catalogId", "id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog_product_placements" ADD CONSTRAINT "catalog_product_placements_catalogId_fkey" FOREIGN KEY ("catalogId") REFERENCES "store_catalogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog_product_placements" ADD CONSTRAINT "catalog_product_placements_catalogId_categoryId_fkey" FOREIGN KEY ("catalogId", "categoryId") REFERENCES "categories"("catalogId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog_product_placements" ADD CONSTRAINT "catalog_product_placements_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_product_prices" ADD CONSTRAINT "store_product_prices_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_product_prices" ADD CONSTRAINT "store_product_prices_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advertising_banners" ADD CONSTRAINT "advertising_banners_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advertising_banners" ADD CONSTRAINT "advertising_banners_imageFileAssetId_fkey" FOREIGN KEY ("imageFileAssetId") REFERENCES "file_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog_versions" ADD CONSTRAINT "catalog_versions_catalogId_storeId_fkey" FOREIGN KEY ("catalogId", "storeId") REFERENCES "store_catalogs"("id", "storeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog_versions" ADD CONSTRAINT "catalog_versions_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog_versions" ADD CONSTRAINT "catalog_versions_publishedByUserId_fkey" FOREIGN KEY ("publishedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog_versions" ADD CONSTRAINT "catalog_versions_basedOnVersionId_fkey" FOREIGN KEY ("basedOnVersionId") REFERENCES "catalog_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scale_devices" ADD CONSTRAINT "scale_devices_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scale_devices" ADD CONSTRAINT "scale_devices_currentCatalogVersionId_fkey" FOREIGN KEY ("currentCatalogVersionId") REFERENCES "catalog_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scale_sync_logs" ADD CONSTRAINT "scale_sync_logs_scaleDeviceId_fkey" FOREIGN KEY ("scaleDeviceId") REFERENCES "scale_devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scale_sync_logs" ADD CONSTRAINT "scale_sync_logs_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scale_sync_logs" ADD CONSTRAINT "scale_sync_logs_requestedVersionId_fkey" FOREIGN KEY ("requestedVersionId") REFERENCES "catalog_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scale_sync_logs" ADD CONSTRAINT "scale_sync_logs_deliveredVersionId_fkey" FOREIGN KEY ("deliveredVersionId") REFERENCES "catalog_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_assets" ADD CONSTRAINT "file_assets_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_assets" ADD CONSTRAINT "file_assets_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- TASK-004 database-level integrity that Prisma schema cannot express directly.
-- MVP allows only one active catalog per store, while retaining inactive/archive history.
CREATE UNIQUE INDEX "store_catalogs_active_store_key"
  ON "store_catalogs"("storeId")
  WHERE "status" = 'active';

-- MVP allows only one active placement of a product inside a catalog.
CREATE UNIQUE INDEX "catalog_product_placements_active_product_catalog_key"
  ON "catalog_product_placements"("catalogId", "productId")
  WHERE "status" = 'active';

-- MVP allows only one active price for a store/product pair.
CREATE UNIQUE INDEX "store_product_prices_active_store_product_key"
  ON "store_product_prices"("storeId", "productId")
  WHERE "status" = 'active';

-- Basic scalar integrity constraints.
ALTER TABLE "store_product_prices"
  ADD CONSTRAINT "store_product_prices_price_positive_check" CHECK ("price" > 0);

ALTER TABLE "file_assets"
  ADD CONSTRAINT "file_assets_sizeBytes_non_negative_check" CHECK ("sizeBytes" >= 0);

ALTER TABLE "categories"
  ADD CONSTRAINT "categories_not_self_parent_check" CHECK ("parentId" IS NULL OR "parentId" <> "id");
