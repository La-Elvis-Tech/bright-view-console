
-- Criar tabela para definir itens necessários por tipo de exame
CREATE TABLE public.exam_type_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_type_id UUID REFERENCES public.exam_types(id) ON DELETE CASCADE NOT NULL,
    inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE NOT NULL,
    quantity_required INTEGER NOT NULL DEFAULT 1,
    is_optional BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(exam_type_id, inventory_item_id)
);

-- Habilitar RLS
ALTER TABLE public.exam_type_materials ENABLE ROW LEVEL SECURITY;

-- Política para visualizar materiais dos exames
CREATE POLICY "Authenticated users can view exam materials" ON public.exam_type_materials
    FOR SELECT TO authenticated USING (true);

-- Política para gerenciar materiais (apenas admins e supervisores)
CREATE POLICY "Admins can manage exam materials" ON public.exam_type_materials
    FOR ALL USING (
        public.has_role(auth.uid(), 'admin') OR 
        public.has_role(auth.uid(), 'supervisor')
    );

-- Inserir dados iniciais para tipos de exames DASA
INSERT INTO public.exam_type_materials (exam_type_id, inventory_item_id, quantity_required, notes)
SELECT 
    et.id as exam_type_id,
    ii.id as inventory_item_id,
    CASE 
        WHEN et.name = 'Coleta de Sangue' AND ii.name LIKE '%Luvas%' THEN 1
        WHEN et.name = 'Coleta de Sangue' AND ii.name LIKE '%Seringa%' THEN 1
        WHEN et.name = 'Coleta de Sangue' AND ii.name LIKE '%Tubo%' THEN 2
        WHEN et.name = 'Coleta de Sangue' AND ii.name LIKE '%Álcool%' THEN 1
        WHEN et.name = 'Ultrassom' AND ii.name LIKE '%Gel%' THEN 1
        WHEN et.name = 'Ultrassom' AND ii.name LIKE '%Papel%' THEN 2
        WHEN et.name = 'Raio-X' AND ii.name LIKE '%Chassi%' THEN 1
        WHEN et.name = 'Raio-X' AND ii.name LIKE '%Filme%' THEN 1
        WHEN et.name = 'Eletrocardiograma' AND ii.name LIKE '%Eletrodo%' THEN 10
        WHEN et.name = 'Eletrocardiograma' AND ii.name LIKE '%Gel%' THEN 1
        WHEN et.name = 'Tomografia' AND ii.name LIKE '%Contraste%' THEN 1
        WHEN et.name = 'Tomografia' AND ii.name LIKE '%Seringa%' THEN 1
        WHEN et.name = 'Mamografia' AND ii.name LIKE '%Filme%' THEN 2
        WHEN et.name = 'Colonoscopia' AND ii.name LIKE '%Luvas%' THEN 2
        WHEN et.name = 'Colonoscopia' AND ii.name LIKE '%Gel%' THEN 1
        WHEN et.name = 'Densitometria' AND ii.name LIKE '%Filme%' THEN 1
        ELSE 1
    END as quantity_required,
    CASE 
        WHEN et.name = 'Coleta de Sangue' THEN 'Material básico para coleta'
        WHEN et.name = 'Ultrassom' THEN 'Material para ultrassonografia'
        WHEN et.name = 'Raio-X' THEN 'Material para radiografia'
        WHEN et.name = 'Eletrocardiograma' THEN 'Material para ECG'
        WHEN et.name = 'Tomografia' THEN 'Material para tomografia'
        WHEN et.name = 'Mamografia' THEN 'Material para mamografia'
        WHEN et.name = 'Colonoscopia' THEN 'Material para endoscopia'
        WHEN et.name = 'Densitometria' THEN 'Material para densitometria'
        ELSE 'Material padrão'
    END as notes
