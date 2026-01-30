export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  category: string;
  categorySlug: string;
  rating: number;
  reviewCount: number;
  stock: number;
  features?: string[];
  brand: string;
  isNew?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount: number;
}

export const categories: Category[] = [
  {
    id: "1",
    name: "Electronics",
    slug: "electronics",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop",
    productCount: 156,
  },
  {
    id: "2",
    name: "Fashion",
    slug: "fashion",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop",
    productCount: 243,
  },
  {
    id: "3",
    name: "Home & Kitchen",
    slug: "home-kitchen",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
    productCount: 189,
  },
  {
    id: "4",
    name: "Sports & Outdoors",
    slug: "sports-outdoors",
    image: "https://images.unsplash.com/photo-1461896836934- voices-08de2e31?w=400&h=300&fit=crop",
    productCount: 87,
  },
  {
    id: "5",
    name: "Beauty & Health",
    slug: "beauty-health",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop",
    productCount: 134,
  },
  {
    id: "6",
    name: "Books",
    slug: "books",
    image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=300&fit=crop",
    productCount: 312,
  },
];

export const products: Product[] = [
  {
    id: "1",
    name: "iPhone 15 Pro Max 256GB - Natural Titanium",
    slug: "iphone-15-pro-max-256gb",
    description: "The most powerful iPhone ever with A17 Pro chip, 48MP camera system, and titanium design. Features USB-C, Action button, and exceptional battery life.",
    price: 499999,
    originalPrice: 549999,
    discount: 9,
    images: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&h=600&fit=crop",
    ],
    category: "Electronics",
    categorySlug: "electronics",
    rating: 4.8,
    reviewCount: 2847,
    stock: 23,
    features: ["A17 Pro Chip", "48MP Camera", "Titanium Design", "USB-C"],
    brand: "Apple",
    isNew: true,
    isFeatured: true,
    isBestSeller: true,
  },
  {
    id: "2",
    name: "Samsung Galaxy S24 Ultra 512GB",
    slug: "samsung-galaxy-s24-ultra-512gb",
    description: "Ultimate Galaxy experience with built-in S Pen, 200MP camera, and Galaxy AI features. Titanium frame with stunning display.",
    price: 449999,
    originalPrice: 499999,
    discount: 10,
    images: [
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&h=600&fit=crop",
    ],
    category: "Electronics",
    categorySlug: "electronics",
    rating: 4.7,
    reviewCount: 1923,
    stock: 45,
    features: ["200MP Camera", "Galaxy AI", "S Pen", "Titanium Frame"],
    brand: "Samsung",
    isFeatured: true,
    isBestSeller: true,
  },
  {
    id: "3",
    name: "Sony WH-1000XM5 Wireless Headphones",
    slug: "sony-wh-1000xm5",
    description: "Industry-leading noise cancellation with exceptional sound quality. 30-hour battery life, multipoint connection, and ultra-comfortable design.",
    price: 89999,
    originalPrice: 99999,
    discount: 10,
    images: [
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&h=600&fit=crop",
    ],
    category: "Electronics",
    categorySlug: "electronics",
    rating: 4.9,
    reviewCount: 5621,
    stock: 67,
    features: ["Noise Cancellation", "30hr Battery", "Multipoint", "LDAC"],
    brand: "Sony",
    isFeatured: true,
  },
  {
    id: "4",
    name: "MacBook Pro 14\" M3 Pro 512GB",
    slug: "macbook-pro-14-m3-pro",
    description: "Supercharged by M3 Pro chip with up to 18 hours of battery life. Stunning Liquid Retina XDR display and advanced connectivity.",
    price: 699999,
    originalPrice: 749999,
    discount: 7,
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop",
    ],
    category: "Electronics",
    categorySlug: "electronics",
    rating: 4.9,
    reviewCount: 1245,
    stock: 12,
    features: ["M3 Pro Chip", "18hr Battery", "Liquid Retina XDR", "6 Speakers"],
    brand: "Apple",
    isNew: true,
    isBestSeller: true,
  },
  {
    id: "5",
    name: "Nike Air Max 270 - Men's Sneakers",
    slug: "nike-air-max-270-mens",
    description: "Iconic style meets ultimate comfort. Features the largest heel Air unit for exceptional cushioning. Perfect for everyday wear.",
    price: 24999,
    originalPrice: 29999,
    discount: 17,
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop",
    ],
    category: "Fashion",
    categorySlug: "fashion",
    rating: 4.6,
    reviewCount: 3421,
    stock: 89,
    features: ["Air Max Unit", "Breathable Mesh", "Rubber Outsole"],
    brand: "Nike",
    isFeatured: true,
  },
  {
    id: "6",
    name: "Levi's 501 Original Fit Jeans",
    slug: "levis-501-original-jeans",
    description: "The original blue jean since 1873. Button fly, straight leg, and the signature Levi's quality that lasts.",
    price: 8999,
    originalPrice: 11999,
    discount: 25,
    images: [
      "https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=600&h=600&fit=crop",
    ],
    category: "Fashion",
    categorySlug: "fashion",
    rating: 4.5,
    reviewCount: 8934,
    stock: 234,
    features: ["100% Cotton", "Button Fly", "Classic Fit"],
    brand: "Levi's",
    isBestSeller: true,
  },
  {
    id: "7",
    name: "Instant Pot Duo 7-in-1 Electric Pressure Cooker",
    slug: "instant-pot-duo-7-in-1",
    description: "7 appliances in 1: pressure cooker, slow cooker, rice cooker, steamer, sauté pan, yogurt maker, and warmer. Perfect for busy families.",
    price: 15999,
    originalPrice: 19999,
    discount: 20,
    images: [
      "https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&h=600&fit=crop",
    ],
    category: "Home & Kitchen",
    categorySlug: "home-kitchen",
    rating: 4.7,
    reviewCount: 12456,
    stock: 156,
    features: ["7-in-1 Functions", "6 Quart", "14 Programs", "Stainless Steel"],
    brand: "Instant Pot",
    isFeatured: true,
    isBestSeller: true,
  },
  {
    id: "8",
    name: "Dyson V15 Detect Cordless Vacuum",
    slug: "dyson-v15-detect-cordless",
    description: "Reveals invisible dust with a laser. Powerful suction and intelligent LCD screen shows what you're removing in real-time.",
    price: 149999,
    originalPrice: 169999,
    discount: 12,
    images: [
      "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&h=600&fit=crop",
    ],
    category: "Home & Kitchen",
    categorySlug: "home-kitchen",
    rating: 4.8,
    reviewCount: 3421,
    stock: 34,
    features: ["Laser Dust Detection", "60min Runtime", "LCD Screen", "HEPA Filter"],
    brand: "Dyson",
    isNew: true,
  },
  {
    id: "9",
    name: "The Psychology of Money - Hardcover",
    slug: "psychology-of-money-book",
    description: "Timeless lessons on wealth, greed, and happiness by Morgan Housel. A #1 New York Times bestseller.",
    price: 1499,
    originalPrice: 1999,
    discount: 25,
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=600&fit=crop",
    ],
    category: "Books",
    categorySlug: "books",
    rating: 4.8,
    reviewCount: 45678,
    stock: 567,
    features: ["Hardcover", "256 Pages", "Bestseller"],
    brand: "Harriman House",
    isBestSeller: true,
  },
  {
    id: "10",
    name: "Yoga Mat with Alignment Lines - 6mm",
    slug: "yoga-mat-alignment-6mm",
    description: "Premium non-slip yoga mat with alignment lines. Perfect thickness for comfort and stability during practice.",
    price: 3999,
    originalPrice: 5999,
    discount: 33,
    images: [
      "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=600&fit=crop",
    ],
    category: "Sports & Outdoors",
    categorySlug: "sports-outdoors",
    rating: 4.6,
    reviewCount: 2345,
    stock: 189,
    features: ["Non-Slip", "6mm Thick", "Alignment Lines", "Eco-Friendly"],
    brand: "Liforme",
    isFeatured: true,
  },
  {
    id: "11",
    name: "Maybelline Fit Me Foundation - All Skin Types",
    slug: "maybelline-fit-me-foundation",
    description: "Lightweight foundation that fits skin tone and texture. Natural finish, oil-free formula for a flawless look.",
    price: 899,
    originalPrice: 1199,
    discount: 25,
    images: [
      "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&h=600&fit=crop",
    ],
    category: "Beauty & Health",
    categorySlug: "beauty-health",
    rating: 4.4,
    reviewCount: 15678,
    stock: 456,
    features: ["Oil-Free", "Natural Finish", "SPF 18", "40 Shades"],
    brand: "Maybelline",
    isBestSeller: true,
  },
  {
    id: "12",
    name: "Apple Watch Series 9 GPS 45mm",
    slug: "apple-watch-series-9-45mm",
    description: "The most powerful Apple Watch yet with S9 chip, Double Tap gesture, and brighter display. Your essential health and fitness companion.",
    price: 129999,
    originalPrice: 139999,
    discount: 7,
    images: [
      "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600&h=600&fit=crop",
    ],
    category: "Electronics",
    categorySlug: "electronics",
    rating: 4.8,
    reviewCount: 4567,
    stock: 78,
    features: ["S9 Chip", "Double Tap", "Always-On Display", "Blood Oxygen"],
    brand: "Apple",
    isNew: true,
    isFeatured: true,
  },
];

export const getProductBySlug = (slug: string): Product | undefined => {
  return products.find((p) => p.slug === slug);
};

export const getProductsByCategory = (categorySlug: string): Product[] => {
  return products.filter((p) => p.categorySlug === categorySlug);
};

export const getFeaturedProducts = (): Product[] => {
  return products.filter((p) => p.isFeatured);
};

export const getBestSellers = (): Product[] => {
  return products.filter((p) => p.isBestSeller);
};

export const getNewArrivals = (): Product[] => {
  return products.filter((p) => p.isNew);
};

export const formatPrice = (price: number): string => {
  return `PKR ${price.toLocaleString("en-PK")}`;
};
