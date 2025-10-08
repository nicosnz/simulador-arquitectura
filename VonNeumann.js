class InterfazHoja {
  constructor(nombreHoja) {
    this.hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nombreHoja);
  }

  leerInstrucciones() {
    
    const filaInicio = 11;
    const columna = 11; // Columna K
    const totalFilas = this.hoja.getLastRow() - filaInicio + 1;

    const rango = this.hoja.getRange(filaInicio, columna, totalFilas, 1);
    const instrucciones = rango.getDisplayValues().flat();

    // Filtrar instrucciones no vacías ni con solo espacios
    return instrucciones
      .map(inst => inst.trim())           // Elimina espacios alrededor
      .filter(inst => inst.length > 0);   // Solo conserva las que tienen contenido


  }

  escribirEnCelda(fila, columna, valor) {
    this.hoja.getRange(fila, columna).setValue(valor);
  }

  leerDeCelda(fila, columna) {
    return this.hoja.getRange(fila, columna).getValue();
  }

  limpiarCelda(celdaOFila, columna) {
    if (typeof celdaOFila === "string" && columna === undefined) {
      // Caso: limpiarCelda("A1")
      this.hoja.getRange(celdaOFila).clearContent();
    } else if (typeof celdaOFila === "number" && typeof columna === "number") {
      // Caso: limpiarCelda(14, 21)
      this.hoja.getRange(celdaOFila, columna).clearContent();
    
    }
  }

  cambiarColorCelda(celda, color) {
    this.hoja.getRange(celda).setBackground(color);
  }

  
}

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

class JerarquiaCache {
  constructor() {
    this.cacheL1 = new CacheLRU(4);
    this.cacheL2 = new CacheLRU(8);
    this.cacheL3 = new CacheLRU(16);
    this.hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("VON NEUMANN");
  }

  leerMemoria(direccion, programa) {
      
      let valor = this.cacheL1.get(direccion);
      
      if (valor) {
        Logger.log("hit en cache l1")
        this.hoja.getRange(73, 8).setValue("🟢 CACHE HIT"); // Columna C = 3
      
        return valor;
      }

      valor = this.cacheL2.get(direccion);
      if (valor) {
        Logger.log("hit en cacheL2")
        this.hoja.getRange(73, 17).setValue("🟢 CACHE HIT");
        this.cacheL1.set(direccion, valor);
        
        return valor;
      }

      valor = this.cacheL3.get(direccion);
      if (valor) {
        Logger.log("hit en cache l3")
        this.hoja.getRange(73, 26).setValue("🟢 CACHE HIT");
        this.cacheL2.set(direccion, valor);
        this.cacheL1.set(direccion, valor);
        
        return valor;
      }

    
    valor = programa.get(direccion);
    const claves = Array.from(programa.keys());
    let i = 0
    
    for (let fila = 73; fila <= 95; fila += 2) {
      this.hoja.getRange(fila, 3).setValue(claves[i]); // Columna C = 3
      this.hoja.getRange(fila, 6).setValue(programa.get(claves[i])); // Columna f = 6
      this.hoja.getRange(fila, 13).setValue(claves[i]); // Columna C = 3
      this.hoja.getRange(fila, 15).setValue(programa.get(claves[i])); // Columna f = 6
      this.hoja.getRange(fila, 22).setValue(claves[i]); // Columna C = 3
      this.hoja.getRange(fila, 24).setValue(programa.get(claves[i])); // Columna f = 6
      i++
    }
    this.hoja.getRange(73, 8).setValue("🔴 CACHE MISS"); // Columna C = 3
    this.hoja.getRange(73, 17).setValue("🔴 CACHE MISS"); // Columna f = 6
    this.hoja.getRange(73, 26).setValue("🔴 CACHE MISS"); // Columna C = 3
    
    return valor;
  }

