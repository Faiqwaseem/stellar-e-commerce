import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Package, ArrowRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice, formatDate } from '@/lib/formatters';

interface OrderData {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  shipping_address: string;
  shipping_city: string;
}

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) return;

      const { data } = await supabase
        .from('orders')
        .select('id, total_amount, status, created_at, shipping_address, shipping_city')
        .eq('id', orderId)
        .single();

      if (data) setOrder(data);
    }

    fetchOrder();
  }, [orderId]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="mx-auto w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mb-6"
        >
          <CheckCircle2 className="h-12 w-12 text-success" />
        </motion.div>

        <h1 className="text-3xl font-display font-bold mb-2">Order Placed!</h1>
        <p className="text-muted-foreground mb-8">
          Thank you for your order. We've received your order and will process it soon.
        </p>

        {order && (
          <div className="bg-card rounded-xl border p-6 mb-8 text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="capitalize font-medium">{order.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery to</span>
                <span className="text-right">
                  {order.shipping_address}, {order.shipping_city}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-base pt-2 border-t">
                <span>Total</span>
                <span className="text-primary">{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/orders">
            <Button variant="outline">
              <Package className="h-4 w-4 mr-2" />
              View My Orders
            </Button>
          </Link>
          <Link to="/">
            <Button className="gradient-primary border-0">
              <Home className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
