# 🚀 Hyper Softs Trend - Backend Server

Professional API Management System with Express.js, MySQL, and Telegram Bot integration.

## 📋 Features

- ✅ **RESTful API** - Express.js powered API server
- ✅ **IP/Domain Whitelisting** - Secure API access control
- ✅ **JWT Authentication** - Secure admin/user authentication
- ✅ **MySQL Database** - Robust data storage
- ✅ **Telegram Bot** - Notifications & commands
- ✅ **Auto Reminders** - Scheduled key expiry notifications
- ✅ **Rate Limiting** - DDoS protection
- ✅ **Comprehensive Logging** - API, Telegram, Activity logs

## 🛠️ Installation

### Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- Telegram Bot Token (from @BotFather)

### Step 1: Clone/Copy Files

Copy all files from this `backend` folder to your VPS.

### Step 2: Setup Database

```bash
# Login to MySQL
mysql -u root -p

# Run the database setup script
source database.sql
```

### Step 3: Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit with your values
nano .env
```

### Step 4: Install Dependencies

```bash
npm install
```

### Step 5: Start Server

```bash
# Production
npm start

# Development (with auto-reload)
npm run dev

# Start both API server and Telegram bot
npm run start:all
```

## 📁 File Structure

```
backend/
├── server.js          # Main Express API server
├── telegram-bot.js    # Standalone Telegram bot
├── database.sql       # MySQL schema
├── package.json       # Dependencies
├── .env.example       # Environment template
└── README.md          # This file
```

## 🔌 API Endpoints

### Public (with API Key)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/trend/:gameType/:typeId` | Get trend data |
| GET | `/api/key/info` | Get API key information |

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User/Admin login |
| GET | `/api/auth/me` | Get current user |

### Admin Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users |
| POST | `/api/admin/users` | Create user |
| PUT | `/api/admin/users/:id` | Update user |
| DELETE | `/api/admin/users/:id` | Delete user |
| GET | `/api/admin/keys` | List API keys |
| POST | `/api/admin/keys` | Create API key |
| PUT | `/api/admin/keys/:id` | Update API key |
| DELETE | `/api/admin/keys/:id` | Delete API key |
| GET | `/api/admin/logs/api` | API logs |
| GET | `/api/admin/logs/telegram` | Telegram logs |
| GET | `/api/admin/logs/activity` | Activity logs |
| GET | `/api/admin/stats/dashboard` | Dashboard stats |
| GET | `/api/admin/stats/chart` | Chart data |
| GET | `/api/admin/stats/hourly` | Hourly stats |
| GET | `/api/admin/live/requests` | Live API requests |
| GET | `/api/admin/dns/:domain` | DNS lookup |
| GET | `/api/admin/settings` | Get settings |
| PUT | `/api/admin/settings` | Update settings |
| POST | `/api/admin/reminder` | Send manual reminder |

### User Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/keys` | User's API keys |
| POST | `/api/user/renewal-request` | Request renewal |
| GET | `/api/user/logs` | User's API logs |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |

## 🤖 Telegram Bot Commands

### Admin Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome message |
| `/stats` | Dashboard statistics |
| `/users` | List all users |
| `/keys` | List active API keys |
| `/expiring` | Keys expiring soon |
| `/health` | Server health status |
| `/logs` | Recent activity logs |
| `/help` | All commands |

### User Commands

| Command | Description |
|---------|-------------|
| `/mykeys` | Your API keys |
| `/mystats` | Your usage stats |
| `/renew` | Request key renewal |

## 🔒 Security

- **Helmet.js** - HTTP security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Request throttling
- **JWT** - Secure authentication
- **bcrypt** - Password hashing
- **IP Whitelisting** - API access control
- **Domain Whitelisting** - Domain verification

## 📊 Game Types

| Game | Type IDs | Duration Options |
|------|----------|------------------|
| Numeric | 1, 2, 3, 30 | 1min, 3min, 5min, 30min |
| WinGo | wg1, wg3, wg5, wg30 | 1min, 3min, 5min, 30min |
| K3 | k31, k33, k35, k310 | 1min, 3min, 5min, 10min |
| 5D | 5d1, 5d3, 5d5, 5d10 | 1min, 3min, 5min, 10min |
| TRX | trx1, trx3, trx5, trx10 | 1min, 3min, 5min, 10min |

## 🔧 PM2 Production Setup

```bash
# Install PM2
npm install -g pm2

# Start API server
pm2 start server.js --name "hyper-api"

# Start Telegram bot
pm2 start telegram-bot.js --name "hyper-bot"

# Save PM2 config
pm2 save

# Enable startup on reboot
pm2 startup
```

## 📞 Support

For any issues, contact the admin via Telegram.

---

**Made with ❤️ by Hyper Softs**
