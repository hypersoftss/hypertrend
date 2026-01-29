<?php
/**
 * =====================================================
 * 📄 MODERN ADMIN HEADER - ENHANCED UI
 * =====================================================
 * Features:
 * - Glassmorphism design
 * - Smooth animations
 * - Interactive sidebar with groups
 * - Dark/Light theme toggle
 * - Notifications system
 * - Profile dropdown
 */

require_once __DIR__ . '/auth.php';
require_auth();

$current_user = get_session_user_data();
$current_page = basename($_SERVER['PHP_SELF'], '.php');

// Get unread notifications count (if table exists)
$notification_count = 0;
try {
    $db = getDB();
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM activity_logs WHERE is_read = 0 AND user_id = ? LIMIT 10");
    $stmt->execute([$current_user['id'] ?? 0]);
    $result = $stmt->fetch();
    if ($result) {
        $notification_count = min(9, (int)($result['count'] ?? 0));
    }
} catch (Exception $e) {
    // Ignore if table doesn't exist or column is missing
}
?>
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $page_title ?? 'Dashboard'; ?> - <?php echo SITE_NAME; ?></title>
    
    <!-- No external CDN dependencies - all inline for CSP compatibility -->
    
    <style>
        /* =====================================================
           CSS VARIABLES - THEME SYSTEM
           ===================================================== */
        :root {
            /* Primary Colors */
            --primary: 99 102 241;
            --primary-hover: 79 70 229;
            --primary-light: 129 140 248;
            
            /* Accent Colors */
            --accent: 168 85 247;
            --success: 16 185 129;
            --warning: 245 158 11;
            --danger: 239 68 68;
            --info: 59 130 246;
            
            /* Dark Theme (Default) */
            --bg-base: 15 10 30;
            --bg-surface: 30 27 75;
            --bg-elevated: 45 40 95;
            --bg-card: 35 32 80;
            
            --text-primary: 248 250 252;
            --text-secondary: 148 163 184;
            --text-muted: 100 116 139;
            
            --border: 99 102 241;
            --border-opacity: 0.2;
            
            /* Shadows */
            --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
            --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3);
            --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.4);
            --shadow-glow: 0 0 40px rgb(var(--primary) / 0.3);
            
            /* Transitions */
            --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
            --transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
            --transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
            
            /* Layout */
            --sidebar-width: 280px;
            --sidebar-collapsed: 72px;
            --header-height: 64px;
            --radius-sm: 6px;
            --radius-md: 10px;
            --radius-lg: 16px;
            --radius-xl: 24px;
        }
        
        [data-theme="light"] {
            --bg-base: 249 250 251;
            --bg-surface: 255 255 255;
            --bg-elevated: 255 255 255;
            --bg-card: 255 255 255;
            
            --text-primary: 15 23 42;
            --text-secondary: 71 85 105;
            --text-muted: 148 163 184;
            
            --border-opacity: 0.15;
            
            --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
            --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
        }
        
        /* =====================================================
           BASE STYLES
           ===================================================== */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        /* =====================================================
           INLINE SVG ICON SYSTEM (CSP Compatible)
           ===================================================== */
        .fas, .fab { display: inline-block; width: 1em; height: 1em; vertical-align: -0.125em; }
        .fa-chart-line { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cline x1='18' y1='20' x2='18' y2='10'/%3E%3Cline x1='12' y1='20' x2='12' y2='4'/%3E%3Cline x1='6' y1='20' x2='6' y2='14'/%3E%3C/svg%3E") center/contain no-repeat; }
        .fa-home { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'/%3E%3Cpolyline points='9 22 9 12 15 12 15 22'/%3E%3C/svg%3E") center/contain no-repeat; }
        .fa-users { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='9' cy='7' r='4'/%3E%3Cpath d='M23 21v-2a4 4 0 0 0-3-3.87'/%3E%3Cpath d='M16 3.13a4 4 0 0 1 0 7.75'/%3E%3C/svg%3E") center/contain no-repeat; }
        .fa-key { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4'/%3E%3C/svg%3E") center/contain no-repeat; }
        .fa-chart-bar { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cline x1='12' y1='20' x2='12' y2='10'/%3E%3Cline x1='18' y1='20' x2='18' y2='4'/%3E%3Cline x1='6' y1='20' x2='6' y2='16'/%3E%3C/svg%3E") center/contain no-repeat; }
        .fa-shield-alt { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/%3E%3C/svg%3E") center/contain no-repeat; }
        .fa-telegram { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='m22 2-7 20-4-9-9-4z'/%3E%3Cpath d='M22 2 11 13'/%3E%3C/svg%3E") center/contain no-repeat; }
        .fa-history { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8'/%3E%3Cpath d='M3 3v5h5'/%3E%3Cpath d='M12 7v5l4 2'/%3E%3C/svg%3E") center/contain no-repeat; }
        .fa-cog { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='3'/%3E%3Cpath d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z'/%3E%3C/svg%3E") center/contain no-repeat; }
        .fa-book { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M4 19.5A2.5 2.5 0 0 1 6.5 17H20'/%3E%3Cpath d='M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z'/%3E%3C/svg%3E") center/contain no-repeat; }
        .fa-bars { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cline x1='3' y1='12' x2='21' y2='12'/%3E%3Cline x1='3' y1='6' x2='21' y2='6'/%3E%3Cline x1='3' y1='18' x2='21' y2='18'/%3E%3C/svg%3E") center/contain no-repeat; }
        .fa-moon { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z'/%3E%3C/svg%3E") center/contain no-repeat; }
        .fa-sun { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='5'/%3E%3Cline x1='12' y1='1' x2='12' y2='3'/%3E%3Cline x1='12' y1='21' x2='12' y2='23'/%3E%3Cline x1='4.22' y1='4.22' x2='5.64' y2='5.64'/%3E%3Cline x1='18.36' y1='18.36' x2='19.78' y2='19.78'/%3E%3Cline x1='1' y1='12' x2='3' y2='12'/%3E%3Cline x1='21' y1='12' x2='23' y2='12'/%3E%3Cline x1='4.22' y1='19.78' x2='5.64' y2='18.36'/%3E%3Cline x1='18.36' y1='5.64' x2='19.78' y2='4.22'/%3E%3C/svg%3E") center/contain no-repeat; }
        .fa-bell { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9'/%3E%3Cpath d='M13.73 21a2 2 0 0 1-3.46 0'/%3E%3C/svg%3E") center/contain no-repeat; }
        .fa-chevron-down { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E") center/contain no-repeat; }
        .fa-user { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='12' cy='7' r='4'/%3E%3C/svg%3E") center/contain no-repeat; }
        .fa-lock { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Crect x='3' y='11' width='18' height='11' rx='2' ry='2'/%3E%3Cpath d='M7 11V7a5 5 0 0 1 10 0v4'/%3E%3C/svg%3E") center/contain no-repeat; }
        .fa-sign-out-alt { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4'/%3E%3Cpolyline points='16 17 21 12 16 7'/%3E%3Cline x1='21' y1='12' x2='9' y2='12'/%3E%3C/svg%3E") center/contain no-repeat; }
        .fa-plus { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cline x1='12' y1='5' x2='12' y2='19'/%3E%3Cline x1='5' y1='12' x2='19' y2='12'/%3E%3C/svg%3E") center/contain no-repeat; }
        .fa-search { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'/%3E%3C/svg%3E") center/contain no-repeat; }
        .fa-edit { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'/%3E%3Cpath d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'/%3E%3C/svg%3E") center/contain no-repeat; }
        .fa-trash { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpolyline points='3 6 5 6 21 6'/%3E%3Cpath d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'/%3E%3C/svg%3E") center/contain no-repeat; }
        .fa-copy { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Crect x='9' y='9' width='13' height='13' rx='2' ry='2'/%3E%3Cpath d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'/%3E%3C/svg%3E") center/contain no-repeat; }
        .fa-check { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpolyline points='20 6 9 17 4 12'/%3E%3C/svg%3E") center/contain no-repeat; }
        .fa-times { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cline x1='18' y1='6' x2='6' y2='18'/%3E%3Cline x1='6' y1='6' x2='18' y2='18'/%3E%3C/svg%3E") center/contain no-repeat; }
        .fa-save { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z'/%3E%3Cpolyline points='17 21 17 13 7 13 7 21'/%3E%3Cpolyline points='7 3 7 8 15 8'/%3E%3C/svg%3E") center/contain no-repeat; }
        .fa-download { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'/%3E%3Cpolyline points='7 10 12 15 17 10'/%3E%3Cline x1='12' y1='15' x2='12' y2='3'/%3E%3C/svg%3E") center/contain no-repeat; }
        .fa-refresh, .fa-sync { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpolyline points='23 4 23 10 17 10'/%3E%3Cpolyline points='1 20 1 14 7 14'/%3E%3Cpath d='M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15'/%3E%3C/svg%3E") center/contain no-repeat; }
        .fa-eye { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z'/%3E%3Ccircle cx='12' cy='12' r='3'/%3E%3C/svg%3E") center/contain no-repeat; }
        .fa-eye-slash { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24'/%3E%3Cline x1='1' y1='1' x2='23' y2='23'/%3E%3C/svg%3E") center/contain no-repeat; }
        .fa-spinner { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cline x1='12' y1='2' x2='12' y2='6'/%3E%3Cline x1='12' y1='18' x2='12' y2='22'/%3E%3Cline x1='4.93' y1='4.93' x2='7.76' y2='7.76'/%3E%3Cline x1='16.24' y1='16.24' x2='19.07' y2='19.07'/%3E%3Cline x1='2' y1='12' x2='6' y2='12'/%3E%3Cline x1='18' y1='12' x2='22' y2='12'/%3E%3Cline x1='4.93' y1='19.07' x2='7.76' y2='16.24'/%3E%3Cline x1='16.24' y1='7.76' x2='19.07' y2='4.93'/%3E%3C/svg%3E") center/contain no-repeat; animation: spin 1s linear infinite; }
        .fa-exclamation-circle { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cline x1='12' y1='8' x2='12' y2='12'/%3E%3Cline x1='12' y1='16' x2='12.01' y2='16'/%3E%3C/svg%3E") center/contain no-repeat; }
        .fa-check-circle { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M22 11.08V12a10 10 0 1 1-5.93-9.14'/%3E%3Cpolyline points='22 4 12 14.01 9 11.01'/%3E%3C/svg%3E") center/contain no-repeat; }
        .fa-info-circle { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cline x1='12' y1='16' x2='12' y2='12'/%3E%3Cline x1='12' y1='8' x2='12.01' y2='8'/%3E%3C/svg%3E") center/contain no-repeat; }
        .fa-warning, .fa-exclamation-triangle { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z'/%3E%3Cline x1='12' y1='9' x2='12' y2='13'/%3E%3Cline x1='12' y1='17' x2='12.01' y2='17'/%3E%3C/svg%3E") center/contain no-repeat; }
        .fa-clock { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpolyline points='12 6 12 12 16 14'/%3E%3C/svg%3E") center/contain no-repeat; }
        .fa-calendar { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Crect x='3' y='4' width='18' height='18' rx='2' ry='2'/%3E%3Cline x1='16' y1='2' x2='16' y2='6'/%3E%3Cline x1='8' y1='2' x2='8' y2='6'/%3E%3Cline x1='3' y1='10' x2='21' y2='10'/%3E%3C/svg%3E") center/contain no-repeat; }
        .fa-envelope { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z'/%3E%3Cpolyline points='22,6 12,13 2,6'/%3E%3C/svg%3E") center/contain no-repeat; }
        .fa-globe { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cline x1='2' y1='12' x2='22' y2='12'/%3E%3Cpath d='M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'/%3E%3C/svg%3E") center/contain no-repeat; }
        .fa-database { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cellipse cx='12' cy='5' rx='9' ry='3'/%3E%3Cpath d='M21 12c0 1.66-4 3-9 3s-9-1.34-9-3'/%3E%3Cpath d='M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5'/%3E%3C/svg%3E") center/contain no-repeat; }
        .fa-server { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Crect x='2' y='2' width='20' height='8' rx='2' ry='2'/%3E%3Crect x='2' y='14' width='20' height='8' rx='2' ry='2'/%3E%3Cline x1='6' y1='6' x2='6.01' y2='6'/%3E%3Cline x1='6' y1='18' x2='6.01' y2='18'/%3E%3C/svg%3E") center/contain no-repeat; }
        .fa-plug { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M12 22v-5'/%3E%3Cpath d='M9 8V2'/%3E%3Cpath d='M15 8V2'/%3E%3Cpath d='M18 8v5a6 6 0 0 1-6 6v0a6 6 0 0 1-6-6V8Z'/%3E%3C/svg%3E") center/contain no-repeat; }
        .fa-filter { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpolygon points='22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3'/%3E%3C/svg%3E") center/contain no-repeat; }
        .fa-sign-in-alt { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4'/%3E%3Cpolyline points='10 17 15 12 10 7'/%3E%3Cline x1='15' y1='12' x2='3' y2='12'/%3E%3C/svg%3E") center/contain no-repeat; }
        .fa-paper-plane { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cline x1='22' y1='2' x2='11' y2='13'/%3E%3Cpolygon points='22 2 15 22 11 13 2 9 22 2'/%3E%3C/svg%3E") center/contain no-repeat; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, 
                rgb(var(--bg-base)) 0%, 
                rgb(var(--bg-surface)) 50%, 
                rgb(var(--bg-elevated)) 100%);
            color: rgb(var(--text-primary));
            min-height: 100vh;
            overflow-x: hidden;
            -webkit-font-smoothing: antialiased;
        }
        
        /* Animated Background */
        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
                radial-gradient(circle at 20% 80%, rgb(var(--primary) / 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgb(var(--accent) / 0.1) 0%, transparent 50%),
                radial-gradient(circle at 50% 50%, rgb(var(--info) / 0.05) 0%, transparent 70%);
            pointer-events: none;
            z-index: -1;
        }
        
        /* =====================================================
           SCROLLBAR STYLES
           ===================================================== */
        ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        
        ::-webkit-scrollbar-track {
            background: rgb(var(--bg-surface));
        }
        
        ::-webkit-scrollbar-thumb {
            background: rgb(var(--primary) / 0.3);
            border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
            background: rgb(var(--primary) / 0.5);
        }
        
        /* =====================================================
           LAYOUT WRAPPER
           ===================================================== */
        .app-wrapper {
            display: flex;
            min-height: 100vh;
        }
        
        /* =====================================================
           SIDEBAR STYLES
           ===================================================== */
        .sidebar {
            width: var(--sidebar-width);
            height: 100vh;
            position: fixed;
            left: 0;
            top: 0;
            background: rgb(var(--bg-surface) / 0.95);
            backdrop-filter: blur(20px);
            border-right: 1px solid rgb(var(--border) / var(--border-opacity));
            display: flex;
            flex-direction: column;
            z-index: 100;
            transition: transform var(--transition-base), width var(--transition-base);
        }
        
        .sidebar.collapsed {
            width: var(--sidebar-collapsed);
        }
        
        .sidebar.collapsed .nav-text,
        .sidebar.collapsed .sidebar-brand-text,
        .sidebar.collapsed .nav-group-label,
        .sidebar.collapsed .user-info-text {
            opacity: 0;
            width: 0;
            overflow: hidden;
        }
        
        @media (max-width: 1024px) {
            .sidebar {
                transform: translateX(-100%);
            }
            .sidebar.open {
                transform: translateX(0);
            }
        }
        
        /* Sidebar Brand */
        .sidebar-brand {
            padding: 20px;
            display: flex;
            align-items: center;
            gap: 12px;
            border-bottom: 1px solid rgb(var(--border) / var(--border-opacity));
        }
        
        .sidebar-brand-icon {
            width: 44px;
            height: 44px;
            background: linear-gradient(135deg, rgb(var(--primary)), rgb(var(--accent)));
            border-radius: var(--radius-md);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            color: white;
            flex-shrink: 0;
            box-shadow: 0 4px 12px rgb(var(--primary) / 0.4);
        }
        
        .sidebar-brand-text h1 {
            font-size: 18px;
            font-weight: 700;
            background: linear-gradient(135deg, rgb(var(--primary-light)), rgb(var(--accent)));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            white-space: nowrap;
        }
        
        .sidebar-brand-text p {
            font-size: 11px;
            color: rgb(var(--text-muted));
            white-space: nowrap;
        }
        
        /* Sidebar Navigation */
        .sidebar-nav {
            flex: 1;
            overflow-y: auto;
            padding: 16px 12px;
        }
        
        .nav-group {
            margin-bottom: 8px;
        }
        
        .nav-group-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 12px;
            color: rgb(var(--text-muted));
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            cursor: pointer;
            border-radius: var(--radius-sm);
            transition: all var(--transition-fast);
        }
        
        .nav-group-header:hover {
            background: rgb(var(--primary) / 0.05);
            color: rgb(var(--text-secondary));
        }
        
        .nav-group-header .chevron {
            transition: transform var(--transition-fast);
        }
        
        .nav-group.collapsed .chevron {
            transform: rotate(-90deg);
        }
        
        .nav-group.collapsed .nav-group-items {
            display: none;
        }
        
        .nav-group-items {
            margin-top: 4px;
        }
        
        .nav-link {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 14px;
            color: rgb(var(--text-secondary));
            text-decoration: none;
            border-radius: var(--radius-md);
            font-size: 14px;
            font-weight: 500;
            transition: all var(--transition-fast);
            position: relative;
            overflow: hidden;
        }
        
        .nav-link::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%) scaleY(0);
            width: 3px;
            height: 60%;
            background: linear-gradient(180deg, rgb(var(--primary)), rgb(var(--accent)));
            border-radius: 0 2px 2px 0;
            transition: transform var(--transition-fast);
        }
        
        .nav-link:hover {
            background: rgb(var(--primary) / 0.1);
            color: rgb(var(--text-primary));
        }
        
        .nav-link.active {
            background: linear-gradient(135deg, rgb(var(--primary) / 0.15), rgb(var(--accent) / 0.1));
            color: rgb(var(--primary-light));
        }
        
        .nav-link.active::before {
            transform: translateY(-50%) scaleY(1);
        }
        
        .nav-link i {
            width: 20px;
            text-align: center;
            font-size: 16px;
            flex-shrink: 0;
        }
        
        .nav-link .badge {
            margin-left: auto;
            background: rgb(var(--danger));
            color: white;
            font-size: 10px;
            padding: 2px 6px;
            border-radius: 10px;
            font-weight: 600;
        }
        
        /* Sidebar Footer */
        .sidebar-footer {
            padding: 16px;
            border-top: 1px solid rgb(var(--border) / var(--border-opacity));
        }
        
        .sidebar-user {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            background: rgb(var(--primary) / 0.05);
            border-radius: var(--radius-md);
            cursor: pointer;
            transition: all var(--transition-fast);
        }
        
        .sidebar-user:hover {
            background: rgb(var(--primary) / 0.1);
        }
        
        .sidebar-user-avatar {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, rgb(var(--primary)), rgb(var(--accent)));
            border-radius: var(--radius-md);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            color: white;
            flex-shrink: 0;
        }
        
        .user-info-text h4 {
            font-size: 14px;
            font-weight: 600;
            white-space: nowrap;
        }
        
        .user-info-text .role-badge {
            display: inline-block;
            margin-top: 2px;
            font-size: 10px;
            padding: 2px 8px;
            background: rgb(var(--success) / 0.15);
            color: rgb(var(--success));
            border-radius: 10px;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        /* =====================================================
           MAIN CONTENT AREA
           ===================================================== */
        .main-content {
            flex: 1;
            margin-left: var(--sidebar-width);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            transition: margin-left var(--transition-base);
        }
        
        .sidebar.collapsed ~ .main-content {
            margin-left: var(--sidebar-collapsed);
        }
        
        @media (max-width: 1024px) {
            .main-content {
                margin-left: 0;
            }
        }
        
        /* =====================================================
           HEADER STYLES
           ===================================================== */
        .top-header {
            height: var(--header-height);
            background: rgb(var(--bg-surface) / 0.8);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid rgb(var(--border) / var(--border-opacity));
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 24px;
            position: sticky;
            top: 0;
            z-index: 50;
        }
        
        .header-left {
            display: flex;
            align-items: center;
            gap: 16px;
        }
        
        .mobile-menu-btn {
            display: none;
            width: 40px;
            height: 40px;
            align-items: center;
            justify-content: center;
            border: none;
            background: rgb(var(--primary) / 0.1);
            color: rgb(var(--text-primary));
            border-radius: var(--radius-md);
            cursor: pointer;
            transition: all var(--transition-fast);
        }
        
        .mobile-menu-btn:hover {
            background: rgb(var(--primary) / 0.2);
        }
        
        @media (max-width: 1024px) {
            .mobile-menu-btn {
                display: flex;
            }
        }
        
        .sidebar-toggle-btn {
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            background: rgb(var(--primary) / 0.1);
            color: rgb(var(--text-secondary));
            border-radius: var(--radius-sm);
            cursor: pointer;
            transition: all var(--transition-fast);
        }
        
        .sidebar-toggle-btn:hover {
            background: rgb(var(--primary) / 0.2);
            color: rgb(var(--text-primary));
        }
        
        @media (max-width: 1024px) {
            .sidebar-toggle-btn {
                display: none;
            }
        }
        
        .page-title {
            font-size: 20px;
            font-weight: 700;
        }
        
        .header-right {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .header-btn {
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            background: transparent;
            color: rgb(var(--text-secondary));
            border-radius: var(--radius-md);
            cursor: pointer;
            transition: all var(--transition-fast);
            position: relative;
        }
        
        .header-btn:hover {
            background: rgb(var(--primary) / 0.1);
            color: rgb(var(--text-primary));
        }
        
        .header-btn .notification-dot {
            position: absolute;
            top: 8px;
            right: 8px;
            width: 8px;
            height: 8px;
            background: rgb(var(--danger));
            border-radius: 50%;
            border: 2px solid rgb(var(--bg-surface));
        }
        
        .header-btn .badge-count {
            position: absolute;
            top: 4px;
            right: 4px;
            min-width: 18px;
            height: 18px;
            background: rgb(var(--danger));
            color: white;
            font-size: 10px;
            font-weight: 700;
            border-radius: 9px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 4px;
        }
        
        /* Profile Dropdown */
        .profile-dropdown {
            position: relative;
        }
        
        .profile-btn {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 6px 12px 6px 6px;
            background: rgb(var(--primary) / 0.05);
            border: 1px solid rgb(var(--border) / var(--border-opacity));
            border-radius: var(--radius-lg);
            cursor: pointer;
            transition: all var(--transition-fast);
        }
        
        .profile-btn:hover {
            background: rgb(var(--primary) / 0.1);
            border-color: rgb(var(--primary) / 0.3);
        }
        
        .profile-avatar {
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, rgb(var(--primary)), rgb(var(--accent)));
            border-radius: var(--radius-md);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 13px;
            color: white;
        }
        
        .profile-info {
            text-align: left;
        }
        
        .profile-info .name {
            font-size: 13px;
            font-weight: 600;
        }
        
        .profile-info .role {
            font-size: 11px;
            color: rgb(var(--text-muted));
        }
        
        .profile-menu {
            position: absolute;
            top: calc(100% + 8px);
            right: 0;
            min-width: 220px;
            background: rgb(var(--bg-surface));
            border: 1px solid rgb(var(--border) / var(--border-opacity));
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg);
            opacity: 0;
            visibility: hidden;
            transform: translateY(-10px);
            transition: all var(--transition-fast);
            z-index: 1000;
        }
        
        .profile-dropdown.open .profile-menu {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }
        
        .profile-menu-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            color: rgb(var(--text-secondary));
            text-decoration: none;
            transition: all var(--transition-fast);
        }
        
        .profile-menu-item:first-child {
            border-radius: var(--radius-lg) var(--radius-lg) 0 0;
        }
        
        .profile-menu-item:last-child {
            border-radius: 0 0 var(--radius-lg) var(--radius-lg);
        }
        
        .profile-menu-item:hover {
            background: rgb(var(--primary) / 0.1);
            color: rgb(var(--text-primary));
        }
        
        .profile-menu-item.danger:hover {
            background: rgb(var(--danger) / 0.1);
            color: rgb(var(--danger));
        }
        
        .profile-menu-divider {
            height: 1px;
            background: rgb(var(--border) / var(--border-opacity));
            margin: 4px 0;
        }
        
        /* =====================================================
           PAGE CONTENT STYLES
           ===================================================== */
        .page-content {
            flex: 1;
            padding: 24px;
        }
        
        /* =====================================================
           CARD COMPONENTS
           ===================================================== */
        .card {
            background: rgb(var(--bg-card) / 0.8);
            border: 1px solid rgb(var(--border) / var(--border-opacity));
            border-radius: var(--radius-lg);
            backdrop-filter: blur(10px);
            transition: all var(--transition-fast);
        }
        
        .card:hover {
            border-color: rgb(var(--border) / 0.3);
            box-shadow: var(--shadow-md);
        }
        
        .card-header {
            padding: 20px 24px;
            border-bottom: 1px solid rgb(var(--border) / var(--border-opacity));
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        .card-title {
            font-size: 16px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .card-title i {
            color: rgb(var(--primary));
        }
        
        .card-body {
            padding: 24px;
        }
        
        /* Stats Cards */
        .stat-card {
            padding: 24px;
            display: flex;
            align-items: flex-start;
            gap: 16px;
        }
        
        .stat-icon {
            width: 56px;
            height: 56px;
            border-radius: var(--radius-lg);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            flex-shrink: 0;
        }
        
        .stat-icon.primary {
            background: rgb(var(--primary) / 0.15);
            color: rgb(var(--primary-light));
        }
        
        .stat-icon.success {
            background: rgb(var(--success) / 0.15);
            color: rgb(var(--success));
        }
        
        .stat-icon.warning {
            background: rgb(var(--warning) / 0.15);
            color: rgb(var(--warning));
        }
        
        .stat-icon.danger {
            background: rgb(var(--danger) / 0.15);
            color: rgb(var(--danger));
        }
        
        .stat-icon.info {
            background: rgb(var(--info) / 0.15);
            color: rgb(var(--info));
        }
        
        .stat-content h3 {
            font-size: 28px;
            font-weight: 800;
            line-height: 1;
        }
        
        .stat-content p {
            font-size: 13px;
            color: rgb(var(--text-muted));
            margin-top: 4px;
        }
        
        .stat-trend {
            margin-top: 8px;
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 4px;
        }
        
        .stat-trend.up {
            color: rgb(var(--success));
        }
        
        .stat-trend.down {
            color: rgb(var(--danger));
        }
        
        /* =====================================================
           BUTTON STYLES
           ===================================================== */
        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 10px 20px;
            font-size: 14px;
            font-weight: 600;
            border-radius: var(--radius-md);
            border: none;
            cursor: pointer;
            transition: all var(--transition-fast);
            text-decoration: none;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, rgb(var(--primary)), rgb(var(--primary-hover)));
            color: white;
            box-shadow: 0 4px 12px rgb(var(--primary) / 0.4);
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgb(var(--primary) / 0.5);
        }
        
        .btn-secondary {
            background: rgb(var(--bg-elevated));
            color: rgb(var(--text-primary));
            border: 1px solid rgb(var(--border) / var(--border-opacity));
        }
        
        .btn-secondary:hover {
            background: rgb(var(--primary) / 0.1);
            border-color: rgb(var(--primary) / 0.3);
        }
        
        .btn-success {
            background: linear-gradient(135deg, rgb(var(--success)), rgb(10 160 110));
            color: white;
        }
        
        .btn-danger {
            background: linear-gradient(135deg, rgb(var(--danger)), rgb(220 50 50));
            color: white;
        }
        
        .btn-sm {
            padding: 6px 12px;
            font-size: 12px;
        }
        
        .btn-lg {
            padding: 14px 28px;
            font-size: 16px;
        }
        
        .btn-icon {
            width: 36px;
            height: 36px;
            padding: 0;
        }
        
        /* =====================================================
           FORM STYLES
           ===================================================== */
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-label {
            display: block;
            font-size: 13px;
            font-weight: 600;
            color: rgb(var(--text-secondary));
            margin-bottom: 8px;
        }
        
        .form-control {
            width: 100%;
            padding: 12px 16px;
            font-size: 14px;
            color: rgb(var(--text-primary));
            background: rgb(var(--bg-base));
            border: 1px solid rgb(var(--border) / var(--border-opacity));
            border-radius: var(--radius-md);
            transition: all var(--transition-fast);
        }
        
        .form-control:focus {
            outline: none;
            border-color: rgb(var(--primary));
            box-shadow: 0 0 0 3px rgb(var(--primary) / 0.1);
        }
        
        .form-control::placeholder {
            color: rgb(var(--text-muted));
        }
        
        select.form-control {
            cursor: pointer;
        }
        
        /* =====================================================
           TABLE STYLES
           ===================================================== */
        .table-container {
            overflow-x: auto;
            border-radius: var(--radius-md);
        }
        
        .data-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .data-table th {
            padding: 14px 16px;
            text-align: left;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: rgb(var(--text-muted));
            background: rgb(var(--primary) / 0.05);
            border-bottom: 1px solid rgb(var(--border) / var(--border-opacity));
        }
        
        .data-table td {
            padding: 14px 16px;
            font-size: 14px;
            border-bottom: 1px solid rgb(var(--border) / 0.1);
        }
        
        .data-table tbody tr {
            transition: background var(--transition-fast);
        }
        
        .data-table tbody tr:hover {
            background: rgb(var(--primary) / 0.05);
        }
        
        /* =====================================================
           BADGE STYLES
           ===================================================== */
        .badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 4px 10px;
            font-size: 11px;
            font-weight: 600;
            border-radius: 20px;
        }
        
        .badge-success {
            background: rgb(var(--success) / 0.15);
            color: rgb(var(--success));
        }
        
        .badge-warning {
            background: rgb(var(--warning) / 0.15);
            color: rgb(var(--warning));
        }
        
        .badge-danger {
            background: rgb(var(--danger) / 0.15);
            color: rgb(var(--danger));
        }
        
        .badge-primary {
            background: rgb(var(--primary) / 0.15);
            color: rgb(var(--primary-light));
        }
        
        .badge-info {
            background: rgb(var(--info) / 0.15);
            color: rgb(var(--info));
        }
        
        /* =====================================================
           TOAST NOTIFICATIONS
           ===================================================== */
        .toast-container {
            position: fixed;
            top: 24px;
            right: 24px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        
        .toast {
            min-width: 320px;
            padding: 16px 20px;
            background: rgb(var(--bg-surface));
            border: 1px solid rgb(var(--border) / var(--border-opacity));
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg);
            display: flex;
            align-items: flex-start;
            gap: 12px;
            animation: slideIn 0.3s ease;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .toast.success { border-left: 4px solid rgb(var(--success)); }
        .toast.error { border-left: 4px solid rgb(var(--danger)); }
        .toast.warning { border-left: 4px solid rgb(var(--warning)); }
        .toast.info { border-left: 4px solid rgb(var(--info)); }
        
        .toast-icon {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        
        .toast.success .toast-icon { background: rgb(var(--success) / 0.15); color: rgb(var(--success)); }
        .toast.error .toast-icon { background: rgb(var(--danger) / 0.15); color: rgb(var(--danger)); }
        .toast.warning .toast-icon { background: rgb(var(--warning) / 0.15); color: rgb(var(--warning)); }
        .toast.info .toast-icon { background: rgb(var(--info) / 0.15); color: rgb(var(--info)); }
        
        .toast-content {
            flex: 1;
        }
        
        .toast-title {
            font-weight: 600;
            font-size: 14px;
        }
        
        .toast-message {
            font-size: 13px;
            color: rgb(var(--text-muted));
            margin-top: 2px;
        }
        
        .toast-close {
            background: none;
            border: none;
            color: rgb(var(--text-muted));
            cursor: pointer;
            padding: 4px;
            transition: color var(--transition-fast);
        }
        
        .toast-close:hover {
            color: rgb(var(--text-primary));
        }
        
        /* =====================================================
           LOADING & SKELETON
           ===================================================== */
        .skeleton {
            background: linear-gradient(90deg, 
                rgb(var(--bg-elevated)) 0%, 
                rgb(var(--primary) / 0.1) 50%, 
                rgb(var(--bg-elevated)) 100%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: var(--radius-sm);
        }
        
        @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }
        
        .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgb(var(--primary) / 0.2);
            border-top-color: rgb(var(--primary));
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        /* =====================================================
           MODAL STYLES
           ===================================================== */
        .modal-backdrop {
            position: fixed;
            inset: 0;
            background: rgb(0 0 0 / 0.6);
            backdrop-filter: blur(4px);
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
            transition: all var(--transition-base);
        }
        
        .modal-backdrop.open {
            opacity: 1;
            visibility: visible;
        }
        
        .modal {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.95);
            width: 90%;
            max-width: 500px;
            max-height: 90vh;
            background: rgb(var(--bg-surface));
            border: 1px solid rgb(var(--border) / var(--border-opacity));
            border-radius: var(--radius-xl);
            box-shadow: var(--shadow-lg);
            z-index: 1001;
            opacity: 0;
            visibility: hidden;
            transition: all var(--transition-base);
            overflow: hidden;
        }
        
        .modal-backdrop.open .modal {
            opacity: 1;
            visibility: visible;
            transform: translate(-50%, -50%) scale(1);
        }
        
        .modal-header {
            padding: 20px 24px;
            border-bottom: 1px solid rgb(var(--border) / var(--border-opacity));
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        .modal-title {
            font-size: 18px;
            font-weight: 700;
        }
        
        .modal-body {
            padding: 24px;
            overflow-y: auto;
            max-height: 60vh;
        }
        
        .modal-footer {
            padding: 16px 24px;
            border-top: 1px solid rgb(var(--border) / var(--border-opacity));
            display: flex;
            justify-content: flex-end;
            gap: 12px;
        }
        
        /* =====================================================
           RESPONSIVE UTILITIES
           ===================================================== */
        .grid {
            display: grid;
            gap: 24px;
        }
        
        .grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
        .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
        .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
        .grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
        
        @media (max-width: 1280px) {
            .lg-cols-3 { grid-template-columns: repeat(3, 1fr); }
            .lg-cols-2 { grid-template-columns: repeat(2, 1fr); }
        }
        
        @media (max-width: 1024px) {
            .md-cols-2 { grid-template-columns: repeat(2, 1fr); }
            .md-cols-1 { grid-template-columns: repeat(1, 1fr); }
        }
        
        @media (max-width: 768px) {
            .sm-cols-1 { grid-template-columns: repeat(1, 1fr); }
        }
        
        .flex { display: flex; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .gap-2 { gap: 8px; }
        .gap-4 { gap: 16px; }
        .gap-6 { gap: 24px; }
        
        .mb-4 { margin-bottom: 16px; }
        .mb-6 { margin-bottom: 24px; }
        .mb-8 { margin-bottom: 32px; }
        
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        
        .text-sm { font-size: 13px; }
        .text-xs { font-size: 11px; }
        .text-lg { font-size: 18px; }
        .text-xl { font-size: 20px; }
        .text-2xl { font-size: 24px; }
        .text-3xl { font-size: 30px; }
        
        .font-medium { font-weight: 500; }
        .font-semibold { font-weight: 600; }
        .font-bold { font-weight: 700; }
        
        .text-muted { color: rgb(var(--text-muted)); }
        .text-secondary { color: rgb(var(--text-secondary)); }
        
        /* Mobile Overlay */
        .sidebar-overlay {
            display: none;
            position: fixed;
            inset: 0;
            background: rgb(0 0 0 / 0.5);
            z-index: 99;
        }
        
        @media (max-width: 1024px) {
            .sidebar-overlay.active {
                display: block;
            }
        }
        
        /* Quick Actions */
        .quick-action {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 16px;
            background: rgb(var(--primary) / 0.05);
            border: 1px solid rgb(var(--border) / var(--border-opacity));
            border-radius: var(--radius-lg);
            text-decoration: none;
            color: rgb(var(--text-primary));
            transition: all var(--transition-fast);
        }
        
        .quick-action:hover {
            background: rgb(var(--primary) / 0.1);
            border-color: rgb(var(--primary) / 0.3);
            transform: translateY(-2px);
        }
        
        .quick-action i {
            font-size: 24px;
            margin-bottom: 8px;
            color: rgb(var(--primary-light));
        }
        
        .quick-action span {
            font-size: 13px;
            font-weight: 500;
        }
        
        /* Empty State */
        .empty-state {
            text-align: center;
            padding: 48px 24px;
        }
        
        .empty-state-icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 16px;
            background: rgb(var(--primary) / 0.1);
            border-radius: var(--radius-xl);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            color: rgb(var(--primary-light));
        }
        
        .empty-state h3 {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 8px;
        }
        
        .empty-state p {
            color: rgb(var(--text-muted));
            max-width: 320px;
            margin: 0 auto;
        }
    </style>
</head>
<body>
    <div class="app-wrapper">
        <!-- Mobile Overlay -->
        <div class="sidebar-overlay" id="sidebarOverlay" onclick="closeSidebar()"></div>
        
        <!-- Sidebar -->
        <aside class="sidebar" id="sidebar">
            <!-- Brand -->
            <div class="sidebar-brand">
                <div class="sidebar-brand-icon">
                    <i class="fas fa-chart-line"></i>
                </div>
                <div class="sidebar-brand-text">
                    <h1><?php echo SITE_NAME; ?></h1>
                    <p>API Management</p>
                </div>
            </div>
            
            <!-- Navigation -->
            <nav class="sidebar-nav">
                <!-- Main Menu -->
                <div class="nav-group">
                    <div class="nav-group-header" onclick="toggleNavGroup(this)">
                        <span class="nav-group-label">Main Menu</span>
                        <i class="fas fa-chevron-down chevron"></i>
                    </div>
                    <div class="nav-group-items">
                        <a href="dashboard.php" class="nav-link <?php echo $current_page === 'dashboard' ? 'active' : ''; ?>">
                            <i class="fas fa-home"></i>
                            <span class="nav-text">Dashboard</span>
                        </a>
                        <?php if (is_admin()): ?>
                        <a href="users.php" class="nav-link <?php echo $current_page === 'users' ? 'active' : ''; ?>">
                            <i class="fas fa-users"></i>
                            <span class="nav-text">Users</span>
                        </a>
                        <?php endif; ?>
                        <a href="api-keys.php" class="nav-link <?php echo $current_page === 'api-keys' ? 'active' : ''; ?>">
                            <i class="fas fa-key"></i>
                            <span class="nav-text">API Keys</span>
                        </a>
                    </div>
                </div>
                
                <!-- System Monitor -->
                <?php if (is_admin()): ?>
                <div class="nav-group">
                    <div class="nav-group-header" onclick="toggleNavGroup(this)">
                        <span class="nav-group-label">System Monitor</span>
                        <i class="fas fa-chevron-down chevron"></i>
                    </div>
                    <div class="nav-group-items">
                        <a href="api-logs.php" class="nav-link <?php echo $current_page === 'api-logs' ? 'active' : ''; ?>">
                            <i class="fas fa-chart-bar"></i>
                            <span class="nav-text">Live Monitor</span>
                        </a>
                        <a href="ip-whitelist.php" class="nav-link <?php echo $current_page === 'ip-whitelist' ? 'active' : ''; ?>">
                            <i class="fas fa-shield-alt"></i>
                            <span class="nav-text">IP Whitelist</span>
                        </a>
                    </div>
                </div>
                
                <!-- Logs & Tools -->
                <div class="nav-group">
                    <div class="nav-group-header" onclick="toggleNavGroup(this)">
                        <span class="nav-group-label">Logs & Tools</span>
                        <i class="fas fa-chevron-down chevron"></i>
                    </div>
                    <div class="nav-group-items">
                        <a href="telegram-logs.php" class="nav-link <?php echo $current_page === 'telegram-logs' ? 'active' : ''; ?>">
                            <i class="fab fa-telegram"></i>
                            <span class="nav-text">Telegram Logs</span>
                        </a>
                        <a href="activity-logs.php" class="nav-link <?php echo $current_page === 'activity-logs' ? 'active' : ''; ?>">
                            <i class="fas fa-history"></i>
                            <span class="nav-text">Activity Logs</span>
                        </a>
                    </div>
                </div>
                <?php endif; ?>
                
                <!-- Settings -->
                <div class="nav-group">
                    <div class="nav-group-header" onclick="toggleNavGroup(this)">
                        <span class="nav-group-label">Configuration</span>
                        <i class="fas fa-chevron-down chevron"></i>
                    </div>
                    <div class="nav-group-items">
                        <?php if (is_admin()): ?>
                        <a href="settings.php" class="nav-link <?php echo $current_page === 'settings' ? 'active' : ''; ?>">
                            <i class="fas fa-cog"></i>
                            <span class="nav-text">Settings</span>
                        </a>
                        <?php endif; ?>
                        <a href="documentation.php" class="nav-link <?php echo $current_page === 'documentation' ? 'active' : ''; ?>">
                            <i class="fas fa-book"></i>
                            <span class="nav-text">Documentation</span>
                        </a>
                    </div>
                </div>
            </nav>
            
            <!-- Sidebar Footer / User -->
            <div class="sidebar-footer">
                <div class="sidebar-user" onclick="window.location='profile.php'">
                    <div class="sidebar-user-avatar">
                        <?php echo strtoupper(substr($current_user['username'] ?? 'U', 0, 1)); ?>
                    </div>
                    <div class="user-info-text">
                        <h4><?php echo htmlspecialchars($current_user['username'] ?? 'User'); ?></h4>
                        <span class="role-badge"><?php echo ucfirst($current_user['role'] ?? 'user'); ?></span>
                    </div>
                </div>
            </div>
        </aside>
        
        <!-- Main Content Area -->
        <div class="main-content">
            <!-- Top Header -->
            <header class="top-header">
                <div class="header-left">
                    <button class="mobile-menu-btn" onclick="toggleMobileSidebar()">
                        <i class="fas fa-bars"></i>
                    </button>
                    <button class="sidebar-toggle-btn" onclick="toggleSidebarCollapse()">
                        <i class="fas fa-bars"></i>
                    </button>
                    <h1 class="page-title"><?php echo $page_title ?? 'Dashboard'; ?></h1>
                </div>
                
                <div class="header-right">
                    <!-- Theme Toggle -->
                    <button class="header-btn" onclick="toggleTheme()" title="Toggle Theme">
                        <i class="fas fa-moon" id="themeIcon"></i>
                    </button>
                    
                    <!-- Notifications -->
                    <button class="header-btn" title="Notifications">
                        <i class="fas fa-bell"></i>
                        <?php if ($notification_count > 0): ?>
                        <span class="badge-count"><?php echo $notification_count; ?></span>
                        <?php endif; ?>
                    </button>
                    
                    <!-- Profile Dropdown -->
                    <div class="profile-dropdown" id="profileDropdown">
                        <button class="profile-btn" onclick="toggleProfileDropdown()">
                            <div class="profile-avatar">
                                <?php echo strtoupper(substr($current_user['username'] ?? 'U', 0, 1)); ?>
                            </div>
                            <div class="profile-info">
                                <div class="name"><?php echo htmlspecialchars($current_user['username'] ?? 'User'); ?></div>
                                <div class="role"><?php echo ucfirst($current_user['role'] ?? 'user'); ?></div>
                            </div>
                            <i class="fas fa-chevron-down" style="font-size: 12px; color: rgb(var(--text-muted));"></i>
                        </button>
                        
                        <div class="profile-menu">
                            <a href="profile.php" class="profile-menu-item">
                                <i class="fas fa-user"></i>
                                <span>Edit Profile</span>
                            </a>
                            <a href="profile.php?tab=password" class="profile-menu-item">
                                <i class="fas fa-lock"></i>
                                <span>Change Password</span>
                            </a>
                            <?php if (is_admin()): ?>
                            <a href="settings.php" class="profile-menu-item">
                                <i class="fas fa-cog"></i>
                                <span>Settings</span>
                            </a>
                            <?php endif; ?>
                            <div class="profile-menu-divider"></div>
                            <a href="logout.php" class="profile-menu-item danger">
                                <i class="fas fa-sign-out-alt"></i>
                                <span>Logout</span>
                            </a>
                        </div>
                    </div>
                </div>
            </header>
            
            <!-- Page Content -->
            <div class="page-content">
