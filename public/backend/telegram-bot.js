/**
 * =====================================================
 * 📱 HYPER SOFTS TREND - TELEGRAM BOT
 * Standalone Telegram Bot for notifications & commands
 * =====================================================
 */

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const mysql = require('mysql2/promise');
const cron = require('node-cron');

// =====================================================
// 🔧 CONFIGURATION
// =====================================================
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_TELEGRAM_ID;

if (!BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN is not set!');
  process.exit(1);
}

// Create bot instance
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hyper_softs_db',
  waitForConnections: true,
  connectionLimit: 10
});

console.log('🤖 Telegram Bot Started!');

// =====================================================
// 📝 HELPER FUNCTIONS
// =====================================================

function formatDate(date) {
  return new Date(date).toLocaleString('en-IN', { 
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function isAdmin(chatId) {
  try {
    const [[settings]] = await pool.query('SELECT admin_telegram_id FROM settings WHERE id = 1');
    return settings?.admin_telegram_id === String(chatId);
  } catch (err) {
    return false;
  }
}

async function getUserByChatId(chatId) {
  try {
    const [[user]] = await pool.query(
      'SELECT * FROM users WHERE telegram_id = ?',
      [String(chatId)]
    );
    return user;
  } catch (err) {
    return null;
  }
}

async function logTelegramMessage(type, recipientId, message, status, messageId = null, relatedKeyId = null, relatedUserId = null) {
  try {
    await pool.query(
      `INSERT INTO telegram_logs (type, recipient_id, message, message_id, status, related_api_key_id, related_user_id, sent_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [type, recipientId, message, messageId, status, relatedKeyId, relatedUserId]
    );
  } catch (err) {
    console.error('Log error:', err);
  }
}

// =====================================================
// 🎮 BOT COMMANDS
// =====================================================

// /start - Welcome message
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || 'User';
  const isAdminUser = await isAdmin(chatId);
  const user = await getUserByChatId(chatId);

  let welcomeMessage = `🎉 Welcome to <b>Hyper Softs Trend Bot</b>!

👋 Hello, ${escapeHtml(firstName)}!

`;

  if (isAdminUser) {
    welcomeMessage += `🔐 <b>Admin Access Granted</b>

📋 <b>Admin Commands:</b>
├─ /stats - View dashboard statistics
├─ /users - List all users
├─ /keys - List all API keys
├─ /expiring - Keys expiring soon
├─ /remind [key_id] - Send reminder
├─ /health - Server health status
├─ /logs - Recent activity logs
└─ /help - All commands

💡 Your Chat ID: <code>${chatId}</code>`;
  } else if (user) {
    welcomeMessage += `✅ <b>Account Linked</b>

📋 <b>Your Commands:</b>
├─ /mykeys - View your API keys
├─ /mystats - Your usage statistics
├─ /renew [key_id] - Request renewal
└─ /help - All commands

💡 Your Chat ID: <code>${chatId}</code>`;
  } else {
    welcomeMessage += `⚠️ <b>Account Not Linked</b>

Your Telegram is not linked to any account.
Contact admin to link your account.

💡 Your Chat ID: <code>${chatId}</code>
Share this ID with admin to get started!`;
  }

  bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'HTML' });
});

// /help - Show all commands
bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  const isAdminUser = await isAdmin(chatId);

  let helpMessage = `📚 <b>Hyper Softs Trend Bot - Help</b>\n\n`;

  if (isAdminUser) {
    helpMessage += `🔐 <b>Admin Commands:</b>

<b>📊 Statistics:</b>
/stats - Dashboard overview
/todaystats - Today's API usage

<b>👥 User Management:</b>
/users - List all users
/user [id] - User details

<b>🔑 API Key Management:</b>
/keys - List all API keys
/key [id] - Key details
/expiring - Keys expiring in 7 days
/expired - Expired keys

<b>📤 Notifications:</b>
/remind [key_id] - Send reminder
/broadcast [message] - Message all users

<b>🖥️ System:</b>
/health - Server health
/logs - Recent activity
/settings - Current settings`;
  } else {
    helpMessage += `👤 <b>User Commands:</b>

/mykeys - Your API keys
/mystats - Your usage stats
/renew [key_id] - Request renewal
/status [key_id] - Key status`;
  }

  bot.sendMessage(chatId, helpMessage, { parse_mode: 'HTML' });
});

// /stats - Dashboard statistics (Admin only)
bot.onText(/\/stats/, async (msg) => {
  const chatId = msg.chat.id;
  
  if (!await isAdmin(chatId)) {
    return bot.sendMessage(chatId, '❌ Admin access required!');
  }

  try {
    const [[stats]] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE is_active = TRUE) as total_users,
        (SELECT COUNT(*) FROM api_keys WHERE is_active = TRUE AND expires_at > NOW()) as active_keys,
        (SELECT COUNT(*) FROM api_keys WHERE expires_at < NOW() OR is_active = FALSE) as expired_keys,
        (SELECT COUNT(*) FROM api_logs WHERE DATE(created_at) = CURDATE()) as today_calls,
        (SELECT COUNT(*) FROM api_logs WHERE DATE(created_at) = CURDATE() AND status = 'success') as today_success,
        (SELECT COUNT(*) FROM api_logs WHERE DATE(created_at) = CURDATE() AND status = 'error') as today_errors,
        (SELECT COUNT(*) FROM api_logs WHERE DATE(created_at) = CURDATE() AND status = 'blocked') as today_blocked,
        (SELECT COUNT(*) FROM api_logs) as total_calls
    `);

    const successRate = stats.today_calls > 0 
      ? ((stats.today_success / stats.today_calls) * 100).toFixed(1) 
      : 0;

    const message = `📊 <b>DASHBOARD STATISTICS</b>

╔══════════════════════════════════╗
║         📈 SYSTEM STATS          ║
╚══════════════════════════════════╝

<b>👥 Users:</b>
├─ Total Active: ${stats.total_users}

<b>🔑 API Keys:</b>
├─ Active: ${stats.active_keys}
└─ Expired: ${stats.expired_keys}

<b>📡 Today's API Calls:</b>
├─ Total: ${stats.today_calls.toLocaleString()}
├─ ✅ Success: ${stats.today_success.toLocaleString()}
├─ ❌ Errors: ${stats.today_errors.toLocaleString()}
├─ 🚫 Blocked: ${stats.today_blocked.toLocaleString()}
└─ 📈 Success Rate: ${successRate}%

<b>📊 All Time:</b>
└─ Total Calls: ${stats.total_calls.toLocaleString()}

🕒 Updated: ${formatDate(new Date())}`;

    bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
  } catch (err) {
    bot.sendMessage(chatId, `❌ Error: ${err.message}`);
  }
});

// /users - List all users (Admin only)
bot.onText(/\/users/, async (msg) => {
  const chatId = msg.chat.id;
  
  if (!await isAdmin(chatId)) {
    return bot.sendMessage(chatId, '❌ Admin access required!');
  }

  try {
    const [users] = await pool.query(`
      SELECT u.*, 
        (SELECT COUNT(*) FROM api_keys WHERE user_id = u.id AND is_active = TRUE AND expires_at > NOW()) as active_keys
      FROM users u 
      ORDER BY u.created_at DESC 
      LIMIT 20
    `);

    let message = `👥 <b>USER LIST</b> (${users.length})\n\n`;

    users.forEach((user, i) => {
      const status = user.is_active ? '✅' : '❌';
      message += `${i + 1}. ${status} <b>${escapeHtml(user.username)}</b>
   ├─ Role: ${user.role}
   ├─ TG ID: ${user.telegram_id || 'Not linked'}
   └─ Active Keys: ${user.active_keys}\n\n`;
    });

    bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
  } catch (err) {
    bot.sendMessage(chatId, `❌ Error: ${err.message}`);
  }
});

// /keys - List all API keys (Admin only)
bot.onText(/\/keys/, async (msg) => {
  const chatId = msg.chat.id;
  
  if (!await isAdmin(chatId)) {
    return bot.sendMessage(chatId, '❌ Admin access required!');
  }

  try {
    const [keys] = await pool.query(`
      SELECT ak.*, u.username,
        DATEDIFF(ak.expires_at, NOW()) as days_left
      FROM api_keys ak
      JOIN users u ON ak.user_id = u.id
      WHERE ak.is_active = TRUE AND ak.expires_at > NOW()
      ORDER BY ak.expires_at ASC
      LIMIT 20
    `);

    let message = `🔑 <b>ACTIVE API KEYS</b> (${keys.length})\n\n`;

    keys.forEach((key, i) => {
      const daysLeft = key.days_left;
      const urgency = daysLeft <= 3 ? '🔴' : daysLeft <= 7 ? '🟡' : '🟢';
      
      message += `${i + 1}. ${urgency} <b>${key.game_type.toUpperCase()}</b>
   ├─ User: ${escapeHtml(key.username)}
   ├─ Domain: ${key.domain}
   ├─ Calls: ${key.total_calls.toLocaleString()}
   └─ Expires: ${daysLeft} days\n\n`;
    });

    bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
  } catch (err) {
    bot.sendMessage(chatId, `❌ Error: ${err.message}`);
  }
});

// /expiring - Keys expiring soon (Admin only)
bot.onText(/\/expiring/, async (msg) => {
  const chatId = msg.chat.id;
  
  if (!await isAdmin(chatId)) {
    return bot.sendMessage(chatId, '❌ Admin access required!');
  }

  try {
    const [keys] = await pool.query(`
      SELECT ak.*, u.username, u.telegram_id as user_tg,
        DATEDIFF(ak.expires_at, NOW()) as days_left
      FROM api_keys ak
      JOIN users u ON ak.user_id = u.id
      WHERE ak.is_active = TRUE 
        AND ak.expires_at > NOW()
        AND ak.expires_at <= DATE_ADD(NOW(), INTERVAL 7 DAY)
      ORDER BY ak.expires_at ASC
    `);

    if (keys.length === 0) {
      return bot.sendMessage(chatId, '✅ No keys expiring in the next 7 days!');
    }

    let message = `⚠️ <b>KEYS EXPIRING SOON</b> (${keys.length})\n\n`;

    keys.forEach((key, i) => {
      const daysLeft = key.days_left;
      const urgency = daysLeft <= 1 ? '🔴 URGENT' : daysLeft <= 3 ? '🟠 Soon' : '🟡 Warning';
      
      message += `${i + 1}. ${urgency}
   ├─ 🔑 ${key.api_key.substring(0, 25)}...
   ├─ 👤 User: ${escapeHtml(key.username)}
   ├─ 🌐 Domain: ${key.domain}
   ├─ 📅 Expires: ${formatDate(key.expires_at)}
   ├─ ⏰ Days Left: <b>${daysLeft}</b>
   └─ 📱 TG: ${key.user_tg || 'N/A'}\n\n`;
    });

    message += `\n💡 Use /remind [key_id] to send reminder`;

    bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
  } catch (err) {
    bot.sendMessage(chatId, `❌ Error: ${err.message}`);
  }
});

// /health - Server health (Admin only)
bot.onText(/\/health/, async (msg) => {
  const chatId = msg.chat.id;
  
  if (!await isAdmin(chatId)) {
    return bot.sendMessage(chatId, '❌ Admin access required!');
  }

  try {
    // Check database
    await pool.query('SELECT 1');
    const dbStatus = '✅ Connected';

    // Get memory usage
    const memUsage = process.memoryUsage();
    const memMB = (memUsage.heapUsed / 1024 / 1024).toFixed(2);

    // Get uptime
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);

    const message = `🏥 <b>SERVER HEALTH STATUS</b>

╔══════════════════════════════════╗
║         💚 ALL SYSTEMS GO        ║
╚══════════════════════════════════╝

<b>🗄️ Database:</b> ${dbStatus}

<b>🤖 Bot Status:</b> ✅ Running

<b>💾 Memory Usage:</b> ${memMB} MB

<b>⏱️ Bot Uptime:</b> ${hours}h ${minutes}m

<b>🕒 Server Time:</b> ${formatDate(new Date())}

All systems operational! 🚀`;

    bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
  } catch (err) {
    const message = `🏥 <b>SERVER HEALTH STATUS</b>

╔══════════════════════════════════╗
║         🔴 ISSUES DETECTED       ║
╚══════════════════════════════════╝

<b>Error:</b> ${err.message}

Please check server logs!`;

    bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
  }
});

// /mykeys - User's own keys
bot.onText(/\/mykeys/, async (msg) => {
  const chatId = msg.chat.id;
  const user = await getUserByChatId(chatId);
  
  if (!user) {
    return bot.sendMessage(chatId, '❌ Your Telegram is not linked to any account. Contact admin.');
  }

  try {
    const [keys] = await pool.query(`
      SELECT *,
        DATEDIFF(expires_at, NOW()) as days_left
      FROM api_keys
      WHERE user_id = ?
      ORDER BY expires_at DESC
    `, [user.id]);

    if (keys.length === 0) {
      return bot.sendMessage(chatId, '📭 You have no API keys yet.');
    }

    let message = `🔑 <b>YOUR API KEYS</b>\n\n`;

    keys.forEach((key, i) => {
      const status = key.is_active && key.days_left > 0 ? '✅ Active' : '❌ Expired';
      const daysInfo = key.days_left > 0 ? `${key.days_left} days left` : 'Expired';
      
      message += `${i + 1}. <b>${key.game_type.toUpperCase()}</b> - ${status}
   ├─ 🌐 Domain: ${key.domain}
   ├─ ⏰ Duration: ${key.duration}
   ├─ 📊 Total Calls: ${key.total_calls.toLocaleString()}
   ├─ 📅 Expires: ${formatDate(key.expires_at)}
   └─ ⏳ ${daysInfo}\n\n`;
    });

    message += `💡 Use /renew to request key renewal`;

    bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
  } catch (err) {
    bot.sendMessage(chatId, `❌ Error: ${err.message}`);
  }
});

// /mystats - User's statistics
bot.onText(/\/mystats/, async (msg) => {
  const chatId = msg.chat.id;
  const user = await getUserByChatId(chatId);
  
  if (!user) {
    return bot.sendMessage(chatId, '❌ Your Telegram is not linked to any account.');
  }

  try {
    const [[stats]] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM api_keys WHERE user_id = ? AND is_active = TRUE AND expires_at > NOW()) as active_keys,
        (SELECT COUNT(*) FROM api_keys WHERE user_id = ? AND (is_active = FALSE OR expires_at < NOW())) as expired_keys,
        (SELECT COALESCE(SUM(total_calls), 0) FROM api_keys WHERE user_id = ?) as total_calls,
        (SELECT COUNT(*) FROM api_logs al JOIN api_keys ak ON al.api_key_id = ak.id WHERE ak.user_id = ? AND DATE(al.created_at) = CURDATE()) as today_calls
    `, [user.id, user.id, user.id, user.id]);

    const message = `📊 <b>YOUR STATISTICS</b>

╔══════════════════════════════════╗
║         📈 YOUR STATS            ║
╚══════════════════════════════════╝

<b>👤 Account:</b> ${escapeHtml(user.username)}

<b>🔑 API Keys:</b>
├─ Active: ${stats.active_keys}
└─ Expired: ${stats.expired_keys}

<b>📡 API Usage:</b>
├─ Today: ${stats.today_calls.toLocaleString()}
└─ Total: ${stats.total_calls.toLocaleString()}

🕒 Last Login: ${user.last_login ? formatDate(user.last_login) : 'Never'}`;

    bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
  } catch (err) {
    bot.sendMessage(chatId, `❌ Error: ${err.message}`);
  }
});

// /renew - Request renewal
bot.onText(/\/renew(.*)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const user = await getUserByChatId(chatId);
  
  if (!user) {
    return bot.sendMessage(chatId, '❌ Your Telegram is not linked to any account.');
  }

  try {
    // Get user's expiring keys
    const [keys] = await pool.query(`
      SELECT id, api_key, game_type, domain, expires_at,
        DATEDIFF(expires_at, NOW()) as days_left
      FROM api_keys
      WHERE user_id = ? AND is_active = TRUE
      ORDER BY expires_at ASC
      LIMIT 5
    `, [user.id]);

    if (keys.length === 0) {
      return bot.sendMessage(chatId, '📭 You have no active keys to renew.');
    }

    // Send renewal request notification to admin
    const [[settings]] = await pool.query('SELECT admin_telegram_id FROM settings WHERE id = 1');

    for (const key of keys) {
      if (key.days_left <= 7) {
        const adminMessage = `🔄 💳 RENEWAL REQUEST

╔══════════════════════════════════╗
║      🔔 RENEWAL REQUESTED        ║
╚══════════════════════════════════╝

📋 Request Details:
├─ 👤 User: ${escapeHtml(user.username)}
├─ 📱 TG ID: ${chatId}
├─ 🔑 API Key: ${key.api_key.substring(0, 30)}...
├─ 🎮 Game Type: ${key.game_type.toUpperCase()}
├─ 🌐 Domain: ${key.domain}
├─ 📅 Current Expiry: ${formatDate(key.expires_at)}
└─ ⏰ Days Left: ${key.days_left}

Action Required! 📌`;

        if (settings?.admin_telegram_id) {
          bot.sendMessage(settings.admin_telegram_id, adminMessage, { parse_mode: 'HTML' });
        }
      }
    }

    bot.sendMessage(chatId, `✅ <b>Renewal Request Submitted!</b>

Your renewal request has been sent to admin.
You will be notified once it's processed.

📋 Keys in request: ${keys.filter(k => k.days_left <= 7).length}`, { parse_mode: 'HTML' });

  } catch (err) {
    bot.sendMessage(chatId, `❌ Error: ${err.message}`);
  }
});

// /logs - Recent activity logs (Admin only)
bot.onText(/\/logs/, async (msg) => {
  const chatId = msg.chat.id;
  
  if (!await isAdmin(chatId)) {
    return bot.sendMessage(chatId, '❌ Admin access required!');
  }

  try {
    const [logs] = await pool.query(`
      SELECT al.*, u.username
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 10
    `);

    let message = `📝 <b>RECENT ACTIVITY</b>\n\n`;

    logs.forEach((log, i) => {
      const time = formatDate(log.created_at);
      message += `${i + 1}. <b>${log.action}</b>
   ├─ User: ${log.username || 'System'}
   ├─ IP: ${log.ip || 'N/A'}
   └─ Time: ${time}\n\n`;
    });

    bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
  } catch (err) {
    bot.sendMessage(chatId, `❌ Error: ${err.message}`);
  }
});

// =====================================================
// ⏰ SCHEDULED TASKS
// =====================================================

// Auto reminder - Check expiring keys daily at 9 AM IST
cron.schedule('30 3 * * *', async () => { // 3:30 UTC = 9:00 IST
  console.log('🔔 Running auto reminder check...');
  
  try {
    const [[settings]] = await pool.query(
      'SELECT admin_telegram_id, auto_reminder_enabled, auto_reminder_days FROM settings WHERE id = 1'
    );

    if (!settings?.auto_reminder_enabled) {
      console.log('Auto reminder disabled');
      return;
    }

    const reminderDays = settings.auto_reminder_days || 7;

    const [keys] = await pool.query(`
      SELECT ak.*, u.username, u.telegram_id as user_tg,
        DATEDIFF(ak.expires_at, NOW()) as days_left
      FROM api_keys ak
      JOIN users u ON ak.user_id = u.id
      WHERE ak.is_active = TRUE 
        AND ak.expires_at > NOW()
        AND DATEDIFF(ak.expires_at, NOW()) <= ?
        AND DATEDIFF(ak.expires_at, NOW()) > 0
    `, [reminderDays]);

    console.log(`Found ${keys.length} keys expiring soon`);

    for (const key of keys) {
      // Notify user
      if (key.user_tg) {
        const userMessage = `⏰ 🔔 API KEY EXPIRY REMINDER

╔══════════════════════════════════╗
║      ⚠️ EXPIRING SOON            ║
╚══════════════════════════════════╝

📋 Key Details:
├─ 🎮 Game: ${key.game_type.toUpperCase()}
├─ 🌐 Domain: ${key.domain}
├─ 📅 Expires: ${formatDate(key.expires_at)}
└─ ⏰ Days Left: <b>${key.days_left}</b>

🔄 Use /renew to request renewal

Don't let your service interrupt! 🚀`;

        try {
          await bot.sendMessage(key.user_tg, userMessage, { parse_mode: 'HTML' });
          await logTelegramMessage('reminder', key.user_tg, userMessage, 'sent', null, key.id, key.user_id);
        } catch (err) {
          console.error(`Failed to send reminder to ${key.user_tg}:`, err.message);
        }
      }
    }

    // Summary to admin
    if (keys.length > 0 && settings.admin_telegram_id) {
      const adminSummary = `📤 <b>AUTO REMINDER SUMMARY</b>

✅ Sent ${keys.length} expiry reminders

${keys.map(k => `• ${k.username} - ${k.game_type.toUpperCase()} (${k.days_left} days)`).join('\n')}

🕒 ${formatDate(new Date())}`;

      bot.sendMessage(settings.admin_telegram_id, adminSummary, { parse_mode: 'HTML' });
    }

  } catch (err) {
    console.error('Auto reminder error:', err);
  }
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});

