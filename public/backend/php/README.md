# 🚀 Hyper Softs Trend API - Complete PHP Backend

**All-in-one PHP backend** that works on cPanel shared hosting, VPS, or any PHP server!

## ✨ Key Features

- **🔒 Hidden Upstream API**: Your real data source is completely hidden from users
- **⚡ Automated Installer**: `install.php` wizard handles database setup automatically
- **📁 Single config.php**: All settings in one place
- **🌐 cPanel Compatible**: Works on shared hosting - no Node.js required
- **🔐 IP/Domain Whitelisting**: Secure access control
- **🤖 Complete Telegram Bot**: Admin notifications & user commands
- **📊 Full Logging**: Every API call tracked with PDO security

---

## 📋 Requirements

- PHP 7.4+ (PHP 8.0+ recommended)
- MySQL 5.7+ or MariaDB 10.3+
- Apache with mod_rewrite
- cURL PHP extension

---

## 📁 File Structure

```
php/
├── install.php             # 🔧 Automated 3-step installer
├── config.php              # 🔒 All settings (DATABASE, TELEGRAM, API)
├── helpers.php             # 🛠️ Common functions (PDO-based)
├── database.sql            # 🗄️ MySQL schema
├── .htaccess               # 🔐 Apache security
├── index.php               # 🏠 Default page
│
├── admin/                  # 👨‍💼 Admin Panel Pages
│   ├── login.php           # Login page
│   ├── dashboard.php       # Main dashboard
│   ├── users.php           # User management
│   ├── api-keys.php        # API key management
│   ├── api-logs.php        # API request logs
│   ├── telegram-logs.php   # Telegram logs
│   ├── activity-logs.php   # Activity logs
│   ├── ip-whitelist.php    # IP management
│   ├── settings.php        # System settings
│   ├── profile.php         # Admin profile
│   ├── documentation.php   # API docs page
│   └── logout.php          # Logout handler
│
├── api/                    # 🔌 API Endpoints
│   ├── wingo.php           # 🎰 WinGo (30s, 1min, 3min, 5min)
│   ├── k3.php              # 🎲 K3 (1min, 3min, 5min, 10min)
│   ├── 5d.php              # 🎯 5D (1min, 3min, 5min, 10min)
│   ├── trx.php             # ⚡ TRX (1min, 3min, 5min)
│   ├── numeric.php         # 🔢 Numeric (1min, 3min, 5min)
│   ├── health.php          # 💚 Health Check
│   ├── telegram-bot.php    # 🤖 Telegram Bot Webhook
│   └── telegram-setup.php  # 🔧 Bot Setup Page
│
└── includes/               # 📦 Shared Components
    ├── auth.php            # Authentication functions
    ├── header.php          # Admin panel header
    └── footer.php          # Admin panel footer
```

---

## 🛠️ Quick Installation (Automated)

### Step 1: Upload Files

1. Download ZIP from admin panel
2. Upload to server via cPanel File Manager or FTP
3. Extract to `public_html/api/` (or your preferred directory)

### Step 2: Run Automated Installer

1. Visit: `https://yourdomain.com/api/install.php`
2. Follow 3-step wizard:
   - **Step 1**: Enter database credentials → Test connection
   - **Step 2**: Tables created automatically → Admin account setup
   - **Step 3**: Configure Telegram & other settings → Generate config.php

### Step 3: Setup Telegram Bot

1. Visit: `https://yourdomain.com/api/telegram-setup.php`
2. Click "Set Webhook"
3. Click "Send Test Message" to verify

### Step 4: Delete install.php (Security)

After successful setup, delete `install.php` from your server.

---

## 🛠️ Installation (VPS)

### One Command Setup

```bash
cd /www/wwwroot/yoursite.com/
unzip php-backend.zip
cd php

# Edit config
nano config.php

# Import database
mysql -u root -p your_db < database.sql

# Set permissions
chmod 644 config.php helpers.php
chmod 755 api/
chmod 644 api/*.php
```

---

## 📡 API Endpoints

### Base URL
```
https://yourdomain.com/api/
```

### Endpoints

| Game | Endpoint | Durations |
|------|----------|-----------|
| WinGo | `/api/wingo.php` | 30s, 1min, 3min, 5min |
| K3 | `/api/k3.php` | 1min, 3min, 5min, 10min |
| 5D | `/api/5d.php` | 1min, 3min, 5min, 10min |
| TRX | `/api/trx.php` | 1min, 3min, 5min |
| Numeric | `/api/numeric.php` | 1min, 3min, 5min |
| Health | `/api/health.php` | - (no key needed) |

### Request Format

```
GET /api/wingo.php?api_key=YOUR_KEY&duration=1min
GET /api/k3.php?api_key=YOUR_KEY&duration=3min
GET /api/5d.php?api_key=YOUR_KEY&duration=5min
```

### Response Format

```json
{
  "success": true,
  "game": "wingo",
  "duration": "1min",
  "game_name": "WinGo 1 Minute",
  "data": { ... },
  "meta": {
    "response_time_ms": 45,
    "timestamp": "2024-01-15T10:30:00+05:30",
    "powered_by": "Hyper Softs Trend API"
  }
}
```

---

## 🤖 Telegram Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Start bot & show menu |
| `/status` | Check account status |
| `/keys` | View your API keys |
| `/renew` | Request key renewal |
| `/help` | Get help |

---

## 🔐 Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Invalid duration |
| 401 | Missing/Invalid API key |
| 403 | IP/Domain blocked or key expired |
| 429 | Rate limit exceeded |
| 502 | Upstream unavailable |

---

## 🛡️ Security

1. **config.php is protected** - .htaccess blocks direct access
2. **API keys are masked** in logs for security
3. **IP Whitelisting** - Only allowed IPs can access
4. **Domain Whitelisting** - Origin header verification
5. **Rate Limiting** - Prevent abuse

---

## 📊 Database Tables

| Table | Purpose |
|-------|---------|
| `users` | User accounts |
| `api_keys` | API key management |
| `api_logs` | Request/response logs |
| `allowed_ips` | Global IP whitelist |
| `allowed_domains` | Global domain whitelist |
| `telegram_logs` | Bot message logs |
| `activity_logs` | Admin actions |
| `settings` | Site configuration |

---

## ⚙️ cPanel Cron Jobs (Optional)

Add these in cPanel → Cron Jobs:

```bash
# Daily log cleanup (3 AM)
0 3 * * * /usr/bin/php /home/user/public_html/api/cron/cleanup.php

# Reset daily counters (midnight)
0 0 * * * /usr/bin/php /home/user/public_html/api/cron/reset-counters.php
```

---

## 🔧 Troubleshooting

### "Access denied" error
- Check if your IP is in `allowed_ips` table
- Verify API key is active and not expired

### "Database connection failed"
- Verify credentials in config.php
- Check if database exists in cPanel

### Bot not responding
- Visit telegram-setup.php and re-set webhook
- Check if bot token is correct

---

## 📞 Support

- Email: support@hypersofts.com
- Telegram: @hypersofts

---

**⚠️ IMPORTANT**: Your real data source (betapi.space) is NEVER exposed to users. They only see YOUR domain in all responses!

---

© 2024 Hyper Softs - All Rights Reserved
