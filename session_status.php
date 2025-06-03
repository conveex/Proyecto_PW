<?php
session_start();
header('Content-Type: application/json');

if (isset($_SESSION['usuario_id']) && isset($_SESSION['usuario_nombre'])) {
    echo json_encode([
        'sesion_activa' => true,
        'usuario' => [
            'id' => $_SESSION['usuario_id'],
            'nombre' => $_SESSION['usuario_nombre'],
            'tipo' => 'usuario'
        ]
    ]);
} else {
    echo json_encode(['sesion_activa' => false]);
}
?>