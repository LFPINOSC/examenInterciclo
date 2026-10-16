import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { AuthService } from '../core/auth.service';
import { NotificacionesService } from '../core/notificaciones.service';

@Component({standalone:true,imports:[RouterOutlet,RouterLink,RouterLinkActive],templateUrl:'./shell.component.html'})
export class ShellComponent {
 readonly auth=inject(AuthService);
 private router=inject(Router);
 private avisos=inject(NotificacionesService);
 readonly menuAbierto=signal(false);
 readonly nombre=computed(()=>this.auth.usuario()?.nombre ?? 'Usuario');
 readonly iniciales=computed(()=>`${this.auth.usuario()?.nombre?.[0]??'T'}${this.auth.usuario()?.apellido?.[0]??'S'}`.toUpperCase());
 readonly secciones=[{ruta:'/panel',icono:'▦',nombre:'Resumen'},{ruta:'/tickets',icono:'▤',nombre:'Solicitudes'},{ruta:'/equipos',icono:'▣',nombre:'Equipos'},{ruta:'/servicios',icono:'◈',nombre:'Servicios'}];
 readonly adminSecciones=[{ruta:'/tecnicos',icono:'⚙',nombre:'Técnicos'},{ruta:'/usuarios',icono:'♧',nombre:'Clientes'}];
 readonly rutaActual = toSignal(this.router.events.pipe(filter((e):e is NavigationEnd=>e instanceof NavigationEnd),map(e=>e.urlAfterRedirects)),{initialValue:this.router.url});
 readonly titulo=computed(()=>{
  const ruta=this.rutaActual().split('/')[1];
  return ({panel:'Vista general',tickets:'Solicitudes',equipos:'Inventario de equipos',servicios:'Catálogo de servicios',tecnicos:'Equipo técnico',usuarios:'Gestión de clientes',cuenta:'Mi cuenta'} as Record<string,string>)[ruta] ?? 'Centro de soporte';
 });
 cerrarMenu():void {this.menuAbierto.set(false);}
 salir():void {this.auth.salir();this.avisos.exito('Sesión cerrada correctamente');void this.router.navigateByUrl('/acceso');}
}
