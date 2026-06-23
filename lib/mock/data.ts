export interface MockCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  productCount: number;
  icon: string;
  gradient: string;
}

export interface MockBlog {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  publishedAt: string;
  image: string;
}

export interface MockProduct {
  id: string;
  slug: string;
  title: string;
  price: number;
  brand: string;
  category: string;
  inStock: boolean;
  image: string;
}

export const MOCK_CATEGORIES: MockCategory[] = [
  {
    id: '1',
    name: 'Laptops',
    slug: 'laptops',
    description: 'Powerful machines for work and play',
    productCount: 48,
    icon: '💻',
    gradient: 'from-blue-500/20 to-cyan-500/10',
  },
  {
    id: '2',
    name: 'Smartphones',
    slug: 'smartphones',
    description: 'Latest flagships and budget picks',
    productCount: 62,
    icon: '📱',
    gradient: 'from-violet-500/20 to-purple-500/10',
  },
  {
    id: '3',
    name: 'Accessories',
    slug: 'accessories',
    description: 'Keyboards, mice, and more',
    productCount: 120,
    icon: '🎧',
    gradient: 'from-emerald-500/20 to-teal-500/10',
  },
  {
    id: '4',
    name: 'Monitors',
    slug: 'monitors',
    description: '4K, ultrawide, and gaming displays',
    productCount: 34,
    icon: '🖥️',
    gradient: 'from-orange-500/20 to-amber-500/10',
  },
  {
    id: '5',
    name: 'Networking',
    slug: 'networking',
    description: 'Routers, switches, and mesh Wi-Fi',
    productCount: 27,
    icon: '📡',
    gradient: 'from-rose-500/20 to-pink-500/10',
  },
  {
    id: '6',
    name: 'Storage',
    slug: 'storage',
    description: 'SSDs, HDDs, and portable drives',
    productCount: 41,
    icon: '💾',
    gradient: 'from-sky-500/20 to-indigo-500/10',
  },
];

export const MOCK_BLOGS: MockBlog[] = [
  {
    id: '1',
    slug: '12-nextjs-guide',
    title: 'The Complete Next.js 14 Guide for Modern Web Apps',
    excerpt: 'Learn App Router, Server Components, and how to build blazing-fast storefronts.',
    category: 'Development',
    readTime: '8 min read',
    publishedAt: '2026-06-01',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
  },
  {
    id: '2',
    slug: '20-feature-driven-architecture',
    title: 'Feature-Driven Architecture: Scaling Your Frontend',
    excerpt: 'Why isolating business logic into feature modules keeps teams shipping faster.',
    category: 'Architecture',
    readTime: '6 min read',
    publishedAt: '2026-05-18',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
  },
  {
    id: '3',
    slug: '8-gaming-laptop-2026',
    title: 'Best Gaming Laptops in Yemen for 2026',
    excerpt: 'Our top picks for performance, thermals, and value in the local market.',
    category: 'Reviews',
    readTime: '10 min read',
    publishedAt: '2026-05-02',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
  },
];

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: '1',
    slug: '15-macbook-pro',
    title: 'MacBook Pro 14" M3 Pro',
    price: 2899000,
    brand: 'Apple',
    category: 'Laptops',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80',
  },
  {
    id: '2',
    slug: '22-gaming-laptop',
    title: 'ASUS ROG Strix G16',
    price: 1950000,
    brand: 'ASUS',
    category: 'Laptops',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80',
  },
  {
    id: '3',
    slug: '33-iphone-15',
    title: 'iPhone 15 Pro 256GB',
    price: 1650000,
    brand: 'Apple',
    category: 'Smartphones',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80',
  },
  {
    id: '4',
    slug: '44-samsung-s24',
    title: 'Samsung Galaxy S24 Ultra',
    price: 1780000,
    brand: 'Samsung',
    category: 'Smartphones',
    inStock: false,
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5512dee?w=600&q=80',
  },
  {
    id: '5',
    slug: '55-office-chair',
    title: 'Secretlab Titan Evo Chair',
    price: 420000,
    brand: 'Secretlab',
    category: 'Accessories',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=600&q=80',
  },
  {
    id: '6',
    slug: '66-4k-monitor',
    title: 'LG UltraGear 27" 4K 144Hz',
    price: 680000,
    brand: 'LG',
    category: 'Monitors',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80',
  },
  {
    id: '7',
    slug: '77-mechanical-keyboard',
    title: 'Keychron Q1 Pro Mechanical Keyboard',
    price: 185000,
    brand: 'Keychron',
    category: 'Accessories',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80',
  },
  {
    id: '8',
    slug: '88-nvme-ssd',
    title: 'Samsung 990 Pro 2TB NVMe SSD',
    price: 145000,
    brand: 'Samsung',
    category: 'Storage',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1597872200969-2b65d08a6839?w=600&q=80',
  },
];
