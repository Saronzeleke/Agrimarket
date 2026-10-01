export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: "CUSTOMER" | "SELLER" | "ADMIN";
  emailVerified: boolean;
  active: boolean;
  sellerProfile?: SellerProfile;
}

export interface SellerProfile {
  id: string;
  userId: string;
  businessName: string;
  businessDescription?: string;
  businessLicense?: string;
  rating: number;
  totalSales: number;
  verified: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  unit: string;
  categoryId: string;
  sellerId: string;
  productionLocation: string;
  rating: number;
  reviewCount: number;
  active: boolean;
  images: ProductImage[];
  category: Category;
  seller: SellerProfile;
  inventory?: Inventory;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parentId?: string;
  displayOrder: number;
}

export interface Inventory {
  id: string;
  productId: string;
  quantity: number;
  lowStockThreshold: number;
  restockDate?: string;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  shippingAddress: Address;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product: Product;
}

export interface Address {
  id?: string;
  firstName: string;
  lastName: string;
  phone: string;
  region: string;
  city: string;
  subcity?: string;
  woreda?: string;
  kebele?: string;
  streetAddress: string;
  isDefault?: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment?: string;
  verified: boolean;
  user: User;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistItem {
  id: string;
  wishlistId: string;
  productId: string;
  product: Product;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DashboardAnalytics {
  revenue: {
    today: number;
    week: number;
    month: number;
    year: number;
  };
  orders: {
    total: number;
    pending: number;
    processing: number;
    completed: number;
  };
  products: {
    total: number;
    active: number;
    lowStock: number;
  };
}