  rellenarCachesDesdeHoja() {
    for (let fila = 73; fila <= 95; fila += 2) {
      const direccion = this.hoja.getRange(fila, 3).getValue(); // Columna C = 3
      const valor = this.hoja.getRange(fila, 6).getValue(); // Columna f = 6
      if ((direccion !== "" && direccion !== null) &&(valor !== "" && valor !== null) ) {
        this.cacheL1.set(direccion,valor)
        this.cacheL2.set(direccion,valor)
        this.cacheL3.set(direccion,valor)
      }
    }
  }
  animarCacheConHit(direccion) {
    

    // Celdas de caché en orden: L1, L2, L3, RAM
    const celdas = ["H38", "J38", "H46", "M17"];
    const coloresHit = ["#b6d7a8", "#f9cb9c", "#cfe2f3", "#f4cccc"];
    const colorTransito = "#d9d2e9";
    const colorMiss = "#f4cccc";

    // 🔄 Limpiar fondos al inicio sin borrar texto
    for (let celdaRef of celdas) {
      this.hoja.getRange(celdaRef).setBackground(null);
    }

    // Verificar en qué caché está la dirección
    const hitL1 = this.cacheL1.get(direccion) !== null;
    const hitL2 = this.cacheL2.get(direccion) !== null;
    const hitL3 = this.cacheL3.get(direccion) !== null;

    for (let i = 0; i < celdas.length; i++) {
      const celda = this.hoja.getRange(celdas[i]);

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
      this.hoja.getRange(celdaRef).setBackground(colorMiss);
    }
    SpreadsheetApp.flush();
  }

  verificarHit(direccion) {
    if (this.cacheL1.has(direccion)) return "L1";
    if (this.cacheL2.has(direccion)) return "L2";
    if (this.cacheL3.has(direccion)) return "L3";
    return "RAM";
  }

  clear() {
    this.cacheL1.clear();
    this.cacheL2.clear();
    this.cacheL3.clear();
  }

  printAllCaches() {
    this.cacheL1.printMap();
    this.cacheL2.printMap();
    this.cacheL3.printMap();
  }
}
class CPU {
  constructor(interfazHoja) {
    this.interfaz = new InterfazHoja(interfazHoja)
    this.interfazCodigo = new InterfazHoja("Código")
    this.memorias = ["0x1000","0x1004","0x1008","0x1012","0x1016","0x1020","0x2024","0x2028","0x2032","0x2036","0x2040","0x2044","0x2048","0x2052","0x2056","0x2060"];
    this.cachesCPU = new JerarquiaCache()
  }

  fetch(pasoActual) {
    


    
    const fila = 26;
    const columna = 8;
    this.interfaz.limpiarCelda("H56");

    // Obtener todas las instrucciones
    const instrucciones = this.interfazCodigo.leerInstrucciones();

    const direccionesInstrucciones = [];
    for (let i = 0; i < instrucciones.length; i++) {
      const inst = instrucciones[i].trim();

      const esDeclaracion = /^int\s+\w+\s*=\s*\d+$/i.test(inst);
      const esInstruccionValida = !esDeclaracion && inst !== "";

      if (esInstruccionValida) {
        direccionesInstrucciones.push(this.memorias[i]);
      }
    }

    

    // Mostrar la dirección correspondiente al paso actual
    if (pasoActual < direccionesInstrucciones.length) {
      const direccion = direccionesInstrucciones[pasoActual];
      this.interfaz.escribirEnCelda(fila, columna, direccion);
    }
    

    
    
  }



  decode(pasoActual) {
    const programa = new Map();
    const instrucciones = this.interfazCodigo.leerInstrucciones();
    const fila = 28;
    const columna = 8;
    this.interfaz.cambiarColorCelda("O27",null)
    this.interfaz.cambiarColorCelda("U18","ffeb3b3")
    this.interfaz.cambiarColorCelda("U20","ffeb3b3")
    this.interfaz.cambiarColorCelda("U22","ffeb3b3")
    this.cachesCPU.rellenarCachesDesdeHoja();

    // Construir el programa completo: variables + instrucciones
    for (let i = 0; i < instrucciones.length; i++) {
      const inst = instrucciones[i].trim();
      programa.set(this.memorias[i], inst);
    }

    // Filtrar solo las direcciones que contienen instrucciones válidas
    const claves = [];
    for (let i = 0; i < instrucciones.length; i++) {
      const inst = instrucciones[i].trim();
      const esInstruccion = !/^int\s+\w+\s*=\s*\d+$/i.test(inst);
      if (esInstruccion) {
        claves.push(this.memorias[i]);
      }
    }
    this.interfaz.cambiarColorCelda("O27","#d9d2e9")
    SpreadsheetApp.flush();
    Utilities.sleep(2000);
    this.interfaz.cambiarColorCelda("O27",null)
    
    if(pasoActual === 0){
      this.interfaz.cambiarColorCelda("U18","#d9d2e9")
      SpreadsheetApp.flush();
      Utilities.sleep(2000);

    }
    if(pasoActual === 1){
      this.interfaz.cambiarColorCelda("U20","#d9d2e9")
      SpreadsheetApp.flush();
      Utilities.sleep(2000);

    }
    if(pasoActual === 2){
      this.interfaz.cambiarColorCelda("U22","#d9d2e9")
      SpreadsheetApp.flush();
      Utilities.sleep(2000);

    }

    if (pasoActual < claves.length) {
      const direccion = claves[pasoActual];
      const instruccion = this.cachesCPU.leerMemoria(direccion, programa); // usa el mapa completo
      this.cachesCPU.animarCacheConHit(direccion);
      this.interfaz.escribirEnCelda(fila, columna, instruccion);
    }

    if (pasoActual + 1 < claves.length) {
      this.fetch(pasoActual + 1);
    }
  }

  

