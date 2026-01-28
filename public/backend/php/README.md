# 🚀 Hyper Softs Trend API - Complete PHP Backend

**All-in-one PHP backend** that works on cPanel shared hosting, VPS, or any PHP server!

## 🔒 Key Features

- **Hidden Upstream API**: Your real data source is completely hidden from users
- **Single config.php**: All settings in one place (like .env)
- **cPanel Compatible**: Works on shared hosting - no Node.js required
- **IP/Domain Whitelisting**: Secure access control
- **Complete Telegram Bot**: Admin notifications & user commands
- **Full Logging**: Every API call tracked

---

## 📁 File Structure

```
php/
├── config.php              # 🔒 All settings (DATABASE, TELEGRAM, API)
├── helpers.php             # 🛠️ Common functions
├── database.sql            # 🗄️ MySQL schema
├── .htaccess               # 🔐 Apache security
├── api/
│   ├── wingo.php           # 🎰 WinGo (30s, 1min, 3min, 5min)
│   ├── k3.php              # 🎲 K3 (1min, 3min, 5min, 10min)
│   ├── 5d.php              # 🎯 5D (1min, 3min, 5min, 10min)
│   ├── trx.php             # ⚡ TRX (1min, 3min, 5min)
│   ├── numeric.php         # 🔢 Numeric (1min, 3min, 5min)
│   ├── health.php          # 💚 Health Check
│   ├── telegram-bot.php    # 🤖 Telegram Bot Webhook
│   └── telegram-setup.php  # 🔧 Bot Setup Page
└── README.md               # 📖 This file
```

---

## 🛠️ Installation (cPanel/Shared Hosting)

### Step 1: Upload Files

1. Login to cPanel → File Manager
2. Navigate to `public_html/api/` (or your domain folder)
3. Upload and extract the ZIP

### Step 2: Create Database

1. cPanel → MySQL Databases → Create new database
2. Create user and assign to database
3. cPanel → phpMyAdmin → Import `database.sql`

### Step 3: Configure

Edit `config.php`:

```php
// Database
define('DB_HOST', 'localhost');
define('DB_USER', 'your_cpanel_user');
define('DB_PASS', 'your_db_password');
define('DB_NAME', 'your_cpanel_dbname');

// Telegram
define('TELEGRAM_BOT_TOKEN', 'your_bot_token');
define('ADMIN_TELEGRAM_ID', 'your_telegram_id');

// Your Domain
define('YOUR_DOMAIN', 'https://api.yourdomain.com');
```

### Step 4: Setup Telegram Bot

1. Visit: `https://yourdomain.com/api/telegram-setup.php`
2. Click "Set Webhook"
3. Click "Send Test Message" to verify

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
