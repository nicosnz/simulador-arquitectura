/******************************************
 * PIPELINE COMPARADO: Von Neumann vs Harvard
 ******************************************/

// ---------------------------
// Inicializar la hoja Pipeline
// ---------------------------
function inicializarPipelineComparado() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Pipeline");

  // Limpiar Von Neumann (filas 2-21, columnas A-L)
  hoja.getRange(2, 1, 20, 12).clearContent();
  hoja.getRange(2, 1, 20, 12).clearFormat();

  // Limpiar Harvard (filas 26-45, columnas A-L)
  hoja.getRange(26, 1, 20, 12).clearContent();
  hoja.getRange(26, 1, 20, 12).clearFormat();

  // Reiniciar contadores
  hoja.getRange("D71").setValue(0);  // VN
  hoja.getRange("F71").setValue(0); // Harvard

  SpreadsheetApp.getActiveSpreadsheet().toast("Pipeline inicializado ✅", "Estado");
}

// ---------------------------
// Avanzar ambos pipelines
// ---------------------------
function avanzarPipelineComparado() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hojaCodigo = ss.getSheetByName("Código");
  const hojaPipeline = ss.getSheetByName("Pipeline");

  // ---------------------------
  // 1️⃣ Leer instrucciones desde la hoja Código
  // ---------------------------
  const filaInicio = 11;
  const colCodigo = 11;
  const totalFilas = hojaCodigo.getLastRow() - filaInicio + 1;

  const instrucciones = hojaCodigo.getRange(filaInicio, colCodigo, totalFilas, 1)
    .getDisplayValues()
    .flat()
    .filter(inst => inst && inst.trim() !== "");

  if (instrucciones.length === 0) {
    SpreadsheetApp.getUi().alert("No hay instrucciones cargadas en la hoja Código.");
    return;
  }

  // ---------------------------
  // 2️⃣ Obtener ciclos actuales
  // ---------------------------
  let cicloVN = parseInt(hojaPipeline.getRange("D71").getValue() || 0, 10) + 1;
  let cicloH  = parseInt(hojaPipeline.getRange("F71").getValue() || 0, 10) + 1;

  hojaPipeline.getRange("D71").setValue(cicloVN);
  hojaPipeline.getRange("F71").setValue(cicloH);

  // ---------------------------
  // 3️⃣ Avanzar Von Neumann (con posibles stalls)
  // ---------------------------
  avanzarPipeline(hojaPipeline, instrucciones, cicloVN, 2, true);

  // ---------------------------
  // 4️⃣ Avanzar Harvard (fluido)
  // ---------------------------
  avanzarPipeline(hojaPipeline, instrucciones, cicloH, 26, false);
}

// ---------------------------
// Función auxiliar: Avanzar un pipeline
// filaInicio = fila de la tabla (2 para VN, 26 para Harvard)
// stalls = true si queremos simular hazards
// ---------------------------
function avanzarPipeline(hoja, instrucciones, ciclo, filaInicio, stalls) {
  // Determinar instrucciones en cada etapa
  let IF = instrucciones[ciclo - 1] || "";
  let ID = instrucciones[ciclo - 2] || "";
  let EX = instrucciones[ciclo - 3] || "";
  let MEM = instrucciones[ciclo - 4] || "";
  let WB = instrucciones[ciclo - 5] || "";

  let comentario = "";

  // Simular un stall simple para Von Neumann
  if (stalls) {
    // Ejemplo: si EX depende de ID de ciclo anterior
    if (ID && EX && EX.includes(ID.split(',')[0].trim())) {
      ID = "⏸";
      comentario = "Data hazard stall";
    }
  }

  const filaDestino = filaInicio + ciclo - 1;

  hoja.getRange(filaDestino, 1).setValue(ciclo); // Ciclo
  hoja.getRange(filaDestino, 3).setValue(IF);    // IF
  hoja.getRange(filaDestino, 4).setValue(ID);    // ID
  hoja.getRange(filaDestino, 5).setValue(EX);    // EX
  hoja.getRange(filaDestino, 6).setValue(MEM);   // MEM
  hoja.getRange(filaDestino, 7).setValue(WB);    // WB
  hoja.getRange(filaDestino, 12).setValue(comentario); // Comentario
  aplicarFormatoPipeline();
}

function aplicarFormatoPipeline() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Pipeline");
  const rangoVN = hoja.getRange("C2:G21");
  const rangoH  = hoja.getRange("C26:G45");

  // Verde para instrucciones válidas
  rangoVN.setFontColor("black").setBackground("lightgreen");
  rangoH.setFontColor("black").setBackground("lightgreen");

  // Rojo para stalls
  const celdas = hoja.getRange("D2:D45").getValues();
  for (let i = 0; i < celdas.length; i++) {
    if (celdas[i][0] === "⏸") {
      hoja.getRange(i + 2, 4).setBackground("lightcoral");
    }
  }

  // Comentarios en amarillo
  const comentarios = hoja.getRange("L2:L45").getValues();
  for (let i = 0; i < comentarios.length; i++) {
    if (comentarios[i][0]) {
      hoja.getRange(i + 2, 12).setBackground("lightyellow");
    }
  }
}


// ---------------------------
// Reiniciar pipeline completo
// ---------------------------
function reiniciarPipeline() {
  const hojaPipeline = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Pipeline");

  // Limpiar tablas
  hojaPipeline.getRange(2, 1, 20, 12).clearContent().clearFormat();
  hojaPipeline.getRange(26, 1, 20, 12).clearContent().clearFormat();

  // Reiniciar contadores
  hojaPipeline.getRange("D71").setValue(0);
  hojaPipeline.getRange("F71").setValue(0);

  PropertiesService.getScriptProperties().deleteAllProperties();

  SpreadsheetApp.getActiveSpreadsheet().toast("Pipeline reiniciado ✅", "Estado");
}
