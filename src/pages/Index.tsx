import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product, Category } from '@/types';
import { SEO } from '@/components/SEO';
import {
  HeroSlider,
  CategoriesSection,
  FeaturedProducts,
  BestSellers,
  FeaturesBanner,
  PromoBanners,
} from '@/components/home';

export default function Index() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch categories
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        // Fetch featured products with category
        const { data: featuredData } = await supabase
          .from('products')
          .select('*, category:categories(*)')
          .eq('featured', true)
          .limit(5);

        // Fetch best sellers with category
        const { data: bestSellersData } = await supabase
          .from('products')
          .select('*, category:categories(*)')
          .eq('best_seller', true)
          .limit(5);

        if (categoriesData) setCategories(categoriesData as Category[]);
        if (featuredData) setFeaturedProducts(featuredData as Product[]);
        if (bestSellersData) setBestSellers(bestSellersData as Product[]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <>
      <SEO
        title="Home"
        description="Shop the latest electronics, fashion, home essentials & more at MyStore Pakistan. Free delivery on orders over PKR 5,000."
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'MyStore',
          url: 'https://mystore.pk',
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://mystore.pk/products?search={search_term_string}',
            'query-input': 'required name=search_term_string',
          },
        }}
      />
      <HeroSlider />
      <FeaturesBanner />
      <CategoriesSection categories={categories} loading={loading} />
      <FeaturedProducts products={featuredProducts} loading={loading} />
      <PromoBanners />
      <BestSellers products={bestSellers} loading={loading} />
    </>
  );
}
