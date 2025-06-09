<?php
session_start();
require_once 'db_config.php';

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'No autenticado']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$id_sugerencia = $input['id_sugerencia'] ?? null;
$tipo_sugerencia = $input['tipo_sugerencia'] ?? null;

if (!$id_sugerencia || !$tipo_sugerencia) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos incompletos']);
    exit;
}

$usuario_id = $_SESSION['usuario_id'];

try {
    $stmt = $conexion->prepare("
        DELETE FROM votos_sugerencias
        WHERE id_usuario = ? AND tipo_sugerencia = ? AND id_sugerencia = ?
    ");
    $stmt->bind_param("isi", $usuario_id, $tipo_sugerencia, $id_sugerencia);

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        throw new mysqli_sql_exception("Error al eliminar el voto");
    }
} catch (mysqli_sql_exception $e) {
    error_log("Excepción SQL al eliminar voto: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Error al eliminar el voto: ' . $e->getMessage()]);
}