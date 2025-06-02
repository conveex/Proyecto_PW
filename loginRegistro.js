const loginHTML = `
  <h2>Iniciar Sesión</h2>
  <form id="formLogin">
    <label for="loginUsuario">Usuario o correo:</label><br/>
    <input type="text" id="loginUsuario" name="usuario" maxlength="40" required /><br/><br/>
    
    <label for="loginContrasena">Contraseña:</label><br/>
    <input type="password" id="loginContrasena" name="contrasena" minlength="6" maxlength="50" required /><br/><br/>
    
    <button type="submit">Entrar</button>
  </form>
  <p>¿No tienes cuenta? <a href="#" id="linkRegistro" class="enlace">Regístrate aquí</a></p>
  <div id="mensajeLogin" style="color:red; margin-top:10px;"></div>
`;

const registroHTML = `
  <h2>Registro</h2>
  <form id="formRegistro">
    <label for="regNombre">Usuario:</label><br/>
    <input type="text" id="regNombre" name="nombre" maxlength="25" required /><br/><br/>

    <label for="regCorreo">Correo electrónico:</label><br/>
    <input type="email" id="regCorreo" name="correo" maxlength="40" required /><br/><br/>

    <label for="regContrasena">Contraseña:</label><br/>
    <input type="password" id="regContrasena" name="contrasena" minlength="6" maxlength="50" required /><br/><br/>

    <label for="regConfirmar">Confirmar contraseña:</label><br/>
    <input type="password" id="regConfirmar" name="confirmar" minlength="6" maxlength="50" required /><br/><br/>

    <button type="submit">Registrarse</button>
  </form>
  <p>¿Ya tienes cuenta? <a href="#" id="linkLogin" class="enlace">Inicia sesión aquí</a></p>
  <div id="mensajeRegistro" style="color:red; margin-top:10px;"></div>
`;

const mensajeRevisaCorreo = `
  <h2>Registro exitoso</h2>
  <p>Por favor revisa tu correo para confirmar tu cuenta.</p>
  <p>Serás redirigido a la página de inicio de sesión...</p>
`;

const contenedor = document.getElementById('contenedor_vistas');

function cargarLogin() {
  contenedor.innerHTML = loginHTML;
  document.getElementById('linkRegistro').onclick = e => {
    e.preventDefault();
    cargarRegistro();
  };
  document.getElementById('formLogin').onsubmit = manejarLogin;
}

function cargarRegistro() {
  contenedor.innerHTML = registroHTML;
  document.getElementById('linkLogin').onclick = e => {
    e.preventDefault();
    cargarLogin();
  };
  document.getElementById('formRegistro').onsubmit = manejarRegistro;
}

async function manejarLogin(e) {
  e.preventDefault();
  const usuario = document.getElementById('loginUsuario').value.trim();
  const contrasena = document.getElementById('loginContrasena').value.trim();
  const msg = document.getElementById('mensajeLogin');

  if (!usuario || usuario.length > 40) {
    msg.textContent = 'Usuario o correo inválido.';
    return;
  }
  if (contrasena.length < 6 || contrasena.length > 50) {
    msg.textContent = 'Contraseña debe tener entre 6 y 50 caracteres.';
    return;
  }

  msg.textContent = 'Validando...';

  try {
    const response = await fetch('login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ usuario, contrasena })
    });

    if (!response.ok) {
      const errorData = await response.json();
      msg.textContent = errorData.error || 'Error en login';
      return;
    }

    const data = await response.json();
    alert(data.mensaje);
    window.location.href = 'recetario.html';
  } catch (error) {
    msg.textContent = 'Error de conexión.';
  }
}

// Validación y manejo del registro
async function manejarRegistro(e) {
  e.preventDefault();
  const nombre = document.getElementById('regNombre').value.trim();
  const correo = document.getElementById('regCorreo').value.trim();
  const contrasena = document.getElementById('regContrasena').value;
  const confirmar = document.getElementById('regConfirmar').value;
  const msg = document.getElementById('mensajeRegistro');

  if (!nombre || nombre.length > 25) {
    msg.textContent = 'El usuario debe tener máximo 25 caracteres.';
    return;
  }
  if (!correo || correo.length > 40 || !correo.includes('@')) {
    msg.textContent = 'Correo inválido.';
    return;
  }
  if (contrasena.length < 6 || contrasena.length > 50) {
    msg.textContent = 'La contraseña debe tener entre 6 y 50 caracteres.';
    return;
  }
  if (contrasena !== confirmar) {
    msg.textContent = 'Las contraseñas no coinciden.';
    return;
  }

  msg.textContent = 'Registrando...';

  try {
    const response = await fetch('registro.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ nombre, correo, contrasena })
    });

    const texto = await response.text();

    if (response.ok) {
      contenedor.innerHTML = `
        <h2>Registro exitoso</h2>
        <p>Por favor revisa tu correo para confirmar tu cuenta.</p>
        <p>Serás redirigido a la página de inicio de sesión...</p>
      `;
      setTimeout(cargarLogin, 5000);
    } else {
      msg.textContent = texto;
    }
  } catch (error) {
    msg.textContent = 'Error de conexión.';
  }
}

cargarLogin();