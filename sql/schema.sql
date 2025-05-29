CREATE DATABASE IF NOT EXISTS db_pw_platillos;
USE db_pw_platillos;

CREATE TABLE ingredientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    unidad VARCHAR(10)
);

CREATE TABLE platillos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    preparacion TEXT,
    imagen_url VARCHAR(255)
);

CREATE TABLE platillos_ingredientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_platillo INT,
    id_ingrediente INT,
    cantidad FLOAT,
    FOREIGN KEY (id_platillo) REFERENCES platillos(id),
    FOREIGN KEY (id_ingrediente) REFERENCES ingredientes(id)
);