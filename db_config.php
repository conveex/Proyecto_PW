<?php
$host = "db4free.net";
$user = "diego_vl";
$password = "MySQL_DVL_21";
$database = "db_pw_platillos";

$conexion = new mysqli($host, $user, $password, $database);
$conexion->set_charset("utf8");

if ($conexion->connect_error) {
    die("Conexión fallida: " . $conexion->connect_error);
}
?>