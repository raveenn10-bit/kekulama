# Kekulama Eco Cabana — Google Drive Automatic Backup & Disaster Recovery Architecture

## 1. Overview
Production-grade automatic backup and recovery system for Kekulama Eco Cabana:
- **Cloud Provider:** Google Cloud Project `kekulama`
- **Google Account:** `kekulamaecocabana@gmail.com`
- **Scope:** `https://www.googleapis.com/auth/drive.file` (Minimum required per-file scope)
- **Data Sources:** 
  1. Cloud Firestore (10 collections: `bookings`, `rooms`, `room_calendar_locks`, `payments`, `users`, `guestDocuments`, `system_settings`, `registration_tokens`, `audit_logs`, `notification_logs`)
  2. Supabase Storage (`guest-private-documents` bucket containing NIC, Passport & Receipt files)
- **Encryption:** AES-256-GCM authenticated encryption at rest and in transit
- **Integrity:** SHA-256 integrity checksums & structured JSON manifest
- **Scheduler:** Daily at 02:00 AM Asia/Colombo (UTC 20:30 previous day) via Vercel Cron (`30 20 * * *`)
- **Access Control:** Strictly restricted to verified Owners (`requireOwner(req)`)

---

## 2. Exact OAuth Redirect URIs
- **Production URI:**
  `https://www.kekulamaecocabanagalle.com/api/admin/oauth/drive/callback`
- **Local Development URI:**
  `http://localhost:3000/api/admin/oauth/drive/callback`

---

## 3. Required Environment Variables
| Variable | Description | Location |
|---|---|---|
| `GOOGLE_CLIENT_ID` / `GOOGLE_DRIVE_CLIENT_ID` | OAuth 2.0 Web Client ID from Google Cloud Console | Vercel Environment Variables |
| `GOOGLE_CLIENT_SECRET` / `GOOGLE_DRIVE_CLIENT_SECRET` | OAuth 2.0 Client Secret | Vercel Environment Variables |
| `GOOGLE_DRIVE_FOLDER_ID` | Dedicated folder ID in Google Drive (from folder URL) | Vercel Environment Variables |
| `BACKUP_ENCRYPTION_KEY` | 32+ character passphrase for AES-256-GCM archive encryption | Vercel Environment Variables |
| `CRON_SECRET` | Secret token to authenticate Vercel Cron invocations | Vercel Environment Variables |
| `OWNER_EMAIL` | Destination for backup failure and disaster alerts | Vercel Environment Variables |

---

## 4. Google Cloud Console Configuration Steps
1. Navigate to [Google Cloud Console](https://console.cloud.google.com/) and select project **`kekulama`**.
2. **Enable Google Drive API:**
   - Go to **APIs & Services > Library**.
   - Search for **Google Drive API** and click **Enable**.
3. **Configure OAuth Consent Screen:**
   - User Type: **External**.
   - App Name: `Kekulama Eco Cabana Disaster Recovery`.
   - User Support Email: `kekulamaecocabana@gmail.com`.
   - Add Scope: `https://www.googleapis.com/auth/drive.file`.
   - Test Users: Add `kekulamaecocabana@gmail.com` and `chamilka.ch@gmail.com`.
4. **Create OAuth 2.0 Client Credentials:**
   - Go to **APIs & Services > Credentials > Create Credentials > OAuth client ID**.
   - Application type: **Web application**.
   - Name: `Kekulama Drive Backup Integration`.
   - **Authorized JavaScript origins:**
     - `https://www.kekulamaecocabanagalle.com`
     - `http://localhost:3000`
   - **Authorized redirect URIs:**
     - `https://www.kekulamaecocabanagalle.com/api/admin/oauth/drive/callback`
     - `http://localhost:3000/api/admin/oauth/drive/callback`
5. **Create Backup Folder in Google Drive:**
   - Log in to `kekulamaecocabana@gmail.com` on Google Drive.
   - Create a folder named `Kekulama_Backups_Secure`.
   - Copy the folder ID from the browser address bar (the string after `/folders/`).
   - Add it as `GOOGLE_DRIVE_FOLDER_ID` in Vercel.

---

## 5. Cost & Free-Tier Analysis
- **Google Drive Storage:** 15 GB free included with Google Account. 30 daily backups of ~10 MB = ~300 MB total. **$0.00 / month**.
- **Google Drive API Quota:** 1,000,000,000 requests/day. **$0.00**.
- **Vercel Cron:** 1 job per day allowed on Vercel Hobby plan. **$0.00**.
- **Supabase Bandwidth:** Free tier includes 2 GB/month bandwidth. **$0.00**.
- **Total Expected Monthly Cost: $0.00 (100% Free Tier Compliant).**
