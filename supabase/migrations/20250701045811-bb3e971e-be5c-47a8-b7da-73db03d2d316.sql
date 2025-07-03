
-- Atualizar agendamentos existentes com datas futuras e horários realistas
UPDATE appointments 
SET 
  scheduled_date = CASE 
    WHEN EXTRACT(DOW FROM scheduled_date) = 0 THEN -- Domingo -> Segunda
      (scheduled_date + INTERVAL '1 day')::date + TIME '08:00:00'
    WHEN EXTRACT(DOW FROM scheduled_date) = 6 THEN -- Sábado -> Segunda
      (scheduled_date + INTERVAL '2 days')::date + TIME '08:00:00'
    ELSE
      scheduled_date::date + CASE 
        -- Distribuir horários durante o dia útil
        WHEN EXTRACT(HOUR FROM scheduled_date) < 8 THEN TIME '08:00:00'
        WHEN EXTRACT(HOUR FROM scheduled_date) > 17 THEN TIME '16:30:00'
        ELSE 
          (TIME '08:00:00' + (EXTRACT(HOUR FROM scheduled_date)::int % 10) * INTERVAL '1 hour')::time
      END
  END + INTERVAL '2 months'  -- Mover todos para 2 meses à frente
WHERE scheduled_date < NOW() + INTERVAL '1 month';

-- Criar alguns agendamentos futuros distribuídos pelos próximos 3 meses
INSERT INTO appointments (
  patient_name, patient_email, patient_phone, exam_type_id, doctor_id, unit_id, 
  scheduled_date, duration_minutes, status, cost, notes, created_by
)
SELECT 
  'Paciente ' || generate_series,
  'paciente' || generate_series || '@email.com',
  '(11) 9999-' || LPAD(generate_series::text, 4, '0'),
  (SELECT id FROM exam_types WHERE active = true ORDER BY RANDOM() LIMIT 1),
  (SELECT id FROM doctors WHERE active = true ORDER BY RANDOM() LIMIT 1),
  (SELECT id FROM units WHERE active = true ORDER BY RANDOM() LIMIT 1),
  -- Datas distribuídas pelos próximos 3 meses em horários comerciais
  (CURRENT_DATE + (generate_series % 90) * INTERVAL '1 day')::date + 
  (TIME '08:00:00' + ((generate_series % 9) * INTERVAL '1 hour'))::time,
  30,
  CASE (generate_series % 4)
    WHEN 0 THEN 'Agendado'
    WHEN 1 THEN 'Confirmado'
    WHEN 2 THEN 'Concluído'
    ELSE 'Em andamento'
  END,
  150.00 + (generate_series % 200),
  'Agendamento criado automaticamente',
  (SELECT id FROM profiles WHERE status = 'active' LIMIT 1)
FROM generate_series(1, 50)
WHERE NOT EXISTS (
  SELECT 1 FROM appointments 
  WHERE patient_name = 'Paciente ' || generate_series
);

-- Atualizar exam_results com datas mais recentes e realistas
UPDATE exam_results 
SET 
  exam_date = (CURRENT_DATE - (EXTRACT(DAY FROM exam_date)::int % 30) * INTERVAL '1 day')::date,
  updated_at = NOW()
WHERE exam_date < CURRENT_DATE - INTERVAL '3 months';

-- Criar resultados de exames recentes baseados em agendamentos concluídos
INSERT INTO exam_results (
  patient_name, exam_type_id, doctor_id, unit_id, appointment_id,
  exam_date, result_status, exam_category
)
SELECT DISTINCT
  a.patient_name,
  a.exam_type_id,
  a.doctor_id,
  a.unit_id,
  a.id,
  a.scheduled_date::date,
  'Concluído',
  COALESCE(et.category, 'Exame Geral')
FROM appointments a
LEFT JOIN exam_types et ON a.exam_type_id = et.id
WHERE a.status = 'Concluído' 
  AND a.scheduled_date >= CURRENT_DATE - INTERVAL '2 months'
  AND NOT EXISTS (
    SELECT 1 FROM exam_results er 
    WHERE er.appointment_id = a.id
  )
LIMIT 30;
