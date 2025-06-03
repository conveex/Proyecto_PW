<?php
session_start();
session_unset();
session_destroy();
echo json_encode(['mensaje' => 'Sesión cerrada']);
header("Location: index.html");
?>