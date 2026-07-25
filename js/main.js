//Variables: Es un espacio de memoria para informacion importante.

const nombreCliente = prompt ("¡Hola! Bienvenido a nuestra Tienda de Ropa. ¿Cuál es tu nombre?");

let precioPrenda = prompt("Ingresa el precio de la prenda que deseas comprar (Ej: 1500):");
let cantidadPrenda = prompt("¿Cuántas unidades de esta prenda quieres llevar?");

precioPrenda = parseFloat(precioPrenda);
cantidadPrenda = parseInt(cantidadPrenda);

const costoTotal = precioPrenda * cantidadPrendas;

const mensajeCompra = "¡Excelente elección, " + nombreCliente + "! Llevas " + cantidadPrendas + " prenda(s) a $" + precioPrenda + " cada una. El total a pagar es: $" + costoTotal + ".";

alert(mensajeCompra);

console.log("--- Nueva Venta Registrada ---");
console.log("Cliente: " + nombreCliente);
console.log("Cantidad de artículos: " + cantidadPrendas);
console.log("Total a cobrar: $" + costoTotal);
console.log(mensajeCompra);