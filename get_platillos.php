<?php
header('Content-Type: application/json');
include 'db_config.php';

// Leer datos desde JS
$data = json_decode(file_get_contents('php://input'), true);
$ingredientes = $data['ingredientes'] ?? [];

if (count($ingredientes) === 0) {
    echo json_encode([]);
    exit;
}

// Obtener IDs de ingredientes
$placeholders = implode(',', array_fill(0, count($ingredientes), '?'));
$sql = "
    SELECT p.id, p.nombre, p.descripcion, p.preparacion, p.imagen_url
    FROM platillos p
    JOIN platillos_ingredientes pi ON p.id = pi.id_platillo
    JOIN ingredientes i ON pi.id_ingrediente = i.id
    WHERE i.nombre IN ($placeholders)
    GROUP BY p.id
    HAVING COUNT(DISTINCT i.nombre) >= 1
";

$stmt = $conexion->prepare($sql);
$stmt->bind_param(str_repeat('s', count($ingredientes)), ...$ingredientes);
$stmt->execute();
$result = $stmt->get_result();

$platillos = [];

while ($row = $result->fetch_assoc()) {
    $platillo_id = $row['id'];

    // Obtener ingredientes del platillo
    $sql_ing = "
        SELECT i.nombre, pi.cantidad, i.unidad
        FROM platillos_ingredientes pi
        JOIN ingredientes i ON pi.id_ingrediente = i.id
        WHERE pi.id_platillo = ?
    ";
    $stmt_ing = $conexion->prepare($sql_ing);
    $stmt_ing->bind_param("i", $platillo_id);
    $stmt_ing->execute();
    $res_ing = $stmt_ing->get_result();

    $ingredientes_detalle = [];
    while ($ing = $res_ing->fetch_assoc()) {
        $ingredientes_detalle[] = $ing;
    }

    $platillos[] = [
        "nombre" => $row['nombre'],
        "descripcion" => $row['descripcion'],
        "preparacion" => $row['preparacion'],
        "imagen_url" => $row['imagen_url'],
        "ingredientes" => $ingredientes_detalle
    ];
}

echo json_encode($platillos);