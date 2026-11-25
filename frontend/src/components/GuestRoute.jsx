import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function GuestRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="auth-loading">Loading...</p>;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default GuestRoute;
