
-- Adicionar mais categorias de inventário
INSERT INTO inventory_categories (name, description, color, icon) VALUES
('Reagentes Químicos', 'Substâncias químicas para análises laboratoriais', '#8B5CF6', 'flask'),
('Equipamentos de Proteção', 'EPIs e equipamentos de segurança', '#F59E0B', 'shield'),
('Vidraria', 'Equipamentos de vidro para laboratório', '#06B6D4', 'beaker'),
('Descartáveis', 'Materiais de uso único', '#EF4444', 'trash'),
('Instrumental Cirúrgico', 'Instrumentos para procedimentos', '#10B981', 'scissors'),
('Medicamentos', 'Fármacos e medicações', '#3B82F6', 'pill'),
('Kits Diagnósticos', 'Kits para testes específicos', '#EC4899', 'test-tube')
ON CONFLICT (name) DO NOTHING;

-- Adicionar mais itens ao inventário
INSERT INTO inventory_items (
  name, description, category_id, unit_measure, current_stock, min_stock, max_stock,
  cost_per_unit, supplier, storage_location, lot_number, expiry_date, unit_id, sku
) VALUES
-- Reagentes Químicos
('Ácido Sulfúrico 98%', 'Reagente para análises químicas', (SELECT id FROM inventory_categories WHERE name = 'Reagentes Químicos'), 'L', 25, 5, 50, 45.90, 'Química Brasil Ltda', 'Sala de Reagentes - A1', 'QBR2024001', '2025-12-31', (SELECT id FROM units LIMIT 1), 'H2SO4-98'),
('Hidróxido de Sódio', 'Base forte para neutralização', (SELECT id FROM inventory_categories WHERE name = 'Reagentes Químicos'), 'kg', 15, 3, 30, 28.50, 'Química Brasil Ltda', 'Sala de Reagentes - A2', 'QBR2024002', '2026-06-30', (SELECT id FROM units LIMIT 1), 'NAOH-PURE'),
('Tampão Fosfato pH 7.4', 'Solução tampão para calibração', (SELECT id FROM inventory_categories WHERE name = 'Reagentes Químicos'), 'L', 8, 2, 20, 35.80, 'LabChem Solutions', 'Geladeira R1', 'LCS2024003', '2025-03-15', (SELECT id FROM units LIMIT 1), 'PB-74'),
('Etanol Absoluto', 'Solvente de alta pureza', (SELECT id FROM inventory_categories WHERE name = 'Reagentes Químicos'), 'L', 12, 5, 25, 52.30, 'Solventes Premium', 'Sala de Reagentes - B1', 'SP2024004', '2025-08-20', (SELECT id FROM units LIMIT 1), 'ETOH-ABS'),

-- Equipamentos de Proteção
('Luvas Nitrílicas P', 'Luvas descartáveis pequenas', (SELECT id FROM inventory_categories WHERE name = 'Equipamentos de Proteção'), 'caixa', 45, 10, 100, 85.90, 'EPI Seguro', 'Almoxarifado - E1', 'EPS2024001', '2027-12-31', (SELECT id FROM units LIMIT 1), 'LUV-NIT-P'),
('Luvas Nitrílicas M', 'Luvas descartáveis médias', (SELECT id FROM inventory_categories WHERE name = 'Equipamentos de Proteção'), 'caixa', 38, 10, 100, 85.90, 'EPI Seguro', 'Almoxarifado - E1', 'EPS2024002', '2027-12-31', (SELECT id FROM units LIMIT 1), 'LUV-NIT-M'),
('Máscara N95', 'Proteção respiratória', (SELECT id FROM inventory_categories WHERE name = 'Equipamentos de Proteção'), 'unid', 120, 50, 500, 12.80, 'Proteção Total', 'Almoxarifado - E2', 'PT2024003', '2026-10-15', (SELECT id FROM units LIMIT 1), 'N95-PFF2'),
('Óculos de Proteção', 'Proteção ocular', (SELECT id FROM inventory_categories WHERE name = 'Equipamentos de Proteção'), 'unid', 25, 5, 50, 45.60, 'Proteção Total', 'Almoxarifado - E2', 'PT2024004', '2028-05-30', (SELECT id FROM units LIMIT 1), 'OCU-PROT'),
('Jaleco Descartável', 'Proteção corporal descartável', (SELECT id FROM inventory_categories WHERE name = 'Equipamentos de Proteção'), 'unid', 80, 20, 200, 18.90, 'Descartáveis Med', 'Almoxarifado - E3', 'DM2024005', '2026-08-12', (SELECT id FROM units LIMIT 1), 'JAL-DESC'),

