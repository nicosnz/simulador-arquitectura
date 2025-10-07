
class CacheLRU {
  constructor(tamano) {
    this.tamano = tamano;
    this.map = new Map(); // mantiene orden de uso
  }

  get(direccion) {
    if (this.map.has(direccion)) {
      const valor = this.map.get(direccion);
      // Reordenar para marcar como "recientemente usado"
      this.map.delete(direccion);
      this.map.set(direccion, valor);
      
      return valor;
    }
    return null; // Miss
  }

  set(direccion, valor) {
    if (this.map.size >= this.tamano) {
      // Eliminar el menos usado (primer elemento)
      const primera = this.map.keys().next().value;
      this.map.delete(primera);
    }
    this.map.set(direccion, valor);
  }
  printMap(){
    for (const [clave, valor] of this.map) {
      Logger.log(clave + " → " + valor);
    }
  }
}
const cacheL1 = new CacheLRU(4);
const cacheL2 = new CacheLRU(8);
const cacheL3 = new CacheLRU(16);
 
function rellenarCache() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("VON NEUMANN");
  

  for (let fila = 73; fila <= 95; fila += 2) {
    const direccion = hoja.getRange(fila, 3).getValue(); // Columna C = 3
    const valor = hoja.getRange(fila, 6).getValue(); // Columna f = 6
    if ((direccion !== "" && direccion !== null) &&(valor !== "" && valor !== null) ) {
      cacheL1.set(direccion,valor)
      cacheL2.set(direccion,valor)
      cacheL3.set(direccion,valor)
    }
  }

  cacheL1.printMap()
  Logger.log("cache 2")
  cacheL2.printMap()
  Logger.log("cache 3")
  cacheL3.printMap()
  
}

function animarCacheConHit(direccion) {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("VON NEUMANN");

  // Celdas de caché en orden: L1, L2, L3, RAM
  const celdas = ["H38", "J38", "H46", "M17"];
  const coloresHit = ["#b6d7a8", "#f9cb9c", "#cfe2f3", "#f4cccc"];
  const colorTransito = "#d9d2e9";
  const colorMiss = "#f4cccc";

  // 🔄 Limpiar fondos al inicio sin borrar texto
  for (let celdaRef of celdas) {
    hoja.getRange(celdaRef).setBackground(null);
  }

  // Verificar en qué caché está la dirección
  const hitL1 = cacheL1.get(direccion) !== null;
  const hitL2 = cacheL2.get(direccion) !== null;
  const hitL3 = cacheL3.get(direccion) !== null;

  for (let i = 0; i < celdas.length; i++) {
    const celda = hoja.getRange(celdas[i]);

    celda.setBackground(colorTransito);
    SpreadsheetApp.flush();
    Utilities.sleep(1000);

    if ((i === 0 && hitL1) || (i === 1 && hitL2) || (i === 2 && hitL3)) {
      celda.setBackground(coloresHit[i]);
      SpreadsheetApp.flush();
      return;
    }

    celda.setBackground(null);
    SpreadsheetApp.flush();
  }

  // ❌ Miss total: pintar todas las celdas de rojo
  for (let celdaRef of celdas) {
    hoja.getRange(celdaRef).setBackground(colorMiss);
  }
  SpreadsheetApp.flush();
}




