package ec.edu.ucacue.ordenes.servicio;

/** Valida una cedula ecuatoriana: 10 digitos, provincia 01-24 y digito verificador (modulo 10). */
public final class ValidadorCedula {

    private ValidadorCedula() {
    }

    public static boolean esValida(String cedula) {
        if (cedula == null || !cedula.matches("\\d{10}")) {
            return false;
        }
        int provincia = Integer.parseInt(cedula.substring(0, 2));
        if (provincia < 1 || provincia > 24 || cedula.charAt(2) > '5') {
            return false;
        }
        int suma = 0;
        for (int i = 0; i < 9; i++) {
            int n = (cedula.charAt(i) - '0') * (i % 2 == 0 ? 2 : 1);
            suma += n > 9 ? n - 9 : n;
        }
        return (10 - suma % 10) % 10 == cedula.charAt(9) - '0';
    }
}
