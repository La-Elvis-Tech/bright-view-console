
-- Criar tabela para armazenar dados de exames finalizados
CREATE TABLE public.exam_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES public.appointments(id),
  exam_type_id UUID NOT NULL REFERENCES public.exam_types(id),
  doctor_id UUID NOT NULL REFERENCES public.doctors(id),
  unit_id UUID NOT NULL REFERENCES public.units(id),
  patient_name TEXT NOT NULL,
  exam_date DATE NOT NULL,
  result_status TEXT NOT NULL DEFAULT 'Concluído' CHECK (result_status IN ('Concluído', 'Alterado', 'Normal')),
  exam_category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir dados fictícios dos últimos 6 meses
INSERT INTO public.exam_results (exam_type_id, doctor_id, unit_id, patient_name, exam_date, result_status, exam_category)
SELECT 
  et.id,
  d.id,
  u.id,
  CASE (random() * 20)::int
    WHEN 0 THEN 'Ana Silva'
    WHEN 1 THEN 'João Santos'
    WHEN 2 THEN 'Maria Oliveira'
    WHEN 3 THEN 'Pedro Costa'
    WHEN 4 THEN 'Carla Ferreira'
    WHEN 5 THEN 'Bruno Lima'
    WHEN 6 THEN 'Sofia Rodrigues'
    WHEN 7 THEN 'Miguel Alves'
    WHEN 8 THEN 'Beatriz Pereira'
    WHEN 9 THEN 'Rafael Gomes'
    WHEN 10 THEN 'Laura Martins'
    WHEN 11 THEN 'Carlos Dias'
    WHEN 12 THEN 'Inês Sousa'
    WHEN 13 THEN 'Tiago Ribeiro'
    WHEN 14 THEN 'Patrícia Nunes'
    WHEN 15 THEN 'Rui Cardoso'
    WHEN 16 THEN 'Mónica Castro'
    WHEN 17 THEN 'André Correia'
    WHEN 18 THEN 'Cristina Machado'
    ELSE 'Sandra Baptista'
  END,
  CURRENT_DATE - (random() * 180)::int,
  CASE (random() * 3)::int
    WHEN 0 THEN 'Concluído'
    WHEN 1 THEN 'Alterado'
    ELSE 'Normal'
  END,
  et.category
FROM public.exam_types et
CROSS JOIN public.doctors d
CROSS JOIN public.units u
WHERE et.active = true AND d.active = true AND u.active = true
AND random() < 0.3  -- Controla a densidade de dados
LIMIT 300;

-- Habilitar RLS
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura baseada na unidade do usuário
CREATE POLICY "Users can view exam results from their unit" 
  ON public.exam_results 
  FOR SELECT 
  USING (
    unit_id IN (
      SELECT unit_id FROM public.profiles WHERE id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'supervisor')
    )
  );

-- Índices para performance
CREATE INDEX idx_exam_results_exam_date ON public.exam_results(exam_date);
CREATE INDEX idx_exam_results_unit_id ON public.exam_results(unit_id);
CREATE INDEX idx_exam_results_exam_type_id ON public.exam_results(exam_type_id);
