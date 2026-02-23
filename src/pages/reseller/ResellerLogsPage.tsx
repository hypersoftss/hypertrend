import React from 'react';
import UserLogsPage from '@/pages/user/UserLogsPage';

// Reseller logs page reuses the user logs page since both show logs for own keys
const ResellerLogsPage = () => <UserLogsPage />;

export default ResellerLogsPage;
