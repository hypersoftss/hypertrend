/**
 * =====================================================
 * 🚀 HYPER SOFTS TREND - API SERVER
 * Node.js + Express + MySQL
 * =====================================================
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// =====================================================
// 🔧 DATABASE CONNECTION
// =====================================================
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hyper_softs_db',
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test database connection
pool.getConnection()
  .then(conn => {
    console.log('✅ Database connected successfully');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  });

// =====================================================
// 🛡️ MIDDLEWARE
// =====================================================
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Domain']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Rate limiter
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: { success: false, error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// =====================================================
// 🔐 JWT AUTHENTICATION
// =====================================================
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this';
const JWT_EXPIRES_IN = '24h';

function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  next();
}

// =====================================================
// 🔑 API KEY VALIDATION MIDDLEWARE
// =====================================================
async function validateApiKey(req, res, next) {
  const startTime = Date.now();
  const apiKey = req.headers['x-api-key'];
  const requestIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const requestDomain = req.headers['x-domain'] || req.headers.origin || req.headers.referer || '';
  
  // Clean domain - extract hostname
  let cleanDomain = '';
  try {
    if (requestDomain) {
      const url = new URL(requestDomain.startsWith('http') ? requestDomain : `http://${requestDomain}`);
      cleanDomain = url.hostname;
    }
  } catch (e) {
    cleanDomain = requestDomain;
  }

  if (!apiKey) {
    await logApiRequest(null, req.path, requestIp, cleanDomain, 'blocked', 'Missing API key', Date.now() - startTime);
    return res.status(401).json({ success: false, error: 'API key required' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT * FROM api_keys WHERE api_key = ? AND is_active = TRUE`,
      [apiKey]
    );

    if (rows.length === 0) {
      await logApiRequest(null, req.path, requestIp, cleanDomain, 'blocked', 'Invalid API key', Date.now() - startTime);
      return res.status(401).json({ success: false, error: 'Invalid API key' });
    }

    const keyData = rows[0];

    // Check expiry
    if (new Date(keyData.expires_at) < new Date()) {
      await logApiRequest(keyData.id, req.path, requestIp, cleanDomain, 'blocked', 'Key expired', Date.now() - startTime);
      return res.status(401).json({ success: false, error: 'API key expired' });
    }

    // IP Whitelist validation
    const ipWhitelist = typeof keyData.ip_whitelist === 'string' 
      ? JSON.parse(keyData.ip_whitelist) 
      : keyData.ip_whitelist || [];
    
    if (ipWhitelist.length > 0) {
      const cleanIp = requestIp.replace('::ffff:', ''); // Handle IPv4-mapped IPv6
      const isIpAllowed = ipWhitelist.some(ip => {
        // Exact match or CIDR range (simplified)
        if (ip === cleanIp) return true;
        if (ip === requestIp) return true;
        // Wildcard support (e.g., 192.168.1.*)
        if (ip.includes('*')) {
          const pattern = ip.replace(/\./g, '\\.').replace(/\*/g, '.*');
          return new RegExp(`^${pattern}$`).test(cleanIp);
        }
        return false;
      });

      if (!isIpAllowed) {
        await logApiRequest(keyData.id, req.path, requestIp, cleanDomain, 'blocked', `IP not whitelisted: ${cleanIp}`, Date.now() - startTime);
        return res.status(403).json({ 
          success: false, 
          error: 'IP address not whitelisted',
          your_ip: cleanIp
        });
      }
    }

    // Domain Whitelist validation
    const domainWhitelist = typeof keyData.domain_whitelist === 'string'
      ? JSON.parse(keyData.domain_whitelist)
      : keyData.domain_whitelist || [];

    if (domainWhitelist.length > 0 && cleanDomain) {
      const isDomainAllowed = domainWhitelist.some(domain => {
        // Exact match
        if (domain.toLowerCase() === cleanDomain.toLowerCase()) return true;
        // Wildcard subdomain (*.example.com)
        if (domain.startsWith('*.')) {
          const baseDomain = domain.slice(2).toLowerCase();
          return cleanDomain.toLowerCase().endsWith(baseDomain);
        }
        return false;
      });

      if (!isDomainAllowed) {
        await logApiRequest(keyData.id, req.path, requestIp, cleanDomain, 'blocked', `Domain not whitelisted: ${cleanDomain}`, Date.now() - startTime);
        return res.status(403).json({ 
          success: false, 
          error: 'Domain not whitelisted',
          your_domain: cleanDomain
        });
      }
    }

    // Attach key data to request
    req.apiKey = keyData;
    req.requestIp = requestIp;
    req.requestDomain = cleanDomain;
    req.startTime = startTime;
    next();

  } catch (err) {
    console.error('API Key validation error:', err);
    await logApiRequest(null, req.path, requestIp, cleanDomain, 'error', err.message, Date.now() - startTime);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

// =====================================================
// 📝 LOGGING FUNCTIONS
// =====================================================
async function logApiRequest(apiKeyId, endpoint, ip, domain, status, errorMessage, responseTime) {
  try {
    await pool.query(
      `INSERT INTO api_logs (api_key_id, endpoint, request_ip, request_domain, status, error_message, response_time)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [apiKeyId, endpoint, ip, domain, status, errorMessage || null, responseTime || 0]
    );

    // Update API key stats
    if (apiKeyId) {
      const statField = status === 'success' ? 'success_calls' : 
                       status === 'blocked' ? 'blocked_calls' : 'failed_calls';
      await pool.query(
        `UPDATE api_keys SET total_calls = total_calls + 1, ${statField} = ${statField} + 1, 
         last_used = NOW(), last_ip = ?, last_domain = ? WHERE id = ?`,
        [ip, domain, apiKeyId]
      );
    }
  } catch (err) {
    console.error('Logging error:', err);
  }
}

async function logActivity(userId, action, actionType, entityType, entityId, details, ip) {
  try {
    await pool.query(
      `INSERT INTO activity_logs (user_id, action, action_type, entity_type, entity_id, details, ip)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, action, actionType, entityType, entityId, details, ip]
    );
  } catch (err) {
    console.error('Activity log error:', err);
  }
}

