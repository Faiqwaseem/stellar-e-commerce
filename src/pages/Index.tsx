import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product, Category } from '@/types';
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
      <HeroSlider />
      <FeaturesBanner />
      <CategoriesSection categories={categories} loading={loading} />
      <FeaturedProducts products={featuredProducts} loading={loading} />
      <PromoBanners />
      <BestSellers products={bestSellers} loading={loading} />
    </>
  );
}
