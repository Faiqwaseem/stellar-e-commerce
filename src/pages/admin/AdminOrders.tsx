import { useEffect, useMemo, useState } from 'react';
import { Eye, Search, Download, TrendingUp, Package, DollarSign, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { formatPrice, formatDate } from '@/lib/formatters';
import { toast } from 'sonner';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

interface AdminOrder {
  id: string;
  total_amount: number;
  status: string;
  payment_status: string;
  payment_method: string;
  shipping_address: string;
  shipping_city: string;
  phone: string;
  created_at: string;
}

interface OrderItem {
  id: string;
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

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const PAGE_SIZE = 15;

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('30d');
  const [page, setPage] = useState(1);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setOrders(data as AdminOrder[]);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const viewOrder = async (order: AdminOrder) => {
    setSelectedOrder(order);
    const { data } = await supabase.from('order_items').select('*').eq('order_id', order.id);
    if (data) setOrderItems(data as OrderItem[]);
    setDialogOpen(true);
  };

  const updateStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (error) return toast.error('Failed to update status');
    toast.success(`Status updated to ${status}`);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    if (selectedOrder?.id === orderId) setSelectedOrder({ ...selectedOrder, status });
  };

  const updatePaymentStatus = async (orderId: string, payment_status: string) => {
    const { error } = await supabase.from('orders').update({ payment_status }).eq('id', orderId);
    if (error) return toast.error('Failed to update payment status');
    toast.success(`Payment updated to ${payment_status}`);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, payment_status } : o));
    if (selectedOrder?.id === orderId) setSelectedOrder({ ...selectedOrder, payment_status });
  };

  // --- Filtering ---
  const filtered = useMemo(() => {
    const now = Date.now();
    const ranges: Record<string, number> = {
      '7d': 7 * 86400000, '30d': 30 * 86400000, '90d': 90 * 86400000,
    };
    return orders.filter(o => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        if (!o.id.toLowerCase().includes(s) && !o.phone.toLowerCase().includes(s) && !o.shipping_city.toLowerCase().includes(s)) return false;
      }
      if (dateFilter !== 'all') {
        const range = ranges[dateFilter];
        if (range && now - new Date(o.created_at).getTime() > range) return false;
      }
      return true;
    });
  }, [orders, search, statusFilter, dateFilter]);

  // --- Stats ---
  const stats = useMemo(() => {
    const total = filtered.reduce((sum, o) => sum + Number(o.total_amount), 0);
    const paid = filtered.filter(o => o.payment_status === 'paid').reduce((sum, o) => sum + Number(o.total_amount), 0);
    const avg = filtered.length ? total / filtered.length : 0;
    const pending = filtered.filter(o => o.status === 'pending').length;
    return { total, paid, avg, count: filtered.length, pending };
  }, [filtered]);

  // --- Charts ---
  const revenueByDay = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach(o => {
      const d = new Date(o.created_at).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' });
      map.set(d, (map.get(d) || 0) + Number(o.total_amount));
    });
    return Array.from(map.entries()).slice(-14).map(([date, revenue]) => ({ date, revenue: Math.round(revenue) }));
  }, [filtered]);

  const statusBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach(o => map.set(o.status, (map.get(o.status) || 0) + 1));
    return STATUSES.map(s => ({ name: s, value: map.get(s) || 0 })).filter(d => d.value > 0);
  }, [filtered]);

  const PIE_COLORS = ['hsl(var(--accent))', 'hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--success))', 'hsl(var(--destructive))'];

  // --- Pagination ---
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => { setPage(1); }, [search, statusFilter, dateFilter]);

  // --- CSV export ---
  const exportCSV = () => {
    const headers = ['Order ID', 'Date', 'Amount (PKR)', 'Status', 'Payment Status', 'Payment Method', 'Phone', 'City', 'Address'];
    const rows = filtered.map(o => [
      o.id,
      new Date(o.created_at).toISOString(),
      o.total_amount,
      o.status,
      o.payment_status,
      o.payment_method || '',
      o.phone,
      o.shipping_city,
      `"${(o.shipping_address || '').replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} transactions`);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => <div key={i} className="animate-pulse bg-muted rounded h-12" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-display font-bold">Transactions</h2>
          <p className="text-sm text-muted-foreground">Manage all orders, view stats, and export data.</p>
        </div>
        <Button onClick={exportCSV} variant="outline" disabled={!filtered.length}>
          <Download className="h-4 w-4 mr-2" /> Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={DollarSign} label="Total Revenue" value={formatPrice(stats.total)} accent="text-primary" />
        <StatCard icon={TrendingUp} label="Paid Revenue" value={formatPrice(stats.paid)} accent="text-success" />
        <StatCard icon={ShoppingBag} label="Orders" value={String(stats.count)} accent="text-accent" sub={`Avg ${formatPrice(stats.avg)}`} />
        <StatCard icon={Package} label="Pending" value={String(stats.pending)} accent="text-yellow-600" />
      </div>

      {/* Charts */}
      {filtered.length > 0 && (
        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2"><CardTitle className="text-base">Revenue Trend</CardTitle></CardHeader>
            <CardContent className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                    formatter={(v: number) => formatPrice(v)}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Status Breakdown</CardTitle></CardHeader>
            <CardContent className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusBreakdown} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} paddingAngle={2}>
                    {statusBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="bg-card rounded-xl border p-3 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative lg:col-span-2">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search ID, phone, city..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Payment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">#{order.id.slice(0, 8).toUpperCase()}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{formatDate(order.created_at)}</TableCell>
                <TableCell className="font-medium">{formatPrice(order.total_amount)}</TableCell>
                <TableCell>
                  <Select value={order.status} onValueChange={(v) => updateStatus(order.id, v)}>
                    <SelectTrigger className="w-[130px] h-8">
                      <Badge className={statusColors[order.status] || ''}>{order.status}</Badge>
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant={order.payment_status === 'paid' ? 'default' : 'outline'}>{order.payment_status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => viewOrder(order)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {paged.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No transactions match your filters</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground px-3">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Order #{selectedOrder?.id.slice(0, 8).toUpperCase()}</DialogTitle></DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Address</p>
                  <p className="font-medium">{selectedOrder.shipping_address}, {selectedOrder.shipping_city}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedOrder.phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment Method</p>
                  <p className="font-medium capitalize">{selectedOrder.payment_method === 'cod' ? 'Cash on Delivery' : selectedOrder.payment_method}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment Status</p>
                  <Select value={selectedOrder.payment_status} onValueChange={(v) => updatePaymentStatus(selectedOrder.id, v)}>
                    <SelectTrigger className="h-8 mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['pending', 'paid', 'failed', 'refunded'].map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Items</h3>
                <div className="space-y-2">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.product_name} × {item.quantity}</span>
                      <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(selectedOrder.total_amount)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent, sub }: { icon: any; label: string; value: string; accent: string; sub?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">{label}</span>
          <Icon className={`h-4 w-4 ${accent}`} />
        </div>
        <p className="text-xl font-bold truncate">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}
