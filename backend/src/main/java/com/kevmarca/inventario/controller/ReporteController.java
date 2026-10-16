package com.kevmarca.inventario.controller;

import com.kevmarca.inventario.dto.ReporteVentasResponse;
import com.kevmarca.inventario.exception.ReglaNegocioException;
import com.kevmarca.inventario.service.ReporteService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Reportes de ventas y ganancias: solo ADMIN (ver SecurityConfig). */
// 📌 Reporte de ventas y ganancias: SOLO ADMIN (regla en SecurityConfig)
@RestController
@RequestMapping("/api/reportes")
public class ReporteController {

    private final ReporteService service;

    public ReporteController(ReporteService service) {
        this.service = service;
    }

    /** GET /api/reportes/ventas?dias=1 (hoy) | 7 | 30 */
    @GetMapping("/ventas")
    public ReporteVentasResponse ventas(@RequestParam(defaultValue = "1") int dias) {
        if (dias < 1 || dias > 365) {
            throw new ReglaNegocioException("El período debe estar entre 1 y 365 días");
        }
        return service.ventas(dias);
    }
}
