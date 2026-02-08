import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useConfig } from '@/contexts/ConfigContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Moon, Sun, Zap, ArrowLeft, Copy, CheckCircle, Code, Globe, Shield, 
  AlertTriangle, Server, Database, Key, Download, FileText, Rocket, 
  Terminal, Clock, Activity, ChevronRight, BookOpen, Layers, Lock, 
  ExternalLink, Play, Hash
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DocumentationPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { config } = useConfig();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('getting-started');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast({ title: '📋 Copied!', description: 'Code copied to clipboard' });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const API_BASE = config.userApiDomain;
  const API_ENDPOINT = config.userApiEndpoint || '/api/trend';
  const FULL_API_URL = `${API_BASE}${API_ENDPOINT}`;

  // TypeId mapping for each game and duration
  const typeIdMap: Record<string, Record<string, string>> = {
    'WinGo': { '30s': 'wg30s', '1min': 'wg1', '3min': 'wg3', '5min': 'wg5' },
    'K3': { '1min': 'k31', '3min': 'k33', '5min': 'k35', '10min': 'k310' },
    '5D': { '1min': '5d1', '3min': '5d3', '5min': '5d5', '10min': '5d10' },
    'TRX': { '1min': 'trx1', '3min': 'trx3', '5min': 'trx5', '10min': 'trx10' },
  };

  // Hyper Softs (Hypersofts) - Same Trend API Endpoints by Hyper Developer (Hyperdeveloper)
  // Best prediction API for India - Wingo API, K3 API, 5D API, TRX API, Numeric API
  const endpoints = [
    { 
      game: 'WinGo', 
      typeIds: typeIdMap['WinGo'],
      durations: ['30s', '1min', '3min', '5min'],
      description: 'Hyper Softs WinGo Same Trend API - Best Wingo prediction by Hyper Developer',
      color: 'bg-purple-500'
    },
    { 
      game: 'K3', 
      typeIds: typeIdMap['K3'],
      durations: ['1min', '3min', '5min', '10min'],
      description: 'Hypersofts K3 Dice Same Trend API - Professional K3 trends by Hyperdeveloper',
      color: 'bg-blue-500'
    },
    { 
      game: '5D', 
      typeIds: typeIdMap['5D'],
      durations: ['1min', '3min', '5min', '10min'],
      description: 'Hyper Softs 5D Lottery Same Trend API - Accurate 5D data by Hyper Developer',
      color: 'bg-green-500'
    },
    { 
      game: 'TRX', 
      typeIds: typeIdMap['TRX'],
      durations: ['1min', '3min', '5min', '10min'],
      description: 'Hypersofts TRX Blockchain Same Trend API - TRX predictions by Hyperdeveloper',
      color: 'bg-orange-500'
    },
  ];

  const codeExamples = {
    curl: `# WinGo 1 Min API Call
curl -X GET "${FULL_API_URL}?typeId=wg1&apiKey=YOUR_KEY"

# K3 3 Min API Call
curl -X GET "${FULL_API_URL}?typeId=k33&apiKey=YOUR_KEY"

# 5D 5 Min API Call
curl -X GET "${FULL_API_URL}?typeId=5d5&apiKey=YOUR_KEY"`,
    
    javascript: `// Fetch Trend Data
const API_KEY = 'your_api_key_here';
const API_URL = '${FULL_API_URL}';

async function getTrend(typeId) {
  const url = \`\${API_URL}?typeId=\${typeId}&apiKey=\${API_KEY}\`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
  }
  
  return response.json();
}

// Usage Examples - TypeId Reference:
// WinGo: wg30s, wg1, wg3, wg5
// K3: k31, k33, k35, k310
// 5D: 5d1, 5d3, 5d5, 5d10
// TRX: trx1, trx3, trx5, trx10

// Response is direct upstream data (no wrapper)
const wingo = await getTrend('wg1');
console.log('WinGo 1min Period:', wingo.period);
console.log('WinGo 1min Number:', wingo.number);

const k3 = await getTrend('k33');
console.log('K3 3min Data:', k3);`,
    
    python: `import requests

API_KEY = "your_api_key_here"
API_URL = "${FULL_API_URL}"

def get_trend(type_id: str) -> dict:
    """Fetch trend data from API"""
    params = {"typeId": type_id, "apiKey": API_KEY}
    
    response = requests.get(API_URL, params=params)
    response.raise_for_status()
    return response.json()

# TypeId Reference:
# WinGo: wg30s, wg1, wg3, wg5
# K3: k31, k33, k35, k310
# 5D: 5d1, 5d3, 5d5, 5d10
# TRX: trx1, trx3, trx5, trx10

# Response is direct upstream data (no wrapper)
wingo = get_trend("wg1")
print(f"WinGo 1min Period: {wingo['period']}")
print(f"WinGo 1min Number: {wingo['number']}")

k3 = get_trend("k33")
print(f"K3 3min Data: {k3}")`,
    
    php: `<?php
$API_KEY = "your_api_key_here";
$API_URL = "${FULL_API_URL}";

function getTrend($typeId) {
    global $API_KEY, $API_URL;
    
    $url = $API_URL . "?" . http_build_query([
        'typeId' => $typeId,
        'apiKey' => $API_KEY
    ]);
    
    $response = file_get_contents($url);
    if ($response === false) {
        throw new Exception("API request failed");
    }
    
    return json_decode($response, true);
}

// TypeId Reference:
// WinGo: wg30s, wg1, wg3, wg5
// K3: k31, k33, k35, k310
// 5D: 5d1, 5d3, 5d5, 5d10
// TRX: trx1, trx3, trx5, trx10

// Response is direct upstream data (no wrapper)
$wingo = getTrend("wg1");
echo "WinGo 1min Period: " . $wingo['period'];
echo "WinGo 1min Number: " . $wingo['number'];

$k3 = getTrend("k33");
print_r($k3);
?>`,
  };
  const errorCodes = [
    { code: 200, status: 'success', message: 'OK', description: 'Request completed successfully', color: 'bg-success' },
    { code: 400, status: 'error', message: 'Bad Request', description: 'Invalid duration or missing parameters', color: 'bg-warning' },
    { code: 401, status: 'error', message: 'Unauthorized', description: 'Invalid or missing API key', color: 'bg-destructive' },
    { code: 403, status: 'error', message: 'Forbidden', description: 'IP/Domain not whitelisted or key expired', color: 'bg-destructive' },
    { code: 429, status: 'error', message: 'Rate Limited', description: 'Too many requests, slow down', color: 'bg-warning' },
    { code: 502, status: 'error', message: 'Bad Gateway', description: 'Upstream data source unavailable', color: 'bg-destructive' },
  ];

  const sidebarItems = [
    { id: 'getting-started', label: 'Getting Started', icon: Rocket },
    { id: 'authentication', label: 'Authentication', icon: Key },
    { id: 'endpoints', label: 'API Endpoints', icon: Database },
    { id: 'code-examples', label: 'Code Examples', icon: Code },
    { id: 'response-format', label: 'Response Format', icon: FileText },
    { id: 'error-codes', label: 'Error Codes', icon: AlertTriangle },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'rate-limits', label: 'Rate Limits', icon: Clock },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg gradient-primary flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-foreground text-sm">{config.siteName}</span>
                <span className="text-muted-foreground ml-2 text-xs">API Docs</span>
              </div>
              <span className="sm:hidden font-bold text-foreground text-sm">API Docs</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] sm:text-xs hidden sm:flex">
              v2.0
            </Badge>
            <Badge variant="outline" className="text-[10px] sm:text-xs">
              {user?.username}
            </Badge>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="flex gap-6">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-20">
              <nav className="space-y-1">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                      activeSection === item.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </nav>
              
              <div className="mt-6 p-3 rounded-lg bg-muted/50 border">
                <p className="text-xs text-muted-foreground mb-2">API Endpoint</p>
                <code className="text-[10px] sm:text-xs text-primary break-all">{FULL_API_URL}</code>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 max-w-4xl space-y-8 pb-8">
            {/* Hero - SEO Optimized for Hyper Softs, Hypersofts, Hyper Developer */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="gradient-primary text-white">API v2.0</Badge>
                <Badge variant="outline" className="text-xs">Hyper Softs Edge Functions</Badge>
                <Badge variant="outline" className="text-xs">Hyperdeveloper API</Badge>
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold text-foreground">
                Hyper Softs Same Trend API Documentation
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Complete Hypersofts API documentation by Hyper Developer for integrating same trend prediction data. 
                Best REST API for Wingo, K3, 5D, TRX games in India. Professional Hyperdeveloper endpoints with JSON responses.
              </p>
              
              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 pt-2">
                <Button size="sm" className="gap-2 text-xs" onClick={() => copyCode(FULL_API_URL, 'base-url')}>
                  {copiedCode === 'base-url' ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  Copy Hyper Softs API URL
                </Button>
                <Button variant="outline" size="sm" className="gap-2 text-xs">
                  <Download className="w-3 h-3" />
                  Download Hypersofts Docs
                </Button>
              </div>
            </div>

            {/* Getting Started - Hyper Softs API Integration Guide */}
            <section id="getting-started">
              <Card className="glass">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Rocket className="w-5 h-5 text-primary" />
                    Getting Started with Hyper Softs API
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Quick setup guide to start using Hypersofts Same Trend API by Hyper Developer
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { step: 1, title: 'Get Hyper Softs Key', desc: 'Request API key from Hyperdeveloper admin with game permissions' },
                      { step: 2, title: 'Whitelist IP', desc: 'Add your server IP to Hypersofts whitelist for secure access' },
                      { step: 3, title: 'Call Trend API', desc: 'Make requests to Hyper Softs endpoints for Wingo, K3, 5D, TRX trends' },
                    ].map((item) => (
                      <div key={item.step} className="p-3 rounded-lg bg-muted/30 border">
                        <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center mb-2">
                          <span className="text-white text-xs font-bold">{item.step}</span>
                        </div>
                        <h4 className="font-medium text-sm mb-1">{item.title}</h4>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Terminal className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Quick Test - Hyper Softs Wingo API</span>
                    </div>
                    <div className="relative">
                      <pre className="p-2 rounded bg-muted overflow-x-auto text-xs">
                        <code>curl "{FULL_API_URL}?typeId=wg1&apiKey=YOUR_HYPERSOFTS_KEY"</code>
                      </pre>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                        onClick={() => copyCode(`curl "${FULL_API_URL}?typeId=wg1&apiKey=YOUR_HYPERSOFTS_KEY"`, 'quick-test')}
                      >
                        {copiedCode === 'quick-test' ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Authentication */}
            <section id="authentication">
              <Card className="glass">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Key className="w-5 h-5 text-primary" />
                    Authentication
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">How to authenticate your API requests</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg border bg-muted/20">
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <Hash className="w-4 h-4 text-primary" />
                        Query Parameter
                      </h4>
                      <code className="text-xs text-muted-foreground">?api_key=YOUR_API_KEY</code>
                    </div>
                    <div className="p-3 rounded-lg border bg-muted/20">
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-primary" />
                        Header (Alternative)
                      </h4>
                      <code className="text-xs text-muted-foreground">X-API-Key: YOUR_API_KEY</code>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
                    <div className="flex items-start gap-2">
                      <Lock className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium">API Key Security</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Never expose your API key in client-side code. Always make API calls from your backend server.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Endpoints */}
            <section id="endpoints">
              <Card className="glass">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Database className="w-5 h-5 text-primary" />
                    API Endpoints
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">All available game endpoints and durations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Accordion type="single" collapsible className="w-full">
                    {endpoints.map((ep) => (
                      <AccordionItem key={ep.game} value={ep.game} className="border rounded-lg mb-2 px-3">
                        <AccordionTrigger className="hover:no-underline py-3">
                          <div className="flex items-center gap-3">
                            <Badge className={`${ep.color} text-white text-xs`}>{ep.game}</Badge>
                            <span className="text-sm">{ep.description}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-3">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <code className="text-xs bg-muted px-2 py-1 rounded">{API_ENDPOINT}</code>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 w-6 p-0"
                                onClick={() => copyCode(FULL_API_URL, `ep-${ep.game}`)}
                              >
                                {copiedCode === `ep-${ep.game}` ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                              </Button>
                            </div>
                            <div className="space-y-2">
                              <p className="text-xs text-muted-foreground">TypeIds:</p>
                              <div className="flex flex-wrap gap-2">
                                {ep.durations.map((d) => (
                                  <Badge key={d} variant="outline" className="text-xs font-mono gap-1">
                                    {d} → {ep.typeIds[d]}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="relative">
                              <pre className="p-2 rounded bg-muted overflow-x-auto text-[10px] sm:text-xs">
                                <code>{`GET ${FULL_API_URL}?typeId=${ep.typeIds[ep.durations[0]]}&apiKey=KEY`}</code>
                              </pre>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="absolute top-1 right-1 h-5 w-5 p-0"
                                onClick={() => copyCode(`${FULL_API_URL}?typeId=${ep.typeIds[ep.durations[0]]}&apiKey=YOUR_KEY`, `full-${ep.game}`)}
                              >
                                {copiedCode === `full-${ep.game}` ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                              </Button>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>

                  {/* Health Check */}
                  <div className="p-3 rounded-lg bg-success/10 border border-success/30">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-success" />
                        <span className="text-sm font-medium">Health Check</span>
                        <Badge variant="outline" className="text-[10px]">No Auth</Badge>
                      </div>
                      <code className="text-xs font-mono text-success">/health</code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Code Examples */}
            <section id="code-examples">
              <Card className="glass">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Code className="w-5 h-5 text-primary" />
                    Code Examples
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Ready-to-use code snippets in popular languages</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="curl" className="space-y-3">
                    <TabsList className="w-full grid grid-cols-4 h-9">
                      <TabsTrigger value="curl" className="text-xs">cURL</TabsTrigger>
                      <TabsTrigger value="javascript" className="text-xs">JS</TabsTrigger>
                      <TabsTrigger value="python" className="text-xs">Python</TabsTrigger>
                      <TabsTrigger value="php" className="text-xs">PHP</TabsTrigger>
                    </TabsList>
                    
                    {Object.entries(codeExamples).map(([lang, code]) => (
                      <TabsContent key={lang} value={lang}>
                        <div className="relative">
                          <ScrollArea className="h-[250px] sm:h-[300px] rounded-lg border">
                            <pre className="p-3 text-[10px] sm:text-xs">
                              <code className="language-{lang}">{code}</code>
                            </pre>
                          </ScrollArea>
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="absolute top-2 right-2 h-7 text-xs gap-1"
                            onClick={() => copyCode(code, `code-${lang}`)}
                          >
                            {copiedCode === `code-${lang}` ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            Copy
                          </Button>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            </section>

            {/* Response Format */}
            <section id="response-format">
              <Card className="glass">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="w-5 h-5 text-primary" />
                    Response Format
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Direct upstream JSON response (same as original API)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 rounded-lg bg-success/10 border border-success/30">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Direct Pass-Through Response</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          API returns the exact same response as the upstream source - no wrapper, no modifications. Just pure data!
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <ScrollArea className="h-[250px] rounded-lg border">
                      <pre className="p-3 text-[10px] sm:text-xs">
                        <code>{`// Success Response (HTTP 200)
// Returns upstream data directly - same format as original API
{
  "period": "20240128001234",
  "number": 5,
  "colour": "green", 
  "big_small": "small",
  // ... exact upstream data fields
}

// Error Response (HTTP 4xx/5xx)
{
  "success": false,
  "error": "IP not authorized",
  "message": "⚠️ Your IP is not whitelisted! Please contact admin on Telegram: ${config.adminTelegramUsername || '@Hyperdeveloperr'}",
  "your_ip": "123.45.67.89",
  "contact_admin_telegram": "${config.adminTelegramUsername || '@Hyperdeveloperr'}"
}`}</code>
                      </pre>
                    </ScrollArea>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="absolute top-2 right-2 h-7 text-xs gap-1"
                      onClick={() => copyCode(`{"period":"20240128001234","number":5,"colour":"green","big_small":"small"}`, 'response')}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg border bg-muted/20">
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-success" />
                        Success (200)
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Direct upstream JSON - no wrapper. Parse directly as your data!
                      </p>
                    </div>
                    <div className="p-3 rounded-lg border bg-muted/20">
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-warning" />
                        Error (4xx/5xx)
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Includes your_ip, error message, and admin contact for support.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Error Codes */}
            <section id="error-codes">
              <Card className="glass">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertTriangle className="w-5 h-5 text-primary" />
                    Error Codes
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">HTTP status codes and their meanings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {errorCodes.map((err) => (
                      <div key={err.code} className="flex items-center gap-3 p-2 sm:p-3 rounded-lg bg-muted/30 border">
                        <Badge className={`${err.color} text-white text-xs min-w-[50px] justify-center`}>
                          {err.code}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-sm">{err.message}</span>
                          <p className="text-xs text-muted-foreground truncate sm:whitespace-normal">{err.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Security */}
            <section id="security">
              <Card className="glass border-warning/30">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Shield className="w-5 h-5 text-warning" />
                    Security
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">IP and Domain whitelisting requirements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-muted/30 border">
                      <h4 className="font-medium text-sm mb-1 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-primary" />
                        IP Whitelisting
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Only whitelisted server IPs can access the API. Contact admin to add your IP.
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 border">
                      <h4 className="font-medium text-sm mb-1 flex items-center gap-2">
                        <Server className="w-4 h-4 text-primary" />
                        Domain Verification
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Requests are verified against allowed domains set for your API key.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Security Notice</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Requests from non-whitelisted IPs/domains return 403 Forbidden. Ensure proper configuration before integration.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Rate Limits */}
            <section id="rate-limits">
              <Card className="glass">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="w-5 h-5 text-primary" />
                    Rate Limits
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Request limits and best practices</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-muted/30 border text-center">
                      <p className="text-lg sm:text-2xl font-bold text-primary">100</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Requests/minute</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 border text-center">
                      <p className="text-lg sm:text-2xl font-bold text-primary">5000</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Requests/hour</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 border text-center col-span-2 sm:col-span-1">
                      <p className="text-lg sm:text-2xl font-bold text-primary">50K</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Requests/day</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm font-medium mb-2">Best Practices</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Cache responses for at least 10 seconds</li>
                      <li>• Implement exponential backoff on errors</li>
                      <li>• Use connection pooling for high volume</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Support - Hyper Developer Contact */}
            <Card className="gradient-primary text-white">
              <CardContent className="py-6 sm:py-8 text-center space-y-3">
                <h3 className="text-xl sm:text-2xl font-bold">Need Help with Hyper Softs API?</h3>
                <p className="text-sm opacity-90 max-w-md mx-auto">
                  Contact Hyper Developer (Hyperdeveloper) support team for Hypersofts integration help or Same Trend API issues.
                  Best support for Wingo API, K3 API, 5D API, TRX API in India.
                </p>
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  <Button variant="secondary" size="sm" className="gap-2 text-xs">
                    <FileText className="w-3 h-3" />
                    Email Hyper Softs Support
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 text-xs bg-white/10 border-white/30 hover:bg-white/20">
                    <ExternalLink className="w-3 h-3" />
                    Hypersofts Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DocumentationPage;
