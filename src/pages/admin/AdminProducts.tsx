import { useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Download,
  Layers,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { formatPrice } from "@/lib/formatters";
import { downloadCSV } from "@/lib/csv";
import { generateSlug } from "@/lib/validation";

import { ProductImageUploader } from "@/components/admin/ProductImageUploader";

import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/features/products/hooks/useProducts";

import { useCategories } from "@/features/categories/hooks/useCategories";

import type {
  Product,
  CreateProductPayload,
  UpdateProductPayload,
} from "@/types";

import { toast } from "sonner";

interface ProductForm {
  name: string;
  description: string;
  price: string;
  original_price: string;
  category_id: string;
  stock: string;
  images: string[];
}

const emptyProduct: ProductForm = {
  name: "",
  description: "",
  price: "",
  original_price: "",
  category_id: "",
  stock: "",
  images: [],
};

type BulkMode =
  | "set_stock"
  | "add_stock"
  | "set_price"
  | "adjust_price_pct";

export default function AdminProducts() {
  const [search, setSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyProduct);

  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkMode, setBulkMode] = useState<BulkMode>("set_stock");
  const [bulkValue, setBulkValue] = useState("");

  const {
    data: products = [],
    isLoading: productsLoading,
    isError: productsError,
  } = useProducts();

  const {
    data: categories = [],
    isLoading: categoriesLoading,
  } = useCategories();

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  const saving =
    createProductMutation.isPending || updateProductMutation.isPending;

  const loading = productsLoading || categoriesLoading;

  /*
   * Backend requires a complete product payload even for PATCH.
   *
   * Therefore we create one common payload builder.
   */
  const buildPayload = (
    productForm: ProductForm
  ): CreateProductPayload => {
    const price = Number(productForm.price);
    const stock = Number(productForm.stock);

    return {
      name: productForm.name.trim(),
      slug: generateSlug(productForm.name),
      description: productForm.description.trim(),
      sku: productForm.name.trim().toLowerCase().replace(/\s+/g, "-"),
      price,
      compareAtPrice:
        productForm.original_price.trim() !== ""
          ? Number(productForm.original_price)
          : null,
      category: productForm.category_id,
      stock,
      images: productForm.images,
      isActive: true,
    };
  };

  /*
   * Convert an existing Product returned by the API
   * into the form shape used by the UI.
   */
  const productToForm = (product: Product): ProductForm => {
    return {
      name: product.name,
      description: product.description,
      price: String(product.price),
      original_price:
        product.compareAtPrice != null
          ? String(product.compareAtPrice)
          : "",
      category_id: product.category._id,
      stock: String(product.stock),
      images: product.images ?? [],
    };
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyProduct });
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingId(product._id);
    setForm(productToForm(product));
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const trimmedName = form.name.trim();
    const trimmedDescription = form.description.trim();

    if (!trimmedName) {
      toast.error("Product name is required");
      return;
    }

    if (trimmedDescription.length < 10) {
      toast.error("Description must be at least 10 characters");
      return;
    }

    if (!form.price || Number(form.price) < 0) {
      toast.error("Enter a valid price");
      return;
    }

    if (!form.category_id) {
      toast.error("Category is required");
      return;
    }

    if (!form.stock || Number(form.stock) < 0) {
      toast.error("Enter a valid stock quantity");
      return;
    }

    const payload = buildPayload(form);

    try {
      if (editingId) {
        await updateProductMutation.mutateAsync({
          id: editingId,
          data: payload as UpdateProductPayload,
        });

        toast.success("Product updated");
      } else {
        await createProductMutation.mutateAsync(payload);

        toast.success("Product created");
      }

      setDialogOpen(false);
      setEditingId(null);
      setForm({ ...emptyProduct });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to save product";

      toast.error("Failed to save product", {
        description: message,
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) {
      return;
    }

    try {
      await deleteProductMutation.mutateAsync(id);

      setSelected((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });

      toast.success("Product deleted");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete product";

      toast.error("Failed to delete", {
        description: message,
      });
    }
  };

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return products;
    }

    return products.filter((product) =>
      product.name.toLowerCase().includes(normalizedSearch)
    );
  }, [products, search]);

  // --------------------------------------------------
  // Bulk selection
  // --------------------------------------------------

  const allFilteredSelected =
    filtered.length > 0 &&
    filtered.every((product) => selected.has(product._id));

  const toggleAllFiltered = () => {
    const next = new Set(selected);

    if (allFilteredSelected) {
      filtered.forEach((product) => {
        next.delete(product._id);
      });
    } else {
      filtered.forEach((product) => {
        next.add(product._id);
      });
    }

    setSelected(next);
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);

    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }

    setSelected(next);
  };

  /*
   * Backend does not currently expose a bulk update endpoint.
   *
   * Therefore each selected product is updated through
   * the normal product PATCH endpoint.
   *
   * This keeps the frontend aligned with the actual API contract.
   */
  const runBulk = async () => {
    const ids = Array.from(selected);

    if (!ids.length) {
      return;
    }

    const num = Number(bulkValue);

    if (Number.isNaN(num)) {
      toast.error("Enter a valid number");
      return;
    }

    const targets = products.filter((product) =>
      selected.has(product._id)
    );

    if (!targets.length) {
      return;
    }

    setBulkRunningState(true);

    try {
      for (const product of targets) {
        let nextStock = product.stock;
        let nextPrice = product.price;

        if (bulkMode === "set_stock") {
          nextStock = Math.max(0, Math.floor(num));
        }

        if (bulkMode === "add_stock") {
          nextStock = Math.max(
            0,
            product.stock + Math.floor(num)
          );
        }

        if (bulkMode === "set_price") {
          if (num < 0) {
            throw new Error("Price must be greater than or equal to 0");
          }

          nextPrice = num;
        }

        if (bulkMode === "adjust_price_pct") {
          nextPrice = Math.max(
            0,
            Number(
              (product.price * (1 + num / 100)).toFixed(2)
            )
          );
        }

        const payload: UpdateProductPayload = {
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: nextPrice,
          compareAtPrice: product.compareAtPrice ?? null,
          category: product.category._id,
          brand: product.brand,
          sku: product.sku,
          stock: nextStock,
          images: product.images,
          isActive: product.isActive,
        };

        await updateProductMutation.mutateAsync({
          id: product._id,
          data: payload,
        });
      }

      toast.success(
        `Updated ${ids.length} product${ids.length > 1 ? "s" : ""}`
      );

      setBulkOpen(false);
      setBulkValue("");
      setSelected(new Set());
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Bulk update failed";

      toast.error("Bulk update failed", {
        description: message,
      });
    } finally {
      setBulkRunningState(false);
    }
  };

  const [bulkRunning, setBulkRunningState] = useState(false);

  const bulkDelete = async () => {
    const ids = Array.from(selected);

    if (!ids.length) {
      return;
    }

    if (
      !confirm(
        `Delete ${ids.length} product${
          ids.length > 1 ? "s" : ""
        }? This cannot be undone.`
      )
    ) {
      return;
    }

    setBulkRunningState(true);

    try {
      for (const id of ids) {
        await deleteProductMutation.mutateAsync(id);
      }

      toast.success(
        `Deleted ${ids.length} product${ids.length > 1 ? "s" : ""}`
      );

      setSelected(new Set());
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete products";

      toast.error("Bulk delete failed", {
        description: message,
      });
    } finally {
      setBulkRunningState(false);
    }
  };

  // --------------------------------------------------
  // CSV
  // --------------------------------------------------

  const exportCSV = () => {
    const rows = filtered.map((product) => [
      product._id,
      product.name,
      product.category?.name || "",
      product.price,
      product.compareAtPrice ?? "",
      product.stock,
      product.sku,
      product.brand ?? "",
      product.isActive ? "yes" : "no",
      new Date(product.createdAt).toISOString(),
    ]);

    downloadCSV(
      `products-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`,
      [
        "ID",
        "Name",
        "Category",
        "Price (PKR)",
        "Compare At Price",
        "Stock",
        "SKU",
        "Brand",
        "Active",
        "Created",
      ],
      rows
    );

    toast.success(`Exported ${filtered.length} products`);
  };

  if (productsError) {
    return (
      <div className="rounded-xl border p-6 text-center">
        <p className="text-destructive">
          Failed to load products.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search + Actions */}

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

          <Input
            placeholder="Search products..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportCSV}
            disabled={!filtered.length}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>

          <Button
            onClick={openCreate}
            className="gradient-primary border-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Bulk Selection */}

      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl border bg-muted/40">
          <Layers className="h-4 w-4 text-primary" />

          <span className="text-sm font-medium">
            {selected.size} selected
          </span>

          <div className="flex-1" />

          <Button
            size="sm"
            variant="outline"
            onClick={() => setBulkOpen(true)}
          >
            Bulk Edit
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="text-destructive"
            onClick={bulkDelete}
            disabled={bulkRunning}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelected(new Set())}
          >
            Clear
          </Button>
        </div>
      )}

      {/* Product Table */}

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="animate-pulse bg-muted rounded h-12"
            />
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={allFilteredSelected}
                    onCheckedChange={toggleAllFiltered}
                    aria-label="Select all"
                  />
                </TableHead>

                <TableHead>Product</TableHead>

                <TableHead className="hidden md:table-cell">
                  Category
                </TableHead>

                <TableHead>Price</TableHead>

                <TableHead className="hidden sm:table-cell">
                  Stock
                </TableHead>

                <TableHead className="text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.map((product) => (
                <TableRow
                  key={product._id}
                  data-state={
                    selected.has(product._id)
                      ? "selected"
                      : undefined
                  }
                >
                  <TableCell>
                    <Checkbox
                      checked={selected.has(product._id)}
                      onCheckedChange={() =>
                        toggleOne(product._id)
                      }
                      aria-label={`Select ${product.name}`}
                    />
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          product.images?.[0] ||
                          "/placeholder.svg"
                        }
                        alt={product.name}
                        className="w-10 h-10 rounded object-cover"
                      />

                      <div className="min-w-0">
                        <p className="font-medium truncate max-w-[200px]">
                          {product.name}
                        </p>

                        {!product.isActive && (
                          <Badge
                            variant="destructive"
                            className="text-xs"
                          >
                            Inactive
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {product.category?.name || "—"}
                  </TableCell>

                  <TableCell className="font-medium">
                    {formatPrice(product.price)}
                  </TableCell>

                  <TableCell className="hidden sm:table-cell">
                    <Badge
                      variant={
                        product.stock > 0
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {product.stock}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(product)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleDelete(product._id)
                        }
                        disabled={
                          deleteProductMutation.isPending
                        }
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No products found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Bulk Edit Dialog */}

      <Dialog
        open={bulkOpen}
        onOpenChange={setBulkOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Bulk Edit ({selected.size} products)
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label>Action</Label>

              <Select
                value={bulkMode}
                onValueChange={(value) =>
                  setBulkMode(value as BulkMode)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="set_stock">
                    Set stock to…
                  </SelectItem>

                  <SelectItem value="add_stock">
                    Increase stock by… (use negative to reduce)
                  </SelectItem>

                  <SelectItem value="set_price">
                    Set price to… (PKR)
                  </SelectItem>

                  <SelectItem value="adjust_price_pct">
                    Adjust price by…% (e.g. -15 for sale)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>
                {bulkMode === "adjust_price_pct"
                  ? "Percentage"
                  : bulkMode.includes("stock")
                    ? "Quantity"
                    : "Price (PKR)"}
              </Label>

              <Input
                type="number"
                value={bulkValue}
                onChange={(event) =>
                  setBulkValue(event.target.value)
                }
                placeholder={
                  bulkMode === "adjust_price_pct"
                    ? "e.g. -15"
                    : "0"
                }
              />

              <p className="text-xs text-muted-foreground mt-1">
                {bulkMode === "set_stock" &&
                  "All selected products will have this exact stock count."}

                {bulkMode === "add_stock" &&
                  "Added to each product's current stock. Negative reduces stock."}

                {bulkMode === "set_price" &&
                  "All selected products will have this exact price."}

                {bulkMode === "adjust_price_pct" &&
                  "Applies % change per product. -15 makes them 15% cheaper."}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkOpen(false)}
              disabled={bulkRunning}
            >
              Cancel
            </Button>

            <Button
              onClick={runBulk}
              disabled={
                bulkRunning || bulkValue === ""
              }
              className="gradient-primary border-0"
            >
              {bulkRunning
                ? "Applying…"
                : `Apply to ${selected.size}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Form Dialog */}

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId
                ? "Edit Product"
                : "Add Product"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Name *</Label>

              <Input
                value={form.name}
                onChange={(event) =>
                  setForm({
                    ...form,
                    name: event.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Description *</Label>

              <Textarea
                value={form.description}
                onChange={(event) =>
                  setForm({
                    ...form,
                    description: event.target.value,
                  })
                }
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (PKR) *</Label>

                <Input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      price: event.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Original Price</Label>

                <Input
                  type="number"
                  min="0"
                  value={form.original_price}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      original_price:
                        event.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category *</Label>

                <Select
                  value={form.category_id}
                  onValueChange={(value) =>
                    setForm({
                      ...form,
                      category_id: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>

                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem
                        key={category._id}
                        value={category._id}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Stock *</Label>

                <Input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      stock: event.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Product Images</Label>

              <ProductImageUploader
                images={form.images}
                onChange={(images) =>
                  setForm({
                    ...form,
                    images,
                  })
                }
              />
            </div>

            <Button
              onClick={handleSave}
              className="w-full gradient-primary border-0"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Product"
                  : "Create Product"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}