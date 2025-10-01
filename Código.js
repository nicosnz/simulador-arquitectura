/*function extraerInstrucciones() {
  //SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getRange("C4").setValue(122)
  
  // Abrir la hoja "Código"
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Obtener todas las instrucciones (columna B)
  const rango = hoja.getRange(4, 3, hoja.getLastRow() - 1); // desde fila 2
  const instrucciones = rango.getValues().flat(); // array plano
  
  // Limpiar el array de instrucciones vacías
  const programa = instrucciones.filter(inst => inst && inst.trim() !== "");
  
  Logger.log(programa);
  
}*/
function leerCodigo() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Código");
  const rango = hoja.getRange(2, 2, hoja.getLastRow() - 1); // columna B
  const instrucciones = rango.getValues().flat();
  const programa = instrucciones.filter(inst => inst && inst.trim() !== "");
  Logger.log(programa) 
  return programa;
}

function ejecutarPrograma() {
  const programa = leerCodigo();
  for (let i = 0; i < programa.length; i++) {
    Logger.log(programa[i])
    ejecutarInstruccion(programa[i]);
  }
}

function ejecutarInstruccion(instr) {
  const partes = instr.trim().split(/[\s,]+/);
  Logger.log(partes)
  const op = partes[0].toUpperCase(); 
  const dest = partes[1].toUpperCase();
  const src = partes[2];

  const hojaCPU = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("CPU");

  if (op === "MOV") {
    let valor;
    if (["AX","BX","CX","DX"].includes(src.toUpperCase())) {
      valor = obtenerValorRegistro(src, hojaCPU);
    } else {
      valor = parseInt(src, 10);
    }
    actualizarRegistro(dest, valor, hojaCPU);
  } 
  else if (op === "ADD") {
    let valDest = obtenerValorRegistro(dest, hojaCPU);
    let valSrc = (["AX","BX","CX","DX"].includes(src.toUpperCase())) 
                 ? obtenerValorRegistro(src, hojaCPU) 
                 : parseInt(src, 10);
    actualizarRegistro(dest, valDest + valSrc, hojaCPU);
  }
}

function obtenerValorRegistro(nombre, hojaCPU) {
  const rango = hojaCPU.getRange(2, 1, hojaCPU.getLastRow() - 1, 2).getValues();
  for (let i = 0; i < rango.length; i++) {
    if (rango[i][0].toUpperCase() === nombre.toUpperCase()) {
      return parseInt(rango[i][1], 10);
    }
  }
  return 0;
}

function actualizarRegistro(nombre, valor, hojaCPU) {
  const rango = hojaCPU.getRange(2, 1, hojaCPU.getLastRow() - 1, 2).getValues();
  for (let i = 0; i < rango.length; i++) {
    if (rango[i][0].toUpperCase() === nombre.toUpperCase()) {
      hojaCPU.getRange(i + 2, 2).setValue(valor); // col 2 = valores
    }
  }
}


