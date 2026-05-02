import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Download, Layers } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatPrice } from '@/lib/formatters';
import { downloadCSV } from '@/lib/csv';
import { toast } from 'sonner';
import { ProductImageUploader } from '@/components/admin/ProductImageUploader';

interface Category {
  id: string;
  name: string;
}

interface ProductForm {
  name: string;
  description: string;
  price: string;
  original_price: string;
  category_id: string;
  stock: string;
  images: string[];
  featured: boolean;
  best_seller: boolean;
}

const emptyProduct: ProductForm = {
  name: '',
  description: '',
  price: '',
  original_price: '',
  category_id: '',
  stock: '',
  images: [],
  featured: false,
  best_seller: false,
};

type BulkMode = 'set_stock' | 'add_stock' | 'set_price' | 'adjust_price_pct';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkMode, setBulkMode] = useState<BulkMode>('set_stock');
  const [bulkValue, setBulkValue] = useState('');
  const [bulkRunning, setBulkRunning] = useState(false);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*, category:categories(name)')
      .order('created_at', { ascending: false });
    if (data) setProducts(data as Product[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
    supabase.from('categories').select('id, name').then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  const openCreate = () => { setEditingId(null); setForm(emptyProduct); setDialogOpen(true); };

  const openEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description || '',
      price: String(product.price),
      original_price: product.original_price ? String(product.original_price) : '',
      category_id: product.category_id || '',
      stock: String(product.stock),
      images: product.images || [],
      featured: product.featured,
      best_seller: product.best_seller,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) {
      toast.error('Name and price are required');
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description || null,
      price: Number(form.price),
      original_price: form.original_price ? Number(form.original_price) : null,
      category_id: form.category_id || null,
      stock: Number(form.stock) || 0,
      images: form.images,
      featured: form.featured,
      best_seller: form.best_seller,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from('products').update(payload).eq('id', editingId));
    } else {
      ({ error } = await supabase.from('products').insert(payload));
    }

    if (error) {
      toast.error('Failed to save product', { description: error.message });
    } else {
      toast.success(editingId ? 'Product updated' : 'Product created');
      setDialogOpen(false);
      fetchProducts();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete', { description: error.message });
    } else {
      toast.success('Product deleted');
      fetchProducts();
    }
  };

  const filtered = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
    [products, search]
  );

  // ---- Bulk selection ----
  const allFilteredSelected = filtered.length > 0 && filtered.every((p) => selected.has(p.id));
  const toggleAllFiltered = () => {
    const next = new Set(selected);
    if (allFilteredSelected) {
      filtered.forEach((p) => next.delete(p.id));
    } else {
      filtered.forEach((p) => next.add(p.id));
    }
    setSelected(next);
  };
  const toggleOne = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const runBulk = async () => {
    const ids = Array.from(selected);
    if (!ids.length) return;
    const num = Number(bulkValue);
    if (Number.isNaN(num)) return toast.error('Enter a valid number');

    setBulkRunning(true);
    try {
      if (bulkMode === 'set_stock') {
        const { error } = await supabase.from('products').update({ stock: Math.max(0, Math.floor(num)) }).in('id', ids);
        if (error) throw error;
      } else if (bulkMode === 'set_price') {
        if (num < 0) throw new Error('Price must be ≥ 0');
        const { error } = await supabase.from('products').update({ price: num }).in('id', ids);
        if (error) throw error;
      } else {
        // Per-row math: add_stock or adjust_price_pct
        const targets = products.filter((p) => selected.has(p.id));
        const updates = targets.map((p) => {
          if (bulkMode === 'add_stock') {
            return { id: p.id, stock: Math.max(0, p.stock + Math.floor(num)) };
          }
          // adjust_price_pct: e.g. 10 = +10%, -15 = -15%
          const newPrice = Math.max(0, +(p.price * (1 + num / 100)).toFixed(2));
          return { id: p.id, price: newPrice };
        });
        // Run sequentially in small batches to keep it simple and avoid huge SQL
        for (const u of updates) {
          const { id, ...patch } = u;
          const { error } = await supabase.from('products').update(patch).eq('id', id);
          if (error) throw error;
        }
      }
      toast.success(`Updated ${ids.length} product${ids.length > 1 ? 's' : ''}`);
      setBulkOpen(false);
      setBulkValue('');
      setSelected(new Set());
      fetchProducts();
    } catch (e: any) {
      toast.error('Bulk update failed', { description: e.message });
    } finally {
      setBulkRunning(false);
    }
  };

  const bulkDelete = async () => {
    const ids = Array.from(selected);
    if (!ids.length) return;
    if (!confirm(`Delete ${ids.length} product${ids.length > 1 ? 's' : ''}? This cannot be undone.`)) return;
    const { error } = await supabase.from('products').delete().in('id', ids);
    if (error) return toast.error('Failed to delete', { description: error.message });
    toast.success(`Deleted ${ids.length} products`);
    setSelected(new Set());
    fetchProducts();
  };

  const exportCSV = () => {
    const rows = filtered.map((p) => [
      p.id,
      p.name,
      p.category?.name || '',
      p.price,
      p.original_price ?? '',
      p.stock,
      p.featured ? 'yes' : 'no',
      p.best_seller ? 'yes' : 'no',
      p.rating ?? 0,
      p.review_count ?? 0,
      new Date(p.created_at).toISOString(),
    ]);
    downloadCSV(
      `products-${new Date().toISOString().slice(0, 10)}.csv`,
      ['ID', 'Name', 'Category', 'Price (PKR)', 'Original Price', 'Stock', 'Featured', 'Best Seller', 'Rating', 'Reviews', 'Created'],
      rows
    );
    toast.success(`Exported ${filtered.length} products`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV} disabled={!filtered.length}>
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
          <Button onClick={openCreate} className="gradient-primary border-0">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl border bg-muted/40">
          <Layers className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">{selected.size} selected</span>
          <div className="flex-1" />
          <Button size="sm" variant="outline" onClick={() => setBulkOpen(true)}>Bulk Edit</Button>
          <Button size="sm" variant="outline" className="text-destructive" onClick={bulkDelete}>
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Clear</Button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse bg-muted rounded h-12" />
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox checked={allFilteredSelected} onCheckedChange={toggleAllFiltered} aria-label="Select all" />
                </TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="hidden sm:table-cell">Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product) => (
                <TableRow key={product.id} data-state={selected.has(product.id) ? 'selected' : undefined}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(product.id)}
                      onCheckedChange={() => toggleOne(product.id)}
                      aria-label={`Select ${product.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={product.images?.[0] || '/placeholder.svg'}
                        alt={product.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <div className="min-w-0">
                        <p className="font-medium truncate max-w-[200px]">{product.name}</p>
                        {product.featured && <Badge variant="secondary" className="text-xs">Featured</Badge>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {product.category?.name || '—'}
                  </TableCell>
                  <TableCell className="font-medium">{formatPrice(product.price)}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant={product.stock > 0 ? 'secondary' : 'destructive'}>
                      {product.stock}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(product)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No products found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Bulk Edit Dialog */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Edit ({selected.size} products)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Action</Label>
              <Select value={bulkMode} onValueChange={(v) => setBulkMode(v as BulkMode)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="set_stock">Set stock to…</SelectItem>
                  <SelectItem value="add_stock">Increase stock by… (use negative to reduce)</SelectItem>
                  <SelectItem value="set_price">Set price to… (PKR)</SelectItem>
                  <SelectItem value="adjust_price_pct">Adjust price by…% (e.g. -15 for sale)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>
                {bulkMode === 'adjust_price_pct' ? 'Percentage' :
                  bulkMode.includes('stock') ? 'Quantity' : 'Price (PKR)'}
              </Label>
              <Input
                type="number"
                value={bulkValue}
                onChange={(e) => setBulkValue(e.target.value)}
                placeholder={bulkMode === 'adjust_price_pct' ? 'e.g. -15' : '0'}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {bulkMode === 'set_stock' && 'All selected products will have this exact stock count.'}
                {bulkMode === 'add_stock' && 'Added to each product\'s current stock. Negative reduces stock.'}
                {bulkMode === 'set_price' && 'All selected products will have this exact price.'}
                {bulkMode === 'adjust_price_pct' && 'Applies % change per product. -15 makes them 15% cheaper.'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkOpen(false)}>Cancel</Button>
            <Button onClick={runBulk} disabled={bulkRunning || bulkValue === ''} className="gradient-primary border-0">
              {bulkRunning ? 'Applying…' : `Apply to ${selected.size}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (PKR) *</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Original Price</Label>
                <Input type="number" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Stock</Label>
                <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Product Images</Label>
              <ProductImageUploader
                images={form.images}
                onChange={(imgs) => setForm({ ...form, images: imgs })}
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="rounded" />
                Featured
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.best_seller} onChange={(e) => setForm({ ...form, best_seller: e.target.checked })} className="rounded" />
                Best Seller
              </label>
            </div>
            <Button onClick={handleSave} className="w-full gradient-primary border-0" disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
