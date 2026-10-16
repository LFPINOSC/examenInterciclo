import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
@Injectable({ providedIn: "root" })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;
  get<T>(p: string) {
    return this.http.get<T>(this.base + p);
  }
  post<T>(p: string, data: unknown) {
    return this.http.post<T>(this.base + p, data);
  }
  put<T>(p: string, data: unknown) {
    return this.http.put<T>(this.base + p, data);
  }
  patch<T>(p: string, data: unknown = {}) {
    return this.http.patch<T>(this.base + p, data);
  }
  delete(p: string) {
    return this.http.delete<void>(this.base + p);
  }
}
export function mensaje(e: any): string {
  return [
    e.error?.error ||
      "No se pudo conectar con la API. Comprueba que el backend esté encendido.",
    ...(e.error?.detalles || []),
  ].join(" · ");
}
