import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, Tag, BarChart3, Download, TrendingDown, Users, Percent } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatPrice, formatDate } from '@/lib/formatters';
import { downloadCSV } from '@/lib/csv';
import { toast } from 'sonner';

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  type: 'percent' | 'fixed' | 'free_shipping';
  value: number;
  min_order_amount: number;
  max_discount: number | null;
  usage_limit: number | null;
  used_count: number;
  per_user_limit: number;
  starts_at: string;
  expires_at: string | null;
  active: boolean;
  created_at: string;
}

interface Redemption {
  id: string;
  coupon_id: string;
  user_id: string;
  order_id: string | null;
  discount_amount: number;
  created_at: string;
}

const empty = {
  code: '',
  description: '',
  type: 'percent' as Coupon['type'],
  value: '10',
  min_order_amount: '0',
  max_discount: '',
  usage_limit: '',
  per_user_limit: '1',
  expires_at: '',
  active: true,
};

export default function AdminCoupons() {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState(empty);

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: c }, { data: r }] = await Promise.all([
      supabase.from('coupons').select('*').order('created_at', { ascending: false }),
      supabase.from('coupon_redemptions').select('*').order('created_at', { ascending: false }),
    ]);
    setCoupons((c as Coupon[]) || []);
    setRedemptions((r as Redemption[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = useMemo(
    () => coupons.filter((c) => c.code.toLowerCase().includes(search.toLowerCase())),
    [coupons, search]
  );

  // ---- Analytics ----
  const analytics = useMemo(() => {
    const totalDiscount = redemptions.reduce((s, r) => s + Number(r.discount_amount || 0), 0);
    const uniqueUsers = new Set(redemptions.map((r) => r.user_id)).size;

    const byCoupon = new Map<string, { count: number; discount: number }>();
    redemptions.forEach((r) => {
      const cur = byCoupon.get(r.coupon_id) || { count: 0, discount: 0 };
      cur.count += 1;
      cur.discount += Number(r.discount_amount || 0);
      byCoupon.set(r.coupon_id, cur);
    });

    const ranking = coupons
      .map((c) => {
        const stats = byCoupon.get(c.id) || { count: 0, discount: 0 };
        return { coupon: c, ...stats };
      })
      .sort((a, b) => b.count - a.count);

    const activeCount = coupons.filter((c) => c.active).length;

    return {
      totalRedemptions: redemptions.length,
      totalDiscount,
      uniqueUsers,
      activeCount,
      ranking,
    };
  }, [coupons, redemptions]);

  const exportRedemptions = () => {
    const codeMap = new Map(coupons.map((c) => [c.id, c.code]));
    downloadCSV(
      `coupon-redemptions-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Date', 'Code', 'User ID', 'Order ID', 'Discount (PKR)'],
      redemptions.map((r) => [
        new Date(r.created_at).toISOString(),
        codeMap.get(r.coupon_id) || r.coupon_id,
        r.user_id,
        r.order_id || '',
        Number(r.discount_amount).toFixed(2),
      ])
    );
    toast.success(`Exported ${redemptions.length} redemptions`);
  };

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (c: Coupon) => {
    setEditing(c);
    setForm({
      code: c.code,
      description: c.description || '',
      type: c.type,
      value: String(c.value),
      min_order_amount: String(c.min_order_amount),
      max_discount: c.max_discount != null ? String(c.max_discount) : '',
      usage_limit: c.usage_limit != null ? String(c.usage_limit) : '',
      per_user_limit: String(c.per_user_limit),
      expires_at: c.expires_at ? c.expires_at.slice(0, 16) : '',
      active: c.active,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.code.trim()) return toast.error('Code required');
    const payload = {
      code: form.code.trim().toUpperCase(),
      description: form.description.trim() || null,
      type: form.type,
      value: form.type === 'free_shipping' ? 0 : Number(form.value) || 0,
      min_order_amount: Number(form.min_order_amount) || 0,
      max_discount: form.max_discount ? Number(form.max_discount) : null,
      usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
      per_user_limit: Number(form.per_user_limit) || 1,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      active: form.active,
    };
    const { error } = editing
      ? await supabase.from('coupons').update(payload).eq('id', editing.id)
      : await supabase.from('coupons').insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing ? 'Coupon updated' : 'Coupon created');
    setOpen(false);
    fetchAll();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Deleted');
    fetchAll();
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list"><Tag className="h-4 w-4 mr-1.5" />Coupons</TabsTrigger>
          <TabsTrigger value="analytics"><BarChart3 className="h-4 w-4 mr-1.5" />Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4 mt-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search code..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Button onClick={openCreate} className="gradient-primary border-0">
              <Plus className="h-4 w-4 mr-1" /> New Coupon
            </Button>
          </div>

          {loading ? (
            <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Tag className="h-10 w-10 mx-auto mb-3 opacity-50" />
              No coupons yet. Create your first discount code.
            </div>
          ) : (
            <div className="bg-card rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Used</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono font-medium">{c.code}</TableCell>
                      <TableCell className="capitalize">{c.type.replace('_', ' ')}</TableCell>
                      <TableCell>
                        {c.type === 'percent' ? `${c.value}%` : c.type === 'fixed' ? formatPrice(c.value) : '—'}
                      </TableCell>
                      <TableCell>{c.used_count}{c.usage_limit ? ` / ${c.usage_limit}` : ''}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.expires_at ? formatDate(c.expires_at) : 'Never'}</TableCell>
                      <TableCell>
                        <Badge variant={c.active ? 'default' : 'secondary'}>{c.active ? 'Active' : 'Inactive'}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => remove(c.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-display font-bold">Coupon Performance</h2>
              <p className="text-sm text-muted-foreground">Track discount spend, top codes, and customer reach.</p>
            </div>
            <Button variant="outline" onClick={exportRedemptions} disabled={!redemptions.length}>
              <Download className="h-4 w-4 mr-2" /> Export Redemptions
            </Button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={TrendingDown} label="Total Discount Given" value={formatPrice(analytics.totalDiscount)} accent="text-destructive" />
            <StatCard icon={Tag} label="Total Redemptions" value={String(analytics.totalRedemptions)} accent="text-primary" />
            <StatCard icon={Users} label="Unique Customers" value={String(analytics.uniqueUsers)} accent="text-accent" />
            <StatCard icon={Percent} label="Active Codes" value={`${analytics.activeCount} / ${coupons.length}`} accent="text-success" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Redeemed Coupons</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.ranking.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No redemption data yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Redemptions</TableHead>
                      <TableHead className="text-right">Discount Given</TableHead>
                      <TableHead className="text-right">Avg / Order</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.ranking.map(({ coupon, count, discount }) => (
                      <TableRow key={coupon.id}>
                        <TableCell className="font-mono font-medium">{coupon.code}</TableCell>
                        <TableCell className="capitalize text-sm text-muted-foreground">{coupon.type.replace('_', ' ')}</TableCell>
                        <TableCell className="text-right font-medium">{count}</TableCell>
                        <TableCell className="text-right font-medium text-destructive">{formatPrice(discount)}</TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {count ? formatPrice(discount / count) : '—'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={coupon.active ? 'default' : 'secondary'} className="text-xs">
                            {coupon.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Coupon' : 'New Coupon'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label>Code</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SUMMER25" maxLength={40} />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as Coupon['type'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed amount</SelectItem>
                    <SelectItem value="free_shipping">Free shipping</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional internal note" maxLength={200} />
            </div>
            {form.type !== 'free_shipping' && (
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label>{form.type === 'percent' ? 'Percent off' : 'Amount off (PKR)'}</Label>
                  <Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
                </div>
                {form.type === 'percent' && (
                  <div>
                    <Label>Max discount (PKR)</Label>
                    <Input type="number" value={form.max_discount} onChange={(e) => setForm({ ...form, max_discount: e.target.value })} placeholder="Optional cap" />
                  </div>
                )}
              </div>
            )}
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <Label>Min order</Label>
                <Input type="number" value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })} />
              </div>
              <div>
                <Label>Total uses</Label>
                <Input type="number" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} placeholder="∞" />
              </div>
              <div>
                <Label>Per user</Label>
                <Input type="number" value={form.per_user_limit} onChange={(e) => setForm({ ...form, per_user_limit: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Expires at</Label>
              <Input type="datetime-local" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label>Active</Label>
                <p className="text-xs text-muted-foreground">Customers can apply this code</p>
              </div>
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} className="gradient-primary border-0">{editing ? 'Save' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string; accent: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">{label}</span>
          <Icon className={`h-4 w-4 ${accent}`} />
        </div>
        <p className="text-xl font-bold truncate">{value}</p>
      </CardContent>
    </Card>
  );
}
