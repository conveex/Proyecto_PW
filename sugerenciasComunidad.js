let votosUsuario = [];
let paginaActual = 1;
const porPagina = 10;
let totalSugerencias = 0;

document.addEventListener('DOMContentLoaded', async () => {
  await cargarVotosUsuario();

  document.getElementById('filtroTipo').addEventListener('change', () => {
    paginaActual = 1;
    cargarSugerencias();
  });

  document.getElementById('filtroOrden').addEventListener('change', () => {
    paginaActual = 1;
    cargarSugerencias();
  });

  document.getElementById('prevPage').addEventListener('click', () => {
    if (paginaActual > 1) {
      paginaActual--;
      cargarSugerencias();
    }
  });

  document.getElementById('nextPage').addEventListener('click', () => {
    const maxPagina = Math.ceil(totalSugerencias / porPagina);
    if (paginaActual < maxPagina) {
      paginaActual++;
      cargarSugerencias();
    }
  });

  cargarSugerencias();

});

async function cargarVotosUsuario() {
  try {
    const resp = await fetch('get_votos_usuario.php');
    votosUsuario = await resp.json();
  } catch (error) {
    console.error('Error al cargar votos del usuario:', error);
    votosUsuario = [];
  }
}

async function cargarSugerencias() {
  const contenedor = document.getElementById('contenedorSugerencias');
  contenedor.innerHTML = '';

  const respIngredientes = await fetch('get_sugerencias_ingredientes.php');
  const ingredientes = await respIngredientes.json();

  const respPlatillos = await fetch('get_sugerencias_platillos.php');
  const platillos = await respPlatillos.json();

  const sugerencias = [
    ...ingredientes.map(s => ({ tipo: 'ingrediente', ...s })),
    ...platillos.map(s => ({ tipo: 'platillo', ...s }))
  ];

  const filtroTipo = document.getElementById('filtroTipo').value;
  const sugerenciasFiltradas = sugerencias.filter(s => s.tipo === filtroTipo);

  const filtroOrden = document.getElementById('filtroOrden').value;
  sugerenciasFiltradas.sort((a, b) => {
    switch (filtroOrden) {
      case 'recientes':
        return new Date(b.fecha_subida) - new Date(a.fecha_subida);
      case 'antiguas':
        return new Date(a.fecha_subida) - new Date(b.fecha_subida);
      case 'mas_votos_positivos':
        return b.votos_positivos - a.votos_positivos;
      case 'mas_votos_negativos':
        return b.votos_negativos - a.votos_negativos;
      case 'alfabetico_asc':
        return a.nombre.localeCompare(b.nombre);
      case 'alfabetico_desc':
        return b.nombre.localeCompare(a.nombre);
      default:
        return 0;
    }
  });

  totalSugerencias = sugerenciasFiltradas.length;

  const inicio = (paginaActual - 1) * porPagina;
  const paginadas = sugerenciasFiltradas.slice(inicio, inicio + porPagina);

  if (paginadas.length === 0) {
    contenedor.innerHTML = `<p>No hay sugerencias para mostrar en esta página.</p>`;
  }

  paginadas.forEach(s => {
    const card = document.createElement('div');
    card.className = 'sugerencia-card';
    card.style.padding = '10px';
    card.style.border = '1px solid #ccc';
    card.style.borderRadius = '5px';
    card.style.backgroundColor = '#f9f9f9';

    const votoUsuario = votosUsuario.find(v =>
      v.tipo_sugerencia === s.tipo && Number(v.id_sugerencia) === Number(s.id)
    );

    const votoPositivo = votoUsuario?.voto === 'positivo';
    const votoNegativo = votoUsuario?.voto === 'negativo';

    let contenidoHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <h3 style="margin: 0;">${s.nombre}</h3>
        <small style="font-size: 0.9em; color: #555;">por ${s.usuario_nombre}</small>
      </div>
    `;

    if (s.tipo === 'ingrediente') {
      contenidoHTML += `
        <div style="display: flex; justify-content: space-between;">
          <div style="flex: 1; padding-right: 10px; text-align: left;">
            <p><strong>Tipo:</strong> Ingrediente</p>
            <p><strong>Unidad:</strong> ${s.unidad}</p>
            <p><strong>Fecha subida:</strong> ${new Date(s.fecha_subida).toLocaleDateString()}</p>
            <div style="margin-top: 10px; justify-content: center;">
              <button onclick="votarSugerencia(${s.id}, 'ingrediente', 'positivo', this)"
                class="voto-btn ${votoPositivo ? 'activo-positivo' : ''}" style="cursor:pointer;">👍 <span>${s.votos_positivos}</span></button>
              <button onclick="votarSugerencia(${s.id}, 'ingrediente', 'negativo', this)"
                class="voto-btn ${votoNegativo ? 'activo-negativo' : ''}" style="cursor:pointer; margin-left:10px;">👎 <span>${s.votos_negativos}</span></button>
            </div>
          </div>
          <div style="flex-shrink: 0;">
            <img src="${s.imagen_referencia_url}" alt="Imagen Ingrediente" class="img-sugerencia">
          </div>
        </div>
      `;
    } else if (s.tipo === 'platillo') {
      const listaIngredientes = s.ingredientes.map(ing =>
        `<li>${ing.nombre} (${ing.unidad}) - ${ing.cantidad}</li>`
      ).join('');

      contenidoHTML += `
        <div style="display: flex; justify-content: space-between;">
          <div style="flex: 1; padding-right: 10px; text-align: left;">
            <p><strong>Tipo:</strong> Platillo</p>
            <p><strong>Descripción:</strong> ${s.descripcion}</p>
            <p><strong>Preparación:</strong> ${s.preparacion}</p>
            <details>
              <summary class="summary-clickable"><strong>Ingredientes</strong></summary>
              <ul>${listaIngredientes}</ul>
            </details>
            <p><strong>Fecha subida:</strong> ${new Date(s.fecha_subida).toLocaleDateString()}</p>
          </div>
          <div style="flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
            <img src="${s.imagen_url}" alt="Imagen Platillo" class="img-sugerencia">
          </div>
        </div>
        <div style="margin-top: 10px; justify-content: center;">
          <button onclick="votarSugerencia(${s.id}, 'platillo', 'positivo', this)"
            class="voto-btn ${votoPositivo ? 'activo-positivo' : ''}" style="cursor:pointer;">👍 <span>${s.votos_positivos}</span></button>
          <button onclick="votarSugerencia(${s.id}, 'platillo', 'negativo', this)"
            class="voto-btn ${votoNegativo ? 'activo-negativo' : ''}" style="cursor:pointer; margin-left:10px;">👎 <span>${s.votos_negativos}</span></button>
        </div>        
      `;
    }

    card.innerHTML = contenidoHTML;
    contenedor.appendChild(card);
  });

  actualizarEstadoPaginacion();
}

function actualizarEstadoPaginacion() {
  const maxPagina = Math.ceil(totalSugerencias / porPagina);
  const btnPrev = document.getElementById('prevPage');
  const btnNext = document.getElementById('nextPage');

  btnPrev.disabled = paginaActual <= 1;
  btnNext.disabled = paginaActual >= maxPagina;

  const infoPagina = document.getElementById('infoPagina');
  if (infoPagina) {
    infoPagina.textContent = `Página ${paginaActual} de ${maxPagina}`;
  }
}

async function votarSugerencia(idSugerencia, tipoSugerencia, voto, boton) {
  const votoExistente = votosUsuario.find(v => v.tipo_sugerencia === tipoSugerencia && v.id_sugerencia === idSugerencia);

  if (votoExistente && votoExistente.voto === voto) {
    const resp = await fetch('eliminar_voto_sugerencia.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_sugerencia: idSugerencia,
        tipo_sugerencia: tipoSugerencia
      })
    });

    const data = await resp.json();

    if (data.success) {
      const span = boton.querySelector('span');
      span.textContent = parseInt(span.textContent) - 1;
      boton.classList.remove('activo-positivo', 'activo-negativo');

      votosUsuario = votosUsuario.filter(v => !(v.tipo_sugerencia === tipoSugerencia && v.id_sugerencia === idSugerencia));
    } else {
      alert(`Error al eliminar voto: ${data.message}`);
    }

  } else {
    const resp = await fetch('votar_sugerencia.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_sugerencia: idSugerencia,
        tipo_sugerencia: tipoSugerencia,
        voto: voto
      })
    });

    const data = await resp.json();

    if (data.success) {
      const span = boton.querySelector('span');
      span.textContent = parseInt(span.textContent) + 1;

      const contenedor = boton.parentElement;
      const botones = contenedor.querySelectorAll('button');
      botones.forEach(btn => {
        btn.classList.remove('activo-positivo', 'activo-negativo');
      });

      if (voto === 'positivo') {
        boton.classList.add('activo-positivo');
      } else {
        boton.classList.add('activo-negativo');
      }

      const votoPrevio = votosUsuario.find(v => v.tipo_sugerencia === tipoSugerencia && v.id_sugerencia === idSugerencia);
      if (votoPrevio) {
        botones.forEach(btn => {
          if (votoPrevio.voto === 'positivo' && btn.textContent.includes('👍') && btn !== boton) {
            const spanBtn = btn.querySelector('span');
            spanBtn.textContent = parseInt(spanBtn.textContent) - 1;
          }
          if (votoPrevio.voto === 'negativo' && btn.textContent.includes('👎') && btn !== boton) {
            const spanBtn = btn.querySelector('span');
            spanBtn.textContent = parseInt(spanBtn.textContent) - 1;
          }
        });

        votosUsuario = votosUsuario.filter(v => !(v.tipo_sugerencia === tipoSugerencia && v.id_sugerencia === idSugerencia));
      }

      votosUsuario.push({
        tipo_sugerencia: tipoSugerencia,
        id_sugerencia: idSugerencia,
        voto: voto
      });

      if (data.estado_actualizado === 'aprobada' || data.estado_actualizado === 'rechazada') {
        alert(`La sugerencia ha sido ${data.estado_actualizado}. Se actualizará la lista.`);
        location.reload();
      }
    } else {
      alert(`Error al votar: ${data.error}`);
    }
  }
}