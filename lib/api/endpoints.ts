export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    me: '/auth/me',
  },
  cart: {
    root: '/cart',
    items: '/cart/items',
    item: (itemId: string) => `/cart/items/${itemId}`,
  },
  orders: {
    checkout: '/orders/checkout',
    my: '/orders/my',
    myOrder: (id: string) => `/orders/my/${id}`,
    all: '/orders',
    status: (id: string) => `/orders/${id}/status`,
  },
  addresses: {
    root: '/addresses',
    byId: (id: string) => `/addresses/${id}`,
  },
  payments: {
    methods: '/payments/methods',
    order: (orderId: string) => `/payments/orders/${orderId}`,
    pending: '/payments/pending',
    approve: (id: string) => `/payments/${id}/approve`,
    reject: (id: string) => `/payments/${id}/reject`,
  },
  products: {
    root: '/products',
    byId: (id: string) => `/products/${id}`,
    bySlug: (slug: string) => `/products/slug/${slug}`,
  },
  categories: {
    root: '/categories',
  },
} as const;
