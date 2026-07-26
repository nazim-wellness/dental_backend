-- Bulk demo data for dental seminars platform (PostgreSQL).
-- Idempotent for: specialties, formats, users (ON CONFLICT on unique keys).
-- Seminars and related rows append new IDs each run — prefer empty DB or run once.

BEGIN;

SELECT setval(pg_get_serial_sequence('specialties', 'id'), GREATEST(COALESCE((SELECT MAX(id) FROM specialties), 0), 1), (SELECT COALESCE(MAX(id), 0) FROM specialties) > 0);
SELECT setval(pg_get_serial_sequence('seminar_formats', 'id'), GREATEST(COALESCE((SELECT MAX(id) FROM seminar_formats), 0), 1), (SELECT COALESCE(MAX(id), 0) FROM seminar_formats) > 0);
SELECT setval(pg_get_serial_sequence('users', 'id'), GREATEST(COALESCE((SELECT MAX(id) FROM users), 0), 1), (SELECT COALESCE(MAX(id), 0) FROM users) > 0);
SELECT setval(pg_get_serial_sequence('lecturers', 'id'), GREATEST(COALESCE((SELECT MAX(id) FROM lecturers), 0), 1), (SELECT COALESCE(MAX(id), 0) FROM lecturers) > 0);
SELECT setval(pg_get_serial_sequence('seminars', 'id'), GREATEST(COALESCE((SELECT MAX(id) FROM seminars), 0), 1), (SELECT COALESCE(MAX(id), 0) FROM seminars) > 0);
SELECT setval(pg_get_serial_sequence('seminar_event_days', 'id'), GREATEST(COALESCE((SELECT MAX(id) FROM seminar_event_days), 0), 1), (SELECT COALESCE(MAX(id), 0) FROM seminar_event_days) > 0);
SELECT setval(pg_get_serial_sequence('seminar_photos', 'id'), GREATEST(COALESCE((SELECT MAX(id) FROM seminar_photos), 0), 1), (SELECT COALESCE(MAX(id), 0) FROM seminar_photos) > 0);
SELECT setval(pg_get_serial_sequence('seminar_cart', 'id'), GREATEST(COALESCE((SELECT MAX(id) FROM seminar_cart), 0), 1), (SELECT COALESCE(MAX(id), 0) FROM seminar_cart) > 0);
SELECT setval(pg_get_serial_sequence('seminar_bookings', 'id'), GREATEST(COALESCE((SELECT MAX(id) FROM seminar_bookings), 0), 1), (SELECT COALESCE(MAX(id), 0) FROM seminar_bookings) > 0);
SELECT setval(pg_get_serial_sequence('seminar_payments', 'id'), GREATEST(COALESCE((SELECT MAX(id) FROM seminar_payments), 0), 1), (SELECT COALESCE(MAX(id), 0) FROM seminar_payments) > 0);
SELECT setval(pg_get_serial_sequence('seminar_favorites', 'id'), GREATEST(COALESCE((SELECT MAX(id) FROM seminar_favorites), 0), 1), (SELECT COALESCE(MAX(id), 0) FROM seminar_favorites) > 0);
SELECT setval(pg_get_serial_sequence('seminar_views', 'id'), GREATEST(COALESCE((SELECT MAX(id) FROM seminar_views), 0), 1), (SELECT COALESCE(MAX(id), 0) FROM seminar_views) > 0);
SELECT setval(pg_get_serial_sequence('push_tokens', 'id'), GREATEST(COALESCE((SELECT MAX(id) FROM push_tokens), 0), 1), (SELECT COALESCE(MAX(id), 0) FROM push_tokens) > 0);
SELECT setval(pg_get_serial_sequence('otp_codes', 'id'), GREATEST(COALESCE((SELECT MAX(id) FROM otp_codes), 0), 1), (SELECT COALESCE(MAX(id), 0) FROM otp_codes) > 0);

INSERT INTO specialties (name, description, is_active, created_at, updated_at) VALUES
('Терапевтическая стоматология', 'Прямые и непрямые реставрации, работа с композитами', true, now(), now()),
('Хирургическая стоматология', 'Удаления, подготовка к имплантации, манипуляции под седацией', true, now(), now()),
('Ортодонтия', 'Брекеты, элайнеры, рост и развитие челюстей', true, now(), now()),
('Ортопедия', 'Коронки, мосты, съёмное и несъёмное протезирование', true, now(), now()),
('Детская стоматология', 'Профилактика и лечение молочных и постоянных зубов', true, now(), now()),
('Пародонтология', 'Диагностика и лечение заболеваний пародонта', true, now(), now()),
('Имплантология', 'Хирургический и ортопедический этапы, осложнения', true, now(), now()),
('Эндодонтия', 'Канальное лечение, ретритмент, работа под микроскопом', true, now(), now()),
('Анестезиология в стоматологии', 'Местная анестезия, седация, управление стрессом пациента', true, now(), now()),
('Цифровая стоматология', 'CAD/CAM, сканирование, цифровые протоколы', true, now(), now())
ON CONFLICT (name) DO NOTHING;

