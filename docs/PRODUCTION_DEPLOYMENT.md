# EasyTravels — Enterprise Production Deployment Architecture

This roadmap details the enterprise production deployment of EasyTravels on a Linux VPS (Ubuntu 22.04/24.04 LTS, AWS EC2, or DigitalOcean Droplet) using **PostgreSQL, Gunicorn, Nginx, Let's Encrypt SSL, and Systemd**.

---

## 1. Production Architecture Topology

```
[ Incoming HTTPS (Port 443) ]
             │
             ▼
      [ Nginx Reverse Proxy ]
             │
      ┌──────┴──────────────────────────────────────┐
      │                                             │
      ▼                                             ▼
[ Static Assets ]                         [ API / Dynamic Requests ]
/var/www/easytravel/dist/ (Frontend)     http://127.0.0.1:8000 (Gunicorn WSGI)
/var/www/easytravel/staticfiles/ (Admin)           │
                                                   ▼
                                         [ Django Core Engine ]
                                                   │
                                     ┌─────────────┴─────────────┐
                                     ▼                           ▼
                           [ PostgreSQL 16 ]            [ Redis & Celery ]
```

---

## 2. Server Provisioning Steps (Ubuntu 22.04/24.04 LTS)

### Step 1: System Packages & Dependencies
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3-pip python3-venv python3-dev postgresql postgresql-contrib nginx redis-server git curl
```

### Step 2: PostgreSQL Database Provisioning
```bash
sudo -u postgres psql
```
```sql
CREATE DATABASE easytravels_prod;
CREATE USER easytravel_user WITH PASSWORD 'REPLACE_WITH_SECURE_STRONG_PASSWORD';
ALTER ROLE easytravel_user SET client_encoding TO 'utf8';
ALTER ROLE easytravel_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE easytravel_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE easytravels_prod TO easytravel_user;
\q
```

### Step 3: Application Code & Virtual Environment Setup
```bash
sudo mkdir -p /var/www/easytravel
sudo chown -R $USER:$USER /var/www/easytravel
cd /var/www/easytravel

# Unzip project files into /var/www/easytravel
cd backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn
```

### Step 4: Configure Production Environment (`/var/www/easytravel/backend/.env`)
```ini
DJANGO_SECRET_KEY="GENERATE_A_64_CHARACTER_RANDOM_SECRET_KEY"
DJANGO_DEBUG="False"
ALLOWED_HOSTS="easytravels.bh,api.easytravels.bh,your_server_ip"

POSTGRES_DB="easytravels_prod"
POSTGRES_USER="easytravel_user"
POSTGRES_PASSWORD="REPLACE_WITH_SECURE_STRONG_PASSWORD"
POSTGRES_HOST="127.0.0.1"
POSTGRES_PORT="5432"

EMAIL_BACKEND="django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST="smtp.sendgrid.net"
EMAIL_PORT="587"
EMAIL_USE_TLS="True"
EMAIL_HOST_USER="apikey"
EMAIL_HOST_PASSWORD="YOUR_ACTUAL_SENDGRID_KEY"
DEFAULT_FROM_EMAIL="Easy Travels Consular Clearance <concierge@easytravels.bh>"

CELERY_BROKER_URL="redis://127.0.0.1:6379/0"
CELERY_RESULT_BACKEND="redis://127.0.0.1:6379/0"
```

### Step 5: Run Migrations & Collect Static Files
```bash
python manage.py migrate
python manage.py loaddata fixtures/initial_seed.json
python manage.py collectstatic --noinput
```

---

## 3. Systemd Service Unit (`/etc/systemd/system/easytravel.service`)

Create the Gunicorn service daemon:
```ini
[Unit]
Description=EasyTravels Django Gunicorn Daemon
After=network.target postgresql.service redis.service

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/easytravel/backend
ExecStart=/var/www/easytravel/backend/venv/bin/gunicorn \
          --workers 4 \
          --bind 127.0.0.1:8000 \
          --timeout 60 \
          --access-logfile /var/log/easytravel/gunicorn_access.log \
          --error-logfile /var/log/easytravel/gunicorn_error.log \
          easytravel_project.wsgi:application
Restart=always

[Install]
WantedBy=multi-user.target
```
Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable easytravel
sudo systemctl start easytravel
sudo systemctl status easytravel
```

---

## 4. Nginx Reverse Proxy Configuration (`/etc/nginx/sites-available/easytravel`)

```nginx
server {
    listen 80;
    server_name easytravels.bh www.easytravels.bh;

    # Static Frontend SPA
    root /var/www/easytravel/dist;
    index index.html;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml+rss text/javascript;

    # Frontend Single Page Application fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Django Admin Static Files
    location /static/ {
        alias /var/www/easytravel/backend/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    # Django Media Files
    location /media/ {
        alias /var/www/easytravel/backend/media/;
        expires 7d;
    }

    # API and Admin Proxy to Gunicorn
    location ~ ^/(api|admin)/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```
Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/easytravel /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 5. SSL / HTTPS Setup via Let's Encrypt Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d easytravels.bh -d www.easytravels.bh
```
Certbot automatically configures automatic certificate renewals via systemd timers.
