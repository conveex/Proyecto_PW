const input = document.getElementById('inputIngrediente');
const sugerencias = document.getElementById('sugerencias');
const seleccionados = document.getElementById('ingredientesSeleccionados');
const btnSugerir = document.getElementById('sugerirPlatillo');
const urlImagenInput = document.getElementById("urlImagen");
const imagenPreview = document.querySelector(".imagenIngrediente img");
const nombreInput = document.getElementById('txtNombre');
const descripcionInput = document.getElementById('txtDescripcion');
const preparacionInput = document.getElementById('txtPreparacion');
const form = document.getElementById('formPlatillo');

let ingredientesDisponibles = [];
let ingredientesSeleccionados = [];

const placeholderURL =
    "https://media.istockphoto.com/id/1409329028/vector/no-picture-available-placeholder-thumbnail-icon-illustration-design.jpg?s=612x612&w=0&k=20&c=_zOuJu755g2eEUioiOUdz_mHKJQJn-tDgIAhQzyeKUQ=";

imagenPreview.onerror = () => {
    imagenPreview.src = placeholderURL;
};

urlImagenInput.addEventListener("input", () => {
    const url = urlImagenInput.value.trim();
    imagenPreview.src = url || placeholderURL;
});

fetch('get_ingredientes_unidades.php')
    .then(res => res.json())
    .then(data => ingredientesDisponibles = data)
    .catch(err => console.error('Error al cargar ingredientes:', err));

input.addEventListener('input', () => {
    const valor = input.value.toLowerCase();
    sugerencias.innerHTML = '';
    if (valor.length === 0) return;

    const filtrados = ingredientesDisponibles.filter(ing => ing.nombre.toLowerCase().includes(valor));
    filtrados.forEach(ing => {
        const div = document.createElement('div');
        div.textContent = ing.nombre;
        div.classList.add('sugerencia-item');
        div.onclick = () => agregarIngrediente(ing);
        sugerencias.appendChild(div);
    });
});

function agregarIngrediente(ingrediente) {
    if (!ingredientesSeleccionados.some(i => i.nombre === ingrediente.nombre)) {
        ingredientesSeleccionados.push({
            nombre: ingrediente.nombre,
            unidad: ingrediente.unidad,
            cantidad: ''
        });
        actualizarListaSeleccionados();
    }
    input.value = '';
    sugerencias.innerHTML = '';
}

function actualizarListaSeleccionados() {
    seleccionados.innerHTML = '';
    ingredientesSeleccionados.forEach((ing, index) => {
        const li = document.createElement('li');
        const nombreUnidad = document.createElement('span');

        nombreUnidad.textContent = `${ing.nombre} (${ing.unidad}) - Cantidad: `;
        li.appendChild(nombreUnidad);

        const inputCantidad = document.createElement('input');
        inputCantidad.type = 'number';
        inputCantidad.min = '1';
        inputCantidad.step = 'any';
        inputCantidad.value = ing.cantidad;
        inputCantidad.style.width = '60px';
        inputCantidad.oninput = (e) => {
            ingredientesSeleccionados[index].cantidad = e.target.value;
        };

        li.appendChild(inputCantidad);

        const cerrar = document.createElement('span');
        cerrar.textContent = '×';
        cerrar.classList.add('cerrar');
        cerrar.onclick = () => eliminarIngrediente(ing.nombre);

        li.appendChild(cerrar);
        seleccionados.appendChild(li);
    });
}

function eliminarIngrediente(nombre) {
    ingredientesSeleccionados = ingredientesSeleccionados.filter(i => i.nombre !== nombre);
    actualizarListaSeleccionados();
}

btnSugerir.addEventListener('click', async (event) => {
    event.preventDefault();

    const nombre = nombreInput.value.trim();
    const descripcion = descripcionInput.value.trim();
    const preparacion = preparacionInput.value.trim();
    const imagenURL = urlImagenInput.value.trim();

    if (!nombre || !descripcion || !preparacion || !imagenURL) {
        alert('Por favor, completa todos los campos del formulario.');
        return;
    }

    if (ingredientesSeleccionados.length === 0) {
        alert('Selecciona al menos un ingrediente.');
        return;
    }

    const ingredientesValidos = ingredientesSeleccionados.every(ing => parseFloat(ing.cantidad) > 0);
    if (!ingredientesValidos) {
        alert('Todos los ingredientes seleccionados deben tener una cantidad mayor a 0.');
        return;
    }

    if (imagenPreview.src === placeholderURL) {
        alert("La imagen no se pudo cargar. Por favor, revisa la URL.");
        return;
    }

    btnSugerir.disabled = true;

    try {

        const payload = {
            nombre,
            descripcion,
            preparacion,
            imagen_url: imagenURL,
            ingredientes: ingredientesSeleccionados.map(ing => ({
                nombre: ing.nombre,
                cantidad: parseFloat(ing.cantidad)
            }))
        };

        const respuesta = await fetch('sugerirPlatillo.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(payload)
        });

        let resultado;

        try {
            resultado = await respuesta.json();
        } catch (e) {
            throw new Error("Respuesta no valida del servidor (no es JSON).");
        }

        if (resultado.success) {
            alert(resultado.message || 'Platillo sugerido con éxito.');
            form.reset();
            imagenPreview.src = placeholderURL;
            ingredientesSeleccionados = [];
            actualizarListaSeleccionados();
        } else {
            if(respuesta.status === 409){
                alert("Ya existe una sugerencia con ese nombre.");
            } else if(respuesta.status === 429){
                alert("Has alcanzado el límite de 5 sugerencias activas.")
            } else {
                alert('Error: ' + (resultado.error || resultado.message || 'Error desconocido.'));
            }
        }
    } catch (error) {
        console.error('Error en la solicitud:', error);
        alert('Ocurrió un error al enviar la sugerencia.');
    } finally {
        btnSugerir.disabled = false;
    }
});

form.addEventListener('submit', (event) => {
    event.preventDefault();
});