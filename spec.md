Tech Stack: Next.js 15 (App Router) + Prisma + PostgreSQL + Tailwind + PDFMake

1. PROJECT STRUCTURE

quotation-builder/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                 # Dashboard
│   │   ├── products/
│   │   │   ├── page.tsx             # List
│   │   │   ├── new/page.tsx
│   │   │   ├── [id]/page.tsx        # Edit + Clone
│   │   ├── quotations/
│   │   │   ├── page.tsx             # List
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx        # Edit + PDF
│   │   └── users/
│   │       └── page.tsx             # Admin only
│   └── api/
│       ├── products/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       ├── options/
│       │   └── route.ts
│       ├── quotations/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       └── auth/
│           └── route.ts
├── components/
│   ├── ui/                          # shadcn/ui
│   ├── ProductBuilder.tsx
│   ├── OptionTree.tsx
│   ├── QuotationForm.tsx
│   ├── PDFPreview.tsx
│   └── ApprovalBadge.tsx
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── cost-engine.ts               # Tính toán toàn bộ
│   └── pdf-generator.ts
├── types/
│   └── index.ts
├── prisma/
│   └── schema.prisma
├── public/
│   └── logo.png
└── next.config.js

2. DATABASE SCHEMA (Prisma)

// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String
  role        Role
  needApproval Boolean @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum Role {
  ADMIN
  MANAGER
  SALE
}

model Product {
  id          String   @id @default(cuid())
  code        String   @unique
  sku         String
  name        String
  width       Float?
  height      Float?
  widthUnit   String?
  heightUnit  String?
  status      Boolean  @default(true)
  options     Option[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Option {
  id          String   @id @default(cuid())
  productId   String
  code        String
  sku         String
  name        String
  type        OptionType
  level       Int
  order       Int
  groupName   String?
  selection   SelectionType?
  required    Boolean
  sameParent  Boolean
  hidden      Boolean
  qty         Int
  cost        Float?
  pricebreak  Json?    // [{minQty, costPerUnit}]
  parentId    String?  // for Selector children
  product     Product  @relation(fields: [productId], references: [id])
  parent      Option?  @relation("OptionTree", fields: [parentId], references: [id])
  children    Option[] @relation("OptionTree")
  
  @@unique([productId, code])
}

enum OptionType {
  Option
  Selector
  Factor
}

enum SelectionType {
  Exclusive
  Inclusive
}

model Quotation {
  id             String         @id @default(cuid())
  number         String         @unique
  customerName   String
  customerCompany String?
  status         QuotationStatus
  discount       Float?
  discountType   DiscountType?
  taxRate        Float          @default(10)
  currency       String         @default("USD")
  expiryDate     DateTime
  note           String?
  policy         String?
  userId         String
  items          QuotationItem[]
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
  user           User           @relation(fields: [userId], references: [id])
}

model QuotationItem {
  id              String   @id @default(cuid())
  quotationId     String
  productId       String
  orderQty        Int
  selectedOptions Json     // [{optionId, factorId?}]
  lineTotal       Float
  quotation       Quotation @relation(fields: [quotationId], references: [id])
  product         Product   @relation(fields: [productId], references: [id])
}

enum QuotationStatus {
  DRAFT
  PENDING
  APPROVED
  REJECTED
  SENT
}

enum DiscountType {
  percent
  fixed
}

3. COST ENGINE (lib/cost-engine.ts)

// lib/cost-engine.ts
export const calculateProductTotal = (
  product: Product & { options: Option[] },
  orderQty: number,
  selected: { optionId: string; factorId?: string }[]
) => {
  const selectedMap = new Map(selected.map(s => [s.optionId, s.factorId]));
  const factor = findSelectedFactor(product.options, selectedMap);
  const costQty = orderQty * (factor?.qty || 1);

  let total = 0;
  const rootOptions = product.options.filter(o => o.level === 0);

  for (const opt of rootOptions) {
    if (opt.type === "Factor") continue;
    if (opt.hidden && !selectedMap.has(opt.id)) continue;

    const isSelected = selectedMap.has(opt.id);
    if (!isSelected && opt.required) throw new Error(`${opt.name} is required`);

    if (opt.type === "Selector") {
      total += calculateSelector(opt, selectedMap, costQty);
    } else if (isSelected || opt.required) {
      total += calculateOption(opt, costQty);
    }
  }

  return { total, costQty, factor };
};

4. PDF GENERATOR (lib/pdf-generator.ts)

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

export const generatePDF = (data: any) => {
  const doc = {
    content: [
      { image: "logo", width: 100 },
      { text: `QUOTE #: ${data.number}`, style: "header" },
      // ... full layout from spec
    ],
    styles: { header: { fontSize: 18, bold: true } }
  };
  return pdfMake.createPdf(doc);
};

5. KEY UI COMPONENTS

{option.type === "Selector" && (
  <div className="ml-6">
    {option.children.map(child => (
      <div key={child.id}>
        <Checkbox 
          checked={selected.has(child.id)}
          onCheckedChange={() => toggle(child)}
        />
        {child.name}
        {child.type === "Factor" && ` (x${child.qty})`}
      </div>
    ))}
  </div>
)}


6. APPROVAL FLOW (API)

// app/api/quotations/[id]/route.ts
if (user.role === "SALE" && quotation.discount && user.needApproval) {
  quotation.status = "PENDING";
}

7. CLONE PRODUCT API

// Clone with new code + (Copy)
const cloned = await prisma.product.create({
  data: {
    ...product,
    code: `${product.code}-CLONE-${Date.now()}`,
    sku: `${product.sku}-CLONE`,
    name: `${product.name} (Copy)`,
    options: { create: product.options.map(mapOption) }
  }
});