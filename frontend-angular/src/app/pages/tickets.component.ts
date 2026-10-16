import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { NotificacionesService } from '../core/notificaciones.service';
import { interpretarError } from '../core/error.util';
import { Equipo, EstadoTicket, ESTADO_NOMBRE, Prioridad, PRIORIDADES, Ticket, codigoTicket } from '../core/models';
@Component({standalone:true,imports:[DatePipe,ReactiveFormsModule,RouterLink],templateUrl:'./tickets.component.html'})
export class TicketsComponent implements OnInit {
 readonly auth=inject(AuthService);private api=inject(ApiService);private fb=inject(FormBuilder);private avisos=inject(NotificacionesService);
 readonly tickets=signal<Ticket[]>([]);readonly equipos=signal<Equipo[]>([]);readonly filtro=signal('');readonly estado=signal('TODOS');
 readonly lista=computed(()=>this.tickets().filter(t=>(this.estado()==='TODOS'||t.estado===this.estado())&&`${codigoTicket(t.id)} ${t.descripcionProblema} ${t.equipo.marca} ${t.equipo.modelo} ${t.equipo.cliente.nombre}`.toLowerCase().includes(this.filtro().toLowerCase())).sort((a,b)=>b.id-a.id));
 readonly cargando=signal(false);readonly abierto=signal(false);readonly editId=signal<number|null>(null);readonly guardando=signal(false);readonly error=signal('');readonly campos=signal<Record<string,string>>({});
 readonly estados:('TODOS'|EstadoTicket)[]=['TODOS','PENDIENTE','ASIGNADO','EN_PROCESO','RESUELTO','CERRADO'];
 readonly nombreEstado=ESTADO_NOMBRE;readonly prioridades=PRIORIDADES;readonly codigo=codigoTicket;
 readonly form=this.fb.nonNullable.group({equipoId:['',[Validators.required]],descripcionProblema:['',[Validators.required,Validators.minLength(10),Validators.maxLength(3000)]],prioridad:['MEDIA' as Prioridad,[Validators.required]]});
 ngOnInit():void {this.cargar();}
 cargar():void {this.cargando.set(true);this.error.set('');this.api.listar<Ticket[]>('/tickets').subscribe({next:r=>{this.tickets.set(r);this.cargando.set(false);},error:e=>{this.error.set(interpretarError(e).mensaje);this.cargando.set(false);}});this.api.listar<Equipo[]>('/equipos').subscribe({next:r=>this.equipos.set(r.filter(e=>e.activo)),error:e=>this.avisos.error(interpretarError(e).mensaje)});}
 nuevo():void {this.editId.set(null);this.form.reset({equipoId:'',descripcionProblema:'',prioridad:'MEDIA'});this.error.set('');this.campos.set({});this.abierto.set(true);}
 editar(t:Ticket):void {this.editId.set(t.id);this.form.reset({equipoId:String(t.equipo.id),descripcionProblema:t.descripcionProblema,prioridad:t.prioridad});this.error.set('');this.campos.set({});this.abierto.set(true);}
 guardar():void {if(this.form.invalid){this.form.markAllAsTouched();return;}const v=this.form.getRawValue();const id=this.editId();const body=id===null?{equipoId:Number(v.equipoId),descripcionProblema:v.descripcionProblema.trim(),prioridad:v.prioridad}:{descripcionProblema:v.descripcionProblema.trim(),prioridad:v.prioridad};this.guardando.set(true);this.error.set('');this.campos.set({});
  (id===null?this.api.crear<Ticket>('/tickets',body):this.api.editar<Ticket>(`/tickets/${id}`,body)).subscribe({next:()=>{this.guardando.set(false);this.abierto.set(false);this.avisos.exito(id===null?'Solicitud registrada':'Solicitud actualizada');this.cargar();},error:e=>{const x=interpretarError(e);this.error.set(x.mensaje);this.campos.set(x.campos);this.guardando.set(false);}});
 }
 borrar(t:Ticket):void {if(!confirm(`¿Eliminar la solicitud ${codigoTicket(t.id)}? Esta acción no se puede deshacer.`))return;this.api.eliminar(`/tickets/${t.id}`).subscribe({next:()=>{this.avisos.exito('Solicitud eliminada');this.cargar();},error:e=>this.avisos.error(interpretarError(e).mensaje)});}
}
