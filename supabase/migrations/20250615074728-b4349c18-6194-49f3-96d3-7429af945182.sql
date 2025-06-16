
-- Criar tabela para tipos de exames de sangue específicos
CREATE TABLE IF NOT EXISTS public.blood_exam_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    code TEXT UNIQUE,
    category TEXT NOT NULL DEFAULT 'Bioquímica',
    sample_volume_ml DECIMAL(5,2) NOT NULL DEFAULT 5.0,
    tube_type TEXT NOT NULL DEFAULT 'Tubo com EDTA',
    preparation_required BOOLEAN DEFAULT FALSE,
    preparation_instructions TEXT,
    reference_values JSONB,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela para grupos de exames (painéis)
CREATE TABLE IF NOT EXISTS public.blood_exam_panels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    total_volume_ml DECIMAL(5,2) NOT NULL DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Relação entre painéis e exames individuais
CREATE TABLE IF NOT EXISTS public.panel_exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    panel_id UUID REFERENCES public.blood_exam_panels(id) ON DELETE CASCADE,
    exam_type_id UUID REFERENCES public.blood_exam_types(id) ON DELETE CASCADE,
    UNIQUE(panel_id, exam_type_id)
);

-- Atualizar tabela de agendamentos para incluir exames de sangue
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS blood_exams JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS total_blood_volume_ml DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS estimated_tubes_needed INTEGER DEFAULT 0;

-- Melhorar tabela de materiais por tipo de exame
ALTER TABLE public.exam_type_materials 
ADD COLUMN IF NOT EXISTS volume_per_exam DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS material_type TEXT DEFAULT 'consumable';

-- Função para calcular volume total de sangue necessário
CREATE OR REPLACE FUNCTION public.calculate_blood_volume_needed(
    p_exam_ids UUID[]
) RETURNS TABLE (
    total_volume_ml DECIMAL,
    tubes_needed INTEGER,
    exam_details JSONB
) LANGUAGE plpgsql AS $$
DECLARE
    exam_record RECORD;
    total_vol DECIMAL := 0;
    exam_info JSONB := '[]'::jsonb;
BEGIN
    FOR exam_record IN 
        SELECT bet.id, bet.name, bet.sample_volume_ml, bet.tube_type
        FROM public.blood_exam_types bet
        WHERE bet.id = ANY(p_exam_ids)
    LOOP
        total_vol := total_vol + exam_record.sample_volume_ml;
        exam_info := exam_info || jsonb_build_object(
            'exam_id', exam_record.id,
            'name', exam_record.name,
            'volume_ml', exam_record.sample_volume_ml,
            'tube_type', exam_record.tube_type
        );
    END LOOP;
    
    RETURN QUERY SELECT 
        total_vol,
        CEIL(total_vol / 5.0)::INTEGER, -- Assumindo tubos de 5ml
        exam_info;
END;
$$;

