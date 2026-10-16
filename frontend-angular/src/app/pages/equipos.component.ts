import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { NotificacionesService } from '../core/notificaciones.service';
import { interpretarError } from '../core/error.util';
import { Equipo, Usuario, TIPOS, TIPO_NOMBRE } from '../core/models';

@Component({standalone:true,imports:[ReactiveFormsModule,RouterLink],templateUrl:'./equipos.component.html'})
export class EquiposComponent implements OnInit {
 private api=inject(ApiService);readonly auth=inject(AuthService);private aviso=inject(NotificacionesService);private fb=inject(FormBuilder);
 readonly equipos=signal<Equipo[]>([]);readonly clientes=signal<Usuario[]>([]);readonly cargando=signal(false);readonly guardando=signal(false);readonly error=signal('');
 readonly filtro=signal('');readonly editor=signal(false);readonly editId=signal<number|null>(null);readonly campos=signal<Record<string,string>>({});
 readonly tipos=TIPOS;readonly tiposTexto=TIPO_NOMBRE;
 readonly filtrados=computed(()=>this.equipos().filter(e=>`${e.marca} ${e.modelo} ${e.numeroSerie??''} ${e.cliente.nombre} ${e.cliente.apellido}`.toLowerCase().includes(this.filtro().toLowerCase())));
 readonly form=this.fb.nonNullable.group({tipo:['LAPTOP',[Validators.required]],marca:['',[Validators.required,Validators.maxLength(80)]],modelo:['',[Validators.required,Validators.maxLength(100)]],numeroSerie:['',[Validators.maxLength(100)]],descripcion:['',[Validators.maxLength(1000)]],clienteId:['']});
 ngOnInit():void {this.cargar();}
 cargar():void {this.cargando.set(true);this.error.set('');this.api.listar<Equipo[]>('/equipos').subscribe({next:r=>{this.equipos.set(r);this.cargando.set(false);},error:e=>{this.error.set(interpretarError(e).mensaje);this.cargando.set(false);}});
  if(this.auth.esAdmin()) this.api.listar<Usuario[]>('/usuarios').subscribe({next:r=>this.clientes.set(r.filter(u=>u.rol==='CLIENTE'&&u.activo)),error:e=>this.aviso.error(interpretarError(e).mensaje)});
 }
 nuevo():void {this.editId.set(null);this.campos.set({});this.error.set('');this.form.reset({tipo:'LAPTOP',marca:'',modelo:'',numeroSerie:'',descripcion:'',clienteId:''});this.editor.set(true);}
 editar(e:Equipo):void {this.editId.set(e.id);this.campos.set({});this.form.reset({tipo:e.tipo,marca:e.marca,modelo:e.modelo,numeroSerie:e.numeroSerie??'',descripcion:e.descripcion??'',clienteId:String(e.cliente.id)});this.editor.set(true);}
 cerrar():void {this.editor.set(false);this.campos.set({});}
 guardar():void {
  if(this.form.invalid){this.form.markAllAsTouched();return;}
  const v=this.form.getRawValue();if(this.auth.esAdmin()&&!v.clienteId){this.error.set('Selecciona al propietario del equipo.');return;}
  const body={tipo:v.tipo,marca:v.marca.trim(),modelo:v.modelo.trim(),numeroSerie:v.numeroSerie.trim()||null,descripcion:v.descripcion.trim()||null,clienteId:this.auth.esAdmin()?Number(v.clienteId):null};
  this.guardando.set(true);this.error.set('');this.campos.set({});
  const id=this.editId();const llamada=id!==null?this.api.editar<Equipo>(`/equipos/${id}`,body):this.api.crear<Equipo>('/equipos',body);
  llamada.subscribe({next:()=>{this.guardando.set(false);this.editor.set(false);this.aviso.exito(id===null?'Equipo registrado':'Equipo actualizado');this.cargar();},error:e=>{const err=interpretarError(e);this.error.set(err.mensaje);this.campos.set(err.campos);this.guardando.set(false);}});
 }
 desactivar(e:Equipo):void {if(!confirm(`¿Desactivar ${e.marca} ${e.modelo}? Se conservará el historial de tickets.`))return;this.api.eliminar(`/equipos/${e.id}`).subscribe({next:()=>{this.aviso.exito('Equipo desactivado');this.cargar();},error:e=>this.aviso.error(interpretarError(e).mensaje)});}
}
