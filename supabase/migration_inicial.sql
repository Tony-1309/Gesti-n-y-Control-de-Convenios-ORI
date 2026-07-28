-- ============================================================
-- ORI CONVENIOS — Script de migración inicial
-- Universidad Mariana — Oficina de Relaciones Internacionales
-- Ejecutar en: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- Extensión para UUIDs automáticos
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLA: perfiles_usuario
-- Extiende auth.users con datos adicionales del perfil
-- ============================================================
CREATE TABLE IF NOT EXISTS public.perfiles_usuario (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_completo TEXT,
  rol TEXT NOT NULL DEFAULT 'viewer' CHECK (rol IN ('admin', 'viewer')),
  email_notificaciones TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: crear perfil automáticamente cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfiles_usuario (id, nombre_completo, email_notificaciones)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'nombre_completo', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TABLA: configuracion_app
-- Configuración global de la aplicación (una sola fila)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.configuracion_app (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  emails_notificacion TEXT[] DEFAULT ARRAY['ori@umariana.edu.co'],
  umbral_dias_1 INTEGER DEFAULT 15,
  umbral_dias_2 INTEGER DEFAULT 10,
  umbral_dias_3 INTEGER DEFAULT 5,
  umbral_dias_4 INTEGER DEFAULT 1,
  hora_cron_utc TEXT DEFAULT '13',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar fila inicial de configuración
INSERT INTO public.configuracion_app (id) VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;

-- ============================================================
-- TABLA: convenios_internacionales_vigentes
-- Fuente: Hoja "Convenios Int. vigentes" del Excel
-- ============================================================
CREATE TABLE IF NOT EXISTS public.convenios_internacionales_vigentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codificacion TEXT UNIQUE,
  convenio_digital TEXT,
  convenio_fisico TEXT,
  universidad TEXT,
  pais TEXT,
  ciudad_pais TEXT,
  tipo_convenio_intercambio TEXT,
  tipo_convenio TEXT,
  contacto_ori TEXT,
  correo_electronico TEXT,
  vigencia_desde_original DATE,
  vigencia_hasta_original DATE,
  estado_general TEXT,
  duracion TEXT,
  objetivo TEXT,
  persona_registra TEXT,
  vigencia_desde_actual DATE,
  vigencia_hasta_actual DATE,
  estado_preventivo TEXT,
  observaciones TEXT,
  link_documento TEXT,
  -- Control de notificaciones
  notificaciones_activas BOOLEAN DEFAULT TRUE,
  notificacion_15dias BOOLEAN DEFAULT TRUE,
  notificacion_10dias BOOLEAN DEFAULT TRUE,
  notificacion_5dias BOOLEAN DEFAULT TRUE,
  notificacion_1dia BOOLEAN DEFAULT TRUE,
  razon_desactivacion TEXT,
  -- Metadatos
  hoja_origen TEXT DEFAULT 'convenios_int_vigentes',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: convenios_nacionales
-- Fuente: Hoja "Convenios IES Nacionales" del Excel
-- ============================================================
CREATE TABLE IF NOT EXISTS public.convenios_nacionales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT UNIQUE,
  numero INTEGER,
  convenio_digital TEXT,
  convenio_fisico TEXT,
  universidad_entidad TEXT,
  ciudad TEXT,
  tipo_convenio_intercambio TEXT,
  contacto_ori TEXT,
  correo_electronico TEXT,
  vigencia_desde_original DATE,
  vigencia_hasta_original DATE,
  estado_general TEXT,
  duracion TEXT,
  objetivo TEXT,
  persona_registra TEXT,
  vigencia_desde_actual DATE,
  vigencia_hasta_actual DATE,
  estado_preventivo TEXT,
  observaciones TEXT,
  link_documento TEXT,
  -- Control de notificaciones
  notificaciones_activas BOOLEAN DEFAULT TRUE,
  notificacion_15dias BOOLEAN DEFAULT TRUE,
  notificacion_10dias BOOLEAN DEFAULT TRUE,
  notificacion_5dias BOOLEAN DEFAULT TRUE,
  notificacion_1dia BOOLEAN DEFAULT TRUE,
  razon_desactivacion TEXT,
  -- Metadatos
  hoja_origen TEXT DEFAULT 'convenios_nacionales',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: convenios_internacionales
-- Fuente: Hoja "Convenios IES Internacionales" del Excel
-- (Todos: vigentes, vencidos y terminados)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.convenios_internacionales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codificacion TEXT UNIQUE,
  convenio_digital TEXT,
  convenio_fisico TEXT,
  universidad TEXT,
  pais TEXT,
  ciudad_pais TEXT,
  tipo_convenio_intercambio TEXT,
  tipo_convenio TEXT,
  contacto_ori TEXT,
  correo_electronico TEXT,
  vigencia_desde_original DATE,
  vigencia_hasta_original DATE,
  estado_general TEXT,
  duracion TEXT,
  objetivo TEXT,
  persona_registra TEXT,
  vigencia_desde_actual DATE,
  vigencia_hasta_actual DATE,
  estado_preventivo TEXT,
  observaciones TEXT,
  link_documento TEXT,
  -- Control de notificaciones
  notificaciones_activas BOOLEAN DEFAULT TRUE,
  notificacion_15dias BOOLEAN DEFAULT TRUE,
  notificacion_10dias BOOLEAN DEFAULT TRUE,
  notificacion_5dias BOOLEAN DEFAULT TRUE,
  notificacion_1dia BOOLEAN DEFAULT TRUE,
  razon_desactivacion TEXT,
  -- Metadatos
  hoja_origen TEXT DEFAULT 'convenios_internacionales',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: convenios_tramite
-- Fuente: Hoja "Convenios en Trámite" del Excel
-- ============================================================
CREATE TABLE IF NOT EXISTS public.convenios_tramite (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item INTEGER,
  fecha_recepcion DATE,
  facultad_solicitante TEXT,
  programa_academico TEXT,
  persona_solicitante TEXT,
  tipo_convenio TEXT,
  institucion TEXT,
  pais_ciudad TEXT,
  contacto TEXT,
  estado_tramite TEXT,
  anio_gestion INTEGER,
  observaciones TEXT,
  accion_pendiente TEXT,
  -- Metadatos
  hoja_origen TEXT DEFAULT 'convenios_tramite',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: convenios_redes
-- Fuente: Hoja "REDES" del Excel
-- ============================================================
CREATE TABLE IF NOT EXISTS public.convenios_redes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codificacion TEXT UNIQUE,
  numero INTEGER,
  convenio_digital TEXT,
  convenio_fisico TEXT,
  red_nombre TEXT,
  pais TEXT,
  ciudad_pais TEXT,
  nombre_convenio TEXT,
  tipo_convenio TEXT,
  contacto TEXT,
  correo_electronico TEXT,
  vigencia_desde DATE,
  vigencia_hasta DATE,
  estado_general TEXT,
  duracion TEXT,
  objetivo TEXT,
  persona_registra TEXT,
  vigencia_desde_actual DATE,
  vigencia_hasta_actual DATE,
  estado_preventivo TEXT,
  -- Control de notificaciones
  notificaciones_activas BOOLEAN DEFAULT TRUE,
  notificacion_15dias BOOLEAN DEFAULT TRUE,
  notificacion_10dias BOOLEAN DEFAULT TRUE,
  notificacion_5dias BOOLEAN DEFAULT TRUE,
  notificacion_1dia BOOLEAN DEFAULT TRUE,
  razon_desactivacion TEXT,
  -- Metadatos
  hoja_origen TEXT DEFAULT 'redes',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: convenios_investigacion
-- Fuente: Hoja "Investigación" del Excel
-- ============================================================
CREATE TABLE IF NOT EXISTS public.convenios_investigacion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codificacion TEXT UNIQUE,
  numero INTEGER,
  convenio_digital TEXT,
  convenio_fisico TEXT,
  universidad_entidad TEXT,
  pais TEXT,
  ciudad_pais TEXT,
  nombre_convenio TEXT,
  tipo_convenio TEXT,
  contacto TEXT,
  correo_electronico TEXT,
  vigencia_desde_original DATE,
  vigencia_hasta_original DATE,
  estado_general TEXT,
  duracion TEXT,
  objetivo TEXT,
  persona_registra TEXT,
  vigencia_desde_actual DATE,
  vigencia_hasta_actual DATE,
  estado_preventivo TEXT,
  -- Control de notificaciones
  notificaciones_activas BOOLEAN DEFAULT TRUE,
  notificacion_15dias BOOLEAN DEFAULT TRUE,
  notificacion_10dias BOOLEAN DEFAULT TRUE,
  notificacion_5dias BOOLEAN DEFAULT TRUE,
  notificacion_1dia BOOLEAN DEFAULT TRUE,
  razon_desactivacion TEXT,
  -- Metadatos
  hoja_origen TEXT DEFAULT 'investigacion',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: notificaciones_log
-- Registro histórico de notificaciones enviadas
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notificaciones_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  convenio_id UUID NOT NULL,
  tabla_origen TEXT NOT NULL,
  tipo_notificacion TEXT NOT NULL CHECK (tipo_notificacion IN ('15_dias', '10_dias', '5_dias', '1_dia')),
  enviada_en TIMESTAMPTZ DEFAULT NOW(),
  destinatario_email TEXT,
  leida BOOLEAN DEFAULT FALSE
);

-- ============================================================
-- FUNCIÓN: actualizar updated_at automáticamente
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas que tienen updated_at
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'convenios_internacionales_vigentes',
    'convenios_nacionales',
    'convenios_internacionales',
    'convenios_tramite',
    'convenios_redes',
    'convenios_investigacion'
  ] LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS set_updated_at ON public.%I;
      CREATE TRIGGER set_updated_at
        BEFORE UPDATE ON public.%I
        FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
    ', t, t);
  END LOOP;
END;
$$;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Solo usuarios autenticados pueden acceder a los datos
-- ============================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.perfiles_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracion_app ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convenios_internacionales_vigentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convenios_nacionales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convenios_internacionales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convenios_tramite ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convenios_redes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convenios_investigacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones_log ENABLE ROW LEVEL SECURITY;

-- Políticas: Solo usuarios autenticados pueden leer y escribir
CREATE POLICY "Usuarios autenticados pueden leer convenios_int_vigentes"
  ON public.convenios_internacionales_vigentes FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Usuarios autenticados pueden modificar convenios_int_vigentes"
  ON public.convenios_internacionales_vigentes FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden leer convenios_nacionales"
  ON public.convenios_nacionales FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Usuarios autenticados pueden modificar convenios_nacionales"
  ON public.convenios_nacionales FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden leer convenios_internacionales"
  ON public.convenios_internacionales FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Usuarios autenticados pueden modificar convenios_internacionales"
  ON public.convenios_internacionales FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden leer convenios_tramite"
  ON public.convenios_tramite FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Usuarios autenticados pueden modificar convenios_tramite"
  ON public.convenios_tramite FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden leer convenios_redes"
  ON public.convenios_redes FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Usuarios autenticados pueden modificar convenios_redes"
  ON public.convenios_redes FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden leer convenios_investigacion"
  ON public.convenios_investigacion FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Usuarios autenticados pueden modificar convenios_investigacion"
  ON public.convenios_investigacion FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden leer notificaciones_log"
  ON public.notificaciones_log FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar notificaciones_log"
  ON public.notificaciones_log FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden ver su perfil"
  ON public.perfiles_usuario FOR SELECT
  TO authenticated USING (auth.uid() = id);

CREATE POLICY "Usuarios autenticados pueden actualizar su perfil"
  ON public.perfiles_usuario FOR UPDATE
  TO authenticated USING (auth.uid() = id);

CREATE POLICY "Admin puede ver todos los perfiles"
  ON public.perfiles_usuario FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.perfiles_usuario p
      WHERE p.id = auth.uid() AND p.rol = 'admin'
    )
  );

