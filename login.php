<?php
require 'db_config.php';

session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $usuarioCorreo = trim($_POST['usuario'] ?? '');
    $contrasena = $_POST['contrasena'] ?? '';

    if (!$usuarioCorreo || !$contrasena) {
        http_response_code(400);
        echo json_encode(['error' => 'Faltan campos obligatorios.']);
        exit;
    }

    $sql = "SELECT id, nombre, correo, contrasena_hash, confirmado FROM usuarios WHERE nombre = ? OR correo = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("ss", $usuarioCorreo, $usuarioCorreo);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if ($resultado->num_rows === 0) {
        http_response_code(401);
        echo json_encode(['error' => 'Usuario o correo no registrado.']);
        exit;
    }

    $usuario = $resultado->fetch_assoc();

    if (!password_verify($contrasena, $usuario['contrasena_hash'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Contraseña incorrecta.']);
        exit;
    }

    if (!$usuario['confirmado']) {
        http_response_code(403);
        echo json_encode(['error' => 'Debes confirmar tu correo antes de ingresar.']);
        exit;
    }

    $_SESSION['usuario_id'] = $usuario['id'];
    $_SESSION['usuario_nombre'] = $usuario['nombre'];

    echo json_encode(['mensaje' => 'Login exitoso']);
    exit;
}
?>