-- Vidraria
('Béquer 250ml', 'Béquer de vidro borossilicato', (SELECT id FROM inventory_categories WHERE name = 'Vidraria'), 'unid', 35, 8, 80, 28.50, 'Vidros Científicos', 'Laboratório - V1', 'VS2024001', NULL, (SELECT id FROM units LIMIT 1), 'BEQ-250'),
('Pipeta Volumétrica 10ml', 'Pipeta de precisão', (SELECT id FROM inventory_categories WHERE name = 'Vidraria'), 'unid', 22, 5, 50, 65.80, 'Vidros Científicos', 'Laboratório - V1', 'VS2024002', NULL, (SELECT id FROM units LIMIT 1), 'PIP-10ML'),
('Erlenmeyer 500ml', 'Frasco cônico para preparo', (SELECT id FROM inventory_categories WHERE name = 'Vidraria'), 'unid', 18, 4, 40, 42.90, 'Vidros Científicos', 'Laboratório - V2', 'VS2024003', NULL, (SELECT id FROM units LIMIT 1), 'ERL-500'),
('Proveta 100ml', 'Medição volumétrica', (SELECT id FROM inventory_categories WHERE name = 'Vidraria'), 'unid', 15, 3, 30, 38.70, 'Vidros Científicos', 'Laboratório - V2', 'VS2024004', NULL, (SELECT id FROM units LIMIT 1), 'PRO-100'),

-- Descartáveis
('Seringa 5ml', 'Seringa descartável', (SELECT id FROM inventory_categories WHERE name = 'Descartáveis'), 'unid', 250, 50, 1000, 2.80, 'Descartáveis Med', 'Almoxarifado - D1', 'DM2024006', '2026-12-31', (SELECT id FROM units LIMIT 1), 'SER-5ML'),
('Agulha 21G', 'Agulha descartável calibre 21', (SELECT id FROM inventory_categories WHERE name = 'Descartáveis'), 'unid', 180, 30, 500, 1.20, 'Descartáveis Med', 'Almoxarifado - D1', 'DM2024007', '2027-06-30', (SELECT id FROM units LIMIT 1), 'AGU-21G'),
('Tubo Falcon 15ml', 'Tubo cônico para centrifugação', (SELECT id FROM inventory_categories WHERE name = 'Descartáveis'), 'unid', 95, 20, 300, 3.50, 'PlastiLab', 'Laboratório - D1', 'PL2024008', '2026-09-15', (SELECT id FROM units LIMIT 1), 'FAL-15ML'),
('Placa Petri 90mm', 'Placa para cultivo', (SELECT id FROM inventory_categories WHERE name = 'Descartáveis'), 'unid', 75, 15, 200, 4.80, 'PlastiLab', 'Laboratório - D2', 'PL2024009', '2026-11-20', (SELECT id FROM units LIMIT 1), 'PET-90MM'),

-- Medicamentos
('Paracetamol 500mg', 'Analgésico e antipirético', (SELECT id FROM inventory_categories WHERE name = 'Medicamentos'), 'cp', 450, 100, 1000, 0.85, 'Farmácia Nacional', 'Farmácia - M1', 'FN2024001', '2025-09-30', (SELECT id FROM units LIMIT 1), 'PARA-500'),
('Ibuprofeno 400mg', 'Anti-inflamatório', (SELECT id FROM inventory_categories WHERE name = 'Medicamentos'), 'cp', 320, 80, 800, 1.20, 'Farmácia Nacional', 'Farmácia - M1', 'FN2024002', '2025-11-15', (SELECT id FROM units LIMIT 1), 'IBU-400'),
('Soro Fisiológico 250ml', 'Solução salina estéril', (SELECT id FROM inventory_categories WHERE name = 'Medicamentos'), 'frasco', 85, 20, 200, 8.90, 'Soluções Médicas', 'Farmácia - M2', 'SM2024003', '2025-07-22', (SELECT id FROM units LIMIT 1), 'SF-250ML'),

