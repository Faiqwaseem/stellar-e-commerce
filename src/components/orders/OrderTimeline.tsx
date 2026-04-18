import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, Package, Truck, Home, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDate } from '@/lib/formatters';

interface HistoryRow {
  id: string;
  status: string;
  note: string | null;
  created_at: string;
}

const ICONS: Record<string, any> = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  delivered: Home,
  cancelled: XCircle,
};

export function OrderTimeline({ orderId }: { orderId: string }) {
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('order_status_history')
        .select('id, status, note, created_at')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });
      setHistory((data as HistoryRow[]) || []);
      setLoading(false);
    })();
  }, [orderId]);

  if (loading) {
    return <div className="h-24 animate-pulse bg-muted rounded-lg" />;
  }

  if (history.length === 0) {
    return <p className="text-sm text-muted-foreground">No status updates yet.</p>;
  }

  return (
    <ol className="relative border-l border-border ml-3 space-y-4">
      {history.map((h, i) => {
        const Icon = ICONS[h.status] || Clock;
        const isLast = i === history.length - 1;
        return (
          <motion.li
            key={h.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="ml-6"
          >
            <span
              className={`absolute -left-3.5 flex items-center justify-center w-7 h-7 rounded-full ring-4 ring-background ${
                isLast
                  ? h.status === 'cancelled'
                    ? 'bg-destructive text-destructive-foreground'
                    : 'gradient-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
            <div className="flex flex-col">
              <p className="font-medium capitalize">{h.status}</p>
              <p className="text-xs text-muted-foreground">{formatDate(h.created_at)}</p>
              {h.note && <p className="text-sm text-muted-foreground mt-1">{h.note}</p>}
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
