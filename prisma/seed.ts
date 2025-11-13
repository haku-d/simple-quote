import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Create admin user
  const adminPassword = await hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password: adminPassword,
      name: "Admin User",
      role: "ADMIN",
      needApproval: false,
    },
  });
  console.log("Created admin user:", admin.email);

  // Create manager user
  const managerPassword = await hash("manager123", 10);
  const manager = await prisma.user.upsert({
    where: { email: "manager@example.com" },
    update: {},
    create: {
      email: "manager@example.com",
      password: managerPassword,
      name: "Manager User",
      role: "MANAGER",
      needApproval: false,
    },
  });
  console.log("Created manager user:", manager.email);

  // Create sale user (needs approval)
  const salePassword = await hash("sale123", 10);
  const sale = await prisma.user.upsert({
    where: { email: "sale@example.com" },
    update: {},
    create: {
      email: "sale@example.com",
      password: salePassword,
      name: "Sale User",
      role: "SALE",
      needApproval: true,
    },
  });
  console.log("Created sale user:", sale.email);

  // Create sample product: Business Card
  const businessCard = await prisma.product.create({
    data: {
      code: "BC-001",
      sku: "BC-STD",
      name: "Business Card - Standard",
      width: 3.5,
      height: 2.0,
      widthUnit: "inch",
      heightUnit: "inch",
      status: true,
    },
  });
  console.log("Created business card product:", businessCard.name);

  // Create options for Business Card
  // Level 0 options (top-level)
  const setupOption = await prisma.option.create({
    data: {
      productId: businessCard.id,
      code: "100",
      sku: "PS-SETUP",
      name: "Process - Print Setup",
      type: "Option",
      level: 0,
      order: 1,
      groupName: "Prep",
      required: true,
      sameParent: false,
      hidden: true,
      qty: 1,
      cost: 17.5,
    },
  });

  // Paper Selection (Selector with children)
  const paperSelector = await prisma.option.create({
    data: {
      productId: businessCard.id,
      code: "200",
      sku: "PAPER-SEL",
      name: "Paper Selection",
      type: "Selector",
      level: 0,
      order: 2,
      selection: "Exclusive",
      required: true,
      sameParent: false,
      hidden: false,
      qty: 1,
    },
  });

  // Paper options (children of Paper Selector)
  await prisma.option.create({
    data: {
      productId: businessCard.id,
      parentId: paperSelector.id,
      code: "201",
      sku: "PAPER-15PT",
      name: "Cover 15pt - SILK",
      type: "Option",
      level: 1,
      order: 1,
      required: false,
      sameParent: true,
      hidden: false,
      qty: 1,
      pricebreak: [
        { minQty: 1, costPerUnit: 0.6 },
        { minQty: 100, costPerUnit: 0.55 },
        { minQty: 500, costPerUnit: 0.5 },
      ],
    },
  });

  await prisma.option.create({
    data: {
      productId: businessCard.id,
      parentId: paperSelector.id,
      code: "202",
      sku: "PAPER-18PT",
      name: "Cover 18pt - GLOSS",
      type: "Option",
      level: 1,
      order: 2,
      required: false,
      sameParent: true,
      hidden: false,
      qty: 1,
      pricebreak: [
        { minQty: 1, costPerUnit: 0.7 },
        { minQty: 100, costPerUnit: 0.65 },
        { minQty: 500, costPerUnit: 0.6 },
      ],
    },
  });

  // Print Selection (Selector with children)
  const printSelector = await prisma.option.create({
    data: {
      productId: businessCard.id,
      code: "300",
      sku: "PRINT-SEL",
      name: "Print Selection",
      type: "Selector",
      level: 0,
      order: 3,
      selection: "Exclusive",
      required: true,
      sameParent: false,
      hidden: false,
      qty: 1,
    },
  });

  // Print options (children of Print Selector)
  await prisma.option.create({
    data: {
      productId: businessCard.id,
      parentId: printSelector.id,
      code: "301",
      sku: "PRINT-4C",
      name: "(4/4) - Full Color Front & Back",
      type: "Option",
      level: 1,
      order: 1,
      required: false,
      sameParent: true,
      hidden: false,
      qty: 1,
      cost: 2.0,
    },
  });

  await prisma.option.create({
    data: {
      productId: businessCard.id,
      parentId: printSelector.id,
      code: "302",
      sku: "PRINT-1C",
      name: "(1/1) - Black & White",
      type: "Option",
      level: 1,
      order: 2,
      required: false,
      sameParent: true,
      hidden: false,
      qty: 1,
      cost: 1.0,
    },
  });

  // Package Selection (Selector with children)
  const packageSelector = await prisma.option.create({
    data: {
      productId: businessCard.id,
      code: "400",
      sku: "PKG-SEL",
      name: "Package Selection",
      type: "Selector",
      level: 0,
      order: 4,
      selection: "Exclusive",
      required: true,
      sameParent: false,
      hidden: false,
      qty: 1,
    },
  });

  // Package options (children of Package Selector)
  await prisma.option.create({
    data: {
      productId: businessCard.id,
      parentId: packageSelector.id,
      code: "401",
      sku: "PKG-100",
      name: "Package of 100",
      type: "Factor",
      level: 1,
      order: 1,
      required: false,
      sameParent: true,
      hidden: false,
      qty: 100,
      cost: 0,
    },
  });

  await prisma.option.create({
    data: {
      productId: businessCard.id,
      parentId: packageSelector.id,
      code: "402",
      sku: "PKG-250",
      name: "Package of 250",
      type: "Factor",
      level: 1,
      order: 2,
      required: false,
      sameParent: true,
      hidden: false,
      qty: 250,
      cost: 0,
    },
  });

  await prisma.option.create({
    data: {
      productId: businessCard.id,
      parentId: packageSelector.id,
      code: "403",
      sku: "PKG-500",
      name: "Package of 500",
      type: "Factor",
      level: 1,
      order: 3,
      required: false,
      sameParent: true,
      hidden: false,
      qty: 500,
      cost: 0,
    },
  });

  console.log("Created all options for business card product");

  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
