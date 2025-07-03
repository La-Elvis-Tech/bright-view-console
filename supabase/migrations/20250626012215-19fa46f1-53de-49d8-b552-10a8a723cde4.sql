
-- Limpar dados em ordem para evitar violações de foreign key
DELETE FROM public.consumption_data;
DELETE FROM public.appointments;
DELETE FROM public.exam_type_materials;
DELETE FROM public.inventory_movements;
DELETE FROM public.inventory_items;
DELETE FROM public.inventory_categories;
DELETE FROM public.doctors WHERE crm IN ('CRM12345', 'CRM67890', 'CRM54321');

-- Inserir unidades sem conflitos
INSERT INTO public.units (name, code, active) VALUES
('Unidade Central Lab', 'UC001', true),
('Unidade Norte Lab', 'UN002', true), 
('Unidade Sul Lab', 'US003', true)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name;

-- Inserir médicos
INSERT INTO public.doctors (name, specialty, crm, email, phone, active) VALUES
('Dr. João Silva', 'Cardiologista', 'CRM12345', 'joao.silva@lab.com', '11999999999', true),
('Dra. Maria Santos', 'Hematologista', 'CRM67890', 'maria.santos@lab.com', '11888888888', true),
('Dr. Pedro Oliveira', 'Clínico Geral', 'CRM54321', 'pedro.oliveira@lab.com', '11777777777', true)
ON CONFLICT (crm) DO NOTHING;

-- Inserir categorias de inventário
INSERT INTO public.inventory_categories (name, description, color, icon) VALUES
('Tubos de Sangue', 'Tubos para coleta de sangue', '#FF6B6B', 'test-tube'),
('Reagentes', 'Reagentes químicos para análises', '#4ECDC4', 'flask'),
('Materiais Descartáveis', 'Materiais de uso único', '#45B7D1', 'trash'),
('Equipamentos', 'Equipamentos e acessórios', '#96CEB4', 'settings')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

-- Inserir itens de inventário com mais detalhes
WITH category_ids AS (
    SELECT id, name FROM public.inventory_categories
),
unit_ids AS (
    SELECT id FROM public.units WHERE code = 'UC001' LIMIT 1
)
INSERT INTO public.inventory_items (
    name, description, sku, current_stock, min_stock, max_stock, 
    cost_per_unit, unit_measure, category_id, unit_id, active
) 
SELECT 
    item_name, 
    item_desc, 
    item_sku, 
    current_stock, 
    min_stock, 
    max_stock, 
    cost, 
    unit_measure, 
    c.id, 
    u.id, 
    true
