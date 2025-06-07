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

```plaintext
recetario-inteligente/
├── resources/
│   └── logo.png              # Logo (no propio) utilizado en la página
├── sql/
│   ├── schema.sql            # Estructura de la base de datos
│   └── seed.sql              # Datos de ejemplo
├── vendor/
│   └── PHPMailer                   # Libreria requerida para verificación de email (IGNORADO por Git)
├── confirmar.php                   # Verifica el token del correo
├── db_config.php                   # Configuración de conexión (IGNORADO por Git)
├── db_config.php.example           # Plantilla editable para conexión
├── get_ingredientes_unidades.php   # Devuelve los ingredientes con su unidad de medida en JSON
├── get_ingredientes.php            # Devuelve los ingredientes en JSON
├── get_platillos.php               # Devuelve los platillos con sus datos
├── index.html                      # Página principal
├── login.php                       # Verifica credenciales con la BD
├── loginRegistro.js                # Lógica de IU login/registro
├── logout.php                      # Cierra la sesión de usuario o invitado
├── recetario.html                  # Página de busqueda de platillos
├── registro.php                    # Registra datos y envia correo (IGNORADO por Git)
├── registro.php.example            # Plantilla editable para registro
├── script.js                       # Lógica del frontend para el recetario
├── session_status.php              # Verifica el estado de la sesion, obtiene el usuario o indica invitado
├── sessionManager.js               # Logica frontend para obtener la sesión y generar menú de usuario/invitado
├── styles.css                      # Estilos CSS
├── sugerenciasComunidad.html       # Página para ver las sugerencias de la comunidad 
├── sugerirIngrediente.html         # Página para sugerir ingredientes
├── sugerirIngrediente.php          # Verifica y sube la sugerencia a la BD
├── sugerirPlatillo.html            # Página para sugerir platillos
├── sugerirPlatillo.js              # Lógica de la IU en las sugerencias y manejo de excepciones para el usuario
├── sugerirPlatillo.php             # Verifica y sube la sugerencia a la BD
├── sugIngrediente.js               # Lógica de la IU en las sugerencias y manejo de excepciones para el usuario
├── .gitignore                      # Archivos y carpetas excluidos de Git
└── README.md                       # Este archivo
```

---

## 🛠️ Instalación y configuración

1. **Clona el repositorio:**

   ```bash
   git clone https://github.com/conveex/Proyecto_PW.git
   cd recetario-inteligente
   ```

2. **Configura la base de datos:**

   Se recomienda usar [db4free.net](https://www.db4free.net/), un servicio gratuito de MySQL para pruebas:

   - Registra una cuenta y crea una base de datos.
   - Accede al panel phpMyAdmin y ejecuta los archivos `.sql`.

3. **Importa la base de datos:**

   Usa phpMyAdmin o tu cliente MySQL para ejecutar:

   - `sql/schema.sql`: crea las tablas.
   - `sql/seed.sql`: inserta los datos de ejemplo.

4. **Configura la conexión:**

   - Copia `db_config.php.example` como `db_config.php`.
   - Edita con tus datos de conexión (`host`, `usuario`, `contraseña`, `nombreBD`).
   - Asegúrate de que `db_config.php` esté en `.gitignore` para evitar subir credenciales.

5. **Descarga PHPMailer y coloca en directorio:**

   - Entra a https://github.com/PHPMailer/PHPMailer y descarga el .zip.
   - Descomprime en la subcarpeta del proyecto vendor.
   - Renombra la carpeta resultante a PHPMailer.

---

## ✅ Recomendaciones

- Usa `db4free.net` solo para fines de prueba. **No almacenes información sensible**.
- Este proyecto es con fines académicos. 
- Puedes ampliarlo para incluir autenticación, filtros avanzados o carga de imágenes.

---

## 📄 Licencia

Este proyecto está licenciado con fines educativos. Puedes reutilizarlo para proyectos académicos o personales, dando el crédito correspondiente a **Diego Vázquez López**.
