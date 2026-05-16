import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  loginUser,
  logoutUser,
  registerUser,
} from "@/api/auth.api";



interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
}



interface AuthContextType {
  user: User | null;

  loading: boolean;

  login: (data: {
    email: string;
    password: string;
  }) => Promise<void>;

  register: (data: {
    username: string;
    email: string;
    password: string;
  }) => Promise<void>;

  logout: () => Promise<void>;
}



const AuthContext = createContext<AuthContextType | null>(null);



export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(false);



  /*
  |--------------------------------------------------------------------------
  | LOGIN
  |--------------------------------------------------------------------------
  */

  const login = async (values: {
    email: string;
    password: string;
  }) => {
    setLoading(true);

    try {
      const response = await loginUser(values);

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
    await logoutUser();

    setUser(null);
  };



  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
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