-- Kits Diagnósticos
('Kit Glicose', 'Kit para dosagem de glicose', (SELECT id FROM inventory_categories WHERE name = 'Kits Diagnósticos'), 'kit', 12, 3, 30, 180.50, 'Diagnósticos Avançados', 'Laboratório - K1', 'DA2024001', '2025-04-30', (SELECT id FROM units LIMIT 1), 'KIT-GLI'),
('Kit Colesterol Total', 'Kit para dosagem de colesterol', (SELECT id FROM inventory_categories WHERE name = 'Kits Diagnósticos'), 'kit', 8, 2, 20, 210.80, 'Diagnósticos Avançados', 'Laboratório - K1', 'DA2024002', '2025-06-15', (SELECT id FROM units LIMIT 1), 'KIT-COL'),
('Kit PCR', 'Kit para reação em cadeia da polimerase', (SELECT id FROM inventory_categories WHERE name = 'Kits Diagnósticos'), 'kit', 5, 1, 15, 450.90, 'Biologia Molecular', 'Laboratório - K2', 'BM2024003', '2025-03-10', (SELECT id FROM units LIMIT 1), 'KIT-PCR');

-- Adicionar dados de consumo histórico
INSERT INTO consumption_data (
  item_id, unit_id, period_start, period_end, quantity_consumed, 
  total_cost, average_daily_consumption
) VALUES
-- Último mês
((SELECT id FROM inventory_items WHERE name = 'Luvas Nitrílicas M'), (SELECT id FROM units LIMIT 1), '2024-11-01', '2024-11-30', 120, 1031.00, 4.0),
((SELECT id FROM inventory_items WHERE name = 'Seringa 5ml'), (SELECT id FROM units LIMIT 1), '2024-11-01', '2024-11-30', 380, 1064.00, 12.7),
((SELECT id FROM inventory_items WHERE name = 'Etanol Absoluto'), (SELECT id FROM units LIMIT 1), '2024-11-01', '2024-11-30', 8, 418.40, 0.27),
((SELECT id FROM inventory_items WHERE name = 'Kit Glicose'), (SELECT id FROM units LIMIT 1), '2024-11-01', '2024-11-30', 15, 2707.50, 0.5),
((SELECT id FROM inventory_items WHERE name = 'Máscara N95'), (SELECT id FROM units LIMIT 1), '2024-11-01', '2024-11-30', 85, 1088.00, 2.8),

-- Penúltimo mês
((SELECT id FROM inventory_items WHERE name = 'Luvas Nitrílicas M'), (SELECT id FROM units LIMIT 1), '2024-10-01', '2024-10-31', 95, 816.05, 3.1),
((SELECT id FROM inventory_items WHERE name = 'Seringa 5ml'), (SELECT id FROM units LIMIT 1), '2024-10-01', '2024-10-31', 310, 868.00, 10.0),
((SELECT id FROM inventory_items WHERE name = 'Paracetamol 500mg'), (SELECT id FROM units LIMIT 1), '2024-10-01', '2024-10-31', 220, 187.00, 7.1),
((SELECT id FROM inventory_items WHERE name = 'Kit Colesterol Total'), (SELECT id FROM units LIMIT 1), '2024-10-01', '2024-10-31', 12, 2529.60, 0.39),

-- Terceiro mês
((SELECT id FROM inventory_items WHERE name = 'Luvas Nitrílicas P'), (SELECT id FROM units LIMIT 1), '2024-09-01', '2024-09-30', 140, 1202.60, 4.7),
((SELECT id FROM inventory_items WHERE name = 'Agulha 21G'), (SELECT id FROM units LIMIT 1), '2024-09-01', '2024-09-30', 450, 540.00, 15.0),
((SELECT id FROM inventory_items WHERE name = 'Soro Fisiológico 250ml'), (SELECT id FROM units LIMIT 1), '2024-09-01', '2024-09-30', 65, 578.50, 2.2),
((SELECT id FROM inventory_items WHERE name = 'Béquer 250ml'), (SELECT id FROM units LIMIT 1), '2024-09-01', '2024-09-30', 5, 142.50, 0.17);

