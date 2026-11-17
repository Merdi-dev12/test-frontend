export interface Product {
  id: string;
  name: string;
  priceCdf: number;
  stock: number;
  createdAt: string;
}

export interface ProductPage {
  items: Product[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface NewProduct {
  name: string;
  priceCdf: number;
  stock: number;
}

export interface Order {
  id: string;
  productId: string;
  quantity: number;
  unitPriceCdf: number;
  totalCdf: number;
  status: 'PENDING' | 'PAID';
  createdAt: string;
  paidAt: string | null;
}

export type PaymentProvider = 'VODACOM_MPESA_COD' | 'AIRTEL_COD' | 'ORANGE_COD';
export type PaymentStatus = 'INITIATING' | 'PENDING' | 'UNKNOWN' | 'FAILED' | 'COMPLETED';

export interface PaymentInput {
  provider: PaymentProvider;
  phoneNumber: string;
}

export interface PaymentAttempt {
  orderId: string;
  depositId: string;
  status: PaymentStatus;
  alreadyProcessed?: boolean;
}
