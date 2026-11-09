# EasyTravels — Windows 10/11 Development Environment Setup Guide

This guide provides step-by-step instructions to configure a local Windows workstation (Windows 10 or Windows 11, 64-bit) for running both the **EasyTravels React + Vite Frontend** and the **Django REST Framework Backend**.

---

## 1. Verified Software Version Requirements

Ensure the following tools are installed on your Windows system:

| Component | Verified Required Version | Minimum Supported | Download Link |
|-----------|---------------------------|-------------------|---------------|
| **Operating System** | Windows 11 (23H2/24H2) or Windows 10 (22H2) | Windows 10 64-bit | Pre-installed |
| **Python** | **3.11.9** or **3.12.3** | Python 3.10.x | [python.org/downloads/windows](https://www.python.org/downloads/windows/) |
| **Node.js** | **v20.12.2** or **v22.x** (LTS) | Node.js v18.18+ | [nodejs.org](https://nodejs.org/en/download) |
| **npm** | **v10.5.0+** | npm v9.x | Included with Node.js |
| **Git for Windows** | **v2.44.0+** | v2.30+ | [git-scm.com/download/win](https://git-scm.com/download/win) |
| **PostgreSQL (Optional)**| **v16.2** (or SQLite built into Python) | PostgreSQL 14+ | [postgresql.org/download/windows](https://www.postgresql.org/download/windows/) |

> **Note on Database**: Out of the box, EasyTravels uses an embedded zero-configuration SQLite database (`easytravels_local.sqlite3`) for local development. You do **not** need to install PostgreSQL immediately to run the application locally.

---

## 2. Windows Prerequisites Installation

### A. Python Installation
1. Download Python 3.11 or 3.12 installer from [python.org](https://www.python.org/downloads/).
2. Run the `.exe` installer.
3. ⚠️ **CRITICAL**: Check the box at the bottom: **"Add python.exe to PATH"** before clicking *Install Now*.
4. Verify in PowerShell:
   ```powershell
   python --version
   pip --version
   ```

### B. Node.js & npm Installation
1. Download the Windows Installer (`.msi`) for Node.js LTS from [nodejs.org](https://nodejs.org).
2. Follow standard installer prompts.
3. Verify in PowerShell:
   ```powershell
   node -v
   npm -v
   ```

### C. Enable PowerShell Script Execution
Windows restricts PowerShell script execution by default. Open PowerShell as Administrator and run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
Type `Y` and press Enter.

---

## 3. Directory Layout on Windows

Extract the downloaded archive `EasyTravel_Local_Deployment.zip` to a clean folder without spaces, e.g.:
```
C:\Projects\EasyTravel\
    ├── backend/              # Django REST Framework backend
    │   ├── easytravel_project/
    │   ├── accounts/
    │   ├── applications/
    │   ├── notifications/
    │   ├── fixtures/
    │   ├── manage.py
    │   └── requirements.txt
    ├── src/                  # React + TypeScript + Tailwind frontend
    ├── public/               # Static assets & public media
    ├── docs/                 # Complete architecture & setup documentation
    ├── package.json          # Node.js dependencies
    ├── vite.config.ts        # Vite configuration
    ├── server.ts             # Node proxy server
    ├── .env.example          # Safe template environment variables
    ├── start_backend.ps1     # Automated 1-click backend launcher
    └── start_frontend.ps1    # Automated 1-click frontend launcher
```

---

## 4. Quick-Start (Two PowerShell Windows)

### Window 1 — Start Django Backend (Port 8000)
```powershell
cd C:\Projects\EasyTravel\backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py loaddata fixtures\initial_seed.json
python manage.py runserver 127.0.0.1:8000
```
*API is now live at: `http://127.0.0.1:8000/api/health/`*

### Window 2 — Start React Frontend (Port 3000)
```powershell
cd C:\Projects\EasyTravel
npm install
npm run dev
```
*Frontend web application is now live at: `http://localhost:3000`*