CREATE POLICY "Usuarios autenticados pueden ver configuracion"
  ON public.configuracion_app FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Solo admin puede modificar configuracion"
  ON public.configuracion_app FOR ALL
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.perfiles_usuario p
      WHERE p.id = auth.uid() AND p.rol = 'admin'
    )
  );

-- ============================================================
-- ÍNDICES para búsqueda rápida
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_conv_int_vig_vigencia ON public.convenios_internacionales_vigentes(vigencia_hasta_actual);
CREATE INDEX IF NOT EXISTS idx_conv_int_vig_estado ON public.convenios_internacionales_vigentes(estado_general);
CREATE INDEX IF NOT EXISTS idx_conv_int_vig_pais ON public.convenios_internacionales_vigentes(pais);

CREATE INDEX IF NOT EXISTS idx_conv_nac_vigencia ON public.convenios_nacionales(vigencia_hasta_actual);
CREATE INDEX IF NOT EXISTS idx_conv_nac_estado ON public.convenios_nacionales(estado_general);

CREATE INDEX IF NOT EXISTS idx_conv_int_vigencia ON public.convenios_internacionales(vigencia_hasta_actual);
CREATE INDEX IF NOT EXISTS idx_conv_int_estado ON public.convenios_internacionales(estado_general);
CREATE INDEX IF NOT EXISTS idx_conv_int_pais ON public.convenios_internacionales(pais);