INSERT INTO seminar_formats (name, description, is_active, created_at, updated_at) VALUES
('Очный семинар', 'Живая практика и лекция в аудитории', true, now(), now()),
('Онлайн-трансляция', 'Прямой эфир с возможностью задать вопросы', true, now(), now()),
('Гибридный формат', 'Очно + онлайн для удалённых участников', true, now(), now()),
('Мастер-класс', 'Разбор клинических случаев и пошаговые протоколы', true, now(), now()),
('Интенсив', 'Цельное обучение за 2–3 дня', true, now(), now()),
('Вебинар', 'Лекционный формат до 3 часов', true, now(), now()),
('Клуб врачей', 'Закрытая дискуссия по сложным случаям', true, now(), now())
ON CONFLICT (name) DO NOTHING;

INSERT INTO users (
  phone, is_phone_verified, telegram_id, telegram_username, role,
  first_name, last_name, middle_name, company_name, referral_code, specialty_id,
  created_at, updated_at
) VALUES
('+79995000001', true, 'tg_org_001', 'org_smirnov', 'ORGANIZER', 'Алексей', 'Смирнов', 'Игоревич', 'ООО «Дентал Про»', 'ORGREF01', NULL, now(), now()),
('+79995000002', true, 'tg_org_002', 'org_volkov', 'ORGANIZER', 'Марина', 'Волкова', 'Сергеевна', 'ИП Волкова образование', 'ORGREF02', NULL, now(), now()),
('+79995000003', true, 'tg_org_003', 'org_nikitin', 'ORGANIZER', 'Дмитрий', 'Никитин', 'Павлович', 'Семинары 32', 'ORGREF03', NULL, now(), now()),
('+79995000004', true, 'tg_org_004', 'org_orlova', 'ORGANIZER', 'Елена', 'Орлова', 'Андреевна', 'ООО «Практикум Дент»', 'ORGREF04', NULL, now(), now()),
('+79995000005', true, 'tg_org_005', 'org_kuznetsov', 'ORGANIZER', 'Павел', 'Кузнецов', 'Олегович', 'Event Dental RU', 'ORGREF05', NULL, now(), now()),
('+79995000010', true, 'tg_adm_001', 'admin_root', 'ADMIN', 'Светлана', 'Админова', 'Викторовна', NULL, NULL, NULL, now(), now()),
('+79995005101', true, 'tg_doc_101', 'dr_klimov', 'DOCTOR', 'Игорь', 'Климов', 'Романович', NULL, 'DREF101', (SELECT id FROM specialties WHERE name = 'Терапевтическая стоматология' LIMIT 1), now(), now()),
('+79995005102', true, 'tg_doc_102', 'dr_moroz', 'DOCTOR', 'Ольга', 'Морозова', 'Денисовна', NULL, 'DREF102', (SELECT id FROM specialties WHERE name = 'Ортодонтия' LIMIT 1), now(), now()),
('+79995005103', true, 'tg_doc_103', 'dr_sokolov', 'DOCTOR', 'Никита', 'Соколов', NULL, NULL, 'DREF103', (SELECT id FROM specialties WHERE name = 'Имплантология' LIMIT 1), now(), now()),
('+79995005104', true, 'tg_doc_104', 'dr_lebedeva', 'DOCTOR', 'Анна', 'Лебедева', 'Максимовна', NULL, 'DREF104', (SELECT id FROM specialties WHERE name = 'Эндодонтия' LIMIT 1), now(), now()),
('+79995005105', true, 'tg_doc_105', 'dr_fadeev', 'DOCTOR', 'Константин', 'Фадеев', 'Ильич', NULL, 'DREF105', (SELECT id FROM specialties WHERE name = 'Хирургическая стоматология' LIMIT 1), now(), now()),
('+79995005106', true, 'tg_doc_106', 'dr_guseva', 'DOCTOR', 'Виктория', 'Гусева', 'Петровна', NULL, 'DREF106', (SELECT id FROM specialties WHERE name = 'Детская стоматология' LIMIT 1), now(), now()),
('+79995005107', true, 'tg_doc_107', 'dr_belov', 'DOCTOR', 'Артём', 'Белов', 'Станиславович', NULL, 'DREF107', (SELECT id FROM specialties WHERE name = 'Ортопедия' LIMIT 1), now(), now()),
('+79995005108', true, 'tg_doc_108', 'dr_kravtsov', 'DOCTOR', 'Михаил', 'Кравцов', NULL, NULL, 'DREF108', (SELECT id FROM specialties WHERE name = 'Пародонтология' LIMIT 1), now(), now()),
('+79995005109', true, 'tg_doc_109', 'dr_somova', 'DOCTOR', 'Дарья', 'Сомова', 'Алексеевна', NULL, 'DREF109', (SELECT id FROM specialties WHERE name = 'Цифровая стоматология' LIMIT 1), now(), now()),
('+79995005110', true, 'tg_doc_110', 'dr_tarasov', 'DOCTOR', 'Роман', 'Тарасов', 'Евгеньевич', NULL, 'DREF110', (SELECT id FROM specialties WHERE name = 'Анестезиология в стоматологии' LIMIT 1), now(), now()),
('+79995005201', true, NULL, NULL, 'DOCTOR', 'Без', 'Телеги', NULL, NULL, 'DREF201', (SELECT id FROM specialties WHERE name = 'Терапевтическая стоматология' LIMIT 1), now(), now()),
('+79995005202', true, NULL, NULL, 'DOCTOR', 'Ирина', 'Зайцева', NULL, NULL, 'DREF202', (SELECT id FROM specialties WHERE name = 'Ортодонтия' LIMIT 1), now(), now()),
('+79995005203', true, 'tg_doc_203', 'dr_203_only', 'DOCTOR', 'Сергей', 'Новиков', 'Павлович', NULL, 'DREF203', (SELECT id FROM specialties WHERE name = 'Имплантология' LIMIT 1), now(), now()),
('+79995005204', true, NULL, NULL, 'DOCTOR', 'Екатерина', 'Рябова', 'Игоревна', NULL, 'DREF204', (SELECT id FROM specialties WHERE name = 'Эндодонтия' LIMIT 1), now(), now()),
('+79995005205', true, 'tg_doc_205', 'endo_master', 'DOCTOR', 'Денис', 'Рыжов', NULL, NULL, 'DREF205', (SELECT id FROM specialties WHERE name = 'Эндодонтия' LIMIT 1), now(), now()),
('+79995005206', true, NULL, NULL, 'DOCTOR', 'Полина', 'Шестакова', NULL, NULL, 'DREF206', (SELECT id FROM specialties WHERE name = 'Хирургическая стоматология' LIMIT 1), now(), now()),
('+79995005207', true, 'tg_doc_207', 'perio_doc', 'DOCTOR', 'Георгий', 'Лапшин', 'Дмитриевич', NULL, 'DREF207', (SELECT id FROM specialties WHERE name = 'Пародонтология' LIMIT 1), now(), now()),
('+79995005208', true, NULL, NULL, 'DOCTOR', 'Алина', 'Майорова', 'Сергеевна', NULL, 'DREF208', (SELECT id FROM specialties WHERE name = 'Ортопедия' LIMIT 1), now(), now()),
('+79995005209', true, 'tg_doc_209', 'kids_dentist', 'DOCTOR', 'Людмила', 'Ермакова', NULL, NULL, 'DREF209', (SELECT id FROM specialties WHERE name = 'Детская стоматология' LIMIT 1), now(), now()),
('+79995005210', true, NULL, NULL, 'DOCTOR', 'Василий', 'Панов', 'Олегович', NULL, 'DREF210', (SELECT id FROM specialties WHERE name = 'Цифровая стоматология' LIMIT 1), now(), now()),
('+79995000011', true, 'tg_adm_002', 'support_admin', 'ADMIN', 'Олег', 'Тихонов', NULL, NULL, NULL, NULL, now(), now())
ON CONFLICT (phone) DO NOTHING;

