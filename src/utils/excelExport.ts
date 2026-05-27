import * as XLSX from 'xlsx';
import { FormAnswers, ComponentResults, TransversalResults } from '../types';
import { COMPONENT_BLOCKS, TRANSVERSAL_BLOCKS } from '../data';

interface ExcelExportData {
  threatName: string;
  threatDesc: string;
  threatLevel: string;
  coreResults: { [blockId: string]: ComponentResults };
  transversalResults: { [blockId: string]: TransversalResults };
  answers: FormAnswers;
  riskResult: { level: string; color: string; description: string };
  vulLevel: string;
  redRombosCount: number;
}

export function exportToExcel(data: ExcelExportData) {
  const wb = XLSX.utils.book_new();

  // SHEET 1: RESUMEN EJECUTIVO
  const resumenRows = [
    ["REPORTE EJECUTIVO Y MEMORIA DE CÁLCULO - PLAN DE EMERGENCIAS COLOMBIA"],
    [`Fecha de Generación: ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}`],
    ["Normativa Aplicable: Decreto 1072 de 2015, Resolución 0312 de 2019 de la República de Colombia"],
    [""],
    ["1. CARACTERIZACIÓN DE LA AMENAZA DE EMERGENCIA"],
    ["Amenaza Evaluada:", data.threatName],
    ["Descripción Hipotética:", data.threatDesc],
    ["Nivel de Amenaza (Calificación):", data.threatLevel],
    [""],
    ["2. RESULTADOS DE LA VULNERABILIDAD (DIAMANTE DE RIESGO - CORE)"],
    ["Componente de Vulnerabilidad", "Promedio Matemático (0.00 - 1.00)", "Calificación de Vulnerabilidad", "Color de Rombo correspondiente"],
    [
      "Vulnerabilidad en Personas", 
      data.coreResults.Personas ? data.coreResults.Personas.average.toFixed(2) : "0.00", 
      data.coreResults.Personas ? data.coreResults.Personas.level : "ALTA", 
      data.coreResults.Personas ? data.coreResults.Personas.color.toUpperCase() : "RED"
    ],
    [
      "Vulnerabilidad en Recursos", 
      data.coreResults.Recursos ? data.coreResults.Recursos.average.toFixed(2) : "0.00", 
      data.coreResults.Recursos ? data.coreResults.Recursos.level : "ALTA", 
      data.coreResults.Recursos ? data.coreResults.Recursos.color.toUpperCase() : "RED"
    ],
    [
      "Vulnerabilidad en Sistemas y Procesos", 
      data.coreResults.Sistemas ? data.coreResults.Sistemas.average.toFixed(2) : "0.00", 
      data.coreResults.Sistemas ? data.coreResults.Sistemas.level : "ALTA", 
      data.coreResults.Sistemas ? data.coreResults.Sistemas.color.toUpperCase() : "RED"
    ],
    [""],
    ["3. CONSOLIDACIÓN DE RIESGO GLOBAL"],
    ["Rombos de Vulnerabilidad en color Rojo:", data.redRombosCount],
    ["Vulnerabilidad Consolidada:", data.vulLevel],
    ["Cruce Nivel de Riesgo Interceptado:", data.riskResult.level],
    ["Interpretación Técnica y Legal:", data.riskResult.description],
    [""],
    ["4. ESTADO DE LOS BLOQUES TRANSVERSALES COPASST"],
    ["Temática Especial", "Norma de Referencia", "Grado de Cumplimiento", "Calificación Cualitativa"]
  ];

  // Append transversal summaries in Sheet 1
  Object.keys(data.transversalResults).forEach(key => {
    const r = data.transversalResults[key];
    resumenRows.push([
      r.name,
      r.lawReference,
      r.average.toFixed(2),
      r.level
    ]);
  });

  const wsResumen = XLSX.utils.aoa_to_sheet(resumenRows);

  // Set nice column widths for the summary sheet
  wsResumen['!cols'] = [
    { wch: 35 },
    { wch: 35 },
    { wch: 30 },
    { wch: 30 }
  ];

  XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen Ejecutivo");


  // SHEET 2: CONTROL DE RESPUESTAS (NÚCLEO)
  const coreQuestionsRows = [
    ["REGISTRO DE EVALUACIÓN DETALLADO - COMPONENTES DEL CORE (DIAMANTE)"],
    ["Id Pregunta", "Componente", "Subtema / Ítem", "Pregunta de Control Evaluada", "Calificación (0, 0.5 o 1)", "Equivalencia", "Recomendación de Control Propuesta"]
  ];

  COMPONENT_BLOCKS.forEach(block => {
    block.items.forEach(item => {
      item.questions.forEach(q => {
        const score = data.answers[q.id] !== undefined ? data.answers[q.id] : 0.0;
        const equivalence = score === 1.0 ? "Bueno (1.0) / Cumple plenamente" : score === 0.5 ? "Regular (0.5) / Cumple parcialmente" : "Malo (0.0) / No cumple o Ausente";
        coreQuestionsRows.push([
          q.id,
          block.name,
          item.name,
          q.text,
          score.toFixed(1),
          equivalence,
          q.recommendation
        ]);
      });
    });
  });

  const wsCore = XLSX.utils.aoa_to_sheet(coreQuestionsRows);
  wsCore['!cols'] = [
    { wch: 12 },
    { wch: 25 },
    { wch: 20 },
    { wch: 60 },
    { wch: 15 },
    { wch: 30 },
    { wch: 65 }
  ];
  XLSX.utils.book_append_sheet(wb, wsCore, "Respuestas Core");


  // SHEET 3: MÓDULOS TRANSVERSALES (SPECIAL)
  const transversalQuestionsRows = [
    ["REGISTRO DE EVALUACIÓN DETALLADA - REQUISITOS TRANSVERSALES DE ALTO IMPACTO"],
    ["Id Pregunta", "Módulo Especial", "Norma / Marco Legal", "Pregunta de Control Evaluada", "Calificación (0, 0.5 o 1)", "Equivalencia", "Recomendación Técnica de Mitigación"]
  ];

  TRANSVERSAL_BLOCKS.forEach(block => {
    block.questions.forEach(q => {
      const score = data.answers[q.id] !== undefined ? data.answers[q.id] : 0.0;
      const equivalence = score === 1.0 ? "Bueno (1.0) / Cumple plenamente" : score === 0.5 ? "Regular (0.5) / Cumple parcialmente" : "Malo (0.0) / No cumple o Ausente";
      transversalQuestionsRows.push([
        q.id,
        block.name,
        block.lawReference,
        q.text,
        score.toFixed(1),
        equivalence,
        q.recommendation
      ]);
    });
  });

  const wsTransversal = XLSX.utils.aoa_to_sheet(transversalQuestionsRows);
  wsTransversal['!cols'] = [
    { wch: 12 },
    { wch: 25 },
    { wch: 22 },
    { wch: 60 },
    { wch: 15 },
    { wch: 30 },
    { wch: 65 }
  ];
  XLSX.utils.book_append_sheet(wb, wsTransversal, "Respuestas Transversales");


  // WRITE AND DOWNLOAD FILE
  const sanitizedThreatName = data.threatName.replace(/[^a-zA-Z0-9]/g, '_');
  XLSX.writeFile(wb, `Memoria_Calculo_Rombos_${sanitizedThreatName}.xlsx`);
}
