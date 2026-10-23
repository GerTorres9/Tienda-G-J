const CLAVE_STORAGE_CARRITO = "casaTequileraG_J_carrito";
const CLAVE_STORAGE_CUPON = "casaTequileraG_J_cupon";
const CLAVE_STORAGE_ENVIO = "casaTequileraG_J_envio";
const CLAVE_STORAGE_HISTORIAL = "casaTequileraG_J_historialOrdenes";

let carritoCompras = [];
let cuponAplicado = null;
let idMetodoEnvioActivo = "estandar";
let historialOrdenesConfirmadas = [];

function leerJsonDesdeStorage(claveStorage, valorPorDefecto) {
    try {
        const textoGuardado = localStorage.getItem(claveStorage);
        return textoGuardado ? JSON.parse(textoGuardado) : valorPorDefecto;
    } catch {
        return valorPorDefecto;
    }
}

function inicializarStorageSimulador() {
    carritoCompras = leerJsonDesdeStorage(CLAVE_STORAGE_CARRITO, []) || [];
    cuponAplicado = leerJsonDesdeStorage(CLAVE_STORAGE_CUPON, null) || null;
    idMetodoEnvioActivo = localStorage.getItem(CLAVE_STORAGE_ENVIO) || "estandar";
    historialOrdenesConfirmadas = leerJsonDesdeStorage(CLAVE_STORAGE_HISTORIAL, []) || [];
}

function guardarEstadoCarritoEnStorage() {
    localStorage.setItem(CLAVE_STORAGE_CARRITO, JSON.stringify(carritoCompras));
}

function obtenerStockDisponibleReal(idProducto) {
    const productoCatalogo = obtenerProductoPorId(idProducto);
    if (!productoCatalogo) {
        return 0;
    }
    const itemEnCarrito = carritoCompras.find(({ id }) => id === idProducto);
    const cantidadEnCarrito = itemEnCarrito ? itemEnCarrito.cantidad : 0;
    return Math.max(0, productoCatalogo.stock - cantidadEnCarrito);
}

function agregarTequilaAlCarrito(idProducto, unidadesSolicitadas = 1) {
    const productoCatalogo = obtenerProductoPorId(idProducto);
    if (!productoCatalogo) {
        return { exito: false, mensaje: "El tequila seleccionado no existe en el catálogo." };
    }

    const { id, nombre, categoria, nom, precio, stock, imagen, volumenMl } = productoCatalogo;
    const cantidadEntera = Math.max(1, parseInt(unidadesSolicitadas, 10) || 1);
    const existeEnCarrito = carritoCompras.some((item) => item.id === id);

    if (existeEnCarrito) {
        const itemActual = carritoCompras.find((item) => item.id === id);
        const nuevaCantidad = itemActual.cantidad + cantidadEntera;

        if (nuevaCantidad > stock) {
            return {
                exito: false,
                mensaje: `Solo contamos con ${stock} botellas disponibles de ${nombre}.`
            };
        }

        carritoCompras = carritoCompras.map((item) =>
            item.id === id
                ? { ...item, cantidad: nuevaCantidad }
                : item
        );
    } else {
        if (cantidadEntera > stock) {
            return {
                exito: false,
                mensaje: `Stock insuficiente para ${nombre} (máximo ${stock} botellas).`
            };
        }

        carritoCompras.push({
            id,
            nombre,
            categoria,
            nom,
            precioUnitario: precio,
            volumenMl,
            imagen,
            cantidad: cantidadEntera
        });
    }

    guardarEstadoCarritoEnStorage();
    return {
        exito: true,
        mensaje: `Se agregó ${cantidadEntera} botella(s) de ${nombre} a tu cava de compra.`
    };
}

function modificarCantidadProductoEnCarrito(idProducto, cambioUnidades) {
    const itemActual = carritoCompras.find(({ id }) => id === idProducto);
    const productoCatalogo = obtenerProductoPorId(idProducto);

    if (!itemActual || !productoCatalogo) {
        return { exito: false, mensaje: "No se encontró la botella en el carrito." };
    }

    const nuevaCantidad = itemActual.cantidad + cambioUnidades;

    if (nuevaCantidad <= 0) {
        return eliminarProductoDelCarrito(idProducto);
    }

    if (nuevaCantidad > productoCatalogo.stock) {
        return {
            exito: false,
            mensaje: `Alcanzaste el límite de stock (${productoCatalogo.stock} botellas) para ${productoCatalogo.nombre}.`
        };
    }

    carritoCompras = carritoCompras.map((item) =>
        item.id === idProducto
            ? { ...item, cantidad: nuevaCantidad }
            : item
    );

    guardarEstadoCarritoEnStorage();
    return {
        exito: true,
        mensaje: `Cantidad actualizada: ${nuevaCantidad} botella(s) de ${itemActual.nombre}.`
    };
}

function eliminarProductoDelCarrito(idProducto) {
    const itemEliminado = carritoCompras.find(({ id }) => id === idProducto);
    carritoCompras = carritoCompras.filter(({ id }) => id !== idProducto);
    guardarEstadoCarritoEnStorage();

    return {
        exito: true,
        mensaje: itemEliminado
            ? `Se eliminó ${itemEliminado.nombre} del carrito.`
            : "Producto retirado del carrito."
    };
}

function vaciarCarritoCompleto() {
    carritoCompras = [];
    cuponAplicado = null;
    localStorage.removeItem(CLAVE_STORAGE_CARRITO);
    localStorage.removeItem(CLAVE_STORAGE_CUPON);

    return {
        exito: true,
        mensaje: "Tu carrito de compra ha sido vaciado por completo."
    };
}

