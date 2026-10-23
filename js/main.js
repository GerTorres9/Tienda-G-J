const estadoFiltrosInterfaz = {
    categoriaSeleccionada: "todos",
    terminoBusqueda: "",
    criterioOrden: "destacados",
    soloDestacados: false
};

const referenciasDom = {
    contenedorCategorias: document.getElementById("contenedor-filtros-categoria"),
    inputBusqueda: document.getElementById("input-busqueda-tequila"),
    selectOrdenamiento: document.getElementById("select-orden-catalogo"),
    checkSoloDestacados: document.getElementById("check-solo-destacados"),
    contadorResultados: document.getElementById("contador-resultados-catalogo"),
    indicadorCarga: document.getElementById("estado-carga-catalogo"),
    contenedorError: document.getElementById("estado-error-catalogo"),
    grillaProductos: document.getElementById("grilla-productos-tequila"),
    botonAbrirCarrito: document.getElementById("boton-abrir-carrito"),
    botonCerrarCarrito: document.getElementById("boton-cerrar-carrito"),
    fondoDrawerCarrito: document.getElementById("fondo-drawer-carrito"),
    panelDrawerCarrito: document.getElementById("panel-drawer-carrito"),
    insigniaCantidadCarrito: document.getElementById("insignia-cantidad-carrito"),
    barraEnvioGratis: document.getElementById("mensaje-envio-gratis"),
    progresoEnvioBarra: document.getElementById("barra-progreso-envio"),
    listaItemsCarrito: document.getElementById("lista-items-carrito"),
    selectMetodoEnvio: document.getElementById("select-metodo-envio"),
    inputCodigoCupon: document.getElementById("input-codigo-cupon"),
    botonAplicarCupon: document.getElementById("boton-aplicar-cupon"),
    etiquetaCuponActivo: document.getElementById("etiqueta-cupon-activo"),
    resumenSubtotal: document.getElementById("resumen-subtotal"),
    resumenDescuento: document.getElementById("resumen-descuento"),
    resumenIva: document.getElementById("resumen-iva"),
    resumenEnvio: document.getElementById("resumen-envio"),
    resumenTotalPagar: document.getElementById("resumen-total-pagar"),
    botonVaciarCarrito: document.getElementById("boton-vaciar-carrito"),
    botonIrCheckout: document.getElementById("boton-ir-checkout"),
    seccionCheckout: document.getElementById("seccion-checkout-compra"),
    formularioCheckout: document.getElementById("formulario-confirmacion-compra"),
    resumenCheckoutArticulos: document.getElementById("resumen-checkout-articulos"),
    resumenCheckoutTotal: document.getElementById("resumen-checkout-total"),
    botonCancelarCheckout: document.getElementById("boton-cancelar-checkout"),
    contenedorHistorialOrdenes: document.getElementById("contenedor-historial-ordenes"),
    botonVaciarHistorial: document.getElementById("boton-vaciar-historial")
};

function mostrarNotificacionToast(mensaje, tipo = "exito") {
    const coloresPorTipo = {
        exito: "linear-gradient(135deg, #15803d, #166534)",
        alerta: "linear-gradient(135deg, #b45309, #92400e)",
        error: "linear-gradient(135deg, #b91c1c, #7f1d1d)"
    };

    if (typeof Toastify === "function") {
        Toastify({
            text: mensaje,
            duration: 2800,
            gravity: "bottom",
            position: "right",
            stopOnFocus: true,
            style: {
                background: coloresPorTipo[tipo] || coloresPorTipo.exito,
                borderRadius: "10px",
                fontWeight: "600",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.45)"
            }
        }).showToast();
    }
}

function alternarVisibilidadDrawerCarrito(mostrarDrawer) {
    const accionClase = mostrarDrawer ? "add" : "remove";
    referenciasDom.panelDrawerCarrito.classList[accionClase]("activo");
    referenciasDom.fondoDrawerCarrito.classList[accionClase]("activo");
}

