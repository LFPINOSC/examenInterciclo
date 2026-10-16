import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { interpretarError } from '../core/error.util';
import { Equipo, Servicio, Ticket, ESTADO_NOMBRE, codigoTicket, TIPO_NOMBRE } from '../core/models';

@Component({standalone:true,imports:[CommonModule,RouterLink],templateUrl:'./panel.component.html'})
export class PanelComponent implements OnInit {
 private api=inject(ApiService);readonly auth=inject(AuthService);
 readonly cargando=signal(true);readonly error=signal('');readonly tickets=signal<Ticket[]>([]);readonly equipos=signal<Equipo[]>([]);readonly servicios=signal<Servicio[]>([]);
 readonly abiertos=computed(()=>this.tickets().filter(t=>t.estado==='PENDIENTE'||t.estado==='ASIGNADO').length);
 readonly proceso=computed(()=>this.tickets().filter(t=>t.estado==='EN_PROCESO').length);
 readonly resueltos=computed(()=>this.tickets().filter(t=>t.estado==='RESUELTO'||t.estado==='CERRADO').length);
 readonly recientes=computed(()=>[...this.tickets()].sort((a,b)=>b.id-a.id).slice(0,5));
 readonly porcentaje=computed(()=>this.tickets().length?Math.round(this.resueltos()*100/this.tickets().length):0);
 readonly estadoNombre=ESTADO_NOMBRE;readonly codigo=codigoTicket;readonly tipoNombre=TIPO_NOMBRE;
 ngOnInit():void {this.cargar();}
 cargar():void {this.cargando.set(true);this.error.set('');
  forkJoin({tickets:this.api.listar<Ticket[]>('/tickets'),equipos:this.api.listar<Equipo[]>('/equipos'),servicios:this.api.listar<Servicio[]>('/servicios')}).subscribe({
   next:r=>{this.tickets.set(r.tickets);this.equipos.set(r.equipos);this.servicios.set(r.servicios);this.cargando.set(false);},
   error:e=>{this.error.set(interpretarError(e).mensaje);this.cargando.set(false);}
  });
 }
}
