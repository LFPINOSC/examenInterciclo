import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { NotificacionesService } from '../core/notificaciones.service';
import { interpretarError } from '../core/error.util';
import { ESTADO_NOMBRE, EstadoTicket, Servicio, Tecnico, Ticket, codigoTicket } from '../core/models';
interface Linea {servicioId:number|null;observacion:string}
@Component({standalone:true,imports:[CurrencyPipe,DatePipe,FormsModule,RouterLink],templateUrl:'./ticket-detalle.component.html'})
export class TicketDetalleComponent implements OnInit {
 readonly auth=inject(AuthService);private route=inject(ActivatedRoute);private api=inject(ApiService);private avisos=inject(NotificacionesService);
 readonly ticket=signal<Ticket|null>(null);readonly tecnicos=signal<Tecnico[]>([]);readonly catalogo=signal<Servicio[]>([]);readonly cargando=signal(true);readonly guardando=signal(false);readonly error=signal('');
 readonly tecnicoId=signal<number|null>(null);readonly lineas=signal<Linea[]>([]);readonly diagnostico=signal('');readonly solucion=signal('');
 readonly puedeEditarServicios=computed(()=>this.auth.esAdmin()&&(['ASIGNADO','EN_PROCESO'] as EstadoTicket[]).includes(this.ticket()?.estado as EstadoTicket));
 readonly nombreEstado=ESTADO_NOMBRE;readonly codigo=codigoTicket;
 get id():number {return Number(this.route.snapshot.paramMap.get('id'));}
 ngOnInit():void {this.cargar();if(this.auth.esAdmin()){this.api.listar<Tecnico[]>('/tecnicos').subscribe({next:r=>this.tecnicos.set(r),error:e=>this.avisos.error(interpretarError(e).mensaje)});this.api.listar<Servicio[]>('/servicios').subscribe({next:r=>this.catalogo.set(r),error:e=>this.avisos.error(interpretarError(e).mensaje)});}}
 cargar():void {this.cargando.set(true);this.error.set('');this.api.listar<Ticket>(`/tickets/${this.id}`).subscribe({next:t=>{this.ticket.set(t);this.tecnicoId.set(t.tecnico?.id??null);this.diagnostico.set(t.diagnostico??'');this.solucion.set(t.solucion??'');this.lineas.set(t.servicios.map(x=>({servicioId:x.servicioId,observacion:x.observacion??''})));this.cargando.set(false);},error:e=>{this.error.set(interpretarError(e).mensaje);this.cargando.set(false);}});}
 asignar():void {if(!this.tecnicoId()){this.error.set('Selecciona un técnico activo.');return;}this.ejecutar(`/tickets/${this.id}/asignar`,{tecnicoId:this.tecnicoId()},'Técnico asignado');}
 cambiar(estado:EstadoTicket):void {if(estado==='RESUELTO'&&(!this.diagnostico().trim()||!this.solucion().trim())){this.error.set('Para resolver un caso son necesarios el diagnóstico y la solución.');return;}
  if(!confirm(`¿Cambiar el ticket a ${this.nombreEstado[estado]}?`))return;
  this.ejecutar(`/tickets/${this.id}/estado`,{estado,diagnostico:this.diagnostico().trim()||null,solucion:this.solucion().trim()||null},`Ticket actualizado: ${this.nombreEstado[estado]}`);
 }
 agregarLinea():void {this.lineas.update(lineas=>[...lineas,{servicioId:null,observacion:''}]);}
 cambiarLinea(i:number,campo:'servicioId'|'observacion',valor:string):void {this.lineas.update(lineas=>lineas.map((line,j)=>j!==i?line:{...line,[campo]:campo==='servicioId'?(valor?Number(valor):null):valor}));}
 quitarLinea(i:number):void {this.lineas.update(v=>v.filter((_,j)=>j!==i));}
 guardarServicios():void {
  const lineas=this.lineas();if(!lineas.length){this.error.set('Agrega al menos un servicio.');return;}
  if(lineas.some(x=>!x.servicioId)){this.error.set('Selecciona el servicio en cada fila.');return;}
  if(new Set(lineas.map(x=>x.servicioId)).size!==lineas.length){this.error.set('No puedes seleccionar el mismo servicio dos veces.');return;}
  this.ejecutar(`/tickets/${this.id}/servicios`,{servicios:lineas.map(x=>({servicioId:x.servicioId,observacion:x.observacion.trim()||null}))},'Servicios registrados y total actualizado');
 }
 private ejecutar(ruta:string,body:unknown,mensaje:string):void {this.error.set('');this.guardando.set(true);this.api.editar<Ticket>(ruta,body).subscribe({next:t=>{this.ticket.set(t);this.guardando.set(false);this.avisos.exito(mensaje);this.cargar();},error:e=>{this.error.set(interpretarError(e).mensaje);this.guardando.set(false);}});}
}
