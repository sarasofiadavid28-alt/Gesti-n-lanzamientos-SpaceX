// =============================================================================
//  🚀  SPACEX FLIGHT CONTROL CENTER
//  Centro de Control de Lanzamientos Espaciales
//
//  Proyecto de Desempeño · SENA Formación Complementaria 3406211
//  Módulo: JavaScript · Unidades 1 a 7
// =============================================================================


// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 1 — ALMACÉN DE DATOS
// ─────────────────────────────────────────────────────────────────────────────

const lanzamientos = [];
let contadorId   = 1;
let filtroActivo = "todos";


// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 2 — FUNCIONES UTILITARIAS
// ─────────────────────────────────────────────────────────────────────────────

function generarId() {
    const id = "SX-" + String(contadorId).padStart(4, "0");
    contadorId++;
    return id;
}

function formatearFecha(fechaIso) {
    if (!fechaIso) return "—";
    const fecha = new Date(fechaIso);
    const d = String(fecha.getDate()).padStart(2, "0");
    const m = String(fecha.getMonth() + 1).padStart(2, "0");
    const y = fecha.getFullYear();
    const hh = String(fecha.getHours()).padStart(2, "0");
    const mm = String(fecha.getMinutes()).padStart(2, "0");
    return d + "/" + m + "/" + y + " · " + hh + ":" + mm;
}

function etiquetaCohete(valor) {
    if (valor === "falcon")       return "FALCON 9";
    if (valor === "falcon-heavy") return "FALCON HEAVY";
    if (valor === "starship")     return "STARSHIP";
    return valor.toUpperCase();
}


// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 3 — RENDERIZADO DE TARJETAS
// ─────────────────────────────────────────────────────────────────────────────

function crearTarjeta(lanzamiento) {
    const card = document.createElement("article");
    card.className = "organism-launch-card organism-launch-card--" + lanzamiento.estado;
    card.setAttribute("data-id",     lanzamiento.id);
    card.setAttribute("data-tipo",   lanzamiento.tipoCohete);
    card.setAttribute("data-estado", lanzamiento.estado);

    const header = document.createElement("div");
    header.className = "molecule-card-header";
    header.innerHTML =
        '<span class="molecule-card-header__id atom-mono">' + lanzamiento.id + '</span>' +
        '<span class="atom-badge atom-badge--' + lanzamiento.estado + '">' + lanzamiento.estado.toUpperCase() + '</span>';

    const body = document.createElement("div");
    body.className = "molecule-card-body";
    body.innerHTML =
        '<div class="molecule-card-body__name">'      + lanzamiento.nombreSerie               + '</div>' +
        '<div class="molecule-card-body__type">'      + etiquetaCohete(lanzamiento.tipoCohete) + '</div>' +
        '<div class="molecule-card-body__objective">' + lanzamiento.objetivo                   + '</div>' +
        '<div class="molecule-card-body__date atom-mono">' + formatearFecha(lanzamiento.fecha) + '</div>';

    const footer = document.createElement("div");
    footer.className = "molecule-card-footer";

    const btnEditar = document.createElement("button");
    btnEditar.className = "atom-btn atom-btn--secondary atom-btn--sm";
    btnEditar.setAttribute("data-action", "editar");
    btnEditar.setAttribute("data-id", lanzamiento.id);
    btnEditar.textContent = "EDITAR";
    btnEditar.addEventListener("click", function() { activarEdicion(lanzamiento.id); });

    const btnCancelar = document.createElement("button");
    btnCancelar.className = "atom-btn atom-btn--danger atom-btn--sm";
    btnCancelar.setAttribute("data-action", "cancelar");
    btnCancelar.setAttribute("data-id", lanzamiento.id);
    btnCancelar.textContent = "CANCELAR";
    btnCancelar.addEventListener("click", function() { cancelarLanzamiento(lanzamiento.id); });

    footer.appendChild(btnEditar);
    footer.appendChild(btnCancelar);

    card.appendChild(header);
    card.appendChild(body);
    card.appendChild(footer);

    // Sección 4: hover con addEventListener (no :hover CSS)
    card.addEventListener("mouseover", function() { card.classList.add("is-hovered"); });
    card.addEventListener("mouseout",  function() { card.classList.remove("is-hovered"); });

    return card;
}

function renderizarGrid() {
    const grid        = document.getElementById("grid-lanzamientos");
    const estadoVacio = document.getElementById("estado-vacio");

    // Eliminar tarjetas previas sin tocar el estado-vacio
    const tarjetas = grid.querySelectorAll(".organism-launch-card");
    tarjetas.forEach(function(t) { t.remove(); });

    // Aplicar filtro
    let visibles;
    if (filtroActivo === "todos") {
        visibles = lanzamientos;
    } else {
        visibles = lanzamientos.filter(function(l) { return l.estado === filtroActivo; });
    }

    if (visibles.length === 0) {
        estadoVacio.style.display = "flex";
    } else {
        estadoVacio.style.display = "none";
        visibles.forEach(function(l) { grid.appendChild(crearTarjeta(l)); });
    }

    document.getElementById("contador-visibles").textContent =
        visibles.length + (visibles.length === 1 ? " REGISTRO" : " REGISTROS");

    document.getElementById("contador-lanzamientos").textContent = lanzamientos.length;

    actualizarEstadisticas();
}


// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 5 — FORMULARIO: REGISTRO Y EDICIÓN
// ─────────────────────────────────────────────────────────────────────────────