function renderizarBotonesCategorias() {
    const htmlBotones = estadoCatalogo.listaCategorias
        .map(({ id, etiqueta }) => {
            const claseActiva = estadoFiltrosInterfaz.categoriaSeleccionada === id ? "chip-categoria activo" : "chip-categoria";
            return `
                <button type="button" class="${claseActiva}" data-categoria="${id}">
                    ${etiqueta}
                </button>
            `;
        })
        .join("");

    referenciasDom.contenedorCategorias.innerHTML = htmlBotones;

    const botonesCategoria = referenciasDom.contenedorCategorias.querySelectorAll(".chip-categoria");
    botonesCategoria.forEach((boton) => {
        boton.addEventListener("click", () => {
            estadoFiltrosInterfaz.categoriaSeleccionada = boton.dataset.categoria || "todos";
            renderizarBotonesCategorias();
            renderizarCatalogoTequilas();
        });
    });
}

function renderizarOpcionesEnvioEnSelect() {
    referenciasDom.selectMetodoEnvio.innerHTML = estadoCatalogo.listaOpcionesEnvio
        .map(({ id, nombre, costo }) => {
            const textoCosto = costo === 0 ? "Sin costo" : formatearMonedaMxn(costo);
            const atributoSelected = id === idMetodoEnvioActivo ? "selected" : "";
            return `<option value="${id}" ${atributoSelected}>${nombre} — ${textoCosto}</option>`;
        })
        .join("");
}

function mostrarModalFichaTecnicaTequila(idProducto) {
    const producto = obtenerProductoPorId(idProducto);
    if (!producto || typeof Swal === "undefined") {
        return;
    }

    const {
        nombre,
        categoria,
        nom,
        denominacionOrigen,
        graduacionAlcoholica,
        volumenMl,
        proceso,
        notasCata,
        maridaje,
        precio,
        imagen
    } = producto;

    Swal.fire({
        title: nombre,
        html: `
            <div class="modal-cata-contenido">
                <img src="${imagen}" alt="${nombre}" class="modal-cata-imagen" />
                <div class="modal-cata-detalles">
                    <p><strong>Clase Oficial:</strong> Tequila 100% de Agave — ${categoria}</p>
                    <p><strong>Certificación:</strong> ${nom} · ${denominacionOrigen}</p>
                    <p><strong>Graduación y Volumen:</strong> ${graduacionAlcoholica}% Alc. Vol. · ${volumenMl} ml</p>
                    <p><strong>Proceso de Elaboración:</strong> ${proceso}</p>
                    <p><strong>Notas de Cata:</strong> ${notasCata}</p>
                    <p><strong>Maridaje Sugerido:</strong> ${maridaje}</p>
                    <p class="modal-cata-precio">${formatearMonedaMxn(precio)} MXN</p>
                </div>
            </div>
        `,
        background: "#14181D",
        color: "#F8FAFC",
        confirmButtonColor: "#D4AF37",
        confirmButtonText: "Cerrar Ficha de Cata",
        width: "640px"
    });
}