  execute(pasoActual) {
    const programa = new Map();
    const instrucciones = this.interfazCodigo.leerInstrucciones();

    // Construir programa completo
    for (let i = 0; i < instrucciones.length; i++) {
      const inst = instrucciones[i].trim();
      programa.set(this.memorias[i], inst);
    }

    // Filtrar solo direcciones con instrucciones válidas
    const claves = [];
    for (let i = 0; i < instrucciones.length; i++) {
      const inst = instrucciones[i].trim();
      const esInstruccion = !/^int\s+\w+\s*=\s*\d+$/i.test(inst);
      if (esInstruccion) {
        claves.push(this.memorias[i]);
      }
    }

    if (pasoActual < claves.length) {
      const direccion = claves[pasoActual];
      const instruccion = programa.get(direccion);
      const [operacion, op1, op2] = instruccion.split(/[\s,]+/);

      const registros = {
        eax: { fila: 30, columna: 8 },
        ebx: { fila: 32, columna: 8 },
        ecx: { fila: 34, columna: 8}
      };

      let destino, fuente;

      // Detectar si los operandos están invertidos
      if (registros[op1]) {
        destino = op1;
        fuente = op2;
      } else if (registros[op2]) {
        destino = op2;
        fuente = op1;
      } else {
        destino = op1;
        fuente = op2;
      }

      // Obtener valor fuente desde registro, número o variable en memoria
      let valor;
      if (registros[fuente]) {
        valor = parseInt(this.interfaz.leerDeCelda(registros[fuente].fila, registros[fuente].columna)) || 0;
      } else if (/^\d+$/.test(fuente)) {
        valor = parseInt(fuente);
      } else {
        // Buscar en memoria si fuente es una variable como "a"
        const direccionFuente = Array.from(programa.entries()).find(([_, val]) =>
          new RegExp(`int\\s+${fuente}\\s*=\\s*\\d+`, "i").test(val)
        )?.[0];

        if (direccionFuente) {
          const valorMem = programa.get(direccionFuente);
          valor = parseInt(valorMem.split("=")[1].trim());
        } else {
          throw new Error(`Fuente inválida o no encontrada: ${fuente}`);
        }
      }

      if (operacion === "mov" || operacion === "movl") {
        if (registros[destino]) {
          // Escribir en registro
          this.interfaz.escribirEnCelda(registros[destino].fila, registros[destino].columna, valor);
        } 
        else {
          // Buscar dirección de variable destino
          const direccionDestino = Array.from(programa.entries()).find(([_, val]) =>
            new RegExp(`int\\s+${destino}\\s*=`, "i").test(val)
          )?.[0];
          Logger.log(direccionDestino)

          if (direccionDestino) {
            // Calcular fila destino en hoja RAM
            const index = this.memorias.indexOf(direccionDestino);
            const filaDestino = 14 + index * 2;
            const columnaDestino = 24;
            Logger.log(filaDestino)
            this.interfaz.escribirEnCelda(18, columnaDestino, valor);
          } else {
            throw new Error(`Destino inválido o no encontrado: ${destino}`);
          }
        }

      } else if (["add", "sub", "mul"].includes(operacion)) {
        const valorActual = parseInt(this.interfaz.leerDeCelda(registros[destino].fila, registros[destino].columna)) || 0;
        let resultado;
        let simbolo;

        switch (operacion) {
          case "add":
            resultado = valorActual + valor;
            simbolo = "+";
            break;
          case "sub":
            resultado = valorActual - valor;
            simbolo = "-";
            break;
          case "mul":
            resultado = valorActual * valor;
            simbolo = "×";
            break;
        }

        this.interfaz.escribirEnCelda(56, 8, `${valorActual} ${simbolo} ${valor} = ${resultado}`);
        this.interfaz.escribirEnCelda(registros[destino].fila, registros[destino].columna, resultado);

      } else {
        throw new Error(`Operación no soportada: ${operacion}`);
      }
    }
  }

}

