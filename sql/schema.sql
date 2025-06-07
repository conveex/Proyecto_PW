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
    id_platillo INT NOT NULL,
    id_ingrediente INT NOT NULL,
    cantidad FLOAT,
    FOREIGN KEY (id_platillo) REFERENCES platillos(id),
    FOREIGN KEY (id_ingrediente) REFERENCES ingredientes(id)
);

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(25) NOT NULL,
    correo VARCHAR(40) NOT NULL UNIQUE,
    contrasena_hash VARCHAR(255) NOT NULL,
    confirmado TINYINT(1) NOT NULL DEFAULT 0,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE confirmaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    token VARCHAR(64) NOT NULL,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    usado TINYINT(1) DEFAULT 0,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE sugerencias_ingredientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    unidad VARCHAR(10),
    imagen_referencia_url VARCHAR(255),
    fecha_subida DATETIME NOT NULL,
    votos_positivos INT DEFAULT 0,
    votos_negativos INT DEFAULT 0,
    id_usuario INT NOT NULL,
    estado ENUM('pendiente', 'aprobada', 'rechazada') DEFAULT 'pendiente',
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);

CREATE TABLE sugerencias_platillos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    preparacion TEXT,
    imagen_url VARCHAR(255),
    fecha_subida DATETIME NOT NULL,
    votos_positivos INT DEFAULT 0,
    votos_negativos INT DEFAULT 0,
    id_usuario INT NOT NULL,
    estado ENUM('pendiente', 'aprobada', 'rechazada') DEFAULT 'pendiente',
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);

CREATE TABLE sugerencias_platillos_ingredientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_sugerencia INT NOT NULL,
    id_ingrediente INT NOT NULL,
    cantidad FLOAT NOT NULL,
    FOREIGN KEY (id_sugerencia) REFERENCES sugerencias_platillos(id),
    FOREIGN KEY (id_ingrediente) REFERENCES ingredientes(id)
);

CREATE TABLE votos_sugerencias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    tipo_sugerencia ENUM('ingrediente', 'platillo') NOT NULL,
    id_sugerencia INT NOT NULL,
    voto ENUM('positivo', 'negativo') NOT NULL,
    fecha_voto DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unico_voto (id_usuario, tipo_sugerencia, id_sugerencia),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
    -- Las claves foraneas para las sugerencias se manejaran por triggers.
);

