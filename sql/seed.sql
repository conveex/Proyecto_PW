USE db_pw_platillos;

INSERT INTO ingredientes (nombre, unidad) VALUES
('Tomate', 'pieza'),
('Cebolla', 'pieza'),
('Pollo', 'gramos'),
('Arroz', 'gramos'),
('Ajo', 'diente'),
('Papa', 'pieza'),
('Zanahoria', 'pieza'),
('Pasta', 'gramos'),
('Queso', 'gramos'),
('Huevo', 'pieza');

INSERT INTO platillos (nombre, descripcion, preparacion, imagen_url) VALUES
('Sopa de verduras', 'Una sopa saludable con vegetales frescos.', 'Hervir los ingredientes por 30 minutos.', 'https://comedera.com/wp-content/uploads/sites/9/2013/05/sopa-de-verduras-1.jpg?resize=1316,740&quality=80'),
('Pollo al horno', 'Pollo asado al horno con especias.', 'Hornear el pollo durante 45 minutos a 180°C.', 'https://cocinemosjuntos.com.co/media/mageplaza/blog/post/t/i/tips-para-preparar-pollo-al-horno-jugoso-y-perfecto_1_.jpg'),
('Arroz con pollo', 'Platillo tradicional con arroz y pollo.', 'Cocinar arroz y añadir pollo previamente cocido.', 'https://i.pinimg.com/564x/16/65/af/1665af6b3ff5295ee5da3e46a40217a2.jpg'),
('Pasta al pesto', 'Pasta con salsa de albahaca y ajo.', 'Cocer pasta y mezclar con pesto.', 'https://www.lavanguardia.com/files/og_thumbnail/uploads/2020/05/29/5ed11fb61d750.jpeg'),
('Huevos revueltos', 'Huevos cocidos con cebolla.', 'Batir los huevos y cocer con cebolla picada.', 'https://okdiario.com/img/2018/07/17/receta-de-huevos-revueltos-con-cebolla.jpg');

-- Sopa de verduras
INSERT INTO platillos_ingredientes (id_platillo, id_ingrediente, cantidad) VALUES
(1, 1, 2),  -- Tomate
(1, 2, 1),  -- Cebolla
(1, 6, 1),  -- Papa
(1, 7, 1),  -- Zanahoria
(1, 5, 1);  -- Ajo

-- Pollo al horno
INSERT INTO platillos_ingredientes (id_platillo, id_ingrediente, cantidad) VALUES
(2, 3, 250),
(2, 2, 1),
(2, 5, 2);

-- Arroz con pollo
INSERT INTO platillos_ingredientes (id_platillo, id_ingrediente, cantidad) VALUES
(3, 3, 200),
(3, 4, 150),
(3, 2, 1);

-- Pasta al pesto
INSERT INTO platillos_ingredientes (id_platillo, id_ingrediente, cantidad) VALUES
(4, 8, 150),
(4, 5, 1),
(4, 9, 50);

-- Huevos revueltos
INSERT INTO platillos_ingredientes (id_platillo, id_ingrediente, cantidad) VALUES
(5, 10, 2),
(5, 2, 1);