FROM (
    VALUES 
    -- Tubos para coleta
    ('Tubo EDTA 5ml', 'Tubo com EDTA para hemograma completo', 'TUB001', 500, 50, 1000, 2.50, 'unidade', 'Tubos de Sangue'),
    ('Tubo Seco 5ml', 'Tubo sem anticoagulante para bioquímica', 'TUB002', 300, 30, 600, 2.00, 'unidade', 'Tubos de Sangue'),
    ('Tubo Fluoreto 3ml', 'Tubo com fluoreto para glicose', 'TUB003', 200, 20, 400, 3.00, 'unidade', 'Tubos de Sangue'),
    ('Tubo Citrato 3ml', 'Tubo com citrato para coagulação', 'TUB004', 150, 15, 300, 2.80, 'unidade', 'Tubos de Sangue'),
    -- Reagentes específicos
    ('Reagente Glicose', 'Kit reagente para dosagem de glicose', 'REA001', 100, 10, 200, 15.00, 'frasco', 'Reagentes'),
    ('Reagente Colesterol', 'Kit reagente para colesterol total', 'REA002', 80, 8, 160, 18.50, 'frasco', 'Reagentes'),
    ('Reagente HDL', 'Kit reagente para HDL colesterol', 'REA003', 60, 6, 120, 22.00, 'frasco', 'Reagentes'),
    ('Reagente Triglicérides', 'Kit reagente para triglicérides', 'REA004', 70, 7, 140, 19.50, 'frasco', 'Reagentes'),
    ('Reagente Ureia', 'Kit reagente para ureia', 'REA005', 90, 9, 180, 16.50, 'frasco', 'Reagentes'),
    ('Reagente Creatinina', 'Kit reagente para creatinina', 'REA006', 85, 8, 170, 17.80, 'frasco', 'Reagentes'),
    ('Reagente TGO', 'Kit reagente para TGO/AST', 'REA007', 75, 7, 150, 21.00, 'frasco', 'Reagentes'),
    ('Reagente TGP', 'Kit reagente para TGP/ALT', 'REA008', 75, 7, 150, 21.00, 'frasco', 'Reagentes'),
    -- Materiais descartáveis
    ('Agulha 21G', 'Agulha descartável 21G para coleta', 'AGU001', 1000, 100, 2000, 0.50, 'unidade', 'Materiais Descartáveis'),
    ('Agulha 23G', 'Agulha descartável 23G para coleta pediátrica', 'AGU002', 800, 80, 1600, 0.55, 'unidade', 'Materiais Descartáveis'),
    ('Seringa 10ml', 'Seringa descartável 10ml', 'SER001', 500, 50, 1000, 1.20, 'unidade', 'Materiais Descartáveis'),
    ('Seringa 5ml', 'Seringa descartável 5ml', 'SER002', 600, 60, 1200, 1.00, 'unidade', 'Materiais Descartáveis'),
    ('Álcool 70%', 'Álcool 70% para antissepsia', 'ALC001', 50, 5, 100, 8.00, 'frasco', 'Materiais Descartáveis'),
    ('Algodão', 'Algodão hidrófilo', 'ALG001', 100, 10, 200, 3.50, 'pacote', 'Materiais Descartáveis'),
    ('Garrote', 'Garrote para coleta de sangue', 'GAR001', 50, 5, 100, 12.00, 'unidade', 'Equipamentos'),
    ('Luvas Látex P', 'Luvas descartáveis látex tamanho P', 'LUV001', 200, 20, 400, 25.00, 'caixa', 'Materiais Descartáveis'),
    ('Luvas Látex M', 'Luvas descartáveis látex tamanho M', 'LUV002', 250, 25, 500, 25.00, 'caixa', 'Materiais Descartáveis'),
    ('Luvas Látex G', 'Luvas descartáveis látex tamanho G', 'LUV003', 200, 20, 400, 25.00, 'caixa', 'Materiais Descartáveis')
) AS items(item_name, item_desc, item_sku, current_stock, min_stock, max_stock, cost, unit_measure, cat_name)
JOIN category_ids c ON c.name = items.cat_name
CROSS JOIN unit_ids u;

-- Inserir tipos de exames detalhados (removido ON CONFLICT)
WITH unit_ids AS (
    SELECT id FROM public.units WHERE code = 'UC001' LIMIT 1
)
INSERT INTO public.exam_types (
    name, description, category, duration_minutes, cost, 
    requires_preparation, preparation_instructions, unit_id, active
)
SELECT 
    exam_name, 
    exam_desc, 
    exam_category, 
    duration, 
    cost, 
    requires_prep, 
    prep_instructions, 
    u.id, 
    true
FROM (
    VALUES 
    ('Hemograma Completo', 'Contagem completa de células sanguíneas', 'Hematologia', 30, 25.00, false, NULL),
    ('Glicemia de Jejum', 'Dosagem de glicose em jejum', 'Bioquímica', 15, 12.00, true, 'Jejum de 8-12 horas'),
    ('Perfil Lipídico Completo', 'Colesterol total, HDL, LDL e triglicérides', 'Bioquímica', 20, 45.00, true, 'Jejum de 12 horas'),
    ('Função Renal', 'Ureia e creatinina sérica', 'Bioquímica', 20, 18.00, false, NULL),
    ('Função Hepática', 'TGO, TGP e bilirrubinas', 'Bioquímica', 25, 35.00, false, NULL),
    ('TSH', 'Hormônio estimulante da tireoide', 'Hormônios', 15, 22.00, false, NULL),
    ('Coagulograma', 'Tempo de protrombina e TTPA', 'Coagulação', 25, 28.00, false, NULL),
    ('Colesterol Total', 'Dosagem isolada de colesterol', 'Bioquímica', 15, 15.00, true, 'Jejum de 9-12 horas'),
    ('Triglicérides', 'Dosagem isolada de triglicérides', 'Bioquímica', 15, 18.00, true, 'Jejum de 12 horas'),
    ('Glicose Pós-Prandial', 'Glicose 2h após alimentação', 'Bioquímica', 15, 14.00, false, 'Colher 2h após refeição')
) AS exams(exam_name, exam_desc, exam_category, duration, cost, requires_prep, prep_instructions)
CROSS JOIN unit_ids u;

