import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Globe, Search, Server, Mail, Shield, FileText, Loader2, CheckCircle, XCircle, RefreshCw, Trash2 } from 'lucide-react';

interface DnsRecord {
  type: string;
  records: string[];
  icon: React.ElementType;
  color: string;
}

interface RecentLookup {
  domain: string;
  status: 'success' | 'error';
  time: string;
  timestamp: number;
}

const STORAGE_KEY = 'dns_recent_lookups';

const DnsCheckerPage = () => {
  const [domain, setDomain] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<DnsRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentLookups, setRecentLookups] = useState<RecentLookup[]>([]);
  const { toast } = useToast();

  // Load recent lookups from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setRecentLookups(parsed);
      }
    } catch (e) {
      console.error('Error loading recent lookups:', e);
    }
  }, []);

  // Save recent lookups to localStorage
  const saveRecentLookup = (domainName: string, status: 'success' | 'error') => {
    const newLookup: RecentLookup = {
      domain: domainName,
      status,
      time: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      timestamp: Date.now()
    };

    setRecentLookups(prev => {
      // Remove duplicate if exists
      const filtered = prev.filter(l => l.domain !== domainName);
      // Add new lookup at the beginning, keep max 10
      const updated = [newLookup, ...filtered].slice(0, 10);
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving recent lookups:', e);
      }
      
      return updated;
    });
  };

  // Clear recent lookups
  const clearRecentLookups = () => {
    setRecentLookups([]);
    localStorage.removeItem(STORAGE_KEY);
    toast({
      title: '✅ Cleared',
      description: 'Recent lookups history cleared',
    });
  };

  // Real DNS lookup using public DNS API
  const performDnsLookup = async (domainName: string) => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      // Using dns.google.com API for real DNS lookups
      const dnsTypes = ['A', 'AAAA', 'MX', 'NS', 'TXT', 'CNAME'];
      const lookupResults: DnsRecord[] = [];

      for (const type of dnsTypes) {
        try {
          const response = await fetch(
            `https://dns.google/resolve?name=${encodeURIComponent(domainName)}&type=${type}`,
            { headers: { 'Accept': 'application/dns-json' } }
          );
          
          if (response.ok) {
            const data = await response.json();
            
            let records: string[] = [];
            if (data.Answer && Array.isArray(data.Answer)) {
              records = data.Answer.map((ans: any) => {
                if (type === 'MX') {
                  return `${ans.data}`;
                }
                return ans.data?.replace(/"/g, '') || ans.data;
              }).filter(Boolean);
            }

            const typeConfig: { [key: string]: { label: string; icon: React.ElementType; color: string } } = {
              'A': { label: 'A Records (IPv4)', icon: Server, color: 'text-blue-500' },
              'AAAA': { label: 'AAAA Records (IPv6)', icon: Server, color: 'text-purple-500' },
              'CNAME': { label: 'CNAME Records', icon: Globe, color: 'text-green-500' },
              'MX': { label: 'MX Records (Mail)', icon: Mail, color: 'text-orange-500' },
              'NS': { label: 'NS Records (Nameservers)', icon: Shield, color: 'text-cyan-500' },
              'TXT': { label: 'TXT Records', icon: FileText, color: 'text-yellow-500' },
            };

            const config = typeConfig[type];
            if (config) {
              lookupResults.push({
                type: config.label,
                records,
                icon: config.icon,
                color: config.color
              });
            }
          }
        } catch (typeError) {
          console.error(`Error fetching ${type} records:`, typeError);
        }
      }

      if (lookupResults.length > 0) {
        setResults(lookupResults);
        saveRecentLookup(domainName, 'success');
        toast({
          title: '✅ DNS Lookup Complete',
          description: `Found DNS records for ${domainName}`,
        });
      } else {
        throw new Error('No DNS records found for this domain');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to lookup DNS records. Please check the domain and try again.');
      saveRecentLookup(domainName, 'error');
      toast({
        title: '❌ Lookup Failed',
        description: err.message || 'Could not retrieve DNS records',
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

  const getTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

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
            <CardDescription>Enter a domain name to check its DNS records (uses Google DNS)</CardDescription>
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
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-primary" />
                Recent Lookups
              </CardTitle>
              {recentLookups.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearRecentLookups}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {recentLookups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No recent lookups yet</p>
                <p className="text-sm">Search for a domain to see it here</p>
              </div>
            ) : (
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
                      <span className="text-sm text-muted-foreground">{getTimeAgo(lookup.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
