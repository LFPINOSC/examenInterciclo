import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { NotificacionesService } from '../core/notificaciones.service';
import { interpretarError } from '../core/error.util';
import { Servicio } from '../core/models';
@Component({standalone:true,imports:[ReactiveFormsModule,CurrencyPipe],templateUrl:'./servicios.component.html'})
export class ServiciosComponent implements OnInit {
 readonly auth=inject(AuthService);private api=inject(ApiService);private fb=inject(FormBuilder);private avisos=inject(NotificacionesService);
 readonly items=signal<Servicio[]>([]);readonly filtro=signal('');readonly lista=computed(()=>this.items().filter(s=>`${s.nombre} ${s.descripcion??''}`.toLowerCase().includes(this.filtro().toLowerCase())));
 readonly abierto=signal(false);readonly id=signal<number|null>(null);readonly error=signal('');readonly campos=signal<Record<string,string>>({});readonly guardando=signal(false);
 readonly form=this.fb.nonNullable.group({nombre:['',[Validators.required,Validators.maxLength(120)]],descripcion:['',[Validators.maxLength(2000)]],precio:[0,[Validators.required,Validators.min(0)]],activo:[true]});
 ngOnInit():void {this.cargar();}
 cargar():void {this.api.listar<Servicio[]>('/servicios').subscribe({next:r=>this.items.set(r),error:e=>this.avisos.error(interpretarError(e).mensaje)});}
 nuevo():void {this.id.set(null);this.form.reset({nombre:'',descripcion:'',precio:0,activo:true});this.error.set('');this.campos.set({});this.abierto.set(true);}
 editar(s:Servicio):void {this.id.set(s.id);this.form.reset({nombre:s.nombre,descripcion:s.descripcion??'',precio:s.precio,activo:s.activo});this.error.set('');this.campos.set({});this.abierto.set(true);}
 guardar():void {if(this.form.invalid){this.form.markAllAsTouched();return;}const v=this.form.getRawValue();const body={...v,precio:Number(v.precio),descripcion:v.descripcion.trim()||null};const id=this.id();this.guardando.set(true);this.error.set('');
  (id===null?this.api.crear<Servicio>('/servicios',body):this.api.editar<Servicio>(`/servicios/${id}`,body)).subscribe({next:()=>{this.guardando.set(false);this.abierto.set(false);this.avisos.exito('Servicio guardado');this.cargar();},error:e=>{const x=interpretarError(e);this.error.set(x.mensaje);this.campos.set(x.campos);this.guardando.set(false);}});
 }
 desactivar(s:Servicio):void {if(!confirm(`¿Desactivar el servicio "${s.nombre}"?`))return;this.api.eliminar(`/servicios/${s.id}`).subscribe({next:()=>{this.avisos.exito('Servicio desactivado');this.cargar();},error:e=>this.avisos.error(interpretarError(e).mensaje)});}
}
