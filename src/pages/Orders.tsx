import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ChevronRight, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatDate } from '@/lib/formatters';

interface Order {
  id: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export default function Orders() {
  const { user, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (!user) return;

      const { data } = await supabase
        .from('orders')
        .select('id, total_amount, status, payment_status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setOrders(data);
      setLoading(false);
    }

    if (!authLoading) {
      fetchOrders();
    }
  }, [user, authLoading]);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Please sign in to view orders</h1>
        <Link to="/login">
          <Button className="gradient-primary border-0">Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-muted/50 py-4">
        <div className="container">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <span className="text-foreground">My Orders</span>
          </nav>
        </div>
      </div>

      <div className="container py-8">
        <h1 className="text-2xl md:text-3xl font-display font-bold mb-8">My Orders</h1>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-muted rounded-xl h-24" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Package className="h-24 w-24 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">
              Start shopping to place your first order!
            </p>
            <Link to="/products">
              <Button className="gradient-primary border-0">Browse Products</Button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-xl border p-4 md:p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-primary/10 shrink-0">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(order.created_at)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={statusColors[order.status] || ''}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                        <Badge variant="outline">
                          {order.payment_status === 'paid' ? 'Paid' : 'Payment Pending'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4">
                    <p className="text-lg font-bold text-primary">
                      {formatPrice(order.total_amount)}
                    </p>
                    <Link to={`/orders/${order.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
