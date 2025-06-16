
export interface ExamMaterial {
  inventory_item_id: string;
  item_name: string;
  quantity_required: number;
  current_stock: number;
  reserved_stock: number;
  available_stock: number;
  sufficient_stock: boolean;
  estimated_cost: number;
  material_type: string;
}

export interface ExamPreparation {
  requires_preparation: boolean;
  preparation_instructions?: string;
  fasting_hours?: number;
  special_instructions?: string;
}

export interface ExamDetails {
  id: string;
  name: string;
  description?: string;
  category: string;
  duration_minutes: number;
  cost: number;
  preparation: ExamPreparation;
  materials: ExamMaterial[];
  total_material_cost: number;
  materials_available: boolean;
}