// Health check notification - Every 6 hours
cron.schedule('0 */6 * * *', async () => {
  try {
    const [[settings]] = await pool.query(
      'SELECT admin_telegram_id, health_notifications_enabled FROM settings WHERE id = 1'
    );

    if (!settings?.health_notifications_enabled || !settings?.admin_telegram_id) return;

    // Check database
    await pool.query('SELECT 1');

    // Get stats
    const [[stats]] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM api_logs WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 HOUR)) as recent_calls,
        (SELECT COUNT(*) FROM api_logs WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 HOUR) AND status = 'error') as recent_errors
    `);

    const errorRate = stats.recent_calls > 0 
      ? ((stats.recent_errors / stats.recent_calls) * 100).toFixed(1)
      : 0;

    // Only alert if error rate is high
    if (errorRate > 10) {
      const message = `⚠️ <b>HEALTH ALERT</b>

High error rate detected in last 6 hours:
├─ Total Calls: ${stats.recent_calls}
├─ Errors: ${stats.recent_errors}
└─ Error Rate: ${errorRate}%

Please check server logs!`;

      bot.sendMessage(settings.admin_telegram_id, message, { parse_mode: 'HTML' });
    }

  } catch (err) {
    console.error('Health check error:', err);
  }
});

// =====================================================
// 🚨 ERROR HANDLING
// =====================================================

bot.on('polling_error', (error) => {
  console.error('Polling error:', error.code, error.message);
});

bot.on('error', (error) => {
  console.error('Bot error:', error.message);
});

// =====================================================
// 🚀 STARTUP MESSAGE
// =====================================================

(async () => {
  try {
    const [[settings]] = await pool.query('SELECT admin_telegram_id FROM settings WHERE id = 1');
    if (settings?.admin_telegram_id) {
      const startupMessage = `🤖 <b>BOT STARTED</b>

╔══════════════════════════════════╗
║      ✅ SYSTEM ONLINE            ║
╚══════════════════════════════════╝

Hyper Softs Trend Bot is now running!

🕒 ${formatDate(new Date())}`;

      bot.sendMessage(settings.admin_telegram_id, startupMessage, { parse_mode: 'HTML' });
    }
  } catch (err) {
    console.error('Startup notification failed:', err.message);
  }
})();

console.log('✅ Telegram Bot is running...');
