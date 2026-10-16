import { labelsEstado } from './config.js';
export const $ = selector => document.querySelector(selector);
export const escapeHTML = input => String(input ?? '').replace(/[&<>"']/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[character]);
const formatOptions = {dateStyle:'medium', timeStyle:'short'};
export function formatDate(iso) {
  if (!iso) return '—';
  const dt = new Date(iso);
  return Number.isNaN(dt.getTime()) ? '—' : new Intl.DateTimeFormat('es-EC',formatOptions).format(dt);
}
export function dateForInput(iso) {
  if(!iso) return '';
  const d = new Date(iso);
  if(Number.isNaN(d.getTime())) return '';
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0,16);
}
export function displayValue(key, value) {
  if (key === 'fecha_salida' || key === 'fecha_llegada_prevista') return escapeHTML(formatDate(value));
  if (key === 'estado' || key === 'rol') {
    const label = labelsEstado[value] || String(value || '—');
    return `<span class="pill pill-${escapeHTML(value)}"><span class="pill-dot"></span>${escapeHTML(label)}</span>`;
  }
  if (key === 'activo') return `<span class="pill pill-${value ? 'activo' : 'inactivo'}"><span class="pill-dot"></span>${value ? 'Habilitado' : 'Deshabilitado'}</span>`;
  if (key === 'distancia_km') return escapeHTML(Number(value).toFixed(2));
  return escapeHTML(value ?? '—');
}
let toastTimer;
export function toast(message, isError = false) {
  const box = $('#toast');
  box.textContent = message;
  box.className = `toast ${isError ? 'toast-error' : 'toast-success'}`;
  box.hidden = false;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => { box.hidden = true; }, 4500);
}
