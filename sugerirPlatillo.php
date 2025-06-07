<?php
require 'db_config.php';
session_start();

header('Content-Type: application/json');

if(!isset($_SESSION['usuario_id'])) {
    echo json_encode(['success' => false, 'message' => 'Usuario no autenticado.']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if(!$data) {
    echo json_encode(['success' => false, 'message' => 'Datos inválidos.']);
    exit;
}

$nombre = trim($data['nombre']);
$descripcion = trim($data['descripcion']);
$preparacion = trim($data['preparacion']);
$imagen_url = trim($data['imagen_url']);
$id_usuario = $_SESSION['usuario_id'];
$fecha_subida = date('Y-m-d H:i:s');

if (!$nombre) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'El nombre del platillo es obligatorio.']);
    exit;
}

$sql_check = "SELECT COUNT(*) AS total FROM sugerencias_platillos WHERE nombre = ? AND estado IN ('pendiente', 'aprobada')";
$stmt_check = $conexion->prepare($sql_check);
$stmt_check->bind_param("s", $nombre);
$stmt_check->execute();
$result_check = $stmt_check->get_result();
$row_check = $result_check->fetch_assoc();

if ($row_check['total'] > 0) {
    http_response_code(409);
    echo json_encode(['success' => false, 'error' => 'Ya existe una sugerencia con ese nombre.']);
    exit;
}

$conexion->begin_transaction();

try {
    $stmt = $conexion->prepare(
        "INSERT INTO sugerencias_platillos 
        (nombre, descripcion, preparacion, imagen_url, fecha_subida, id_usuario)
        VALUES (?, ?, ?, ?, ?, ?)"
    );

    $stmt->bind_param("sssssi", $nombre, $descripcion, $preparacion, $imagen_url, $fecha_subida, $id_usuario);

    try {
        $stmt->execute();
    } catch (mysqli_sql_exception $ex) {
        error_log("Excepción SQL: " . $ex->getMessage());

        $conexion->rollback();
        // Detectar si el trigger lanzó el error de límite
        if (strpos($ex->getMessage(), 'Has alcanzado el límite de 5 sugerencias activas') !== false) {
            http_response_code(429);
            echo json_encode(['error' => 'Has alcanzado el límite de 5 sugerencias activas.']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Error al guardar en la base de datos: ' . $ex->getMessage()]);
        }

        $conexion->close();
        exit;
    }
    
    $id_sugerencia = $stmt->insert_id;

    $stmtIng = $conexion->prepare(
        "INSERT INTO sugerencias_platillos_ingredientes (id_sugerencia, id_ingrediente, cantidad)
        VALUES (?, ?, ?)"
    );

    foreach ($data['ingredientes'] as $ing) {
        $nombreIng = $conexion->real_escape_string($ing['nombre']);
        $res = $conexion->query("SELECT id FROM ingredientes WHERE nombre = '$nombreIng'");

        if ($res && $row = $res->fetch_assoc()) {
            $id_ingrediente = $row['id'];
            $cantidad = floatval($ing['cantidad']);

            $stmtIng->bind_param("iid", $id_sugerencia, $id_ingrediente, $cantidad);

            $stmtIng->execute();
        } else {
            throw new Exception("Ingrediente no encontrado: $nombreIng");
        }
    }

    $conexion->commit();
    echo json_encode(['success' => true, 'message' => 'Platillo sugerido con éxito.']);

} catch (Exception $e) {
    $conexion->rollback();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

$conexion->close();
?>