INSERT INTO lecturers (
  first_name, last_name, middle_name, position, years_experience, achievements, photo_url, bio, is_active, user_id, created_at, updated_at
)
SELECT v.first_name, v.last_name, v.middle_name, v.position, v.years_experience, v.achievements::json, v.photo_url, v.bio, v.is_active, v.user_id, now(), now()
FROM (VALUES
  ('Проф.'::text, 'Архипова', 'Тамара Владимировна'::text, 'Заведующая кафедрой терапии', 22, '["Доктор медицинских наук", "Более 150 практических курсов"]'::text, NULL::text, 'Спикер федеральных конгрессов по реставрации.', true, NULL::int),
  ('Иван', 'Громов', 'Сергеевич', 'Ведущий хирург-имплантолог', 18, '["К.м.н.", "Сертификат ITI"]', NULL, 'Фокус на планировании и проведении одномоментных имплантаций.', true, NULL),
  ('Мария', 'Елькина', NULL, 'Ортодонт, член Российской ортодонтической ассоциации', 14, '["Магистр ортодонтии"]', NULL, 'Клинические и дисфункциональные случаи в ортодонтии.', true, NULL),
  ('Степан', 'Мышкин', 'Петрович', 'Протезист CAD/CAM', 11, '["Автор онлайн-курса по сканированию"]', NULL, 'Цифровые направляемые шаблоны и временные конструкции.', true, NULL),
  ('Евгения', 'Полякова', 'Ивановна', 'Детский стоматолог', 9, '["Лауреат гранта «Здоровые дети»"]', NULL, 'Минимально инвазивная детская стоматология.', true, NULL),
  ('Андрей', 'Савич', NULL, 'Пародонтолог', 16, '["Спикер Perio congress"]', NULL, 'Хирургические вмешательства при агрессивном пародонтите.', true, NULL),
  ('Валентина', 'Рудакова', 'Олеговна', 'Эндодонт', 13, '["Работа под микроскопом 10+ лет"]', NULL, 'Сложные каналы и ретритменты.', true, NULL),
  ('Иосиф', 'Король', 'Эдуардович', 'Анестезиолог в стоматологии', 20, '["Руководитель отделения седации"]', NULL, 'Безопасная седация и доказательная анестезия.', true, NULL),
  ('Наталья', 'Сенько', 'Павловна', 'Руководитель учебного центра', 25, '["Координатор международных стажировок"]', NULL, 'Организация очных модулей и практикумов.', true, NULL),
  ('Григорий', 'Чумак', 'Артурович', 'Терапевт, KOL бренда композитов', 12, '["300+ клинических кейсов в соцсетях"]', NULL, 'Эстетика переднего отдела.', true, NULL)
) AS v(first_name, last_name, middle_name, position, years_experience, achievements, photo_url, bio, is_active, user_id)
LEFT JOIN lecturers e ON e.first_name = v.first_name AND e.last_name = v.last_name AND e.position = v.position AND e.user_id IS NOT DISTINCT FROM v.user_id
WHERE e.id IS NULL;

