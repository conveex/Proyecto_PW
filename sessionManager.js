// sessionManager.js
const menuBtn = document.getElementById('menuBtn');
const sideMenu = document.getElementById('sideMenu');
const overlay = document.getElementById('overlay');
const menuUser = document.getElementById('menuUser');
const loginLogoutLink = document.getElementById('loginLogoutLink');
const menuOpcionesUsuario = document.getElementById('menuOpcionesUsuario');

window.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('session_status.php', { credentials: 'include' });
    const data = await response.json();

    if (data.sesion_activa) {
      console.log("Usuario autenticado:", data.usuario.nombre);
      menuUser.textContent = data.usuario.nombre;
      loginLogoutLink.textContent = "Cerrar sesión";
      loginLogoutLink.href = "logout.php";
      menuOpcionesUsuario.style.display = 'block';
    } else {
      const local = sessionStorage.getItem('usuarioSesion');
      if (local) {
        const usuario = JSON.parse(local);
        if (usuario.tipo === 'invitado') {
          console.log("Sesión de invitado");
          menuUser.textContent = "Invitado";
          loginLogoutLink.textContent = "Iniciar sesión";
          loginLogoutLink.href = "index.html";
          menuOpcionesUsuario.style.display = 'none';
          return;
        }
      }
      window.location.href = 'index.html';
    }
  } catch (error) {
    console.error("Error verificando sesión", error);
    window.location.href = 'index.html';
  }
});

// Abrir/cerrar menú
menuBtn.addEventListener('click', () => {
  sideMenu.classList.add('open');
  overlay.classList.add('show');
});

overlay.addEventListener('click', () => {
  sideMenu.classList.remove('open');
  overlay.classList.remove('show');
});