# EasyTravels — Django REST Framework Backend Setup Guide

This guide details step-by-step setup, configuration, database migrations, and testing for the Django backend on Windows.

---

## 1. PowerShell Step-by-Step Initialization

Open a PowerShell terminal and follow these exact steps:

### Step 1: Navigate to the Backend Directory
```powershell
cd C:\Projects\EasyTravel\backend
```
*Purpose*: Sets the working directory where `manage.py` and `requirements.txt` reside.

### Step 2: Create a Dedicated Python Virtual Environment
```powershell
python -m venv venv
```
*Purpose*: Isolates application dependencies from system-wide Python libraries, preventing version collisions.

### Step 3: Activate the Virtual Environment
```powershell
.\venv\Scripts\Activate.ps1
```
*(Your prompt will now show `(venv)` prefix)*
*Purpose*: Directs `python` and `pip` commands to the isolated environment.

### Step 4: Upgrade pip & Install Dependencies
```powershell
python -m pip install --upgrade pip
pip install -r requirements.txt
```
*Purpose*: Installs Django, Django REST Framework, django-cors-headers, django-filter, celery, redis, and testing tools.

### Step 5: Configure Environment Variables
Copy the template environment file:
```powershell
Copy-Item ..\.env.example .env
```
Open `.env` in Notepad or VS Code:
```powershell
notepad .env
```
Verify the settings:
```ini
DJANGO_SECRET_KEY="your-secure-local-secret-key"
DJANGO_DEBUG="True"
ALLOWED_HOSTS="localhost,127.0.0.1,0.0.0.0"
DEFAULT_FROM_EMAIL="Easy Travels Consular Clearance <concierge@easytravels.bh>"
EASYTRAVEL_ADMIN_EMAIL="admin@easytravels.bh"
```

### Step 6: Inspect Pending Database Migrations
```powershell
python manage.py showmigrations
```
*Purpose*: Verifies all migration files across `accounts`, `applications`, `notifications`, `auth`, and `admin` before applying them.

### Step 7: Run Django System Diagnostics & Checks
```powershell
python manage.py check
```
*Purpose*: Validates models, settings syntax, and database configurations. Should report: `System check identified no issues (0 silenced)`.

### Step 8: Apply Database Migrations Safely
```powershell
python manage.py migrate
```
*Purpose*: Creates the local SQLite database schema (`easytravels_local.sqlite3`) and generates all tables.

### Step 9: Load Initial Seed Fixtures
```powershell
python manage.py loaddata fixtures\initial_seed.json
```
*Purpose*: Seeds the 10 standard lifecycle notification trigger matrices and administrative routing defaults.

### Step 10: Create a Django Superuser Account
```powershell
python manage.py createsuperuser
```
Prompts:
- **Username**: `admin`
- **Email address**: `admin@easytravels.bh`
- **Password**: `admin1234` (or your chosen secure password)

*Purpose*: Gives you administrative credentials to access the Django admin panel.

### Step 11: Execute Backend Automated Unit Tests
```powershell
pytest notifications/tests/
```
*Purpose*: Executes the test suite verifying dual-dispatch, deduplication idempotency keys, and PII passport masking.

### Step 12: Start the Local Development Server
```powershell
python manage.py runserver 127.0.0.1:8000
```
*Output*:
```
Watching for file changes with StatReloader
Performing system checks...
System check identified no issues (0 silenced).
Django version 4.2.11, using settings 'easytravel_project.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

---

## 2. Verified Local Backend Endpoints

Once running on `http://127.0.0.1:8000`, test the following in your browser or curl/Postman:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `http://127.0.0.1:8000/api/health/` | `GET` | Health check & database status |
| `http://127.0.0.1:8000/admin/` | `GET` | Django administrative back-office login |
| `http://127.0.0.1:8000/api/v1/applications/dossiers/` | `GET`, `POST` | Application dossier intake & list |
| `http://127.0.0.1:8000/api/v1/notifications/logs/` | `GET` | Dispatched notification audit logs |
| `http://127.0.0.1:8000/api/v1/notifications/recipients/` | `GET`, `PUT` | Admin operations recipient routing |
| `http://127.0.0.1:8000/api/v1/notifications/triggers/` | `GET`, `PUT` | 10-event trigger matrix configuration |
| `http://127.0.0.1:8000/api/v1/notifications/trigger/` | `POST` | Manual event trigger dispatch endpoint |
| `http://127.0.0.1:8000/api/v1/auth/login/` | `POST` | Staff authentication endpoint |
| `http://127.0.0.1:8000/api/v1/auth/invitations/` | `GET`, `POST` | Staff invitation codes |

---

## 3. Background Asynchronous Workers (Optional with Celery)

If you have Redis installed locally or in Docker for Windows:
```powershell
# In a separate terminal window with venv activated:
celery -A easytravel_project worker -l info -P gevent
```
*(On Windows, Celery works best with `-P gevent` or `-P solo` pool)*