function manejarFormulario(evento) {
    evento.preventDefault();

    const nombre = document.getElementById("input-nombre-serie").value.trim();
    const cohete = document.getElementById("select-tipo-cohete").value;
    const fecha  = document.getElementById("input-fecha-lanzamiento").value;
    const obj    = document.getElementById("input-objetivo-mision").value.trim();
    const idEdic = document.getElementById("input-id-edicion").value;

    if (!nombre || !cohete || !fecha || !obj) {
        alert("Todos los campos son obligatorios. Completa el formulario antes de continuar.");
        return;
    }

    if (idEdic) {
        // Modo edición: actualizar registro existente
        const lanzamiento = lanzamientos.find(function(l) { return l.id === idEdic; });
        if (lanzamiento) {
            lanzamiento.nombreSerie = nombre;
            lanzamiento.tipoCohete  = cohete;
            lanzamiento.fecha       = fecha;
            lanzamiento.objetivo    = obj;
        }
        salirModoEdicion();
    } else {
        // Registro nuevo
        lanzamientos.push({
            id:          generarId(),
            nombreSerie: nombre,
            tipoCohete:  cohete,
            fecha:       fecha,
            objetivo:    obj,
            estado:      "pendiente"
        });
    }

    limpiarFormulario();
    renderizarGrid();
}

function limpiarFormulario() {
    document.getElementById("input-nombre-serie").value      = "";
    document.getElementById("select-tipo-cohete").value      = "";
    document.getElementById("input-fecha-lanzamiento").value = "";
    document.getElementById("input-objetivo-mision").value   = "";
    document.getElementById("input-id-edicion").value        = "";
}


// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 6 — CAMBIOS DE ESTADO
// ─────────────────────────────────────────────────────────────────────────────

function activarEdicion(id) {
    const lanzamiento = lanzamientos.find(function(l) { return l.id === id; });
    if (!lanzamiento || lanzamiento.estado !== "pendiente") return;

    document.getElementById("input-nombre-serie").value      = lanzamiento.nombreSerie;
    document.getElementById("select-tipo-cohete").value      = lanzamiento.tipoCohete;
    document.getElementById("input-fecha-lanzamiento").value = lanzamiento.fecha;
    document.getElementById("input-objetivo-mision").value   = lanzamiento.objetivo;
    document.getElementById("input-id-edicion").value        = lanzamiento.id;

    document.getElementById("btn-registrar").textContent     = "✔ GUARDAR CAMBIOS";
    document.getElementById("btn-cancelar-edicion").style.display = "inline-flex";
}

function salirModoEdicion() {
    document.getElementById("btn-registrar").innerHTML       = "&#9654;&nbsp;REGISTRAR LANZAMIENTO";
    document.getElementById("btn-cancelar-edicion").style.display = "none";
    document.getElementById("input-id-edicion").value        = "";
}

function cancelarLanzamiento(id) {
    const lanzamiento = lanzamientos.find(function(l) { return l.id === id; });
    if (!lanzamiento || lanzamiento.estado !== "pendiente") return;
    lanzamiento.estado = "cancelado";
    renderizarGrid();
}


// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 7 — FILTRADO POR ESTADO
// ─────────────────────────────────────────────────────────────────────────────

function aplicarFiltro(filtro) {
    filtroActivo = filtro;
    document.querySelectorAll("#grupo-filtros .atom-btn--filter").forEach(function(btn) {
        btn.classList.toggle("atom-btn--filter-active", btn.getAttribute("data-filter") === filtro);
    });
    renderizarGrid();
}


// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 8 — RELOJ Y MONITOREO AUTOMÁTICO
// ─────────────────────────────────────────────────────────────────────────────

function tickSegundo() {
    // Tarea A: reloj UTC
    const ahora = new Date();
    const hh = String(ahora.getUTCHours()).padStart(2, "0");
    const mm = String(ahora.getUTCMinutes()).padStart(2, "0");
    const ss = String(ahora.getUTCSeconds()).padStart(2, "0");
    document.getElementById("reloj-principal").textContent = hh + ":" + mm + ":" + ss + "Z";

    // Tarea B: detección automática de lanzamientos cuya fecha llegó
    let huboCambio = false;
    lanzamientos.forEach(function(l) {
        if (l.estado === "pendiente" && new Date(l.fecha) <= ahora) {
            l.estado = "lanzado";
            huboCambio = true;
        }
    });
    if (huboCambio) renderizarGrid();
}


// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 9 — ESTADÍSTICAS
// ─────────────────────────────────────────────────────────────────────────────

function actualizarEstadisticas() {
    let pendientes = 0, lanzados = 0, cancelados = 0;
    lanzamientos.forEach(function(l) {
        if (l.estado === "pendiente")  pendientes++;
        if (l.estado === "lanzado")    lanzados++;
        if (l.estado === "cancelado")  cancelados++;
    });
    document.getElementById("stat-pendientes").textContent = pendientes;
    document.getElementById("stat-lanzados").textContent   = lanzados;
    document.getElementById("stat-cancelados").textContent = cancelados;
    document.getElementById("stat-total").textContent      = lanzamientos.length;
}


// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 10 — INICIALIZACIÓN
//  El script se carga al final del <body>, el DOM ya está disponible.
// ─────────────────────────────────────────────────────────────────────────────

// Ocultar botón cancelar edición al inicio
document.getElementById("btn-cancelar-edicion").style.display = "none";

// Conectar formulario
document.getElementById("form-lanzamiento").addEventListener("submit", manejarFormulario);

// Conectar botón cancelar edición
document.getElementById("btn-cancelar-edicion").addEventListener("click", function() {
    salirModoEdicion();
    limpiarFormulario();
});

// Conectar botones de filtro
document.querySelectorAll("#grupo-filtros .atom-btn--filter").forEach(function(btn) {
    btn.addEventListener("click", function() {
        aplicarFiltro(btn.getAttribute("data-filter"));
    });
});

// Reloj y monitoreo automático cada segundo
setInterval(tickSegundo, 1000);
tickSegundo();

// Render inicial
renderizarGrid();