import { useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
    useCategories,
    useCreateCategory,
    useUpdateCategory,
    useDeleteCategory,
} from "@/features/categories/hooks/useCategories";
import { Category } from '@/types';
import { generateSlug } from '@/lib/validation';



interface CategoryForm {
  name: string;
  description: string;
  image: string;
}

const empty: CategoryForm = { name: '', description: '', image: '' };

export default function AdminCategories() {
const {
    data: categories = [],
    isLoading,
    isError,
    error,
  } = useCategories();
  const createCategoryMutation = useCreateCategory();
const updateCategoryMutation = useUpdateCategory();
const deleteCategoryMutation = useDeleteCategory();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryForm>(empty);

  const openCreate = () => {
    setEditingId(null);
    setForm(empty);
    setDialogOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditingId(category._id);

    setForm({
        name: category.name,
        description: category.description ?? "",
        image: category.image ?? "",
    });

    setDialogOpen(true);
};

const handleSave = async () => {
    if (!form.name.trim()) {
        toast.error("Name is required");
        return;
    }

    const payload = {
        name: form.name.trim(),
        slug: generateSlug(form.name),
        description: form.description.trim() || undefined,
        image: form.image.trim() || undefined,
    };

    try {
        if (editingId) {
            await updateCategoryMutation.mutateAsync({
                id: editingId,
                data: payload,
            });

            toast.success("Category updated");
        } else {
            await createCategoryMutation.mutateAsync(payload);

            toast.success("Category created");
        }

        setDialogOpen(false);
        setForm(empty);
        setEditingId(null);
    } catch (error) {
        toast.error(
            editingId
                ? "Failed to update category"
                : "Failed to create category",
            {
                description:
                    error?.response?.data?.message ||
                    "Something went wrong",
            }
        );
    }
};

  const handleDelete = async (category: Category) => {
    if (!confirm(`Delete category "${category.name}"?`)) {
        return;
    }

    try {
        await deleteCategoryMutation.mutateAsync(category._id);

        toast.success("Category deleted");
    } catch (error) {
        toast.error("Failed to delete category", {
            description:
                error?.response?.data?.message ||
                "Something went wrong",
        });
    }
};

const filtered = categories.filter((category: Category) =>
    category.name.toLowerCase().includes(search.toLowerCase())
);

const saving =
    createCategoryMutation.isPending ||
    updateCategoryMutation.isPending;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={openCreate} className="gradient-primary border-0">
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {isError ? (
    <div className="bg-card rounded-xl border p-8 text-center">
        <p className="text-destructive font-medium">
            Failed to load categories
        </p>

        <p className="text-sm text-muted-foreground mt-1">
            {error instanceof Error
                ? error.message
                : "Something went wrong"}
        </p>
    </div>
) : isLoading  ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-muted rounded h-12" />
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead>Products</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={c.image || '/placeholder.svg'}
                        alt={c.name}
                        className="w-10 h-10 rounded object-cover bg-muted"
                      />
                      <p className="font-medium">{c.name}</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground max-w-[400px] truncate">
                    {c.description || '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.productCount ?? 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(c)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No categories found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Category' : 'Add Category'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://..."
              />
              {form.image && (
                <img
                  src={form.image}
                  alt="preview"
                  className="w-20 h-20 rounded object-cover border mt-2"
                  onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                />
              )}
            </div>
            <Button onClick={handleSave} className="w-full gradient-primary border-0" disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update Category' : 'Create Category'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
