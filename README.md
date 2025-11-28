# 🧠 Simulador de Arquitectura x86 en Google Sheets

Este proyecto es un simulador interactivo de arquitectura x86 desarrollado en Google Sheets utilizando Google Apps Script. Está diseñado como herramienta educativa para visualizar el funcionamiento interno de una CPU, incluyendo ejecución de instrucciones, comportamiento del pipeline, gestión de memoria y políticas de caché.

---

## 📌 Objetivos

- Simular el ciclo de instrucción de una CPU x86 paso a paso.
- Visualizar componentes clave como registros, ALU, UC, RAM, caché y buses.
- Representar gráficamente el flujo de instrucciones a través del pipeline.
- Aplicar políticas de reemplazo de caché (ej. LRU).
- Detectar y mostrar riesgos en el pipeline (hazards).
- Facilitar el aprendizaje de arquitectura de computadoras de forma visual e interactiva.

---

## 🛠️ Tecnologías Utilizadas

- **Google Sheets**: Plataforma principal para la interfaz y visualización.
- **Google Apps Script (JavaScript)**: Lógica del simulador y control de eventos.
- **GitHub**: Control de versiones, documentación y colaboración.
- **Issues & Projects**: Gestión de tareas y seguimiento del desarrollo.

---

## 📂 Estructura del Proyecto

simulador-arquitectura/ 
├── Hoja: Instrucciones 
│   └── Tabla con instrucciones ensamblador 
│   └── Botón: CARGAR CÓDIGO 
├── Hoja: Pipeline 
│   └── Columnas: Ciclo, IF, ID, EX, MEM, WB, Comentario 
│   └── Botones: INICIALIZAR, AVANZAR, REINICIAR 
├── Hoja: Arquitectura 
│   └── Diagrama de CPU, buses, memoria, UC, ALU 
│   └── Tablas: RAM, Caché 1, Caché 2, Control Unit 
└── Código.gs 
    └── Funciones de simulación, visualización y control
---

## ⚙️ Instalación y Uso

1. **Clona el repositorio**:
   bash
   git clone https://github.com/tu-usuario/simulador-arquitectura.git
2. Abre Google Sheets y crea una nueva hoja.

3. Importa el código:

Ve a Extensiones > Apps Script.
Copia y pega el contenido de Código.gs.

4. Configura las hojas:

Crea las hojas: Instrucciones, Pipeline, Arquitectura.
Asegúrate de que las tablas y botones estén correctamente nombrados.

5. Ejecuta el simulador:

Ingresa instrucciones en la hoja Instrucciones.
Presiona CARGAR CÓDIGO.
Usa AVANZAR para simular ciclo por ciclo.

Ejemplo de Instrucciones
asm
LDR R0, #5
ADD R1, R0, #3
SUB R2, R1, #1
ADD R3, R2, R0

## Visualización
Avance de instrucciones por ciclo

Estado de registros y memoria

Riesgos en el pipeline (comentarios por instrucción)

Reemplazo de caché visualizado en tablas

## 🧑‍💻 Contribuciones
¡Las contribuciones son bienvenidas! Para colaborar:

Haz un fork del repositorio.

Crea una rama con tu mejora:

bash
git checkout -b feature/nueva-funcionalidad
Realiza tus cambios y haz commit:

bash
git commit -m "Agrega nueva funcionalidad"
Envía un pull request.