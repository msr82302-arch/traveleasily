# EasyTravels — React + Vite Frontend Setup Guide

This guide details configuration, dependency installation, local development server startup, and production building for the EasyTravels frontend on Windows.

---

## 1. Frontend Architecture & Technology Stack

- **Framework**: React 19 (`react: ^19.0.1`, `react-dom: ^19.0.1`)
- **Language**: TypeScript (`typescript: ^7.0.2` & `tsconfig.json`)
- **Bundler & Dev Server**: Vite 8 (`vite: ^8.3.0`, `@vitejs/plugin-react: ^6.1.1`)
- **Styling**: Tailwind CSS v4 (`tailwindcss: ^4.3.3`, `@tailwindcss/vite: ^4.3.3`)
- **Icons**: Lucide React (`lucide-react: ^0.546.0`)
- **Animation**: Motion (`motion: ^12.23.24`)
- **Full-Stack Node Proxy**: Express (`server.ts`, `express: ^4.21.2`)
- **AI Integration**: `@google/genai: ^2.4.0`

---

## 2. PowerShell Step-by-Step Initialization

Open a new PowerShell terminal:

### Step 1: Navigate to the Project Root Directory
```powershell
cd C:\Projects\EasyTravel
```

### Step 2: Install Node Dependencies
Using the lockfile for exact reproducible version resolution:
```powershell
npm install
```
*Note*: This creates the `node_modules\` folder. All 10 runtime packages and 9 devDependencies will be installed.

### Step 3: Configure Frontend Environment Variables
Create or verify `.env` in the project root:
```powershell
Copy-Item .env.example .env
```
Ensure your `.env` contains:
```ini
# Base URL of your Django backend API
VITE_API_BASE_URL="http://127.0.0.1:8000"

# Optional Gemini AI API key for the live AI Concierge
GEMINI_API_KEY=""

# Dev server port (defaults to 3000)
PORT=3000
```

### Step 4: Start the Local Development Server
```powershell
npm run dev
```
*Output*:
```
  VITE v8.3.0  ready in 280 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

Open your browser and navigate to:
```
http://localhost:3000
```

### Step 5: Test Full-Stack Node Proxy (Alternative Mode)
If you want to run the full-stack Node + Express proxy (`server.ts`) which handles Gemini AI streaming alongside Vite middleware:
```powershell
npx tsx server.ts
```
*Output*: `EasyTravel server listening on http://0.0.0.0:3000`

---

## 3. Building for Production

To compile and bundle the frontend into optimized, production-ready static assets:
```powershell
npm run build
```
*Output*:
The build artifacts will be emitted into the `dist/` directory:
```
dist/
  ├── assets/
  │    ├── index-[hash].js
  │    └── index-[hash].css
  ├── favicon.svg
  ├── index.html
  ├── robots.txt
  └── sitemap.xml
```
You can preview the production build locally with:
```powershell
npx vite preview --port 3000
```

---

## 4. Frontend Key Modules & Routes

- `/` &mdash; Public Consular Homepage & Visa Eligibility Finder
- `/destinations` &mdash; Interactive Visa Requirements & Pricing Rules Catalog
- `/apply` &mdash; 4-Step Borderless Application Wizard (Edge OCR &rarr; Dossier Review &rarr; Attachments &rarr; 15% Transparent Fee Checkout)
- `/wallet` &mdash; Client Encrypted Document Vault, Approved PDF Visa Grants & **Notification Receipts History**
- `/admin/dashboard` &mdash; Consular Command Center:
  - Tab 1: Live Application Tracker
  - Tab 2: Document Verifier Queue & OCR Side-by-Side Audit Drawer
  - Tab 3: Staff & Approvals
  - Tab 4: 8-Role Catalog
  - Tab 5: 19-Permission Matrix
  - Tab 6: Staff Invitations & Token Issuer
  - Tab 7: Visa Pricing & Rules Engine
  - Tab 8: Payments & 15% Platform Service Fee Ledger
  - Tab 9: System Settings & Compliance
  - **Tab 10: Automated Email Notification Command Center** (Dispatched logs, retry action, recipient config, event matrix, dual-pane inspector)
- `/admin/login`, `/admin/signup`, `/admin/forgot-password` &mdash; Staff Authentication
