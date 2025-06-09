<?php
session_start();
require_once 'db_config.php';

$usuario_id = $_SESSION['usuario_id'] ?? null;

$sql = "
    SELECT si.id, si.nombre, si.unidad, si.imagen_referencia_url, si.fecha_subida,
           si.votos_positivos, si.votos_negativos, u.nombre AS usuario_nombre,
           vs.voto AS voto_usuario
    FROM sugerencias_ingredientes si
    INNER JOIN usuarios u ON si.id_usuario = u.id
    LEFT JOIN votos_sugerencias vs ON vs.id_usuario = " . ($usuario_id ? intval($usuario_id) : 0) . " 
        AND vs.tipo_sugerencia = 'ingrediente'
        AND vs.id_sugerencia = si.id
    WHERE si.estado = 'pendiente'
    ORDER BY si.fecha_subida DESC
";

$result = $conexion->query($sql);
$sugerencias = [];

while ($row = $result->fetch_assoc()) {
    $row['ya_voto'] = !is_null($row['voto_usuario']);
    $sugerencias[] = $row;
}

echo json_encode($sugerencias);
?>