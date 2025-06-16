
-- Adicionar coluna unit_id à tabela exam_types para associar exames às unidades
ALTER TABLE public.exam_types 
ADD COLUMN unit_id uuid REFERENCES public.units(id);

-- Atualizar alguns exames existentes para distribuí-los entre as unidades
-- Vamos assumir que temos pelo menos algumas unidades já criadas
UPDATE public.exam_types 
SET unit_id = (SELECT id FROM public.units WHERE active = true ORDER BY created_at LIMIT 1)
WHERE category IN ('Hematologia', 'Bioquímica');

-- Atualizar outros exames para uma segunda unidade se existir
UPDATE public.exam_types 
SET unit_id = (SELECT id FROM public.units WHERE active = true ORDER BY created_at OFFSET 1 LIMIT 1)
WHERE category IN ('Endocrinologia', 'Cardiologia') 
AND (SELECT COUNT(*) FROM public.units WHERE active = true) > 1;

-- Para exames restantes, usar a primeira unidade como padrão
UPDATE public.exam_types 
SET unit_id = (SELECT id FROM public.units WHERE active = true ORDER BY created_at LIMIT 1)
WHERE unit_id IS NULL;
