import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ConfigProvider } from "@/contexts/ConfigContext";
import { ApiDataProvider } from "@/contexts/ApiDataContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import GoogleAnalytics from "@/components/GoogleAnalytics";

// Pages
import LandingPage from "@/pages/LandingPage";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import DocumentationPage from "@/pages/DocumentationPage";
import ProfilePage from "@/pages/ProfilePage";
import ChangePasswordPage from "@/pages/ChangePasswordPage";
import NotFound from "@/pages/NotFound";
import InstallPage from "@/pages/InstallPage";

// Admin Pages
import UsersPage from "@/pages/admin/UsersPage";
import ApiKeysPage from "@/pages/admin/ApiKeysPage";
import ApiLogsPage from "@/pages/admin/ApiLogsPage";
import ManualReminderPage from "@/pages/admin/ManualReminderPage";
import SettingsPage from "@/pages/admin/SettingsPage";
import BackendDownloadPage from "@/pages/admin/BackendDownloadPage";
import LiveMonitorPage from "@/pages/admin/LiveMonitorPage";
import ServerHealthPage from "@/pages/admin/ServerHealthPage";
import AnalyticsPage from "@/pages/admin/AnalyticsPage";
import DnsCheckerPage from "@/pages/admin/DnsCheckerPage";
import TelegramLogsPage from "@/pages/admin/TelegramLogsPage";
import ActivityLogsPage from "@/pages/admin/ActivityLogsPage";

// User Pages
import UserKeysPage from "@/pages/user/UserKeysPage";
import UserLogsPage from "@/pages/user/UserLogsPage";
import UserAnalyticsPage from "@/pages/user/UserAnalyticsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <ConfigProvider>
        <ApiDataProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <GoogleAnalytics />
                <Routes>
                {/* Public Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/install" element={<InstallPage />} />

                  {/* Protected Routes - All Users */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/docs" element={<DocumentationPage />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/change-password" element={<ChangePasswordPage />} />
                    <Route path="/user/keys" element={<UserKeysPage />} />
                    <Route path="/user/logs" element={<UserLogsPage />} />
                    <Route path="/user/analytics" element={<UserAnalyticsPage />} />
                  </Route>

                  {/* Protected Routes - Admin Only */}
                  <Route element={<ProtectedRoute requiredRole="admin" />}>
                    <Route path="/admin/users" element={<UsersPage />} />
                    <Route path="/admin/keys" element={<ApiKeysPage />} />
                    <Route path="/admin/logs" element={<ApiLogsPage />} />
                    <Route path="/admin/live-monitor" element={<LiveMonitorPage />} />
                    <Route path="/admin/server-health" element={<ServerHealthPage />} />
                    <Route path="/admin/analytics" element={<AnalyticsPage />} />
                    <Route path="/admin/dns-checker" element={<DnsCheckerPage />} />
                    <Route path="/admin/telegram-logs" element={<TelegramLogsPage />} />
                    <Route path="/admin/activity-logs" element={<ActivityLogsPage />} />
                    <Route path="/admin/reminder" element={<ManualReminderPage />} />
                    <Route path="/admin/settings" element={<SettingsPage />} />
                    <Route path="/admin/download" element={<BackendDownloadPage />} />
                  </Route>

                  {/* Catch-all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </ApiDataProvider>
      </ConfigProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
