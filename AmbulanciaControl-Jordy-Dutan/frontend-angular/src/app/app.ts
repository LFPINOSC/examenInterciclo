import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Sesion } from './api.service';

type Campo = {
  clave: string;
  nombre: string;
  tipo?: string;
  opciones?: string;
  requerido?: boolean;
};

type Modulo = {
  id: string;
  titulo: string;
  icono: string;
  campos: Campo[];
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  api = inject(ApiService);
  sesion: Sesion | null = null;
  vista = 'inicio';
  error = '';
  exito = '';
  cargando = false;

  acceso = { correo: '', contrasena: '' };
  registro = { nombre: '', correo: '', contrasena: '' };

  modulos: Modulo[] = [
    {
      id: 'solicitudes',
      titulo: 'Solicitudes',
      icono: '📋',
      campos: [
        { clave: 'paciente', nombre: 'Nombre del paciente' },
        { clave: 'telefono', nombre: 'Teléfono' },
        { clave: 'origen', nombre: 'Origen' },
        { clave: 'destino', nombre: 'Destino' },
        { clave: 'prioridad', nombre: 'Prioridad', opciones: 'BAJA,MEDIA,ALTA,CRITICA' },
        { clave: 'observaciones', nombre: 'Observaciones', requerido: false }
      ]
    },
    {
      id: 'ambulancias',
      titulo: 'Ambulancias',
      icono: '🚑',
      campos: [
        { clave: 'placa', nombre: 'Placa' },
        { clave: 'codigo', nombre: 'Código interno' },
        { clave: 'tipo', nombre: 'Tipo', opciones: 'BASICA,AVANZADA' },
        { clave: 'estado', nombre: 'Estado', opciones: 'DISPONIBLE,OCUPADA,MANTENIMIENTO' }
      ]
    },
    {
      id: 'conductores',
      titulo: 'Conductores',
      icono: '👨‍✈️',
      campos: [
        { clave: 'nombre', nombre: 'Nombre completo' },
        { clave: 'licencia', nombre: 'Licencia' },
        { clave: 'telefono', nombre: 'Teléfono' },
        { clave: 'estado', nombre: 'Estado', opciones: 'DISPONIBLE,OCUPADO,INACTIVO' }
      ]
    },
    {
      id: 'asignaciones',
      titulo: 'Asignaciones',
      icono: '📍',
      campos: [
        { clave: 'solicitudId', nombre: 'Solicitud', tipo: 'solicitud' },
        { clave: 'ambulanciaId', nombre: 'Ambulancia', tipo: 'ambulancia' },
        { clave: 'conductorId', nombre: 'Conductor', tipo: 'conductor' },
        { clave: 'observaciones', nombre: 'Observaciones', requerido: false }
      ]
    }
  ];

  actual = this.modulos[0];
  registros: any[] = [];
  datos: Record<string, any> = {};
  editando: number | null = null;
  mostrarFormulario = false;

  catalogos: Record<string, any[]> = {
    solicitudes: [],
    ambulancias: [],
    conductores: [],
    asignaciones: []
  };

  get admin() {
    return this.sesion?.rol === 'ADMIN';
  }

  get operador() {
    return this.sesion?.rol === 'OPERADOR';
  }

  ngOnInit() {
    const token = sessionStorage.getItem('ambulanciasToken');
    if (token) {
      this.cargando = true;
      this.api.perfil().subscribe({
        next: (r) => {
          this.sesion = { ...r, token };
          this.vista = 'panel';
          this.cargando = false;
          this.cambiarModulo(this.modulos[0]);
        },
        error: () => {
          this.cargando = false;
          sessionStorage.removeItem('ambulanciasToken');
        }
      });
    }
  }

  mensaje(e: any) {
    if (e.name === 'TimeoutError') return 'El servidor tardó demasiado en responder.';
    if (e.status === 0) return 'Sin conexión con Spring Boot. Comprueba el puerto 8080.';
    if (e.status === 401) return 'Correo o contraseña incorrectos.';
    if (e.status === 403) return 'No tienes permiso para esta operación.';
    if (e.error?.mensajes) {
      return Object.entries(e.error.mensajes)
        .map(([k, v]) => k + ': ' + v)
        .join(' · ');
    }
    return e.error?.mensaje || e.error?.detail || e.error?.message || 'No se pudo completar la operación.';
  }

  limpiarMensajes() {
    this.error = '';
    this.exito = '';
  }

  entrar() {
    this.limpiarMensajes();
    this.cargando = true;
    this.api.login(this.acceso).subscribe({
      next: (s) => {
        this.cargando = false;
        this.sesion = s;
        sessionStorage.setItem('ambulanciasToken', s.token);
        this.acceso.contrasena = '';
        this.vista = 'panel';
        this.cambiarModulo(this.modulos[0]);
        this.exito = 'Bienvenido, ' + s.nombre;
      },
      error: (e) => {
        this.cargando = false;
        this.error = this.mensaje(e);
      }
    });
  }

  registrar() {
    this.limpiarMensajes();
    this.cargando = true;
    this.api.registro(this.registro).subscribe({
      next: () => {
        this.cargando = false;
        this.acceso.correo = this.registro.correo;
        this.acceso.contrasena = '';
        this.vista = 'acceso';
        this.exito = 'Cuenta OPERADOR creada. Ahora inicia sesión.';
      },
      error: (e) => {
        this.cargando = false;
        this.error = this.mensaje(e);
      }
    });
  }

  salir() {
    sessionStorage.removeItem('ambulanciasToken');
    this.sesion = null;
    this.vista = 'inicio';
    this.limpiarMensajes();
    this.registros = [];
  }

  cambiarModulo(m: Modulo) {
    if (!this.admin && m.id !== 'solicitudes') return;
    this.actual = m;
    this.limpiarForm();
    this.recargar();
  }

  recargar() {
    this.limpiarMensajes();
    this.cargando = true;

    this.api.listar(this.actual.id).subscribe({
      next: (r) => {
        this.registros = r;
        this.catalogos[this.actual.id] = r;
        this.cargando = false;
      },
      error: (e) => {
        this.cargando = false;
        this.error = this.mensaje(e);
      }
    });

    if (this.admin) {
      for (const mod of ['solicitudes', 'ambulancias', 'conductores']) {
        if (mod !== this.actual.id) {
          this.api.listar(mod).subscribe({
            next: (r) => (this.catalogos[mod] = r),
            error: () => {}
          });
        }
      }
    }
  }

  limpiarForm() {
    this.datos = {};
    this.editando = null;
    this.mostrarFormulario = false;
  }

  nuevo() {
    this.limpiarForm();
    this.mostrarFormulario = true;
    this.datos.prioridad = 'MEDIA';
    this.datos.estado = 'DISPONIBLE';
    this.datos.tipo = 'BASICA';
  }

  editar(r: any) {
    if (this.actual.id === 'asignaciones') return;
    this.datos = { ...r };
    this.editando = r.id;
    this.mostrarFormulario = true;
  }

  guardar() {
    if (this.actual.id === 'asignaciones' && this.editando !== null) return;
    this.limpiarMensajes();

    let payload = { ...this.datos };
    delete payload.id;

    if (this.actual.id === 'asignaciones') {
      for (const k of ['solicitudId', 'ambulanciaId', 'conductorId']) {
        payload[k] = Number(payload[k]);
      }
      payload.estado = 'EN_CURSO';
    }

    this.cargando = true;
    const call =
      this.editando === null
        ? this.api.crear(this.actual.id, payload)
        : this.api.actualizar(this.actual.id, this.editando, payload);

    call.subscribe({
      next: () => {
        this.cargando = false;
        this.limpiarForm();
        this.recargar();
        this.exito = 'Registro guardado correctamente.';
      },
      error: (e) => {
        this.cargando = false;
        this.error = this.mensaje(e);
      }
    });
  }

  borrar(r: any) {
    if (!confirm('¿Eliminar el registro seleccionado?')) return;
    this.limpiarMensajes();
    this.api.eliminar(this.actual.id, r.id).subscribe({
      next: () => {
        this.recargar();
        this.exito = 'Registro eliminado.';
      },
      error: (e) => (this.error = this.mensaje(e))
    });
  }

  finalizar(r: any) {
    if (!confirm('¿Finalizar servicio y liberar ambulancia/conductor?')) return;
    this.limpiarMensajes();
    this.api.finalizar(r.id).subscribe({
      next: () => {
        this.recargar();
        this.exito = 'Servicio finalizado y recursos liberados.';
      },
      error: (e) => (this.error = this.mensaje(e))
    });
  }

  opciones(tipo: string) {
    let p: Record<string, string> = {
      solicitud: 'solicitudes',
      ambulancia: 'ambulancias',
      conductor: 'conductores'
    };
    let a = this.catalogos[p[tipo]] || [];
    if (tipo === 'solicitud') return a.filter((x) => x.estado === 'PENDIENTE');
    return a.filter((x) => x.estado === 'DISPONIBLE');
  }

  etiqueta(tipo: string, r: any) {
    return tipo === 'solicitud'
      ? '#' + r.id + ' · ' + r.paciente
      : tipo === 'ambulancia'
      ? r.placa + ' · ' + r.codigo
      : r.nombre + ' · ' + r.licencia;
  }

  cabeceras() {
    return this.actual.campos.filter((c) => !c.clave.endsWith('Id'));
  }

  valor(r: any, c: Campo) {
    return r[c.clave] ?? '—';
  }
}