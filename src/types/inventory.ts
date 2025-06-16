
export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  category_id: string;
  current_stock: number;
  min_stock: number;
  max_stock: number;
  unit: string;
  cost_per_unit?: number;
  supplier?: string;
  lot_number?: string;
  expiry_date?: string;
  location?: string;
  active: boolean;
  unit_id: string;
  created_at: string;
  updated_at: string;
  categories?: {
    name: string;
    description?: string;
  };
}

export interface InventoryCategory {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryMovement {
  id: string;
  item_id: string;
  movement_type: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  unit_cost: number;
  total_cost: number;
  reason?: string;
  reference_type?: string;
  reference_id?: string;
  performed_by: string;
  created_at: string;
}

export interface UserUnit {
  id: string;
  name: string;
}
