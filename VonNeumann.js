class InterfazHoja {
  constructor(nombreHoja) {
    this.hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nombreHoja);
  }

  leerInstrucciones() {
    
    const filaInicio = 11;
    const columna = 11;
    const totalFilas = this.hoja.getLastRow() - filaInicio + 1;

    const rango = this.hoja.getRange(filaInicio, columna, totalFilas, 1);
    const instrucciones = rango.getDisplayValues().flat();

    return instrucciones
      .map(inst => inst.trim())
      .filter(inst => inst.length > 0);


  }

  escribirEnCelda(fila, columna, valor) {
    this.hoja.getRange(fila, columna).setValue(valor);
  }

  leerDeCelda(fila, columna) {
    return this.hoja.getRange(fila, columna).getValue();
  }

  limpiarCelda(celdaOFila, columna) {
    if (typeof celdaOFila === "string" && columna === undefined) {
      this.hoja.getRange(celdaOFila).clearContent();
    } else if (typeof celdaOFila === "number" && typeof columna === "number") {
      
      this.hoja.getRange(celdaOFila, columna).clearContent();
    
    }
  }

  cambiarColorCelda(celdaOrFila, colorOrColumna, maybeColor) {
    // Support two call styles:
    // - cambiarColorCelda('A1', color)
    // - cambiarColorCelda(fila, columna, color)
    if (typeof celdaOrFila === 'string' && maybeColor === undefined) {
      // A1 notation
      this.hoja.getRange(celdaOrFila).setBackground(colorOrColumna);
    } else if (typeof celdaOrFila === 'number' && typeof colorOrColumna === 'number') {
      const color = maybeColor;
      this.hoja.getRange(celdaOrFila, colorOrColumna).setBackground(color);
    } else {
      // Fallback: try to set background using single argument
      this.hoja.getRange(celdaOrFila).setBackground(colorOrColumna);
    }
  }

  
}

class CacheLRU {
  constructor(tamano) {
    this.tamano = tamano;
    this.map = new Map();
  }

  get(direccion) {
    if (this.map.has(direccion)) {
      const valor = this.map.get(direccion);
      this.map.delete(direccion);
      this.map.set(direccion, valor);
      
      return valor;
    }
    return null;
  }

  has(direccion) {
    return this.map.has(direccion);
  }

  clear() {
    this.map.clear();
  }

