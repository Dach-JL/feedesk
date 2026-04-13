# FeeDesk 🎓💳

![FeeDesk Platform](public/icon.png)

**FeeDesk** is a modern, enterprise-grade Student Fee Management and Verification system designed specifically for schools and training institutes. It bridges the gap between administrators and students by offering a unified platform to track enrollment, automate receipt unlocking, and verify digital payments natively.

Built with performance and scalability in mind, FeeDesk leverages a cutting-edge serverless Next.js architecture alongside secure PostgreSQL databases.

---

## ✨ Core Features

### 🛡️ For Administrators
- **Executive Analytics**: Get live, at-a-glance insights into total revenue, today's collections, and outstanding student balances.
- **Class & Student Directory**: Manage academic structures at scale. Organize students, assign structured fee plans, and track their financial status in seconds.
- **Digital Payment Verifications**: Review uploaded payment proofs (e.g., Telebirr, CBE) directly from a mobile-responsive dashboard. Approve transactions with a single click to instantly unlock student records.
- **Secure Architecture**: Enterprise-grade session security combined with serverless database scaling.

### 🎓 For Students
- **Independent Self-Service Portal**: A secure hub for students to manage their academic finances independently without waiting in lines.
- **Digital Proof Uploads**: Directly upload screenshots for mobile banking transactions via an intuitive mobile-first interface.
- **Verified Receipts**: Automated receipt generation and downloading, which becomes available the moment an administrator approves the transaction proof.
- **Real-time Balance Tracking**: Transparent visibility into assigned fee plans, paid amounts, and remaining balances.

---

## 🛠️ Technology Stack

FeeDesk is implemented utilizing the latest industry standards for the modern web:

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Database:** [Neon Serverless PostgreSQL](https://neon.tech/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/) (Credentials Provider)
- **Object Storage:** [Supabase Storage](https://supabase.com/storage) (Secure receipt/proof hosting)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Icons:** [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

Follow these steps to set up FeeDesk locally for development.

### 1. Prerequisites
Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18.17.0 or higher)
- [Git](https://git-scm.com/)
- A PostgreSQL database (e.g., Neon or local pg server)
- A Supabase account for Storage API keys

### 2. Clone the Repository
```bash
git clone https://github.com/Dach-JL/feedesk.git
cd feedesk
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Environment Variables
Create a `.env` file in the root directory and configure the required keys. 
*Note: Refer to `.env.example` if available.*
```env
# Database configuration
DATABASE_URL="postgresql://user:password@hostname:5432/feedesk?sslmode=require"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_generated_secret_key"

# Supabase Storage Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### 5. Database Setup (Prisma Migration)
Run the Prisma migrations to initialize the database schema.
```bash
npx prisma generate
npx prisma db push
```

*(Optional)* If you have seed data configured, populate the baseline objects:
```bash
npx prisma db seed
```

### 6. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The application supports dual-login for both strictly designated `Admin` roles and generated `Student` accounts.

---

## 📱 Mobile-First Ideology

FeeDesk's architecture utilizes a mobile-first Tailwind configuration. Whether an administrator is verifying proofs on their iPhone or a student is uploading a Telebirr screenshot on a mid-range Android device, all dashboards, tables, and modals responsively adapt to provide a native-app-like experience.

---

## 📄 License

This project is licensed under the MIT License.
