// OrquestadorSimulador: integra I-Software y VonNeumann de forma segura
class OrquestadorSimulador {
  constructor() {
    this.von = new SimuladorVonNeumann();
    // Reutilizamos las funciones existentes de I-Software si están presentes
  }

  loadProgram() {
    // Cargar el contenido de la hoja Código a la RAM del simulador Von Neumann
    try {
      this.von.cargarProgramaAlaRam();
      return true;
    } catch (e) {
      Logger.log('Orquestador.loadProgram error: ' + e.message);
      return false;
    }
  }

  step() {
    try {
      this.von.ejecutarPaso();
      return true;
    } catch (e) {
      Logger.log('Orquestador.step error: ' + e.message);
      return false;
    }
  }

  triggerIRQ(code) {
    // code expected like '25H' or '26H'
    try {
      // Set the IRQ cell in i-software so the existing helpers can see it
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const hoja = ss.getSheetByName('i-software');
      if (hoja) {
        hoja.getRange('S43').setValue(code);
        // optional: call the visual helper if present
        if (typeof globalThis.simularPulsacionTecla1 === 'function') {
          globalThis.simularPulsacionTecla1();
        }
      }
      // Notify VonNeumann simulator to handle interrupts immediately if possible
      if (typeof this.von.checkAndHandleIRQ === 'function') {
        this.von.checkAndHandleIRQ();
      } else if (typeof this.von.ejecutarPaso === 'function') {
        // fallback: execute one step so the simulator can detect the IRQ
        try { this.von.ejecutarPaso(); } catch (e) {}
      }
      return true;
    } catch (e) {
      Logger.log('Orquestador.triggerIRQ error: ' + e.message);
      return false;
    }
  }

  clearIRQ() {
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const hoja = ss.getSheetByName('i-software');
      if (hoja) {
        hoja.getRange('S43').setValue(null);
        hoja.getRange('S53').setBackground(null);
      }
      if (typeof globalThis.limpiarBanderaInterrupcion === 'function') {
        globalThis.limpiarBanderaInterrupcion();
      }
      return true;
    } catch (e) {
      Logger.log('Orquestador.clearIRQ error: ' + e.message);
      return false;
    }
  }

  executeISR(name) {
    try {
      // Mark ISR execution visibly in i-software for user feedback
      try {
        const ss = SpreadsheetApp.getActiveSpreadsheet();
        const i = ss.getSheetByName('i-software');
        if (i) {
          const msg = name + ' ejecutada ' + (new Date()).toLocaleTimeString();
          try { i.getRange('A1').setValue(msg); } catch(e) {}
        }
      } catch (e) {
        Logger.log('executeISR annotate error: ' + e.message);
      }

      if (typeof globalThis[name] === 'function') {
        globalThis[name]();
      } else {
        Logger.log('ISR no encontrada: ' + name);
      }
    } catch (e) {
      Logger.log('Orquestador.executeISR error: ' + e.message);
    }
  }

  smokeTestIntegration() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const missing = ['i-software', 'VON NEUMANN', 'Código'].filter(n => !ss.getSheetByName(n));
    if (missing.length) return 'Faltan hojas: ' + missing.join(', ');
    // quick round-trip test E68 and LOG
    const vhn = ss.getSheetByName('VON NEUMANN');
    const i = ss.getSheetByName('i-software');
    try {
      vhn.getRange('E68').setValue('42');
      i.getRange('S43').setValue('25H');
      // cleanup
      vhn.getRange('E68').clearContent();
      i.getRange('S43').setValue(null);
      return 'Smoke test passed';
    } catch (e) {
      return 'Smoke test failed: ' + e.message;
    }
  }
}

// Exponer orquestador globalmente para llamadas rápidas desde UI
if (typeof globalThis.orquestadorSimulador === 'undefined') {
  globalThis.orquestadorSimulador = new OrquestadorSimulador();
}

// Wrappers para ejecutar pruebas desde el editor de Apps Script
function ejecutarSmokeTestOrquestador() {
  const res = globalThis.orquestadorSimulador.smokeTestIntegration();
  Logger.log(res);
  return res;
}

function ejecutarPruebaIRQ25() {
  const orch = globalThis.orquestadorSimulador;
  const resultado = { load: false, trigger: false, step: false, e68: null, log: null };
  try {
    resultado.load = orch.loadProgram();
  } catch (e) { Logger.log('Load failed: ' + e.message); }
  try {
    resultado.trigger = orch.triggerIRQ('25H');
  } catch (e) { Logger.log('Trigger failed: ' + e.message); }
  try {
    resultado.step = orch.step();
  } catch (e) { Logger.log('Step failed: ' + e.message); }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const vhn = ss.getSheetByName('VON NEUMANN');
    if (vhn) {
      resultado.e68 = vhn.getRange('E68').getDisplayValue();
      resultado.log = vhn.getRange(56, 8).getDisplayValue();
    }
  } catch (e) { Logger.log('Read cells failed: ' + e.message); }

  Logger.log(JSON.stringify(resultado));
  return resultado;
}