function renderizarCatalogoTequilas() {
    const productosVisibles = filtrarYOrdenarCatalogo(estadoFiltrosInterfaz);
    const totalEncontrados = productosVisibles.length;

    referenciasDom.contadorResultados.textContent = totalEncontrados === 1
        ? "Mostrando 1 etiqueta certificada 100% Agave"
        : `Mostrando ${totalEncontrados} etiquetas certificadas 100% Agave`;

    if (totalEncontrados === 0) {
        referenciasDom.grillaProductos.innerHTML = `
            <div class="estado-vacio-catalogo">
                <h3>No encontramos botellas con esos criterios</h3>
                <p>Prueba seleccionando otra clase de tequila (Blanco, Reposado, Añejo, Extra Añejo o Cristalino) o limpia el buscador.</p>
                <button type="button" id="boton-restablecer-filtros" class="boton-dorado">
                    Restablecer Filtros
                </button>
            </div>
        `;
        const botonRestablecer = document.getElementById("boton-restablecer-filtros");
        if (botonRestablecer) {
            botonRestablecer.addEventListener("click", restablecerFiltrosBusqueda);
        }
        return;
    }

    const htmlTarjetas = productosVisibles
        .map((producto) => {
            const {
                id,
                nombre,
                categoria,
                nom,
                denominacionOrigen,
                graduacionAlcoholica,
                volumenMl,
                proceso,
                notasCata,
                precio,
                destacado,
                imagen
            } = producto;

            const stockRestante = obtenerStockDisponibleReal(id);
            const sinStock = stockRestante <= 0;
            const etiquetaStock = sinStock
                ? "Agotado en cava"
                : `${stockRestante} disponibles`;

            return `
                <article class="tarjeta-tequila">
                    <div class="tarjeta-encabezado-imagen">
                        <span class="insignia-clase">${categoria}</span>
                        ${destacado ? '<span class="insignia-destacado">Reserva Selecta</span>' : ""}
                        <img src="${imagen}" alt="${nombre}" class="imagen-botella" loading="lazy" />
                    </div>
                    <div class="tarjeta-cuerpo">
                        <div class="metadatos-nom">
                            <span>${nom}</span>
                            <span>${graduacionAlcoholica}% Alc. Vol. · ${volumenMl} ml</span>
                        </div>
                        <h3 class="titulo-tequila">${nombre}</h3>
                        <p class="origen-tequila">📍 ${denominacionOrigen}</p>
                        <p class="proceso-tequila">${proceso}</p>
                        <p class="notas-tequila"><strong>Notas de cata:</strong> ${notasCata}</p>
                        <div class="fila-precio-stock">
                            <span class="precio-tequila">${formatearMonedaMxn(precio)}</span>
                            <span class="estado-stock ${sinStock ? "agotado" : "disponible"}">${etiquetaStock}</span>
                        </div>
                        <div class="acciones-tarjeta">
                            <div class="control-cantidad-tarjeta">
                                <label for="cantidad-${id}" class="oculto-accesible">Cantidad</label>
                                <input
                                    type="number"
                                    id="cantidad-${id}"
                                    class="input-cantidad-tarjeta"
                                    min="1"
                                    max="${Math.max(1, stockRestante)}"
                                    value="1"
                                    ${sinStock ? "disabled" : ""}
                                />
                            </div>
                            <button
                                type="button"
                                class="boton-dorado boton-agregar-carrito"
                                data-id="${id}"
                                ${sinStock ? "disabled" : ""}
                            >
                                ${sinStock ? "Sin Stock" : "Agregar a Cava"}
                            </button>
                            <button
                                type="button"
                                class="boton-secundario boton-ver-cata"
                                data-id="${id}"
                                title="Ver ficha completa de cata"
                            >
                                Cata
                            </button>
                        </div>
                    </div>
                </article>
            `;
        })
        .join("");

    referenciasDom.grillaProductos.innerHTML = htmlTarjetas;

    referenciasDom.grillaProductos.querySelectorAll(".boton-agregar-carrito").forEach((botonAgregar) => {
        botonAgregar.addEventListener("click", () => {
            const idProducto = botonAgregar.dataset.id;
            const inputCantidad = document.getElementById(`cantidad-${idProducto}`);
            const cantidadSeleccionada = inputCantidad ? parseInt(inputCantidad.value, 10) || 1 : 1;

            const resultado = agregarTequilaAlCarrito(idProducto, cantidadSeleccionada);
            mostrarNotificacionToast(resultado.mensaje, resultado.exito ? "exito" : "alerta");

            if (resultado.exito) {
                sincronizarInterfazCompleta();
            }
        });
    });

    referenciasDom.grillaProductos.querySelectorAll(".boton-ver-cata").forEach((botonCata) => {
        botonCata.addEventListener("click", () => {
            mostrarModalFichaTecnicaTequila(botonCata.dataset.id);
        });
    });
}

