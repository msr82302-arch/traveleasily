# EasyTravels — Environment Variables & Configuration Reference

This document provides a comprehensive audit of all configuration variables used across the EasyTravels full-stack platform.

---

## 1. Quick-Reference Template (`.env.example`)

A pre-configured template is located at `.env.example` in the project root:

```ini
# ==============================================================================
# FRONTEND CONFIGURATION (Vite / React)
# ==============================================================================
# Base URL for the Django REST Framework backend API
VITE_API_BASE_URL="http://127.0.0.1:8000"

# Port for the Node/Vite development server (default 3000)
PORT=3000

# ==============================================================================
# ARTIFICIAL INTELLIGENCE (Gemini AI Concierge)
# ==============================================================================
# Optional: Google Gemini API key for live AI visa concierge responses
# Obtain from: https://aistudio.google.com/
GEMINI_API_KEY="MY_GEMINI_API_KEY"

# ==============================================================================
# DJANGO BACKEND CORE CONFIGURATION
# ==============================================================================
# Secret key used for cryptographic signing. Generate a fresh key for production!
DJANGO_SECRET_KEY="django-insecure-easytravels-local-dev-key-change-in-production"

# Set to False in production!
DJANGO_DEBUG="True"

# Comma-separated list of host/domain names that this Django site can serve
ALLOWED_HOSTS="localhost,127.0.0.1,0.0.0.0"

# ==============================================================================
# DATABASE CONFIGURATION
# ==============================================================================
# Leave POSTGRES_DB empty to use zero-config local SQLite3 (easytravels_local.sqlite3)
# To use PostgreSQL, populate these variables:
POSTGRES_DB=""
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="your_postgres_password"
POSTGRES_HOST="localhost"
POSTGRES_PORT="5432"

# ==============================================================================
# TRANSACTIONAL EMAIL NOTIFICATION SYSTEM
# ==============================================================================
# In local development, use console backend to print emails to stdout:
# EMAIL_BACKEND="django.core.mail.backends.console.EmailBackend"
# For production SMTP (SendGrid, Amazon SES, Postmark, Mailgun):
EMAIL_BACKEND="django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST="smtp.sendgrid.net"
EMAIL_PORT="587"
EMAIL_USE_TLS="True"
EMAIL_HOST_USER="apikey"
EMAIL_HOST_PASSWORD="MY_SENDGRID_OR_SES_API_KEY"
DEFAULT_FROM_EMAIL="Easy Travels Consular Clearance <concierge@easytravels.bh>"

# Administrative Routing Inboxes (Non-hardcoded)
EASYTRAVEL_ADMIN_EMAIL="admin@easytravels.bh"
EASYTRAVEL_APPLICATIONS_EMAIL="applications@easytravels.bh"
EASYTRAVEL_OPERATIONS_EMAIL="operations@easytravels.bh"

# ==============================================================================
# CELERY ASYNCHRONOUS WORKER & REDIS BROKER
# ==============================================================================
CELERY_BROKER_URL="redis://localhost:6379/0"
CELERY_RESULT_BACKEND="redis://localhost:6379/0"
```

---

## 2. Variable Explanations & Sensible Defaults

| Variable | Scope | Default Value | Description |
|----------|-------|---------------|-------------|
| `VITE_API_BASE_URL` | Frontend | `http://127.0.0.1:8000` | Target URL where React sends API requests (`/api/v1/...`). |
| `PORT` | Frontend | `3000` | Port listened to by Vite & Express `server.ts`. |
| `GEMINI_API_KEY` | Node/AI | `""` | When empty, AI Concierge functions in offline realistic simulation mode. |
| `DJANGO_SECRET_KEY` | Backend | `django-insecure-...` | Cryptographic secret for Django sessions and CSRF tokens. |
| `DJANGO_DEBUG` | Backend | `True` | Enables verbose stack traces and console email logging locally. |
| `ALLOWED_HOSTS` | Backend | `localhost,127.0.0.1` | Host headers permitted by Django Security Middleware. |
| `POSTGRES_DB` | Database | `""` | If empty, Django defaults to zero-config local SQLite3. |
| `EMAIL_BACKEND` | Email | `console` (in Debug) | Controls whether emails print to terminal or dispatch via SMTP. |
| `EASYTRAVEL_ADMIN_EMAIL` | Notifications | `admin@easytravels.bh` | Destination inbox for critical alerts, refusals, and refund authorizations. |
| `EASYTRAVEL_APPLICATIONS_EMAIL`| Notifications | `applications@easytravels.bh`| Destination inbox for new application intake notifications. |
| `CELERY_BROKER_URL` | Async | `redis://localhost:6379/0` | Connection string for background task queue. |
