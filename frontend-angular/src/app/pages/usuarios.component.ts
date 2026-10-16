import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { NotificacionesService } from '../core/notificaciones.service';
import { interpretarError } from '../core/error.util';
import { Usuario } from '../core/models';
@Component({standalone:true,imports:[ReactiveFormsModule],templateUrl:'./usuarios.component.html'})
export class UsuariosComponent implements OnInit {
 private api=inject(ApiService);private fb=inject(FormBuilder);private avisos=inject(NotificacionesService);private auth=inject(AuthService);
 readonly items=signal<Usuario[]>([]);readonly filtro=signal('');readonly lista=computed(()=>this.items().filter(u=>`${u.nombre} ${u.apellido} ${u.correo}`.toLowerCase().includes(this.filtro().toLowerCase())));
 readonly abierto=signal(false);readonly id=signal<number|null>(null);readonly error=signal('');readonly campos=signal<Record<string,string>>({});readonly guardando=signal(false);
 readonly form=this.fb.nonNullable.group({nombre:['',[Validators.required,Validators.maxLength(80)]],apellido:['',[Validators.required,Validators.maxLength(80)]],correo:['',[Validators.required,Validators.email]],telefono:['',[Validators.pattern(/^09[0-9]{8}$/)]],contrasena:[''],activo:[true]});
 ngOnInit():void {this.cargar();}
 cargar():void {this.api.listar<Usuario[]>('/usuarios').subscribe({next:r=>this.items.set(r),error:e=>this.avisos.error(interpretarError(e).mensaje)});}
 nuevo():void {this.id.set(null);this.form.reset({nombre:'',apellido:'',correo:'',telefono:'',contrasena:'',activo:true});this.form.controls.contrasena.setValidators([Validators.required,Validators.minLength(8),Validators.maxLength(72)]);this.form.controls.contrasena.updateValueAndValidity();this.error.set('');this.campos.set({});this.abierto.set(true);}
 editar(u:Usuario):void {this.id.set(u.id);this.form.reset({nombre:u.nombre,apellido:u.apellido,correo:u.correo,telefono:u.telefono??'',contrasena:'',activo:u.activo});this.form.controls.contrasena.clearValidators();this.form.controls.contrasena.updateValueAndValidity();this.error.set('');this.campos.set({});this.abierto.set(true);}
 guardar():void {if(this.form.invalid){this.form.markAllAsTouched();return;}
  const v=this.form.getRawValue();const id=this.id();const body=id===null?{nombre:v.nombre,apellido:v.apellido,correo:v.correo.trim(),telefono:v.telefono.trim()||null,contrasena:v.contrasena}:{nombre:v.nombre,apellido:v.apellido,correo:v.correo.trim(),telefono:v.telefono.trim()||null,activo:v.activo};
  this.guardando.set(true);this.error.set('');this.campos.set({});
  (id===null?this.api.crear<Usuario>('/auth/registro',body):this.api.editar<Usuario>(`/usuarios/${id}`,body)).subscribe({next:u=>{this.guardando.set(false);this.abierto.set(false);this.avisos.exito(id===null?'Cliente registrado':'Usuario actualizado');if(id!==null&&this.auth.usuario()?.id===u.id)this.auth.actualizarUsuario(u);this.cargar();},error:e=>{const x=interpretarError(e);this.error.set(x.mensaje);this.campos.set(x.campos);this.guardando.set(false);}});
 }
 desactivar(u:Usuario):void {if(!confirm(`¿Desactivar a ${u.nombre} ${u.apellido}? Perderá el acceso al sistema.`))return;this.api.eliminar(`/usuarios/${u.id}`).subscribe({next:()=>{this.avisos.exito('Cuenta desactivada');this.cargar();},error:e=>this.avisos.error(interpretarError(e).mensaje)});}
}