-- Relacionar materiais com tipos de exames de forma detalhada
WITH exam_materials AS (
    SELECT 
        et.id as exam_type_id,
        ii.id as inventory_item_id,
        CASE 
            -- Hemograma Completo
            WHEN et.name = 'Hemograma Completo' AND ii.name = 'Tubo EDTA 5ml' THEN 1
            WHEN et.name = 'Hemograma Completo' AND ii.name = 'Agulha 21G' THEN 1
            WHEN et.name = 'Hemograma Completo' AND ii.name = 'Seringa 10ml' THEN 1
            WHEN et.name = 'Hemograma Completo' AND ii.name = 'Álcool 70%' THEN 1
            WHEN et.name = 'Hemograma Completo' AND ii.name = 'Algodão' THEN 1
            WHEN et.name = 'Hemograma Completo' AND ii.name = 'Garrote' THEN 1
            WHEN et.name = 'Hemograma Completo' AND ii.name = 'Luvas Látex M' THEN 1
            
            -- Glicemia de Jejum
            WHEN et.name = 'Glicemia de Jejum' AND ii.name = 'Tubo Fluoreto 3ml' THEN 1
            WHEN et.name = 'Glicemia de Jejum' AND ii.name = 'Reagente Glicose' THEN 1
            WHEN et.name = 'Glicemia de Jejum' AND ii.name = 'Agulha 21G' THEN 1
            WHEN et.name = 'Glicemia de Jejum' AND ii.name = 'Seringa 5ml' THEN 1
            WHEN et.name = 'Glicemia de Jejum' AND ii.name = 'Álcool 70%' THEN 1
            WHEN et.name = 'Glicemia de Jejum' AND ii.name = 'Luvas Látex M' THEN 1
            
            -- Perfil Lipídico Completo
            WHEN et.name = 'Perfil Lipídico Completo' AND ii.name = 'Tubo Seco 5ml' THEN 2
            WHEN et.name = 'Perfil Lipídico Completo' AND ii.name = 'Reagente Colesterol' THEN 1
            WHEN et.name = 'Perfil Lipídico Completo' AND ii.name = 'Reagente HDL' THEN 1
            WHEN et.name = 'Perfil Lipídico Completo' AND ii.name = 'Reagente Triglicérides' THEN 1
            WHEN et.name = 'Perfil Lipídico Completo' AND ii.name = 'Agulha 21G' THEN 1
            WHEN et.name = 'Perfil Lipídico Completo' AND ii.name = 'Seringa 10ml' THEN 1
            WHEN et.name = 'Perfil Lipídico Completo' AND ii.name = 'Luvas Látex M' THEN 1
            
            -- Função Renal
            WHEN et.name = 'Função Renal' AND ii.name = 'Tubo Seco 5ml' THEN 1
            WHEN et.name = 'Função Renal' AND ii.name = 'Reagente Ureia' THEN 1
            WHEN et.name = 'Função Renal' AND ii.name = 'Reagente Creatinina' THEN 1
            WHEN et.name = 'Função Renal' AND ii.name = 'Agulha 21G' THEN 1
            WHEN et.name = 'Função Renal' AND ii.name = 'Luvas Látex M' THEN 1
            
            -- Função Hepática
            WHEN et.name = 'Função Hepática' AND ii.name = 'Tubo Seco 5ml' THEN 1
            WHEN et.name = 'Função Hepática' AND ii.name = 'Reagente TGO' THEN 1
            WHEN et.name = 'Função Hepática' AND ii.name = 'Reagente TGP' THEN 1
            WHEN et.name = 'Função Hepática' AND ii.name = 'Agulha 21G' THEN 1
            WHEN et.name = 'Função Hepática' AND ii.name = 'Luvas Látex M' THEN 1
            
            -- TSH
            WHEN et.name = 'TSH' AND ii.name = 'Tubo Seco 5ml' THEN 1
            WHEN et.name = 'TSH' AND ii.name = 'Agulha 21G' THEN 1
            WHEN et.name = 'TSH' AND ii.name = 'Luvas Látex M' THEN 1
            
            -- Coagulograma
            WHEN et.name = 'Coagulograma' AND ii.name = 'Tubo Citrato 3ml' THEN 1
            WHEN et.name = 'Coagulograma' AND ii.name = 'Agulha 21G' THEN 1
            WHEN et.name = 'Coagulograma' AND ii.name = 'Luvas Látex M' THEN 1
            
            ELSE NULL
        END as quantity,
        CASE 
            WHEN ii.name LIKE '%Tubo%' THEN 'blood_tube'
            WHEN ii.name LIKE '%Reagente%' THEN 'reagent'
            WHEN ii.name IN ('Agulha 21G', 'Agulha 23G', 'Seringa 10ml', 'Seringa 5ml') THEN 'collection_material'
            ELSE 'consumable'
        END as material_type,
        CASE 
            WHEN ii.name LIKE '%Reagente%' THEN 3.5
            ELSE 0
        END as volume_per_exam
    FROM public.exam_types et
    CROSS JOIN public.inventory_items ii
    WHERE et.category IN ('Hematologia', 'Bioquímica', 'Hormônios', 'Coagulação')
)
INSERT INTO public.exam_type_materials (
    exam_type_id, inventory_item_id, quantity_required, material_type, volume_per_exam
)
SELECT exam_type_id, inventory_item_id, quantity, material_type, volume_per_exam
FROM exam_materials 
WHERE quantity IS NOT NULL;

