# 🚀 Hyper Softs Trend API - Complete PHP Backend

**All-in-one PHP backend** for API Management System - works on cPanel shared hosting, VPS, or any PHP server!

## ✨ Key Features

- **🔒 Hidden Upstream API**: Your real data source (betapi.space) is completely hidden
- **⚡ One-Click Install**: Automated `install.php` wizard handles everything
- **📁 Single config.php**: All settings in one place
- **🌐 cPanel Compatible**: Works on shared hosting - no Node.js required
- **🔐 IP/Domain Whitelisting**: Secure access control
- **🤖 Telegram Bot**: Admin notifications & user commands
- **📊 Full Logging**: Every API call tracked

---

## 📋 Requirements

- **PHP 7.4+** (PHP 8.0+ recommended)
- **MySQL 5.7+** or MariaDB 10.3+
- **Apache** with mod_rewrite enabled
- **cURL extension** enabled

---

## 🛠️ Quick Installation (Recommended)

### Step 1: Upload Files

1. Download the backend ZIP package from admin panel
2. Upload to your server via cPanel File Manager or FTP
3. Extract to your desired directory (e.g., `public_html/api/`)

### Step 2: Run Automated Installer

1. Open browser and visit: `https://yourdomain.com/api/install.php`
2. Follow the 3-step wizard:
   - **Step 1**: Enter database credentials and test connection
   - **Step 2**: System automatically creates tables and admin account
   - **Step 3**: Configure Telegram bot and other settings

### Step 3: Done! 🎉

The installer will:
- ✅ Test database connectivity
- ✅ Create all required tables
- ✅ Set up admin account
- ✅ Generate `config.php` with your settings
- ✅ Secure the installation

---

## 📁 File Structure

```
php/
├── install.php             # 🔧 Automated installer (delete after setup!)
├── config.php              # 🔒 Generated configuration file
├── helpers.php             # 🛠️ Common utility functions
├── database.sql            # 🗄️ MySQL schema (reference)
├── .htaccess               # 🔐 Apache security rules
├── index.php               # 🏠 Default page
│
├── admin/                  # 👨‍💼 Admin Panel
│   ├── login.php           # Admin login page
│   ├── dashboard.php       # Main dashboard
│   ├── users.php           # User management
│   ├── api-keys.php        # API key management
│   ├── api-logs.php        # API request logs
│   ├── telegram-logs.php   # Telegram logs
│   ├── activity-logs.php   # Activity logs
│   ├── ip-whitelist.php    # IP whitelist management
│   ├── settings.php        # System settings
│   ├── profile.php         # Admin profile
│   ├── documentation.php   # API documentation
│   └── logout.php          # Logout handler
│
├── api/                    # 🔌 API Endpoints
│   ├── wingo.php           # 🎰 WinGo API (30s, 1min, 3min, 5min)
│   ├── k3.php              # 🎲 K3 API (1min, 3min, 5min, 10min)
│   ├── 5d.php              # 🎯 5D API (1min, 3min, 5min, 10min)
│   ├── trx.php             # ⚡ TRX API (1min, 3min, 5min)
│   ├── numeric.php         # 🔢 Numeric API (1min, 3min, 5min)
│   ├── health.php          # 💚 Health Check (no key required)
│   ├── telegram-bot.php    # 🤖 Telegram Bot Webhook
│   └── telegram-setup.php  # 🔧 Bot Setup Page
│
└── includes/               # 📦 Shared Components
    ├── auth.php            # Authentication functions
    ├── header.php          # Admin panel header
    └── footer.php          # Admin panel footer
```

---

## 🔧 Manual Installation (Advanced)

If you prefer manual setup over the automated installer:

### Step 1: Create Database

```sql
-- Login to MySQL/phpMyAdmin
CREATE DATABASE hyper_softs_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'hyper_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON hyper_softs_db.* TO 'hyper_user'@'localhost';
FLUSH PRIVILEGES;
```

### Step 2: Import Schema

```bash
mysql -u hyper_user -p hyper_softs_db < database.sql
```

Or use phpMyAdmin → Import → Select `database.sql`

### Step 3: Configure config.php

Create/edit `config.php`:

```php
<?php
// Database Configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'hyper_user');
define('DB_PASS', 'your_password');
define('DB_NAME', 'hyper_softs_db');

// Site Configuration
define('SITE_NAME', 'Hyper Softs Trend');
define('YOUR_DOMAIN', 'https://api.yourdomain.com');

// Telegram Bot Configuration
define('TELEGRAM_BOT_TOKEN', 'your_bot_token_from_botfather');
define('ADMIN_TELEGRAM_ID', 'your_telegram_user_id');

// Upstream API (Hidden from users)
define('UPSTREAM_API_URL', 'https://betapi.space/api');
define('UPSTREAM_API_KEY', 'your_betapi_key');

// Security
define('JWT_SECRET', 'your-random-secret-key-here');
define('RATE_LIMIT_PER_MINUTE', 100);
define('RATE_LIMIT_PER_DAY', 10000);
```

