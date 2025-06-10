import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const InitializeRoute = ({ children }) => {
  const { isInitialized, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">检查系统状态...</p>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return <Navigate to="/initialize" replace />;
  }

  return children;
};

export default InitializeRoute;

