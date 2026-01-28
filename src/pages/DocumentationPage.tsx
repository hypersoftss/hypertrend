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
import { Moon, Sun, Zap, ArrowLeft, Copy, CheckCircle, Code, Globe, Shield, AlertTriangle, Server, Database, Key } from 'lucide-react';
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
  const API_ENDPOINT = config.userApiEndpoint;

  // Build full URL helper
  const buildUrl = (typeId: string) => `${API_BASE}${API_ENDPOINT}?typeId=${typeId}`;

  // All endpoints with actual URLs
  const allEndpoints = [
    { game: 'Numeric', typeId: '1', label: '1 Minute', url: buildUrl('1') },
    { game: 'Numeric', typeId: '2', label: '3 Minutes', url: buildUrl('2') },
    { game: 'Numeric', typeId: '3', label: '5 Minutes', url: buildUrl('3') },
    { game: 'Numeric', typeId: '30', label: '30 Minutes', url: buildUrl('30') },
    { game: 'WinGo', typeId: 'wg1', label: '1 Minute', url: buildUrl('wg1') },
    { game: 'WinGo', typeId: 'wg3', label: '3 Minutes', url: buildUrl('wg3') },
    { game: 'WinGo', typeId: 'wg5', label: '5 Minutes', url: buildUrl('wg5') },
    { game: 'WinGo', typeId: 'wg30', label: '30 Seconds', url: buildUrl('wg30') },
    { game: 'K3', typeId: 'k31', label: '1 Minute', url: buildUrl('k31') },
    { game: 'K3', typeId: 'k33', label: '3 Minutes', url: buildUrl('k33') },
    { game: 'K3', typeId: 'k35', label: '5 Minutes', url: buildUrl('k35') },
    { game: 'K3', typeId: 'k310', label: '10 Minutes', url: buildUrl('k310') },
    { game: '5D', typeId: '5d1', label: '1 Minute', url: buildUrl('5d1') },
    { game: '5D', typeId: '5d3', label: '3 Minutes', url: buildUrl('5d3') },
    { game: '5D', typeId: '5d5', label: '5 Minutes', url: buildUrl('5d5') },
    { game: '5D', typeId: '5d10', label: '10 Minutes', url: buildUrl('5d10') },
    { game: 'TRX', typeId: 'trx1', label: '1 Minute', url: buildUrl('trx1') },
    { game: 'TRX', typeId: 'trx3', label: '3 Minutes', url: buildUrl('trx3') },
    { game: 'TRX', typeId: 'trx5', label: '5 Minutes', url: buildUrl('trx5') },
    { game: 'TRX', typeId: 'trx10', label: '10 Minutes', url: buildUrl('trx10') },
  ];

  // Group by game
  const gameGroups = allEndpoints.reduce((acc, ep) => {
    if (!acc[ep.game]) acc[ep.game] = [];
    acc[ep.game].push(ep);
    return acc;
  }, {} as Record<string, typeof allEndpoints>);

  const codeExamples = {
    curl: `# Numeric 1-Minute
curl "${API_BASE}${API_ENDPOINT}?typeId=1"

# WinGo 30-Seconds
curl "${API_BASE}${API_ENDPOINT}?typeId=wg30"

# K3 3-Minutes
curl "${API_BASE}${API_ENDPOINT}?typeId=k33"

# 5D 5-Minutes
curl "${API_BASE}${API_ENDPOINT}?typeId=5d5"

# TRX 10-Minutes
curl "${API_BASE}${API_ENDPOINT}?typeId=trx10"`,
    
    javascript: `// JavaScript / Node.js Example
const BASE_URL = '${API_BASE}';
const ENDPOINT = '${API_ENDPOINT}';

async function getTrendData(typeId) {
  try {
    const response = await fetch(\`\${BASE_URL}\${ENDPOINT}?typeId=\${typeId}\`);
    if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Usage Examples
const numericData = await getTrendData('1');     // Numeric 1-min
const wingoData = await getTrendData('wg30');    // WinGo 30-sec
const k3Data = await getTrendData('k33');        // K3 3-min
const fiveDData = await getTrendData('5d5');     // 5D 5-min
const trxData = await getTrendData('trx10');     // TRX 10-min`,
    
    python: `# Python Example
import requests

BASE_URL = "${API_BASE}"
ENDPOINT = "${API_ENDPOINT}"

def get_trend_data(type_id):
    url = f"{BASE_URL}{ENDPOINT}?typeId={type_id}"
    response = requests.get(url)
    response.raise_for_status()
    return response.json()

# Usage Examples
numeric_1min = get_trend_data("1")      # Numeric 1-min
wingo_30sec = get_trend_data("wg30")    # WinGo 30-sec
k3_3min = get_trend_data("k33")         # K3 3-min
five_d_5min = get_trend_data("5d5")     # 5D 5-min
trx_10min = get_trend_data("trx10")     # TRX 10-min`,
    
    php: `<?php
// PHP Example
$baseUrl = "${API_BASE}";
$endpoint = "${API_ENDPOINT}";

function getTrendData($typeId) {
    global $baseUrl, $endpoint;
    $url = "$baseUrl$endpoint?typeId=$typeId";
    
    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_TIMEOUT, 30);
    
    $response = curl_exec($curl);
    curl_close($curl);
    
    return json_decode($response, true);
}

// Usage Examples
$numeric = getTrendData('1');      // Numeric 1-min
$wingo = getTrendData('wg30');     // WinGo 30-sec
$k3 = getTrendData('k33');         // K3 3-min
$fiveD = getTrendData('5d5');      // 5D 5-min
$trx = getTrendData('trx10');      // TRX 10-min
?>`,
  };

  const errorCodes = [
    { code: 200, message: 'Success', description: 'Request completed successfully', color: 'bg-success' },
    { code: 400, message: 'Bad Request', description: 'Invalid request parameters', color: 'bg-warning' },
    { code: 403, message: 'Forbidden', description: 'IP or domain not whitelisted', color: 'bg-destructive' },
    { code: 404, message: 'Not Found', description: 'Invalid typeId', color: 'bg-warning' },
    { code: 429, message: 'Too Many Requests', description: 'Rate limit exceeded', color: 'bg-warning' },
    { code: 500, message: 'Server Error', description: 'Internal server error', color: 'bg-destructive' },
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
            <Badge className="mb-4">v1.0</Badge>
            <h1 className="text-4xl font-bold text-foreground">{config.siteName} API</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {config.siteDescription} - Complete API documentation for Numeric, WinGo, K3, 5D, and TRX game trend data
            </p>
          </div>

          {/* Base URL - YOUR OWN API */}
          <Card className="gradient-primary text-primary-foreground overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Server className="w-8 h-8" />
                    <div>
                      <h2 className="text-xl font-bold">Your API Base URL</h2>
                      <code className="text-lg opacity-90">{API_BASE}{API_ENDPOINT}</code>
                    </div>
                  </div>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => copyCode(`${API_BASE}${API_ENDPOINT}`, 'baseurl')}
                  >
                    {copiedCode === 'baseurl' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="bg-primary-foreground/10 rounded-lg p-3 text-sm">
                  <p className="opacity-90">
                    📌 This is YOUR API endpoint. Users will call your server, which fetches and processes data securely.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Key & Authentication */}
          <Card className="border-2 border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" />
                API Key Authentication
              </CardTitle>
              <CardDescription>How to authenticate your API requests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 border">
                <h4 className="font-medium mb-3">Request Format</h4>
                <div className="relative">
                  <pre className="p-3 rounded bg-muted overflow-x-auto">
                    <code className="text-sm">{`GET ${API_BASE}${API_ENDPOINT}?typeId={typeId}&apiKey={YOUR_API_KEY}`}</code>
                  </pre>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute top-1 right-1"
                    onClick={() => copyCode(`${API_BASE}${API_ENDPOINT}?typeId=1&apiKey=YOUR_API_KEY`, 'format')}
                  >
                    {copiedCode === 'format' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border bg-card">
                  <h5 className="font-medium mb-2">Required Parameters</h5>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li><code className="text-primary">typeId</code> - Game type identifier</li>
                    <li><code className="text-primary">apiKey</code> - Your unique API key</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg border bg-card">
                  <h5 className="font-medium mb-2">Optional Headers</h5>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li><code className="text-primary">X-Api-Key</code> - Alternative to query param</li>
                    <li><code className="text-primary">Origin</code> - For domain verification</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* IP & Domain Whitelisting - DETAILED */}
          <Card className="border-2 border-warning/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-warning" />
                IP & Domain Whitelisting
              </CardTitle>
              <CardDescription>Security measures to protect your API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-5 h-5 text-accent-foreground" />
                    <h4 className="font-semibold">IP Whitelisting</h4>
                  </div>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>✅ Only whitelisted IPs can access API</li>
                    <li>✅ Supports both IPv4 and IPv6</li>
                    <li>✅ Multiple IPs per API key</li>
                    <li>✅ Real-time IP validation</li>
                  </ul>
                </div>
                
                <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-5 h-5 text-accent-foreground" />
                    <h4 className="font-semibold">Domain Whitelisting</h4>
                  </div>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>✅ Restrict to specific domains</li>
                    <li>✅ Origin header verification</li>
                    <li>✅ Subdomain support</li>
                    <li>✅ Prevents unauthorized use</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 border">
                <h4 className="font-medium mb-3">How It Works</h4>
                <ol className="text-sm space-y-2 text-muted-foreground list-decimal list-inside">
                  <li>Admin creates API key and sets allowed IPs/domains</li>
                  <li>When request comes in, server checks IP against whitelist</li>
                  <li>If IP not in list → <Badge variant="destructive" className="text-xs">403 Forbidden</Badge></li>
                  <li>Domain from Origin header is also verified</li>
                  <li>Only requests passing both checks are processed</li>
                </ol>
              </div>

              <div className="flex items-start gap-2 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Important</p>
                  <p className="text-sm text-muted-foreground">
                    API calls from non-whitelisted IPs will be rejected with 403 error. 
                    Contact admin to add your server IP to the whitelist.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* All Endpoints - Inline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                All API Endpoints
              </CardTitle>
              <CardDescription>Complete list of all available endpoints with direct URLs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(gameGroups).map(([game, endpoints]) => (
                <div key={game} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className="text-sm px-3 py-1">{game}</Badge>
                    <span className="text-sm text-muted-foreground">({endpoints.length} endpoints)</span>
                  </div>
                  <div className="grid gap-2">
                    {endpoints.map((ep) => (
                      <div 
                        key={ep.typeId} 
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border hover:border-primary/50 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="font-mono">{ep.typeId}</Badge>
                          <span className="text-sm text-muted-foreground">{ep.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="text-xs text-primary font-mono hidden sm:block">{ep.url}</code>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => copyCode(ep.url, ep.typeId)}
                          >
                            {copiedCode === ep.typeId ? (
                              <CheckCircle className="w-4 h-4 text-success" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Code Examples */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5 text-primary" />
                Code Examples
              </CardTitle>
              <CardDescription>Ready-to-use code with API key authentication</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="curl">
                <TabsList className="mb-4 w-full justify-start">
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="php">PHP</TabsTrigger>
                </TabsList>
                {Object.entries(codeExamples).map(([lang, code]) => (
                  <TabsContent key={lang} value={lang}>
                    <div className="relative">
                      <pre className="p-4 rounded-lg bg-muted overflow-x-auto">
                        <code className="text-sm text-foreground whitespace-pre">{code}</code>
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
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-primary" />
                Response Codes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {errorCodes.map((err) => (
                  <div key={err.code} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                    <Badge className={`${err.color} text-white min-w-[60px] justify-center`}>
                      {err.code}
                    </Badge>
                    <div className="flex-1">
                      <span className="font-medium">{err.message}</span>
                      <span className="text-muted-foreground ml-2 text-sm">— {err.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Support Section */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <h4 className="font-medium mb-2">📧 Support Email</h4>
                  <a href={`mailto:${config.supportEmail}`} className="text-primary hover:underline">
                    {config.supportEmail}
                  </a>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <h4 className="font-medium mb-2">📧 Admin Contact</h4>
                  <a href={`mailto:${config.adminEmail}`} className="text-primary hover:underline">
                    {config.adminEmail}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center py-8 text-muted-foreground">
            <p>© {new Date().getFullYear()} {config.siteName}. All rights reserved.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DocumentationPage;
