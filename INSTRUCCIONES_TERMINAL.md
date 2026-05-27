# Guía de Uso del Calculador de Rombos por la Terminal (Sin requerir Node/NPM)

Si descargaste este proyecto o quieres trabajar en tu repositorio de GitHub directamente desde la terminal de tu laptop (Command Prompt, PowerShell o Git Bash) sin lidiar con configurar Node ni ejecutar comandos de NPM, ¡hemos desarrollado un script en **Python** completamente autocontenido diseñado para ti!

Este script replica exactamente toda la lógica de cálculo, te realiza el test dinámico de forma interactiva en la terminal y te permite exportar los reportes técnicos oficiales:
- 📝 **Word (.docx)** impecable con tablas de cumplimiento y plan de acción.
- 📊 **Excel (.xlsx)** completo con la memoria de cálculo semaforizada.
- 🎨 **Diamante de Riesgo (.png)** renderizado de forma dinámica con los colores resultantes para que lo integres donde necesites.

---

### Paso 1: Descargar el Proyecto
Puedes exportar el proyecto como archivo ZIP desde el menú superior de AI Studio (**Export as ZIP**).
Descomprime la carpeta en la ruta que desees en tu PC, por ejemplo en:
`C:\Users\chmed\Downloads\calculador-de-vulnerabilidad-por-rombos`

---

### Paso 2: Abrir la Terminal de Windows (PowerShell o CMD)
1. Presiona la tecla **Windows**, escribe `PowerShell` y ábrelo.
2. Navega hasta el directorio donde descomprimiste el proyecto ejecutando el comando:
   ```powershell
   cd "C:\Users\chmed\Downloads\calculador-de-vulnerabilidad-por-rombos"
   ```

---

### Paso 3: Instalar las 3 Librerías Reportadoras en Python
En tu terminal, instala los generadores de Word, Excel e Imagen ejecutando la siguiente línea (solo tarda unos segundos y **no requiere NPM/Node**):
```powershell
pip install python-docx openpyxl pillow
```

*(Nota: Python viene preinstalado en la mayoría de laptops. Si tu consola dice que "pip" o "python" no se reconoce, puedes descargarlo e instalarlo gratis con un solo clic desde la Tienda de Microsoft o su página oficial python.org).*

---

### Paso 4: Iniciar el Calculador Interactivo de Emergencias
Una vez instalados los paquetes anteriores, ejecuta la herramienta en tu consola:
```powershell
python calculador_terminal.py
```

---

## 🎮 ¿Cómo utilizar el asistente interactivo en la consola?

1. **Estado del Semáforo**: Al iniciar, verás de inmediato el estado actual del Diamante (valores promedios de Personas, Recursos, Sistemas y Transversales) junto a la intersección del nivel final de riesgo.
2. **Cargar Ejemplos**: Presiona la opción `[2]` para cargar de forma inmediata un **Caso de Prueba** (por ejemplo: la PyME con vulnerabilidad media o la Planta Industrial con alta protección). Esto completará automáticamente todas las respuestas para que experimentes la exportación de inmediato.
3. **Guardado Automático de Progreso**: Si respondes preguntas o cambias la descripción del escenario de impacto, el progreso se almacena de inmediato en el archivo local `respuestas_sesion.json`. Puedes cerrar la consola y recuperar tu progreso en cualquier momento.
4. **Generación de Reportes**:
   - Pulsa `[5]` para generar el reporte de cálculo en **Excel** (`Memoria_Tecnica_Vulnerabilidad.xlsx`).
   - Pulsa `[6]` para estructurar el plan de prevención oficial en **Word** (`Plan_Prevencion_Emergencias.docx`).
   - Pulsa `[7]` para renderizar la imagen digital del semáforo (`diamante_riesgo.png`).
