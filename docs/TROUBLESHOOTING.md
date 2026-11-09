# EasyTravels — Troubleshooting & FAQ for Windows

Common issues and solutions when running EasyTravels on Windows 10/11.

---

## Issue 1: PowerShell Script Execution Policy Error
**Symptom**:
```powershell
.\venv\Scripts\Activate.ps1 : File cannot be loaded because running scripts is disabled on this system.
```
**Cause**: Windows restricts unsigned script execution by default.
**Solution**:
Open PowerShell as Administrator and run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
Then retry activating the virtual environment.

---

## Issue 2: `python` or `pip` Not Recognized as an Internal or External Command
**Symptom**:
```powershell
'python' is not recognized as an internal or external command, operable program or batch file.
```
**Cause**: Python was installed without checking the "Add python.exe to PATH" checkbox.
**Solution**:
1. Search Windows for "Edit the system environment variables".
2. Click **Environment Variables**.
3. Under *User variables*, select **Path** and click **Edit**.
4. Click **New** and add:
   - `C:\Users\<YourUsername>\AppData\Local\Programs\Python\Python311\`
   - `C:\Users\<YourUsername>\AppData\Local\Programs\Python\Python311\Scripts\`
5. Restart PowerShell.

---

## Issue 3: Port 3000 or 8000 Already in Use
**Symptom**:
```
Error: listen EADDRINUSE: address already in use 0.0.0.0:3000
```
or Django reports `Error: That port is already in use.`

**Solution**:
Find and terminate the process holding the port:
```powershell
# For Port 3000:
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force

# For Port 8000:
Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process -Force
```
Alternatively, specify a different port when running:
```powershell
# Backend on port 8080:
python manage.py runserver 127.0.0.1:8080

# Frontend on port 3001:
npm run dev -- --port 3001
```

---

## Issue 4: Cross-Origin Resource Sharing (CORS) Blocked
**Symptom**:
Browser console reports: `Access to fetch at 'http://127.0.0.1:8000/api/...' has been blocked by CORS policy`.
**Solution**:
Ensure `django-cors-headers` is installed and `corsheaders.middleware.CorsMiddleware` is at the very top of `MIDDLEWARE` in `backend/easytravel_project/settings.py`. Also verify that `http://localhost:3000` is listed in `CORS_ALLOWED_ORIGINS`.

---

## Issue 5: Celery Worker Crashes with `ValueError: not enough values to unpack` on Windows
**Symptom**:
Celery crashes immediately when starting on Windows.
**Cause**: Celery's default `fork` pool is unsupported on Windows OS.
**Solution**:
Use the `solo` or `gevent` execution pool on Windows:
```powershell
celery -A easytravel_project worker -l info -P solo
```

---

## Issue 6: SQLite Database Locked Error
**Symptom**:
```
sqlite3.OperationalError: database is locked
```
**Cause**: Another process or background worker holds an open transaction lock on `easytravels_local.sqlite3`.
**Solution**:
1. Stop running `runserver` and `celery` instances.
2. Ensure you are not editing the sqlite file with an external viewer.
3. Restart `python manage.py runserver`.

---

## Issue 7: Gemini AI API Key Not Configured
**Symptom**:
AI Concierge displays: `[EasyTravel Advisory: Simulation Mode]`.
**Explanation**:
This is an intentional graceful fallback. The AI Concierge continues to provide accurate simulated consular guidance even when no `GEMINI_API_KEY` is present. To enable live Gemini Flash API calls, supply a free API key from [Google AI Studio](https://aistudio.google.com/) in your `.env` file.
