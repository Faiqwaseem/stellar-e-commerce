import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, ShieldCheck, Smartphone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/formatters';
import { toast } from 'sonner';

export default function MockJazzCash() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const orderId = params.get('orderId') || '';
  const amount = Number(params.get('amount') || 0);

  const [mobile, setMobile] = useState('03001234567');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const settle = async (success: boolean) => {
    if (!orderId) return;
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('mock-payment-callback', {
        body: { order_id: orderId, success, gateway: 'jazzcash' },
      });
      if (error) throw error;
      if (success) {
        toast.success('Payment successful');
        navigate(`/order-success?orderId=${orderId}`);
      } else {
        toast.error('Payment cancelled');
        navigate(`/orders/${orderId}`);
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to update payment');
      setLoading(false);
    }
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) return toast.error('Enter your 4-digit MPIN');
    settle(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-background to-amber-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card rounded-2xl border shadow-xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-rose-600 to-rose-500 text-white p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider opacity-80">Sandbox Gateway</p>
            <h1 className="text-2xl font-bold">JazzCash</h1>
          </div>
          <ShieldCheck className="h-8 w-8 opacity-90" />
        </div>

        <form onSubmit={handlePay} className="p-6 space-y-5">
          <div className="text-center pb-4 border-b">
            <p className="text-xs text-muted-foreground">Amount Payable</p>
            <p className="text-3xl font-bold text-primary">{formatPrice(amount)}</p>
            <p className="text-[11px] text-muted-foreground mt-1 font-mono">
              Order #{orderId.slice(0, 8).toUpperCase()}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Account Number</Label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="pl-10"
                maxLength={11}
                inputMode="numeric"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pin">MPIN</Label>
            <Input
              id="pin"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="••••"
              inputMode="numeric"
              maxLength={6}
            />
            <p className="text-[11px] text-muted-foreground">
              Demo mode — any 4-6 digit PIN will succeed.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <Button
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-700 text-white"
              size="lg"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Pay {formatPrice(amount)}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={() => settle(false)}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-1" /> Cancel & return to store
            </Button>
          </div>

          <p className="text-[10px] text-center text-muted-foreground border-t pt-3">
            This is a simulated JazzCash sandbox screen for local development.
            No real payment is processed.
          </p>
        </form>
      </motion.div>
    </div>
  );
}
