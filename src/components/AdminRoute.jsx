import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/userAuth';

const AdminRoute = () => {
  const { user, isAuthenticated, loading } = useAuth();

  // If loading, show spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Check localStorage directly as fallback (for admin route)
  const storedUser = localStorage.getItem('user');
  const storedUserObj = storedUser ? JSON.parse(storedUser) : null;
  const token = localStorage.getItem('token');

  // If no token or no user, redirect to user login
  if (!token || !storedUserObj) {
    return <Navigate to="/login" replace />;
  }

  // If user is not admin, redirect to user dashboard
  if (storedUserObj.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // If authenticated context says not admin but stored says admin, we allow it
  // (This handles race condition where AuthContext hasn't updated yet)
  return <Outlet />;
};

export default AdminRoute;