package com.sistema.tecnosoporte;
import com.sistema.tecnosoporte.enums.*;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
class ModeloBasicoTests {
 @Test void soloDosRoles(){assertEquals(2,Rol.values().length);}
 @Test void losEstadosIncluyenCerrado(){assertNotNull(EstadoTicket.valueOf("CERRADO"));}
}
