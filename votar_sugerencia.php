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
$voto = $input['voto'] ?? null;

if (!$id_sugerencia || !$tipo_sugerencia || !$voto) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos incompletos']);
    exit;
}

$usuario_id = $_SESSION['usuario_id'];

$sql = "INSERT INTO votos_sugerencias (id_usuario, tipo_sugerencia, id_sugerencia, voto)
        VALUES (?, ?, ?, ?)";

$stmt = $conexion->prepare($sql);
$stmt->bind_param("isis", $usuario_id, $tipo_sugerencia, $id_sugerencia, $voto);

try {
    if ($stmt->execute()) {
        $estado_actualizado = null;
        if ($tipo_sugerencia === 'ingrediente') {
            $estadoQuery = $conexion->prepare("SELECT estado FROM sugerencias_ingredientes WHERE id = ?");
        } else {
            $estadoQuery = $conexion->prepare("SELECT estado FROM sugerencias_platillos WHERE id = ?");
        }

        $estadoQuery->bind_param("i", $id_sugerencia);
        $estadoQuery->execute();
        $estadoQuery->bind_result($estado);
        $estadoQuery->fetch();
        $estadoQuery->close();

        if ($estado === 'aprobada' || $estado === 'rechazada') {
            $estado_actualizado = $estado;
        }

        echo json_encode(['success' => true, 'estado_actualizado' => $estado_actualizado]);
    }
} catch (mysqli_sql_exception $e) {
    error_log("Excepción SQL al votar: " . $e->getMessage());

    $mensajeError = $e->getMessage();

    // Manejo personalizado según tus triggers
    if (strpos($mensajeError, 'No puedes votar tu propia sugerencia') !== false) {
        http_response_code(403);
        echo json_encode(['error' => 'No puedes votar tu propia sugerencia.']);
    } elseif (strpos($mensajeError, 'Ya has votado esta sugerencia') !== false) {
        http_response_code(409);
        echo json_encode(['error' => 'Ya has votado esta sugerencia.']);
    } elseif (strpos($mensajeError, 'La sugerencia no existe') !== false) {
        http_response_code(404);
        echo json_encode(['error' => 'La sugerencia no existe.']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Error al guardar el voto: ' . $mensajeError]);
    }
}
?>