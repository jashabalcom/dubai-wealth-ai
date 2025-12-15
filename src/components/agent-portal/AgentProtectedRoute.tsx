import { Navigate, useLocation } from 'react-router-dom';
import { useAgentAuth } from '@/hooks/useAgentAuth';
import { Loader2 } from 'lucide-react';

interface AgentProtectedRouteProps {
  children: React.ReactNode;
}

export function AgentProtectedRoute({ children }: AgentProtectedRouteProps) {
  const { user, isAgent, loading } = useAgentAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not logged in at all
  if (!user) {
    return <Navigate to="/agent-portal/login" state={{ from: location }} replace />;
  }

  // Logged in but not an agent
  if (!isAgent) {
    return <Navigate to="/agent-portal/register" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
