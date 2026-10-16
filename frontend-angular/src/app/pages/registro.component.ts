import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { NotificacionesService } from '../core/notificaciones.service';
import { interpretarError } from '../core/error.util';

@Component({standalone:true,imports:[ReactiveFormsModule,RouterLink],templateUrl:'./registro.component.html'})
export class RegistroComponent {
 private fb=inject(FormBuilder);private auth=inject(AuthService);private router=inject(Router);private avisos=inject(NotificacionesService);
 readonly esperando=signal(false);readonly error=signal('');readonly campos=signal<Record<string,string>>({});
 readonly formulario=this.fb.nonNullable.group({
  nombre:['',[Validators.required,Validators.maxLength(80)]],apellido:['',[Validators.required,Validators.maxLength(80)]],
  correo:['',[Validators.required,Validators.email]],telefono:['',[Validators.pattern(/^09[0-9]{8}$/)]],
  contrasena:['',[Validators.required,Validators.minLength(8),Validators.maxLength(72)]]
 });
 registrar():void {
  this.error.set('');this.campos.set({});if(this.formulario.invalid){this.formulario.markAllAsTouched();return;}
  this.esperando.set(true);const v=this.formulario.getRawValue();
  this.auth.registro({...v,telefono:v.telefono.trim()||null}).subscribe({
   next:()=>{this.esperando.set(false);this.avisos.exito('Cuenta creada. Ya puedes iniciar sesión.');void this.router.navigateByUrl('/acceso');},
   error:err=>{this.esperando.set(false);const e=interpretarError(err);this.error.set(e.mensaje);this.campos.set(e.campos);}
  });
 }
}