-- Inserir alguns agendamentos de exemplo
WITH sample_data AS (
    SELECT 
        u.id as unit_id,
        d.id as doctor_id,
        et.id as exam_type_id,
        p.id as created_by,
        et.cost as exam_cost
    FROM public.units u
    JOIN public.doctors d ON d.active = true
    JOIN public.exam_types et ON et.active = true
    JOIN public.profiles p ON p.status = 'active'
    WHERE u.code = 'UC001'
    LIMIT 15
)
INSERT INTO public.appointments (
    patient_name, patient_email, patient_phone, exam_type_id, 
    doctor_id, unit_id, scheduled_date, duration_minutes, 
    status, cost, notes, created_by
)
SELECT 
    patient_name,
    patient_email,
    patient_phone,
    s.exam_type_id,
    s.doctor_id,
    s.unit_id,
    scheduled_date,
    30,
    'Agendado',
    s.exam_cost,
    'Agendamento de exemplo - ' || patient_name,
    s.created_by
FROM (
    VALUES 
    ('João da Silva', 'joao.silva@email.com', '11999999999', NOW() + INTERVAL '1 day'),
    ('Maria Oliveira', 'maria.oliveira@email.com', '11888888888', NOW() + INTERVAL '2 days'),
    ('Pedro Santos', 'pedro.santos@email.com', '11777777777', NOW() + INTERVAL '3 days'),
    ('Ana Costa', 'ana.costa@email.com', '11666666666', NOW() + INTERVAL '4 days'),
    ('Carlos Lima', 'carlos.lima@email.com', '11555555555', NOW() + INTERVAL '5 days'),
    ('Fernanda Rocha', 'fernanda.rocha@email.com', '11444444444', NOW() + INTERVAL '6 days'),
    ('Roberto Alves', 'roberto.alves@email.com', '11333333333', NOW() + INTERVAL '7 days'),
    ('Juliana Mendes', 'juliana.mendes@email.com', '11222222222', NOW() + INTERVAL '8 days'),
    ('Marcos Pereira', 'marcos.pereira@email.com', '11111111111', NOW() + INTERVAL '9 days'),
    ('Luciana Ferreira', 'luciana.ferreira@email.com', '11000000000', NOW() + INTERVAL '10 days')
) AS patients(patient_name, patient_email, patient_phone, scheduled_date)
CROSS JOIN sample_data s;
