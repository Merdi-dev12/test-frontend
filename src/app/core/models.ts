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
