import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  private getHeaders() {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, credentials);
  }

  getPacientes(): Observable<any> {
    return this.http.get(`${this.baseUrl}/pacientes`, { headers: this.getHeaders() });
  }

  crearPaciente(paciente: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/pacientes`, paciente, { headers: this.getHeaders() });
  }

  getExamanes(): Observable<any> {
    return this.http.get(`${this.baseUrl}/examenes`, { headers: this.getHeaders() });
  }

  crearExamen(examen: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/examenes`, examen, { headers: this.getHeaders() });
  }

  getMedicos(): Observable<any> {
    return this.http.get(`${this.baseUrl}/medicos`, { headers: this.getHeaders() });
  }

  getOrdenes(): Observable<any> {
    return this.http.get(`${this.baseUrl}/ordenes`, { headers: this.getHeaders() });
  }

  crearOrden(orden: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/ordenes`, orden, { headers: this.getHeaders() });
  }
}