import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Package, Truck, Home, XCircle, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDate } from '@/lib/formatters';

interface HistoryRow {
  id: string;
  status: string;
  note: string | null;
  created_at: string;
  changed_by: string | null;
}

const ICONS: Record<string, any> = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  delivered: Home,
  cancelled: XCircle,
};

interface Props {
  orderId: string;
  /** Show who triggered the change (admin email/name). Enable on admin views. */
  showActor?: boolean;
}

export function OrderTimeline({ orderId, showActor = false }: Props) {
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [actors, setActors] = useState<Record<string, { name: string; email: string }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('order_status_history')
        .select('id, status, note, created_at, changed_by')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });
      const rows = (data as HistoryRow[]) || [];
      setHistory(rows);

      if (showActor) {
        const ids = Array.from(new Set(rows.map((r) => r.changed_by).filter(Boolean) as string[]));
        if (ids.length) {
          const { data: profs } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', ids);
          const map: Record<string, { name: string; email: string }> = {};
          (profs || []).forEach((p: any) => {
            map[p.id] = { name: p.full_name || p.email?.split('@')[0] || 'User', email: p.email };
          });
          setActors(map);
        }
      }
      setLoading(false);
    })();
  }, [orderId, showActor]);

  if (loading) return <div className="h-24 animate-pulse bg-muted rounded-lg" />;
  if (history.length === 0) return <p className="text-sm text-muted-foreground">No status updates yet.</p>;

  return (
    <ol className="relative border-l border-border ml-3 space-y-4">
      {history.map((h, i) => {
        const Icon = ICONS[h.status] || Clock;
        const isLast = i === history.length - 1;
        const actor = h.changed_by ? actors[h.changed_by] : null;
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
              {showActor && actor && (
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                  <User className="h-3 w-3" />
                  by <span className="font-medium text-foreground">{actor.name}</span>
                  <span className="opacity-60">({actor.email})</span>
                </p>
              )}
              {showActor && !actor && h.changed_by === null && i === 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">by Customer</p>
              )}
              {h.note && <p className="text-sm text-muted-foreground mt-1">{h.note}</p>}
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
