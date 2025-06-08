import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// 认证页面
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// 仪表盘
import DashboardPage from './pages/dashboard/DashboardPage';

// 卡片管理
import ReceivedCardsPage from './pages/cards/ReceivedCardsPage';
import SentCardsPage from './pages/cards/SentCardsPage';
import EyeballCardsPage from './pages/cards/EyeballCardsPage';
import CardDetailPage from './pages/cards/CardDetailPage';
import AddCardPage from './pages/cards/AddCardPage';

// 标签识别
import QrcodePage from './pages/tags/QrcodePage';
import RfidPage from './pages/tags/RfidPage';

// 分类管理
import CategoriesPage from './pages/categories/CategoriesPage';

// 标签管理
import TagsPage from './pages/tags/TagsPage';

// RFID设备
import RfidDevicesPage from './pages/rfid-devices/RfidDevicesPage';

// 呼号关联
import CallsignAssociationsPage from './pages/callsign-associations/CallsignAssociationsPage';

// 证书管理
import CertificatesPage from './pages/certificates/CertificatesPage';

// 系统设置
import SettingsPage from './pages/settings/SettingsPage';

// 错误页面
import NotFoundPage from './pages/NotFoundPage';

// 认证保护组件
import ProtectedRoute from './components/ProtectedRoute';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'cards',
        children: [
          { index: true, element: <Navigate to="/cards/received" replace /> },
          { path: 'received', element: <ReceivedCardsPage /> },
          { path: 'sent', element: <SentCardsPage /> },
          { path: 'eyeball', element: <EyeballCardsPage /> },
          { path: ':id', element: <CardDetailPage /> },
          { path: 'add', element: <AddCardPage /> },
        ],
      },
      {
        path: 'tags',
        children: [
          { index: true, element: <Navigate to="/tags/qrcode" replace /> },
          { path: 'qrcode', element: <QrcodePage /> },
          { path: 'rfid', element: <RfidPage /> },
          { path: 'manage', element: <TagsPage /> },
        ],
      },
      {
        path: 'categories',
        element: <CategoriesPage />,
      },
      {
        path: 'rfid-devices',
        element: <RfidDevicesPage />,
      },
      {
        path: 'callsign-associations',
        element: <CallsignAssociationsPage />,
      },
      {
        path: 'certificates',
        element: <CertificatesPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { index: true, element: <Navigate to="/auth/login" replace /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default router;

