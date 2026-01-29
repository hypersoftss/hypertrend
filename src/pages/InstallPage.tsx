import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, CheckCircle, Share, MoreVertical, PlusSquare, Zap, Shield, Wifi } from "lucide-react";
import { Link } from "react-router-dom";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallPage = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const features = [
    { icon: Zap, title: "Lightning Fast", description: "Native app experience with instant loading" },
    { icon: Shield, title: "Secure", description: "Your data stays safe and encrypted" },
    { icon: Wifi, title: "Works Offline", description: "Access key features without internet" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Smartphone className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">Install App</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary via-primary/70 to-accent bg-clip-text text-transparent">
              Install Hyper Softs
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get the best experience by installing our app on your device. Works like a native app with offline support!
          </p>
        </div>

        {/* Main Install Card */}
        <Card className="max-w-lg mx-auto bg-card/50 backdrop-blur-xl border-primary/20 mb-12">
          <CardHeader className="text-center pb-4">
            <div className="w-24 h-24 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl shadow-primary/30">
              <img 
                src="https://storage.googleapis.com/gpt-engineer-file-uploads/Z8UZV3u8mdNZdmHVVRKSqxm4yex2/uploads/1769707742336-6273690538254995168_99.jpg" 
                alt="Hyper Softs"
                className="w-20 h-20 rounded-2xl object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <CardTitle className="text-2xl">Hyper Softs</CardTitle>
            <CardDescription>Same Trend API by Hyper Developer</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {isInstalled ? (
              <div className="text-center py-6">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-accent mb-2">Already Installed!</h3>
                <p className="text-muted-foreground mb-4">
                  The app is installed on your device. Open it from your home screen.
                </p>
                <Link to="/">
                  <Button className="bg-primary hover:bg-primary/90">
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            ) : isIOS ? (
              <div className="space-y-4">
                <h3 className="font-semibold text-center mb-4">Install on iPhone/iPad</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Share className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Step 1</p>
                      <p className="text-sm text-muted-foreground">Tap the Share button in Safari</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <PlusSquare className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Step 2</p>
                      <p className="text-sm text-muted-foreground">Scroll down and tap "Add to Home Screen"</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Step 3</p>
                      <p className="text-sm text-muted-foreground">Tap "Add" to install the app</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : deferredPrompt ? (
              <div className="text-center">
                <Button 
                  onClick={handleInstall}
                  size="lg"
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold py-6 text-lg"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Install App Now
                </Button>
                <p className="text-sm text-muted-foreground mt-3">
                  Free • No app store required • ~2MB
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-semibold text-center mb-4">Install on Android</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <MoreVertical className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Step 1</p>
                      <p className="text-sm text-muted-foreground">Tap the menu (⋮) in your browser</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Download className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Step 2</p>
                      <p className="text-sm text-muted-foreground">Tap "Install app" or "Add to Home screen"</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Step 3</p>
                      <p className="text-sm text-muted-foreground">Confirm to install and open from home screen</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          {features.map((feature) => (
            <Card key={feature.title} className="bg-card/30 backdrop-blur border-primary/10 text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Section */}
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Need help? Contact Developer</p>
          <div className="flex justify-center gap-4">
            <a 
              href="https://t.me/Hyperdeveloperr" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
              </svg>
              @Hyperdeveloperr
            </a>
            <a 
              href="https://t.me/hypersoftstech" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 3H7c-2.2 0-4 1.8-4 4v10c0 2.2 1.8 4 4 4h10c2.2 0 4-1.8 4-4V7c0-2.2-1.8-4-4-4zm-5 14c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5zm0-8c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3z"/>
              </svg>
              Join Channel
            </a>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-8">
          <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InstallPage;