INSERT INTO lecturers (
  first_name, last_name, middle_name, position, years_experience, achievements, photo_url, bio, is_active, user_id, created_at, updated_at
)
SELECT s.first_name, s.last_name, s.middle_name, s.position, s.years_experience, s.achievements::json, s.photo_url, s.bio, s.is_active, s.user_id, now(), now()
FROM (
  SELECT 'Игорь'::text AS first_name, 'Климов'::text AS last_name, 'Романович'::text AS middle_name, 'Терапевт, практикующий спикер'::text AS position, 10 AS years_experience, '["Автор методички по матированию"]'::text AS achievements, NULL::text AS photo_url, 'Совмещает частную практику и преподавание.'::text AS bio, true AS is_active, u.id AS user_id FROM users u WHERE u.phone = '+79995005101'
  UNION ALL
  SELECT 'Ольга', 'Морозова', 'Денисовна', 'Ортодонт', 11, '["Инструктор по элайнерам"]', NULL, 'Планирование сложных перемещений.', true, u.id FROM users u WHERE u.phone = '+79995005102'
  UNION ALL
  SELECT 'Никита', 'Соколов', NULL, 'Хирург-имплантолог', 8, '["Стажировка в Германии"]', NULL, 'Аугментация кости и мягких тканей.', true, u.id FROM users u WHERE u.phone = '+79995005103'
  UNION ALL
  SELECT 'Анна', 'Лебедева', 'Максимовна', 'Эндодонт', 15, '["Спикер по ретритменту"]', NULL, 'Управление осложнениями канального лечения.', true, u.id FROM users u WHERE u.phone = '+79995005104'
  UNION ALL
  SELECT 'Константин', 'Фадеев', 'Ильич', 'Хирург', 17, '["2000+ удалений сложности III"]', NULL, 'Работа со страхом пациента и седацией.', true, u.id FROM users u WHERE u.phone = '+79995005105'
) AS s
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO seminars (
  title, description, topic, city, price, event_date, event_time,
  contact_phone, secondary_phone, contact_email, contact_telegram,
  is_active, organizer_id, lecturer_id, format_id, specialty_id,
  created_at, updated_at
)
SELECT v.title, v.description, v.topic, v.city, v.price::numeric(10, 2), v.event_date::timestamp, v.event_time,
  v.contact_phone, v.secondary_phone, v.contact_email, v.contact_telegram,
  true,
  (SELECT u.id FROM users u WHERE u.phone = v.org_phone LIMIT 1),
  (SELECT l.id FROM lecturers l ORDER BY l.id LIMIT 1 OFFSET v.lecturer_offset),
  (SELECT f.id FROM seminar_formats f WHERE f.name = v.format_name LIMIT 1),
  (SELECT s.id FROM specialties s WHERE s.name = v.specialty_name LIMIT 1),
  now(), now()
