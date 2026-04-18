import { useEffect, useMemo, useState } from 'react';
import { Search, Mail, Phone, MapPin, ShoppingBag, User as UserIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatPrice, formatDate } from '@/lib/formatters';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  created_at: string;
}

interface CustomerStats {
  order_count: number;
  total_spent: number;
  is_admin: boolean;
}

interface OrderRow {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export default function AdminCustomers() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [stats, setStats] = useState<Record<string, CustomerStats>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: p }, { data: o }, { data: r }] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select('user_id, total_amount, status'),
        supabase.from('user_roles').select('user_id, role'),
      ]);
      const map: Record<string, CustomerStats> = {};
      (o || []).forEach((row: any) => {
        const s = (map[row.user_id] ||= { order_count: 0, total_spent: 0, is_admin: false });
        if (row.status !== 'cancelled') {
          s.order_count += 1;
          s.total_spent += Number(row.total_amount) || 0;
        }
      });
      (r || []).forEach((row: any) => {
        const s = (map[row.user_id] ||= { order_count: 0, total_spent: 0, is_admin: false });
        if (row.role === 'admin') s.is_admin = true;
      });
      setProfiles((p as Profile[]) || []);
      setStats(map);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return profiles.filter(
      (p) =>
        p.email.toLowerCase().includes(q) ||
        (p.full_name || '').toLowerCase().includes(q) ||
        (p.phone || '').toLowerCase().includes(q)
    );
  }, [profiles, search]);

  const openCustomer = async (p: Profile) => {
    setSelected(p);
    setOpen(true);
    const { data } = await supabase
      .from('orders')
      .select('id, total_amount, status, created_at')
      .eq('user_id', p.id)
      .order('created_at', { ascending: false })
      .limit(20);
    setOrders((data as OrderRow[]) || []);
  };

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by name, email, phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No customers found.</div>
      ) : (
        <div className="bg-card rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Spent</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => {
                const s = stats[p.id] || { order_count: 0, total_spent: 0, is_admin: false };
                const initials = (p.full_name || p.email).slice(0, 2).toUpperCase();
                return (
                  <TableRow key={p.id} className="cursor-pointer" onClick={() => openCustomer(p)}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8"><AvatarFallback>{initials}</AvatarFallback></Avatar>
                        <span className="font-medium">{p.full_name || '—'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.email}</TableCell>
                    <TableCell className="text-right">{s.order_count}</TableCell>
                    <TableCell className="text-right font-medium">{formatPrice(s.total_spent)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(p.created_at)}</TableCell>
                    <TableCell>
                      <Badge variant={s.is_admin ? 'default' : 'secondary'}>{s.is_admin ? 'Admin' : 'Customer'}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Customer Details</SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="mt-6 space-y-5">
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14">
                  <AvatarFallback>{(selected.full_name || selected.email).slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg">{selected.full_name || 'Unnamed'}</p>
                  <p className="text-sm text-muted-foreground">Joined {formatDate(selected.created_at)}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" />{selected.email}</div>
                {selected.phone && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" />{selected.phone}</div>}
                {selected.city && <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" />{selected.city}</div>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Total Orders</p>
                  <p className="text-xl font-bold">{stats[selected.id]?.order_count || 0}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Lifetime Value</p>
                  <p className="text-xl font-bold text-primary">{formatPrice(stats[selected.id]?.total_spent || 0)}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2"><ShoppingBag className="h-4 w-4" />Recent Orders</h3>
                {orders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No orders yet.</p>
                ) : (
                  <div className="space-y-2">
                    {orders.map((o) => (
                      <div key={o.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="text-sm font-mono">#{o.id.slice(0, 8).toUpperCase()}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(o.created_at)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatPrice(o.total_amount)}</p>
                          <Badge variant="outline" className="text-xs capitalize">{o.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