-- Função melhorada para calcular materiais necessários
CREATE OR REPLACE FUNCTION public.calculate_detailed_exam_materials(
    p_exam_type_id UUID,
    p_blood_exams UUID[] DEFAULT ARRAY[]::UUID[]
) RETURNS TABLE (
    inventory_item_id UUID,
    item_name TEXT,
    quantity_required INTEGER,
    current_stock INTEGER,
    reserved_stock INTEGER,
    available_stock INTEGER,
    sufficient_stock BOOLEAN,
    estimated_cost DECIMAL,
    material_type TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    WITH reserved_items AS (
        SELECT 
            ai.inventory_item_id,
            SUM(ai.quantity_used) as total_reserved
        FROM public.appointment_inventory ai
        JOIN public.appointments a ON ai.appointment_id = a.id
        WHERE a.status IN ('Agendado', 'Confirmado', 'Em andamento')
        GROUP BY ai.inventory_item_id
    ),
    blood_volume_calc AS (
        SELECT 
            COALESCE((SELECT total_volume_ml FROM public.calculate_blood_volume_needed(p_blood_exams)), 0) as blood_volume,
            COALESCE((SELECT tubes_needed FROM public.calculate_blood_volume_needed(p_blood_exams)), 0) as tubes_needed
    )
    SELECT 
        etm.inventory_item_id,
        ii.name as item_name,
        CASE 
            WHEN etm.material_type = 'blood_tube' THEN bvc.tubes_needed
            WHEN etm.material_type = 'reagent' THEN CEIL(bvc.blood_volume / NULLIF(etm.volume_per_exam, 0))
            ELSE etm.quantity_required
        END as quantity_required,
        ii.current_stock,
        COALESCE(ri.total_reserved, 0)::INTEGER as reserved_stock,
        (ii.current_stock - COALESCE(ri.total_reserved, 0))::INTEGER as available_stock,
        (ii.current_stock - COALESCE(ri.total_reserved, 0)) >= 
        CASE 
            WHEN etm.material_type = 'blood_tube' THEN bvc.tubes_needed
            WHEN etm.material_type = 'reagent' THEN CEIL(bvc.blood_volume / NULLIF(etm.volume_per_exam, 0))
            ELSE etm.quantity_required
        END as sufficient_stock,
        (CASE 
            WHEN etm.material_type = 'blood_tube' THEN bvc.tubes_needed
            WHEN etm.material_type = 'reagent' THEN CEIL(bvc.blood_volume / NULLIF(etm.volume_per_exam, 0))
            ELSE etm.quantity_required
        END * COALESCE(ii.cost_per_unit, 0)) as estimated_cost,
        etm.material_type
    FROM public.exam_type_materials etm
    JOIN public.inventory_items ii ON etm.inventory_item_id = ii.id
    LEFT JOIN reserved_items ri ON ri.inventory_item_id = ii.id
    CROSS JOIN blood_volume_calc bvc
    WHERE etm.exam_type_id = p_exam_type_id
    AND ii.active = true
    ORDER BY etm.material_type, ii.name;
END;
$$;

-- Inserir dados iniciais para exames de sangue
INSERT INTO public.blood_exam_types (name, code, category, sample_volume_ml, tube_type, reference_values) VALUES
('Hemograma Completo', 'HC', 'Hematologia', 2.0, 'Tubo EDTA', '{"hemoglobina": "12-16 g/dL", "hematócrito": "36-46%"}'),
('Glicemia de Jejum', 'GLIC', 'Bioquímica', 1.0, 'Tubo Fluoreto', '{"glicose": "70-99 mg/dL"}'),
('Colesterol Total', 'COL', 'Bioquímica', 1.5, 'Tubo Seco', '{"colesterol": "<200 mg/dL"}'),
('Triglicerídeos', 'TRI', 'Bioquímica', 1.0, 'Tubo Seco', '{"triglicerideos": "<150 mg/dL"}'),
('Ureia', 'UR', 'Bioquímica', 1.0, 'Tubo Seco', '{"ureia": "15-40 mg/dL"}'),
('Creatinina', 'CREAT', 'Bioquímica', 1.0, 'Tubo Seco', '{"creatinina": "0.6-1.2 mg/dL"}'),
('TSH', 'TSH', 'Hormônios', 2.0, 'Tubo Seco', '{"tsh": "0.4-4.0 mUI/L"}'),
('T4 Livre', 'T4L', 'Hormônios', 2.0, 'Tubo Seco', '{"t4_livre": "0.8-1.8 ng/dL"}')
ON CONFLICT (name) DO NOTHING;

-- Inserir painéis de exames
INSERT INTO public.blood_exam_panels (name, description, total_volume_ml) VALUES
('Perfil Lipídico', 'Avaliação do perfil de gorduras no sangue', 4.0),
('Check-up Básico', 'Exames básicos para avaliação geral de saúde', 8.0),
('Perfil Tireoidiano', 'Avaliação da função da tireoide', 4.0)
ON CONFLICT DO NOTHING;

-- Relacionar exames aos painéis
WITH panels_data AS (
    SELECT id, name FROM public.blood_exam_panels
),
exams_data AS (
    SELECT id, name FROM public.blood_exam_types
)
INSERT INTO public.panel_exams (panel_id, exam_type_id)
SELECT 
    p.id,
    e.id
FROM panels_data p
CROSS JOIN exams_data e
WHERE 
    (p.name = 'Perfil Lipídico' AND e.name IN ('Colesterol Total', 'Triglicerídeos')) OR
    (p.name = 'Check-up Básico' AND e.name IN ('Hemograma Completo', 'Glicemia de Jejum', 'Ureia', 'Creatinina')) OR
    (p.name = 'Perfil Tireoidiano' AND e.name IN ('TSH', 'T4 Livre'))
ON CONFLICT DO NOTHING;

-- Atualizar materiais para exames de sangue com tipos específicos
UPDATE public.exam_type_materials 
SET material_type = 'blood_tube', volume_per_exam = 5.0
WHERE inventory_item_id IN (
    SELECT id FROM public.inventory_items 
    WHERE name ILIKE '%tubo%' OR name ILIKE '%tube%'
);

UPDATE public.exam_type_materials 
SET material_type = 'reagent', volume_per_exam = 1.0
WHERE inventory_item_id IN (
    SELECT id FROM public.inventory_items 
    WHERE name ILIKE '%reagent%' OR name ILIKE '%álcool%'
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.blood_exam_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_exam_panels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.panel_exams ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Authenticated users can view blood exam types" ON public.blood_exam_types
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view blood exam panels" ON public.blood_exam_panels
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view panel exams" ON public.panel_exams
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage blood exam types" ON public.blood_exam_types
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage blood exam panels" ON public.blood_exam_panels
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage panel exams" ON public.panel_exams
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));
