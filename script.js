// --- CONFIGURACIÓN ---
const input = document.getElementById('inputIngrediente');
const sugerencias = document.getElementById('sugerencias');
const seleccionados = document.getElementById('ingredientesSeleccionados');
const btnBuscar = document.getElementById('btnBuscarPlatillos');
const resultados = document.getElementById('resultados');

let ingredientesDisponibles = [];
let ingredientesSeleccionados = [];

// --- CARGAR INGREDIENTES DESDE PHP ---
fetch('get_ingredientes.php')
  .then(res => res.json())
  .then(data => ingredientesDisponibles = data.map(ing => ing.nombre))
  .catch(err => console.error('Error al cargar ingredientes:', err));

// --- BÚSQUEDA Y SELECCIÓN DE INGREDIENTES ---
input.addEventListener('input', () => {
  const valor = input.value.toLowerCase();
  sugerencias.innerHTML = '';
  if (valor.length === 0) return;

  const filtrados = ingredientesDisponibles.filter(ing => ing.toLowerCase().includes(valor));
  filtrados.forEach(nombre => {
    const div = document.createElement('div');
    div.textContent = nombre;
    div.classList.add('sugerencia-item');
    div.onclick = () => agregarIngrediente(nombre);
    sugerencias.appendChild(div);
  });
});

function agregarIngrediente(nombre) {
  if (!ingredientesSeleccionados.includes(nombre)) {
    ingredientesSeleccionados.push(nombre);
    actualizarListaSeleccionados();
  }
  input.value = '';
  sugerencias.innerHTML = '';
}

function actualizarListaSeleccionados() {
  seleccionados.innerHTML = '';
  ingredientesSeleccionados.forEach(nombre => {
    const li = document.createElement('li');
    li.textContent = nombre;

    const cerrar = document.createElement('span');
    cerrar.textContent = '×';
    cerrar.classList.add('cerrar');
    cerrar.onclick = () => eliminarIngrediente(nombre);

    li.appendChild(cerrar);
    seleccionados.appendChild(li);
  });
}

function eliminarIngrediente(nombre) {
  ingredientesSeleccionados = ingredientesSeleccionados.filter(i => i !== nombre);
  actualizarListaSeleccionados();
}

// --- CONSULTA A PHP ---
btnBuscar.addEventListener('click', () => {
  if (ingredientesSeleccionados.length === 0) {
    alert('Selecciona al menos un ingrediente.');
    return;
  }

  resultados.innerHTML = '<p>Cargando resultados...</p>';

  fetch('get_platillos.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ingredientes: ingredientesSeleccionados })
  })
  .then(res => res.json())
  .then(data => mostrarPlatillos(data))
  .catch(err => {
    resultados.innerHTML = '<p>Error al obtener los datos.</p>';
    console.error(err);
  });
});

function mostrarPlatillos(platillos) {
  resultados.innerHTML = '';
  if (platillos.length === 0) {
    resultados.innerHTML = '<p>No se encontraron platillos.</p>';
    return;
  }

  platillos.forEach(platillo => {
    const card = document.createElement('div');
    card.classList.add('card');

    const img = document.createElement('img');
    img.src = platillo.imagen_url;
    img.alt = platillo.nombre;

    const titulo = document.createElement('h4');
    titulo.textContent = platillo.nombre;

    const boton = document.createElement('button');
    boton.textContent = 'Más info';
    boton.onclick = () => mostrarMasInfo(card, platillo);

    card.appendChild(img);
    card.appendChild(titulo);
    card.appendChild(boton);
    resultados.appendChild(card);
  });
}

function mostrarMasInfo(card, platillo) {
  if (card.classList.contains('expandida')) return;
  card.classList.add('expandida');

  const cerrar = document.createElement('span');
  cerrar.textContent = '×';
  cerrar.classList.add('cerrar');
  cerrar.onclick = () => cerrarInfo(card);

  const info = document.createElement('div');
  info.classList.add('info-detallada');
  info.innerHTML = `
    <h5>Preparación:</h5>
    <p>${platillo.preparacion}</p>
    <h5>Ingredientes:</h5>
    <ul>
      ${platillo.ingredientes.map(i => `<li>${i.cantidad} ${i.unidad} de ${i.nombre}</li>`).join('')}
    </ul>
  `;

  card.appendChild(cerrar);
  card.appendChild(info);
}

function cerrarInfo(card) {
  card.classList.remove('expandida');
  const info = card.querySelector('.info-detallada');
  const cerrar = card.querySelector('.cerrar');
  if (info) card.removeChild(info);
  if (cerrar) card.removeChild(cerrar);
}