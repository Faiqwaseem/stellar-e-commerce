import { useState } from 'react';
import { Tag, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCouponStore } from '@/stores/couponStore';
import { formatPrice } from '@/lib/formatters';
import { toast } from 'sonner';

interface Props {
  subtotal: number;
}

export function CouponInput({ subtotal }: Props) {
  const { user } = useAuth();
  const { applied, apply, clear } = useCouponStore();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    if (!user) {
      toast.error('Please sign in to apply a coupon');
      return;
    }
    if (!code.trim()) return;
    setLoading(true);
    const { data, error } = await supabase.rpc('apply_coupon', {
      _code: code.trim(),
      _subtotal: subtotal,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    const row = Array.isArray(data) ? data[0] : (data as any);
    if (!row) {
      toast.error('Could not apply coupon');
      return;
    }
    apply({
      code: code.trim().toUpperCase(),
      discount: Number(row.discount) || 0,
      free_shipping: !!row.free_shipping,
    });
    setCode('');
    toast.success(`Coupon "${code.trim().toUpperCase()}" applied!`);
  };

  if (applied) {
    return (
      <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
        <div className="flex items-center gap-2 min-w-0">
          <Tag className="h-4 w-4 text-primary shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{applied.code}</p>
            <p className="text-xs text-muted-foreground">
              {applied.free_shipping ? 'Free shipping' : `−${formatPrice(applied.discount)}`}
            </p>
          </div>
        </div>
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={clear}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Coupon code"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        maxLength={40}
        className="uppercase"
      />
      <Button type="button" variant="outline" onClick={handleApply} disabled={loading || !code.trim()}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
      </Button>
    </div>
  );
}