function renderizarPanelCarrito() {
    const resumen = calcularResumenFinancieroCarrito();
    referenciasDom.insigniaCantidadCarrito.textContent = resumen.totalBotellas;

    const metaEnvio = estadoCatalogo.datosTienda.envioGratisDesde || 2500;
    const porcentajeProgreso = Math.min(100, Math.round((resumen.subtotalProductos / metaEnvio) * 100));
    referenciasDom.progresoEnvioBarra.style.width = `${porcentajeProgreso}%`;

    referenciasDom.barraEnvioGratis.textContent = resumen.calificaEnvioGratis
        ? "¡Felicidades! Tu pedido cuenta con Envío Asegurado Gratis."
        : `Agrega ${formatearMonedaMxn(resumen.montoFaltanteEnvioGratis)} más para obtener Envío Gratis (desde ${formatearMonedaMxn(metaEnvio)}).`;

    if (cuponAplicado) {
        referenciasDom.etiquetaCuponActivo.innerHTML = `
            <span>Cupón activo: <strong>${cuponAplicado.codigo} (-${cuponAplicado.porcentaje}%)</strong></span>
            <button type="button" id="boton-quitar-cupon" class="boton-enlace-eliminar">Quitar</button>
        `;
        const botonQuitarCupon = document.getElementById("boton-quitar-cupon");
        if (botonQuitarCupon) {
            botonQuitarCupon.addEventListener("click", () => {
                const respuesta = removerCuponDescuento();
                mostrarNotificacionToast(respuesta.mensaje, "alerta");
                sincronizarInterfazCompleta();
            });
        }
    } else {
        referenciasDom.etiquetaCuponActivo.innerHTML = `
            <span class="texto-suave">Cupones disponibles: <strong>AGAVE10</strong>, <strong>NOM15</strong>, <strong>CAVA20</strong></span>
        `;
    }

    if (carritoCompras.length === 0) {
        referenciasDom.listaItemsCarrito.innerHTML = `
            <div class="carrito-vacio-mensaje">
                <p>Tu cava de compra está vacía.</p>
                <span>Selecciona tus botellas 100% de Agave del catálogo para cotizar tu pedido.</span>
            </div>
        `;
        referenciasDom.botonVaciarCarrito.disabled = true;
        referenciasDom.botonIrCheckout.disabled = true;
    } else {
        referenciasDom.botonVaciarCarrito.disabled = false;
        referenciasDom.botonIrCheckout.disabled = false;

        referenciasDom.listaItemsCarrito.innerHTML = carritoCompras
            .map(({ id, nombre, categoria, nom, precioUnitario, cantidad, imagen }) => {
                const subtotalItem = precioUnitario * cantidad;
                return `
                    <div class="item-carrito">
                        <img src="${imagen}" alt="${nombre}" class="item-carrito-miniatura" />
                        <div class="item-carrito-info">
                            <h4>${nombre}</h4>
                            <span class="item-carrito-meta">${categoria} · ${nom}</span>
                            <span class="item-carrito-precio">${formatearMonedaMxn(precioUnitario)} c/u</span>
                            <div class="item-carrito-controles">
                                <button type="button" class="boton-cantidad" data-accion="restar" data-id="${id}">−</button>
                                <span class="cantidad-actual">${cantidad}</span>
                                <button type="button" class="boton-cantidad" data-accion="sumar" data-id="${id}">+</button>
                                <strong class="item-subtotal">${formatearMonedaMxn(subtotalItem)}</strong>
                            </div>
                        </div>
                        <button type="button" class="boton-eliminar-item" data-id="${id}" title="Eliminar botella">✕</button>
                    </div>
                `;
            })
            .join("");

        referenciasDom.listaItemsCarrito.querySelectorAll(".boton-cantidad").forEach((botonCantidad) => {
            botonCantidad.addEventListener("click", () => {
                const { id, accion } = botonCantidad.dataset;
                const cambio = accion === "sumar" ? 1 : -1;
                const resultado = modificarCantidadProductoEnCarrito(id, cambio);
                mostrarNotificacionToast(resultado.mensaje, resultado.exito ? "exito" : "alerta");
                sincronizarInterfazCompleta();
            });
        });

        referenciasDom.listaItemsCarrito.querySelectorAll(".boton-eliminar-item").forEach((botonEliminar) => {
            botonEliminar.addEventListener("click", () => {
                const resultado = eliminarProductoDelCarrito(botonEliminar.dataset.id);
                mostrarNotificacionToast(resultado.mensaje, "alerta");
                sincronizarInterfazCompleta();
            });
        });
    }

    referenciasDom.resumenSubtotal.textContent = formatearMonedaMxn(resumen.subtotalProductos);
    referenciasDom.resumenDescuento.textContent = `-${formatearMonedaMxn(resumen.montoDescuento)}`;
    referenciasDom.resumenIva.textContent = formatearMonedaMxn(resumen.montoImpuestosIva);
    referenciasDom.resumenEnvio.textContent = resumen.costoEnvioFinal === 0 && resumen.totalBotellas > 0
        ? "GRATIS"
        : formatearMonedaMxn(resumen.costoEnvioFinal);
    referenciasDom.resumenTotalPagar.textContent = formatearMonedaMxn(resumen.totalPagar);

    renderizarResumenEnCheckout(resumen);
}

