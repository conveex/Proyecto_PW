document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formIngrediente");
    const nombreInput = document.getElementById("txtNombre");
    const unidadInput = document.getElementById("txtUnidad");
    const urlImagenInput = document.getElementById("urlImagen");
    const imagenPreview = document.querySelector(".imagenIngrediente img");

    const placeholderURL =
        "https://media.istockphoto.com/id/1409329028/vector/no-picture-available-placeholder-thumbnail-icon-illustration-design.jpg?s=612x612&w=0&k=20&c=_zOuJu755g2eEUioiOUdz_mHKJQJn-tDgIAhQzyeKUQ=";

    imagenPreview.onerror = () => {
        imagenPreview.src = placeholderURL;
    };

    urlImagenInput.addEventListener("input", () => {
        const url = urlImagenInput.value.trim();
        imagenPreview.src = url || placeholderURL;
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const nombre = nombreInput.value.trim();
        const unidad = unidadInput.value.trim();
        const imagenURL = urlImagenInput.value.trim();

        if (!nombre || !unidad || !imagenURL) {
            alert("Por favor, llena todos los campos.");
            return;
        }

        if (imagenPreview.src === placeholderURL) {
            alert("La imagen no se pudo cargar. Por favor, revisa la URL.");
            return;
        }

        try {

            const data = { nombre, unidad, imagenURL };

            const respuesta = await fetch("sugerirIngrediente.php", {
                method: "POST",
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            let resultado;

            try {
               resultado = await respuesta.json(); 
            } catch (e) {
                throw new Error("Respuesta no valida del servidor (no es JSON).");
            }

            if (respuesta.ok) {
                alert(resultado.mensaje);
                form.reset();
                imagenPreview.src = placeholderURL;
            } else {
                if (respuesta.status === 409) {
                    alert("Ya existe una sugerencia con ese nombre.");
                } else if (respuesta.status === 429) {
                    alert("Has alcanzado el límite de 5 sugerencias activas.");
                } else {
                    alert("Error: " + resultado.error);
                }
            }
        } catch (error) {
            console.error("Error en la solicitud:", error);
            alert("No se pudo conectar con el servidor.");
        }
    });
});