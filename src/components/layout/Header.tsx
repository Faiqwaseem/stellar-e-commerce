import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Package,
  Settings,
  LayoutDashboard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';

const categories = [
  { name: 'Electronics', href: '/products?category=Electronics' },
  { name: 'Fashion', href: '/products?category=Fashion' },
  { name: 'Home & Living', href: '/products?category=Home & Living' },
  { name: 'Beauty', href: '/products?category=Beauty' },
  { name: 'Sports', href: '/products?category=Sports' },
  { name: 'Books', href: '/products?category=Books' },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { getTotalItems } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { user, isAdmin, logout } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top bar - Promo */}
      <div className="gradient-primary text-primary-foreground py-2 text-center text-xs md:text-sm font-medium overflow-hidden">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="container flex items-center justify-center gap-2"
        >
          <span className="inline-block animate-bounce">🎉</span>
          Free Delivery on orders over PKR 5,000 | Use code: <span className="font-bold bg-white/20 px-2 py-0.5 rounded-md">MYSTORE10</span> for 10% off
        </motion.p>
      </div>

      {/* Main header */}
      <div className="glass border-b shadow-sm">
        <div className="container">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2.5"
              >
                <div className="gradient-primary rounded-xl p-2 shadow-glow">
                  <ShoppingCart className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="hidden font-display text-xl font-bold text-foreground sm:inline-block tracking-tight">
                  My<span className="text-primary">Store</span>
                </span>
              </motion.div>
            </Link>

            {/* Search - Desktop */}
            <form
              onSubmit={handleSearch}
              className="hidden flex-1 max-w-xl md:flex"
            >
              <div className="relative w-full group">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  type="search"
                  placeholder="Search products, brands, and more..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 rounded-xl h-11 bg-muted/50 border-border/50 focus:bg-background transition-colors"
                />
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-1.5">
              <ThemeToggle />
              <LanguageToggle />

              {/* Wishlist */}
              <Link to="/wishlist">
                <Button variant="ghost" size="icon" className="relative rounded-xl">
                  <Heart className="h-5 w-5" />
                  {wishlistItems.length > 0 && (
                    <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-[10px] gradient-primary border-0 shadow-glow">
                      {wishlistItems.length}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* Cart */}
              <Link to="/cart">
                <Button variant="ghost" size="icon" className="relative rounded-xl">
                  <ShoppingCart className="h-5 w-5" />
                  {getTotalItems() > 0 && (
                    <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-[10px] gradient-primary border-0 shadow-glow">
                      {getTotalItems()}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* User Menu */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-xl">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-xl">
                    <div className="px-3 py-2">
                      <p className="text-sm font-semibold">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {isAdmin ? 'Administrator' : 'Customer'}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center gap-2">
                          <LayoutDashboard className="h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link to="/orders" className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        My Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Profile Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="text-destructive focus:text-destructive"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/login">
                  <Button variant="default" size="sm" className="gradient-primary border-0 rounded-xl shadow-glow font-semibold">
                    Sign In
                  </Button>
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-xl"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Navigation - Desktop */}
      <nav className="hidden md:block bg-secondary text-secondary-foreground">
        <div className="container">
          <ul className="flex items-center gap-0.5 py-1.5">
            <li>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-secondary-foreground hover:bg-secondary-foreground/10 rounded-lg text-xs font-semibold">
                    <Menu className="h-3.5 w-3.5 mr-1.5" />
                    All Categories
                    <ChevronDown className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="rounded-xl">
                  {categories.map((category) => (
                    <DropdownMenuItem key={category.name} asChild>
                      <Link to={category.href}>{category.name}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
            {categories.slice(0, 5).map((category) => (
              <li key={category.name}>
                <Link to={category.href}>
                  <Button variant="ghost" size="sm" className="text-secondary-foreground hover:bg-secondary-foreground/10 rounded-lg text-xs font-medium">
                    {category.name}
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b shadow-lg"
          >
            <div className="container py-4 space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 rounded-xl"
                  />
                </div>
              </form>

              {/* Mobile Categories */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Categories</p>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <Link
                      key={category.name}
                      to={category.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="rounded-xl bg-muted/50 px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