FROM public.exam_types et
CROSS JOIN public.inventory_items ii
WHERE 
    (et.name = 'Coleta de Sangue' AND (ii.name ILIKE '%luva%' OR ii.name ILIKE '%seringa%' OR ii.name ILIKE '%tubo%' OR ii.name ILIKE '%álcool%' OR ii.name ILIKE '%algodão%'))
    OR (et.name = 'Ultrassom' AND (ii.name ILIKE '%gel%' OR ii.name ILIKE '%papel%'))
    OR (et.name = 'Raio-X' AND (ii.name ILIKE '%chassi%' OR ii.name ILIKE '%filme%'))
    OR (et.name = 'Eletrocardiograma' AND (ii.name ILIKE '%eletrodo%' OR ii.name ILIKE '%gel%'))
    OR (et.name = 'Tomografia' AND (ii.name ILIKE '%contraste%' OR ii.name ILIKE '%seringa%'))
    OR (et.name = 'Mamografia' AND (ii.name ILIKE '%filme%'))
    OR (et.name = 'Colonoscopia' AND (ii.name ILIKE '%luva%' OR ii.name ILIKE '%gel%' OR ii.name ILIKE '%sonda%'))
    OR (et.name = 'Densitometria' AND (ii.name ILIKE '%filme%'));

-- Função para calcular materiais necessários para um exame
CREATE OR REPLACE FUNCTION public.calculate_exam_materials(p_exam_type_id UUID)
RETURNS TABLE (
    inventory_item_id UUID,
    item_name TEXT,
    quantity_required INTEGER,
    current_stock INTEGER,
    available_stock INTEGER,
    sufficient_stock BOOLEAN,
    estimated_cost DECIMAL
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
            SELECT SUM(ai.quantity_used)
            FROM public.appointment_inventory ai
            WHERE ai.inventory_item_id = ii.id
            AND EXISTS (
                SELECT 1 FROM public.appointments a 
                WHERE a.id = ai.appointment_id 
                AND a.status IN ('Agendado', 'Confirmado')
            )
        ), 0)) as available_stock,
        ((ii.current_stock - COALESCE((
            SELECT SUM(ai.quantity_used)
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

-- Função para reservar materiais automaticamente ao criar agendamento
CREATE OR REPLACE FUNCTION public.reserve_exam_materials()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    material_record RECORD;
    insufficient_materials TEXT[] := '{}';
BEGIN
    -- Verificar se há materiais suficientes e reservar
    FOR material_record IN 
        SELECT * FROM public.calculate_exam_materials(NEW.exam_type_id)
    LOOP
        -- Verificar se há estoque suficiente
        IF NOT material_record.sufficient_stock THEN
            insufficient_materials := array_append(
                insufficient_materials, 
                material_record.item_name || ' (necessário: ' || material_record.quantity_required || ', disponível: ' || material_record.available_stock || ')'
            );
        ELSE
            -- Reservar o material
            INSERT INTO public.appointment_inventory (
                appointment_id,
                inventory_item_id,
                quantity_used,
                cost_per_unit,
                total_cost
            ) VALUES (
                NEW.id,
                material_record.inventory_item_id,
                material_record.quantity_required,
                (SELECT cost_per_unit FROM public.inventory_items WHERE id = material_record.inventory_item_id),
                material_record.estimated_cost
            );
        END IF;
    END LOOP;
    
    -- Se houver materiais insuficientes, cancelar a operação
    IF array_length(insufficient_materials, 1) > 0 THEN
        RAISE EXCEPTION 'Estoque insuficiente para os seguintes materiais: %', array_to_string(insufficient_materials, ', ');
    END IF;
    
    RETURN NEW;
END;
$$;

-- Criar trigger para reservar materiais automaticamente
CREATE TRIGGER trigger_reserve_exam_materials
    AFTER INSERT ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION public.reserve_exam_materials();

-- Função para liberar materiais quando agendamento for cancelado
CREATE OR REPLACE FUNCTION public.release_exam_materials()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Se o status mudou para 'Cancelado', remover as reservas
    IF OLD.status != 'Cancelado' AND NEW.status = 'Cancelado' THEN
        DELETE FROM public.appointment_inventory 
        WHERE appointment_id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Criar trigger para liberar materiais quando cancelado
CREATE TRIGGER trigger_release_exam_materials
    AFTER UPDATE ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION public.release_exam_materials();
