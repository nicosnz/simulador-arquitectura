/******************************************
 * PIPELINE COMPARADO: Von Neumann vs Harvard
 ******************************************/

function inicializarPipelineComparado() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Pipeline");

  hoja.getRange(2, 1, 20, 12).clearContent().clearFormat();   // Von Neumann
  hoja.getRange(26, 1, 20, 12).clearContent().clearFormat();  // Harvard

  hoja.getRange("D71").setValue(0);  // VN
  hoja.getRange("F71").setValue(0);  // Harvard

  SpreadsheetApp.getActiveSpreadsheet().toast("Pipeline inicializado ✅", "Estado");
}

function avanzarPipelineComparado() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hojaCodigo = ss.getSheetByName("Código");
  const hojaPipeline = ss.getSheetByName("Pipeline");

  const filaInicio = 3;
  const colCodigo = 15;
  const totalFilas = hojaCodigo.getLastRow() - filaInicio + 1;

  const instrucciones = hojaCodigo.getRange(filaInicio, colCodigo, totalFilas, 1)
    .getDisplayValues()
    .flat()
    .filter(inst => inst && inst.trim() !== "");

  if (instrucciones.length === 0) {
    SpreadsheetApp.getUi().alert("No hay instrucciones cargadas en la hoja Código.");
    return;
  }

  let cicloVN = parseInt(hojaPipeline.getRange("D71").getValue() || 0, 10) + 1;
  let cicloH  = parseInt(hojaPipeline.getRange("F71").getValue() || 0, 10) + 1;

  hojaPipeline.getRange("D71").setValue(cicloVN);
  hojaPipeline.getRange("F71").setValue(cicloH);

  avanzarPipeline(hojaPipeline, instrucciones, cicloVN, 2, true);   // Von Neumann
  avanzarPipeline(hojaPipeline, instrucciones, cicloH, 26, false);  // Harvard
}

function avanzarPipeline(hoja, instrucciones, ciclo, filaInicio, stalls) {
  let IF = instrucciones[ciclo - 1] || "";
  let ID = instrucciones[ciclo - 2] || "";
  let EX = instrucciones[ciclo - 3] || "";
  let MEM = instrucciones[ciclo - 4] || "";
  let WB = instrucciones[ciclo - 5] || "";

  let comentario = "";

  if (stalls && hayHazard(ID, EX)) {
    ID = "⏸";
    comentario = "Data hazard stall";
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
  marcarPuntoDeQuiebre(hoja);
}

function hayHazard(instrActual, instrAnterior) {
  if (!instrActual || !instrAnterior) return false;

  const destinoAnterior = instrAnterior.split(' ')[1]?.replace(',', '');
  const operandosActual = instrActual.split(',').slice(1).map(op => op.trim());

  return operandosActual.includes(destinoAnterior);
}

function aplicarFormatoPipeline() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Pipeline");
  const rangoVN = hoja.getRange("C2:G21");
  const rangoH  = hoja.getRange("C26:G45");

  rangoVN.setFontColor("black").setBackground("white");
  rangoH.setFontColor("black").setBackground("white");

  const aplicarVerde = (rango) => {
    const valores = rango.getValues();
    for (let i = 0; i < valores.length; i++) {
      for (let j = 0; j < valores[i].length; j++) {
        if (valores[i][j] && valores[i][j] !== "⏸") {
          rango.getCell(i + 1, j + 1).setBackground("#d4f4dd");
        }
      }
    }
  };

  aplicarVerde(rangoVN);
  aplicarVerde(rangoH);

  const aplicarRojo = (columnaID, filaInicio) => {
    const rangoID = hoja.getRange(columnaID + filaInicio + ":" + columnaID + (filaInicio + 19));
    const valoresID = rangoID.getValues();
    for (let i = 0; i < valoresID.length; i++) {
      if (valoresID[i][0] === "⏸") {
        hoja.getRange(filaInicio + i, columnaID.charCodeAt(0) - 64).setBackground("#f8d7da");
      }
    }
  };

  aplicarRojo("D", 2);   // Von Neumann
  aplicarRojo("D", 26);  // Harvard

  const aplicarAmarilloComentarios = (filaInicio) => {
    const rangoComentarios = hoja.getRange(filaInicio, 12, 20, 1);
    const comentarios = rangoComentarios.getValues();
    for (let i = 0; i < comentarios.length; i++) {
      if (comentarios[i][0]) {
        hoja.getRange(filaInicio + i, 12).setBackground("#fff3cd");
      }
    }
  };

  aplicarAmarilloComentarios(2);
  aplicarAmarilloComentarios(26);
}

function marcarPuntoDeQuiebre(hoja) {
  const rangoVN = hoja.getRange("D2:D21").getValues();
  for (let i = 0; i < rangoVN.length; i++) {
    if (rangoVN[i][0] === "⏸") {
      const fila = i + 2;
      hoja.getRange(fila, 1, 1, 12).setBackground("#ffeb3b");
      hoja.getRange(fila, 12).setValue("🔀 Punto de quiebre: stall detectado");
      break;
    }
  }
}

function reiniciarPipeline() {
  const hojaPipeline = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Pipeline");

  hojaPipeline.getRange(2, 1, 20, 12).clearContent().clearFormat();
  hojaPipeline.getRange(26, 1, 20, 12).clearContent().clearFormat();

  hojaPipeline.getRange("D71").setValue(0);
  hojaPipeline.getRange("F71").setValue(0);

  PropertiesService.getScriptProperties().deleteAllProperties();

  SpreadsheetApp.getActiveSpreadsheet().toast("Pipeline reiniciado ✅", "Estado");
}
