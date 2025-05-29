# Recetario Inteligente

Este es un proyecto de un **recetario inteligente**, desarrollado por **Diego Vázquez López** como parte de la materia de **Programación Web**.

El sistema permite consultar distintos platillos y sus ingredientes, filtrarlos según lo que el usuario tiene disponible, y visualizar detalles como su descripción, preparación e imagen.

## 🌐 Tecnologías utilizadas

- HTML, CSS, JavaScript
- PHP (para el backend)
- MySQL (como base de datos)
- db4free.net (base de datos remota)

---

## 📂 Estructura del proyecto

/mi-proyecto
│
├── resources/ # Contenido multimedia que podria ser usado en la página web
│ └── logo.png # Logo no propio para la página web
├── sql/
│ ├── schema.sql # Estructura de la base de datos
│ └── seed.sql # Datos de ejemplo para poblar la BD
├── db_config.php # Configuración de conexión (IGNORADO)
├── db_config.php.example # Plantilla editable para configuración local/remota
├── get_ingredientes.php # Endpoint para obtener los datos de la tabla ingredientes
├── get_platillos.php # Endpoint para obtener los datos de la tabla platillos y relacionados
├── index.html # Página principal
├── script.js # Código JS del frontend
├── styles.css # Estilos para el frontend 
├── README.md # Este archivo
└── .gitignore # Archivos a excluir de Git


---

## 🛠️ Instalación y configuración

1. **Clona el repositorio:**

   ```bash
   git clone https://github.com/usuario/recetario-inteligente.git
   cd recetario-inteligente

2. **Configura la base de datos:**

    Se recomienda usar db4free.net, un servicio gratuito de MySQL para pruebas.

        - Crea una cuenta y base de datos en db4free.net.

        - Accede al panel phpMyAdmin para ejecutar los archivos SQL.

3. **Importa la base de datos:**

    Ejecuta los siguientes archivos desde tu cliente MySQL (por ejemplo phpMyAdmin o línea de comandos):

        - sql/schema.sql: crea las tablas.

        - sql/seed.sql: inserta los datos de ejemplo.

4. **Configura la conexión:**

    Copia el archivo db_config.php.example a db_config.php.

    Edita db_config.php con los datos de conexión (host, usuario, contraseña, nombre de base de datos).

    Nota: Asegúrate de que db_config.php esté en el archivo .gitignore para evitar subir tus credenciales.

**Recomendaciones**

    Usa db4free.net solo para pruebas. No almacenar datos sensibles.

    Este proyecto es de propósito académico.

    Puedes adaptar el sistema para integrarlo con buscadores, filtros más complejos o autenticación de usuarios en futuras versiones.

## 📄 Licencia

Este proyecto está licenciado bajo términos educativos. Puedes reutilizarlo con fines académicos o personales, siempre que se dé crédito al autor original.