export const ROL: Record<string, string> = {
  ADMIN: 'Administrador',
  MEDICO: 'Médico',
  RECEPCION: 'Recepción',
};

export const SEXO: Record<string, string> = {
  M: 'Masculino',
  F: 'Femenino',
  O: 'Otro',
};

export const TIPO_HABITACION: Record<string, string> = {
  GENERAL: 'General',
  UCI: 'UCI',
  PEDIATRIA: 'Pediatría',
  AISLAMIENTO: 'Aislamiento',
};

export const ESTADO_HABITACION: Record<string, string> = {
  DISPONIBLE: 'Disponible',
  OCUPADA: 'Ocupada',
  MANTENIMIENTO: 'Mantenimiento',
};

export const ESTADO_HOSPITALIZACION: Record<string, string> = {
  ACTIVA: 'Activa',
  ALTA: 'Alta',
};

export const MOTIVO_ALTA: Record<string, string> = {
  MEJORIA: 'Mejoría',
  TRASLADO: 'Traslado',
  ALTA_VOLUNTARIA: 'Alta voluntaria',
  FALLECIMIENTO: 'Fallecimiento',
};

export const TIPOS_SANGRE = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

export function fechaHoy(): string {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${hoy.getFullYear()}-${mes}-${dia}`;
}

export function formatoFecha(valor?: string | null): string {
  if (!valor) return '—';
  const [anio, mes, dia] = valor.slice(0, 10).split('-');
  if (!anio || !mes || !dia) return valor;
  return `${dia}/${mes}/${anio}`;
}

export function edad(fecha: string): number {
  const nacimiento = new Date(`${fecha}T00:00:00`);
  const hoy = new Date();
  let anios = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) anios -= 1;
  return anios;
}

export function mensajeError(error: unknown, respaldo: string): string {
  if (typeof error === 'object' && error && 'error' in error) {
    const cuerpo = (error as { error?: { message?: string } }).error;
    if (cuerpo?.message) return cuerpo.message;
  }
  return respaldo;
}

export function cedulaValida(cedula: string): boolean {
  if (!/^\d{10}$/.test(cedula)) return false;
  const provincia = Number(cedula.slice(0, 2));
  if (provincia < 1 || provincia > 24) return false;
  if (Number(cedula[2]) >= 6) return false;
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;
  for (let i = 0; i < 9; i += 1) {
    let parcial = Number(cedula[i]) * coeficientes[i];
    if (parcial >= 10) parcial -= 9;
    suma += parcial;
  }
  const digito = (10 - (suma % 10)) % 10;
  return digito === Number(cedula[9]);
}
