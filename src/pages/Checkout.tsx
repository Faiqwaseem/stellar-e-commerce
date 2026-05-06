import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, MapPin, Phone, User, ArrowLeft, Check, BookMarked } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useCartStore } from '@/stores/cartStore';
import { useCouponStore } from '@/stores/couponStore';
import { CouponInput } from '@/components/checkout/CouponInput';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/formatters';
import { checkoutSchema, formatZodError } from '@/lib/validation';
import { AddressBook, type SavedAddress } from '@/components/profile/AddressBook';
import { toast } from 'sonner';

export default function Checkout() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { applied, clear: clearCoupon } = useCouponStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    paymentMethod: 'cod' as 'cod' | 'jazzcash',
  });
  const [loading, setLoading] = useState(false);
  const [addressBookOpen, setAddressBookOpen] = useState(false);

  const subtotal = getTotalPrice();
  const baseShipping = subtotal > 5000 ? 0 : 250;
  const shipping = applied?.free_shipping ? 0 : baseShipping;
  const discount = applied?.discount || 0;
  const total = Math.max(subtotal - discount, 0) + shipping;

  // Auto-fill from default saved address
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('addresses')
        .select('*')
        .eq('is_default', true)
        .maybeSingle();
      if (data) {
        setFormData((p) => ({
          ...p,
          fullName: data.full_name,
          phone: data.phone,
          address: data.address,
          city: data.city,
        }));
      }
    })();
  }, [user]);

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to checkout</h1>
          <Link to="/login">
            <Button className="gradient-primary border-0">Sign In</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUseAddress = (a: SavedAddress) => {
    setFormData((p) => ({
      ...p,
      fullName: a.full_name,
      phone: a.phone,
      address: a.address,
      city: a.city,
    }));
    setAddressBookOpen(false);
    toast.success(`Using "${a.label}" address`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = checkoutSchema.safeParse(formData);
    if (!parsed.success) {
      toast.error(formatZodError(parsed.error));
      return;
    }

    setLoading(true);
    try {
      const { data: orderId, error } = await supabase.rpc('place_order', {
        _items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
        _shipping_address: parsed.data.address,
        _shipping_city: parsed.data.city,
        _phone: parsed.data.phone,
        _payment_method: parsed.data.paymentMethod,
        _coupon_code: applied?.code || null,
      } as any);

      if (error) throw error;

      clearCart();
      clearCoupon();
      if (parsed.data.paymentMethod === 'jazzcash') {
        toast.success('Order created — redirecting to JazzCash…');
        navigate(`/mock-jazzcash?orderId=${orderId}&amount=${total}`);
      } else {
        toast.success('Order placed successfully!');
        navigate(`/order-success?orderId=${orderId}`);
      }
    } catch (error: any) {
      toast.error('Failed to place order', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-muted/50 py-4">
        <div className="container">
          <Link to="/cart" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </Link>
        </div>
      </div>

      <div className="container py-8">
        <h1 className="text-2xl md:text-3xl font-display font-bold mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card rounded-xl border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Shipping Information
                  </h2>
                  <Sheet open={addressBookOpen} onOpenChange={setAddressBookOpen}>
                    <SheetTrigger asChild>
                      <Button type="button" variant="outline" size="sm">
                        <BookMarked className="h-4 w-4 mr-1" /> Saved
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Address Book</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6">
                        <AddressBook onSelect={handleUseAddress} />
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="fullName" value={formData.fullName} onChange={(e) => handleChange('fullName', e.target.value)} placeholder="Your full name" className="pl-10" maxLength={80} required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="phone" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="+92 300 1234567" className="pl-10" maxLength={20} required />
                    </div>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="address">Delivery Address</Label>
                    <Input id="address" value={formData.address} onChange={(e) => handleChange('address', e.target.value)} placeholder="Street address, apartment, suite, etc." maxLength={200} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={formData.city} onChange={(e) => handleChange('city', e.target.value)} placeholder="Lahore" maxLength={80} required />
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl border p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Payment Method
                </h2>
                <RadioGroup value={formData.paymentMethod} onValueChange={(v) => handleChange('paymentMethod', v)} className="space-y-3">
                  <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex-1 cursor-pointer">
                      <span className="font-medium">Cash on Delivery</span>
                      <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="jazzcash" id="jazzcash" />
                    <Label htmlFor="jazzcash" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">JazzCash</span>
                        <span className="text-[10px] uppercase tracking-wide bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">Demo</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Pay online via JazzCash wallet (sandbox)</p>
                    </Label>
                  </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-card rounded-xl border p-6">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-3">
                      <img src={item.product.images[0] || '/placeholder.svg'} alt={item.product.name} className="w-16 h-16 object-cover rounded-lg" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        <p className="text-sm font-medium">{formatPrice(item.product.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                  {discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Discount ({applied?.code})</span>
                      <span className="text-success">−{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={shipping === 0 ? 'text-success' : ''}>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                  </div>
                </div>
                <div className="my-4">
                  <CouponInput subtotal={subtotal} />
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between font-semibold text-lg mb-6">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
                <Button type="submit" className="w-full gradient-primary border-0" size="lg" disabled={loading}>
                  {loading ? 'Placing Order...' : 'Place Order'}
                  <Check className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
