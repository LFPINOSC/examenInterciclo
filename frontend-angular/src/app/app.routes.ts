import { Routes } from '@angular/router';
import { requiereSesion, requiereAdmin, soloInvitado } from './core/guards';
import { ShellComponent } from './pages/shell.component';
import { LoginComponent } from './pages/login.component';
import { RegistroComponent } from './pages/registro.component';
import { PanelComponent } from './pages/panel.component';
import { EquiposComponent } from './pages/equipos.component';
import { TicketsComponent } from './pages/tickets.component';
import { TicketDetalleComponent } from './pages/ticket-detalle.component';
import { TecnicosComponent } from './pages/tecnicos.component';
import { ServiciosComponent } from './pages/servicios.component';
import { UsuariosComponent } from './pages/usuarios.component';
import { CuentaComponent } from './pages/cuenta.component';

export const routes: Routes = [
 {path:'acceso',component:LoginComponent,canActivate:[soloInvitado]},
 {path:'registro',component:RegistroComponent,canActivate:[soloInvitado]},
 {path:'',component:ShellComponent,canActivate:[requiereSesion],children:[
  {path:'panel',component:PanelComponent,title:'Panel de control · TecnoSoporte'},
  {path:'equipos',component:EquiposComponent,title:'Equipos · TecnoSoporte'},
  {path:'tickets',component:TicketsComponent,title:'Tickets · TecnoSoporte'},
  {path:'tickets/:id',component:TicketDetalleComponent,title:'Detalle del ticket · TecnoSoporte'},
  {path:'servicios',component:ServiciosComponent,title:'Servicios · TecnoSoporte'},
  {path:'tecnicos',component:TecnicosComponent,canActivate:[requiereAdmin],title:'Técnicos · TecnoSoporte'},
  {path:'usuarios',component:UsuariosComponent,canActivate:[requiereAdmin],title:'Clientes · TecnoSoporte'},
  {path:'cuenta',component:CuentaComponent,title:'Mi cuenta · TecnoSoporte'},
  {path:'',pathMatch:'full',redirectTo:'panel'}
 ]},
 {path:'**',redirectTo:'panel'}
];