// Mapeo y anotaciones para sincronización entre hojas
OrquestadorSimulador.prototype.getMappings = function() {
  return {
    Codigo: {
      instrucciones: { sheet: 'Código', startRow: 11, column: 11, note: 'Lista de instrucciones (leer desde aquí para cargar programa)' }
    },
    VonNeumann: {
      LOG: { sheet: 'VON NEUMANN', row: 56, col: 8, note: 'LOG: mensajes y estado de interrupciones' },
      PC: { sheet: 'VON NEUMANN', row: 26, col: 8, note: 'PC: dirección de instrucción actual' },
      EAX: { sheet: 'VON NEUMANN', row: 30, col: 8, note: 'Registro EAX' },
      EBX: { sheet: 'VON NEUMANN', row: 32, col: 8, note: 'Registro EBX' },
      ECX: { sheet: 'VON NEUMANN', row: 34, col: 8, note: 'Registro ECX' },
      OPERANDO_ALU: { sheet: 'VON NEUMANN', cellA1: 'E68', note: 'Operando leído por la ALU (se mostrará aquí)' },
      RAM_BASE: { sheet: 'VON NEUMANN', startRow: 14, column: 24, note: 'RAM: espacio donde se cargan instrucciones/datos' },
      CACHE_L1: { sheet: 'VON NEUMANN', rows: '73-95 step 2', cols: { dir: 3, val: 6, est: 7 }, note: 'Cache L1 (bloques pares: dir/valor/estado)' },
      CACHE_L2: { sheet: 'VON NEUMANN', rows: '73-95 step 2', cols: { dir: 13, val: 15, est: 16 }, note: 'Cache L2' },
      CACHE_L3: { sheet: 'VON NEUMANN', rows: '73-95 step 2', cols: { dir: 22, val: 24, est: 25 }, note: 'Cache L3' }
    },
    iSoftware: {
      IRQ_FLAG: { sheet: 'i-software', cellA1: 'S43', note: 'IRQ pendiente (por ejemplo: 25H, 26H)' },
      PIC_VISUAL: { sheet: 'i-software', cells: ['S53','S54'], note: 'Indicadores visuales del PIC (IMR/IRR)' },
      CONTROL_RUN: { sheet: 'i-software', cells: ['K146','K147','K148','K149'], note: 'Controles de estado del simulador (RUN, contadores)' }
    }
  };
}

OrquestadorSimulador.prototype.annotateMapping = function() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const map = this.getMappings();
  const notesSet = [];
  for (const groupKey of Object.keys(map)) {
    const group = map[groupKey];
    for (const key of Object.keys(group)) {
      const meta = group[key];
      try {
        const hoja = ss.getSheetByName(meta.sheet);
        if (!hoja) continue;
        if (meta.cellA1) {
          hoja.getRange(meta.cellA1).setNote(meta.note);
          notesSet.push(meta.sheet + '!' + meta.cellA1 + ' → ' + meta.note);
        } else if (meta.row && meta.col) {
          hoja.getRange(meta.row, meta.col).setNote(meta.note);
          notesSet.push(meta.sheet + '!' + meta.row + ',' + meta.col + ' → ' + meta.note);
        } else if (meta.cells && Array.isArray(meta.cells)) {
          meta.cells.forEach(c => { try { hoja.getRange(c).setNote(meta.note); notesSet.push(meta.sheet + '!' + c + ' → ' + meta.note); } catch(e){} });
        } else if (meta.startRow && meta.column) {
          try { hoja.getRange(meta.startRow - 1, meta.column).setNote(meta.note); notesSet.push(meta.sheet + '!' + (meta.startRow-1) + ',' + meta.column + ' → ' + meta.note);} catch(e){}
        } else if (meta.rows && meta.cols) {
          try { hoja.getRange(73, meta.cols.dir).setNote(meta.note); notesSet.push(meta.sheet + '!73,' + meta.cols.dir + ' → ' + meta.note);} catch(e){}
        }
      } catch (e) {
        Logger.log('annotateMapping failed for ' + key + ': ' + e.message);
      }
    }
  }
  return notesSet;
}

OrquestadorSimulador.prototype.clearAnnotations = function() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const map = this.getMappings();
  for (const groupKey of Object.keys(map)) {
    const group = map[groupKey];
    for (const key of Object.keys(group)) {
      const meta = group[key];
      try {
        const hoja = ss.getSheetByName(meta.sheet);
        if (!hoja) continue;
        if (meta.cellA1) {
          hoja.getRange(meta.cellA1).setNote('');
        } else if (meta.row && meta.col) {
          hoja.getRange(meta.row, meta.col).setNote('');
        } else if (meta.cells && Array.isArray(meta.cells)) {
          meta.cells.forEach(c => { try { hoja.getRange(c).setNote(''); } catch(e){} });
        } else if (meta.startRow && meta.column) {
          try { hoja.getRange(meta.startRow - 1, meta.column).setNote(''); } catch(e){}
        } else if (meta.rows && meta.cols) {
          try { hoja.getRange(73, meta.cols.dir).setNote(''); } catch(e){}
        }
      } catch (e) {
        Logger.log('clearAnnotations failed for ' + key + ': ' + e.message);
      }
    }
  }
  return true;
}

function ejecutarAnotarMapeo() {
  const res = globalThis.orquestadorSimulador.annotateMapping();
  Logger.log(JSON.stringify(res));
  return res;
}

function ejecutarLimpiarAnotaciones() {
  const res = globalThis.orquestadorSimulador.clearAnnotations();
  Logger.log('Annotations cleared: ' + res);
  return res;
}

function ejecutarMostrarMapeo() {
  const map = globalThis.orquestadorSimulador.getMappings();
  Logger.log(JSON.stringify(map, null, 2));
  return map;
}
