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
    bySlug: (slug: string) => `/categories/slug/${slug}`,
  },
  engagement: {
    wishlists: '/wishlists',
    wishlistItem: (productId: string) => `/wishlists/${productId}`,
    reviewsMy: '/reviews/my',
    reviews: '/reviews',
    productReviews: (productId: string) => `/products/${productId}/reviews`,
    productQuestions: (productId: string) => `/products/${productId}/questions`,
    orderHistory: (orderId: string) => `/orders/my/${orderId}/history`,
  },
  admin: {
    dashboard: '/admin',
    users: '/admin/users',
    user: (id: string) => `/admin/users/${id}`,
    userAction: (id: string, action: 'activate' | 'deactivate' | 'soft-delete' | 'restore' | 'reset-password') =>
      `/admin/users/${id}/${action}`,
    categories: '/admin/categories',
    category: (id: string) => `/admin/categories/${id}`,
    categoryAction: (
      id: string,
      action: 'activate' | 'deactivate' | 'soft-delete' | 'restore' | 'unassign-parent',
    ) => `/admin/categories/${id}/${action}`,
    products: '/admin/products',
    product: (id: string) => `/admin/products/${id}`,
    productAction: (id: string, action: 'soft-delete' | 'restore' | 'set-primary-image' | 'remove-image') =>
      `/admin/products/${id}/${action}`,
    productStock: (id: string) => `/admin/products/${id}/stock`,
    payments: '/admin/payments',
    paymentOrder: (orderId: string) => `/admin/payments/orders/${orderId}`,
    paymentMethods: '/admin/payments/methods',
    paymentMethod: (id: string) => `/admin/payments/methods/${id}`,
    paymentApprove: (id: string) => `/admin/payments/${id}/approve`,
    paymentReject: (id: string) => `/admin/payments/${id}/reject`,
  },
} as const;