function renderizarResumenEnCheckout(resumenCalculado) {
    if (!referenciasDom.resumenCheckoutArticulos) {
        return;
    }

    if (carritoCompras.length === 0) {
        referenciasDom.seccionCheckout.classList.add("oculto");
        return;
    }

    referenciasDom.resumenCheckoutArticulos.innerHTML = carritoCompras
        .map(({ nombre, categoria, cantidad, precioUnitario }) => `
            <li class="item-resumen-checkout">
                <span>${cantidad}x ${nombre} <em>(${categoria})</em></span>
                <strong>${formatearMonedaMxn(cantidad * precioUnitario)}</strong>
            </li>
        `)
        .join("");

    referenciasDom.resumenCheckoutTotal.textContent = formatearMonedaMxn(resumenCalculado.totalPagar);
}

function renderizarHistorialOrdenes() {
    if (historialOrdenesConfirmadas.length === 0) {
        referenciasDom.contenedorHistorialOrdenes.innerHTML = `
            <p class="texto-suave">Aún no tienes órdenes registradas en este navegador. Completa una compra para consultar tu comprobante aquí.</p>
        `;
        referenciasDom.botonVaciarHistorial.classList.add("oculto");
        return;
    }

    referenciasDom.botonVaciarHistorial.classList.remove("oculto");

    referenciasDom.contenedorHistorialOrdenes.innerHTML = historialOrdenesConfirmadas
        .map((orden) => {
            const {
                folio,
                fecha,
                comprador,
                articulos,
                envio,
                cuponUsado,
                totalBotellas,
                totalPagar
            } = orden;

            const listaBotellasTexto = articulos
                .map(({ cantidad, nombre, categoria }) => `${cantidad}x ${nombre} (${categoria})`)
                .join(" · ");

            return `
                <div class="tarjeta-orden-historial">
                    <div class="orden-encabezado">
                        <div>
                            <span class="insignia-folio">Folio ${folio}</span>
                            <span class="orden-fecha">${fecha}</span>
                        </div>
                        <button type="button" class="boton-eliminar-orden" data-folio="${folio}">
                            Borrar registro
                        </button>
                    </div>
                    <p><strong>Cliente:</strong> ${comprador.nombreCompleto} (${comprador.correoElectronico})</p>
                    <p><strong>Destino:</strong> ${comprador.direccionEntrega}, ${comprador.ciudadEstado} · <em>${envio}</em></p>
                    <p><strong>Botellas (${totalBotellas}):</strong> ${listaBotellasTexto}</p>
                    <div class="orden-pie">
                        <span>Cupón: ${cuponUsado} · Pago: ${comprador.metodoPago}</span>
                        <strong class="orden-total">${formatearMonedaMxn(totalPagar)} MXN</strong>
                    </div>
                </div>
            `;
        })
        .join("");

    referenciasDom.contenedorHistorialOrdenes.querySelectorAll(".boton-eliminar-orden").forEach((botonBorrar) => {
        botonBorrar.addEventListener("click", () => {
            eliminarOrdenDelHistorial(botonBorrar.dataset.folio);
            mostrarNotificacionToast(`Se eliminó el registro del pedido ${botonBorrar.dataset.folio}.`, "alerta");
            renderizarHistorialOrdenes();
        });
    });
}

