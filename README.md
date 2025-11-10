# Quotation Builder SaaS

A professional quotation builder application for print services with complex product options, tiered pricing, and approval workflows.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **PDF Generation**: PDFMake
- **UI Components**: Custom components with shadcn/ui patterns

## Features

### Core Features
- ✅ Product Management with complex option trees
- ✅ Hierarchical Options (Option, Selector, Factor)
- ✅ Tiered Pricing (Pricebreaks)
- ✅ Quotation Creation & Management
- ✅ Discount Management (Percentage & Fixed)
- ✅ Tax Calculation
- ✅ PDF Export
- ✅ Product Cloning
- ✅ Approval Workflow (Draft → Pending → Approved/Rejected)

### User Roles
- **ADMIN**: Full system access
- **MANAGER**: Quotation management + discount approval
- **SALE**: Quotation creation with optional approval requirement

## Project Structure

```
quotation-builder/
├── app/
│   ├── (auth)/              # Authentication routes
│   ├── (dashboard)/         # Dashboard routes
│   │   ├── products/        # Product management
│   │   ├── quotations/      # Quotation management
│   │   └── users/           # User management
│   └── api/                 # API routes
├── components/
│   └── ui/                  # Reusable UI components
├── lib/
│   ├── prisma.ts           # Prisma client
│   ├── auth.ts             # NextAuth configuration
│   ├── cost-engine.ts      # Cost calculation logic
│   ├── pdf-generator.ts    # PDF generation
│   └── utils.ts            # Utility functions
├── types/
│   └── index.ts            # TypeScript types
└── prisma/
    └── schema.prisma       # Database schema
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database

### Installation

1. **Clone the repository**
```bash
cd simple-quote
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Edit `.env`:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/quotation_builder?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"

# App Settings
NEXT_PUBLIC_APP_NAME="Quotation Builder"
NEXT_PUBLIC_COMPANY_NAME="Your Company Name"
NEXT_PUBLIC_COMPANY_ADDRESS="123 Main St, City, Country"
NEXT_PUBLIC_COMPANY_PHONE="+1 234 567 8900"
NEXT_PUBLIC_COMPANY_EMAIL="info@company.com"
```

4. **Set up the database**

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

5. **Create a default admin user (optional)**

You can use Prisma Studio to create your first user:

```bash
npm run db:studio
```

Or run a seed script (create one if needed).

6. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

### Key Models

**Product**
- Base product entity with dimensions and SKU
- Contains multiple Options in a hierarchical structure

**Option**
- Three types: `Option`, `Selector`, `Factor`
- Supports nested tree structure (parent-child relationships)
- Pricebreak support for volume discounts

**Quotation**
- Customer information
- Multiple product items
- Discount and tax calculations
- Status workflow

**User**
- Role-based access control
- Approval settings

## Cost Calculation Logic

The cost engine (`lib/cost-engine.ts`) implements complex pricing rules:

1. **Order Quantity**: User input
2. **Factor Quantity**: Selected from Factor options (e.g., "Package of 100")
3. **Cost Quantity**: Order Qty × Factor Qty

### Rules:
- Options with `sameParent: true` multiply by Cost Quantity
- Options with `sameParent: false` have fixed cost
- Pricebreaks apply tiered pricing based on quantity thresholds
- Selectors group options (Exclusive or Inclusive selection)
- Hidden options don't appear in PDF but still calculate cost

## API Endpoints

### Products
- `GET /api/products` - List all products
- `POST /api/products` - Create product
- `GET /api/products/:id` - Get product details
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `POST /api/products/:id/clone` - Clone product

### Quotations
- `GET /api/quotations` - List all quotations
- `POST /api/quotations` - Create quotation
- `GET /api/quotations/:id` - Get quotation details
- `PUT /api/quotations/:id` - Update quotation
- `DELETE /api/quotations/:id` - Delete quotation
- `POST /api/quotations/:id/approve` - Approve quotation (Manager)
- `POST /api/quotations/:id/reject` - Reject quotation (Manager)

## Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio
```

## Approval Workflow

```mermaid
graph TD
    A[Sale creates quotation] --> B{Has discount?}
    B -->|No| C[Status: DRAFT]
    B -->|Yes| D{needApproval?}
    D -->|No| C
    D -->|Yes| E[Status: PENDING]
    E --> F[Manager notified]
    F --> G{Manager action}
    G -->|Approve| H[Status: APPROVED]
    G -->|Reject| I[Status: REJECTED]
    H --> J[PDF unlocked]
    I --> K[Sale can edit]
```

## Next Steps

### To Complete MVP:
1. Add authentication pages (login/register)
2. Implement protected routes with session checks
3. Create product builder UI components
4. Create quotation form UI components
5. Implement PDF preview and download
6. Add user management pages
7. Add data validation with Zod
8. Implement error handling and toasts
9. Add loading states
10. Write tests

### Future Enhancements (Post-MVP):
- Sub-products / Product Bundles
- Option-level discounts
- Multi-currency conversion
- Automated email sending
- Customer portal
- Analytics dashboard

## Documentation

For detailed business requirements, see:
- [quote.md](./quote.md) - Full MVP specification
- [spec.md](./spec.md) - Technical implementation details

## License

Private project - All rights reserved