CREATE INDEX IF NOT EXISTS idx_conv_redes_vigencia ON public.convenios_redes(vigencia_hasta_actual);
CREATE INDEX IF NOT EXISTS idx_conv_inv_vigencia ON public.convenios_investigacion(vigencia_hasta_actual);
CREATE INDEX IF NOT EXISTS idx_notif_log_convenio ON public.notificaciones_log(convenio_id);

-- ============================================================
-- VISTA: todos_los_convenios_proximos_a_vencer
-- Útil para el dashboard y el cron de notificaciones
-- ============================================================
CREATE OR REPLACE VIEW public.convenios_proximos_vencer AS
SELECT
  id,
  codificacion AS codigo,
  universidad AS institucion,
  pais,
  vigencia_hasta_actual AS fecha_vencimiento,
  (vigencia_hasta_actual - CURRENT_DATE) AS dias_restantes,
  estado_general,
  notificaciones_activas,
  notificacion_15dias,
  notificacion_10dias,
  notificacion_5dias,
  notificacion_1dia,
  'convenios_internacionales_vigentes' AS tabla_origen
FROM public.convenios_internacionales_vigentes
WHERE vigencia_hasta_actual IS NOT NULL
  AND notificaciones_activas = TRUE
  AND (vigencia_hasta_actual - CURRENT_DATE) BETWEEN 0 AND 20

