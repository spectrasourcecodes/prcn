import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Deposit from './pages/Deposit';
import Withdraw from './pages/Withdraw';
import Transactions from './pages/Transactions';
import InvestmentPlans from './pages/InvestmentPlans';
import Profile from './pages/Profile';
import Support from './pages/Support';
import Security from './pages/Security';
import Market from './pages/Market';
import Referrals from './pages/Referrals';
import LivePayouts from './pages/LivePayouts';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import PaymentProof from './pages/PaymentProof';
import ForgotPassword from './pages/ForgotPassword';
import KYC from './pages/KYC';

// Admin imports
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import DepositManagement from './pages/admin/DepositManagement';
import WithdrawalManagement from './pages/admin/WithdrawalManagement';
import AdminProfile from './pages/admin/AdminProfile';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminInvestmentPlans from './pages/admin/AdminInvestmentPlans';
import WalletManagement from './pages/admin/WalletManagement';
import PaymentProofs from './pages/admin/PaymentProofs';
import AdminWallets from './pages/admin/AdminWallets';

// Protected route components
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#fff',
            borderRadius: '12px',
          },
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Protected User Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/deposit" element={<Deposit />} />
          <Route path="/withdraw" element={<Withdraw />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/plans" element={<InvestmentPlans />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/support" element={<Support />} />
          <Route path="/security" element={<Security />} />
          <Route path="/market" element={<Market />} />
          <Route path="/referrals" element={<Referrals />} />
          <Route path="/payouts" element={<LivePayouts />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/kyc" element={<KYC />} />
          <Route path="/payment-proof" element={<PaymentProof />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="deposits" element={<DepositManagement />} />
            <Route path="withdrawals" element={<WithdrawalManagement />} />
            <Route path="transactions" element={<AdminTransactions />} />
            <Route path="plans" element={<AdminInvestmentPlans />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="wallets" element={<WalletManagement />} />
            <Route path="payment-proofs" element={<PaymentProofs />} />
            <Route path="admin-wallets" element={<AdminWallets />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;