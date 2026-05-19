import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

export default function AdminRoute() {
  const { user, loading } = useAuth();
  console.log("Admin Route User:", user);

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
     <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | NOT LOGGED IN
  |--------------------------------------------------------------------------
  */

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  /*
  |--------------------------------------------------------------------------
  | NOT ADMIN
  |--------------------------------------------------------------------------
  */

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

