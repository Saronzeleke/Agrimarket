import apiClient from "./client";
import {
  ApiResponse,
  User,
  Product,
  Category,
  Cart,
  Order,
  Address,
  Review,
  WishlistItem,
  Notification,
  PaginatedResponse,
  DashboardAnalytics,
} from "@/types";

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<ApiResponse<{ user: User; accessToken: string }>>("/auth/login", {
      email,
      password,
    }),

  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: string;
  }) => apiClient.post<ApiResponse<{ user: User; accessToken: string }>>("/auth/register", data),

  verifyEmail: (token: string) =>
    apiClient.post<ApiResponse<{ message: string }>>("/auth/verify-email", { token }),

  resendVerification: (email: string) =>
    apiClient.post<ApiResponse<{ message: string }>>("/auth/resend-verification", { email }),

  requestPasswordReset: (email: string) =>
    apiClient.post<ApiResponse<{ message: string }>>("/auth/forgot-password", { email }),

  resetPassword: (token: string, password: string) =>
    apiClient.post<ApiResponse<{ message: string }>>("/auth/reset-password", { token, password }),

  getMe: () => apiClient.get<ApiResponse<User>>("/auth/me"),

  logout: () => apiClient.post<ApiResponse>("/auth/logout"),

  changePassword: (oldPassword: string, newPassword: string) =>
    apiClient.post<ApiResponse>("/auth/change-password", { oldPassword, newPassword }),

  refreshToken: () =>
    apiClient.post<ApiResponse<{ accessToken: string }>>("/auth/refresh"),
};

