import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Pencil, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { addressSchema, formatZodError } from '@/lib/validation';
import { toast } from 'sonner';

export interface SavedAddress {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  is_default: boolean;
}

const empty = { label: 'Home', full_name: '', phone: '', address: '', city: '', is_default: false };

export function AddressBook({ onSelect }: { onSelect?: (addr: SavedAddress) => void }) {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const fetchAddresses = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('addresses')
      .select('*')
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });
    if (data) setAddresses(data as SavedAddress[]);
    setLoading(false);
  };

  useEffect(() => { fetchAddresses(); /* eslint-disable-next-line */ }, [user]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...empty, is_default: addresses.length === 0 });
    setOpen(true);
  };

  const openEdit = (a: SavedAddress) => {
    setEditingId(a.id);
    setForm({ label: a.label, full_name: a.full_name, phone: a.phone, address: a.address, city: a.city, is_default: a.is_default });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!user) return;
    const parsed = addressSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(formatZodError(parsed.error));
      return;
    }
    setSaving(true);
    const payload = { ...parsed.data, user_id: user.id };
    const { error } = editingId
      ? await supabase.from('addresses').update(payload).eq('id', editingId)
      : await supabase.from('addresses').insert(payload);
    setSaving(false);
    if (error) {
      toast.error('Failed to save address', { description: error.message });
      return;
    }
    toast.success(editingId ? 'Address updated' : 'Address saved');
    setOpen(false);
    fetchAddresses();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this address?')) return;
    const { error } = await supabase.from('addresses').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete', { description: error.message });
      return;
    }
    toast.success('Address deleted');
    fetchAddresses();
  };

  const handleSetDefault = async (id: string) => {
    const { error } = await supabase.from('addresses').update({ is_default: true }).eq('id', id);
    if (error) {
      toast.error('Failed to update', { description: error.message });
      return;
    }
    fetchAddresses();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" /> Saved Addresses
        </h2>
        <Button size="sm" variant="outline" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(2)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />)}
        </div>
      ) : addresses.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center border rounded-lg border-dashed">
          No saved addresses yet. Add one to checkout faster.
        </p>
      ) : (
        <AnimatePresence>
          <div className="grid sm:grid-cols-2 gap-3">
            {addresses.map((a) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="border rounded-lg p-4 bg-card relative"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{a.label}</span>
                    {a.is_default && (
                      <Badge variant="secondary" className="text-xs">
                        <Star className="h-3 w-3 mr-1 fill-current" /> Default
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm font-medium">{a.full_name}</p>
                <p className="text-sm text-muted-foreground">{a.address}, {a.city}</p>
                <p className="text-sm text-muted-foreground">{a.phone}</p>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {onSelect && (
                    <Button size="sm" onClick={() => onSelect(a)}>Use this</Button>
                  )}
                  {!a.is_default && (
                    <Button size="sm" variant="ghost" onClick={() => handleSetDefault(a.id)}>
                      Set default
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => openEdit(a)}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(a.id)}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Address' : 'Add Address'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Label (e.g. Home, Office)</Label>
              <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Full Name</Label>
              <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Address</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>City</Label>
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div className="flex items-center justify-between pt-2">
              <Label htmlFor="is_default">Set as default</Label>
              <Switch
                id="is_default"
                checked={form.is_default}
                onCheckedChange={(v) => setForm({ ...form, is_default: v })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="gradient-primary border-0">
              {saving ? 'Saving...' : 'Save Address'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
