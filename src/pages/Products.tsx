import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Filter, SlidersHorizontal } from "lucide-react";

import type { Category, Product } from "@/types";

import { useProducts } from "@/features/products/hooks/useProducts";
import { useCategories } from "@/features/categories/hooks/useCategories";

import { ProductGrid } from "@/components/products";
import { SEO } from "@/components/SEO";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Checkbox } from "@/components/ui/checkbox";

import { formatPrice } from "@/lib/formatters";

const DEFAULT_MIN_PRICE = 0;
const DEFAULT_MAX_PRICE = 1_000_000;

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  /*
   * --------------------------------------------------------------------------
   * DATA
   * --------------------------------------------------------------------------
   */

  const {
    data: products = [],
    isLoading: productsLoading,
    isError: productsError,
  } = useProducts();

  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useCategories();

  /*
   * --------------------------------------------------------------------------
   * URL FILTERS
   * --------------------------------------------------------------------------
   */

  const categoryFilter = searchParams.get("category") || "";
  const searchFilter = searchParams.get("search") || "";
  const sortBy = searchParams.get("sort") || "newest";

  const minPrice = Number(searchParams.get("minPrice") ?? DEFAULT_MIN_PRICE);

  const maxPrice = Number(searchParams.get("maxPrice") ?? DEFAULT_MAX_PRICE);

  const featuredFilter = searchParams.get("featured") === "true";

  /*
   * Support old `bestseller=true` URLs during migration.
   *
   * New URL:
   * /products?bestSeller=true
   *
   * Old URL:
   * /products?bestseller=true
   */
  const bestSellerFilter =
    searchParams.get("bestSeller") === "true" ||
    searchParams.get("bestseller") === "true";

  /*
   * --------------------------------------------------------------------------
   * PRICE RANGE
   * --------------------------------------------------------------------------
   *
   * Slider needs local state for smooth interaction.
   * URL is updated when the user finishes moving the slider.
   */

  const [priceRange, setPriceRange] = useState([minPrice, maxPrice]);

  useEffect(() => {
    setPriceRange([minPrice, maxPrice]);
  }, [minPrice, maxPrice]);

  /*
   * --------------------------------------------------------------------------
   * SELECTED CATEGORY
   * --------------------------------------------------------------------------
   *
   * Home page sends category `_id`.
   *
   * We also support category name temporarily so old URLs don't break.
   */

  const selectedCategory = useMemo(() => {
    if (!categoryFilter) {
      return undefined;
    }

    return categories.find(
      (category) =>
        category._id === categoryFilter ||
        category.slug === categoryFilter ||
        category.name === categoryFilter,
    );
  }, [categories, categoryFilter]);

  /*
   * --------------------------------------------------------------------------
   * FILTER + SORT
   * --------------------------------------------------------------------------
   */

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchFilter.trim().toLowerCase();

    let result = [...products];

    /*
     * Category
     */
    if (categoryFilter) {
      if (selectedCategory) {
        result = result.filter(
          (product) => product.category?._id === selectedCategory._id,
        );
      } else {
        /*
         * If an invalid category ID is provided,
         * return no products instead of showing all products.
         */
        result = [];
      }
    }

    /*
     * Search
     */
    if (normalizedSearch) {
      result = result.filter((product) =>
        product.name.toLowerCase().includes(normalizedSearch),
      );
    }

    /*
     * Featured
     */
    if (featuredFilter) {
      result = result.filter((product) => product.featured);
    }

    /*
     * Best Sellers
     */
    if (bestSellerFilter) {
      result = result.filter((product) => product.bestSeller);
    }

    /*
     * Price
     */
    result = result.filter(
      (product) =>
        product.price >= priceRange[0] && product.price <= priceRange[1],
    );

    /*
     * Sorting
     */
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;

      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;

      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;

      case "newest":
      default:
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
    }

    return result;
  }, [
    products,
    categoryFilter,
    selectedCategory,
    searchFilter,
    featuredFilter,
    bestSellerFilter,
    priceRange,
    sortBy,
  ]);

  /*
   * --------------------------------------------------------------------------
   * URL FILTER HELPERS
   * --------------------------------------------------------------------------
   */

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);

    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }

    setSearchParams(newParams);
  };

  const updatePriceRange = (values: number[]) => {
    setPriceRange(values);
  };

  const commitPriceRange = (values: number[]) => {
    const newParams = new URLSearchParams(searchParams);

    if (values[0] > DEFAULT_MIN_PRICE) {
      newParams.set("minPrice", String(values[0]));
    } else {
      newParams.delete("minPrice");
    }

    if (values[1] < DEFAULT_MAX_PRICE) {
      newParams.set("maxPrice", String(values[1]));
    } else {
      newParams.delete("maxPrice");
    }

    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setPriceRange([DEFAULT_MIN_PRICE, DEFAULT_MAX_PRICE]);

    setSearchParams({});
  };

  /*
   * --------------------------------------------------------------------------
   * LOADING / ERROR
   * --------------------------------------------------------------------------
   */

  const loading = productsLoading || categoriesLoading;

  const error = productsError || categoriesError;

  /*
   * --------------------------------------------------------------------------
   * FILTER SIDEBAR
   * --------------------------------------------------------------------------
   */

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-3">Categories</h3>

        <div className="space-y-2">
          <button
            type="button"
            className={`w-full text-left cursor-pointer text-sm py-1 px-2 rounded hover:bg-muted transition-colors ${
              !categoryFilter ? "bg-primary text-primary-foreground" : ""
            }`}
            onClick={() => updateFilter("category", "")}
          >
            All Categories
          </button>

          {categories.map((category: Category) => (
            <button
              key={category._id}
              type="button"
              className={`w-full text-left cursor-pointer text-sm py-1 px-2 rounded hover:bg-muted transition-colors ${
                selectedCategory?._id === category._id
                  ? "bg-primary text-primary-foreground"
                  : ""
              }`}
              onClick={() => updateFilter("category", category._id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>

        <Slider
          value={priceRange}
          onValueChange={updatePriceRange}
          onValueCommit={commitPriceRange}
          min={DEFAULT_MIN_PRICE}
          max={DEFAULT_MAX_PRICE}
          step={1000}
          className="mb-4"
        />

        <div className="flex items-center gap-2 text-sm">
          <span>{formatPrice(priceRange[0])}</span>

          <span>-</span>

          <span>{formatPrice(priceRange[1])}</span>
        </div>
      </div>

      {/* Product Type */}
      <div>
        <h3 className="font-semibold mb-3">Product Type</h3>

        <div className="space-y-2">
          {/* Featured */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={featuredFilter}
              onCheckedChange={(checked) =>
                updateFilter("featured", checked === true ? "true" : "")
              }
            />

            <Label htmlFor="featured" className="text-sm cursor-pointer">
              Featured Products
            </Label>
          </div>

          {/* Best Seller */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="bestSeller"
              checked={bestSellerFilter}
              onCheckedChange={(checked) =>
                updateFilter("bestSeller", checked === true ? "true" : "")
              }
            />

            <Label htmlFor="bestSeller" className="text-sm cursor-pointer">
              Best Sellers
            </Label>
          </div>
        </div>
      </div>

      {/* Clear */}
      <Button variant="outline" onClick={clearFilters} className="w-full">
        Clear Filters
      </Button>
    </div>
  );

  /*
   * --------------------------------------------------------------------------
   * UI
   * --------------------------------------------------------------------------
   */

  const pageTitle = selectedCategory
    ? `${selectedCategory.name} Products`
    : "All Products";

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={pageTitle}
        description={
          selectedCategory
            ? `Browse ${selectedCategory.name} products at MyStore Pakistan. Best prices and free delivery.`
            : "Browse our full catalog of electronics, fashion, home essentials and more at MyStore Pakistan."
        }
      />

      {/* Breadcrumb */}
      <div className="bg-muted/50 py-4">
        <div className="container">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">
              Home
            </Link>

            <span>/</span>

            <span className="text-foreground">Products</span>

            {selectedCategory && (
              <>
                <span>/</span>

                <span className="text-foreground">{selectedCategory.name}</span>
              </>
            )}
          </nav>
        </div>
      </div>

      <div className="container py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              <FilterSidebar />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-display font-bold">
                  {selectedCategory?.name || "All Products"}
                </h1>

                <p className="text-muted-foreground">
                  {loading
                    ? "Loading products..."
                    : `${filteredProducts.length} products found`}
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Mobile Filters */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>

                  <SheetContent side="left">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>

                    <div className="mt-6">
                      <FilterSidebar />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Sort */}
                <Select
                  value={sortBy}
                  onValueChange={(value) =>
                    updateFilter("sort", value === "newest" ? "" : value)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />

                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>

                    <SelectItem value="price-low">
                      Price: Low to High
                    </SelectItem>

                    <SelectItem value="price-high">
                      Price: High to Low
                    </SelectItem>

                    <SelectItem value="rating">Top Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Search info */}
            {searchFilter && (
              <div className="mb-4 p-3 bg-muted rounded-lg">
                <p className="text-sm">
                  Showing results for: <strong>"{searchFilter}"</strong>
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                <p className="text-sm text-destructive">
                  Unable to load products. Please try again.
                </p>
              </div>
            )}

            {/* Products */}
            <ProductGrid products={filteredProducts} loading={loading} />
          </main>
        </div>
      </div>
    </div>
  );
}
