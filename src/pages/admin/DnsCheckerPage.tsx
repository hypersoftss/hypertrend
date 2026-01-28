import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Globe, Search, Server, Mail, Shield, FileText, Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface DnsRecord {
  type: string;
  records: string[];
  icon: React.ElementType;
  color: string;
}

const DnsCheckerPage = () => {
  const [domain, setDomain] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<DnsRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Mock DNS lookup function (in real app, this would call your backend)
  const performDnsLookup = async (domainName: string) => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      // Mock DNS results
      const mockResults: DnsRecord[] = [
        {
          type: 'A Records (IPv4)',
          records: ['104.21.32.123', '172.67.154.89'],
          icon: Server,
          color: 'text-blue-500'
        },
        {
          type: 'AAAA Records (IPv6)',
          records: ['2606:4700:3031::6815:207b', '2606:4700:3030::ac43:9a59'],
          icon: Server,
          color: 'text-purple-500'
        },
        {
          type: 'CNAME Records',
          records: domainName.startsWith('www.') ? [domainName.replace('www.', '')] : [],
          icon: Globe,
          color: 'text-green-500'
        },
        {
          type: 'MX Records (Mail)',
          records: ['10 mail.' + domainName, '20 mail2.' + domainName],
          icon: Mail,
          color: 'text-orange-500'
        },
        {
          type: 'NS Records (Nameservers)',
          records: ['ns1.cloudflare.com', 'ns2.cloudflare.com'],
          icon: Shield,
          color: 'text-cyan-500'
        },
        {
          type: 'TXT Records',
          records: ['v=spf1 include:_spf.google.com ~all', 'google-site-verification=xxx'],
          icon: FileText,
          color: 'text-yellow-500'
        }
      ];

      setResults(mockResults);
      toast({
        title: '✅ DNS Lookup Complete',
        description: `Found DNS records for ${domainName}`,
      });
    } catch (err) {
      setError('Failed to lookup DNS records. Please check the domain and try again.');
      toast({
        title: '❌ Lookup Failed',
        description: 'Could not retrieve DNS records',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) {
      toast({
        title: '⚠️ Domain Required',
        description: 'Please enter a domain name',
        variant: 'destructive'
      });
      return;
    }

    // Clean domain
    let cleanDomain = domain.trim().toLowerCase();
    cleanDomain = cleanDomain.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    
    performDnsLookup(cleanDomain);
  };

  const recentLookups = [
    { domain: 'p2plottery.club', status: 'success', time: '2 min ago' },
    { domain: '107.172.75.145', status: 'success', time: '15 min ago' },
    { domain: 'example.com', status: 'success', time: '1 hour ago' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Globe className="w-8 h-8 text-primary" />
            DNS Checker
          </h1>
          <p className="text-muted-foreground mt-1">
            Lookup DNS records for any domain or IP address
          </p>
        </div>

        {/* Search Card */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle>Domain Lookup</CardTitle>
            <CardDescription>Enter a domain name to check its DNS records</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-3">
              <div className="flex-1 relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Enter domain (e.g., example.com)"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="pl-10 h-12 text-lg"
                />
              </div>
              <Button 
                type="submit" 
                className="gradient-primary h-12 px-8"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Lookup DNS
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {results && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((record, index) => (
              <Card key={index} className="hover:border-primary/30 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <record.icon className={`w-5 h-5 ${record.color}`} />
                    {record.type}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {record.records.length > 0 ? (
                    <div className="space-y-2">
                      {record.records.map((r, i) => (
                        <div 
                          key={i}
                          className="flex items-center gap-2 p-2 rounded bg-muted/50 font-mono text-sm"
                        >
                          <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                          <span className="truncate">{r}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-2 rounded bg-muted/30 text-muted-foreground">
                      <XCircle className="w-4 h-4" />
                      <span>No records found</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-destructive">
                <XCircle className="w-6 h-6" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Lookups */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-primary" />
              Recent Lookups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentLookups.map((lookup, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => {
                    setDomain(lookup.domain);
                    performDnsLookup(lookup.domain);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-muted-foreground" />
                    <span className="font-mono">{lookup.domain}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={lookup.status === 'success' ? 'default' : 'destructive'}>
                      {lookup.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{lookup.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Server className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">A Record</p>
                  <p className="font-semibold">IPv4 Address</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Server className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">AAAA Record</p>
                  <p className="font-semibold">IPv6 Address</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">MX Record</p>
                  <p className="font-semibold">Mail Server</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-cyan-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">NS Record</p>
                  <p className="font-semibold">Nameserver</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DnsCheckerPage;
