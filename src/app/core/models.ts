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
