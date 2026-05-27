import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  HeadingLevel, 
  AlignmentType, 
  WidthType, 
  BorderStyle, 
  ImageRun 
} from 'docx';
import { FormAnswers, ComponentResults, TransversalResults } from '../types';
import { COMPONENT_BLOCKS, TRANSVERSAL_BLOCKS } from '../data';

interface DocxExportData {
  threatName: string;
  threatDesc: string;
  threatLevel: string;
  coreResults: { [blockId: string]: ComponentResults };
  transversalResults: { [blockId: string]: TransversalResults };
  answers: FormAnswers;
  riskResult: { level: string; color: string; description: string };
  vulLevel: string;
  redRombosCount: number;
  diamondDataURL?: string; // High-resolution canvas PNG in base64
}

// Helper to convert base64 data to ArrayBuffer for docx
function dataURLToArrayBuffer(dataURL: string): ArrayBuffer {
  const base64 = dataURL.split(',')[1];
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function exportToWord(data: DocxExportData) {
  // Common Borders styling
  const cellBorders = {
    top: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" },
    left: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" },
    right: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" },
  };

  const headerBorders = {
    top: { style: BorderStyle.SINGLE, size: 8, color: "0D9488" },
    bottom: { style: BorderStyle.SINGLE, size: 12, color: "0D9488" },
    left: { style: BorderStyle.SINGLE, size: 8, color: "0D9488" },
    right: { style: BorderStyle.SINGLE, size: 8, color: "0D9488" },
  };

  const docChildren: any[] = [
    // --- PORTADA / COVER PAGE ---
    new Paragraph({ text: "", spacing: { before: 1200 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "SISTEMA DE GESTIÓN DE SEGURIDAD Y SALUD EN EL TRABAJO (SG-SST)",
          font: "Arial",
          size: 20,
          bold: true,
          color: "64748B",
        }),
      ],
    }),
    new Paragraph({ text: "", spacing: { before: 800 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "PLAN DE PREVENCIÓN, PREPARACIÓN Y RESPUESTA ANTE EMERGENCIAS",
          font: "Arial",
          size: 40,
          bold: true,
          color: "0F172A",
        }),
      ],
    }),
    new Paragraph({ text: "", spacing: { before: 400 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `INFORMES DE ANÁLISIS DE VULNERABILIDAD DE AMENAZA:\n"${data.threatName.toUpperCase()}"`,
          font: "Arial",
          size: 26,
          bold: true,
          italics: true,
          color: "0D9488",
        }),
      ],
    }),
    new Paragraph({ text: "", spacing: { before: 1600 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "MARCO REGULATORIO INTERNO Y NACIONAL",
          font: "Arial",
          size: 14,
          bold: true,
          color: "0F172A",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "República de Colombia: Decreto 1072 de 2015 - Título IV\nCapítulo 6: Sistema de Gestión de Seguridad y Salud en el Trabajo\nResolución 0312 de 2019: Estándares Mínimos de SST",
          font: "Arial",
          size: 11,
          color: "64748B",
        }),
      ],
    }),
    new Paragraph({ text: "", spacing: { before: 1600 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `Fecha de Emisión: ${new Date().toLocaleDateString()}\nLugar: Sede Evaluada Principal\nElaborado para: Dirección Técnica de Gestión en Riesgos de SST`,
          font: "Arial",
          size: 11,
          bold: true,
          color: "334155",
        }),
      ],
    }),
    new Paragraph({ text: "", spacing: { before: 100 }, pageBreakBefore: true }),

    // --- CAPÍTULO 1: INTRODUCCIÓN Y MARCO LEGAL ---
    new Paragraph({
      text: "CAPÍTULO I: INTRODUCCIÓN Y CONTEXTO NORMATIVO",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 200, after: 120 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "De acuerdo con el Capítulo 6 del Decreto 1072 de 2015 (Libro 2, Parte 2, Título 4), todos los empleadores públicos y privados en Colombia deben implementar un Plan de Prevención, Preparación y Respuesta ante Emergencias. Este documento institucional debe prever los recursos técnicos, financieros y organizativos de control. Asimismo, la Resolución 0312 de 2019 establece la obligatoriedad de diseñar e implementar de manera sistemática metodologías de evaluación de peligros y análisis de vulnerabilidad, tales como el método del Diamante de Rombos recomendado formalmente por Protección Civil y las Entidades de Gestión de Riesgo Territoriales (IDIGER / UNGRD).",
          font: "Arial",
          size: 11,
        }),
      ],
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "El presente informe técnico consolida las calificaciones y ponderaciones de la sede corporativa de la empresa frente a la amenaza específica formulada, evaluando el grado de robustez de las brigadas (Personas), insumos y equipos (Recursos), así como los servicios y redundancias operativas (Sistemas y Procesos).",
          font: "Arial",
          size: 11,
        }),
      ],
      spacing: { after: 300 },
    }),

    // --- CAPÍTULO 2: DESCRIPCIÓN DE LA AMENAZA ---
    new Paragraph({
      text: "CAPÍTULO II: CARACTERIZACIÓN DE LA AMENAZA",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 300, after: 120 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `La organización ha identificado y configurado una hipótesis de incidente específica con los siguientes parámetros:`,
          font: "Arial",
          size: 11,
        }),
      ],
      spacing: { after: 150 },
    }),

    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 40, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: "Parámetro Técnico", bold: true, color: "FFFFFF" })] })],
              shading: { fill: "0F172A" },
              borders: headerBorders,
            }),
            new TableCell({
              width: { size: 60, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: "Detalle y Escenario Evaluado", bold: true, color: "FFFFFF" })] })],
              shading: { fill: "0F172A" },
              borders: headerBorders,
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: "Nombre de la Amenaza" })], borders: cellBorders }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: data.threatName, bold: true })] })], borders: cellBorders }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: "Hipótesis / Descripción del Riesgo" })], borders: cellBorders }),
            new TableCell({ children: [new Paragraph({ text: data.threatDesc })], borders: cellBorders }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: "Nivel de Probabilidad (Amenaza)" })], borders: cellBorders }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: data.threatLevel,
                      bold: true,
                      color: data.threatLevel === "POSIBLE" ? "10B981" : data.threatLevel === "PROBABLE" ? "F59E0B" : "EF4444",
                    }),
                  ],
                }),
              ],
              borders: cellBorders,
            }),
          ],
        }),
      ],
    }),
    new Paragraph({ text: "", spacing: { before: 200 } }),

    // --- CAPÍTULO 3: EL DIAMANTE DE RIESGO ---
    new Paragraph({
      text: "CAPÍTULO III: REPRESENTACIÓN VISUAL (EL DIAMANTE DE RIESGO)",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 300, after: 120 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "A continuación, se presenta la exportación gráfica en tiempo real del Diamante de Riesgo resultante del análisis transversal de la organización. El diamante consta de cuatro (4) rombos correspondientes: Amenazas (Arriba), Personas (Izquierda), Recursos (Derecha) y Sistemas y Procesos (Abajo). En el centro, el hub de control marca el promedio acumulado de rombos rojos de vulnerabilidad (V={R}R).",
          font: "Arial",
          size: 11,
        }),
      ],
      spacing: { after: 250 },
    }),
  ];

  // Insert base64 diamond image if provided
  if (data.diamondDataURL) {
    try {
      const buffer = dataURLToArrayBuffer(data.diamondDataURL);
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new ImageRun({
              data: buffer,
              transformation: {
                width: 250,
                height: 275,
              },
            } as any),
          ],
          spacing: { after: 150 },
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "Gráfico 1: Representación Dinámica del Diamante de Emergencia.",
              italics: true,
              size: 9,
              color: "64748B",
            }),
          ],
          spacing: { after: 200 },
        })
      );
    } catch (e) {
      console.error("Error al inyectar imagen de diamante en docx", e);
    }
  }

  // Risk results table
  docChildren.push(
    new Paragraph({
      text: "CONSOLIDADO DE CALIFICACIONES DE RIESGO INTERSECCIÓN",
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 200, after: 100 },
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Indicador Clave", bold: true, color: "FFFFFF" })] })],
              shading: { fill: "0D9488" },
              borders: cellBorders,
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Cálculo Resultante", bold: true, color: "FFFFFF" })] })],
              shading: { fill: "0D9488" },
              borders: cellBorders,
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: "Vulnerabilidad Consolidada" })], borders: cellBorders }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: data.vulLevel, bold: true })] })], borders: cellBorders }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: "Rombos de Vulnerabilidad en Rojo" })], borders: cellBorders }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${data.redRombosCount} de 3 Rombos Core`, bold: true })] })], borders: cellBorders }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: "NIVEL DE RIESGO GLOBAL" })], borders: cellBorders }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: data.riskResult.level,
                      bold: true,
                      color: data.riskResult.level === "BAJO" ? "10B981" : data.riskResult.level === "MEDIO" ? "F59E0B" : "EF4444",
                    }),
                  ],
                }),
              ],
              borders: cellBorders,
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: "Interpretación y Acción Inmediata" })], borders: cellBorders }),
            new TableCell({ children: [new Paragraph({ text: data.riskResult.description })], borders: cellBorders }),
          ],
        }),
      ],
    }),

    // --- CAPÍTULO 4: REPORTE DETALLADO PREGUNTA POR PREGUNTA ---
    new Paragraph({
      text: "CAPÍTULO IV: PLANILLA TÉCNICA Y EVALUACIÓN PREGUNTA POR PREGUNTA",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 120 },
      pageBreakBefore: true,
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "A continuación, se desglosan de forma sistemática las respuestas otorgadas a los cuestionarios del núcleo del diamante (Personas, Recursos, Sistemas) y las respectivas recomendaciones técnicas de mitigación con fundamento jurídico en Colombia.",
          font: "Arial",
          size: 11,
        }),
      ],
      spacing: { after: 200 },
    })
  );

  // Core blocks questions tables
  COMPONENT_BLOCKS.forEach(block => {
    const blockRes = data.coreResults[block.id];
    
    docChildren.push(
      new Paragraph({
        text: `Módulo: ${block.name.toUpperCase()} (Promedio Técnico: ${blockRes?.average.toFixed(2)} - Vulnerabilidad ${blockRes?.level})`,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      })
    );

    const tableRows = [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 25, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: "Subtema", bold: true, color: "FFFFFF" })] })],
            shading: { fill: "0F172A" },
            borders: cellBorders,
          }),
          new TableCell({
            width: { size: 45, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: "Asunto / Control Evaluado", bold: true, color: "FFFFFF" })] })],
            shading: { fill: "0F172A" },
            borders: cellBorders,
          }),
          new TableCell({
            width: { size: 12, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: "Puntaje", bold: true, color: "FFFFFF" })] })],
            shading: { fill: "0F172A" },
            borders: cellBorders,
          }),
          new TableCell({
            width: { size: 18, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: "Recomendación de Ley", bold: true, color: "FFFFFF" })] })],
            shading: { fill: "0F172A" },
            borders: cellBorders,
          }),
        ],
      }),
    ];

    block.items.forEach(item => {
      item.questions.forEach(q => {
        const score = data.answers[q.id] !== undefined ? data.answers[q.id] : 0.0;
        let scoreStr = "Malo (0.0)";
        if (score === 1.0) scoreStr = "Bueno (1.0)";
        if (score === 0.5) scoreStr = "Regular (0.5)";

        tableRows.push(
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ text: item.name })], borders: cellBorders }),
              new TableCell({ children: [new Paragraph({ text: q.text })], borders: cellBorders }),
              new TableCell({ 
                children: [new Paragraph({ children: [new TextRun({ text: scoreStr, bold: score < 1.0, color: score === 1.0 ? "059669" : score === 0.5 ? "D97706" : "DC2626" })] })], 
                borders: cellBorders 
              }),
              new TableCell({ children: [new Paragraph({ text: q.recommendation })], borders: cellBorders }),
            ],
          })
        );
      });
    });

    docChildren.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: tableRows }), new Paragraph({ text: "", spacing: { before: 150 } }));
  });

  // --- CAPÍTULO 5: CUMPLIMIENTO DE BLOQUES TRANSVERSALES ---
  docChildren.push(
    new Paragraph({
      text: "CAPÍTULO V: ANÁLISIS DE REQUISITOS TRANSVERSALES LEGALES",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 300, after: 120 },
      pageBreakBefore: true,
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "El ministerio del trabajo de Colombia y el COPASST inspeccionan de manera autónoma factores críticos (Salud Mental, Transporte PESV, Trabajo en Alturas, Sustancias Químicas, Riesgo Tecnológico de Litio). Estos bloques no reemplazan al diamante principal, pero deben auditarse de manera aislada por su severidad e impacto legal directo.",
          font: "Arial",
          size: 11,
        }),
      ],
      spacing: { after: 200 },
    })
  );

  TRANSVERSAL_BLOCKS.forEach(block => {
    const blockRes = data.transversalResults[block.id];
    docChildren.push(
      new Paragraph({
        text: `Módulo Especial: ${block.name} (${block.lawReference})`,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: `Calificación Ponderada de Cumplimiento: `, bold: true }),
          new TextRun({ text: `${blockRes?.average.toFixed(2)} / 1.00 `, font: "Consolas", bold: true }),
          new TextRun({ text: `(Vulnerabilidad ${blockRes?.level})`, color: blockRes?.level === "BAJA" ? "059669" : blockRes?.level === "MEDIA" ? "D97706" : "DC2626", bold: true }),
        ],
        spacing: { after: 100 },
      })
    );

    const tRows = [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: "Criterio de Evaluación", bold: true, color: "FFFFFF" })] })],
            shading: { fill: "1E293B" },
            borders: cellBorders,
          }),
          new TableCell({
            width: { size: 15, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: "Puntaje", bold: true, color: "FFFFFF" })] })],
            shading: { fill: "1E293B" },
            borders: cellBorders,
          }),
          new TableCell({
            width: { size: 35, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: "Acción Técnica Correctiva", bold: true, color: "FFFFFF" })] })],
            shading: { fill: "1E293B" },
            borders: cellBorders,
          }),
        ],
      }),
    ];

    block.questions.forEach(q => {
      const score = data.answers[q.id] !== undefined ? data.answers[q.id] : 0.0;
      let scoreStr = "No Cumple (0.0)";
      if (score === 1.0) scoreStr = "Cumple (1.0)";
      if (score === 0.5) scoreStr = "Parcial (0.5)";

      tRows.push(
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: q.text })], borders: cellBorders }),
            new TableCell({ 
              children: [new Paragraph({ children: [new TextRun({ text: scoreStr, bold: score < 1.0, color: score === 1.0 ? "059669" : score === 0.5 ? "D97706" : "DC2626" })] })], 
              borders: cellBorders 
            }),
            new TableCell({ children: [new Paragraph({ text: q.recommendation })], borders: cellBorders }),
          ],
        })
      );
    });

    docChildren.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: tRows }), new Paragraph({ text: "", spacing: { before: 200 } }));
  });

  // Create document object
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: docChildren,
      },
    ],
  });

  // Pack and download standard Word docx file
  const blob = await Packer.toBlob(doc);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  
  const sanitizedThreatName = data.threatName.replace(/[^a-zA-Z0-9]/g, '_');
  a.download = `Plan_Emergencias_Word_${sanitizedThreatName}.docx`;
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
}
