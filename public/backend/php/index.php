<?php
/**
 * =====================================================
 * 🏠 HYPER SOFTS TREND API - LOGIN PAGE
 * =====================================================
 * Main entry point - redirects to admin/login.php
 * =====================================================
 */

session_start();

// If already logged in, redirect to dashboard
if (isset($_SESSION['user_id'])) {
    header('Location: admin/dashboard.php');
    exit;
}

// Redirect to login page
header('Location: admin/login.php');
exit;
