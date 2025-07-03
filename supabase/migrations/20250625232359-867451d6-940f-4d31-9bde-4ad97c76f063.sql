
-- First, let's fix the function type mismatch
DROP FUNCTION IF EXISTS public.calculate_exam_materials(uuid);

CREATE OR REPLACE FUNCTION public.calculate_exam_materials(p_exam_type_id uuid)
RETURNS TABLE(
  inventory_item_id uuid, 
  item_name text, 
  quantity_required integer, 
  current_stock integer, 
  available_stock integer, 
  sufficient_stock boolean, 
  estimated_cost numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        etm.inventory_item_id,
        ii.name as item_name,
        etm.quantity_required,
        ii.current_stock,
        (ii.current_stock - COALESCE((
            SELECT SUM(ai.quantity_used)::integer
            FROM public.appointment_inventory ai
            WHERE ai.inventory_item_id = ii.id
            AND EXISTS (
                SELECT 1 FROM public.appointments a 
                WHERE a.id = ai.appointment_id 
                AND a.status IN ('Agendado', 'Confirmado')
            )
        ), 0))::integer as available_stock,
        ((ii.current_stock - COALESCE((
            SELECT SUM(ai.quantity_used)::integer
            FROM public.appointment_inventory ai
            WHERE ai.inventory_item_id = ii.id
            AND EXISTS (
                SELECT 1 FROM public.appointments a 
                WHERE a.id = ai.appointment_id 
                AND a.status IN ('Agendado', 'Confirmado')
            )
        ), 0)) >= etm.quantity_required) as sufficient_stock,
        (etm.quantity_required * COALESCE(ii.cost_per_unit, 0)) as estimated_cost
    FROM public.exam_type_materials etm
    JOIN public.inventory_items ii ON etm.inventory_item_id = ii.id
    WHERE etm.exam_type_id = p_exam_type_id
    AND ii.active = true
    ORDER BY ii.name;
END;
$$;

-- Now recreate the appointments table
DROP TABLE IF EXISTS public.appointments CASCADE;

CREATE TABLE public.appointments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_name text NOT NULL,
  patient_email text NULL,
  patient_phone text NULL,
  exam_type_id uuid NOT NULL,
  doctor_id uuid NOT NULL,
  unit_id uuid NOT NULL,
  scheduled_date timestamp with time zone NOT NULL,
  duration_minutes integer NULL DEFAULT 30,
  status text NULL DEFAULT 'Agendado'::text,
  cost numeric(10, 2) NULL,
  notes text NULL,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  blood_exams jsonb NULL DEFAULT '[]'::jsonb,
  total_blood_volume_ml numeric(5, 2) NULL DEFAULT 0,
  estimated_tubes_needed integer NULL DEFAULT 0,
  CONSTRAINT appointments_pkey PRIMARY KEY (id),
  CONSTRAINT appointments_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users (id),
  CONSTRAINT appointments_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES doctors (id),
  CONSTRAINT appointments_exam_type_id_fkey FOREIGN KEY (exam_type_id) REFERENCES exam_types (id),
  CONSTRAINT appointments_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES units (id),
  CONSTRAINT appointments_status_check CHECK (
    status = ANY (
      ARRAY[
        'Agendado'::text,
        'Confirmado'::text,
        'Em andamento'::text,
        'Concluído'::text,
        'Cancelado'::text
      ]
    )
  )
);

-- Create triggers
CREATE TRIGGER trigger_release_exam_materials
  AFTER UPDATE ON appointments 
  FOR EACH ROW
  EXECUTE FUNCTION release_exam_materials();

CREATE TRIGGER trigger_reserve_exam_materials
  AFTER INSERT ON appointments 
  FOR EACH ROW
  EXECUTE FUNCTION reserve_exam_materials();

CREATE TRIGGER update_appointments_updated_at 
  BEFORE UPDATE ON appointments 
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Create simplified RLS policies
CREATE POLICY "Users can view appointments from their unit" 
  ON public.appointments 
  FOR SELECT 
  TO authenticated 
  USING (
    unit_id IN (
      SELECT unit_id FROM profiles WHERE id = auth.uid()
    ) OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'supervisor')
  );

CREATE POLICY "Users can create appointments" 
  ON public.appointments 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    auth.uid() = created_by AND
    (unit_id IN (
      SELECT unit_id FROM profiles WHERE id = auth.uid()
    ) OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'supervisor'))
  );

CREATE POLICY "Users can update appointments from their unit" 
  ON public.appointments 
  FOR UPDATE 
  TO authenticated 
  USING (
    unit_id IN (
      SELECT unit_id FROM profiles WHERE id = auth.uid()
    ) OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'supervisor')
  )
  WITH CHECK (
    unit_id IN (
      SELECT unit_id FROM profiles WHERE id = auth.uid()
    ) OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'supervisor')
  );

CREATE POLICY "Users can delete appointments from their unit" 
  ON public.appointments 
  FOR DELETE 
  TO authenticated 
  USING (
    unit_id IN (
      SELECT unit_id FROM profiles WHERE id = auth.uid()
    ) OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'supervisor')
  );