-- Trigger que 'sustituye' el uso de las llaves foraneas para las sugerencias
CREATE TRIGGER validar_voto_sugerencia
BEFORE INSERT ON votos_sugerencias
FOR EACH ROW
BEGIN
    -- Verificar que la sugerencia existe
    IF NEW.tipo_sugerencia = 'ingrediente' THEN
        IF NOT EXISTS (
            SELECT 1 FROM sugerencias_ingredientes WHERE id = NEW.id_sugerencia
        ) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La sugerencia de ingrediente no existe';
        END IF;
        -- Verificar que el usuario no sea el creador de la sugerencia
        IF EXISTS (
            SELECT 1 FROM sugerencias_ingredientes
            WHERE id = NEW.id_sugerencia AND id_usuario = NEW.id_usuario
        ) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No puedes votar tu propia sugerencia de ingrediente';
        END IF;
    ELSEIF NEW.tipo_sugerencia = 'platillo' THEN
        IF NOT EXISTS (
            SELECT 1 FROM sugerencias_platillos WHERE id = NEW.id_sugerencia
        ) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La sugerencia de platillo no existe';
        END IF;
        -- Verificar que el usuario no sea el creador de la sugerencia
        IF EXISTS (
            SELECT 1 FROM sugerencias_platillos
            WHERE id = NEW.id_sugerencia AND id_usuario = NEW.id_usuario
        ) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No puedes votar tu propia sugerencia de platillo';
        END IF;
    END IF;
    -- Verificar que el usuario no haya votado ya esta sugerencia
    IF EXISTS (
        SELECT 1 FROM votos_sugerencias
        WHERE id_sugerencia = NEW.id_sugerencia
          AND id_usuario = NEW.id_usuario
          AND tipo_sugerencia = NEW.tipo_sugerencia
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ya has votado esta sugerencia';
    END IF;
END;

CREATE TRIGGER actualizar_estado_sugerencia_ingrediente
AFTER INSERT ON votos_sugerencias
FOR EACH ROW
BEGIN
    IF NEW.tipo_sugerencia = 'ingrediente' THEN
        IF NEW.voto = 'positivo' THEN
            UPDATE sugerencias_ingredientes
            SET votos_positivos = votos_positivos + 1
            WHERE id = NEW.id_sugerencia;
        ELSE
            UPDATE sugerencias_ingredientes
            SET votos_negativos = votos_negativos + 1
            WHERE id = NEW.id_sugerencia;
        END IF;

        UPDATE sugerencias_ingredientes
        SET estado = 'aprobada'
        WHERE id = NEW.id_sugerencia
          AND votos_positivos >= 5
          AND estado = 'pendiente';

        INSERT INTO ingredientes (nombre, unidad)
        SELECT si.nombre, si.unidad
        FROM sugerencias_ingredientes si
        WHERE si.id = NEW.id_sugerencia
          AND si.votos_positivos >= 5
          AND si.estado = 'aprobada';
          AND NOT EXISTS (
                SELECT 1 FROM ingredientes i WHERE i.nombre = si.nombre
            );

        UPDATE sugerencias_ingredientes
        SET estado = 'rechazada'
        WHERE id = NEW.id_sugerencia
          AND votos_negativos >= 5
          AND estado = 'pendiente';
    END IF;
END;

CREATE TRIGGER actualizar_estado_sugerencia_platillo
AFTER INSERT ON votos_sugerencias
FOR EACH ROW
BEGIN
    IF NEW.tipo_sugerencia = 'platillo' THEN
        IF NEW.voto = 'positivo' THEN
            UPDATE sugerencias_platillos
            SET votos_positivos = votos_positivos + 1
            WHERE id = NEW.id_sugerencia;
        ELSE
            UPDATE sugerencias_platillos
            SET votos_negativos = votos_negativos + 1
            WHERE id = NEW.id_sugerencia;
        END IF;

        UPDATE sugerencias_platillos
        SET estado = 'aprobada'
        WHERE id = NEW.id_sugerencia
          AND votos_positivos >= 5
          AND estado = 'pendiente';

        UPDATE sugerencias_platillos
        SET estado = 'rechazada'
        WHERE id = NEW.id_sugerencia
          AND votos_negativos >= 5
          AND estado = 'pendiente';
    END IF;
END;

CREATE TRIGGER insertar_platillo_sugerido
AFTER UPDATE ON sugerencias_platillos
FOR EACH ROW
BEGIN
    DECLARE id_nuevo_platillo INT;
    -- Verifica si el estado cambió a 'aprobada'
    IF NEW.estado = 'aprobada' AND OLD.estado <> 'aprobada' THEN

        -- Insertar en la tabla platillos
        INSERT INTO platillos (nombre, descripcion, preparacion, imagen_url)
        VALUES (NEW.nombre, NEW.descripcion, NEW.preparacion, NEW.imagen_url);

        -- Obtener el ID recién insertado
        SET id_nuevo_platillo := LAST_INSERT_ID();

        -- Insertar cada ingrediente asociado a la sugerencia
        INSERT INTO platillos_ingredientes (id_platillo, id_ingrediente, cantidad)
        SELECT id_nuevo_platillo, spi.id_ingrediente, spi.cantidad
        FROM sugerencias_platillos_ingredientes spi
        WHERE spi.id_sugerencia = NEW.id;

    END IF;
END;

CREATE TRIGGER limitar_sugerencias_ingredientes
BEFORE INSERT ON sugerencias_ingredientes
FOR EACH ROW
BEGIN
    DECLARE total INT;

    SELECT COUNT(*) INTO total
    FROM sugerencias_ingredientes
    WHERE id_usuario = NEW.id_usuario AND estado = 'pendiente';

    IF total >= 5 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Has alcanzado el límite de 5 sugerencias activas';
    END IF;
END;

CREATE TRIGGER limitar_sugerencias_platillos
BEFORE INSERT ON sugerencias_platillos
FOR EACH ROW
BEGIN
    DECLARE total INT;

    SELECT COUNT(*) INTO total
    FROM sugerencias_platillos
    WHERE id_usuario = NEW.id_usuario AND estado = 'pendiente';

    IF total >= 5 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Has alcanzado el límite de 5 sugerencias activas';
    END IF;
END;

CREATE PROCEDURE limpiar_sugerencias_expiradas()
BEGIN
    DECLARE fecha_limite DATETIME;
    SET fecha_limite = NOW() - INTERVAL 14 DAY;

    UPDATE sugerencias_ingredientes
    SET estado = 'rechazada'
    WHERE estado = 'pendiente' AND fecha_subida < fecha_limite;

    UPDATE sugerencias_platillos
    SET estado = 'rechazada'
    WHERE estado = 'pendiente' AND fecha_subida < fecha_limite;
END;