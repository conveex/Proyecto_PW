<?php
session_start();
header('Content-Type: application/json');
require_once 'db_config.php';

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode([]);
    exit;
}

$id_usuario = $_SESSION['usuario_id'];

try {
    $stmt = $conexion->prepare("
        SELECT tipo_sugerencia, id_sugerencia, voto
        FROM votos_sugerencias
        WHERE id_usuario = ?
    ");
    $stmt->bind_param("i", $id_usuario);
    $stmt->execute();

    $result = $stmt->get_result();
    $votos = [];

    while ($row = $result->fetch_assoc()) {
        $votos[] = $row;
    }

    echo json_encode($votos);
} catch (mysqli_sql_exception $e) {
    error_log("Error al obtener votos del usuario: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Error al obtener los votos.']);
}