UNION ALL

SELECT
  id,
  codigo AS codigo,
  universidad_entidad AS institucion,
  ciudad AS pais,
  vigencia_hasta_actual AS fecha_vencimiento,
  (vigencia_hasta_actual - CURRENT_DATE) AS dias_restantes,
  estado_general,
  notificaciones_activas,
  notificacion_15dias,
  notificacion_10dias,
  notificacion_5dias,
  notificacion_1dia,
  'convenios_nacionales' AS tabla_origen
FROM public.convenios_nacionales
WHERE vigencia_hasta_actual IS NOT NULL
  AND notificaciones_activas = TRUE
  AND (vigencia_hasta_actual - CURRENT_DATE) BETWEEN 0 AND 20

UNION ALL

SELECT
  id,
  codificacion AS codigo,
  universidad AS institucion,
  pais,
  vigencia_hasta_actual AS fecha_vencimiento,
  (vigencia_hasta_actual - CURRENT_DATE) AS dias_restantes,
  estado_general,
  notificaciones_activas,
  notificacion_15dias,
  notificacion_10dias,
  notificacion_5dias,
  notificacion_1dia,
  'convenios_internacionales' AS tabla_origen
FROM public.convenios_internacionales
WHERE vigencia_hasta_actual IS NOT NULL
  AND notificaciones_activas = TRUE
  AND (vigencia_hasta_actual - CURRENT_DATE) BETWEEN 0 AND 20

UNION ALL

SELECT
  id,
  codificacion AS codigo,
  red_nombre AS institucion,
  pais,
  vigencia_hasta_actual AS fecha_vencimiento,
  (vigencia_hasta_actual - CURRENT_DATE) AS dias_restantes,
  estado_general,
  notificaciones_activas,
  notificacion_15dias,
  notificacion_10dias,
  notificacion_5dias,
  notificacion_1dia,
  'convenios_redes' AS tabla_origen
FROM public.convenios_redes
WHERE vigencia_hasta_actual IS NOT NULL
  AND notificaciones_activas = TRUE
  AND (vigencia_hasta_actual - CURRENT_DATE) BETWEEN 0 AND 20

UNION ALL

SELECT
  id,
  codificacion AS codigo,
  universidad_entidad AS institucion,
  pais,
  vigencia_hasta_actual AS fecha_vencimiento,
  (vigencia_hasta_actual - CURRENT_DATE) AS dias_restantes,
  estado_general,
  notificaciones_activas,
  notificacion_15dias,
  notificacion_10dias,
  notificacion_5dias,
  notificacion_1dia,
  'convenios_investigacion' AS tabla_origen
FROM public.convenios_investigacion
WHERE vigencia_hasta_actual IS NOT NULL
  AND notificaciones_activas = TRUE
  AND (vigencia_hasta_actual - CURRENT_DATE) BETWEEN 0 AND 20;

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================
-- Tablas creadas:
--   1. perfiles_usuario
--   2. configuracion_app
--   3. convenios_internacionales_vigentes
--   4. convenios_nacionales
--   5. convenios_internacionales
--   6. convenios_tramite
--   7. convenios_redes
--   8. convenios_investigacion
--   9. notificaciones_log
-- Vista creada: convenios_proximos_vencer
-- ============================================================