function sincronizarInterfazCompleta() {
    renderizarCatalogoTequilas();
    renderizarPanelCarrito();
    renderizarHistorialOrdenes();
}

function restablecerFiltrosBusqueda() {
    estadoFiltrosInterfaz.categoriaSeleccionada = "todos";
    estadoFiltrosInterfaz.terminoBusqueda = "";
    estadoFiltrosInterfaz.criterioOrden = "destacados";
    estadoFiltrosInterfaz.soloDestacados = false;

    referenciasDom.inputBusqueda.value = "";
    referenciasDom.selectOrdenamiento.value = "destacados";
    referenciasDom.checkSoloDestacados.checked = false;

    renderizarBotonesCategorias();
    renderizarCatalogoTequilas();
}

function configurarEventosGlobalesInterfaz() {
    referenciasDom.inputBusqueda.addEventListener("input", (evento) => {
        estadoFiltrosInterfaz.terminoBusqueda = evento.target.value;
        renderizarCatalogoTequilas();
    });

    referenciasDom.selectOrdenamiento.addEventListener("change", (evento) => {
        estadoFiltrosInterfaz.criterioOrden = evento.target.value;
        renderizarCatalogoTequilas();
    });

    referenciasDom.checkSoloDestacados.addEventListener("change", (evento) => {
        estadoFiltrosInterfaz.soloDestacados = evento.target.checked;
        renderizarCatalogoTequilas();
    });

    referenciasDom.botonAbrirCarrito.addEventListener("click", () => {
        alternarVisibilidadDrawerCarrito(true);
    });

    referenciasDom.botonCerrarCarrito.addEventListener("click", () => {
        alternarVisibilidadDrawerCarrito(false);
    });

    referenciasDom.fondoDrawerCarrito.addEventListener("click", () => {
        alternarVisibilidadDrawerCarrito(false);
    });

    referenciasDom.selectMetodoEnvio.addEventListener("change", (evento) => {
        actualizarMetodoEnvio(evento.target.value);
        renderizarPanelCarrito();
        mostrarNotificacionToast("Método de envío actualizado.", "exito");
    });

    referenciasDom.botonAplicarCupon.addEventListener("click", () => {
        const codigo = referenciasDom.inputCodigoCupon.value;
        const respuesta = aplicarCuponAlCarrito(codigo);
        mostrarNotificacionToast(respuesta.mensaje, respuesta.exito ? "exito" : "error");
        if (respuesta.exito) {
            referenciasDom.inputCodigoCupon.value = "";
            renderizarPanelCarrito();
        }
    });

    referenciasDom.botonVaciarCarrito.addEventListener("click", async () => {
        if (carritoCompras.length === 0) {
            return;
        }

        const confirmacion = await Swal.fire({
            title: "¿Vaciar tu cava de compra?",
            text: "Se retirarán todas las botellas seleccionadas y el cupón aplicado.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#D4AF37",
            cancelButtonColor: "#475569",
            confirmButtonText: "Sí, vaciar carrito",
            cancelButtonText: "Cancelar",
            background: "#14181D",
            color: "#F8FAFC"
        });

        if (confirmacion.isConfirmed) {
            const respuesta = vaciarCarritoCompleto();
            mostrarNotificacionToast(respuesta.mensaje, "alerta");
            sincronizarInterfazCompleta();
        }
    });

    referenciasDom.botonIrCheckout.addEventListener("click", () => {
        if (carritoCompras.length === 0) {
            return;
        }
        alternarVisibilidadDrawerCarrito(false);
        referenciasDom.seccionCheckout.classList.remove("oculto");
        referenciasDom.seccionCheckout.scrollIntoView({ behavior: "smooth" });
    });

    referenciasDom.botonCancelarCheckout.addEventListener("click", () => {
        referenciasDom.seccionCheckout.classList.add("oculto");
    });

    referenciasDom.formularioCheckout.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const checkboxMayorEdad = document.getElementById("check-mayor-edad");
        if (!checkboxMayorEdad.checked) {
            mostrarNotificacionToast("Debes confirmar ser mayor de 18 años para adquirir bebidas con alcohol.", "error");
            return;
        }

        const datosComprador = {
            nombreCompleto: document.getElementById("input-nombre-cliente").value.trim(),
            correoElectronico: document.getElementById("input-correo-cliente").value.trim(),
            telefonoContacto: document.getElementById("input-telefono-cliente").value.trim(),
            direccionEntrega: document.getElementById("input-direccion-cliente").value.trim(),
            ciudadEstado: document.getElementById("input-ciudad-cliente").value.trim(),
            metodoPago: document.getElementById("select-pago-cliente").value
        };

        const ordenRegistrada = registrarOrdenConfirmadaEnStorage(datosComprador);
        referenciasDom.formularioCheckout.reset();
        referenciasDom.seccionCheckout.classList.add("oculto");
        sincronizarInterfazCompleta();

        await Swal.fire({
            icon: "success",
            title: "¡Pedido Confirmado con Éxito!",
            html: `
                <div class="modal-confirmacion-orden">
                    <p>Gracias por tu compra en <strong>Casa Tequilera G&J</strong>, <strong>${ordenRegistrada.comprador.nombreCompleto}</strong>.</p>
                    <p><strong>Folio de Orden:</strong> ${ordenRegistrada.folio}</p>
                    <p><strong>Total de Botellas:</strong> ${ordenRegistrada.totalBotellas}</p>
                    <p><strong>Modalidad de Entrega:</strong> ${ordenRegistrada.envio}</p>
                    <p><strong>Total Pagado (IVA incluido):</strong> ${formatearMonedaMxn(ordenRegistrada.totalPagar)} MXN</p>
                </div>
            `,
            background: "#14181D",
            color: "#F8FAFC",
            confirmButtonColor: "#D4AF37",
            confirmButtonText: "Ver Mis Pedidos"
        });

        document.getElementById("seccion-historial-ordenes").scrollIntoView({ behavior: "smooth" });
    });

    referenciasDom.botonVaciarHistorial.addEventListener("click", async () => {
        const confirmacion = await Swal.fire({
            title: "¿Limpiar historial de pedidos?",
            text: "Se borrarán del localStorage los comprobantes guardados en este navegador.",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#D4AF37",
            cancelButtonColor: "#475569",
            confirmButtonText: "Sí, limpiar historial",
            cancelButtonText: "Conservar",
            background: "#14181D",
            color: "#F8FAFC"
        });

        if (confirmacion.isConfirmed) {
            vaciarHistorialOrdenes();
            renderizarHistorialOrdenes();
            mostrarNotificacionToast("Historial de órdenes vaciado correctamente.", "alerta");
        }
    });
}

