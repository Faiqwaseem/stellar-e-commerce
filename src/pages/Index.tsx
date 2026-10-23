import { SEO } from "@/components/SEO";

import {
  HeroSlider,
  CategoriesSection,
  FeaturedProducts,
  BestSellers,
  FeaturesBanner,
  PromoBanners,
} from "@/components/home";

import { RecentlyViewed } from "@/components/products/RecentlyViewed";

import { useCategories } from "@/features/categories/hooks/useCategories";
import { useProducts } from "@/features/products/hooks/useProducts";

export default function Index() {
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useCategories();

  const {
    data: products = [],
    isLoading: productsLoading,
    isError: productsError,
  } = useProducts();

  const featuredProducts = products
    .filter((product) => product.featured)
    .slice(0, 5);

  const bestSellers = products
    .filter((product) => product.bestSeller)
    .slice(0, 5);

  const categoriesLoadingState = categoriesLoading;
  const productsLoadingState = productsLoading;

  return (
    <>
      <SEO
        title="Home"
        description="Shop the latest electronics, fashion, home essentials & more at MyStore Pakistan. Free delivery on orders over PKR 5,000."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "MyStore",
          url: "https://mystore.pk",
          potentialAction: {
            "@type": "SearchAction",
            target:
              "https://mystore.pk/products?search={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }}
      />

      <HeroSlider />

      <FeaturesBanner />

      <CategoriesSection
        categories={categories}
        loading={categoriesLoadingState}
      />

      <FeaturedProducts
        products={featuredProducts}
        loading={productsLoadingState}
      />

      <PromoBanners />

      <BestSellers
        products={bestSellers}
        loading={productsLoadingState}
      />

      <div className="container pb-12">
        <RecentlyViewed />
      </div>

      {(categoriesError || productsError) && (
        <div className="container pb-8">
          <p className="text-sm text-destructive">
            Some home page data could not be loaded.
          </p>
        </div>
      )}
    </>
  );
}