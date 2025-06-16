
export interface BloodExamType {
  id: string;
  name: string;
  code?: string;
  category: string;
  sample_volume_ml: number;
  tube_type: string;
  preparation_required: boolean;
  preparation_instructions?: string;
  reference_values?: Record<string, string> | null;
  active: boolean;
  created_at: string;
}

export interface BloodExamPanel {
  id: string;
  name: string;
  description?: string;
  total_volume_ml: number;
  active: boolean;
  created_at: string;
}

export interface PanelExam {
  id: string;
  panel_id: string;
  exam_type_id: string;
}

export interface BloodVolumeCalculation {
  total_volume_ml: number;
  tubes_needed: number;
  exam_details: Array<{
    exam_id: string;
    name: string;
    volume_ml: number;
    tube_type: string;
  }>;
}

export interface DetailedMaterialValidation {
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
