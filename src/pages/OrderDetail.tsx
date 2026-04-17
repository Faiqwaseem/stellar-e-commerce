import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ArrowLeft, MapPin, Phone, CreditCard, Clock, Printer } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatPrice, formatDate } from '@/lib/formatters';

interface OrderData {
  id: string;
  total_amount: number;
  status: string;
  payment_status: string;
  payment_method: string;
  shipping_address: string;
  shipping_city: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

interface OrderItemData {
  id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  price: number;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const statusSteps = ['pending', 'processing', 'shipped', 'delivered'];

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [items, setItems] = useState<OrderItemData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      if (!id || !user) return;

      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (orderData) {
        setOrder(orderData as OrderData);

        const { data: itemsData } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', id);

        if (itemsData) setItems(itemsData as OrderItemData[]);
      }
      setLoading(false);
    }

    fetchOrder();
  }, [id, user]);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
        <Link to="/login">
          <Button className="gradient-primary border-0">Sign In</Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-8 space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse bg-muted rounded-xl h-24" />
        ))}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Order not found</h1>
        <Link to="/orders">
          <Button variant="outline">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  const currentStep = statusSteps.indexOf(order.status);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = order.total_amount - subtotal;

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-muted/50 py-4">
        <div className="container">
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>
        </div>
      </div>

      <div className="container py-8 print-receipt">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            <p className="text-muted-foreground">Placed on {formatDate(order.created_at)}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => window.print()} className="no-print">
              <Printer className="h-4 w-4 mr-2" />
              Print Receipt
            </Button>
            <Badge className={`${statusColors[order.status] || ''} text-sm px-4 py-1`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>
        </div>

        {/* Order Progress */}
        {order.status !== 'cancelled' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border p-6 mb-8"
          >
            <h2 className="text-lg font-semibold mb-6">Order Progress</h2>
            <div className="flex items-center justify-between relative">
              <div className="absolute top-5 left-0 right-0 h-1 bg-muted">
                <div
                  className="h-full gradient-primary transition-all duration-500"
                  style={{ width: `${Math.max(0, (currentStep / (statusSteps.length - 1)) * 100)}%` }}
                />
              </div>
              {statusSteps.map((step, index) => (
                <div key={step} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                      index <= currentStep
                        ? 'gradient-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="text-xs mt-2 capitalize">{step}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-xl border p-6"
            >
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Order Items ({items.length})
              </h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div className="flex-1">
                      {item.product_id ? (
                        <Link
                          to={`/product/${item.product_id}`}
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {item.product_name}
                        </Link>
                      ) : (
                        <p className="font-medium">{item.product_name}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Order Summary & Details */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-xl border p-6"
            >
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className={shipping <= 0 ? 'text-success' : ''}>
                    {shipping <= 0 ? 'Free' : formatPrice(shipping)}
                  </span>
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(order.total_amount)}</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-xl border p-6 space-y-4"
            >
              <h2 className="text-lg font-semibold">Details</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Shipping Address</p>
                    <p className="text-muted-foreground">{order.shipping_address}, {order.shipping_city}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-muted-foreground">{order.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Payment</p>
                    <p className="text-muted-foreground capitalize">
                      {order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method}
                      {' — '}
                      <span className={order.payment_status === 'paid' ? 'text-success' : 'text-accent'}>
                        {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Last Updated</p>
                    <p className="text-muted-foreground">{formatDate(order.updated_at)}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