function leerMemoria(direccion, programa) {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("VON NEUMANN");
  
  
  let valor = cacheL1.get(direccion);
  
  if (valor) {
    Logger.log("hit en cache l1")
    hoja.getRange(73, 8).setValue("🟢 CACHE HIT"); // Columna C = 3
  
    return valor;
  }

  valor = cacheL2.get(direccion);
  if (valor) {
    Logger.log("hit en cacheL2")
    hoja.getRange(73, 17).setValue("🟢 CACHE HIT");
    cacheL1.set(direccion, valor);
    
    return valor;
  }

  valor = cacheL3.get(direccion);
  if (valor) {
    Logger.log("hit en cache l3")
    hoja.getRange(73, 26).setValue("🟢 CACHE HIT");
    cacheL2.set(direccion, valor);
    cacheL1.set(direccion, valor);
    
    return valor;
  }

  // Miss total: leer desde memoria principal
  Logger.log("yendo a la ram")
  Logger.log("agregando datos a caches")
  valor = programa.get(direccion);
  const claves = Array.from(programa.keys());
  let i = 0
  
  for (let fila = 73; fila <= 95; fila += 2) {
    hoja.getRange(fila, 3).setValue(claves[i]); // Columna C = 3
    hoja.getRange(fila, 6).setValue(programa.get(claves[i])); // Columna f = 6
    hoja.getRange(fila, 13).setValue(claves[i]); // Columna C = 3
    hoja.getRange(fila, 15).setValue(programa.get(claves[i])); // Columna f = 6
    hoja.getRange(fila, 22).setValue(claves[i]); // Columna C = 3
    hoja.getRange(fila, 24).setValue(programa.get(claves[i])); // Columna f = 6
    i++
  }
  hoja.getRange(73, 8).setValue("🔴 CACHE MISS"); // Columna C = 3
  hoja.getRange(73, 17).setValue("🔴 CACHE MISS"); // Columna f = 6
  hoja.getRange(73, 26).setValue("🔴 CACHE MISS"); // Columna C = 3
  
  return valor;
}



function onEdit(e) {
  const hoja = e.source.getSheetByName("Código");
  const rango = e.range;

  // Verifica que estés editando la columna K (columna 11) desde la fila 11 en adelante
  if (hoja.getName() === "Código" && rango.getColumn() === 11 && rango.getRow() >= 11) {
    const fila = rango.getRow();
    const valor = rango.getValue();

    // Si hay contenido en la celda editada, asigna número de línea en la columna J
    if (valor && valor.toString().trim() !== "") {
      hoja.getRange(fila, 10).setValue(fila - 10); // Línea 1 empieza en fila 11
    } else {
      hoja.getRange(fila, 10).clearContent(); // Si borras la instrucción, borra el número
    }
  }
}

function leerCodigoo() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Código");
  
  const filaInicio = 11;
  const columna = 11; // Columna K
  const totalFilas = hoja.getLastRow() - filaInicio + 1;

  const rango = hoja.getRange(filaInicio, columna, totalFilas, 1);
  const instrucciones = rango.getDisplayValues().flat(); // Captura lo visible, incluso si hay celdas combinadas
  const programa = instrucciones.filter(inst => inst && inst.trim() !== "");
  
  
  
  return programa;
}


function escribirRam() {
  const instrucciones = leerCodigoo(); // ← asegúrate de que esta función devuelve un array
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("VON NEUMANN");
  const filaInicio = 14;
  const columna = 21;
  hoja.getRange("H41").clearContent();
  for (let j = 0; j < instrucciones.length; j++) {
    const filaDestino = filaInicio + j * 2; // Salta de 2 en 2
    hoja.getRange(filaDestino, columna).setValue(instrucciones[j]);
  }
  
}

function ejecutarPasos() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("VON NEUMANN");
  const pasoActual = hoja.getRange("I112").getValue() || 0;     // instrucción actual
  const subpaso = hoja.getRange("I113").getValue() || 0;        // fase del ciclo

  if (subpaso === 0) {
    fetch(pasoActual);
    hoja.getRange("I113").setValue(1); // avanzar a decode
  } else if (subpaso === 1) {
    decode(pasoActual);
    hoja.getRange("I113").setValue(2); // avanzar a execute
  } else if (subpaso === 2) {
    execute(pasoActual);
    hoja.getRange("I113").setValue(0); // reiniciar ciclo
    hoja.getRange("I112").setValue(pasoActual + 1); // avanzar a siguiente instrucción
  }
}
function fetch(pasoActual) {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("VON NEUMANN");
  const programa = new Map();
  const memorias = ["0x1000","0x1004","0x1008","0x1012","0x1016","0x1020","0x2024","0x2028","0x2032","0x2036","0x2040","0x2044","0x2048","0x2052","0x2056","0x2060"];
  const instrucciones = leerCodigoo();
  const fila = 26;
  const columna = 8;
  hoja.getRange("H56").clearContent();
  for (let i = 0; i < instrucciones.length; i++) {
    programa.set(memorias[i], instrucciones[i]);
  }

  const claves = Array.from(programa.keys());
  if (pasoActual < claves.length) {
    const direccion = claves[pasoActual];
    hoja.getRange(fila, columna).setValue(direccion);
    
  } else {
    hoja.getRange("I25").setValue("Programa finalizado.");
  }
}

