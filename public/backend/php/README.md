# 🚀 Hyper Softs Trend API - PHP Backend

Complete PHP backend for the Trend API system with hidden upstream source.

## 🔒 Security Features

- **Hidden Upstream**: Your real data source (betapi.space) is completely hidden from users
- **IP Whitelisting**: Global IP/CIDR whitelist enforcement
- **Domain Whitelisting**: Restrict API access to specific domains
- **API Key Validation**: Full key lifecycle management
- **Request Logging**: Every API call is logged with full details
- **Rate Limiting**: Per-minute and per-day limits

## 📁 File Structure

```
php/
├── config.php          # 🔒 Database & API configuration (NEVER expose!)
├── helpers.php         # 🛠️ Common helper functions
├── database.sql        # 🗄️ MySQL schema
├── .htaccess          # 🔐 Apache security rules
├── api/
│   ├── trend.php      # 🎯 Main endpoint (all games)
│   ├── wingo.php      # 🎰 WinGo endpoint
│   ├── k3.php         # 🎲 K3 endpoint
│   ├── 5d.php         # 🎯 5D endpoint
│   ├── trx.php        # ⚡ TRX endpoint
│   └── numeric.php    # 🔢 Numeric endpoint
└── README.md          # 📖 This file
```

## 🛠️ Installation

### 1. Database Setup

```bash
mysql -u root -p < database.sql
```

### 2. Configure Settings

Edit `config.php`:

```php
define('DB_HOST', 'localhost');
define('DB_USER', 'your_db_user');
define('DB_PASS', 'your_db_password');
define('DB_NAME', 'hyper_softs_db');
```

### 3. Upload to Server

Upload the `php/` folder to your web server.

### 4. Set Permissions

```bash
chmod 644 config.php helpers.php
chmod 755 api/
chmod 644 api/*.php
```

## 📡 API Endpoints

### Main Endpoint (Recommended)

```
GET /api/trend.php?api_key=YOUR_KEY&game=wingo_1min
```

**Available Games:**
- `wingo_1min`, `wingo_3min`, `wingo_5min`, `wingo_10min`
- `k3_1min`, `k3_3min`, `k3_5min`, `k3_10min`
- `5d_1min`, `5d_3min`, `5d_5min`, `5d_10min`
- `trx_1min`, `trx_3min`, `trx_5min`
- `numeric_1min`, `numeric_3min`, `numeric_5min`

### Individual Endpoints

```
GET /api/wingo.php?api_key=YOUR_KEY&duration=1min
GET /api/k3.php?api_key=YOUR_KEY&duration=3min
GET /api/5d.php?api_key=YOUR_KEY&duration=5min
GET /api/trx.php?api_key=YOUR_KEY&duration=1min
GET /api/numeric.php?api_key=YOUR_KEY&duration=3min
```

### Clean URLs (with .htaccess)

```
GET /wingo/1min?api_key=YOUR_KEY
GET /k3/3min?api_key=YOUR_KEY
GET /5d/5min?api_key=YOUR_KEY
```

## 📋 Response Format

### Success Response

```json
{
  "success": true,
  "game": "wingo_1min",
  "game_name": "WinGo 1 Min",
  "data": {
    // Trend data here
  },
  "meta": {
    "response_time_ms": 245,
    "timestamp": "2024-01-15T10:30:00+00:00",
    "powered_by": "Hyper Softs Trend API"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Invalid or expired API key.",
  "code": "INVALID_KEY",
  "timestamp": "2024-01-15T10:30:00+00:00"
}
```

## 🔐 Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_KEY` | 401 | API key not found or invalid |
| `KEY_EXPIRED` | 403 | API key has expired |
| `KEY_DISABLED` | 403 | API key is disabled |
| `IP_BLOCKED` | 403 | Client IP not whitelisted |
| `DOMAIN_BLOCKED` | 403 | Request domain not whitelisted |
| `RATE_LIMITED` | 429 | Too many requests |
| `UPSTREAM_ERROR` | 502 | Data source unavailable |
| `SERVER_ERROR` | 500 | Internal server error |

## 🛡️ Security Notes

1. **NEVER expose `config.php`** - Contains sensitive credentials
2. **Change default admin password** immediately after setup
3. **Use HTTPS** in production
4. **Regularly update IP whitelist** 
5. **Monitor API logs** for suspicious activity

## 📊 Database Tables

- `users` - User accounts
- `api_keys` - API key management
- `api_logs` - Request/response logs
- `allowed_ips` - Global IP whitelist
- `allowed_domains` - Global domain whitelist
- `telegram_logs` - Telegram bot logs
- `activity_logs` - Admin action logs
- `settings` - System configuration

## 🔧 Maintenance

### Clean Old Logs (Manual)

```sql
CALL cleanup_old_logs(90); -- Keep last 90 days
```

### Reset API Counters (Manual)

```sql
CALL reset_api_counters();
```

### Scheduled Cleanup (Automatic)

Events are created automatically:
- `daily_cleanup` - Runs at 3 AM daily
- `daily_counter_reset` - Runs at midnight daily

---

**⚠️ Important**: This backend hides your real data source. Users will only see YOUR domain in all responses and documentation. The upstream API (betapi.space) is never exposed.

---

© 2024 Hyper Softs - All Rights Reserved
