<?php
require_once 'db_config.php';

if (!isset($_GET['token'])) {
    echo "Token no proporcionado.";
    exit;
}

$token = $_GET['token'];

$sql = "SELECT usuario_id, usado FROM confirmaciones WHERE token = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("s", $token);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo "Token inválido o no encontrado.";
    exit;
}

$row = $result->fetch_assoc();

if ($row['usado']) {
    echo "Este enlace de confirmación ya fue utilizado.";
    exit;
}

$usuario_id = $row['usuario_id'];

$sql = "UPDATE usuarios SET confirmado = 1 WHERE id = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("i", $usuario_id);
if (!$stmt->execute()) {
    echo "Error al confirmar la cuenta.";
    exit;
}

$sql = "UPDATE confirmaciones SET usado = 1 WHERE token = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("s", $token);
$stmt->execute();

echo "¡Tu cuenta ha sido confirmada exitosamente!";
?>