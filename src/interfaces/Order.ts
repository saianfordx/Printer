export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  table: string;
  total: number;
  items: OrderItem[];
} 