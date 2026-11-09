# EasyTravels — Database Setup & Portability Guide

This guide covers database configuration, schema migrations, switching between **SQLite3** and **PostgreSQL**, and data backup / restoration on Windows.

---

## 1. Zero-Config Local Database (SQLite3)

By default, the Django backend uses an embedded SQLite3 database:
```
C:\Projects\EasyTravel\backend\easytravels_local.sqlite3
```
- **Zero Configuration**: Requires no separate database server, daemon, service, or login credentials.
- **File-Based**: The entire database lives in a single portable file that can be copied or backed up with standard file tools.
- **Enabled By Default**: When `POSTGRES_DB` is omitted from your `.env` file, Django automatically routes all queries to `easytravels_local.sqlite3`.

To initialize it:
```powershell
cd C:\Projects\EasyTravel\backend
python manage.py migrate
python manage.py loaddata fixtures\initial_seed.json
```

---

## 2. PostgreSQL Setup on Windows (Optional / Production-Like)

If you wish to test with PostgreSQL locally on Windows 10/11:

### Step 1: Install PostgreSQL for Windows
1. Download the installer from [EnterpriseDB PostgreSQL](https://www.postgresql.org/download/windows/).
2. Run the installer and remember the superuser (`postgres`) password you set during installation.
3. Ensure port `5432` is selected.

### Step 2: Create the EasyTravels Database
Open `psql` (SQL Shell) or PowerShell:
```powershell
# Using psql command line tool:
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "CREATE DATABASE easytravels_db ENCODING 'UTF8';"
```

### Step 3: Configure `.env` in `backend/`
Add the following variables to `C:\Projects\EasyTravel\backend\.env`:
```ini
POSTGRES_DB="easytravels_db"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="your_postgres_password"
POSTGRES_HOST="localhost"
POSTGRES_PORT="5432"
```

### Step 4: Apply Migrations to PostgreSQL
```powershell
python manage.py migrate
python manage.py loaddata fixtures\initial_seed.json
```

---

## 3. Database Schema Overview & Model Relationships

The EasyTravels schema encompasses three primary domain modules:

### A. Notifications Module (`easytravels_notifications`)
- `NotificationRecord`:
  - `id` (UUID, Primary Key)
  - `application_id` (Indexed CharField)
  - `recipient_email` (Indexed EmailField)
  - `recipient_type` (`customer`, `admin`, `officer`)
  - `notification_event` (One of the 10 standard events)
  - `delivery_status` (`Sent`, `Pending`, `Failed`, `Retry Scheduled`)
  - `attempt_count` / `max_attempts`
  - `dedup_key` (Unique composite key: `${ref}:${event}:${recipient}:${status}`)
  - `html_body` / `preview_text`
- `NotificationRecipientConfig`:
  - Singleton configuration storing operational recipient addresses.
- `NotificationTriggerConfig`:
  - 10-row matrix controlling customer and admin dispatch rules.

### B. Applications Module (`easytravels_applications`)
- `VisaApplication`:
  - `id` (Primary Key, e.g. `ET-BH-2026-98421`)
  - `client_name`, `client_email`, `client_phone`
  - `destination_country`, `destination_name`, `visa_type`
  - `status`, `processing_speed`, `sla_deadline`
  - `visa_grant_number`, `government_reference`
  - `traveler_data` (JSON field containing passport bio-data)
  - `itinerary_data` (JSON field containing entry checkpoint & dates)
- `PaymentRecord`:
  - `application_id` (One-to-One Foreign Key)
  - `amount_usd`, `amount_bhd`, `payment_method`, `status`, `transaction_id`
- `ApplicationDocument`:
  - `application_id` (Foreign Key)
  - `name`, `type`, `file_url`, `ocr_extracted`, `confidence`

### C. Accounts Module (`accounts_staffprofile`, `accounts_staffinvitation`)
- `StaffProfile`:
  - Linked to Django `auth_user`
  - `role`: 8 roles (`super_admin`, `admin`, `consular_agent`, `document_verifier`, `finance_manager`, `customer_support`, `qa_compliance`, `traveler`)
  - `department`, `phone`, `status`
- `StaffInvitation`:
  - Token-based registration tokens with expiration tracking.
- `RegistrationRequest`:
  - Approval queue for incoming staff applications.

---

## 4. Data Backup, Export & Restoration

### Exporting Full Database Data to JSON
To export your current database data (applications, staff, notification logs):
```powershell
python manage.py dumpdata --exclude auth.permission --exclude contenttypes --indent 2 > C:\Projects\EasyTravel\backend\fixtures\database_backup.json
```

### Restoring Database Data from JSON
To load exported data into a fresh SQLite or PostgreSQL database:
```powershell
python manage.py loaddata fixtures\database_backup.json
```
