# Getting Started with Quotation Builder

Welcome to the Quotation Builder MVP! This guide will walk you through the initial setup and first steps.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment

```bash
cp .env.example .env
```

Edit `.env` and configure your database:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/quotation_builder?schema=public"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
```

### 3. Initialize Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Default Login Credentials

After running the seed script:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| Admin | admin@example.com | admin123 | Full system access |
| Manager | manager@example.com | manager123 | Quotations + approval |
| Sale | sale@example.com | sale123 | Create quotations |

**⚠️ Change these passwords in production!**

## First Steps

### 1. Log In
- Navigate to [http://localhost:3000/auth/login](http://localhost:3000/auth/login)
- Use any of the credentials above

### 2. Explore the Dashboard
- View summary statistics
- Navigate through Products, Quotations, and Users (Admin only)

### 3. View Sample Product
The seed script creates a "Business Card - Standard" product with:
- Multiple paper options (15pt, 18pt)
- Print selections (Full color, B&W)
- Package factors (100, 250, 500 units)
- Tiered pricing (pricebreaks)

### 4. Create Your First Quotation
1. Go to **Quotations** → **Create Quotation**
2. Fill in customer information
3. Select the Business Card product
4. Set quantity
5. Add discount (optional - triggers approval for Sale users)
6. Submit

### 5. Test Approval Workflow (Optional)
1. Log in as **Sale** user (sale@example.com)
2. Create a quotation with a discount
3. Notice status changes to **PENDING**
4. Log out and log in as **Manager** (manager@example.com)
5. Approve or reject the quotation

## MVP Features Included

### ✅ Completed Features
- User authentication (login/register)
- Role-based access control (Admin, Manager, Sale)
- Product management (list, create, view, delete, clone)
- Quotation management (list, create, view, delete)
- Cost calculation engine with pricebreaks
- Approval workflow for discounts
- Protected routes and middleware
- Responsive UI with Tailwind CSS

### 🚧 In Development
- Full option tree editor UI
- Advanced product option selection in quotations
- PDF generation and download
- User role editing (Admin)
- Email notifications
- Dashboard statistics

### 📋 Future Enhancements
- Sub-products and bundles
- Option-level discounts
- Multi-currency support
- Customer portal
- Analytics and reporting

## Project Structure

```
quotation-builder/
├── app/
│   ├── auth/              # Login & registration
│   ├── dashboard/         # Main application
│   │   ├── products/     # Product management
│   │   ├── quotations/   # Quotation management
│   │   └── users/        # User management (Admin)
│   └── api/              # API endpoints
├── components/           # React components
├── lib/                  # Core business logic
│   ├── cost-engine.ts   # Pricing calculations
│   ├── pdf-generator.ts # PDF generation
│   └── auth.ts          # Authentication
├── prisma/              # Database
│   ├── schema.prisma   # Database schema
│   └── seed.ts         # Seed data
└── types/              # TypeScript definitions
```

## Understanding the System

### Product Structure
Products contain hierarchical options:

1. **Options**: Base pricing elements (e.g., "Print Setup")
2. **Selectors**: Group related choices (e.g., "Paper Selection")
   - Exclusive: Only one child can be selected
   - Inclusive: Multiple children allowed
3. **Factors**: Quantity multipliers (e.g., "Package of 100")

### Cost Calculation
- **Order Quantity**: User input
- **Factor Quantity**: From selected Factor option
- **Cost Quantity**: Order Qty × Factor Qty
- **sameParent**: `true` = multiply by quantity, `false` = fixed cost
- **Pricebreaks**: Volume discounts at specific quantity thresholds

### Quotation Workflow

```
DRAFT → (Add Discount + needApproval) → PENDING
PENDING → (Manager Approve) → APPROVED → (Export PDF) → SENT
PENDING → (Manager Reject) → REJECTED → (Edit) → DRAFT
```

## Development Tips

### Database Management

View/edit data with Prisma Studio:
```bash
npm run db:studio
```

Reset database:
```bash
npm run db:push -- --force-reset
npm run db:seed
```

### Adding Products Manually

For now, products with complex options should be added via Prisma Studio or directly in the database. Example:

1. Run `npm run db:studio`
2. Create a product
3. Add options with appropriate levels (0 = root, 1 = child, etc.)
4. Set parent-child relationships via `parentId`
5. Configure pricebreak JSON for volume discounts

### API Testing

Test API endpoints with curl:

```bash
# Get all products
curl http://localhost:3000/api/products

# Get product by ID
curl http://localhost:3000/api/products/[id]

# Clone product
curl -X POST http://localhost:3000/api/products/[id]/clone
```

## Troubleshooting

### "Database connection failed"
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database exists

### "NextAuth error"
- Verify NEXTAUTH_SECRET is set in .env
- Clear cookies and try again

### "Module not found"
- Run `npm install`
- Delete `.next` folder and restart dev server

### TypeScript errors
- Run `npm run db:generate` to regenerate Prisma client
- Restart TypeScript server in your IDE

## Next Steps for Development

1. **Enhanced Product Editor**: Build full UI for creating/editing complex option trees
2. **Advanced Quotation Form**: Add interactive option selection with real-time pricing
3. **PDF Export**: Complete PDF generation with download functionality
4. **Email Integration**: Implement quotation email sending
5. **User Management**: Add full CRUD for users (Admin only)
6. **Form Validation**: Implement Zod schemas for all forms
7. **Toast Notifications**: Add user feedback for actions
8. **Testing**: Add unit and integration tests

## Documentation

- [README.md](./README.md) - Full project documentation
- [SETUP.md](./SETUP.md) - Detailed setup instructions
- [quote.md](./quote.md) - Business requirements
- [spec.md](./spec.md) - Technical specifications

## Support

For issues or questions:
- Check the documentation files
- Review Prisma schema for data structure
- Inspect API routes for endpoint details
- Use Prisma Studio for database exploration

Happy coding! 🚀
