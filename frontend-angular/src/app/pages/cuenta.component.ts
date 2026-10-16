import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { interpretarError } from '../core/error.util';
import { Usuario } from '../core/models';
@Component({standalone:true,imports:[RouterLink],template:`
<div class="page-enter"><div class="page-title"><div><span class="kicker">PORTAL / IDENTIDAD</span><h1>Mi cuenta<span class="orange">.</span></h1><p>Información recuperada directamente desde la API.</p></div><a routerLink="/panel" class="btn-outline">← Volver al panel</a></div>
@if(error()){<div class="alert error-alert">{{error()}}</div>}
@if(usuario(); as u){<div class="profile-card"><div class="profile-intro"><div class="profile-avatar">{{u.nombre.charAt(0)}}{{u.apellido.charAt(0)}}</div><div><span class="kicker">USUARIO #{{u.id}}</span><h2>{{u.nombre}} {{u.apellido}}</h2><span class="role-tag">{{u.rol}}</span></div></div><div class="profile-info"><div><span>CORREO ELECTRÓNICO</span><strong>{{u.correo}}</strong></div><div><span>TELÉFONO</span><strong>{{u.telefono||'No registrado'}}</strong></div><div><span>ACCESO</span><strong>{{u.activo?'Cuenta activa':'Cuenta inactiva'}}</strong></div><div><span>TIPO DE CUENTA</span><strong>{{u.rol==='ADMIN'?'Administrador del sistema':'Cliente de soporte'}}</strong></div></div></div>}
</div>`})
export class CuentaComponent implements OnInit {
 private api=inject(ApiService);private auth=inject(AuthService);
 readonly usuario=signal<Usuario|null>(null);readonly error=signal('');
 ngOnInit():void {this.api.listar<Usuario>('/usuarios/me').subscribe({next:u=>{this.usuario.set(u);this.auth.actualizarUsuario(u);},error:e=>this.error.set(interpretarError(e).mensaje)});}
}
