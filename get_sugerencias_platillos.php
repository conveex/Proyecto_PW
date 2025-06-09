<?php
session_start();
require_once 'db_config.php';

$usuario_id = $_SESSION['usuario_id'] ?? null;

$sql = "
    SELECT sp.id, sp.nombre, sp.descripcion, sp.preparacion, sp.imagen_url, sp.fecha_subida,
           sp.votos_positivos, sp.votos_negativos, u.nombre AS usuario_nombre,
           vs.voto AS voto_usuario
    FROM sugerencias_platillos sp
    INNER JOIN usuarios u ON sp.id_usuario = u.id
    LEFT JOIN votos_sugerencias vs ON vs.id_usuario = " . ($usuario_id ? intval($usuario_id) : 0) . "
        AND vs.tipo_sugerencia = 'platillo'
        AND vs.id_sugerencia = sp.id
    WHERE sp.estado = 'pendiente'
    ORDER BY sp.fecha_subida DESC
";

$result = $conexion->query($sql);
$sugerencias = [];

while ($row = $result->fetch_assoc()) {
    $ingredientes_sql = "
        SELECT i.nombre, i.unidad, spi.cantidad
        FROM sugerencias_platillos_ingredientes spi
        INNER JOIN ingredientes i ON spi.id_ingrediente = i.id
        WHERE spi.id_sugerencia = " . intval($row['id']);

    $ingredientes_result = $conexion->query($ingredientes_sql);
    $ingredientes = [];

    while ($ing = $ingredientes_result->fetch_assoc()) {
        $ingredientes[] = $ing;
    }

    $row['ingredientes'] = $ingredientes;

    $row['ya_voto'] = !is_null($row['voto_usuario']);
    $sugerencias[] = $row;
}

echo json_encode($sugerencias);
?>