class SimuladorVonNeumann {
  constructor() {
    this.interfazVonNeumann = new InterfazHoja("VON NEUMANN");
    this.interfazCodigo = new InterfazHoja("Código");
    this.cpu = new CPU("VON NEUMANN");
    
  }

  cargarProgramaAlaRam() {
    
    const instrucciones = this.interfazCodigo.leerInstrucciones();
    const filaInicio = 14;
    const columna = 24;

    this.interfazVonNeumann.limpiarCelda("H41");

    for (let j = 0; j < instrucciones.length; j++) {
      const filaDestino = filaInicio + j * 2;
      const instruccion = instrucciones[j].trim();

      // Detectar declaración de variable tipo: int a = 10
      const esDeclaracion = /^int\s+\w+\s*=\s*\d+$/i.test(instruccion);

      if (esDeclaracion) {
        const valor = instruccion.split("=")[1].trim();
        this.interfazVonNeumann.escribirEnCelda(filaDestino, columna, valor);
      } else {
        this.interfazVonNeumann.escribirEnCelda(filaDestino, columna, instruccion);
      }
  
    }

  }

  ejecutarPaso() {
    const pasoActual = this.interfazVonNeumann.leerDeCelda(112, 9) || 0;
    const subpaso = this.interfazVonNeumann.leerDeCelda(113, 9) || 0;

    // fase del ciclo

    if (subpaso === 0) {
      this.cpu.fetch(pasoActual);
      this.interfazVonNeumann.escribirEnCelda(113,9,1) // avanzar a decode
    } 
    else if (subpaso === 1) {
      this.cpu.decode(pasoActual);
      this.interfazVonNeumann.escribirEnCelda(113,9,2)
    } 
    else if (subpaso === 2) {
      this.cpu.execute(pasoActual);
      this.interfazVonNeumann.escribirEnCelda(113,9,0)
      this.interfazVonNeumann.escribirEnCelda(112,9,pasoActual + 1)
      
    }
  }
  

  reiniciar() {
    this.interfazVonNeumann.escribirEnCelda(113,9,0)
    this.interfazVonNeumann.escribirEnCelda(112,9,0)
    for (let fila = 26; fila <= 32; fila++) {
      this.interfazVonNeumann.limpiarCelda(fila,8)
    }
    for (let fila = 73; fila <= 95; fila += 2) {
      this.interfazVonNeumann.limpiarCelda(fila,3)
      this.interfazVonNeumann.limpiarCelda(fila,6)
      this.interfazVonNeumann.limpiarCelda(fila,13)
      this.interfazVonNeumann.limpiarCelda(fila,15)
      this.interfazVonNeumann.limpiarCelda(fila,22)
      this.interfazVonNeumann.limpiarCelda(fila,24)
        
    }

    this.interfazVonNeumann.limpiarCelda(73,8)
    this.interfazVonNeumann.limpiarCelda(73,17)
    this.interfazVonNeumann.limpiarCelda(73,26)
    this.interfazVonNeumann.limpiarCelda("H56")
    this.interfazVonNeumann.cambiarColorCelda("H38",null)
    this.interfazVonNeumann.cambiarColorCelda("J38",null)
    this.interfazVonNeumann.cambiarColorCelda("H46",null)
    this.interfazVonNeumann.cambiarColorCelda("M17",null)
         
      

  }
}

let simulador = null;

function getSimulador() {
  if (!simulador) {
    simulador = new SimuladorVonNeumann();
  }
  return simulador;
}

function cargarCodigo() {
  getSimulador().cargarProgramaAlaRam();
}

function ejecutarPasos() {
  getSimulador().ejecutarPaso();
}

function reiniciar() {
  getSimulador().reiniciar();
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

