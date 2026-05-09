import { useRecentlyViewedStore } from '@/stores/recentlyViewedStore';
import { ProductCard } from './ProductCard';
import { useTranslation } from '@/lib/i18n';

interface Props {
  excludeId?: string;
  title?: string;
}

export function RecentlyViewed({ excludeId, title }: Props) {
  const { items } = useRecentlyViewedStore();
  const { t } = useTranslation();
  const filtered = items.filter((p) => p.id !== excludeId).slice(0, 6);

  if (filtered.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-xl md:text-2xl font-display font-bold mb-6">
        {title || t('recentlyViewed')}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {filtered.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </section>
  );
}