FROM (VALUES
  ('Слои и полимеризация: предсказуемая эстетика', 'Практикум по многослойным реставрациям в зоне улыбки.', 'Терапия', 'Москва', 12500.00, '2026-05-12', '10:00', '+74951234567', NULL, 'edu@dental-pro.example', '@dental_edu', '+79995000001', 0, 'Очный семинар', 'Терапевтическая стоматология'),
  ('Имплантация в заднем отделе: от планирования до нагрузки', 'Практические алгоритмы с опорой на CBCT и шаблоны.', 'Имплантология', 'Санкт-Петербург', 18900.00, '2026-05-20', '11:00', '+78127001122', '+78127001123', 'courses@implant-spb.example', NULL, '+79995000002', 1, 'Интенсив', 'Имплантология'),
  ('Ортодонтия и дисфункции ВНЧС: безопасные шаги', 'Клинические критерии совмещения ортодонтии и терапии.', 'Ортодонтия', 'Казань', 9900.00, '2026-06-02', '09:30', NULL, '+78432009988', 'kazan.ortho@mail.example', '@kazan_ortho', '+79995000003', 2, 'Гибридный формат', 'Ортодонтия'),
  ('Эндо под микроскопом: ретритменты без паники', 'Пошаговый протокол при инструментальных осложнениях.', 'Эндодонтия', 'Екатеринбург', 14500.00, '2026-06-18', '10:30', '+73432001100', NULL, 'endo.ekb@example.com', NULL, '+79995000004', 6, 'Мастер-класс', 'Эндодонтия'),
  ('Седация в стоматологии: доказательные протоколы', 'От скрининга до вывода из седации и документации.', 'Анестезиология', 'Новосибирск', 11000.00, '2026-07-05', '12:00', '+73832220011', NULL, NULL, '@sedacourse', '+79995000005', 7, 'Вебинар', 'Анестезиология в стоматологии'),
  ('Цифровой оттиск: от скана до полноциркулярки', 'CAD/CAM цепочка для ортопедии и совместных случаев.', 'Цифровизация', 'Краснодар', 13900.00, '2026-07-22', '10:00', '+78612003344', '+78612003345', 'cadcam@krd.example', NULL, '+79995000001', 3, 'Очный семинар', 'Цифровая стоматология'),
  ('Пародонтит: хирургия и поддержка результата', 'Регенеративные подходы и длинная диспансеризация.', 'Пародонтология', 'Ростов-на-Дону', 10200.00, '2026-08-01', '09:00', '+78632005566', NULL, 'perio@rnd.example', NULL, '+79995000002', 5, 'Онлайн-трансляция', 'Пародонтология'),
  ('Детское приёмное отделение без слёз', 'Поведение, анестезия, работа с родителями.', 'Педиатрия', 'Нижний Новгород', 7900.00, '2026-08-14', '10:00', '+78312007788', NULL, 'kids@nn.example', '@kids_dent_nn', '+79995000003', 4, 'Вебинар', 'Детская стоматология'),
  ('Адгезивные мосты и вкладки: клиника и лаборатория', 'Координация с техником и контроль прикуса.', 'Ортопедия', 'Самара', 11800.00, '2026-09-03', '11:30', '+78462009900', NULL, 'ortho.samara@example.com', NULL, '+79995000004', 3, 'Мастер-класс', 'Ортопедия'),
  ('Сложные удаления: флапы и мягкие ткани', 'Планирование доступа и ушивания без «сюрпризов».', 'Хирургия', 'Воронеж', 13400.00, '2026-09-19', '10:00', '+74732001122', '+74732001123', 'surg@voronezh.example', NULL, '+79995000005', 1, 'Интенсив', 'Хирургическая стоматология'),
  ('Клуб врачей: разбор 4 редких ортодонтических кейсов', 'Закрытая сессия с модератором и разбор протоколов.', 'Ортодонтия', 'Москва', 4200.00, '2026-10-02', '19:00', '+74959876543', NULL, 'club@dent.events', '@dent_club_msk', '+79995000001', 2, 'Клуб врачей', 'Ортодонтия'),
  ('Импланты одномоментно: когда можно и когда нельзя', 'Критерии отбора пациентов и хирургические детали.', 'Имплантология', 'Сочи', 15200.00, '2026-10-11', '09:30', '+78622004455', NULL, 'implants@sochi.example', NULL, '+79995000002', 1, 'Гибридный формат', 'Имплантология'),
  ('Микропротоколы в терапии: экономия времени без потери качества', 'Чеклисты и приоритизация этапов при 45–60 минутах приёма.', 'Терапия', 'Уфа', 8600.00, '2026-10-28', '10:00', '+73472006677', NULL, 'therapy@ufa.example', NULL, '+79995000003', 9, 'Вебинар', 'Терапевтическая стоматология'),
  ('Навигация и статическая хирургия: от скана до ключа', 'Практика построения хирургических шаблонов.', 'Имплантология', 'Тюмень', 16800.00, '2026-11-05', '10:00', '+73452008899', NULL, 'nav.tyumen@example.com', NULL, '+79995000004', 1, 'Очный семинар', 'Цифровая стоматология'),
  ('Периимплантит: диагностика и тактика', 'Нехирургические и хирургические варианты, прогноз.', 'Пародонтология', 'Калининград', 9700.00, '2026-11-18', '11:00', '+74012003344', NULL, 'perio@kgd.example', NULL, '+79995000005', 5, 'Вебинар', 'Пародонтология'),
  ('Элайнеры: планирование этапов и overcorrection', 'Клинические нюансы Attachments и IPR.', 'Ортодонтия', 'Пермь', 9100.00, '2026-12-01', '10:30', '+73422005566', NULL, 'align@perm.example', NULL, '+79995000001', 2, 'Онлайн-трансляция', 'Ортодонтия'),
  ('Большие дефекты: направляемая костная регенерация', 'Выбор мембран и фиксации, типичные ошибки.', 'Хирургия', 'Красноярск', 14100.00, '2026-12-12', '09:30', '+73912007788', NULL, 'gbkr@krasnoyarsk.example', NULL, '+79995000002', 1, 'Мастер-класс', 'Хирургическая стоматология'),
  ('Прямые виниры: контроль контактов и полировка', 'Рабочие приёмы для предсказуемого глянца.', 'Терапия', 'Иркутск', 11300.00, '2027-01-15', '10:00', '+73952009900', NULL, 'veneers@irk.example', NULL, '+79995000003', 9, 'Очный семинар', 'Терапевтическая стоматология'),
  ('Протоколы дезинфекции и стерилизации в кабинете', 'Актуальные требования и практический аудит.', 'Организация', 'Томск', 5400.00, '2027-01-28', '14:00', '+73822001122', NULL, 'sterile@tomsk.example', NULL, '+79995000004', 8, 'Вебинар', 'Терапевтическая стоматология'),
  ('Фиксированные и съёмные протезы на имплантах', 'Выбор соединений и обслуживание.', 'Ортопедия', 'Владивосток', 12800.00, '2027-02-08', '10:00', '+74232003344', NULL, 'prost@vlad.example', NULL, '+79995000005', 3, 'Интенсив', 'Ортопедия'),
  ('Генерация мокрый-драй: управление влажностью поля', 'Техники изоляции и увлажнения для адгезивов.', 'Терапия', 'Челябинск', 9900.00, '2027-02-22', '09:00', '+73512005566', NULL, 'adhesive@chel.example', NULL, '+79995000001', 0, 'Мастер-класс', 'Терапевтическая стоматология'),
  ('Управление осложнениями канального лечения', 'Перфорации, инструментальные поломки, обучение пациентов.', 'Эндодонтия', 'Омск', 10400.00, '2027-03-05', '10:30', '+73812007788', NULL, 'endo@omsk.example', NULL, '+79995000002', 6, 'Гибридный формат', 'Эндодонтия'),
  ('Мягкотканный профиль в имплантологии', 'Пластика и объём для долговечного результата.', 'Имплантология', 'Барнаул', 13700.00, '2027-03-19', '10:00', '+73852009900', NULL, 'soft@barnaul.example', NULL, '+79995000003', 1, 'Очный семинар', 'Имплантология'),
  ('Модерация стресса пациента перед лечением', 'Коммуникация и фармакологическая помощь.', 'Анестезиология', 'Саратов', 7200.00, '2027-04-02', '12:00', '+78452001122', NULL, 'calm@saratov.example', NULL, '+79995000004', 7, 'Вебинар', 'Анестезиология в стоматологии'),
  ('Эстетика имплантата: шейка, десна, формирователь', 'Совместная работа хирурга и ортопеда.', 'Имплантология', 'Тула', 11900.00, '2027-04-18', '10:00', '+74872003344', NULL, 'pink@tula.example', NULL, '+79995000005', 1, 'Мастер-класс', 'Имплантология'),
  ('Смешанное прикусное толкование у подростков', 'Диагностика роста и окна лечения.', 'Ортодонтия', 'Ярославль', 8800.00, '2027-05-07', '09:30', '+74852005566', NULL, 'teen@yar.example', NULL, '+79995000001', 2, 'Вебинар', 'Ортодонтия'),
  ('Лечение кариеса у детей до 6 лет: минимально инвазивно', 'SIL, стеклоиономеры, мотивация родителей.', 'Педиатрия', 'Рязань', 6900.00, '2027-05-21', '10:00', '+74912007788', NULL, 'mi@ryazan.example', NULL, '+79995000002', 4, 'Онлайн-трансляция', 'Детская стоматология'),
  ('Комбинированные дефекты челюсти: мультидисциплинарный план', 'Хирургия + ортодонтия + ортопедия.', 'План лечения', 'Пенза', 15500.00, '2027-06-04', '10:00', '+78412009900', NULL, 'team@penza.example', NULL, '+79995000003', 0, 'Интенсив', 'Ортопедия'),
  ('Ортопедия на естественных зубах: вкладки и цирконий', 'Списание препарирования и доставка в клинике.', 'Ортопедия', 'Тверь', 12100.00, '2027-06-18', '11:00', '+74822001122', NULL, 'zir@tver.example', NULL, '+79995000004', 3, 'Очный семинар', 'Ортопедия'),
  ('Регулярная профилактика пародонтита: протоколы 6/12 месяцев', 'Контроль индексов и назначения.', 'Пародонтология', 'Липецк', 6400.00, '2027-07-01', '15:00', '+74742003344', NULL, 'maint@lipetsk.example', NULL, '+79995000005', 5, 'Вебинар', 'Пародонтология')
) AS v(title, description, topic, city, price, event_date, event_time, contact_phone, secondary_phone, contact_email, contact_telegram, org_phone, lecturer_offset, format_name, specialty_name);

