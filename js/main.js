
// SIMULADOR: Calculadora de Promedios Estudiantiles
// Contexto: Permite a un profesor ingresar notas de un alumno para calcular su promedio final.

alert("Bienvenido al Simulador de Promedios.\nPodrás ingresar las notas del alumno una por una.\nEscribe 'SALIR' cuando hayas terminado.");

// Declaración de variables usando let y const
let sumaNotas = 0;
let cantidadNotas = 0;
let ingresarDatos = true;
const NOTA_APROBACION = 6; // Usamos const para valores fijos

// BUCLE: Se repetirá hasta que el usuario decida detenerlo (ingresarDatos = false)
while (ingresarDatos) {
    let entrada = prompt("Ingresa una nota (del 1 al 10) o escribe 'SALIR' para calcular el promedio final:");

    // CONDICIONAL 1: Evaluamos si el usuario quiere salir o canceló el prompt
    if (entrada === null || entrada.toUpperCase() === "SALIR") {
        ingresarDatos = false; // Esto rompe el bucle
        console.log("Carga de notas finalizada por el usuario.");
    } else {
        // Transformamos la entrada de texto a número decimal
        let nota = parseFloat(entrada);

        // CONDICIONAL 2 (DENTRO DEL BUCLE): Validamos que la nota ingresada sea correcta
        if (!isNaN(nota) && nota >= 1 && nota <= 10) {
            sumaNotas += nota; // Acumulamos el valor de la nota
            cantidadNotas++;   // Sumamos 1 a la cantidad de notas ingresadas
            console.log(`✅ Nota ${nota} registrada correctamente.`);
        } else {
            // Si pone una letra o un número mayor a 10 / menor a 1
            alert("❌ Error: Por favor, ingresa un número válido entre 1 y 10.");
            console.log(`❌ Intento inválido: "${entrada}" no es una nota válida.`);
        }
    }
}

// SALIDA DE RESULTADOS: Fuera del bucle, evaluamos qué mostrar
if (cantidadNotas > 0) {
    const promedio = sumaNotas / cantidadNotas;
    
    console.log(`\n--- RESULTADOS FINALES ---`);
    console.log(`Cantidad de notas ingresadas: ${cantidadNotas}`);
    console.log(`Promedio final: ${promedio.toFixed(2)}`);
    
    // Condicional para determinar si aprueba o reprueba usando la constante
    if (promedio >= NOTA_APROBACION) {
        alert(`¡Felicidades! El promedio es ${promedio.toFixed(2)}.\nEstado: ALUMNO APROBADO ✅`);
    } else {
        alert(`El promedio es ${promedio.toFixed(2)}.\nEstado: ALUMNO REPROBADO ❌`);
    }
} else {
    // Por si el usuario escribe "SALIR" en el primer prompt sin ingresar nada
    alert("No se ingresó ninguna nota. Operación cancelada.");
    console.log("Operación cancelada sin datos.");
}