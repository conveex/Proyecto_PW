<?php
require 'db_config.php';
session_start();

header('Content-Type: application/json');

// Verificar que el usuario esté autenticado
if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado. Debes iniciar sesión.']);
    exit;
}

$usuario_id = $_SESSION['usuario_id'];

// Leer datos JSON enviados desde JavaScript
$input = json_decode(file_get_contents('php://input'), true);

$nombre = trim($input['nombre'] ?? '');
$unidad = trim($input['unidad'] ?? '');
$imagen = trim($input['imagenURL'] ?? '');

if (!$nombre) {
    http_response_code(400);
    echo json_encode(['error' => 'El nombre del ingrediente es obligatorio.']);
    exit;
}

// Validar que no exista ingrediente con ese nombre pendiente o aprobado
$sql_check = "SELECT COUNT(*) AS total FROM sugerencias_ingredientes WHERE nombre = ? AND estado IN ('pendiente', 'aprobada')";
$stmt_check = $conexion->prepare($sql_check);
$stmt_check->bind_param("s", $nombre);
$stmt_check->execute();
$result_check = $stmt_check->get_result();
$row_check = $result_check->fetch_assoc();

if ($row_check['total'] > 0) {
    http_response_code(409);
    echo json_encode(['error' => 'Ya existe una sugerencia con ese nombre.']);
    exit;
}

// Insertar la sugerencia (fecha actual)
$fecha = date('Y-m-d H:i:s');
$sql = "INSERT INTO sugerencias_ingredientes (nombre, unidad, imagen_referencia_url, fecha_subida, id_usuario)
        VALUES (?, ?, ?, ?, ?)";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("ssssi", $nombre, $unidad, $imagen, $fecha, $usuario_id);

try {
    if ($stmt->execute()) {
        echo json_encode(['mensaje' => 'Ingrediente sugerido con éxito']);
    }
} catch (mysqli_sql_exception $e) {
    error_log("Excepción SQL: " . $e->getMessage());

    // Detectar si el trigger lanzó el error de límite
    if (strpos($e->getMessage(), 'Has alcanzado el límite de 5 sugerencias activas') !== false) {
        http_response_code(429);
        echo json_encode(['error' => 'Has alcanzado el límite de 5 sugerencias activas.']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Error al guardar en la base de datos: ' . $e->getMessage()]);
    }
}

$conexion->close();