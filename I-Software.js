
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

  
}
function detenerSimulador() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("i-software");
    
    hoja.getRange("S47").setBackground("#ffeb3b");
    hoja.getRange("S47").setValue("TECLA PRESIONADA");
    SpreadsheetApp.flush();
    Utilities.sleep(500);
    
    hoja.getRange("S43").setValue("25H"); 
    hoja.getRange("S53").setBackground("red");
    
    hoja.getRange("S47").setBackground(null);

}
function pausarSimulador() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("i-software");
  if (!hoja) return;

  // Celdas cuyo contenido o fondo cambian durante la simulación
  const refs = [
    "U5", "U6", "U16", "U17", "A1",
    "L8", "L12", "L10",
    "S43", "S47", "S48", "S49", "S53", "S54",
    "Z11", "Z12", "Z13", "Z14", "Z15", "Z16",
    "U30", "U33", "E68"
  ];

  refs.forEach(ref => {
    try {
      hoja.getRange(ref).clearContent();
      hoja.getRange(ref).setBackground(null);
    } catch (e) {
      // ignore if a particular cell/range does not exist
    }
  });

  // Estados y contadores
  try { hoja.getRange("K146").setValue("RUN"); } catch (e) {}
  try { hoja.getRange("K147").setValue(0); } catch (e) {}
  try { hoja.getRange("K148").setValue(0); } catch (e) {}
  try { hoja.getRange("K149").setValue("RUN"); } catch (e) {}

  SpreadsheetApp.flush();
  hoja.getRange("S47").setBackground("red");

function reiniciarSimulador() {
  limpiarSimulador();
}
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
  
  const celdas = [
    "U5", "U6", "U16", "U17",
    "L8", "L12", "L10",
    "A1"
  ];
  
  celdas.forEach(ref => {
    hoja.getRange(ref).clearContent();
  });
  hoja.getRange("K147").setValue(0);
  hoja.getRange("K148").setValue(0);
  hoja.getRange("K146").setValue("RUN");

}
function simularPulsacionTecla1() {
    const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("i-software");
    hoja.getRange("S47").setBackground("red");
    hoja.getRange("S47").setValue("Tecla 1 PRESIONADA");
    SpreadsheetApp.flush();
    Utilities.sleep(1000);
    hoja.getRange("S43").setValue("25H");
    hoja.getRange("S53").setBackground("red");
    
    hoja.getRange("S47").setBackground(null);
}

function obtenerCodigoIRQ() {
    const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("i-software");
    return hoja.getRange("S43").getValue();
}

function limpiarBanderaInterrupcion() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("i-software");
  hoja.getRange("S43").setValue(null);
  hoja.getRange("S53").setBackground(null);
}

function ejecutarISR_INT1() {
  procesoDetenido();
}

function ejecutarISR_INT2() {
  procesoPausado();
}