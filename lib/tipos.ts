export type RolUsuario = 'admin' | 'viewer';

export interface PerfilUsuario {
  id: string;
  nombre_completo: string | null;
  rol: RolUsuario;
  email_notificaciones: string | null;
  activo: boolean;
  created_at: string;
}

export interface ConvenioIntVigente {
  id: string;
  codificacion: string | null;
  convenio_digital: string | null;
  convenio_fisico: string | null;
  universidad: string | null;
  pais: string | null;
  ciudad_pais: string | null;
  tipo_convenio_intercambio: string | null;
  tipo_convenio: string | null;
  contacto_ori: string | null;
  correo_electronico: string | null;
  vigencia_desde_original: string | null;
  vigencia_hasta_original: string | null;
  estado_general: string | null;
  duracion: string | null;
  objetivo: string | null;
  persona_registra: string | null;
  vigencia_desde_actual: string | null;
  vigencia_hasta_actual: string | null;
  estado_preventivo: string | null;
  observaciones: string | null;
  link_documento: string | null;
  notificaciones_activas: boolean;
  notificacion_15dias: boolean;
  notificacion_10dias: boolean;
  notificacion_5dias: boolean;
  notificacion_1dia: boolean;
  razon_desactivacion: string | null;
  hoja_origen: string;
  created_at: string;
  updated_at: string;
}

export interface ConvenioNacional {
  id: string;
  codigo: string | null;
  numero: number | null;
  convenio_digital: string | null;
  convenio_fisico: string | null;
  universidad_entidad: string | null;
  ciudad: string | null;
  tipo_convenio_intercambio: string | null;
  contacto_ori: string | null;
  correo_electronico: string | null;
  vigencia_desde_original: string | null;
  vigencia_hasta_original: string | null;
  estado_general: string | null;
  duracion: string | null;
  objetivo: string | null;
  persona_registra: string | null;
  vigencia_desde_actual: string | null;
  vigencia_hasta_actual: string | null;
  estado_preventivo: string | null;
  observaciones: string | null;
  link_documento: string | null;
  notificaciones_activas: boolean;
  notificacion_15dias: boolean;
  notificacion_10dias: boolean;
  notificacion_5dias: boolean;
  notificacion_1dia: boolean;
  razon_desactivacion: string | null;
  hoja_origen: string;
  created_at: string;
  updated_at: string;
}

export interface ConvenioTramite {
  id: string;
  item: number | null;
  fecha_recepcion: string | null;
  facultad_solicitante: string | null;
  programa_academico: string | null;
  persona_solicitante: string | null;
  tipo_convenio: string | null;
  institucion: string | null;
  pais_ciudad: string | null;
  contacto: string | null;
  estado_tramite: string | null;
  anio_gestion: number | null;
  observaciones: string | null;
  accion_pendiente: string | null;
  hoja_origen: string;
  created_at: string;
  updated_at: string;
}

export interface ConvenioRed {
  id: string;
  codificacion: string | null;
  numero: number | null;
  convenio_digital: string | null;
  convenio_fisico: string | null;
  red_nombre: string | null;
  pais: string | null;
  ciudad_pais: string | null;
  nombre_convenio: string | null;
  tipo_convenio: string | null;
  contacto: string | null;
  correo_electronico: string | null;
  vigencia_desde: string | null;
  vigencia_hasta: string | null;
  estado_general: string | null;
  duracion: string | null;
  objetivo: string | null;
  persona_registra: string | null;
  vigencia_desde_actual: string | null;
  vigencia_hasta_actual: string | null;
  estado_preventivo: string | null;
  notificaciones_activas: boolean;
  notificacion_15dias: boolean;
  notificacion_10dias: boolean;
  notificacion_5dias: boolean;
  notificacion_1dia: boolean;
  razon_desactivacion: string | null;
  hoja_origen: string;
  created_at: string;
  updated_at: string;
}

export interface ConvenioInvestigacion {
  id: string;
  codificacion: string | null;
  numero: number | null;
  convenio_digital: string | null;
  convenio_fisico: string | null;
  universidad_entidad: string | null;
  pais: string | null;
  ciudad_pais: string | null;
  nombre_convenio: string | null;
  tipo_convenio: string | null;
  contacto: string | null;
  correo_electronico: string | null;
  vigencia_desde_original: string | null;
  vigencia_hasta_original: string | null;
  estado_general: string | null;
  duracion: string | null;
  objetivo: string | null;
  persona_registra: string | null;
  vigencia_desde_actual: string | null;
  vigencia_hasta_actual: string | null;
  estado_preventivo: string | null;
  notificaciones_activas: boolean;
  notificacion_15dias: boolean;
  notificacion_10dias: boolean;
  notificacion_5dias: boolean;
  notificacion_1dia: boolean;
  razon_desactivacion: string | null;
  hoja_origen: string;
  created_at: string;
  updated_at: string;
}

export interface ConvenioProximoVencer {
  id: string;
  codigo: string | null;
  institucion: string | null;
  pais: string | null;
  fecha_vencimiento: string;
  dias_restantes: number;
  estado_general: string | null;
  notificaciones_activas: boolean;
  notificacion_15dias: boolean;
  notificacion_10dias: boolean;
  notificacion_5dias: boolean;
  notificacion_1dia: boolean;
  tabla_origen: string;
}

export type TablaNombre =
  | 'convenios_internacionales_vigentes'
  | 'convenios_nacionales'
  | 'convenios_internacionales'
  | 'convenios_tramite'
  | 'convenios_redes'
  | 'convenios_investigacion';