INSERT INTO seminars (
  title, description, topic, city, price, event_date, event_time,
  contact_phone, organizer_id, lecturer_id, format_id, specialty_id,
  created_at, updated_at
)
SELECT
  '[Авто] Интенсив по теме «' || arr.topic || '» — выпуск ' || gs.n,
  'Сгенерированное описание для демонстрации списков и фильтров. Номер потока: ' || gs.n || '.',
  arr.topic,
  arr.city,
  (7500 + (gs.n * 419 + length(arr.topic)) % 22000)::numeric(10, 2),
  (timestamp '2026-04-01' + (gs.n * 11 + char_length(arr.city)) * interval '1 day'),
  to_char(time '08:00' + (gs.n % 5) * interval '1 hour', 'HH24:MI'),
  '+7495000' || lpad((9000 + gs.n)::text, 4, '0'),
  (SELECT u.id FROM users u WHERE u.role = 'ORGANIZER'::"UserRole" ORDER BY u.id LIMIT 1 OFFSET ((gs.n + length(arr.topic)) % 5)),
  (SELECT l2.id FROM lecturers l2 ORDER BY l2.id LIMIT 1 OFFSET ((gs.n + char_length(arr.city)) % GREATEST((SELECT count(*)::int FROM lecturers), 1))),
  (SELECT f.id FROM seminar_formats f ORDER BY f.id LIMIT 1 OFFSET (gs.n % GREATEST((SELECT count(*)::int FROM seminar_formats), 1))),
  (SELECT s2.id FROM specialties s2 ORDER BY s2.id LIMIT 1 OFFSET ((gs.n * 3) % GREATEST((SELECT count(*)::int FROM specialties), 1))),
  now(), now()
