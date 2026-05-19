import { createContext, useContext, useEffect, useState } from "react";

import {
  loginUser,
  logoutUser,
  registerUser,
  getCurrentUser,
} from "@/api/auth.api";

interface User {
  _id: string;
  username: string;
  email: string;
  role: "user" | "admin";
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;

  loading: boolean;

  login: (data: { email: string; password: string }) => Promise<void>;

  register: (data: {
    username: string;
    email: string;
    password: string;
  }) => Promise<void>;

  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchCurrentUser = async () => {
      try {
        const response = await getCurrentUser();
        if (isMounted) {
          setUser(response.data);
        }
      } catch (error) {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchCurrentUser();
    return () => {
      isMounted = false;
    };
  }, []);
  /*
  |--------------------------------------------------------------------------
  | LOGIN
  |--------------------------------------------------------------------------
  */

  const login = async (values: { email: string; password: string }) => {
    try {
      const response = await loginUser(values);
      console.log("Login Response:0", response);
      console.log("Login Response:", response.data);
      setUser(response.data);
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | REGISTER
  |--------------------------------------------------------------------------
  */

  const register = async (values: {
    username: string;
    email: string;
    password: string;
  }) => {
    setLoading(true);

    try {
      const response = await registerUser(values);

      setUser(response.data);
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOGOUT
  |--------------------------------------------------------------------------
  */

  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
    }
    catch (error) {
      console.error("Logout Error:", error);
    }
    finally {
      setLoading(false);
    }
  };

  const isAdmin = user?.role === "admin" ? true : false;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
