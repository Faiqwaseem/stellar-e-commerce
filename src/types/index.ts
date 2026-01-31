export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  category_id: string | null;
  stock: number;
  images: string[];
  featured: boolean;
  best_seller: boolean;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: string;
  shipping_city: string;
  phone: string;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  price: number;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'user';
  created_at: string;
}