function decode(pasoActual) {
  
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("VON NEUMANN");
  const programa = new Map();
  const memorias = ["0x1000","0x1004","0x1008","0x1012","0x1016","0x1020","0x2024","0x2028","0x2032","0x2036","0x2040","0x2044","0x2048","0x2052","0x2056","0x2060"];
  const instrucciones = leerCodigoo();
  const fila = 28;
  const columna = 8;
  rellenarCache();
  for (let i = 0; i < instrucciones.length; i++) {
    programa.set(memorias[i], instrucciones[i]);
  }

  const claves = Array.from(programa.keys());
  if (pasoActual < claves.length) {
    const direccion = claves[pasoActual];
    const instruccion = leerMemoria(direccion,programa);
    animarCacheConHit(direccion);
    
    hoja.getRange(fila, columna).setValue(instruccion);
    
  } else {
    hoja.getRange("I25").setValue("Programa finalizado.");
  }
  if(pasoActual + 1 < claves.length){

    fetch(pasoActual + 1)
  }
}


function execute(pasoActual) {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("VON NEUMANN");
  const programa = new Map();
  const memorias = ["0x1000","0x1004","0x1008","0x1012","0x1016","0x1020","0x2024","0x2028","0x2032","0x2036","0x2040","0x2044","0x2048","0x2052","0x2056","0x2060"];
  const instrucciones = leerCodigoo();
  

  for (let i = 0; i < instrucciones.length; i++) {
    programa.set(memorias[i], instrucciones[i]);
  }

  const claves = Array.from(programa.keys());
  if (pasoActual < claves.length) {
    const direccion = claves[pasoActual];
    const instruccion = programa.get(direccion);
    const partes = instruccion.split(/[\s,]+/);
    let val = parseInt(partes[1]);
    let regis = partes[2];

    if (instruccion.includes("MOV")) {
      if (regis === "EAX") {
        hoja.getRange(30, 8).setValue(val);
      } else {
        hoja.getRange(32, 8).setValue(val);
      }
    } else {
      let valorEax = parseInt(hoja.getRange(30, 8).getValue()) || 0;
      let suma = valorEax + val;
      hoja.getRange("H56").setValue(valorEax + " + " + val + " = " + suma);
      hoja.getRange(30, 8).setValue(suma); // actualiza EAX con el resultado
    }

    
  } else {
    hoja.getRange("I25").setValue("Programa finalizado.");
  }
}






function reiniciar(){
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("VON NEUMANN");
  hoja.getRange("I112").setValue(0)
  hoja.getRange("I113").setValue(0)
  for (let fila = 26; fila <= 32; fila++) {
    hoja.getRange(fila, 8).clearContent();
  }
  for (let fila = 73; fila <= 95; fila += 2) {
    hoja.getRange(fila, 3).clearContent() // Columna C = 3
    hoja.getRange(fila, 6).clearContent() // Columna f = 6
    hoja.getRange(fila, 13).clearContent() // Columna C = 3
    hoja.getRange(fila, 15).clearContent() // Columna f = 6
    hoja.getRange(fila, 22).clearContent() // Columna C = 3
    hoja.getRange(fila, 24).clearContent()// Columna f = 6
      
  }

    hoja.getRange(73, 8).clearContent()// Columna C = 3
    hoja.getRange(73, 17).clearContent() // Columna f = 6
    hoja.getRange(73, 26).clearContent()
    hoja.getRange("H56").clearContent()
}

