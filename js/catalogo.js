const RUTA_BASE_DATOS_JSON = "./data/tequilas.json";

const estadoCatalogo = {
    datosTienda: {},
    listaCategorias: [],
    listaProductos: [],
    listaCupones: [],
    listaOpcionesEnvio: [],
    cargandoDatos: false,
    errorCarga: null
};

async function cargarBaseDeDatosTequilas({ alIniciarCarga, alFinalizarCarga } = {}) {
    estadoCatalogo.cargandoDatos = true;
    estadoCatalogo.errorCarga = null;

    if (typeof alIniciarCarga === "function") {
        alIniciarCarga();
    }

    try {
        const respuestaServidor = await fetch(RUTA_BASE_DATOS_JSON);

        if (!respuestaServidor.ok) {
            throw new Error(`No se pudo cargar el catálogo de tequilas (Código HTTP ${respuestaServidor.status})`);
        }

        const datosJson = await respuestaServidor.json();
        const {
            tienda,
            categorias,
            productos,
            cuponesDescuento,
            opcionesEnvio
        } = datosJson || {};

        estadoCatalogo.datosTienda = tienda || {
            nombre: "Casa Tequilera G&J",
            moneda: "MXN",
            ivaPorcentaje: 0.16,
            envioGratisDesde: 2500
        };
        estadoCatalogo.listaCategorias = categorias || [];
        estadoCatalogo.listaProductos = productos || [];
        estadoCatalogo.listaCupones = cuponesDescuento || [];
        estadoCatalogo.listaOpcionesEnvio = opcionesEnvio || [];

        return {
            exito: true,
            catalogo: estadoCatalogo
        };
    } catch (errorCapturado) {
        const mensajeError = errorCapturado.message || "Error inesperado al consultar la base de datos JSON.";
        estadoCatalogo.errorCarga = mensajeError;
        return {
            exito: false,
            mensajeError
        };
    } finally {
        estadoCatalogo.cargandoDatos = false;
        if (typeof alFinalizarCarga === "function") {
            alFinalizarCarga();
        }
    }
}

function obtenerProductoPorId(idProductoBuscado) {
    return estadoCatalogo.listaProductos.find(({ id }) => id === idProductoBuscado) || null;
}

function buscarCuponValido(codigoIngresado) {
    const codigoNormalizado = (codigoIngresado || "").trim().toUpperCase();
    return estadoCatalogo.listaCupones.find(({ codigo }) => codigo === codigoNormalizado) || null;
}

function obtenerOpcionEnvioPorId(idEnvioSeleccionado) {
    const envioPorDefecto = estadoCatalogo.listaOpcionesEnvio[0] || {
        id: "estandar",
        nombre: "Envío Estándar Asegurado",
        costo: 180
    };
    return estadoCatalogo.listaOpcionesEnvio.find(({ id }) => id === idEnvioSeleccionado) || envioPorDefecto;
}

function filtrarYOrdenarCatalogo({
    categoriaSeleccionada = "todos",
    terminoBusqueda = "",
    criterioOrden = "destacados",
    soloDestacados = false
} = {}) {
    const textoLimpio = (terminoBusqueda || "").trim().toLowerCase();

    const productosFiltrados = estadoCatalogo.listaProductos.filter((producto) => {
        const {
            nombre,
            categoria,
            denominacionOrigen,
            notasCata,
            proceso,
            destacado
        } = producto;

        const coincideCategoria = categoriaSeleccionada === "todos" ? true : categoria === categoriaSeleccionada;
        const coincideDestacado = soloDestacados ? Boolean(destacado) : true;
        const coincideTexto = textoLimpio === ""
            ? true
            : [nombre, categoria, denominacionOrigen, notasCata, proceso]
                .some((campoTexto) => (campoTexto || "").toLowerCase().includes(textoLimpio));

        return coincideCategoria && coincideDestacado && coincideTexto;
    });

    const copiaOrdenable = [...productosFiltrados];

    copiaOrdenable.sort((primerTequila, segundoTequila) => {
        if (criterioOrden === "precio-asc") {
            return primerTequila.precio - segundoTequila.precio;
        }
        if (criterioOrden === "precio-desc") {
            return segundoTequila.precio - primerTequila.precio;
        }
        if (criterioOrden === "nombre-asc") {
            return primerTequila.nombre.localeCompare(segundoTequila.nombre, "es");
        }
        if (criterioOrden === "graduacion-desc") {
            return segundoTequila.graduacionAlcoholica - primerTequila.graduacionAlcoholica;
        }
        return (segundoTequila.destacado ? 1 : 0) - (primerTequila.destacado ? 1 : 0);
    });

    return copiaOrdenable;
}

function formatearMonedaMxn(montoNumerico) {
    const valorSeguro = Number(montoNumerico) || 0;
    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: estadoCatalogo.datosTienda.moneda || "MXN",
        minimumFractionDigits: 2
    }).format(valorSeguro);
}
