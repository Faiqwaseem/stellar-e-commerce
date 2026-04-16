import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, BarChart3, ArrowLeft, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { label: 'Overview', icon: BarChart3, href: '/admin' },
  { label: 'Products', icon: Package, href: '/admin/products' },
  { label: 'Orders', icon: ShoppingCart, href: '/admin/orders' },
  { label: 'Themes', icon: Palette, href: '/admin/themes' },
];

export default function AdminDashboard() {
  const { user, isAdmin, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-4">You need admin privileges to access this page.</p>
        <Link to="/"><Button>Go Home</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-secondary text-secondary-foreground">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-4">
            <LayoutDashboard className="h-5 w-5" />
            <h1 className="font-display font-bold text-lg">Admin Dashboard</h1>
          </div>
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-secondary-foreground hover:bg-secondary-foreground/10">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Store
            </Button>
          </Link>
        </div>
      </div>

      <div className="container py-4">
        <nav className="flex gap-1 mb-6 border-b pb-3 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href !== '/admin' && location.pathname.startsWith(item.href));
            return (
              <Link key={item.href} to={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  className={isActive ? 'gradient-primary border-0' : ''}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
        <Outlet />
      </div>
    </div>
  );
}
