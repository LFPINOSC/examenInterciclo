import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { interpretarError } from '../core/error.util';

@Component({standalone:true,imports:[ReactiveFormsModule,RouterLink],templateUrl:'./login.component.html'})
export class LoginComponent {
 private fb=inject(FormBuilder); private auth=inject(AuthService); private router=inject(Router);
 readonly esperando=signal(false);readonly error=signal('');readonly mostrarClave=signal(false);
 readonly formulario=this.fb.nonNullable.group({correo:['',[Validators.required,Validators.email]],contrasena:['',[Validators.required]]});
 ingresar():void {
  this.error.set(''); if(this.formulario.invalid){this.formulario.markAllAsTouched();return;}
  this.esperando.set(true);
  this.auth.login(this.formulario.controls.correo.value.trim(),this.formulario.controls.contrasena.value).subscribe({
   next:()=>{this.esperando.set(false);void this.router.navigateByUrl('/panel');},
   error:err=>{this.esperando.set(false);this.error.set(interpretarError(err).mensaje);}
  });
 }
}
