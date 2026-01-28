import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link } from 'react-router-dom';
import { Moon, Sun, Zap, ArrowLeft, Copy, CheckCircle, Code, Globe, Key, Shield, Clock, AlertTriangle, Server, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DocumentationPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast({ title: '📋 Copied!', description: 'Code copied to clipboard' });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Game types with all their durations
  const gameEndpoints = [
    {
      game: 'WinGo',
      path: '/api/trend/wingo/:typeId',
      durations: [
        { id: 'wg30s', label: '30 Seconds', example: '/api/trend/wingo/wg30s' },
        { id: 'wg1', label: '1 Minute', example: '/api/trend/wingo/wg1' },
        { id: 'wg3', label: '3 Minutes', example: '/api/trend/wingo/wg3' },
        { id: 'wg5', label: '5 Minutes', example: '/api/trend/wingo/wg5' },
      ]
    },
    {
      game: 'K3',
      path: '/api/trend/k3/:typeId',
      durations: [
        { id: 'k31', label: '1 Minute', example: '/api/trend/k3/k31' },
        { id: 'k33', label: '3 Minutes', example: '/api/trend/k3/k33' },
        { id: 'k35', label: '5 Minutes', example: '/api/trend/k3/k35' },
        { id: 'k310', label: '10 Minutes', example: '/api/trend/k3/k310' },
      ]
    },
    {
      game: '5D',
      path: '/api/trend/5d/:typeId',
      durations: [
        { id: '5d1', label: '1 Minute', example: '/api/trend/5d/5d1' },
        { id: '5d3', label: '3 Minutes', example: '/api/trend/5d/5d3' },
        { id: '5d5', label: '5 Minutes', example: '/api/trend/5d/5d5' },
        { id: '5d10', label: '10 Minutes', example: '/api/trend/5d/5d10' },
      ]
    },
    {
      game: 'TRX',
      path: '/api/trend/trx/:typeId',
      durations: [
        { id: 'trx1', label: '1 Minute', example: '/api/trend/trx/trx1' },
        { id: 'trx3', label: '3 Minutes', example: '/api/trend/trx/trx3' },
        { id: 'trx5', label: '5 Minutes', example: '/api/trend/trx/trx5' },
        { id: 'trx10', label: '10 Minutes', example: '/api/trend/trx/trx10' },
      ]
    },
    {
      game: 'Numeric',
      path: '/api/trend/numeric/:typeId',
      durations: [
        { id: '1', label: '1 Minute', example: '/api/trend/numeric/1' },
        { id: '2', label: '3 Minutes', example: '/api/trend/numeric/2' },
        { id: '3', label: '5 Minutes', example: '/api/trend/numeric/3' },
        { id: '30', label: '30 Minutes', example: '/api/trend/numeric/30' },
      ]
    },
  ];

  const codeExamples = {
    curl: `# WinGo 1-Minute Data
curl -X GET "https://hyperapi.in/api/trend/wingo/wg1" \\
  -H "X-API-Key: HYPER_your_api_key_here" \\
  -H "Content-Type: application/json"

# K3 3-Minute Data
curl -X GET "https://hyperapi.in/api/trend/k3/k33" \\
  -H "X-API-Key: HYPER_your_api_key_here"

# 5D 5-Minute Data
curl -X GET "https://hyperapi.in/api/trend/5d/5d5" \\
  -H "X-API-Key: HYPER_your_api_key_here"

# TRX 10-Minute Data
curl -X GET "https://hyperapi.in/api/trend/trx/trx10" \\
  -H "X-API-Key: HYPER_your_api_key_here"`,
    
    javascript: `// JavaScript / Node.js Example
const API_KEY = 'HYPER_your_api_key_here';
const BASE_URL = 'https://hyperapi.in/api';

// Function to get trend data
async function getTrendData(gameType, typeId) {
  try {
    const response = await fetch(\`\${BASE_URL}/trend/\${gameType}/\${typeId}\`, {
      method: 'GET',
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching trend data:', error);
    throw error;
  }
}

// Usage Examples
async function main() {
  // Get WinGo 1-minute data
  const wingoData = await getTrendData('wingo', 'wg1');
  console.log('WinGo 1-min:', wingoData);

  // Get K3 3-minute data
  const k3Data = await getTrendData('k3', 'k33');
  console.log('K3 3-min:', k3Data);

  // Get 5D 5-minute data
  const fiveData = await getTrendData('5d', '5d5');
  console.log('5D 5-min:', fiveData);

  // Get TRX 10-minute data
  const trxData = await getTrendData('trx', 'trx10');
  console.log('TRX 10-min:', trxData);
}

main();`,
    
    python: `# Python Example
import requests

API_KEY = "HYPER_your_api_key_here"
BASE_URL = "https://hyperapi.in/api"

def get_trend_data(game_type, type_id):
    """Fetch trend data for specified game and duration"""
    url = f"{BASE_URL}/trend/{game_type}/{type_id}"
    headers = {
        "X-API-Key": API_KEY,
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        return None

# Usage Examples
if __name__ == "__main__":
    # WinGo 1-minute
    wingo_1min = get_trend_data("wingo", "wg1")
    print("WinGo 1-min:", wingo_1min)
    
    # WinGo 3-minute
    wingo_3min = get_trend_data("wingo", "wg3")
    print("WinGo 3-min:", wingo_3min)
    
    # K3 all durations
    for type_id in ["k31", "k33", "k35", "k310"]:
        data = get_trend_data("k3", type_id)
        print(f"K3 {type_id}:", data)
    
    # 5D 5-minute
    five_d = get_trend_data("5d", "5d5")
    print("5D 5-min:", five_d)
    
    # TRX 10-minute
    trx_10min = get_trend_data("trx", "trx10")
    print("TRX 10-min:", trx_10min)`,
    
    php: `<?php
// PHP Example

$apiKey = "HYPER_your_api_key_here";
$baseUrl = "https://hyperapi.in/api";

/**
 * Get trend data for specified game and duration
 */
function getTrendData($gameType, $typeId) {
    global $apiKey, $baseUrl;
    
    $url = "$baseUrl/trend/$gameType/$typeId";
    
    $curl = curl_init();
    
    curl_setopt_array($curl, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            "X-API-Key: $apiKey",
            "Content-Type: application/json"
        ],
        CURLOPT_TIMEOUT => 30,
    ]);
    
    $response = curl_exec($curl);
    $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    
    if (curl_errno($curl)) {
        echo 'Error: ' . curl_error($curl);
        curl_close($curl);
        return null;
    }
    
    curl_close($curl);
    
    if ($httpCode !== 200) {
        echo "HTTP Error: $httpCode\\n";
        return null;
    }
    
    return json_decode($response, true);
}

// Usage Examples

// WinGo all durations (30sec, 1min, 3min, 5min)
$wingo_types = ['wg30s', 'wg1', 'wg3', 'wg5'];
foreach ($wingo_types as $type) {
    $data = getTrendData('wingo', $type);
    echo "WinGo $type: " . json_encode($data) . "\\n";
}

// K3 3-minute
$k3_3min = getTrendData('k3', 'k33');
print_r($k3_3min);

// 5D 5-minute
$five_d = getTrendData('5d', '5d5');
print_r($five_d);

// TRX 10-minute
$trx_10min = getTrendData('trx', 'trx10');
print_r($trx_10min);

// Numeric 30-minute
$numeric_30min = getTrendData('numeric', '30');
print_r($numeric_30min);
?>`,
  };

  const errorCodes = [
    { code: 200, message: 'Success', description: 'Request completed successfully', color: 'bg-success' },
    { code: 400, message: 'Bad Request', description: 'Invalid request parameters', color: 'bg-warning' },
    { code: 401, message: 'Unauthorized', description: 'Invalid or missing API key', color: 'bg-destructive' },
    { code: 403, message: 'Forbidden', description: 'IP or domain not whitelisted', color: 'bg-destructive' },
    { code: 404, message: 'Not Found', description: 'Endpoint or resource not found', color: 'bg-warning' },
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
                <span className="font-bold text-foreground">Hyper Softs</span>
                <span className="text-muted-foreground ml-2 text-sm">API Documentation</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Hero */}
          <div className="text-center space-y-4">
            <Badge className="mb-4">v1.0</Badge>
            <h1 className="text-4xl font-bold text-foreground">Hyper Softs Trend API</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Complete API documentation for WinGo, K3, 5D, TRX, and Numeric game trend data
            </p>
          </div>

          {/* Quick Start */}
          <Card className="gradient-primary text-primary-foreground overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary-foreground/20">
                  <Zap className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-2">🚀 Quick Start</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="p-3 rounded-lg bg-primary-foreground/10">
                      <div className="font-bold mb-1">1. Get API Key</div>
                      <p className="text-sm opacity-80">Request API key from admin</p>
                    </div>
                    <div className="p-3 rounded-lg bg-primary-foreground/10">
                      <div className="font-bold mb-1">2. Whitelist IP</div>
                      <p className="text-sm opacity-80">Provide your server IP address</p>
                    </div>
                    <div className="p-3 rounded-lg bg-primary-foreground/10">
                      <div className="font-bold mb-1">3. Make Requests</div>
                      <p className="text-sm opacity-80">Start calling the API</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Base URL */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5 text-primary" />
                Base URL
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted font-mono">
                <code className="text-lg text-primary flex-1">https://hyperapi.in/api</code>
                <Button variant="ghost" size="sm" onClick={() => copyCode('https://hyperapi.in/api', 'baseurl')}>
                  {copiedCode === 'baseurl' ? <CheckCircle className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Authentication */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" />
                Authentication
              </CardTitle>
              <CardDescription>All API requests require authentication via API key</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground mb-2">Required Header:</p>
                <code className="text-foreground font-mono">X-API-Key: HYPER_your_api_key_here</code>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-success" />
                    IP Whitelisting
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Only requests from whitelisted IPs are accepted. Supports IPv4 & IPv6.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-success" />
                    Domain Verification
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Requests are validated against domain whitelist for security.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 p-4 rounded-lg bg-warning/10 border border-warning/20">
                <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Security Notice</p>
                  <p className="text-sm text-muted-foreground">
                    Never expose your API key in frontend code. Always call from your backend server.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endpoints - Detailed */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                API Endpoints
              </CardTitle>
              <CardDescription>All available endpoints with their duration types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {gameEndpoints.map((endpoint) => (
                  <div key={endpoint.game} className="p-4 rounded-lg border bg-muted/30">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Badge className="text-lg px-4 py-1">{endpoint.game}</Badge>
                        <Badge variant="outline">GET</Badge>
                      </div>
                      <code className="text-sm font-mono text-primary">{endpoint.path}</code>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {endpoint.durations.map((dur) => (
                        <div key={dur.id} className="p-3 rounded-lg bg-background border hover:border-primary/50 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="secondary">{dur.id}</Badge>
                            <span className="text-xs text-muted-foreground">{dur.label}</span>
                          </div>
                          <code className="text-xs text-primary break-all">{dur.example}</code>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
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
              <CardDescription>Ready-to-use code in different languages</CardDescription>
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
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute top-2 right-2 z-10"
                        onClick={() => copyCode(code, lang)}
                      >
                        {copiedCode === lang ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2 text-success" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Code
                          </>
                        )}
                      </Button>
                      <ScrollArea className="h-[400px]">
                        <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto">
                          <code className="text-foreground">{code}</code>
                        </pre>
                      </ScrollArea>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* Response Format */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                Response Format
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-success mb-2">✅ Success Response</h4>
                  <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto">
                    <code className="text-foreground">{`{
  "success": true,
  "game": "WINGO",
  "duration": "1min",
  "data": {
    "period": "20260128001",
    "number": 5,
    "color": "green",
    "size": "small",
    "timestamp": "2026-01-28T10:00:00Z"
  }
}`}</code>
                  </pre>
                </div>
                <div>
                  <h4 className="font-medium text-destructive mb-2">❌ Error Response</h4>
                  <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto">
                    <code className="text-foreground">{`{
  "success": false,
  "error": "IP address not whitelisted",
  "your_ip": "192.168.1.1",
  "code": 403
}`}</code>
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Codes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-primary" />
                Error Codes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {errorCodes.map((error) => (
                  <div key={error.code} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <Badge className={error.code < 400 ? 'bg-success' : error.code < 500 ? 'bg-warning' : 'bg-destructive'}>
                        {error.code}
                      </Badge>
                      <span className="font-medium text-foreground">{error.message}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{error.description}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Support */}
          <Card className="border-primary/30">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-foreground mb-2">Need Help?</h3>
                <p className="text-muted-foreground mb-4">
                  Contact our support team via Telegram for assistance
                </p>
                <div className="flex justify-center gap-4">
                  <Button className="gradient-primary text-primary-foreground">
                    📱 Contact Support
                  </Button>
                  <Link to="/dashboard">
                    <Button variant="outline">
                      Go to Dashboard
                    </Button>
                  </Link>
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