### Step 4: Set Permissions

```bash
chmod 644 config.php helpers.php
chmod 755 api/ admin/ includes/
chmod 644 api/*.php admin/*.php includes/*.php
```

### Step 5: Setup Telegram Webhook

Visit: `https://yourdomain.com/api/telegram-setup.php`

---

## 📡 API Endpoints

### Base URL
```
https://yourdomain.com/api/
```

### Available Endpoints

| Game | Endpoint | Durations |
|------|----------|-----------|
| WinGo | `/api/wingo.php` | 30s, 1min, 3min, 5min |
| K3 | `/api/k3.php` | 1min, 3min, 5min, 10min |
| 5D | `/api/5d.php` | 1min, 3min, 5min, 10min |
| TRX | `/api/trx.php` | 1min, 3min, 5min |
| Numeric | `/api/numeric.php` | 1min, 3min, 5min |
| Health | `/api/health.php` | - (no key needed) |

### Request Examples

```bash
# WinGo 1 minute data
curl "https://yourdomain.com/api/wingo.php?api_key=YOUR_KEY&duration=1min"

# K3 3 minute data
curl "https://yourdomain.com/api/k3.php?api_key=YOUR_KEY&duration=3min"

# Health check
curl "https://yourdomain.com/api/health.php"
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

### User Commands

| Command | Description |
|---------|-------------|
| `/start` | Start bot & show menu |
| `/status` | Check account status |
| `/keys` | View your API keys |
| `/renew` | Request key renewal |
| `/help` | Get help |

### Admin Commands

| Command | Description |
|---------|-------------|
| `/stats` | System statistics |
| `/users` | List all users |
| `/expiring` | Keys expiring soon |
| `/logs` | Recent activity |

---

## 🔐 Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 200 | Success | - |
| 400 | Invalid duration | Check duration parameter |
| 401 | Missing/Invalid API key | Verify API key |
| 403 | IP/Domain blocked or key expired | Check whitelist or renew key |
| 429 | Rate limit exceeded | Wait and retry |
| 502 | Upstream unavailable | Contact admin |

---

## 🛡️ Security Features

1. **config.php protected** - `.htaccess` blocks direct access
2. **PDO prepared statements** - SQL injection prevention
3. **API key masking** - Keys hidden in logs
4. **IP Whitelisting** - Per-key IP restrictions
5. **Domain Whitelisting** - Origin header verification
6. **Rate Limiting** - Per-minute and daily limits
7. **Activity Logging** - All admin actions tracked
8. **Secure Sessions** - Session fixation prevention

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

## ⚙️ Optional: Cron Jobs

Add in cPanel → Cron Jobs for automated maintenance:

```bash
# Daily log cleanup (3 AM)
0 3 * * * /usr/bin/php /home/user/public_html/api/cron/cleanup.php

# Reset daily rate limit counters (midnight)
0 0 * * * /usr/bin/php /home/user/public_html/api/cron/reset-counters.php

# Check expiring keys and send reminders (9 AM)
0 9 * * * /usr/bin/php /home/user/public_html/api/cron/expiry-reminder.php
```

---

## 🔧 Troubleshooting

### "Access denied" error
- Check if your IP is whitelisted in admin panel
- Verify API key is active and not expired
- Check domain whitelist if using from website

### "Database connection failed"
- Verify credentials in `config.php`
- Check database exists in cPanel/MySQL
- Ensure MySQL user has proper privileges

### "Telegram bot not responding"
- Visit `/api/telegram-setup.php` and re-set webhook
- Verify bot token is correct
- Check admin Telegram ID

### "500 Internal Server Error"
- Check PHP error logs in cPanel
- Ensure all required PHP extensions are enabled
- Verify file permissions

---

## 🚀 VPS Deployment (Alternative)

For VPS with command line access:

```bash
# Navigate to web directory
cd /var/www/html/api

# Extract files
unzip hyper-softs-backend.zip

# Set ownership
chown -R www-data:www-data .

# Set permissions
find . -type d -exec chmod 755 {} \;
find . -type f -exec chmod 644 {} \;

# Run installer in browser or configure manually
```

---

## 📞 Support

- **Email**: support@hypersofts.com
- **Telegram**: @hypersofts
- **Documentation**: Available in admin panel

---

## ⚠️ Important Notes

1. **Delete `install.php`** after successful installation
2. **Backup `config.php`** - Contains all your settings
3. **Never expose `config.php`** - Already protected by `.htaccess`
4. **Your data source is hidden** - Users only see YOUR domain

---

**⚡ Your real data source (betapi.space) is NEVER exposed to end users!**

---

© 2024 Hyper Softs - All Rights Reserved