// =====================================================
// 🔑 GENERATE API KEY
// =====================================================
function generateApiKey() {
  const randomBytes = crypto.randomBytes(32).toString('hex');
  return `HYPER_${randomBytes}`;
}

// =====================================================
// 📡 BETAPI INTEGRATION
// =====================================================
const BETAPI_BASE = process.env.BETAPI_URL || 'https://betapi.space/api';
const BETAPI_KEY = process.env.BETAPI_KEY || '';

async function fetchFromBetApi(gameType, typeId) {
  try {
    // Map game types to BetAPI endpoints
    const endpoints = {
      'numeric': `/trend/numeric/${typeId}`,
      'wingo': `/trend/wingo/${typeId}`,
      'k3': `/trend/k3/${typeId}`,
      '5d': `/trend/5d/${typeId}`,
      'trx': `/trend/trx/${typeId}`
    };

    const endpoint = endpoints[gameType];
    if (!endpoint) {
      throw new Error(`Invalid game type: ${gameType}`);
    }

    const response = await axios.get(`${BETAPI_BASE}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${BETAPI_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    return response.data;
  } catch (err) {
    console.error('BetAPI error:', err.message);
    throw err;
  }
}

// =====================================================
// 🌐 PUBLIC API ROUTES (with API Key)
// =====================================================

// Trend API - Main endpoint
app.get('/api/trend/:gameType/:typeId', validateApiKey, async (req, res) => {
  const { gameType, typeId } = req.params;
  const { apiKey, requestIp, requestDomain, startTime } = req;

  // Validate game type matches API key
  if (apiKey.game_type !== gameType) {
    await logApiRequest(apiKey.id, req.path, requestIp, requestDomain, 'blocked', 
      `Game type mismatch: key is for ${apiKey.game_type}, requested ${gameType}`, Date.now() - startTime);
    return res.status(403).json({
      success: false,
      error: `This API key is only valid for ${apiKey.game_type.toUpperCase()} game type`
    });
  }

  try {
    const data = await fetchFromBetApi(gameType, typeId);
    await logApiRequest(apiKey.id, req.path, requestIp, requestDomain, 'success', null, Date.now() - startTime);
    
    res.json({
      success: true,
      game: gameType.toUpperCase(),
      duration: apiKey.duration,
      data: data
    });
  } catch (err) {
    await logApiRequest(apiKey.id, req.path, requestIp, requestDomain, 'error', err.message, Date.now() - startTime);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch trend data',
      message: err.message
    });
  }
});

// API Key Info
app.get('/api/key/info', validateApiKey, async (req, res) => {
  const { apiKey } = req;
  
  res.json({
    success: true,
    key: {
      game_type: apiKey.game_type,
      duration: apiKey.duration,
      domain: apiKey.domain,
      expires_at: apiKey.expires_at,
      total_calls: apiKey.total_calls,
      is_active: apiKey.is_active
    }
  });
});

// =====================================================
// 🔐 AUTH ROUTES
// =====================================================

// Login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const clientIp = req.ip || req.headers['x-forwarded-for'];

  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username and password required' });
  }

  try {
    const [users] = await pool.query(
      'SELECT * FROM users WHERE (username = ? OR email = ?) AND is_active = TRUE',
      [username, username]
    );

    if (users.length === 0) {
      await logActivity(null, 'Failed login attempt', 'login', 'users', null, `Username: ${username}`, clientIp);
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      await logActivity(user.id, 'Failed login - wrong password', 'login', 'users', user.id, null, clientIp);
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Update last login
    await pool.query('UPDATE users SET last_login = NOW(), login_ip = ? WHERE id = ?', [clientIp, user.id]);

    // Generate token
    const token = generateToken(user);

    // Log successful login
    await logActivity(user.id, 'Successful login', 'login', 'users', user.id, null, clientIp);

    // Send Telegram login alert if enabled
    if (user.role === 'admin') {
      await sendLoginAlert(user, clientIp);
    }

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        telegram_id: user.telegram_id
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get current user
app.get('/api/auth/me', verifyToken, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, username, email, role, telegram_id, is_active, created_at, last_login FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, user: users[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// =====================================================
// 👤 USER MANAGEMENT (Admin Only)
// =====================================================

// Get all users
app.get('/api/admin/users', verifyToken, requireAdmin, async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT id, username, email, telegram_id, role, is_active, created_at, last_login,
       (SELECT COUNT(*) FROM api_keys WHERE user_id = users.id) as total_keys,
       (SELECT COUNT(*) FROM api_keys WHERE user_id = users.id AND is_active = TRUE AND expires_at > NOW()) as active_keys
       FROM users ORDER BY created_at DESC`
    );
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create user
app.post('/api/admin/users', verifyToken, requireAdmin, async (req, res) => {
  const { username, email, password, telegram_id, role } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ success: false, error: 'Username, email, and password required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();

    await pool.query(
      `INSERT INTO users (id, username, email, password, telegram_id, role) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, username, email, hashedPassword, telegram_id || null, role || 'user']
    );

    await logActivity(req.user.id, `Created user: ${username}`, 'create', 'users', id, null, req.ip);

    res.json({ success: true, message: 'User created successfully', id });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, error: 'Username or email already exists' });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update user
app.put('/api/admin/users/:id', verifyToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { username, email, telegram_id, role, is_active, password } = req.body;

  try {
    let query = 'UPDATE users SET username = ?, email = ?, telegram_id = ?, role = ?, is_active = ?';
    let params = [username, email, telegram_id, role, is_active];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', password = ?';
      params.push(hashedPassword);
    }

    query += ' WHERE id = ?';
    params.push(id);

    await pool.query(query, params);
    await logActivity(req.user.id, `Updated user: ${username}`, 'update', 'users', id, null, req.ip);

    res.json({ success: true, message: 'User updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete user
app.delete('/api/admin/users/:id', verifyToken, requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const [user] = await pool.query('SELECT username FROM users WHERE id = ?', [id]);
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    await logActivity(req.user.id, `Deleted user: ${user[0]?.username}`, 'delete', 'users', id, null, req.ip);

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// 🔑 API KEY MANAGEMENT (Admin Only)
// =====================================================

// Get all API keys
app.get('/api/admin/keys', verifyToken, requireAdmin, async (req, res) => {
  try {
    const [keys] = await pool.query(
      `SELECT ak.*, u.username, u.email, u.telegram_id as user_telegram_id,
       DATEDIFF(ak.expires_at, NOW()) as days_until_expiry
       FROM api_keys ak
       JOIN users u ON ak.user_id = u.id
       ORDER BY ak.created_at DESC`
    );
    res.json({ success: true, keys });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create API key
app.post('/api/admin/keys', verifyToken, requireAdmin, async (req, res) => {
  const { user_id, game_type, duration, domain, ip_whitelist, domain_whitelist, validity_days } = req.body;

  if (!user_id || !game_type || !duration || !domain) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  try {
    const id = uuidv4();
    const apiKey = generateApiKey();
    const expiresAt = new Date(Date.now() + (validity_days || 30) * 24 * 60 * 60 * 1000);

    await pool.query(
      `INSERT INTO api_keys (id, api_key, user_id, game_type, duration, domain, ip_whitelist, domain_whitelist, validity_days, expires_at, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, apiKey, user_id, game_type, duration, domain, 
       JSON.stringify(ip_whitelist || []), 
       JSON.stringify(domain_whitelist || []),
       validity_days || 30, expiresAt, req.user.id]
    );

    // Get user info for notification
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [user_id]);
    const user = users[0];

    // Send Telegram notifications
    await sendNewKeyNotification(apiKey, domain, validity_days || 30, expiresAt, user, req.user.username);

    await logActivity(req.user.id, `Created API key for ${user?.username}`, 'create', 'api_keys', id, `Game: ${game_type}`, req.ip);

    res.json({ 
      success: true, 
      message: 'API key created successfully', 
      key: { id, api_key: apiKey, expires_at: expiresAt }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update API key
app.put('/api/admin/keys/:id', verifyToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { is_active, ip_whitelist, domain_whitelist, validity_days, expires_at } = req.body;

  try {
    await pool.query(
      `UPDATE api_keys SET is_active = ?, ip_whitelist = ?, domain_whitelist = ?, validity_days = ?, expires_at = ?
       WHERE id = ?`,
      [is_active, JSON.stringify(ip_whitelist || []), JSON.stringify(domain_whitelist || []), validity_days, expires_at, id]
    );

    await logActivity(req.user.id, 'Updated API key', 'update', 'api_keys', id, null, req.ip);
    res.json({ success: true, message: 'API key updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete API key
app.delete('/api/admin/keys/:id', verifyToken, requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM api_keys WHERE id = ?', [id]);
    await logActivity(req.user.id, 'Deleted API key', 'delete', 'api_keys', id, null, req.ip);
    res.json({ success: true, message: 'API key deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// 📊 LOGS & STATS (Admin Only)
// =====================================================

// Get API logs
app.get('/api/admin/logs/api', verifyToken, requireAdmin, async (req, res) => {
  const { limit = 100, offset = 0, status, api_key_id } = req.query;

  try {
    let query = `
      SELECT al.*, ak.api_key, ak.game_type, ak.domain as key_domain, u.username
      FROM api_logs al
      LEFT JOIN api_keys ak ON al.api_key_id = ak.id
      LEFT JOIN users u ON ak.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND al.status = ?';
      params.push(status);
    }
    if (api_key_id) {
      query += ' AND al.api_key_id = ?';
      params.push(api_key_id);
    }

    query += ' ORDER BY al.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [logs] = await pool.query(query, params);
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get Telegram logs
app.get('/api/admin/logs/telegram', verifyToken, requireAdmin, async (req, res) => {
  const { limit = 100, offset = 0, type, status } = req.query;

  try {
    let query = 'SELECT * FROM telegram_logs WHERE 1=1';
    const params = [];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [logs] = await pool.query(query, params);
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get Activity logs
app.get('/api/admin/logs/activity', verifyToken, requireAdmin, async (req, res) => {
  const { limit = 100, offset = 0, user_id, action_type } = req.query;

  try {
    let query = `
      SELECT al.*, u.username
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (user_id) {
      query += ' AND al.user_id = ?';
      params.push(user_id);
    }
    if (action_type) {
      query += ' AND al.action_type = ?';
      params.push(action_type);
    }

    query += ' ORDER BY al.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [logs] = await pool.query(query, params);
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Dashboard stats
app.get('/api/admin/stats/dashboard', verifyToken, requireAdmin, async (req, res) => {
  try {
    const [[stats]] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE is_active = TRUE) as total_users,
        (SELECT COUNT(*) FROM api_keys WHERE is_active = TRUE AND expires_at > NOW()) as active_keys,
        (SELECT COUNT(*) FROM api_keys WHERE expires_at < NOW() OR is_active = FALSE) as expired_keys,
        (SELECT COUNT(*) FROM api_logs WHERE DATE(created_at) = CURDATE()) as today_api_calls,
        (SELECT COUNT(*) FROM api_logs) as total_api_calls,
        (SELECT COUNT(*) FROM api_logs WHERE DATE(created_at) = CURDATE() AND status = 'success') as today_success,
        (SELECT COUNT(*) FROM api_logs WHERE DATE(created_at) = CURDATE() AND status = 'error') as today_errors,
        (SELECT COUNT(*) FROM api_logs WHERE DATE(created_at) = CURDATE() AND status = 'blocked') as today_blocked
    `);

    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API usage chart data
app.get('/api/admin/stats/chart', verifyToken, requireAdmin, async (req, res) => {
  const { days = 7 } = req.query;

  try {
    const [data] = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success,
        SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as errors,
        SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) as blocked,
        AVG(response_time) as avg_response_time
      FROM api_logs
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [parseInt(days)]);

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Hourly stats for live monitoring
app.get('/api/admin/stats/hourly', verifyToken, requireAdmin, async (req, res) => {
  try {
    const [data] = await pool.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m-%d %H:00:00') as hour,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success,
        SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as errors,
        SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) as blocked
      FROM api_logs
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      GROUP BY hour
      ORDER BY hour ASC
    `);

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Game type stats
app.get('/api/admin/stats/games', verifyToken, requireAdmin, async (req, res) => {
  try {
    const [data] = await pool.query(`
      SELECT 
        ak.game_type,
        COUNT(al.id) as total_calls,
        SUM(CASE WHEN al.status = 'success' THEN 1 ELSE 0 END) as success,
        SUM(CASE WHEN al.status = 'error' THEN 1 ELSE 0 END) as errors
      FROM api_logs al
      JOIN api_keys ak ON al.api_key_id = ak.id
      WHERE al.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY ak.game_type
    `);

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// 🔔 LIVE MONITORING
// =====================================================

// Get live API requests (recent)
app.get('/api/admin/live/requests', verifyToken, requireAdmin, async (req, res) => {
  const { limit = 50 } = req.query;

  try {
    const [requests] = await pool.query(`
      SELECT 
        al.*,
        ak.api_key,
        ak.game_type,
        u.username
      FROM api_logs al
      LEFT JOIN api_keys ak ON al.api_key_id = ak.id
      LEFT JOIN users u ON ak.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT ?
    `, [parseInt(limit)]);

    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// 🌐 DNS CHECKER
// =====================================================

// DNS lookup for domain
app.get('/api/admin/dns/:domain', verifyToken, requireAdmin, async (req, res) => {
  const { domain } = req.params;
  const dns = require('dns').promises;

  try {
    const results = {
      domain,
      a: [],
      aaaa: [],
      cname: [],
      mx: [],
      ns: [],
      txt: []
    };

    try { results.a = await dns.resolve4(domain); } catch (e) {}
    try { results.aaaa = await dns.resolve6(domain); } catch (e) {}
    try { results.cname = await dns.resolveCname(domain); } catch (e) {}
    try { results.mx = await dns.resolveMx(domain); } catch (e) {}
    try { results.ns = await dns.resolveNs(domain); } catch (e) {}
    try { results.txt = await dns.resolveTxt(domain); } catch (e) {}

    res.json({ success: true, dns: results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// ⚙️ SETTINGS
// =====================================================

// Get settings
app.get('/api/admin/settings', verifyToken, requireAdmin, async (req, res) => {
  try {
    const [[settings]] = await pool.query('SELECT * FROM settings WHERE id = 1');
    // Hide sensitive tokens
    if (settings) {
      settings.telegram_bot_token = settings.telegram_bot_token ? '***hidden***' : null;
      settings.bet_api_key = settings.bet_api_key ? '***hidden***' : null;
    }
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update settings
app.put('/api/admin/settings', verifyToken, requireAdmin, async (req, res) => {
  const updates = req.body;

  try {
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      // Skip hidden placeholder values
      if (value === '***hidden***') continue;
      fields.push(`${key} = ?`);
      values.push(value);
    }

    if (fields.length > 0) {
      await pool.query(`UPDATE settings SET ${fields.join(', ')} WHERE id = 1`, values);
      await logActivity(req.user.id, 'Updated settings', 'update', 'settings', '1', null, req.ip);
    }

    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// 📱 TELEGRAM BOT INTEGRATION
// =====================================================

async function sendTelegramMessage(chatId, message, type, relatedKeyId = null, relatedUserId = null) {
  try {
    const [[settings]] = await pool.query('SELECT telegram_bot_token FROM settings WHERE id = 1');
    if (!settings?.telegram_bot_token) {
      console.log('Telegram bot token not configured');
      return false;
    }

    const response = await axios.post(
      `https://api.telegram.org/bot${settings.telegram_bot_token}/sendMessage`,
      {
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      },
      { timeout: 10000 }
    );

    // Log telegram message
    await pool.query(
      `INSERT INTO telegram_logs (type, recipient_id, message, message_id, status, related_api_key_id, related_user_id, sent_at)
       VALUES (?, ?, ?, ?, 'sent', ?, ?, NOW())`,
      [type, chatId, message, response.data?.result?.message_id, relatedKeyId, relatedUserId]
    );

    return true;
  } catch (err) {
    console.error('Telegram send error:', err.message);
    await pool.query(
      `INSERT INTO telegram_logs (type, recipient_id, message, status, error_message, related_api_key_id, related_user_id)
       VALUES (?, ?, ?, 'failed', ?, ?, ?)`,
      [type, chatId, message, err.message, relatedKeyId, relatedUserId]
    );
    return false;
  }
}

async function sendNewKeyNotification(apiKey, domain, validityDays, expiresAt, user, generatedBy) {
  const [[settings]] = await pool.query('SELECT admin_telegram_id FROM settings WHERE id = 1');
  const istExpiry = new Date(expiresAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const istNow = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  // Admin notification
  const adminMessage = `✅ 🆕 NEW API KEY GENERATED

╔══════════════════════════════════╗
║         📊 SYSTEM ALERT          ║
╚══════════════════════════════════╝

📋 Key Information:
├─ 🔑 API Key: ${apiKey}
├─ 🌐 Domain: ${domain}
├─ ⏰ Duration: ${validityDays} days
├─ 📅 Expires (IST): ${istExpiry}
├─ 👤 Client TG ID: ${user?.telegram_id || 'N/A'}
└─ 🛠️ Generated by: ${generatedBy}

📈 System Stats:
• New API key added to database
• Client notification sent
• Security checks passed

🕒 Time (IST): ${istNow}

Automated System Notification 🔔`;

  if (settings?.admin_telegram_id) {
    await sendTelegramMessage(settings.admin_telegram_id, adminMessage, 'new_key', null, user?.id);
  }

  // User notification
  if (user?.telegram_id) {
    const userMessage = `🎉 🚀 YOUR API KEY IS READY! 🚀

╔══════════════════════════════════╗
║        🔑 API KEY CREATED        ║
╚══════════════════════════════════╝

📋 Key Details:
├─ 🔑 API Key: ${apiKey}
├─ 🌐 Domain: ${domain}
├─ ⏰ Duration: ${validityDays} days
└─ 📅 Expires (IST): ${istExpiry}

💡 Usage Instructions:
• Use this key with your authorized domain
• Keep it secure and don't share publicly
• Monitor expiry dates for renewal

🛡️ Security Note:
This key is tied to your domain for security

⭐️ Need Help?
Contact support for assistance

Generated by Hyper API System 🌟`;

    await sendTelegramMessage(user.telegram_id, userMessage, 'new_key', null, user.id);
  }
}

async function sendLoginAlert(user, ip) {
  const [[settings]] = await pool.query('SELECT admin_telegram_id, login_alerts_enabled FROM settings WHERE id = 1');
  if (!settings?.login_alerts_enabled || !settings?.admin_telegram_id) return;

  const istNow = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const message = `🔐 👤 ADMIN LOGIN DETECTED

╔══════════════════════════════════╗
║       🚨 LOGIN ALERT             ║
╚══════════════════════════════════╝

📋 Login Details:
├─ 👤 User: ${user.username}
├─ 📧 Email: ${user.email}
├─ 🌐 IP: ${ip}
└─ 🕒 Time (IST): ${istNow}

🛡️ If this wasn't you, take immediate action!

Automated Security Alert 🔔`;

  await sendTelegramMessage(settings.admin_telegram_id, message, 'login_alert', null, user.id);
}

// Manual reminder endpoint
app.post('/api/admin/reminder', verifyToken, requireAdmin, async (req, res) => {
  const { api_key_id, message: customMessage } = req.body;

  try {
    const [[keyData]] = await pool.query(`
      SELECT ak.*, u.username, u.telegram_id as user_telegram_id
      FROM api_keys ak
      JOIN users u ON ak.user_id = u.id
      WHERE ak.id = ?
    `, [api_key_id]);

    if (!keyData) {
      return res.status(404).json({ success: false, error: 'API key not found' });
    }

    const [[settings]] = await pool.query('SELECT admin_telegram_id FROM settings WHERE id = 1');
    const daysLeft = Math.ceil((new Date(keyData.expires_at) - new Date()) / (1000 * 60 * 60 * 24));
    const istExpiry = new Date(keyData.expires_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const istNow = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    // Admin log message
    const adminMessage = `📤 📝 MANUAL REMINDER SENT

📋 Reminder Details:
├─ 🔑 API Key: ${keyData.api_key}
├─ 🌐 Domain: ${keyData.domain}
├─ 📅 Expires: ${istExpiry}
├─ ⏰ Days Left: ${daysLeft}
├─ 👤 Client TG ID: ${keyData.user_telegram_id || 'N/A'}
└─ 🛠️ Sent by: ${req.user.username}

🕒 Time: ${istNow}

Manual customer engagement 🎯`;

    if (settings?.admin_telegram_id) {
      await sendTelegramMessage(settings.admin_telegram_id, adminMessage, 'reminder', api_key_id, keyData.user_id);
    }

    // User reminder
    if (keyData.user_telegram_id) {
      const userMessage = `⏰ 🔔 API KEY EXPIRY REMINDER

╔══════════════════════════════════╗
║      ⚠️ RENEWAL REMINDER         ║
╚══════════════════════════════════╝

📋 Key Details:
├─ 🔑 API Key: ${keyData.api_key.substring(0, 30)}...
├─ 🌐 Domain: ${keyData.domain}
├─ 📅 Expires: ${istExpiry}
└─ ⏰ Days Left: ${daysLeft}

${customMessage ? `💬 Message: ${customMessage}\n` : ''}
🔄 Renew now to avoid service interruption!

Contact support for renewal assistance 📞`;

      await sendTelegramMessage(keyData.user_telegram_id, userMessage, 'reminder', api_key_id, keyData.user_id);
    }

    await logActivity(req.user.id, 'Sent manual reminder', 'send_reminder', 'api_keys', api_key_id, null, req.ip);

    res.json({ success: true, message: 'Reminder sent successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// 👤 USER ROUTES
// =====================================================

// Get user's own API keys
app.get('/api/user/keys', verifyToken, async (req, res) => {
  try {
    const [keys] = await pool.query(
      `SELECT id, api_key, game_type, duration, domain, expires_at, is_active, total_calls, last_used,
       DATEDIFF(expires_at, NOW()) as days_until_expiry
       FROM api_keys WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, keys });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Request renewal
app.post('/api/user/renewal-request', verifyToken, async (req, res) => {
  const { api_key_id, message } = req.body;

  try {
    // Verify key belongs to user
    const [[keyData]] = await pool.query(
      'SELECT * FROM api_keys WHERE id = ? AND user_id = ?',
      [api_key_id, req.user.id]
    );

    if (!keyData) {
      return res.status(404).json({ success: false, error: 'API key not found' });
    }

    // Create renewal request
    const id = uuidv4();
    await pool.query(
      'INSERT INTO renewal_requests (id, user_id, api_key_id, message) VALUES (?, ?, ?, ?)',
      [id, req.user.id, api_key_id, message || null]
    );

    // Get settings for admin notification
    const [[settings]] = await pool.query('SELECT admin_telegram_id FROM settings WHERE id = 1');
    const [[user]] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const istExpiry = new Date(keyData.expires_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    if (settings?.admin_telegram_id) {
      const adminMessage = `🔄 💳 RENEWAL REQUEST

╔══════════════════════════════════╗
║      🔔 RENEWAL REQUESTED        ║
╚══════════════════════════════════╝

📋 Request Details:
├─ 👤 User: ${user.username}
├─ 🔑 API Key: ${keyData.api_key.substring(0, 30)}...
├─ 🎮 Game Type: ${keyData.game_type.toUpperCase()}
├─ 📅 Current Expiry: ${istExpiry}
└─ 💬 Message: ${message || 'No message'}

Action Required! 📌`;

      await sendTelegramMessage(settings.admin_telegram_id, adminMessage, 'renewal_request', api_key_id, req.user.id);
    }

    res.json({ success: true, message: 'Renewal request submitted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get user's API logs
app.get('/api/user/logs', verifyToken, async (req, res) => {
  const { limit = 50 } = req.query;

  try {
    const [logs] = await pool.query(`
      SELECT al.*, ak.api_key, ak.game_type
      FROM api_logs al
      JOIN api_keys ak ON al.api_key_id = ak.id
      WHERE ak.user_id = ?
      ORDER BY al.created_at DESC
      LIMIT ?
    `, [req.user.id, parseInt(limit)]);

    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// 🏥 HEALTH CHECK
// =====================================================
app.get('/api/health', async (req, res) => {
  try {
    // Check database
    await pool.query('SELECT 1');
    
    // Check BetAPI (optional)
    let betApiStatus = 'unknown';
    try {
      await axios.get(`${BETAPI_BASE}/health`, { timeout: 5000 });
      betApiStatus = 'healthy';
    } catch (e) {
      betApiStatus = 'error';
    }

    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        betapi: betApiStatus
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: err.message
    });
  }
});

// =====================================================
// 🚀 START SERVER
// =====================================================
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════════╗
  ║                                                  ║
  ║   🚀 HYPER SOFTS TREND API SERVER               ║
  ║                                                  ║
  ║   Server running on port ${PORT}                    ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}               ║
  ║                                                  ║
  ╚══════════════════════════════════════════════════╝
  `);
});

module.exports = app;
