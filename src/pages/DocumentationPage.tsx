import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link } from 'react-router-dom';
import { Moon, Sun, Zap, ArrowLeft, Copy, CheckCircle, Code, Globe, Key, Shield, Clock, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DocumentationPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast({ title: 'Copied!', description: 'Code copied to clipboard' });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const codeExamples = {
    curl: `curl -X GET "https://your-domain.com/api/trend/wingo/wg1" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
    
    javascript: `const response = await fetch('https://your-domain.com/api/trend/wingo/wg1', {
  method: 'GET',
  headers: {
    'X-API-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);`,
    
    python: `import requests

url = "https://your-domain.com/api/trend/wingo/wg1"
headers = {
    "X-API-Key": "YOUR_API_KEY",
    "Content-Type": "application/json"
}

response = requests.get(url, headers=headers)
data = response.json()
print(data)`,
    
    php: `<?php
$curl = curl_init();

curl_setopt_array($curl, [
    CURLOPT_URL => "https://your-domain.com/api/trend/wingo/wg1",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        "X-API-Key: YOUR_API_KEY",
        "Content-Type: application/json"
    ],
]);

$response = curl_exec($curl);
curl_close($curl);

$data = json_decode($response, true);
print_r($data);
?>`,
  };

  const endpoints = [
    { game: 'WinGo', ids: ['wg1', 'wg3', 'wg5', 'wg30'], path: '/api/trend/wingo/:typeId' },
    { game: 'K3', ids: ['k31', 'k33', 'k35', 'k310'], path: '/api/trend/k3/:typeId' },
    { game: '5D', ids: ['5d1', '5d3', '5d5', '5d10'], path: '/api/trend/5d/:typeId' },
    { game: 'TRX', ids: ['trx1', 'trx3', 'trx5', 'trx10'], path: '/api/trend/trx/:typeId' },
    { game: 'Numeric', ids: ['1', '2', '3', '30'], path: '/api/trend/numeric/:typeId' },
  ];

  const errorCodes = [
    { code: 200, message: 'Success', description: 'Request completed successfully' },
    { code: 400, message: 'Bad Request', description: 'Invalid request parameters' },
    { code: 401, message: 'Unauthorized', description: 'Invalid or missing API key' },
    { code: 403, message: 'Forbidden', description: 'IP or domain not whitelisted' },
    { code: 404, message: 'Not Found', description: 'Endpoint or resource not found' },
    { code: 429, message: 'Too Many Requests', description: 'Rate limit exceeded' },
    { code: 500, message: 'Server Error', description: 'Internal server error' },
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
              <span className="font-bold text-foreground">Hyper Softs API Docs</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">API Documentation</h1>
            <p className="text-xl text-muted-foreground">
              Complete guide to integrate Hyper Softs Trend API into your application
            </p>
          </div>

          {/* Quick Start */}
          <Card className="gradient-primary text-primary-foreground">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary-foreground/20">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">Quick Start</h2>
                  <p className="text-primary-foreground/80">
                    Get started in 3 simple steps:
                  </p>
                  <ol className="mt-3 space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary-foreground/20 flex items-center justify-center text-xs">1</span>
                      Get your API key from admin
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary-foreground/20 flex items-center justify-center text-xs">2</span>
                      Whitelist your IP and domain
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary-foreground/20 flex items-center justify-center text-xs">3</span>
                      Start making API requests
                    </li>
                  </ol>
                </div>
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
              <CardDescription>How to authenticate your API requests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                All API requests must include your API key in the request headers:
              </p>
              <div className="bg-muted rounded-lg p-4 font-mono text-sm">
                <code className="text-foreground">X-API-Key: HYPER_your_api_key_here</code>
              </div>
              <div className="flex items-start gap-2 p-4 rounded-lg bg-warning/10 border border-warning/20">
                <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Security Notice</p>
                  <p className="text-sm text-muted-foreground">
                    Never expose your API key in client-side code. Always make API calls from your server.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endpoints */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                API Endpoints
              </CardTitle>
              <CardDescription>Available endpoints for different game types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {endpoints.map((endpoint) => (
                  <div key={endpoint.game} className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-foreground">{endpoint.game}</h3>
                      <Badge variant="outline">GET</Badge>
                    </div>
                    <code className="text-sm font-mono text-primary">{endpoint.path}</code>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {endpoint.ids.map((id) => (
                        <Badge key={id} variant="secondary">{id}</Badge>
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
              <CardDescription>Sample code in different programming languages</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="curl">
                <TabsList className="mb-4">
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="php">PHP</TabsTrigger>
                </TabsList>
                {Object.entries(codeExamples).map(([lang, code]) => (
                  <TabsContent key={lang} value={lang}>
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => copyCode(code, lang)}
                      >
                        {copiedCode === lang ? (
                          <CheckCircle className="w-4 h-4 text-success" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                      <ScrollArea className="h-[200px]">
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
              <CardDescription>Expected response structure</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Success Response</h4>
                  <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto">
                    <code className="text-foreground">{`{
  "success": true,
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
                  <h4 className="font-medium text-foreground mb-2">Error Response</h4>
                  <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto">
                    <code className="text-foreground">{`{
  "success": false,
  "error": {
    "code": 401,
    "message": "Invalid API key"
  }
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
              <CardDescription>HTTP status codes and their meanings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {errorCodes.map((error) => (
                  <div key={error.code} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Badge variant={error.code < 400 ? 'default' : 'destructive'}>
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

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Security
              </CardTitle>
              <CardDescription>Security features and best practices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-medium text-foreground mb-2">IP Whitelisting</h4>
                  <p className="text-sm text-muted-foreground">
                    Only requests from whitelisted IP addresses are allowed. Both IPv4 and IPv6 are supported.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-medium text-foreground mb-2">Domain Verification</h4>
                  <p className="text-sm text-muted-foreground">
                    Requests are validated against the domain whitelist for additional security.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-medium text-foreground mb-2">Key Encryption</h4>
                  <p className="text-sm text-muted-foreground">
                    API keys are encrypted and stored securely in our database.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-medium text-foreground mb-2">Request Logging</h4>
                  <p className="text-sm text-muted-foreground">
                    All API requests are logged for security and debugging purposes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rate Limits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Rate Limits
              </CardTitle>
              <CardDescription>API usage limits and quotas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                <p className="text-foreground font-medium">No Rate Limits</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your API key has no rate limits. However, please use the API responsibly.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Support */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-foreground mb-2">Need Help?</h3>
                <p className="text-muted-foreground mb-4">
                  Contact our support team for any questions or issues
                </p>
                <Button className="gradient-primary text-primary-foreground">
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DocumentationPage;
