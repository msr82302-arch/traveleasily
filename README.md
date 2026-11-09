# EasyTravels — International Travel & Visa Processing Platform

**Official Consular Operations Engine & Client Self-Service Portal**  
*Operating from Riffa, Kingdom of Bahrain (Commercial Registration #98214-01)*

---

## 🚀 Quick-Start for Windows 10/11

To run EasyTravels locally on your Windows machine, open two separate PowerShell terminals:

### Terminal 1: Django REST Framework Backend (Port 8000)
```powershell
.\start_backend.ps1
```
*(Or manually: `cd backend; python -m venv venv; .\venv\Scripts\Activate.ps1; pip install -r requirements.txt; python manage.py migrate; python manage.py runserver 127.0.0.1:8000`)*

- **Backend API Health Check**: [http://127.0.0.1:8000/api/health/](http://127.0.0.1:8000/api/health/)
- **Django Administrative Panel**: [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)

---

### Terminal 2: React + Vite Frontend (Port 3000)
```powershell
.\start_frontend.ps1
```
*(Or manually: `npm install; npm run dev`)*

- **Public Consular Portal**: [http://localhost:3000/](http://localhost:3000/)
- **Document Wallet & PDF Grants**: [http://localhost:3000/wallet](http://localhost:3000/wallet)
- **Consular Operations Command Center**: [http://localhost:3000/admin/dashboard](http://localhost:3000/admin/dashboard)

---

## 📚 Complete Documentation Suite

Comprehensive step-by-step documentation is included in the `docs/` folder:

1. [**Windows 10/11 Prerequisites & Setup**](docs/WINDOWS_SETUP.md) &mdash; Python, Node.js, and execution policies.
2. [**Django Backend Initialization Guide**](docs/BACKEND_SETUP.md) &mdash; Virtual environment, migrations, superuser creation, and unit tests.
3. [**React + Vite Frontend Setup Guide**](docs/FRONTEND_SETUP.md) &mdash; Dependencies, dev servers, and production builds.
4. [**Database Setup & Portability**](docs/DATABASE_SETUP.md) &mdash; Zero-config SQLite3 vs PostgreSQL setup, and backup/restore.
5. [**Environment Variables Reference**](docs/ENVIRONMENT_VARIABLES.md) &mdash; Complete documentation of all configuration keys.
6. [**Troubleshooting & FAQ**](docs/TROUBLESHOOTING.md) &mdash; Solutions for port conflicts, permissions, and CORS.
7. [**Production Deployment Architecture**](docs/PRODUCTION_DEPLOYMENT.md) &mdash; Ubuntu, PostgreSQL, Gunicorn, Nginx, and SSL/HTTPS.

---

## 🌟 Key Platform Capabilities

- **10 Automated Lifecycle Notification Events**: Dual-dispatch to customer and consular staff queues with deduplication idempotency keys (`dedupKey`) and PII passport masking (`B•••••471`).
- **Edge MRZ Document Scanner**: OCR parsing for passports with real-time confidence scores and compliance checksum checks.
- **Client Document Wallet**: Secure client vault for approved PDF visa grants, live tracking, and email receipts.
- **Administrative Command Center**: 10-tab command center covering real-time application pipelines, verifier drawer, staff approvals, 8-role catalog, 19-permission matrix, pricing rules, 15% platform fee financial ledger, and email dispatch audit logs.
- **AI Visa Concierge**: Real-time visa advice powered by Gemini with graceful offline fallback simulation mode.
