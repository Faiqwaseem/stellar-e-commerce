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
  Terminal,
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
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from './ThemeToggle';

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
  const { user, isAdmin, signOut } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top bar */}
      <div className="bg-primary/10 border-b border-primary/20 py-1.5 text-center">
        <p className="font-mono text-[10px] tracking-[0.2em] text-primary container">
          ▸ FREE_SHIPPING on orders {'>'} PKR 5,000 &nbsp;|&nbsp; CODE: MYSTORE10 → 10% OFF
        </p>
      </div>

      {/* Main header */}
      <div className="glass border-b border-border">
        <div className="container">
          <div className="flex h-14 items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2"
              >
                <div className="border border-primary/50 rounded-sm p-1.5 bg-primary/10">
                  <Terminal className="h-5 w-5 text-primary" />
                </div>
                <span className="hidden font-mono text-lg font-bold text-foreground sm:inline-block tracking-tight">
                  my<span className="text-primary">store</span>
                  <span className="text-primary animate-pulse">_</span>
                </span>
              </motion.div>
            </Link>

            {/* Search */}
            <form onSubmit={handleSearch} className="hidden flex-1 max-w-lg md:flex">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="grep -r 'product' ./catalog"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 font-mono text-sm bg-secondary border-border focus:border-primary/50 rounded-sm"
                />
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <ThemeToggle />

              <Link to="/wishlist">
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                  <Heart className="h-4 w-4" />
                  {wishlistItems.length > 0 && (
                    <Badge className="absolute -right-1 -top-1 h-4 w-4 rounded-sm p-0 text-[9px] bg-accent text-accent-foreground border-0">
                      {wishlistItems.length}
                    </Badge>
                  )}
                </Button>
              </Link>

              <Link to="/cart">
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                  <ShoppingCart className="h-4 w-4" />
                  {getTotalItems() > 0 && (
                    <Badge className="absolute -right-1 -top-1 h-4 w-4 rounded-sm p-0 text-[9px] bg-primary text-primary-foreground border-0">
                      {getTotalItems()}
                    </Badge>
                  )}
                </Button>
              </Link>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-sm">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-mono">{user.email}</p>
                      <p className="text-[10px] font-mono text-muted-foreground">
                        role: {isAdmin ? 'admin' : 'user'}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center gap-2 font-mono text-xs">
                          <LayoutDashboard className="h-3.5 w-3.5" />
                          admin_panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link to="/orders" className="flex items-center gap-2 font-mono text-xs">
                        <Package className="h-3.5 w-3.5" />
                        my_orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center gap-2 font-mono text-xs">
                        <Settings className="h-3.5 w-3.5" />
                        settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="text-destructive focus:text-destructive font-mono text-xs"
                    >
                      <LogOut className="h-3.5 w-3.5 mr-2" />
                      logout --force
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/login">
                  <Button size="sm" className="gradient-primary border-0 font-mono text-xs tracking-wider rounded-sm h-8">
                    login
                  </Button>
                </Link>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-9 w-9"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Nav */}
      <nav className="hidden md:block bg-secondary/50 border-b border-border">
        <div className="container">
          <ul className="flex items-center gap-0 py-0">
            <li>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="font-mono text-xs tracking-wider text-secondary-foreground hover:text-primary rounded-none h-9 px-3">
                    <Menu className="h-3 w-3 mr-1.5" />
                    all/
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="rounded-sm">
                  {categories.map((c) => (
                    <DropdownMenuItem key={c.name} asChild>
                      <Link to={c.href} className="font-mono text-xs">{c.name}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
            {categories.slice(0, 5).map((c) => (
              <li key={c.name}>
                <Link to={c.href}>
                  <Button variant="ghost" size="sm" className="font-mono text-xs tracking-wider text-secondary-foreground hover:text-primary rounded-none h-9 px-3">
                    {c.name.toLowerCase().replace(/ & /g, '_')}
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
            className="md:hidden bg-background border-b border-border"
          >
            <div className="container py-4 space-y-4">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 font-mono text-sm rounded-sm"
                  />
                </div>
              </form>

              <div className="space-y-1">
                <p className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase px-1">
                  ./categories
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {categories.map((c) => (
                    <Link
                      key={c.name}
                      to={c.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="rounded-sm bg-secondary px-3 py-2 font-mono text-xs hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      {c.name}
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
