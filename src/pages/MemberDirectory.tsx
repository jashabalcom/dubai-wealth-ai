import { Navigate } from 'react-router-dom';

// Redirect to the consolidated community members page
export default function MemberDirectory() {
  return <Navigate to="/community/members" replace />;
}