// Product API
export const productApi = {
  getProducts: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    region?: string;
    rating?: number;
    q?: string;
    sort?: string;
  }) => apiClient.get<ApiResponse<PaginatedResponse<Product>>>("/products", { params }),

  getProductBySlug: (slug: string) =>
    apiClient.get<ApiResponse<Product>>(`/products/slug/${slug}`),

  getProductById: (id: string) => apiClient.get<ApiResponse<Product>>(`/products/${id}`),

  getRelatedProducts: (id: string) =>
    apiClient.get<ApiResponse<Product[]>>(`/products/${id}/related`),

  createProduct: (data: FormData) =>
    apiClient.post<ApiResponse<Product>>("/products", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  updateProduct: (id: string, data: FormData) =>
    apiClient.put<ApiResponse<Product>>(`/products/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  deleteProduct: (id: string) => apiClient.delete<ApiResponse>(`/products/${id}`),
};

// Category API
export const categoryApi = {
  getCategories: () => apiClient.get<ApiResponse<Category[]>>("/categories"),

  getCategoryBySlug: (slug: string) =>
    apiClient.get<ApiResponse<Category>>(`/categories/${slug}`),
};

// Cart API
export const cartApi = {
  getCart: () => apiClient.get<ApiResponse<Cart>>("/cart"),

  getCartCount: () => apiClient.get<ApiResponse<{ count: number }>>("/cart/count"),

  addItem: (productId: string, quantity: number) =>
    apiClient.post<ApiResponse<Cart>>("/cart/items", { productId, quantity }),

  updateItem: (itemId: string, quantity: number) =>
    apiClient.patch<ApiResponse<Cart>>(`/cart/items/${itemId}`, { quantity }),

  removeItem: (itemId: string) => apiClient.delete<ApiResponse<Cart>>(`/cart/items/${itemId}`),

  clearCart: () => apiClient.delete<ApiResponse>("/cart/items"),

  validateCart: () => apiClient.get<ApiResponse<{ valid: boolean; errors?: string[] }>>("/cart/validate"),
};

// Order API
export const orderApi = {
  getOrders: (params?: { page?: number; limit?: number; status?: string }) =>
    apiClient.get<ApiResponse<PaginatedResponse<Order>>>("/orders", { params }),

  getOrderById: (id: string) => apiClient.get<ApiResponse<Order>>(`/orders/${id}`),

  getOrderByNumber: (orderNumber: string) =>
    apiClient.get<ApiResponse<Order>>(`/orders/number/${orderNumber}`),

  cancelOrder: (id: string) => apiClient.post<ApiResponse<Order>>(`/orders/${id}/cancel`),
};

// Checkout API
export const checkoutApi = {
  getSummary: () =>
    apiClient.get<ApiResponse<{ subtotal: number; deliveryFee: number; total: number }>>("/checkout/summary"),

  getPaymentMethods: () =>
    apiClient.get<ApiResponse<Array<{ id: string; name: string; type: string }>>>("/checkout/payment-methods"),

  checkout: (data: { addressId: string; paymentMethodId: string; notes?: string }) =>
    apiClient.post<ApiResponse<Order>>("/checkout", data),
};

// Address API
export const addressApi = {
  getAddresses: () => apiClient.get<ApiResponse<Address[]>>("/addresses"),

  getDefaultAddress: () => apiClient.get<ApiResponse<Address>>("/addresses/default"),

  createAddress: (data: Address) => apiClient.post<ApiResponse<Address>>("/addresses", data),

  updateAddress: (id: string, data: Address) =>
    apiClient.patch<ApiResponse<Address>>(`/addresses/${id}`, data),

  deleteAddress: (id: string) => apiClient.delete<ApiResponse>(`/addresses/${id}`),

  setDefaultAddress: (id: string) =>
    apiClient.post<ApiResponse>(`/addresses/${id}/set-default`),
};

// Wishlist API
export const wishlistApi = {
  getWishlist: () => apiClient.get<ApiResponse<{ items: WishlistItem[] }>>("/wishlist"),

  getWishlistCount: () => apiClient.get<ApiResponse<{ count: number }>>("/wishlist/count"),

  addItem: (productId: string) =>
    apiClient.post<ApiResponse<WishlistItem>>("/wishlist/items", { productId }),

  moveToCart: (itemId: string) =>
    apiClient.post<ApiResponse>(`/wishlist/items/${itemId}/move-to-cart`),

  removeItem: (itemId: string) => apiClient.delete<ApiResponse>(`/wishlist/items/${itemId}`),
};

// Review API
export const reviewApi = {
  getProductReviews: (productId: string, params?: { page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<PaginatedResponse<Review>>>(`/products/${productId}/reviews`, {
      params,
    }),

  createReview: (data: { productId: string; rating: number; comment?: string }) =>
    apiClient.post<ApiResponse<Review>>("/reviews", data),

  updateReview: (id: string, data: { rating: number; comment?: string }) =>
    apiClient.patch<ApiResponse<Review>>(`/reviews/${id}`, data),

  deleteReview: (id: string) => apiClient.delete<ApiResponse>(`/reviews/${id}`),
};

// Notification API
export const notificationApi = {
  getNotifications: (params?: { page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<PaginatedResponse<Notification>>>("/notifications", { params }),

  getUnreadCount: () => apiClient.get<ApiResponse<{ count: number }>>("/notifications/unread/count"),

  markAsRead: (id: string) =>
    apiClient.patch<ApiResponse<Notification>>(`/notifications/${id}/read`),

  markAllAsRead: () => apiClient.patch<ApiResponse>("/notifications/read-all"),

  deleteNotification: (id: string) => apiClient.delete<ApiResponse>(`/notifications/${id}`),
};

// Seller API
export const sellerApi = {
  getProducts: (params?: { page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<PaginatedResponse<Product>>>("/seller/products", { params }),

  getOrders: (params?: { page?: number; limit?: number; status?: string }) =>
    apiClient.get<ApiResponse<PaginatedResponse<Order>>>("/seller/orders", { params }),

  updateOrderStatus: (orderId: string, status: string) =>
    apiClient.patch<ApiResponse<Order>>(`/seller/orders/${orderId}/status`, { status }),

  getLowStockProducts: () =>
    apiClient.get<ApiResponse<Product[]>>("/seller/inventory/low-stock"),

  getDashboardAnalytics: () =>
    apiClient.get<ApiResponse<DashboardAnalytics>>("/seller/analytics/dashboard"),

  getReviews: (params?: { page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<PaginatedResponse<Review>>>("/seller/reviews", { params }),

  respondToReview: (reviewId: string, response: string) =>
    apiClient.post<ApiResponse>(`/seller/reviews/${reviewId}/respond`, { response }),
};
