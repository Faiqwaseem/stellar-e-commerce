import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { registerSchema, formatZodError } from "@/lib/validation";
import { toast } from "sonner";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { register, loading } = useAuth();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      /*
      |--------------------------------------------------------------------------
      | FORM DATA
      |--------------------------------------------------------------------------
      */

      const formData = {
        username,
        email,
        password,
        confirmPassword,
      };

      /*
      |--------------------------------------------------------------------------
      | ZOD VALIDATION
      |--------------------------------------------------------------------------
      */

      const validatedData = registerSchema.parse(formData);

      /*
      |--------------------------------------------------------------------------
      | API CALL
      |--------------------------------------------------------------------------
      */

      await register({
        username: validatedData.username,
        email: validatedData.email,
        password: validatedData.password,
      });

      /*
      |--------------------------------------------------------------------------
      | SUCCESS
      |--------------------------------------------------------------------------
      */

      toast.success("Account created successfully");

      navigate("/login");
    } catch (error) {
      /*
      |--------------------------------------------------------------------------
      | ZOD ERROR
      |--------------------------------------------------------------------------
      */

      if (error?.issues) {
        toast.error(formatZodError(error));

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | API ERROR
      |--------------------------------------------------------------------------
      */

      toast.error(error?.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-card rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <Link to="/" className="flex items-center justify-center gap-2 mb-8">
            <div className="gradient-primary rounded-lg p-2">
              <ShoppingCart className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-bold">
              My<span className="text-primary">Store</span>
            </span>
          </Link>

          <h1 className="text-2xl font-bold text-center mb-2">
            Create Account
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            Join MyStore for exclusive deals
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="username">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="john"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>

              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full gradient-primary border-0"
              size="lg"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
