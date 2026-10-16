export function mensajeError(e: any): string {
  const b = e?.error;
  if (typeof b === "string") return b;
  if (b?.campos) {
    const partes: string[] = [];
    for (const [k, v] of Object.entries(b.campos)) {
      partes.push(`${k}: ${Array.isArray(v) ? v.join(", ") : v}`);
    }
    if (partes.length) return partes.join(" | ");
  }
  return b?.mensaje || e?.message || "Ocurrio un error inesperado";
}
