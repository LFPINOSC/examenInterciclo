import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { NotificacionesService } from '../core/notificaciones.service';
import { interpretarError } from '../core/error.util';
import { Tecnico } from '../core/models';
@Component({standalone:true,imports:[ReactiveFormsModule],templateUrl:'./tecnicos.component.html'})
export class TecnicosComponent implements OnInit {
 private api=inject(ApiService);private fb=inject(FormBuilder);private aviso=inject(NotificacionesService);
 readonly items=signal<Tecnico[]>([]);readonly filtro=signal('');readonly lista=computed(()=>this.items().filter(t=>`${t.nombre} ${t.apellido} ${t.especialidad}`.toLowerCase().includes(this.filtro().toLowerCase())));
 readonly abierto=signal(false);readonly id=signal<number|null>(null);readonly error=signal('');readonly campos=signal<Record<string,string>>({});readonly guardando=signal(false);
 readonly form=this.fb.nonNullable.group({nombre:['',[Validators.required,Validators.maxLength(80)]],apellido:['',[Validators.required,Validators.maxLength(80)]],especialidad:['',[Validators.required,Validators.maxLength(120)]],telefono:['',[Validators.pattern(/^09[0-9]{8}$/)]],activo:[true]});
 ngOnInit():void {this.cargar();}
 cargar():void {this.api.listar<Tecnico[]>('/tecnicos').subscribe({next:r=>this.items.set(r),error:e=>this.aviso.error(interpretarError(e).mensaje)});}
 nuevo():void {this.id.set(null);this.form.reset({nombre:'',apellido:'',especialidad:'',telefono:'',activo:true});this.error.set('');this.campos.set({});this.abierto.set(true);}
 editar(t:Tecnico):void {this.id.set(t.id);this.form.reset({nombre:t.nombre,apellido:t.apellido,especialidad:t.especialidad,telefono:t.telefono??'',activo:t.activo});this.error.set('');this.campos.set({});this.abierto.set(true);}
 guardar():void {if(this.form.invalid){this.form.markAllAsTouched();return;}const v=this.form.getRawValue();const body={...v,telefono:v.telefono.trim()||null};this.error.set('');this.guardando.set(true);const id=this.id();
  const call=id===null?this.api.crear<Tecnico>('/tecnicos',body):this.api.editar<Tecnico>(`/tecnicos/${id}`,body);
  call.subscribe({next:()=>{this.guardando.set(false);this.abierto.set(false);this.aviso.exito('Técnico guardado');this.cargar();},error:e=>{const x=interpretarError(e);this.error.set(x.mensaje);this.campos.set(x.campos);this.guardando.set(false);}});
 }
 desactivar(t:Tecnico):void {if(!confirm(`¿Desactivar a ${t.nombre} ${t.apellido}?`))return;this.api.eliminar(`/tecnicos/${t.id}`).subscribe({next:()=>{this.aviso.exito('Técnico desactivado');this.cargar();},error:e=>this.aviso.error(interpretarError(e).mensaje)});}
}