async function iniciarAplicacionCasaTequilera() {
    inicializarStorageSimulador();
    configurarEventosGlobalesInterfaz();

    const resultadoCarga = await cargarBaseDeDatosTequilas({
        alIniciarCarga: () => {
            referenciasDom.indicadorCarga.classList.remove("oculto");
            referenciasDom.contenedorError.classList.add("oculto");
        },
        alFinalizarCarga: () => {
            referenciasDom.indicadorCarga.classList.add("oculto");
        }
    });

    if (!resultadoCarga.exito) {
        referenciasDom.contenedorError.classList.remove("oculto");
        referenciasDom.contenedorError.innerHTML = `
            <div class="alerta-error-carga">
                <h3>Error al cargar la base de datos de tequilas</h3>
                <p>${resultadoCarga.mensajeError}</p>
                <button type="button" id="boton-reintentar-carga" class="boton-dorado">
                    Reintentar Conexión
                </button>
            </div>
        `;
        const botonReintentar = document.getElementById("boton-reintentar-carga");
        if (botonReintentar) {
            botonReintentar.addEventListener("click", iniciarAplicacionCasaTequilera);
        }
        mostrarNotificacionToast(resultadoCarga.mensajeError, "error");
        return;
    }

    renderizarBotonesCategorias();
    renderizarOpcionesEnvioEnSelect();
    sincronizarInterfazCompleta();
}

document.addEventListener("DOMContentLoaded", iniciarAplicacionCasaTequilera);