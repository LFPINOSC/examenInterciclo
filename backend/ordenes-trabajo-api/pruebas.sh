#!/usr/bin/env bash
# Pruebas rapidas de la API (con la API encendida en :8080). Uso: ./pruebas.sh
B=${API:-http://localhost:8080/api}
J='Content-Type: application/json'
ok=0; fallos=0

# verificar "descripcion" codigo_esperado codigo_obtenido
verificar() {
  if [ "$2" = "$3" ]; then echo "  OK    $1 ($3)"; ok=$((ok+1)); else echo "  FALLO $1: esperado $2, obtenido $3"; fallos=$((fallos+1)); fi
}
# http METODO RUTA [TOKEN] [CUERPO] -> imprime "codigo|cuerpo"
http() {
  local m=$1 r=$2 t=$3 d=$4
  local args=(-s -w '|%{http_code}' -X "$m" "$B$r" -H "$J")
  [ -n "$t" ] && args+=(-H "Authorization: Bearer $t")
  [ -n "$d" ] && args+=(-d "$d")
  curl "${args[@]}"
}
codigo() { echo "${1##*|}"; }
cuerpo() { echo "${1%|*}"; }
campo() { echo "$1" | sed -n "s/.*\"$2\":\"\{0,1\}\([^\",}]*\).*/\1/p" | head -1; }

SUF=$RANDOM
echo "== Autenticacion"
r=$(http POST /auth/login "" '{"username":"admin","password":"mala"}'); verificar "login con clave incorrecta" 401 "$(codigo "$r")"
r=$(http POST /auth/login "" '{"username":"","password":""}');           verificar "login con campos vacios" 400 "$(codigo "$r")"
r=$(http POST /auth/login "" '{"username":"admin","password":"Admin123*"}'); verificar "login admin" 200 "$(codigo "$r")"
ADMIN=$(campo "$(cuerpo "$r")" token)
r=$(http GET /clientes ""); verificar "sin token => 401" 401 "$(codigo "$r")"
r=$(http GET /clientes "token.falso.aqui"); verificar "token alterado => 401" 401 "$(codigo "$r")"

echo "== Usuarios (solo ADMIN)"
r=$(http POST /admin/usuarios "$ADMIN" "{\"username\":\"tec$SUF\",\"nombre\":\"Tecnico $SUF\",\"correo\":\"tec$SUF@x.com\",\"password\":\"Clave1234\",\"rol\":\"TECNICO\"}")
verificar "crear tecnico" 201 "$(codigo "$r")"; TID=$(campo "$(cuerpo "$r")" id)
r=$(http POST /admin/usuarios "$ADMIN" "{\"username\":\"tec$SUF\",\"nombre\":\"Otro\",\"correo\":\"o$SUF@x.com\",\"password\":\"Clave1234\",\"rol\":\"TECNICO\"}")
verificar "usuario duplicado => 409" 409 "$(codigo "$r")"
r=$(http POST /admin/usuarios "$ADMIN" "{\"username\":\"d$SUF\",\"nombre\":\"D\",\"correo\":\"d$SUF@x.com\",\"password\":\"123\",\"rol\":\"TECNICO\"}")
verificar "clave debil => 400" 400 "$(codigo "$r")"
r=$(http POST /auth/login "" "{\"username\":\"tec$SUF\",\"password\":\"Clave1234\"}"); verificar "login tecnico" 200 "$(codigo "$r")"
TEC=$(campo "$(cuerpo "$r")" token)
r=$(http GET /admin/usuarios "$TEC"); verificar "tecnico no lista usuarios => 403" 403 "$(codigo "$r")"
r=$(http GET /clientes "$TEC");       verificar "tecnico no lista clientes => 403" 403 "$(codigo "$r")"

echo "== Clientes y equipos"
CED=0706489846
r=$(http POST /clientes "$ADMIN" '{"nombre":"Cliente Invalido","cedula":"1234567890"}'); verificar "cedula invalida => 400" 400 "$(codigo "$r")"
r=$(http POST /clientes "$ADMIN" "{\"nombre\":\"Cliente $SUF\",\"cedula\":\"$CED\",\"telefono\":\"0991234567\",\"correo\":\"c@x.com\"}")
if [ "$(codigo "$r")" = 409 ]; then r=$(http GET "/clientes?q=$CED" "$ADMIN"); CID=$(campo "$(cuerpo "$r")" id); echo "  (cliente ya existia: id $CID)"
else verificar "crear cliente" 201 "$(codigo "$r")"; CID=$(campo "$(cuerpo "$r")" id); fi
r=$(http POST /clientes "$ADMIN" "{\"nombre\":\"Repetido\",\"cedula\":\"$CED\"}"); verificar "cedula repetida => 409" 409 "$(codigo "$r")"
r=$(http POST /equipos "$ADMIN" "{\"clienteId\":$CID,\"tipo\":\"Laptop\",\"marca\":\"HP\",\"modelo\":\"250\",\"serie\":\"S$SUF\"}")
verificar "crear equipo" 201 "$(codigo "$r")"; EID=$(campo "$(cuerpo "$r")" id)
r=$(http POST /equipos "$ADMIN" "{\"clienteId\":$CID,\"tipo\":\"Laptop\",\"serie\":\"S$SUF\"}"); verificar "serie repetida => 409" 409 "$(codigo "$r")"

echo "== Ordenes"
r=$(http POST /ordenes "$ADMIN" "{\"clienteId\":$CID,\"equipoId\":$EID,\"tecnicoId\":$TID,\"descripcion\":\"No enciende\",\"prioridad\":\"ALTA\"}")
verificar "crear orden" 201 "$(codigo "$r")"; OID=$(campo "$(cuerpo "$r")" id); echo "  codigo: $(campo "$(cuerpo "$r")" codigo)"
r=$(http POST /ordenes "$ADMIN" "{\"clienteId\":$CID,\"equipoId\":$EID,\"descripcion\":\"\"}"); verificar "orden sin descripcion => 400" 400 "$(codigo "$r")"
r=$(http POST /ordenes "$TEC" "{\"clienteId\":$CID,\"equipoId\":$EID,\"descripcion\":\"x\"}"); verificar "tecnico no crea ordenes => 403" 403 "$(codigo "$r")"
r=$(http GET /ordenes "$TEC"); verificar "tecnico lista sus ordenes" 200 "$(codigo "$r")"
r=$(http GET "/ordenes/$OID" "$TEC"); verificar "tecnico ve su orden" 200 "$(codigo "$r")"
r=$(http POST "/ordenes/$OID/tareas" "$TEC" '{"descripcion":"Revisar fuente","horas":1.5,"costo":25}'); verificar "tecnico agrega tarea" 201 "$(codigo "$r")"; TAID=$(campo "$(cuerpo "$r")" id)
r=$(http POST "/ordenes/$OID/tareas" "$TEC" '{"descripcion":"Mala","horas":-1,"costo":0}'); verificar "tarea con horas negativas => 400" 400 "$(codigo "$r")"
r=$(http PATCH "/ordenes/$OID/estado" "$TEC" '{"estado":"COMPLETADA"}'); verificar "tecnico cambia estado" 200 "$(codigo "$r")"
echo "  costoTotal: $(campo "$(cuerpo "$r")" costoTotal)  fechaEntrega: $(campo "$(cuerpo "$r")" fechaEntrega)"
# orden de otro tecnico: el admin crea una sin asignar; el tecnico no debe verla
r=$(http POST /ordenes "$ADMIN" "{\"clienteId\":$CID,\"equipoId\":$EID,\"descripcion\":\"Sin asignar\"}"); OID2=$(campo "$(cuerpo "$r")" id)
r=$(http GET "/ordenes/$OID2" "$TEC"); verificar "tecnico no ve orden ajena => 403" 403 "$(codigo "$r")"
r=$(http GET "/ordenes/999999" "$ADMIN"); verificar "orden inexistente => 404" 404 "$(codigo "$r")"
r=$(http GET /resumen "$TEC"); verificar "resumen" 200 "$(codigo "$r")"

echo "== Reglas de integridad y limpieza"
r=$(http DELETE "/clientes/$CID" "$ADMIN"); verificar "cliente con ordenes no se borra => 409" 409 "$(codigo "$r")"
r=$(http DELETE "/tareas/$TAID" "$TEC"); verificar "tecnico elimina su tarea" 204 "$(codigo "$r")"
r=$(http DELETE "/ordenes/$OID" "$ADMIN"); verificar "admin elimina orden" 204 "$(codigo "$r")"
r=$(http DELETE "/ordenes/$OID2" "$ADMIN"); verificar "admin elimina orden 2" 204 "$(codigo "$r")"
r=$(http DELETE "/equipos/$EID" "$ADMIN"); verificar "eliminar equipo" 204 "$(codigo "$r")"
r=$(http DELETE "/clientes/$CID" "$ADMIN"); verificar "eliminar cliente" 204 "$(codigo "$r")"
r=$(http PATCH "/admin/usuarios/$TID/activo" "$ADMIN" '{"activo":false}'); verificar "desactivar tecnico" 200 "$(codigo "$r")"
r=$(http GET /ordenes "$TEC"); verificar "token de cuenta desactivada => 401" 401 "$(codigo "$r")"
r=$(http DELETE "/admin/usuarios/$TID" "$ADMIN"); verificar "eliminar tecnico" 204 "$(codigo "$r")"

echo; echo "Resultado: $ok correctas, $fallos fallidas"
[ "$fallos" -eq 0 ]