FROM generate_series(1, 45) AS gs(n)
CROSS JOIN LATERAL (
  SELECT
    (ARRAY[
      'Эндодонтия под лупой',
      'Имплантация с немедленной нагрузкой',
      'Ортодонтия для взрослых',
      'Тотальное протезирование All-on-4',
      'Минимально инвазивная хирургия',
      'Работа со сложным стоматологическим страхом',
      'Профилактика в ортодонтии',
      'Борьба с биоплёнкой в пародонтите',
      'Реставрации премоляров',
      'Планирование эстетического макета',
      'Лазерные технологии в терапии',
      'Организация учебного центра',
      'Юридические аспекты рекламы клиники',
      'Кросс-поляризация в фотопротоколе',
      'Сканирование окклюзии'
    ])[((gs.n - 1) % 15) + 1] AS topic,
    (ARRAY[
      'Москва', 'Санкт-Петербург', 'Казань', 'Екатеринбург', 'Краснодар',
      'Новосибирск', 'Уфа', 'Самара', 'Ростов-на-Дону', 'Воронеж',
      'Пермь', 'Волгоград', 'Сочи', 'Тюмень', 'Иркутск'
    ])[((gs.n + 2) % 15) + 1] AS city
) AS arr;

INSERT INTO seminar_event_days (seminar_id, date, start_time, end_time, created_at, updated_at)
SELECT s.id,
  (s.event_date::date + (d.day_off * interval '1 day'))::timestamp,
  CASE WHEN d.day_off = 0 THEN s.event_time ELSE '09:30' END,
  CASE WHEN d.day_off = 0 THEN '18:00' ELSE '17:30' END,
  now(), now()
FROM seminars s
CROSS JOIN LATERAL (VALUES (0), (1)) AS d(day_off)
WHERE d.day_off = 0 OR (s.id % 2 = 0 AND d.day_off = 1);

INSERT INTO seminar_photos (seminar_id, url, "order", created_at, updated_at)
SELECT s.id,
  'https://picsum.photos/seed/seminar-' || s.id || '-' || o.ord || '/800/450',
  o.ord,
  now(), now()
FROM seminars s
CROSS JOIN LATERAL (VALUES (0), (1), (2)) AS o(ord)
WHERE (s.id + o.ord) % 2 = 0;