  set(direccion, valor) {
    let direccionReemplazada = null;
    if (this.map.has(direccion)) {
        this.map.delete(direccion); 
    } else if (this.map.size >= this.tamano) {
      direccionReemplazada = this.map.keys().next().value;
        this.map.delete(direccionReemplazada);
    }
    this.map.set(direccion, valor);
    return direccionReemplazada;
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

  obtenerRangoCache(nivel) {
    switch (nivel) {
    case "L1":
            return { inicioFila: 73, finFila: 95, colDir: 3, colVal: 6, colEst: 7 };
    case "L2":
            return { inicioFila: 73, finFila: 95, colDir: 13, colVal: 15, colEst: 16 };
    case "L3":
            return { inicioFila: 73, finFila: 95, colDir: 22, colVal: 24, colEst: 25 };
        default:
            throw new Error(`Nivel de caché inválido: ${nivel}`);
    }
}

actualizarVisualizacionJerarquia(nivel, direccionNueva, valorNuevo, direccionReemplazada) {
    const rango = this.obtenerRangoCache(nivel);

    if (direccionReemplazada) {
        for (let fila = rango.inicioFila; fila <= rango.finFila; fila += 2) {
            const dirEnCelda = this.hoja.getRange(fila, rango.colDir).getValue();
            
            if (dirEnCelda === direccionReemplazada) {
                this.hoja.getRange(fila, rango.colDir, 1, 3).setBackground("#ea9999");
                this.hoja.getRange(fila, rango.colEst).setValue("REEMPLAZO (LRU)");
                SpreadsheetApp.flush();
          Utilities.sleep(500);
                this.hoja.getRange(fila, rango.colDir, 1, 2).clearContent();
                  this.hoja.getRange(fila, rango.colDir, 1, 3).setBackground(null);
                break;
            }
        }
    }

    let encontrado = false;
    for (let fila = rango.inicioFila; fila <= rango.finFila; fila += 2) {
        const dirEnCelda = this.hoja.getRange(fila, rango.colDir).getValue();
        
        if (!dirEnCelda) {
            this.hoja.getRange(fila, rango.colDir).setValue(direccionNueva);
            this.hoja.getRange(fila, rango.colVal).setValue(valorNuevo);
            this.hoja.getRange(fila, rango.colDir, 1, 3).setBackground("#b6d7a8");
            this.hoja.getRange(fila, rango.colEst).setValue("NUEVA ENTRADA");
            encontrado = true;
            break;
        }
    }
    
    if (!encontrado && !direccionReemplazada) {
        
    }
}
  leerMemoria(direccion, programa) {
      
    let valor = this.cacheL1.get(direccion);

    if (valor !== null && valor !== undefined) {
      Logger.log("hit en cache l1");
      this.hoja.getRange(73, 8).setValue("🟢 CACHE HIT");
      return valor;
    }

    valor = this.cacheL2.get(direccion);
    if (valor !== null && valor !== undefined) {
      Logger.log("hit en cacheL2");
      this.hoja.getRange(73, 17).setValue("🟢 CACHE HIT");
      this.cacheL1.set(direccion, valor);
      return valor;
    }

    valor = this.cacheL3.get(direccion);
    if (valor !== null && valor !== undefined) {
      Logger.log("hit en cache l3");
      this.hoja.getRange(73, 26).setValue("🟢 CACHE HIT");
      this.cacheL2.set(direccion, valor);
      this.cacheL1.set(direccion, valor);
      return valor;
    }

    this.hoja.getRange(73, 8).setValue("🔴 CACHE MISS");
    this.hoja.getRange(73, 17).setValue("🔴 CACHE MISS");
    this.hoja.getRange(73, 26).setValue("🔴 CACHE MISS");

    const valorRam = programa.get(direccion);
    if (valorRam !== undefined && valorRam !== null) {
      const reemplazoL3 = this.cacheL3.set(direccion, valorRam);
      const reemplazoL2 = this.cacheL2.set(direccion, valorRam);
      const reemplazoL1 = this.cacheL1.set(direccion, valorRam);

      this.actualizarVisualizacionJerarquia("L3", direccion, valorRam, reemplazoL3);
      this.actualizarVisualizacionJerarquia("L2", direccion, valorRam, reemplazoL2);
      this.actualizarVisualizacionJerarquia("L1", direccion, valorRam, reemplazoL1);

      return valorRam;
    }

    return undefined;
  }

  rellenarCachesDesdeHoja() {
    for (let fila = 73; fila <= 95; fila += 2) {
      const direccion = this.hoja.getRange(fila, 3).getValue();
      const valor = this.hoja.getRange(fila, 6).getValue();
      if ((direccion !== "" && direccion !== null) &&(valor !== "" && valor !== null) ) {
        this.cacheL1.set(direccion,valor)
        this.cacheL2.set(direccion,valor)
        this.cacheL3.set(direccion,valor)
      }
    }
  }
  animarCacheConHit(direccion) {
    

    const celdas = ["H38", "J38", "H46", "M17"];
    const coloresHit = ["#b6d7a8", "#f9cb9c", "#cfe2f3", "#f4cccc"];
    const colorTransito = "#d9d2e9";
    const colorMiss = "#f4cccc";

    for (let celdaRef of celdas) {
      this.hoja.getRange(celdaRef).setBackground(null);
    }

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


  manejarInterrupcion(irq) {
    const PC_CELL = { fila: 26, columna: 8 };
      const LOG_CELL = { fila: 56, columna: 8 };
    const REGISTERS = {
        eax: { fila: 30, columna: 8 },
        ebx: { fila: 32, columna: 8 },
        ecx: { fila: 34, columna: 8 }
    };
    
    const STACK_BASE_ROW = 100; 
    const RAM_COL = 24; 
    this.interfaz.escribirEnCelda(LOG_CELL.fila, LOG_CELL.columna, `⚠️ INTERRUPCIÓN ${irq} DETECTADA. Suspensión.`);
    this.interfaz.cambiarColorCelda(LOG_CELL.fila, LOG_CELL.columna, "#f4cccc");
    SpreadsheetApp.flush();
    Utilities.sleep(1500);
    try { escribirEnISoftwareA1('Interrupción: ' + irq + ' detectada. Ejecutando ISR...'); } catch(e){}
    
    const savedPC = this.interfaz.leerDeCelda(PC_CELL.fila, PC_CELL.columna);
    const savedEAX = this.interfaz.leerDeCelda(REGISTERS.eax.fila, REGISTERS.eax.columna);
    const savedEBX = this.interfaz.leerDeCelda(REGISTERS.ebx.fila, REGISTERS.ebx.columna);

    this.interfaz.escribirEnCelda(LOG_CELL.fila, LOG_CELL.columna, `Guardando PC (${savedPC}) y Registros en Pila (RAM)...`);
    this.interfaz.cambiarColorCelda(LOG_CELL.fila, LOG_CELL.columna, "#f9cb9c");
    SpreadsheetApp.flush();
    Utilities.sleep(1000);
    this.interfaz.escribirEnCelda(STACK_BASE_ROW, RAM_COL, savedPC);
    this.interfaz.escribirEnCelda(STACK_BASE_ROW + 2, RAM_COL, savedEAX);
    this.interfaz.escribirEnCelda(STACK_BASE_ROW + 4, RAM_COL, savedEBX);
    
    this.interfaz.cambiarColorCelda(STACK_BASE_ROW, RAM_COL, "#cfe2f3");
    this.interfaz.cambiarColorCelda(STACK_BASE_ROW + 2, RAM_COL, "#cfe2f3");
    this.interfaz.cambiarColorCelda(STACK_BASE_ROW + 4, RAM_COL, "#cfe2f3");
    SpreadsheetApp.flush();
    Utilities.sleep(1500);
    
    let direccionISR = "";
    let isrFunctionName = "";
    if (irq === "25H") {
        direccionISR = "0x3000"; 
        isrFunctionName = "ejecutarISR_INT1"; 
    } else if (irq === "26H") {
        direccionISR = "0x3010"; 
        isrFunctionName = "ejecutarISR_INT2";
    }

    this.interfaz.escribirEnCelda(LOG_CELL.fila, LOG_CELL.columna, `Consultando IVT... PC -> ${direccionISR}`);
    this.interfaz.cambiarColorCelda(LOG_CELL.fila, LOG_CELL.columna, "#b6d7a8");
    SpreadsheetApp.flush();
    Utilities.sleep(1000);
    this.interfaz.escribirEnCelda(PC_CELL.fila, PC_CELL.columna, direccionISR);
    this.interfaz.cambiarColorCelda(PC_CELL.fila, PC_CELL.columna, "#b6d7a8");
    SpreadsheetApp.flush();
    Utilities.sleep(1000);
    this.interfaz.escribirEnCelda(LOG_CELL.fila, LOG_CELL.columna, `Ejecutando ISR (${isrFunctionName})...`);
    this.interfaz.cambiarColorCelda(LOG_CELL.fila, LOG_CELL.columna, "#93c47d"); 
    SpreadsheetApp.flush();
    Utilities.sleep(500);
    
    if (typeof globalThis[isrFunctionName] === 'function') {
      // Delegate actual ISR execution to the Orquestador for safer integration
      if (typeof globalThis.orquestadorSimulador === 'object' && typeof globalThis.orquestadorSimulador.executeISR === 'function') {
        globalThis.orquestadorSimulador.executeISR(isrFunctionName);
      } else {
        globalThis[isrFunctionName]();
      }
    } else {
      Logger.log(`ISR no encontrada: ${isrFunctionName}`);
    }
    this.interfaz.escribirEnCelda(LOG_CELL.fila, LOG_CELL.columna, "ISR Terminada. Restaurando Contexto...");
    this.interfaz.cambiarColorCelda(LOG_CELL.fila, LOG_CELL.columna, "#ffeb3b");
    SpreadsheetApp.flush();
    Utilities.sleep(1500);
    this.interfaz.escribirEnCelda(PC_CELL.fila, PC_CELL.columna, savedPC);
    this.interfaz.escribirEnCelda(REGISTERS.eax.fila, REGISTERS.eax.columna, savedEAX);
    this.interfaz.escribirEnCelda(REGISTERS.ebx.fila, REGISTERS.ebx.columna, savedEBX);
    
    this.interfaz.cambiarColorCelda(STACK_BASE_ROW, RAM_COL, null);
    this.interfaz.cambiarColorCelda(STACK_BASE_ROW + 2, RAM_COL, null);
    this.interfaz.cambiarColorCelda(STACK_BASE_ROW + 4, RAM_COL, null);
    limpiarBanderaInterrupcion(); 
    this.interfaz.cambiarColorCelda(PC_CELL.fila, PC_CELL.columna, null);
    this.interfaz.cambiarColorCelda(LOG_CELL.fila, LOG_CELL.columna, null);
    this.interfaz.escribirEnCelda(LOG_CELL.fila, LOG_CELL.columna, null);
    this.interfaz.escribirEnCelda(113, 9, 0);
    SpreadsheetApp.flush();
    try { escribirEnISoftwareA1('ISR ' + irq + ' finalizada. Resumen en LOG.'); } catch(e){}
}

  // Allow external orchestrator to trigger an immediate IRQ handling
  checkAndHandleIRQ() {
    try {
      const irq = typeof globalThis.obtenerCodigoIRQ === 'function' ? globalThis.obtenerCodigoIRQ() : null;
      if (irq) {
        this.cpu.manejarInterrupcion(irq);
        return true;
      }
    } catch (e) {
      Logger.log('checkAndHandleIRQ error: ' + e.message);
    }
    return false;
  }
  fetch(pasoActual) {
    


    
    const fila = 26;
    const columna = 8;
    this.interfaz.limpiarCelda("H56");

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
    this.interfaz.cambiarColorCelda("O27", null);
    this.interfaz.cambiarColorCelda("U18", "#ffeb3b");
    this.interfaz.cambiarColorCelda("U20", "#ffeb3b");
    this.interfaz.cambiarColorCelda("U22", "#ffeb3b");
    this.cachesCPU.rellenarCachesDesdeHoja();

    for (let i = 0; i < instrucciones.length; i++) {
      const inst = instrucciones[i].trim();
      programa.set(this.memorias[i], inst);
    }
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
      const instruccion = this.cachesCPU.leerMemoria(direccion, programa);
      this.cachesCPU.animarCacheConHit(direccion);
      this.interfaz.escribirEnCelda(fila, columna, instruccion);

      // Mostrar símbolo de operación en E58 cuando corresponda
      try {
        const operacion = (instruccion || '').split(/[\s,]+/)[0]?.toLowerCase();
        let simbolo = '';
        if (operacion === 'add') simbolo = '+';
        else if (operacion === 'sub') simbolo = '-';
        else if (operacion === 'mul') simbolo = '×';
        else if (operacion === 'mov' || operacion === 'movl') simbolo = 'mov';
        this.interfaz.escribirEnCelda(58, 5, simbolo);
        // Sincronizar el símbolo con i-software!L28 para visibilidad de I/O
        try {
          const ss = SpreadsheetApp.getActiveSpreadsheet();
          const i = ss.getSheetByName('i-software');
          if (i) i.getRange('L28').setValue(simbolo);
        } catch (err) {
          Logger.log('No se pudo sincronizar E58->i-software L28: ' + err.message);
        }
      } catch (e) {
        Logger.log('No se pudo escribir símbolo en E58: ' + e.message);
      }
    }

    if (pasoActual + 1 < claves.length) {
      this.fetch(pasoActual + 1);
    }
  }

  

  execute(pasoActual) {
    const programa = new Map();
    const instrucciones = this.interfazCodigo.leerInstrucciones();

    for (let i = 0; i < instrucciones.length; i++) {
      const inst = instrucciones[i].trim();
      programa.set(this.memorias[i], inst);
    }
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
      let valor;
      if (registros[fuente]) {
        valor = parseInt(this.interfaz.leerDeCelda(registros[fuente].fila, registros[fuente].columna)) || 0;
      } else if (/^\d+$/.test(fuente)) {
        valor = parseInt(fuente);
      } else {
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

      // Determinar valor actual del destino (operand1) y del operando fuente (operand2)
      let valorDestinoActual = null;
      try {
        if (registros[destino]) {
          valorDestinoActual = parseInt(this.interfaz.leerDeCelda(registros[destino].fila, registros[destino].columna)) || 0;
        } else {
          const direccionDestino = Array.from(programa.entries()).find(([_, val]) =>
            new RegExp(`int\\s+${destino}\\s*=`, "i").test(val)
          )?.[0];
          if (direccionDestino) {
            const index = this.memorias.indexOf(direccionDestino);
            const filaDestino = 14 + index * 2;
            const columnaDestino = 24;
            const memVal = this.interfaz.leerDeCelda(filaDestino, columnaDestino);
            valorDestinoActual = parseInt(memVal) || 0;
          }
        }
      } catch (e) {
        Logger.log('No se pudo determinar valor destino actual: ' + e.message);
      }

      // Mostrar operandos listos en H53 (operand1) y J53 (operand2)
      try {
        this.interfaz.escribirEnCelda(53, 8, valorDestinoActual !== null ? valorDestinoActual : '');
        this.interfaz.escribirEnCelda(53, 10, valor !== undefined && valor !== null ? valor : '');
      } catch (e) { Logger.log('No se pudo mostrar operandos en H53/J53: ' + e.message); }

      // Mostrar el operando que será leído por la ALU en E68 (columna E = 5)
      try {
        this.interfaz.escribirEnCelda(68, 5, valor);
      } catch (e) {
        Logger.log('No se pudo mostrar el operando en E68: ' + e.message);
      }

      if (operacion === "mov" || operacion === "movl") {
        if (registros[destino]) {
          this.interfaz.escribirEnCelda(registros[destino].fila, registros[destino].columna, valor);
        } 
        else {
          const direccionDestino = Array.from(programa.entries()).find(([_, val]) =>
            new RegExp(`int\\s+${destino}\\s*=`, "i").test(val)
          )?.[0];
          Logger.log(direccionDestino)

          if (direccionDestino) {
            const index = this.memorias.indexOf(direccionDestino);
            const filaDestino = 14 + index * 2;
            const columnaDestino = 24;
            Logger.log(filaDestino)
            this.interfaz.escribirEnCelda(18, columnaDestino, valor);
          } else {
            throw new Error(`Destino inválido o no encontrado: ${destino}`);
          }
        }

        // Limpiar visual del operando una vez aplicada la operación
        try { this.interfaz.limpiarCelda('E68'); this.interfaz.cambiarColorCelda('E68', null); } catch (e) {}

        // Limpiar casillas de operandos H53/J53
        try { this.interfaz.limpiarCelda(53, 8); this.interfaz.limpiarCelda(53, 10); } catch(e) {}

        // Limpiar símbolo de operación en E58 y sincronizar limpieza con i-software!L28
        try { this.interfaz.limpiarCelda('E58'); } catch (e) {}
        try { const ss = SpreadsheetApp.getActiveSpreadsheet(); const i = ss.getSheetByName('i-software'); if (i) i.getRange('L28').setValue(''); } catch(e) {}

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

        // Limpiar visual del operando una vez aplicada la operación
        try { this.interfaz.limpiarCelda('E68'); this.interfaz.cambiarColorCelda('E68', null); } catch (e) {}

        // Limpiar casillas de operandos H53/J53
        try { this.interfaz.limpiarCelda(53, 8); this.interfaz.limpiarCelda(53, 10); } catch(e) {}

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
    // Flag para controlar la ejecución continua (detener desde UI)
    this._detener = false;
    
  }

  cargarProgramaAlaRam() {
    
    const instrucciones = this.interfazCodigo.leerInstrucciones();
    const filaInicio = 14;
    const columna = 24;

    this.interfazVonNeumann.limpiarCelda("H41");

    for (let j = 0; j < instrucciones.length; j++) {
      const filaDestino = filaInicio + j * 2;
      const instruccion = instrucciones[j].trim();

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
    const irq = obtenerCodigoIRQ();
    
    if (irq) {
      try { escribirEnISoftwareA1('Interrupción detectada: ' + irq); } catch(e){}
      this.cpu.manejarInterrupcion(irq); 
      try { escribirEnISoftwareA1('Interrupción procesada: ' + irq); } catch(e){}
      return;
    }

    if (subpaso === 0) {
      try { escribirEnISoftwareA1('Ejecución: FETCH paso ' + pasoActual); } catch(e){}
      this.cpu.fetch(pasoActual);
      this.interfazVonNeumann.escribirEnCelda(113,9,1)
    } 
    else if (subpaso === 1) {
      try { escribirEnISoftwareA1('Ejecución: DECODE paso ' + pasoActual); } catch(e){}
      this.cpu.decode(pasoActual);
      this.interfazVonNeumann.escribirEnCelda(113,9,2)
    } 
    else if (subpaso === 2) {
      try { escribirEnISoftwareA1('Ejecución: EXECUTE paso ' + pasoActual); } catch(e){}
      this.cpu.execute(pasoActual);
      this.interfazVonNeumann.escribirEnCelda(113,9,0)
      this.interfazVonNeumann.escribirEnCelda(112,9,pasoActual + 1)
      try { escribirEnISoftwareA1('Ejecución: paso ' + pasoActual + ' completado'); } catch(e){}
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
    // Limpiar casillas de operandos preparadas
    try { this.interfazVonNeumann.limpiarCelda(53,8); this.interfazVonNeumann.limpiarCelda(53,10); } catch(e) {}
    this.interfazVonNeumann.cambiarColorCelda("H38",null)
    this.interfazVonNeumann.cambiarColorCelda("J38",null)
    this.interfazVonNeumann.cambiarColorCelda("H46",null)
    this.interfazVonNeumann.cambiarColorCelda("M17",null)
    // Limpiar E58 (símbolo de operación) y sincronizar con i-software!L28
    try { this.interfazVonNeumann.limpiarCelda('E58'); } catch (e) {}
    try { const ss = SpreadsheetApp.getActiveSpreadsheet(); const i = ss.getSheetByName('i-software'); if (i) i.getRange('L28').setValue(''); } catch(e) {}
    // Reiniciar bandera de detener ejecución
    try { this._detener = false; } catch(e) {}
    // Limpiar tabla de Memoria Virtual (AE73..AH136) y contadores
    try {
      const hoja = this.interfazVonNeumann.hoja;
      for (let row = 73; row <= 136; row++) {
        hoja.getRange(row, 31).clearContent(); // AE: direccion/página
        hoja.getRange(row, 33).clearContent(); // AG: valor
        hoja.getRange(row, 34).clearContent(); // AH: estado
      }
      hoja.getRange(70, 31).clearContent(); // AE70 label
      hoja.getRange(70, 33).clearContent(); // AG70 value (page faults)
      hoja.getRange(71, 31).clearContent(); // AE71 label
      hoja.getRange(71, 33).clearContent(); // AG71 value (swaps)
    } catch(e) {}
         

  // VM methods implemented as prototypes below to ensure compatibility with the runtime
      

  }
}

let simulador = null;

// Implement VM methods on the prototype for wider compatibility
SimuladorVonNeumann.prototype.inicializarMemoriaVirtual = function(entries, startRow, startCol) {
  if (typeof entries === 'undefined' || entries === null) entries = 64;
  if (typeof startRow === 'undefined' || startRow === null) startRow = 73;
  if (typeof startCol === 'undefined' || startCol === null) startCol = 31; // AE
  try {
    var hoja = this.interfazVonNeumann.hoja;
    this.vm = {
      entries: entries,
      pageSize: 1,
      frameCapacity: 16,
      startRow: startRow,
      startCol: startCol,
      colAddress: startCol,
      colValue: startCol + 2,
      colState: startCol + 3,
      swapBaseRow: startRow + entries,
      pageTable: new Array(entries).fill(null).map(function(){ return { state: 'SWAP', frame: null }; }),
      frameToPage: new Array(16).fill(null),
      nextVictim: 0,
      pageFaults: 0,
      swaps: 0
    };

    hoja.getRange(startRow - 1, this.vm.colAddress).setValue('VM Page');
    hoja.getRange(startRow - 1, this.vm.colValue).setValue('Value');
    hoja.getRange(startRow - 1, this.vm.colState).setValue('State');

    for (var i = 0; i < entries; i++) {
      var row = startRow + i;
      hoja.getRange(row, this.vm.colAddress).setValue(i);
      hoja.getRange(row, this.vm.colValue).setValue('');
      hoja.getRange(row, this.vm.colState).setValue('SWAP');
    }

    hoja.getRange(startRow - 3, this.vm.colAddress).setValue('Page Faults');
    hoja.getRange(startRow - 3, this.vm.colValue).setValue(0);
    hoja.getRange(startRow - 2, this.vm.colAddress).setValue('Swaps');
    hoja.getRange(startRow - 2, this.vm.colValue).setValue(0);

    SpreadsheetApp.flush();
    return true;
  } catch (e) {
    Logger.log('inicializarMemoriaVirtual error: ' + e.message);
    return false;
  }
};

SimuladorVonNeumann.prototype.accederMemoriaVirtual = function(pageIndex) {
  try {
    if (!this.vm || pageIndex < 0 || pageIndex >= this.vm.entries) throw new Error('Página inválida');
    var hoja = this.interfazVonNeumann.hoja;
    var entry = this.vm.pageTable[pageIndex];

    if (entry && entry.state && entry.state.indexOf('RAM') === 0) {
      var frame = entry.frame;
      var filaRam = this.getRamRowForFrame(frame);
      var valor = hoja.getRange(filaRam, 24).getValue();
      hoja.getRange(73, 8).setValue('🟢 VM HIT');
      SpreadsheetApp.flush();
      return { hit: true, page: pageIndex, frame: frame, value: valor };
    }

    // Page fault
    this.vm.pageFaults++;
    hoja.getRange(this.vm.startRow - 3, this.vm.colValue).setValue(this.vm.pageFaults);
    hoja.getRange(73, 8).setValue('🔴 VM PAGE FAULT');

    var frame = this.vm.frameToPage.indexOf(null);
    var swappedOut = false;
    if (frame === -1) {
      frame = this.vm.nextVictim;
      var victimPage = this.vm.frameToPage[frame];
      if (victimPage !== null && typeof victimPage !== 'undefined') {
        var filaVictimRam = this.getRamRowForFrame(frame);
        var valorVictim = hoja.getRange(filaVictimRam, 24).getValue();
        var filaSwap = this.vm.swapBaseRow + victimPage;
        hoja.getRange(filaSwap, this.vm.colAddress).setValue(victimPage);
        hoja.getRange(filaSwap, this.vm.colValue).setValue(valorVictim);
        hoja.getRange(filaSwap, this.vm.colState).setValue('SWAPPED_OUT');
        this.vm.pageTable[victimPage].state = 'SWAP';
        this.vm.pageTable[victimPage].frame = null;
        this.vm.swaps++;
        hoja.getRange(this.vm.startRow - 2, this.vm.colValue).setValue(this.vm.swaps);
        swappedOut = true;
      }
      this.vm.nextVictim = (this.vm.nextVictim + 1) % this.vm.frameCapacity;
    }

    this.vm.frameToPage[frame] = pageIndex;
    var filaSwapSrc = this.vm.swapBaseRow + pageIndex;
    var valorPagina = hoja.getRange(filaSwapSrc, this.vm.colValue).getValue();
    if (valorPagina === '' || valorPagina === null) valorPagina = 0;

    var filaRamDestino = this.getRamRowForFrame(frame);
    hoja.getRange(filaRamDestino, 24).setValue(valorPagina);

    this.vm.pageTable[pageIndex].state = 'RAM f=' + frame;
    this.vm.pageTable[pageIndex].frame = frame;
    var rowVm = this.vm.startRow + pageIndex;
    hoja.getRange(rowVm, this.vm.colValue).setValue(valorPagina);
    hoja.getRange(rowVm, this.vm.colState).setValue('RAM f=' + frame);

    SpreadsheetApp.flush();
    return { hit: false, page: pageIndex, frame: frame, swappedOut: swappedOut, value: valorPagina };
  } catch (e) {
    Logger.log('accederMemoriaVirtual error: ' + e.message);
    return null;
  }
};

SimuladorVonNeumann.prototype.mostrarEstadoVM = function() {
  try {
    if (!this.vm) return null;
    return {
      entries: this.vm.entries,
      pageFaults: this.vm.pageFaults,
      swaps: this.vm.swaps,
      frames: this.vm.frameToPage.slice(),
      pageTable: this.vm.pageTable.map(function(p, i) { return { page: i, state: p.state, frame: p.frame }; })
    };
  } catch (e) { Logger.log('mostrarEstadoVM error: ' + e.message); return null; }
};

// Ejecuta todos los pasos automáticamente hasta terminar o hasta que se llame a detenerEjecucion().
SimuladorVonNeumann.prototype.ejecutarTodo = function(delayMs, maxSteps) {
  if (typeof delayMs === 'undefined') delayMs = 300;
  if (typeof maxSteps === 'undefined') maxSteps = 10000;
  try {
    this._detener = false;
    var instrucciones = this.interfazCodigo.leerInstrucciones().filter(function(inst) { return inst && !/^int\s+\w+\s*=\s*\d+$/i.test(inst); });
    var total = instrucciones.length;
    var pasos = 0;
    try { escribirEnISoftwareA1('Ejecución continua iniciada'); } catch(e){}
    while (!this._detener) {
      var pasoActual = this.interfazVonNeumann.leerDeCelda(112,9) || 0;
      if (pasoActual >= total) break;
      this.ejecutarPaso();
      pasos++;
      if (pasos >= maxSteps) {
        Logger.log('ejecutarTodo: alcanzado maxSteps, abortando');
        break;
      }
      SpreadsheetApp.flush();
      Utilities.sleep(delayMs);
    }
    try { escribirEnISoftwareA1('Ejecución continua finalizada'); } catch(e){}
    return true;
  } catch (e) {
    Logger.log('ejecutarTodo error: ' + e.message);
    try { escribirEnISoftwareA1('Ejecución continua abortada: ' + e.message); } catch(e){}
    return false;
  }
};

SimuladorVonNeumann.prototype.detenerEjecucion = function() {
  try {
    this._detener = true;
    try { escribirEnISoftwareA1('Ejecución detenida por usuario'); } catch(e){}
    return true;
  } catch(e) { Logger.log('detenerEjecucion error: ' + e.message); try { escribirEnISoftwareA1('Error al detener ejecución: ' + e.message); } catch(e){}; return false; }
};

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

// Ejecuta todo el programa hasta el final (o hasta que se llame a detenerEjecucion)
function ejecutarTodo() {
  const res = getSimulador().ejecutarTodo();
  Logger.log('ejecutarTodo: ' + res);
  return res;
}

// Detiene una ejecución en curso iniciada por ejecutarTodo()
function detenerEjecucion() {
  const res = getSimulador().detenerEjecucion();
  Logger.log('detenerEjecucion: ' + res);
  return res;
}

function reiniciar() {
  getSimulador().reiniciar();
}

// Wrappers para probar Memoria Virtual desde el editor
function ejecutarInicializarVM() {
  const res = getSimulador().inicializarMemoriaVirtual(64);
  Logger.log('inicializarMemoriaVirtual: ' + res);
  return res;
}

function ejecutarAccesoVM(pageIndex) {
  const res = getSimulador().accederMemoriaVirtual(pageIndex);
  Logger.log('accederMemoriaVirtual: ' + JSON.stringify(res));
  return res;
}

function ejecutarMostrarVM() {
  const res = getSimulador().mostrarEstadoVM();
  Logger.log(JSON.stringify(res, null, 2));
  return res;
}

/**
 * Escribe un mensaje visible en la celda A1 de la hoja `i-software`.
 */
function escribirEnISoftwareA1(msg) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const hoja = ss.getSheetByName('i-software');
    if (hoja) hoja.getRange('A1').setValue(msg);
  } catch (e) {
    Logger.log('escribirEnISoftwareA1 error: ' + e.message);
  }
}















function onEdit(e) {
  const hoja = e.source.getSheetByName("Código");
  const rango = e.range;

  if (hoja.getName() === "Código" && rango.getColumn() === 11 && rango.getRow() >= 11) {
    const fila = rango.getRow();
    const valor = rango.getValue();

    
    if (valor && valor.toString().trim() !== "") {
      hoja.getRange(fila, 10).setValue(fila - 10);
    } else {
      hoja.getRange(fila, 10).clearContent();
    }
  }
}