-- Adicionar mais tipos de exames baseados na estrutura existente
INSERT INTO exam_types (name, description, category, duration_minutes, cost, requires_preparation, preparation_instructions, active) VALUES
('Hemograma Completo', 'Análise completa das células sanguíneas', 'Hematologia', 45, 35.00, false, NULL, true),
('Bioquímica Básica', 'Painel básico de bioquímica sanguínea', 'Bioquímica', 60, 80.00, true, 'Jejum de 12 horas', true),
('Perfil Lipídico', 'Análise de colesterol e triglicérides', 'Bioquímica', 45, 45.00, true, 'Jejum de 12-14 horas', true),
('Função Hepática', 'Avaliação das enzimas hepáticas', 'Bioquímica', 50, 65.00, false, NULL, true),
('Função Renal', 'Avaliação da função dos rins', 'Bioquímica', 40, 55.00, false, NULL, true),
('Hormônios Tireoidianos', 'TSH, T3 e T4', 'Endocrinologia', 55, 120.00, false, NULL, true),
('Marcadores Cardíacos', 'Troponina, CK-MB', 'Cardiologia', 35, 95.00, false, NULL, true),
('Coagulograma', 'Tempo de protrombina e TTPA', 'Hematologia', 30, 40.00, false, NULL, true),
('Urina Tipo I', 'Exame qualitativo de urina', 'Uroanálise', 25, 25.00, false, 'Primeira urina da manhã', true),
('Cultura de Urina', 'Identificação de bactérias na urina', 'Microbiologia', 120, 70.00, false, 'Jato médio, assepsia prévia', true);

-- Relacionar materiais aos tipos de exames
INSERT INTO exam_type_materials (exam_type_id, inventory_item_id, quantity_required, material_type, volume_per_exam, notes) VALUES
-- Hemograma Completo
((SELECT id FROM exam_types WHERE name = 'Hemograma Completo'), (SELECT id FROM inventory_items WHERE name = 'Seringa 5ml'), 1, 'consumable', NULL, 'Para coleta'),
((SELECT id FROM exam_types WHERE name = 'Hemograma Completo'), (SELECT id FROM inventory_items WHERE name = 'Agulha 21G'), 1, 'consumable', NULL, 'Para coleta'),
((SELECT id FROM exam_types WHERE name = 'Hemograma Completo'), (SELECT id FROM inventory_items WHERE name = 'Luvas Nitrílicas M'), 1, 'consumable', NULL, 'Proteção'),

-- Bioquímica Básica
((SELECT id FROM exam_types WHERE name = 'Bioquímica Básica'), (SELECT id FROM inventory_items WHERE name = 'Kit Glicose'), 1, 'reagent', 10, 'Para dosagem de glicose'),
((SELECT id FROM exam_types WHERE name = 'Bioquímica Básica'), (SELECT id FROM inventory_items WHERE name = 'Seringa 5ml'), 1, 'consumable', NULL, 'Para coleta'),
((SELECT id FROM exam_types WHERE name = 'Bioquímica Básica'), (SELECT id FROM inventory_items WHERE name = 'Tubo Falcon 15ml'), 2, 'blood_tube', NULL, 'Para armazenamento'),

-- Perfil Lipídico
((SELECT id FROM exam_types WHERE name = 'Perfil Lipídico'), (SELECT id FROM inventory_items WHERE name = 'Kit Colesterol Total'), 1, 'reagent', 5, 'Para dosagem'),
((SELECT id FROM exam_types WHERE name = 'Perfil Lipídico'), (SELECT id FROM inventory_items WHERE name = 'Seringa 5ml'), 1, 'consumable', NULL, 'Para coleta'),
((SELECT id FROM exam_types WHERE name = 'Perfil Lipídico'), (SELECT id FROM inventory_items WHERE name = 'Luvas Nitrílicas M'), 1, 'consumable', NULL, 'Proteção');
