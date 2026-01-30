import { Link } from "react-router-dom";
import { Search, ShoppingCart, Heart, User, Menu, MapPin, ChevronDown } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { categories } from "@/data/products";

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const totalItems = useCartStore((state) => state.getTotalItems());
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const openCart = useCartStore((state) => state.openCart);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-header text-header-foreground">
        <div className="container py-2">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-1 shrink-0">
              <span className="text-xl md:text-2xl font-bold text-white">My</span>
              <span className="text-xl md:text-2xl font-bold text-primary">Store</span>
            </Link>

            {/* Delivery Location - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-1 text-sm hover:outline hover:outline-1 hover:outline-white/50 rounded p-1 cursor-pointer">
              <MapPin className="w-5 h-5" />
              <div className="flex flex-col">
                <span className="text-xs text-gray-300">Deliver to</span>
                <span className="font-medium">Pakistan</span>
              </div>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden sm:block">
              <div className="flex rounded-md overflow-hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      className="rounded-none bg-gray-100 text-gray-700 hover:bg-gray-200 border-r border-gray-300 text-xs px-3"
                    >
                      All <ChevronDown className="ml-1 w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem asChild>
                      <Link to="/products">All Categories</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {categories.map((cat) => (
                      <DropdownMenuItem key={cat.id} asChild>
                        <Link to={`/products?category=${cat.slug}`}>{cat.name}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Input
                  type="text"
                  placeholder="Search MyStore"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 rounded-none border-none bg-white text-gray-800 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button
                  type="submit"
                  className="rounded-none px-4 bg-primary hover:bg-accent"
                >
                  <Search className="w-5 h-5" />
                </Button>
              </div>
            </form>

            {/* Right Icons */}
            <div className="flex items-center gap-1 md:gap-3">
              {/* Account Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-header-secondary hidden md:flex flex-col items-start h-auto py-1 px-2"
                  >
                    <span className="text-xs text-gray-300">Hello, sign in</span>
                    <span className="text-sm font-medium flex items-center gap-1">
                      Account <ChevronDown className="w-3 h-3" />
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="p-3 text-center border-b">
                    <Button asChild className="w-full bg-primary hover:bg-accent">
                      <Link to="/auth">Sign In</Link>
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      New customer? <Link to="/auth" className="text-primary hover:underline">Start here</Link>
                    </p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link to="/account">My Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders">Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/wishlist">Wishlist</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Orders - Hidden on mobile */}
              <Link
                to="/orders"
                className="hidden lg:flex flex-col items-start hover:outline hover:outline-1 hover:outline-white/50 rounded p-1"
              >
                <span className="text-xs text-gray-300">Returns</span>
                <span className="text-sm font-medium text-white">& Orders</span>
              </Link>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="relative p-2 hover:bg-header-secondary rounded transition-colors"
              >
                <Heart className="w-6 h-6 text-white" />
                {wishlistCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="cart-badge"
                  >
                    {wishlistCount}
                  </motion.span>
                )}
              </Link>

              {/* Cart */}
              <button
                onClick={openCart}
                className="relative flex items-center gap-1 p-2 hover:bg-header-secondary rounded transition-colors"
              >
                <ShoppingCart className="w-6 h-6 text-white" />
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="cart-badge"
                  >
                    {totalItems}
                  </motion.span>
                )}
                <span className="text-sm font-medium text-white hidden md:block">Cart</span>
              </button>

              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden text-white hover:bg-header-secondary"
                  >
                    <Menu className="w-6 h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <div className="flex flex-col gap-4 mt-6">
                    <Link to="/auth" className="flex items-center gap-3 p-3 bg-header text-white rounded-lg">
                      <User className="w-8 h-8" />
                      <div>
                        <p className="font-medium">Hello, Sign In</p>
                        <p className="text-xs text-gray-300">Account & Lists</p>
                      </div>
                    </Link>
                    <div className="space-y-1">
                      <p className="font-semibold text-lg px-3">Shop by Category</p>
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          to={`/products?category=${cat.slug}`}
                          className="block px-3 py-2 hover:bg-muted rounded"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                    <div className="border-t pt-4 space-y-1">
                      <Link to="/orders" className="block px-3 py-2 hover:bg-muted rounded">
                        My Orders
                      </Link>
                      <Link to="/wishlist" className="block px-3 py-2 hover:bg-muted rounded">
                        Wishlist
                      </Link>
                      <Link to="/account" className="block px-3 py-2 hover:bg-muted rounded">
                        Account Settings
                      </Link>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="mt-3 sm:hidden">
            <div className="flex rounded-md overflow-hidden">
              <Input
                type="text"
                placeholder="Search MyStore"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 rounded-none rounded-l-md border-none bg-white text-gray-800 focus-visible:ring-0"
              />
              <Button type="submit" className="rounded-none rounded-r-md px-4 bg-primary hover:bg-accent">
                <Search className="w-5 h-5" />
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Secondary Nav */}
      <div className="bg-header-secondary text-white text-sm">
        <div className="container">
          <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2">
            <Link
              to="/products"
              className="flex items-center gap-1 px-3 py-1 hover:outline hover:outline-1 hover:outline-white/50 rounded whitespace-nowrap"
            >
              <Menu className="w-4 h-4" /> All
            </Link>
            {categories.slice(0, 5).map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                className="px-3 py-1 hover:outline hover:outline-1 hover:outline-white/50 rounded whitespace-nowrap"
              >
                {cat.name}
              </Link>
            ))}
            <Link
              to="/products?deal=true"
              className="px-3 py-1 text-primary font-medium hover:outline hover:outline-1 hover:outline-primary/50 rounded whitespace-nowrap"
            >
              Today's Deals
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
