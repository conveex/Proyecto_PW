<?php
header('Content-Type: application/json');
include 'db_config.php';

$sql = "SELECT nombre, unidad FROM ingredientes ORDER BY nombre ASC";
$result = $conexion->query($sql);

$ingredientes = [];
while ($row = $result->fetch_assoc()) {
    $ingredientes[] = $row;
}

echo json_encode($ingredientes);
?>