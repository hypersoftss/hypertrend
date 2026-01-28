import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useConfig } from '@/contexts/ConfigContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { Moon, Sun, Zap, ArrowLeft, Copy, CheckCircle, Code, Globe, Shield, AlertTriangle, Server, Database, Key, Download, FileText, Rocket, Terminal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DocumentationPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { config } = useConfig();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast({ title: '📋 Copied!', description: 'Code copied to clipboard' });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Use USER-FACING API config (what merchants see - NOT the internal source)
  const API_BASE = config.userApiDomain;

  // PHP Endpoints - Clean and simple
  const phpEndpoints = [
    { 
      game: 'WinGo', 
      endpoint: '/api/wingo.php',
      durations: ['30s', '1min', '3min', '5min'],
      description: 'WinGo lottery trend data'
    },
    { 
      game: 'K3', 
      endpoint: '/api/k3.php',
      durations: ['1min', '3min', '5min', '10min'],
      description: 'K3 dice game trend data'
    },
    { 
      game: '5D', 
      endpoint: '/api/5d.php',
      durations: ['1min', '3min', '5min', '10min'],
      description: '5D lottery trend data'
    },
    { 
      game: 'TRX', 
      endpoint: '/api/trx.php',
      durations: ['1min', '3min', '5min'],
      description: 'TRX blockchain game trend data'
    },
    { 
      game: 'Numeric', 
      endpoint: '/api/numeric.php',
      durations: ['1min', '3min', '5min'],
      description: 'Numeric lottery trend data'
    },
  ];

  const codeExamples = {
    curl: `# WinGo 1 Minute
curl "${API_BASE}/api/wingo.php?api_key=YOUR_KEY&duration=1min"

# WinGo 30 Seconds
curl "${API_BASE}/api/wingo.php?api_key=YOUR_KEY&duration=30s"

# K3 3 Minutes
curl "${API_BASE}/api/k3.php?api_key=YOUR_KEY&duration=3min"

# 5D 5 Minutes
curl "${API_BASE}/api/5d.php?api_key=YOUR_KEY&duration=5min"

# TRX 1 Minute
curl "${API_BASE}/api/trx.php?api_key=YOUR_KEY&duration=1min"

# Numeric 3 Minutes
curl "${API_BASE}/api/numeric.php?api_key=YOUR_KEY&duration=3min"

# Health Check (No API key needed)
curl "${API_BASE}/api/health.php"`,
    
    javascript: `// JavaScript / Node.js Example
const API_BASE = '${API_BASE}';
const API_KEY = 'YOUR_API_KEY';

async function getTrendData(game, duration) {
  try {
    const url = \`\${API_BASE}/api/\${game}.php?api_key=\${API_KEY}&duration=\${duration}\`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(\`HTTP \${response.status}\`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Usage Examples
const wingoData = await getTrendData('wingo', '1min');
const k3Data = await getTrendData('k3', '3min');
const fiveDData = await getTrendData('5d', '5min');
const trxData = await getTrendData('trx', '1min');
const numericData = await getTrendData('numeric', '3min');

console.log(wingoData);`,
    
    python: `# Python Example
import requests

API_BASE = "${API_BASE}"
API_KEY = "YOUR_API_KEY"

def get_trend_data(game, duration):
    url = f"{API_BASE}/api/{game}.php"
    params = {
        "api_key": API_KEY,
        "duration": duration
    }
    
    response = requests.get(url, params=params)
    response.raise_for_status()
    return response.json()

# Usage Examples
wingo_data = get_trend_data("wingo", "1min")
k3_data = get_trend_data("k3", "3min")
five_d_data = get_trend_data("5d", "5min")
trx_data = get_trend_data("trx", "1min")
numeric_data = get_trend_data("numeric", "3min")

print(wingo_data)`,
    
    php: `<?php
// PHP Example
$apiBase = "${API_BASE}";
$apiKey = "YOUR_API_KEY";

function getTrendData($game, $duration) {
    global $apiBase, $apiKey;
    
    $url = "$apiBase/api/$game.php?api_key=$apiKey&duration=$duration";
    
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_SSL_VERIFYPEER => true
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        throw new Exception("HTTP Error: $httpCode");
    }
    
    return json_decode($response, true);
}

// Usage Examples
$wingoData = getTrendData('wingo', '1min');
$k3Data = getTrendData('k3', '3min');
$fiveDData = getTrendData('5d', '5min');
$trxData = getTrendData('trx', '1min');

print_r($wingoData);
?>`,
  };

  const errorCodes = [
    { code: 200, message: 'Success', description: 'Request completed successfully', color: 'bg-green-500' },
    { code: 400, message: 'Bad Request', description: 'Invalid duration or missing parameters', color: 'bg-yellow-500' },
    { code: 401, message: 'Unauthorized', description: 'Invalid or missing API key', color: 'bg-red-500' },
    { code: 403, message: 'Forbidden', description: 'IP or domain not whitelisted, or key expired', color: 'bg-red-500' },
    { code: 429, message: 'Too Many Requests', description: 'Rate limit exceeded', color: 'bg-yellow-500' },
    { code: 502, message: 'Bad Gateway', description: 'Data source temporarily unavailable', color: 'bg-red-500' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <span className="font-bold text-foreground">{config.siteName}</span>
                <span className="text-muted-foreground ml-2 text-sm">API Documentation</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              👤 {user?.username}
            </Badge>
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Hero */}
          <div className="text-center space-y-4">
            <Badge className="mb-4">PHP API v2.0</Badge>
            <h1 className="text-4xl font-bold text-foreground">{config.siteName} API</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {config.siteDescription} - Simple PHP-based API with separate endpoints for each game type
            </p>
            
            {/* Quick Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3 pt-4">
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => {
                  const docsContent = `# ${config.siteName} API Documentation\n\nBase URL: ${API_BASE}/api/\n\n## Endpoints\n\n${phpEndpoints.map(ep => `### ${ep.game}\n- Endpoint: ${ep.endpoint}\n- Durations: ${ep.durations.join(', ')}\n- Description: ${ep.description}`).join('\n\n')}\n\n## Code Examples\n\n### cURL\n${codeExamples.curl}\n\n### JavaScript\n${codeExamples.javascript}\n\n### Python\n${codeExamples.python}\n\n### PHP\n${codeExamples.php}`;
                  const blob = new Blob([docsContent], { type: 'text/markdown' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${config.siteName.replace(/\s+/g, '-').toLowerCase()}-api-docs.md`;
                  a.click();
                  URL.revokeObjectURL(url);
                  toast({ title: '📥 Downloaded!', description: 'API documentation saved as Markdown file' });
                }}
              >
                <Download className="w-4 h-4" />
                Download Docs
              </Button>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => copyCode(`${API_BASE}/api/`, 'baseurl-hero')}
              >
                {copiedCode === 'baseurl-hero' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                Copy Base URL
              </Button>
            </div>
          </div>

          {/* Base URL Card */}
          <Card className="gradient-primary text-primary-foreground overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Server className="w-8 h-8" />
                    <div>
                      <h2 className="text-xl font-bold">Your API Base URL</h2>
                      <code className="text-lg opacity-90">{API_BASE}/api/</code>
                    </div>
                  </div>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => copyCode(`${API_BASE}/api/`, 'baseurl')}
                  >
                    {copiedCode === 'baseurl' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="bg-primary-foreground/10 rounded-lg p-3 text-sm">
                  <p className="opacity-90">
                    📌 This is YOUR API. The actual data source is hidden - users only see your domain.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Start */}
          <Card className="border-2 border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Quick Start
              </CardTitle>
              <CardDescription>Get started in seconds with these simple endpoints</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 border">
                <h4 className="font-medium mb-3">Request Format</h4>
                <div className="relative">
                  <pre className="p-3 rounded bg-muted overflow-x-auto">
                    <code className="text-sm">GET {API_BASE}/api/[game].php?api_key=YOUR_KEY&duration=1min</code>
                  </pre>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border bg-card">
                  <h5 className="font-medium mb-2 flex items-center gap-2">
                    <Key className="w-4 h-4 text-primary" />
                    Required Parameters
                  </h5>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li><code className="text-primary">api_key</code> - Your unique API key</li>
                    <li><code className="text-primary">duration</code> - Time duration (1min, 3min, etc.)</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg border bg-card">
                  <h5 className="font-medium mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" />
                    Available Games
                  </h5>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li><code className="text-primary">wingo.php</code> - WinGo Lottery</li>
                    <li><code className="text-primary">k3.php</code> - K3 Dice</li>
                    <li><code className="text-primary">5d.php, trx.php, numeric.php</code></li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* All Endpoints */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                All API Endpoints
              </CardTitle>
              <CardDescription>Complete list with all available durations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {phpEndpoints.map((ep) => (
                <div key={ep.game} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="text-sm px-3 py-1">{ep.game}</Badge>
                      <span className="text-sm text-muted-foreground">{ep.description}</span>
                    </div>
                    <code className="text-xs text-primary font-mono">{ep.endpoint}</code>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {ep.durations.map((d) => {
                      const url = `${API_BASE}${ep.endpoint}?api_key=YOUR_KEY&duration=${d}`;
                      return (
                        <div 
                          key={`${ep.game}-${d}`}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border hover:border-primary/50 transition-colors group"
                        >
                          <Badge variant="secondary" className="font-mono">{d}</Badge>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => copyCode(url, `${ep.game}-${d}`)}
                          >
                            {copiedCode === `${ep.game}-${d}` ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Health Check */}
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Health Check Endpoint
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      No API key required - check server status
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyCode(`${API_BASE}/api/health.php`, 'health')}
                  >
                    {copiedCode === 'health' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span className="ml-2 font-mono text-xs">/api/health.php</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Response Format */}
          <Card>
            <CardHeader>
              <CardTitle>Response Format</CardTitle>
              <CardDescription>All endpoints return JSON with this structure</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="p-4 rounded-lg bg-muted overflow-x-auto text-sm">
{`{
  "success": true,
  "game": "wingo",
  "duration": "1min",
  "game_name": "WinGo 1 Minute",
  "data": {
    // Trend data here
  },
  "meta": {
    "response_time_ms": 45,
    "timestamp": "2024-01-15T10:30:00+00:00",
    "powered_by": "${config.siteName} Trend API"
  }
}`}
              </pre>
            </CardContent>
          </Card>

          {/* Security Info */}
          <Card className="border-2 border-yellow-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-yellow-500" />
                Security & Whitelisting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <h4 className="font-semibold mb-2">✅ IP Whitelisting</h4>
                  <p className="text-sm text-muted-foreground">
                    Only whitelisted IPs can access the API. Contact admin to add your server IP.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <h4 className="font-semibold mb-2">✅ Domain Whitelisting</h4>
                  <p className="text-sm text-muted-foreground">
                    Requests are verified against allowed domains set in your API key.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Important Security Notice</p>
                    <p className="text-sm text-muted-foreground">
                      API calls from non-whitelisted IPs/domains will be rejected with 403 error.
                      Ensure your server IP is whitelisted before integration.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Code Examples */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5 text-primary" />
                Code Examples
              </CardTitle>
              <CardDescription>Ready-to-use code snippets in multiple languages</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="curl" className="space-y-4">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="php">PHP</TabsTrigger>
                </TabsList>
                
                {Object.entries(codeExamples).map(([lang, code]) => (
                  <TabsContent key={lang} value={lang}>
                    <div className="relative">
                      <pre className="p-4 rounded-lg bg-muted overflow-x-auto text-sm max-h-96">
                        <code>{code}</code>
                      </pre>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="absolute top-2 right-2"
                        onClick={() => copyCode(code, lang)}
                      >
                        {copiedCode === lang ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* Error Codes */}
          <Card>
            <CardHeader>
              <CardTitle>Error Codes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {errorCodes.map((err) => (
                  <div key={err.code} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                    <Badge className={`${err.color} text-white min-w-16 justify-center`}>
                      {err.code}
                    </Badge>
                    <div>
                      <span className="font-medium">{err.message}</span>
                      <span className="text-muted-foreground ml-2">— {err.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Setup Guide */}
          <Card className="border-2 border-accent/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-accent" />
                Quick Setup Guide
              </CardTitle>
              <CardDescription>Get started in 3 simple steps</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <h4 className="font-semibold">Get Your API Key</h4>
                  <p className="text-sm text-muted-foreground">
                    Contact admin or request a key from your dashboard. Each key has specific game permissions.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <h4 className="font-semibold">Whitelist Your IP</h4>
                  <p className="text-sm text-muted-foreground">
                    Ensure your server IP is whitelisted. Requests from non-whitelisted IPs will be rejected.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <h4 className="font-semibold">Make API Calls</h4>
                  <p className="text-sm text-muted-foreground">
                    Use the code examples below. Pass your API key and desired duration for each request.
                  </p>
                </div>
              </div>
              
              {/* Sample Request */}
              <div className="mt-6 p-4 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-2 mb-3">
                  <Terminal className="w-4 h-4 text-primary" />
                  <span className="font-medium">Sample Request</span>
                </div>
                <div className="relative">
                  <pre className="p-3 rounded bg-muted overflow-x-auto text-sm">
                    <code>curl "{API_BASE}/api/wingo.php?api_key=YOUR_KEY&duration=1min"</code>
                  </pre>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute top-1 right-1"
                    onClick={() => copyCode(`curl "${API_BASE}/api/wingo.php?api_key=YOUR_KEY&duration=1min"`, 'sample-curl')}
                  >
                    {copiedCode === 'sample-curl' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support - Enhanced */}
          <Card className="gradient-primary text-primary-foreground overflow-hidden">
            <CardContent className="py-8">
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold">Need Help?</h3>
                <p className="opacity-90 max-w-lg mx-auto">
                  Our support team is here to help you integrate and troubleshoot any issues with the API.
                </p>
                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <Button 
                    variant="secondary" 
                    className="gap-2"
                    onClick={() => window.location.href = `mailto:${config.supportEmail}`}
                  >
                    <FileText className="w-4 h-4" />
                    Email Support
                  </Button>
                  <Button 
                    variant="outline" 
                    className="gap-2 bg-primary-foreground/10 border-primary-foreground/30 hover:bg-primary-foreground/20"
                    onClick={() => {
                      const docsContent = `# ${config.siteName} API Documentation\n\nBase URL: ${API_BASE}/api/\n\n## Endpoints\n\n${phpEndpoints.map(ep => `### ${ep.game}\n- Endpoint: ${ep.endpoint}\n- Durations: ${ep.durations.join(', ')}\n- Description: ${ep.description}`).join('\n\n')}\n\n## Code Examples\n\n### cURL\n${codeExamples.curl}\n\n### JavaScript\n${codeExamples.javascript}\n\n### Python\n${codeExamples.python}\n\n### PHP\n${codeExamples.php}`;
                      const blob = new Blob([docsContent], { type: 'text/markdown' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${config.siteName.replace(/\s+/g, '-').toLowerCase()}-api-docs.md`;
                      a.click();
                      URL.revokeObjectURL(url);
                      toast({ title: '📥 Downloaded!', description: 'Complete API documentation saved' });
                    }}
                  >
                    <Download className="w-4 h-4" />
                    Download Full Docs
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DocumentationPage;