function aplicarCuponAlCarrito(codigoTexto) {
    const cuponEncontrado = buscarCuponValido(codigoTexto);
    if (!cuponEncontrado) {
        return {
            exito: false,
            mensaje: "El código ingresado no es válido. Prueba con AGAVE10, NOM15 o CAVA20."
        };
    }

    cuponAplicado = cuponEncontrado;
    localStorage.setItem(CLAVE_STORAGE_CUPON, JSON.stringify(cuponAplicado));

    return {
        exito: true,
        mensaje: `Cupón ${cuponEncontrado.codigo} aplicado (${cuponEncontrado.porcentaje}% de descuento).`
    };
}

function removerCuponDescuento() {
    cuponAplicado = null;
    localStorage.removeItem(CLAVE_STORAGE_CUPON);
    return {
        exito: true,
        mensaje: "Cupón de descuento retirado."
    };
}

function actualizarMetodoEnvio(idEnvio) {
    idMetodoEnvioActivo = idEnvio || "estandar";
    localStorage.setItem(CLAVE_STORAGE_ENVIO, idMetodoEnvioActivo);
}

function calcularResumenFinancieroCarrito() {
    const totalBotellas = carritoCompras.reduce(
        (acumuladorBotellas, { cantidad }) => acumuladorBotellas + cantidad,
        0
    );

    const subtotalProductos = carritoCompras.reduce(
        (acumuladorDinero, { precioUnitario, cantidad }) => acumuladorDinero + (precioUnitario * cantidad),
        0
    );

    const porcentajeDescuento = cuponAplicado ? cuponAplicado.porcentaje : 0;
    const montoDescuento = subtotalProductos * (porcentajeDescuento / 100);
    const baseGravable = Math.max(0, subtotalProductos - montoDescuento);

    const tasaIva = estadoCatalogo.datosTienda.ivaPorcentaje || 0.16;
    const montoImpuestosIva = baseGravable * tasaIva;

    const metaEnvioGratis = estadoCatalogo.datosTienda.envioGratisDesde || 2500;
    const opcionEnvio = obtenerOpcionEnvioPorId(idMetodoEnvioActivo);
    const calificaEnvioGratis = subtotalProductos >= metaEnvioGratis && totalBotellas > 0;

    const costoEnvioFinal = totalBotellas === 0
        ? 0
        : (calificaEnvioGratis ? 0 : opcionEnvio.costo);

    const totalPagar = baseGravable + montoImpuestosIva + costoEnvioFinal;
    const montoFaltanteEnvioGratis = Math.max(0, metaEnvioGratis - subtotalProductos);

    return {
        totalBotellas,
        subtotalProductos,
        porcentajeDescuento,
        montoDescuento,
        montoImpuestosIva,
        opcionEnvio,
        calificaEnvioGratis,
        costoEnvioFinal,
        totalPagar,
        montoFaltanteEnvioGratis
    };
}

function registrarOrdenConfirmadaEnStorage(datosComprador) {
    const resumen = calcularResumenFinancieroCarrito();
    const {
        nombreCompleto,
        correoElectronico,
        telefonoContacto,
        direccionEntrega,
        ciudadEstado,
        metodoPago
    } = datosComprador;

    const numeroFolio = `GJ-${Date.now().toString().slice(-6)}`;
    const fechaEmision = new Date().toLocaleString("es-MX", {
        dateStyle: "medium",
        timeStyle: "short"
    });

    const nuevaOrden = {
        folio: numeroFolio,
        fecha: fechaEmision,
        comprador: {
            nombreCompleto,
            correoElectronico,
            telefonoContacto,
            direccionEntrega,
            ciudadEstado,
            metodoPago
        },
        articulos: carritoCompras.map(({ id, nombre, categoria, nom, cantidad, precioUnitario }) => ({
            id,
            nombre,
            categoria,
            nom,
            cantidad,
            precioUnitario,
            subtotalItem: cantidad * precioUnitario
        })),
        envio: resumen.opcionEnvio.nombre,
        cuponUsado: cuponAplicado ? cuponAplicado.codigo : "Ninguno",
        totalBotellas: resumen.totalBotellas,
        subtotalProductos: resumen.subtotalProductos,
        montoDescuento: resumen.montoDescuento,
        montoImpuestosIva: resumen.montoImpuestosIva,
        costoEnvioFinal: resumen.costoEnvioFinal,
        totalPagar: resumen.totalPagar
    };

    nuevaOrden.articulos.forEach(({ id, cantidad }) => {
        const productoEnCatalogo = obtenerProductoPorId(id);
        if (productoEnCatalogo) {
            productoEnCatalogo.stock = Math.max(0, productoEnCatalogo.stock - cantidad);
        }
    });

    historialOrdenesConfirmadas.unshift(nuevaOrden);
    localStorage.setItem(CLAVE_STORAGE_HISTORIAL, JSON.stringify(historialOrdenesConfirmadas));
    vaciarCarritoCompleto();

    return nuevaOrden;
}

function eliminarOrdenDelHistorial(folioOrden) {
    historialOrdenesConfirmadas = historialOrdenesConfirmadas.filter(({ folio }) => folio !== folioOrden);
    localStorage.setItem(CLAVE_STORAGE_HISTORIAL, JSON.stringify(historialOrdenesConfirmadas));
}

function vaciarHistorialOrdenes() {
    historialOrdenesConfirmadas = [];
    localStorage.removeItem(CLAVE_STORAGE_HISTORIAL);
}
