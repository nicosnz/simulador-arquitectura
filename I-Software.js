
function startSimulator2() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("i-software");
  hoja.getRange("K146").setValue("RUN");
  const memoriasDato = ["1000H","1001H"];
  const memoriasPrograma = ["2000H" , "2001H"];
  const comandos = ["MOV BX, OFFSET MENSAJE", "MOV AX, OFFSET FIN - OFFSET MENSAJE", "INT 7" ,"INT 0", "END"];
  const palabras = ["Hola", "como" ,"estan?", "Buenas noches", "Buenos dias", "Ingeniera de software la mejor ingenieria", "Este proyecto es el mejor"];
  
  hoja.getRange("U5").setValue("MENSAJE");
  hoja.getRange("U6").setValue("FIN");
  hoja.getRange("U16").setValue(comandos[0]);
  hoja.getRange("U17").setValue(comandos[1]);

  // ⚠️ Evitamos while(true), usamos un bucle controlado
  while(true) {
    const control = hoja.getRange("K146").getValue();
    const control2 = hoja.getRange("K149").getValue();
    if (control === "STOP") {
      procesoDetenido();
      limpiarSimulador();
      Logger.log("Simulador detenido por el botón.");
      break; // sale del bucle
    }
    if (control2 === "PAUSE") {
      Logger.log("Simulador pausado por el botón.");
      procesoPausado();
       // sale del bucle
    }
    const indiceArrays = parseInt(hoja.getRange("K147").getValue(), 10);
    const indicePrograma = parseInt(hoja.getRange("K148").getValue(), 10);
    let mensaje = palabras[indicePrograma];

    if (indiceArrays === 0) {
      hoja.getRange("L8").setBackground("red");
      SpreadsheetApp.flush(); // fuerza actualización inmediata
      Utilities.sleep(2000);

      hoja.getRange("U16").setBackground("red");
      SpreadsheetApp.flush();
      Utilities.sleep(2000);

      hoja.getRange("L8").setValue(memoriasPrograma[indiceArrays]);
      SpreadsheetApp.flush();
      Utilities.sleep(2000);

      hoja.getRange("L12").setBackground("red");
      SpreadsheetApp.flush();
      hoja.getRange("L12").setValue(memoriasDato[indiceArrays]);
      SpreadsheetApp.flush();
      Utilities.sleep(2000);

      hoja.getRange("L8").setBackground(null);
      hoja.getRange("L12").setBackground(null);
      hoja.getRange("U16").setBackground(null);
      hoja.getRange("K147").setValue(indiceArrays + 1);

      SpreadsheetApp.flush();

    } else if (indiceArrays === 1) {
      hoja.getRange("L8").setBackground("red");
      SpreadsheetApp.flush();
      Utilities.sleep(2000);

      hoja.getRange("L8").setValue(memoriasPrograma[indiceArrays]);
      SpreadsheetApp.flush();

      hoja.getRange("L10").setBackground("red");
      SpreadsheetApp.flush();
      Utilities.sleep(2000);

      hoja.getRange("L10").setValue(mensaje.length);
      SpreadsheetApp.flush();
      Utilities.sleep(2000);

      hoja.getRange("L8").setBackground(null);
      hoja.getRange("L10").setBackground(null);
      hoja.getRange("K147").setValue(indiceArrays + 1);

      SpreadsheetApp.flush();

    } else {
      hoja.getRange("A1").setValue(mensaje);
      SpreadsheetApp.flush();
      Utilities.sleep(2000);

      hoja.getRange("K147").setValue(0);
      hoja.getRange("K148").setValue(indicePrograma + 1);

      SpreadsheetApp.flush();
    }

    SpreadsheetApp.flush();
  }
}
function detenerSimulador() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("i-software");
  
  hoja.getRange("K146").setValue("STOP");
  SpreadsheetApp.flush();

}
function pausarSimulador() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("i-software");
  
  hoja.getRange("K149").setValue("PAUSE");
  SpreadsheetApp.flush();

}
function procesoDetenido(){
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("i-software");
  
  hoja.getRange("S47").setBackground("red");
  hoja.getRange("S47").setValue("Tecla 1");
  SpreadsheetApp.flush();
  Utilities.sleep(2000);
  hoja.getRange("S49").setBackground("red");
  hoja.getRange("S49").setValue("Tecla 1");
  SpreadsheetApp.flush();
  Utilities.sleep(2000);
  hoja.getRange("S53").setBackground("red");
  SpreadsheetApp.flush();
  Utilities.sleep(2000);
  hoja.getRange("L8").setBackground("red");
  hoja.getRange("L8").setValue(1);
  SpreadsheetApp.flush();
  Utilities.sleep(2000);
  hoja.getRange("Z11").setBackground("red");
  SpreadsheetApp.flush();
  Utilities.sleep(2000);
  hoja.getRange("Z12").setBackground("red");
  SpreadsheetApp.flush();
  Utilities.sleep(2000);
  
  hoja.getRange("Z13").setBackground("red");
  SpreadsheetApp.flush();
  Utilities.sleep(2000);
  hoja.getRange("U30").setBackground("red");
  SpreadsheetApp.flush();
  Utilities.sleep(2000);
  
  hoja.getRange("S47").setBackground(null);
  
  hoja.getRange("S49").setBackground(null);
  
  hoja.getRange("S53").setBackground(null);
 
  hoja.getRange("L8").setBackground(null);
 
  hoja.getRange("Z11").setBackground(null);
  
  hoja.getRange("Z12").setBackground(null);
  
  hoja.getRange("Z13").setBackground(null);
  
  hoja.getRange("U30").setBackground(null);
  hoja.getRange("S43").setValue("25H");
  SpreadsheetApp.flush();



}
function procesoPausado(){
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("i-software");
  
  hoja.getRange("S47").setBackground("red");
  hoja.getRange("S47").setValue("Tecla 2");
  SpreadsheetApp.flush();
  Utilities.sleep(2000);
  hoja.getRange("S49").setBackground("red");
  hoja.getRange("S49").setValue("Tecla 2");
  SpreadsheetApp.flush();
  Utilities.sleep(2000);
  hoja.getRange("S54").setBackground("red");
  SpreadsheetApp.flush();
  Utilities.sleep(2000);
  hoja.getRange("L8").setBackground("red");
  hoja.getRange("L8").setValue(4);
  SpreadsheetApp.flush();
  Utilities.sleep(2000);
  hoja.getRange("Z11").setBackground("red");
  SpreadsheetApp.flush();
  Utilities.sleep(2000);
  hoja.getRange("Z12").setBackground("red");
  SpreadsheetApp.flush();
  Utilities.sleep(2000);
  
  hoja.getRange("Z13").setBackground("red");
  SpreadsheetApp.flush();
  Utilities.sleep(2000);
  hoja.getRange("Z14").setBackground("red");
  SpreadsheetApp.flush();
  Utilities.sleep(2000);
  hoja.getRange("Z15").setBackground("red");
  SpreadsheetApp.flush();
  Utilities.sleep(2000);
  hoja.getRange("Z16").setBackground("red");
  SpreadsheetApp.flush();
  Utilities.sleep(2000);
  hoja.getRange("U33").setBackground("red");
  SpreadsheetApp.flush();
  Utilities.sleep(2000);
  hoja.getRange("A1").setValue("HOLA, COMO ESTAS?")
  SpreadsheetApp.flush();
  Utilities.sleep(2000);
  
  hoja.getRange("S47").setBackground(null);
  
  hoja.getRange("S49").setBackground(null);
  
  hoja.getRange("S54").setBackground(null);
 
  hoja.getRange("L8").setBackground(null);
 
  hoja.getRange("Z11").setBackground(null);
  
  hoja.getRange("Z12").setBackground(null);
  
  hoja.getRange("Z13").setBackground(null);
  hoja.getRange("Z14").setBackground(null);
  hoja.getRange("Z15").setBackground(null);
  hoja.getRange("Z16").setBackground(null);
  
  hoja.getRange("U33").setBackground(null);
  hoja.getRange("K149").setValue("RUN");
  hoja.getRange("S43").setValue("26H");


  SpreadsheetApp.flush();



}


function limpiarSimulador() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("i-software");
  
  // Celdas que usaste con setValue
  const celdas = [
    "U5", "U6", "U16", "U17", // comandos y etiquetas
              // índices
    "L8", "L12", "L10",       // memorias y longitud
    "A1"                      // mensaje final
  ];
  
  // Limpiar todas esas celdas
  celdas.forEach(ref => {
    hoja.getRange(ref).clearContent();
  });
   hoja.getRange("K147").setValue(0);
  hoja.getRange("K148").setValue(0);

}