INSERT INTO seminar_cart (seminar_id, user_id, created_at, updated_at)
SELECT s.id, u.id, now(), now()
FROM seminars s
JOIN users u ON u.role = 'DOCTOR'::"UserRole"
WHERE (s.id + u.id) % 7 = 2 AND s.id % 5 = (u.id % 5)
ON CONFLICT (seminar_id, user_id) DO NOTHING;

INSERT INTO seminar_favorites (seminar_id, user_id, created_at, updated_at)
SELECT s.id, u.id, now(), now()
FROM seminars s
JOIN users u ON u.role = 'DOCTOR'::"UserRole"
WHERE (s.id * 3 + u.id) % 11 = 0
ON CONFLICT (seminar_id, user_id) DO NOTHING;

INSERT INTO seminar_views (seminar_id, user_id, created_at)
SELECT s.id, u.id, now() - ((s.id + u.id) % 72) * interval '1 hour'
FROM seminars s
JOIN users u ON u.role = 'DOCTOR'::"UserRole"
WHERE (s.id + u.id * 2) % 6 = 1
ON CONFLICT (seminar_id, user_id) DO NOTHING;

INSERT INTO seminar_payments (
  seminar_id, user_id, provider, provider_payment_id, status, amount, currency,
  confirmation_url, description, metadata, paid_at, cancelled_at, created_at, updated_at
)
SELECT s.id, u.id, 'YOOKASSA'::"PaymentProvider",
  'yk_seed_' || s.id || '_' || u.id,
  CASE WHEN (s.id + u.id) % 5 = 0 THEN 'PENDING'::"PaymentStatus"
       WHEN (s.id + u.id) % 5 = 1 THEN 'WAITING_FOR_CAPTURE'::"PaymentStatus"
       WHEN (s.id + u.id) % 5 = 2 THEN 'CANCELED'::"PaymentStatus"
       ELSE 'SUCCEEDED'::"PaymentStatus" END,
  least(s.price, 25000::numeric), 'RUB',
  'https://checkout.yookassa.ru/mock/' || s.id || '/' || u.id,
  'Оплата участия: ' || left(s.title, 80),
  json_build_object('seminarId', s.id, 'userPhone', u.phone),
  CASE WHEN (s.id + u.id) % 5 >= 3 THEN now() - interval '2 days' ELSE NULL END,
  CASE WHEN (s.id + u.id) % 5 = 2 THEN now() - interval '1 day' ELSE NULL END,
  now(), now()
FROM seminars s
JOIN users u ON u.role = 'DOCTOR'::"UserRole"
WHERE (s.id + u.id) % 9 = 3 AND u.referral_code LIKE 'DREF%'
ON CONFLICT (provider_payment_id) DO NOTHING;

INSERT INTO seminar_bookings (seminar_id, user_id, payment_id, status, created_at, updated_at)
SELECT s.id, u.id, p.id,
  CASE WHEN p.status = 'SUCCEEDED'::"PaymentStatus" THEN 'confirmed' WHEN p.status = 'PENDING'::"PaymentStatus" THEN 'pending' ELSE 'cancelled' END,
  now(), now()
FROM seminar_payments p
JOIN seminars s ON s.id = p.seminar_id
JOIN users u ON u.id = p.user_id
WHERE p.provider_payment_id LIKE 'yk_seed_%'
ON CONFLICT (seminar_id, user_id) DO NOTHING;

INSERT INTO push_tokens (user_id, device_id, token, created_at, updated_at)
SELECT u.id, 'device_seed_' || u.id || '_a', 'fcm_mock_token_' || u.id || '_alpha', now(), now()
FROM users u WHERE u.role IN ('DOCTOR'::"UserRole", 'ORGANIZER'::"UserRole") AND u.id % 4 = 0
ON CONFLICT (user_id, device_id) DO NOTHING;

INSERT INTO push_tokens (user_id, device_id, token, created_at, updated_at)
SELECT u.id, 'device_seed_' || u.id || '_b', 'fcm_mock_token_' || u.id || '_beta', now(), now()
FROM users u WHERE u.role = 'DOCTOR'::"UserRole" AND u.id % 6 = 1
ON CONFLICT (user_id, device_id) DO NOTHING;

INSERT INTO otp_codes (phone, code_hash, purpose, expires_at, used_at, attempts, created_at)
VALUES
('+79995009901', '$2b$10$hashedmockregister01', 'REGISTER'::"OtpPurpose", now() + interval '1 day', NULL, 0, now()),
('+79995009902', '$2b$10$hashedmockregister02', 'REGISTER'::"OtpPurpose", now() + interval '1 day', now() - interval '10 minutes', 1, now()),
('+79995009903', '$2b$10$hashedmocklogin03', 'LOGIN'::"OtpPurpose", now() - interval '1 hour', NULL, 2, now()),
('+79995009904', '$2b$10$hashedmocklogin04', 'LOGIN'::"OtpPurpose", now() + interval '20 minutes', NULL, 0, now());

COMMIT;
