/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  ShieldAlert, 
  Users, 
  Wrench, 
  Cpu, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw, 
  Download, 
  Upload, 
  Printer, 
  Search, 
  ArrowRight, 
  Layers, 
  Compass, 
  Info,
  Calendar,
  AlertCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import { 
  COMPONENT_BLOCKS, 
  TRANSVERSAL_BLOCKS, 
  STANDARD_THREATS, 
  EVALUATION_PRESETS, 
  PON_FLOWS 
} from './data';
import { 
  FormAnswers, 
  Threat, 
  UrgencyLevel, 
  VulnerabilityLevel, 
  RiskLevel, 
  ComponentResults, 
  TransversalResults, 
  GeneralReport,
  FlowNode
} from './types';
import { exportToExcel } from './utils/excelExport';
import { exportToWord } from './utils/docxExport';
import { generateDiamondImgBase64 } from './utils/canvasRenderer';

export default function App() {
  // Preset defaults to the first index (PyME) so the user gets preview values instantly
  const [activePresetIndex, setActivePresetIndex] = useState<number | null>(1);
  const [selectedThreat, setSelectedThreat] = useState<Threat>(EVALUATION_PRESETS[1].threat);
  const [answers, setAnswers] = useState<FormAnswers>(EVALUATION_PRESETS[1].answers);
  
  // Custom states
  const [customThreatName, setCustomThreatName] = useState(EVALUATION_PRESETS[1].threat.name);
  const [customThreatDesc, setCustomThreatDesc] = useState(EVALUATION_PRESETS[1].threat.description);
  const [threatLevel, setThreatLevel] = useState<UrgencyLevel>(EVALUATION_PRESETS[1].threat.level);

  // Tabs
  const [activeTab, setActiveTab] = useState<'core' | 'transversales' | 'pon'>('core');
  
  // Interactive Report visualizer state
  const [showInteractiveReport, setShowInteractiveReport] = useState(false);
  
  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  // Expand state for blocks (Default to everything expanded)
  const [expandedBlocks, setExpandedBlocks] = useState<{ [id: string]: boolean }>({
    'Personas': true,
    'Recursos': true,
    'Sistemas': true,
    'PESV': true,
    'Psicosocial': true,
    'Alturas': true,
    'Litio': true,
    'Quimicos': true
  });

  // Selected step node in PON flowchart
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Toggle block expansion
  const toggleBlock = (blockId: string) => {
    setExpandedBlocks(prev => ({ ...prev, [blockId]: !prev[blockId] }));
  };

  // Preset Selection Loader
  const handleLoadPreset = (index: number) => {
    const preset = EVALUATION_PRESETS[index];
    setActivePresetIndex(index);
    setSelectedThreat(preset.threat);
    setAnswers(preset.answers);
    setCustomThreatName(preset.threat.name);
    setCustomThreatDesc(preset.threat.description);
    setThreatLevel(preset.threat.level);
    // Auto reset PON selection node
    setSelectedNodeId(null);
  };

  // Update a single answer
  const handleSetAnswer = (questionId: string, value: number) => {
    setActivePresetIndex(null); // break preset link when customized
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Helper to bulk set answers (e.g. Quick Fill ALL with 1.0, 0.5 or 0.0)
  const handleQuickFill = (value: number) => {
    setActivePresetIndex(null);
    const newAnswers: FormAnswers = {};
    
    // Core blocks
    COMPONENT_BLOCKS.forEach(block => {
      block.items.forEach(item => {
        item.questions.forEach(q => {
          newAnswers[q.id] = value;
        });
      });
    });

    // Transversal blocks
    TRANSVERSAL_BLOCKS.forEach(block => {
      block.questions.forEach(q => {
        newAnswers[q.id] = value;
      });
    });

    setAnswers(newAnswers);
  };

  // Reset entirely
  const handleReset = () => {
    setActivePresetIndex(null);
    setAnswers({});
    setSelectedNodeId(null);
  };

  // mathematical calculators
  const getVulnerabilityDetails = (avg: number): { level: VulnerabilityLevel; color: 'green' | 'yellow' | 'red'; colorHex: string } => {
    if (avg <= 0.40) {
      return { level: 'ALTA', color: 'red', colorHex: '#EF4444' };
    } else if (avg <= 0.60) {
      return { level: 'MEDIA', color: 'yellow', colorHex: '#F59E0B' };
    } else {
      return { level: 'BAJA', color: 'green', colorHex: '#10B981' };
    }
  };

  // Core calculations (Personas, Recursos, Sistemas)
  const coreResults = useMemo(() => {
    const results: { [blockId: string]: ComponentResults } = {};

    COMPONENT_BLOCKS.forEach(block => {
      const itemAverages: { [itemId: string]: number } = {};
      let blockSum = 0;

      block.items.forEach(item => {
        let itemSum = 0;
        item.questions.forEach(q => {
          itemSum += answers[q.id] !== undefined ? answers[q.id] : 0.0; // treat missing as Malo per convention
        });
        const itemAvg = item.questions.length > 0 ? itemSum / item.questions.length : 0;
        itemAverages[item.id] = parseFloat(itemAvg.toFixed(2));
        blockSum += itemAvg;
      });

      const blockAvg = block.items.length > 0 ? blockSum / block.items.length : 0;
      const formattedAvg = parseFloat(blockAvg.toFixed(2));
      const details = getVulnerabilityDetails(formattedAvg);

      results[block.id] = {
        id: block.id,
        name: block.name,
        itemAverages,
        average: formattedAvg,
        ...details
      };
    });

    return results;
  }, [answers]);

  // Transversal Calculations (PESV, Psicosocial, Alturas, Litio, Químicos)
  const transversalResults = useMemo(() => {
    const results: { [blockId: string]: TransversalResults } = {};

    TRANSVERSAL_BLOCKS.forEach(block => {
      let sum = 0;
      block.questions.forEach(q => {
        sum += answers[q.id] !== undefined ? answers[q.id] : 0.0;
      });
      const avg = block.questions.length > 0 ? sum / block.questions.length : 0;
      const formattedAvg = parseFloat(avg.toFixed(2));
      const details = getVulnerabilityDetails(formattedAvg);

      results[block.id] = {
        id: block.id,
        name: block.name,
        lawReference: block.lawReference,
        average: formattedAvg,
        ...details
      };
    });

    return results;
  }, [answers]);

  // Core Diamond Red Rombos count
  const redVulnerabilityRombosCount = useMemo(() => {
    let count = 0;
    if (coreResults['Personas']?.color === 'red') count++;
    if (coreResults['Recursos']?.color === 'red') count++;
    if (coreResults['Sistemas']?.color === 'red') count++;
    return count;
  }, [coreResults]);

  // Overall Diamond Vulnerability Level
  // Methodology: 3 to 4 Red Rombos => ALTA, 1 to 2 Red Rombos => MEDIA, 0 Red Rombos => BAJA
  // Note: Since we are evaluating the 3 vulnerability core components, if we count 3 reds => ALTA.
  // If the threat itself is also RED (INMINENTE), and total red rombos across all 4 (Threat + 3 Core) is 3 to 4 => ALTA.
  // Let's count red rombos including Threat level!
  const isThreatRed = threatLevel === 'INMINENTE';
  const totalRombosInRedCount = redVulnerabilityRombosCount + (isThreatRed ? 1 : 0);

  const consolidatedVulnerabilityLevel = useMemo((): VulnerabilityLevel => {
    // We look at the vulnerability rombos. If we have 3 reds of vulnerability, or based on the exact rule:
    // "Número de Rombos en Rojo -> Calificación de la Vulnerabilidad: 3 a 4 Rombos Rojos = ALTA, 1 a 2 Rombos Rojos = MEDIA, 0 Rombos Rojos = BAJA"
    // Let's use totalRombosInRedCount!
    if (totalRombosInRedCount >= 3) {
      return 'ALTA';
    } else if (totalRombosInRedCount >= 1) {
      return 'MEDIA';
    } else {
      return 'BAJA';
    }
  }, [totalRombosInRedCount]);

  // Global Risk Assessment Matrix
  const globalRiskIntersections = useMemo((): { level: RiskLevel; color: 'green' | 'yellow' | 'red'; description: string } => {
    const vul = consolidatedVulnerabilityLevel;
    const thr = threatLevel;

    // BAJA + POSIBLE -> BAJO
    // BAJA + PROBABLE -> MEDIO
    // BAJA + INMINENTE -> MEDIO
    if (vul === 'BAJA') {
      if (thr === 'POSIBLE') {
        return { 
          level: 'BAJO', 
          color: 'green',
          description: 'La instalación se encuentra altamente protegida e instruida, y la amenaza es únicamente potencial.'
        };
      } else {
        return { 
          level: 'MEDIO', 
          color: 'yellow',
          description: 'A pesar de contar con excelente preparación, la inminencia o probabilidad de la amenaza aconseja mantener guardias activas.'
        };
      }
    }

    // MEDIA + POSIBLE -> MEDIO
    // MEDIA + PROBABLE -> MEDIO
    // MEDIA + INMINENTE -> ALTO
    if (vul === 'MEDIA') {
      if (thr === 'INMINENTE') {
        return { 
          level: 'ALTO', 
          color: 'red',
          description: 'Vulnerabilidades no atendidas coinciden con una amenaza inminente de desastre estructural.' 
        };
      } else {
        return { 
          level: 'MEDIO', 
          color: 'yellow',
          description: 'Existen fallas parciales de protección o capacitación. Se deben organizar planes de corrección a corto plazo.' 
        };
      }
    }

    // ALTA + POSIBLE -> MEDIO
    // ALTA + PROBABLE -> ALTO
    // ALTA + INMINENTE -> ALTO
    if (vul === 'ALTA') {
      if (thr === 'POSIBLE') {
        return { 
          level: 'MEDIO', 
          color: 'yellow',
          description: 'Vulnerabilidad crítica en la sede. El riesgo se amortigua en el mediano plazo debido a la baja probabilidad inmediata del desastre.'
        };
      } else {
        return { 
          level: 'ALTO', 
          color: 'red',
          description: '⚠️ ESTADO CRÍTICO. Fallas de fondo o ausencia total de brigadas y equipos de respuesta ante un evento altamente probable.'
        };
      }
    }

    return { level: 'MEDIO', color: 'yellow', description: 'Nivel medio ponderado' };
  }, [consolidatedVulnerabilityLevel, threatLevel]);

  // Predefined active PON flow based on selected threat
  const activePONFlow = useMemo(() => {
    // find flow by selected threat prefix or type
    const findById = PON_FLOWS.find(flow => flow.id === selectedThreat.id);
    if (findById) return findById;
    
    // fallback
    if (selectedThreat.id.includes('litio')) {
      return PON_FLOWS.find(flow => flow.id === 'litio_explosion');
    }
    return PON_FLOWS[0]; // fallback to fire
  }, [selectedThreat]);

  // Find info about the currently selected node in the flowchart
  const activeNodeInfo = useMemo(() => {
    if (!selectedNodeId || !activePONFlow) return null;
    return activePONFlow.nodes.find(n => n.id === selectedNodeId) || null;
  }, [selectedNodeId, activePONFlow]);

  // Import JSON Report Loader
  const handleImportJSON = (e: ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.answers) {
            setAnswers(parsed.answers);
            if (parsed.threat) {
              setSelectedThreat(parsed.threat);
              setCustomThreatName(parsed.threat.name || '');
              setCustomThreatDesc(parsed.threat.description || '');
              setThreatLevel(parsed.threat.level || 'POSIBLE');
            }
            setActivePresetIndex(null);
            alert("✓ Evaluación cargada exitosamente.");
          } else {
            alert("El archivo no posee un formato de evaluación válido.");
          }
        } catch (err) {
          alert("Error al procesar el archivo JSON.");
        }
      };
    }
  };

  // Export JSON Report Creator
  const handleExportJSON = () => {
    const reportData = {
      appName: "Calculador de Vulnerabilidad por Rombos - Colombia",
      timestamp: new Date().toISOString(),
      threat: {
        id: selectedThreat.id,
        name: customThreatName,
        description: customThreatDesc,
        level: threatLevel
      },
      answers,
      results: {
        core: coreResults,
        transversales: transversalResults,
        redRombosCount: redVulnerabilityRombosCount,
        consolidatedVulnerability: consolidatedVulnerabilityLevel,
        riskLevel: globalRiskIntersections.level
      }
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Reporte_Rombos_Vulnerabilidad_${customThreatName.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const executePrint = () => {
    window.print();
  };

  const handleExportWord = async () => {
    try {
      const img = generateDiamondImgBase64({
        threatLevel,
        threatName: customThreatName,
        personasAvg: coreResults['Personas']?.average || 0,
        personasLvl: coreResults['Personas']?.level || 'BAJA',
        recursosAvg: coreResults['Recursos']?.average || 0,
        recursosLvl: coreResults['Recursos']?.level || 'BAJA',
        sistemasAvg: coreResults['Sistemas']?.average || 0,
        sistemasLvl: coreResults['Sistemas']?.level || 'BAJA',
        redRombosCount: redVulnerabilityRombosCount
      });
      await exportToWord({
        threatName: customThreatName,
        threatDesc: customThreatDesc,
        threatLevel,
        coreResults,
        transversalResults,
        answers,
        riskResult: globalRiskIntersections,
        vulLevel: consolidatedVulnerabilityLevel,
        redRombosCount: redVulnerabilityRombosCount,
        diamondDataURL: img
      });
    } catch (err) {
      alert("Error al intentar compilar y exportar el Plan de Emergencias en Word.");
      console.error(err);
    }
  };

  const handleExportExcel = () => {
    try {
      exportToExcel({
        threatName: customThreatName,
        threatDesc: customThreatDesc,
        threatLevel,
        coreResults,
        transversalResults,
        answers,
        riskResult: globalRiskIntersections,
        vulLevel: consolidatedVulnerabilityLevel,
        redRombosCount: redVulnerabilityRombosCount
      });
    } catch (err) {
      alert("Error al intentar volcar los datos a Excel.");
      console.error(err);
    }
  };

  // Dynamic advice arrays
  const specialAlerts = useMemo(() => {
    const alerts: { title: string; blockId: string; law: string; avg: number; message: string; recs: string[] }[] = [];

    Object.keys(transversalResults).forEach(key => {
      const b = transversalResults[key];
      if (b.level === 'ALTA' || b.level === 'MEDIA') {
        const sourceBlock = TRANSVERSAL_BLOCKS.find(t => t.id === key);
        const badQuestions = sourceBlock?.questions.filter(q => (answers[q.id] || 0) < 1.0) || [];
        alerts.push({
          title: b.name,
          blockId: key,
          law: b.lawReference,
          avg: b.average,
          message: b.level === 'ALTA' 
            ? `Vulnerabilidad Crítica detectada bajo la norma colombiana (${b.lawReference}). Ausencia o falla sistemática de controles.` 
            : `Vulnerabilidad Parcial que requiere atención preventiva proactiva según directrices del COPASST.`,
          recs: badQuestions.map(q => q.recommendation)
        });
      }
    });

    return alerts;
  }, [transversalResults, answers]);

  // Threat Color Calculator for SVG Diamond
  const getThreatColorClass = (lvl: UrgencyLevel) => {
    if (lvl === 'POSIBLE') return { fill: '#10B981', text: 'VERDE / POSIBLE', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (lvl === 'PROBABLE') return { fill: '#F59E0B', text: 'AMARILLO / PROBABLE', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { fill: '#EF4444', text: 'ROJO / INMINENTE', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
  };

  const getVulColorClass = (lvl: VulnerabilityLevel) => {
    if (lvl === 'BAJA') return '#10B981';
    if (lvl === 'MEDIA') return '#F59E0B';
    return '#EF4444';
  };

  // Predefined standard threats mapper
  const handlePredefinedThreatSelect = (id: string) => {
    const found = STANDARD_THREATS.find(t => t.id === id);
    if (found) {
      setSelectedThreat(found);
      setCustomThreatName(found.name);
      setCustomThreatDesc(found.description);
      setThreatLevel(found.level);
    }
  };

  // Count total questions answered vs total questions
  const totalAnsweredStats = useMemo(() => {
    let answered = 0;
    let total = 0;

    COMPONENT_BLOCKS.forEach(b => {
      b.items.forEach(it => {
        it.questions.forEach(q => {
          total++;
          if (answers[q.id] !== undefined) answered++;
        });
      });
    });

    TRANSVERSAL_BLOCKS.forEach(b => {
      b.questions.forEach(q => {
        total++;
        if (answers[q.id] !== undefined) answered++;
      });
    });

    return { answered, total, pct: total > 0 ? Math.round((answered / total) * 100) : 0 };
  }, [answers]);

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 antialiased selection:bg-teal-500 selection:text-white pb-16">
      
      {/* HEADER SECTION (NO-PRINT ENHANCED) */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 no-print shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-teal-600 text-white p-2.5 rounded-xl shadow-xs">
              <Shield className="w-6 h-6" id="app_logo_icon" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest bg-yellow-400 text-yellow-950 px-2 py-0.5 rounded-md">
                  Norma Colombiana
                </span>
                <span className="text-xs text-slate-400 font-medium">Metodología Diamante de Rombos</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight" id="app_main_title">
                Calculador de Vulnerabilidad por Rombos
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs py-2 px-3.5 rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5 shadow-xs">
              <Upload className="w-3.5 h-3.5" />
              <span>Importar JSON</span>
              <input 
                type="file" 
                accept=".json" 
                onChange={handleImportJSON} 
                className="hidden" 
              />
            </label>
            <button 
              onClick={handleExportJSON}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs py-2 px-3.5 rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5 shadow-xs"
              title="Descargar datos en formato JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar JSON</span>
            </button>

            {/* NEW: WORD AND EXCEL COLOMBIAN EXPORTS */}
            <button 
              onClick={handleExportWord}
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs py-2 px-3.5 rounded-lg border border-blue-200 transition-colors flex items-center gap-1.5 shadow-sm"
              title="Generar Plan de Emergencias institucional en formato Word editable (.docx)"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Generar Plan Word (.docx)</span>
            </button>
            <button 
              onClick={handleExportExcel}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs py-2 px-3.5 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1.5 shadow-sm"
              title="Descargar memoria técnica detallada y cuadro de respuestas en Excel (.xlsx)"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>Volcar Excel (.xlsx)</span>
            </button>

            {/* TOGGLE INTERACTIVE EXECUTIVE CORPORATIVE REPORT MODAL */}
            <button 
              onClick={() => setShowInteractiveReport(true)}
              className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-xs py-2 px-3.5 rounded-lg border border-purple-200 transition-colors flex items-center gap-1.5 shadow-sm"
              title="Previsualizar el informe ejecutivo con diseño corporativo oficial"
            >
              <FileText className="w-3.5 h-3.5 text-purple-600" />
              <span>Vista Reporte PDF</span>
            </button>

            <button 
              onClick={executePrint}
              className="bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs py-2 px-4 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              title="Lanzar el diálogo de impresión directa del navegador"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Reporte</span>
            </button>
          </div>
        </div>
      </header>

      {/* COMPARED PRESETS BAR (NO-PRINT) */}
      <section className="bg-slate-900 text-white py-6 px-4 no-print border-b border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <p className="text-teal-400 text-xs font-semibold uppercase tracking-wider">Perfiles y Demostraciones Rápidas</p>
              <h2 className="text-sm text-slate-300 mt-1">
                Selecciona un escenario predefinido para probar los cálculos matemáticos del diamante y gatillos de PON en tiempo real.
              </h2>
            </div>
            
            {/* Quick Fill Operations */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-display">Rellenar Todo:</span>
              <button 
                onClick={() => handleQuickFill(1.0)} 
                className="bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/60 border border-emerald-900/50 px-2 py-1 rounded text-xs font-mono transition-colors"
                title="Puntuar 1.0 (Bueno) en todas las casillas"
              >
                1.0 Todo
              </button>
              <button 
                onClick={() => handleQuickFill(0.5)} 
                className="bg-amber-950/40 text-amber-400 hover:bg-amber-900/60 border border-amber-900/50 px-2 py-1 rounded text-xs font-mono transition-colors"
                title="Puntuar 0.5 (Regular) en todas las casillas"
              >
                0.5 Todo
              </button>
              <button 
                onClick={() => handleQuickFill(0.0)} 
                className="bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 border border-rose-900/50 px-2 py-1 rounded text-xs font-mono transition-colors"
                title="Puntuar 0.0 (Malo / No Cumple) en todas las casillas"
              >
                0.0 Todo
              </button>
              <button 
                onClick={handleReset} 
                className="text-slate-400 hover:text-white p-1 rounded transition-colors"
                title="Limpiar todas las respuestas"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-4">
            {EVALUATION_PRESETS.map((preset, index) => {
              const isActive = activePresetIndex === index;
              return (
                <button
                  key={preset.name}
                  onClick={() => handleLoadPreset(index)}
                  className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-slate-800 border-teal-500 shadow-md ring-1 ring-teal-500/30' 
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-teal-400 font-display block truncate max-w-[200px]">
                      {preset.name.split(' (')[0]}
                    </span>
                    <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-slate-800 outline-none">
                      {preset.name.includes('Alto') ? 'CUMPLIMIENTO ALTO' : preset.name.includes('Media') ? 'VULN. MEDIA' : 'VULN. ALTA'}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed mt-1.5 line-clamp-2">
                    {preset.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* DYNAMIC PROGRESS ACCENT (NO-PRINT) */}
      <div className="bg-slate-100 py-2.5 px-4 no-print border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-500" />
            <span className="text-xs text-slate-600">
              Progreso de Evaluación: <strong>{totalAnsweredStats.answered}</strong> de <strong>{totalAnsweredStats.total}</strong> preguntas ({totalAnsweredStats.pct}%)
            </span>
          </div>
          <div className="w-full sm:w-64 bg-slate-200 rounded-full h-2 overflow-hidden shadow-inner">
            <div 
              className="bg-teal-600 h-2 transition-all duration-300" 
              style={{ width: `${totalAnsweredStats.pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* CORE WORKSPACE GRID */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 print-page">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT AREA: INTERACTIVE FORMS - SPAN 7 */}
          <section className="lg:col-span-7 space-y-6 no-print">

            {/* THREAT CONFIGURATOR CARD */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 transition-all">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 mb-4">
                <Compass className="text-teal-600 w-5 h-5 animate-pulse" />
                <h3 className="font-semibold text-slate-950 font-display">1. Configuración de Amenaza de Emergencia</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Seleccionar Amenaza Estándar:
                  </label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:bg-white text-slate-800 font-medium"
                    value={STANDARD_THREATS.some(t => t.name === customThreatName) ? STANDARD_THREATS.find(t => t.name === customThreatName)?.id : ''}
                    onChange={(e) => handlePredefinedThreatSelect(e.target.value)}
                  >
                    <option value="" disabled>-- Selecciona un riesgo estándar --</option>
                    {STANDARD_THREATS.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Nivel de Calificación Técnica:
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">Calificación de Amenaza</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['POSIBLE', 'PROBABLE', 'INMINENTE'] as UrgencyLevel[]).map(level => {
                      const isActive = threatLevel === level;
                      let activeStyle = '';
                      if (isActive) {
                        if (level === 'POSIBLE') activeStyle = 'bg-emerald-500 border-emerald-500 text-white shadow-sm font-semibold';
                        if (level === 'PROBABLE') activeStyle = 'bg-amber-500 border-amber-500 text-white shadow-sm font-semibold';
                        if (level === 'INMINENTE') activeStyle = 'bg-rose-500 border-rose-500 text-white shadow-sm font-semibold';
                      } else {
                        activeStyle = 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100';
                      }

                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => {
                            setActivePresetIndex(null);
                            setThreatLevel(level);
                          }}
                          className={`py-1.5 px-1 text-center rounded-lg border text-xs transition-all cursor-pointer ${activeStyle}`}
                        >
                          {level}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Advanced info customizable inputs */}
              <div className="mt-4 space-y-3 pt-3 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Nombre Personalizado de la Amenaza:
                  </label>
                  <input
                    type="text"
                    value={customThreatName}
                    onChange={(e) => {
                      setActivePresetIndex(null);
                      setCustomThreatName(e.target.value);
                    }}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-lg py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:bg-white font-medium"
                    placeholder="Escriba el nombre de la amenaza (Ej. Explosión por Calderas)"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Descripción / Hipótesis de Accidente:
                  </label>
                  <textarea
                    value={customThreatDesc}
                    onChange={(e) => {
                      setActivePresetIndex(null);
                      setCustomThreatDesc(e.target.value);
                    }}
                    rows={2}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:bg-white text-slate-700 leading-relaxed"
                    placeholder="Detalles sobre el inventario combustible, cargas ignífugas o vulnerabilidades asociadas..."
                  />
                </div>
              </div>
            </div>

            {/* TAB SELECTOR FOR ASSESSMENT */}
            <div className="bg-slate-200/70 p-1 rounded-xl grid grid-cols-3 gap-1">
              <button
                onClick={() => setActiveTab('core')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold font-display transition-all cursor-pointer ${
                  activeTab === 'core' 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Núcleo del Diamante (Core)
              </button>
              <button
                onClick={() => setActiveTab('transversales')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold font-display transition-all cursor-pointer ${
                  activeTab === 'transversales' 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Módulos Transversales COP
              </button>
              <button
                onClick={() => {
                  setActiveTab('pon');
                  // Preset default selected node if not set
                  if (!selectedNodeId && activePONFlow.nodes.length > 0) {
                    setSelectedNodeId(activePONFlow.nodes[1].id);
                  }
                }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold font-display transition-all cursor-pointer ${
                  activeTab === 'pon' 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Gatillo PON Interactivo
              </button>
            </div>

            {/* SEARCH FILTERS HEADER */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar preguntas específicas en la guía evaluativa (Ej. Extintor, Brigada, Litio)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  Limpiar
                </button>
              )}
            </div>

            {/* TAB PANEL 1: CORE DIAMOND COMPONENTS */}
            {activeTab === 'core' && (
              <div className="space-y-6">
                {COMPONENT_BLOCKS.map(block => {
                  const result = coreResults[block.id];
                  const isExpanded = expandedBlocks[block.id];

                  // Filter items/questions if searchable
                  const filteredItems = block.items.filter(item => {
                    const matchItemName = item.name.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchQText = item.questions.some(q => q.text.toLowerCase().includes(searchQuery.toLowerCase()));
                    return matchItemName || matchQText;
                  });

                  // Skip displaying block if filtered and empty
                  if (searchQuery && filteredItems.length === 0) return null;

                  return (
                    <div key={block.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all">
                      <div 
                        onClick={() => toggleBlock(block.id)}
                        className="bg-slate-50/70 py-4 px-5 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-100/55 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {block.id === 'Personas' && <Users className="w-5 h-5 text-indigo-500" />}
                          {block.id === 'Recursos' && <Wrench className="w-5 h-5 text-amber-500" />}
                          {block.id === 'Sistemas' && <Cpu className="w-5 h-5 text-emerald-500" />}
                          <div>
                            <h4 className="font-bold text-slate-900 font-display text-sm">{block.name}</h4>
                            <span className="text-[10px] text-slate-400">Ponderación agrupada en 3 ítems técnicos</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                          {/* Live Block Score Badge */}
                          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1">
                            <span className="text-[10px] font-bold text-slate-400">PROMEDIO:</span>
                            <span className="text-xs font-mono font-bold text-slate-800">{result.average.toFixed(2)}</span>
                            <span className={`w-2.5 h-2.5 rounded-full inline-block ${
                              result.level === 'BAJA' ? 'bg-emerald-500' : result.level === 'MEDIA' ? 'bg-amber-400' : 'bg-red-500'
                            }`} title={`Nivel ${result.level}`} />
                          </div>
                      
                          <button 
                            onClick={() => toggleBlock(block.id)}
                            className="bg-slate-200/80 hover:bg-slate-300/80 text-slate-700 p-1 rounded-md transition-all"
                          >
                            <span className="text-xs font-bold font-mono px-1">
                              {isExpanded ? 'Ocultar' : 'Mostrar'}
                            </span>
                          </button>
                        </div>
                      </div>

                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="p-5 space-y-6"
                          >
                            {filteredItems.map(item => {
                              const itemAvg = result.itemAverages[item.id] || 0.0;
                              const itemColor = itemAvg >= 0.61 ? 'text-emerald-600 bg-emerald-50' : itemAvg >= 0.41 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50';

                              return (
                                <div key={item.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50/20">
                                  <div className="flex items-start justify-between gap-4 border-b border-dashed border-slate-200/80 pb-2.5 mb-3">
                                    <div>
                                      <h5 className="font-bold text-slate-900 text-xs tracking-tight uppercase">{item.name}</h5>
                                      <p className="text-[11px] text-slate-500 leading-normal mt-0.5">{item.description}</p>
                                    </div>
                                    <div className={`px-2 py-0.5 rounded font-mono text-xs font-bold shrink-0 ${itemColor}`}>
                                      Ítem: {itemAvg.toFixed(2)}
                                    </div>
                                  </div>

                                  <div className="space-y-4">
                                    {item.questions.map(q => {
                                      const answer = answers[q.id];
                                      return (
                                        <div key={q.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center hover:bg-slate-50/50 p-2 rounded-lg transition-colors">
                                          <div className="md:col-span-8">
                                            <p className="text-xs font-medium text-slate-800 leading-relaxed">
                                              {q.text}
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-1 leading-normal italic">
                                              Recomendación Técnica: {q.recommendation}
                                            </p>
                                          </div>
                                          
                                          {/* Closed answers selection */}
                                          <div className="md:col-span-4 flex justify-end">
                                            <div className="inline-flex bg-slate-100/80 p-0.5 rounded-lg border border-slate-200/60 grow md:grow-0">
                                              {[
                                                { label: 'Bueno (1.0)', score: 1.0, activeBg: 'bg-emerald-500 text-white' },
                                                { label: 'Regular (0.5)', score: 0.5, activeBg: 'bg-amber-400 text-amber-950 font-medium' },
                                                { label: 'Malo (0.0)', score: 0.0, activeBg: 'bg-rose-500 text-white' }
                                              ].map(opt => {
                                                const isSel = answer === opt.score;
                                                return (
                                                  <button
                                                    key={opt.label}
                                                    type="button"
                                                    onClick={() => handleSetAnswer(q.id, opt.score)}
                                                    className={`px-2 py-1 text-[10px] uppercase font-bold rounded-md transition-all cursor-pointer ${
                                                      isSel ? opt.activeBg : 'text-slate-600 hover:text-slate-900'
                                                    }`}
                                                    title={opt.label}
                                                  >
                                                    {opt.score.toFixed(1)}
                                                  </button>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB PANEL 2: TRANSVERSAL COLOMBIAN SPECIAL BLOCKS */}
            {activeTab === 'transversales' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-teal-50 to-indigo-50 border border-teal-100 p-4 rounded-xl flex items-start gap-3">
                  <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-700 leading-normal">
                    <strong>Ponderación Legal Colombiana:</strong> Estos bloques de riesgo transversal y alto impacto (PESV, Salud Mental, Alturas, Químicos, Litio) se evalúan con la misma escala matemática, pero generan reportes de vulnerabilidad independientes. Esto previene que se camuflen debilidades críticas en las normativas del ministerio de trabajo detrás del promedio general.
                  </div>
                </div>

                {TRANSVERSAL_BLOCKS.map(block => {
                  const result = transversalResults[block.id];
                  const isExpanded = expandedBlocks[block.id];

                  // If search is active, check questions text
                  const matchBlock = block.name.toLowerCase().includes(searchQuery.toLowerCase());
                  const matchQText = block.questions.some(q => q.text.toLowerCase().includes(searchQuery.toLowerCase()));
                  
                  if (searchQuery && !matchBlock && !matchQText) return null;

                  return (
                    <div key={block.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all">
                      <div 
                        onClick={() => toggleBlock(block.id)}
                        className="bg-slate-50/70 py-4 px-5 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-100/55 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-2.5 h-10 bg-indigo-500 rounded-sm inline-block" />
                          <div>
                            <h4 className="font-bold text-slate-950 font-display text-sm">{block.name}</h4>
                            <span className="text-[10px] text-teal-600 font-bold tracking-tight block">
                              {block.lawReference}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1">
                            <span className="text-[10px] font-bold text-slate-400">CUMPLIMIENTO:</span>
                            <span className="text-xs font-mono font-bold text-slate-800">{result.average.toFixed(2)}</span>
                            <span className={`w-2.5 h-2.5 rounded-full inline-block ${
                              result.level === 'BAJA' ? 'bg-emerald-500' : result.level === 'MEDIA' ? 'bg-amber-400' : 'bg-red-500'
                            }`} title={`Nivel ${result.level}`} />
                          </div>
                      
                          <button 
                            onClick={() => toggleBlock(block.id)}
                            className="bg-slate-200/80 hover:bg-slate-300/80 text-slate-700 p-1 rounded-md transition-all"
                          >
                            <span className="text-xs font-bold font-mono px-1">
                              {isExpanded ? 'Ocultar' : 'Mostrar'}
                            </span>
                          </button>
                        </div>
                      </div>

                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="p-5 space-y-4 bg-slate-50/5"
                          >
                            <p className="text-[11px] text-slate-500 italic leading-relaxed border-l-2 border-slate-300 pl-3">
                              {block.description}
                            </p>

                            <div className="space-y-4 pt-2">
                              {block.questions.map(q => {
                                const answer = answers[q.id];
                                return (
                                  <div key={q.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center hover:bg-slate-50/50 p-2 rounded-lg transition-colors">
                                    <div className="md:col-span-8">
                                      <p className="text-xs font-medium text-slate-800 leading-relaxed">
                                        {q.text}
                                      </p>
                                      <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                                        <strong>Mitigación:</strong> {q.recommendation}
                                      </p>
                                    </div>
                                    
                                    <div className="md:col-span-4 flex justify-end">
                                      <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 grow md:grow-0">
                                        {[
                                          { label: 'Bueno (1.0)', score: 1.0, activeBg: 'bg-emerald-500 text-white' },
                                          { label: 'Regular (0.5)', score: 0.5, activeBg: 'bg-amber-400 text-amber-950 font-medium' },
                                          { label: 'Malo (0.0)', score: 0.0, activeBg: 'bg-rose-500 text-white' }
                                        ].map(opt => {
                                          const isSel = answer === opt.score;
                                          return (
                                            <button
                                              key={opt.label}
                                              type="button"
                                              onClick={() => handleSetAnswer(q.id, opt.score)}
                                              className={`px-2 py-1 text-[10px] uppercase font-bold rounded-md transition-all cursor-pointer ${
                                                isSel ? opt.activeBg : 'text-slate-600 hover:text-slate-900'
                                              }`}
                                              title={opt.label}
                                            >
                                              {opt.score.toFixed(1)}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB PANEL 3: INTERACTIVE PON FLOWCHART */}
            {activeTab === 'pon' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-6">
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-teal-600 uppercase bg-teal-50 px-2 py-0.5 rounded-md">
                    Diagnóstico por Hallazgos
                  </span>
                  <h4 className="text-lg font-bold text-slate-950 font-display mt-1">
                    {activePONFlow.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Diagrama de flujo operativo normalizado activo para <strong>{customThreatName}</strong> ({threatLevel}). Haz clic en cualquier nodo para inspeccionar los roles, equipos e instrucciones obligatorias de respuesta.
                  </p>
                </div>

                {/* SVG/Interactive Flowchart block */}
                <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto border border-slate-800 shadow-inner flex flex-col items-center">
                  <div className="flex flex-col items-center gap-4 w-full min-w-[500px] py-4">
                    {activePONFlow.nodes.map((node, i) => {
                      const isNodeSelected = selectedNodeId === node.id;
                      let borderClass = 'border-slate-700 bg-slate-800 text-slate-300';
                      
                      if (node.type === 'start') {
                        borderClass = 'rounded-full border-indigo-500 bg-indigo-950 text-indigo-200';
                      } else if (node.type === 'end') {
                        borderClass = 'rounded-full border-teal-500 bg-teal-950 text-teal-200';
                      } else if (node.type === 'decision') {
                        borderClass = 'border-amber-500 bg-amber-950/70 text-amber-100 skew-x-3';
                      } else if (node.type === 'caution') {
                        borderClass = 'border-rose-500 bg-rose-950 text-rose-200 font-semibold';
                      }

                      if (isNodeSelected) {
                        borderClass += ' ring-4 ring-cyan-400 outline-none scale-102 font-bold shadow-lg';
                      }

                      return (
                        <div key={node.id} className="flex flex-col items-center w-full">
                          
                          {/* Directed Edge Arrow with decision text */}
                          {i > 0 && (
                            <div className="flex flex-col items-center py-2 h-10 justify-center">
                              <div className="w-0.5 h-full bg-slate-700 relative">
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-slate-700" />
                              </div>
                              {/* If edge has conditions from previous decision */}
                              {activePONFlow.edges[i-1]?.condition && (
                                <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-md font-mono mt-0.5">
                                  {activePONFlow.edges[i-1].condition}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Node Box */}
                          <div
                            onClick={() => setSelectedNodeId(node.id)}
                            className={`w-4/5 md:w-2/3 border p-3 cursor-pointer text-center select-none transition-all ${borderClass}`}
                          >
                            <div className="flex justify-between items-center gap-2 mb-1 border-b border-white/5 pb-1">
                              <span className="text-[8px] font-mono tracking-wider opacity-60">PASO {i+1}</span>
                              {node.role && (
                                <span className="text-[9px] uppercase font-bold tracking-tight text-teal-400 px-1.5 py-0.5 rounded-sm bg-black/30">
                                  {node.role}
                                </span>
                              )}
                            </div>
                            <span className="text-xs leading-relaxed font-semibold">
                              {node.label}
                            </span>
                          </div>
                      
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Flow Node Detail Panel */}
                {activeNodeInfo ? (
                  <motion.div 
                    key={activeNodeInfo.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-teal-50/70 rounded-xl border border-teal-150 shadow-xs"
                  >
                    <div className="flex items-center gap-2 border-b border-teal-200/80 pb-2 mb-2.5">
                      <AlertCircle className="w-4 h-4 text-teal-600 shrink-0" />
                      <h5 className="font-bold text-slate-900 text-xs font-display">
                        Ficha Técnica del Procedimiento Operativo (Paso Seleccionado)
                      </h5>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Responsable de Acción:</span>
                        <strong className="text-slate-900">{activeNodeInfo.role || 'Todo el personal'}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Tipo de Actividad PON:</span>
                        <span className="text-slate-900 font-medium capitalize font-mono text-[11px]">{activeNodeInfo.type}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Mandato Técnico:</span>
                        <p className="text-slate-800 leading-relaxed mt-0.5">
                          {activeNodeInfo.label}. Debe coordinarse estrechamente con el brigadista asignado al piso o sucursal por medio del megáfono o radio de contingencia.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center py-4 bg-slate-50 border border-slate-200 border-dashed rounded-xl">
                    <p className="text-xs text-slate-500">Haz clic en cualquier fase del flujograma superior para ver los detalles operativos.</p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* RIGHT AREA: AUTOMATED DETAILED REPORT CARD & PRINT LAYOUT */}
          <section className="lg:col-span-5 space-y-6">

            {/* QUICK DIAMOND VIEW CARD */}
            <div className="bg-slate-950 text-white rounded-2xl p-5 shadow-lg border border-slate-800 relative overflow-hidden">
              
              {/* Subtle background glow representing active dynamic risk */}
              <div className="absolute -right-16 -top-16 w-44 h-44 rounded-full filter blur-xl opacity-20 bg-teal-500" />
              
              <div className="flex items-center justify-between border-b border-slate-850 pb-3 mb-4.5 no-print">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-teal-400" />
                  <h3 className="font-bold font-display text-sm tracking-tight">El Diamante de Riesgo</h3>
                </div>
                <div className="text-[10px] bg-slate-850 text-slate-400 px-2 py-0.5 font-mono rounded">
                  Calculo Dinámico SVG
                </div>
              </div>

              {/* DYNAMIC SVG DIAMOND VIZ */}
              <div className="flex flex-col items-center justify-center py-4">
                <svg viewBox="0 0 300 300" className="w-64 h-64 drop-shadow-md">
                  {/* Outer Diamond Container Grid line guides */}
                  <line x1="150" y1="0" x2="150" y2="300" stroke="#1f2937" strokeWidth="1" strokeDasharray="3" />
                  <line x1="0" y1="150" x2="300" y2="150" stroke="#1f2937" strokeWidth="1" strokeDasharray="3" />

                  {/* 1. TOP ROMBO: Threat (Amenazas) */}
                  <polygon
                    points="150,15 225,90 150,165 75,90"
                    fill={getThreatColorClass(threatLevel).fill}
                    fillOpacity="0.85"
                    stroke="#111827"
                    strokeWidth="3"
                    className="transition-all duration-300 hover:fill-opacity-100 cursor-help"
                  >
                    <title>Rojo/Amenaza: {threatLevel}</title>
                  </polygon>
                  <text x="150" y="70" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold" fontFamily="monospace">AMENAZA</text>
                  <text x="150" y="85" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold" fontFamily="monospace">{threatLevel}</text>

                  {/* 2. LEFT ROMBO: People (Personas) */}
                  <polygon
                    points="75,90 150,165 75,240 0,165"
                    fill={getVulColorClass(coreResults['Personas']?.level || 'BAJA')}
                    fillOpacity="0.85"
                    stroke="#111827"
                    strokeWidth="3"
                    className="transition-all duration-300 hover:fill-opacity-100 cursor-help"
                  >
                    <title>Personas: {coreResults['Personas']?.level}</title>
                  </polygon>
                  <text x="75" y="150" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold" fontFamily="monospace">PERSONAS</text>
                  <text x="75" y="165" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold" fontFamily="monospace">
                    V: {coreResults['Personas']?.average.toFixed(2)}
                  </text>

                  {/* 3. RIGHT ROMBO: Resources (Recursos) */}
                  <polygon
                    points="225,90 300,165 225,240 150,165"
                    fill={getVulColorClass(coreResults['Recursos']?.level || 'BAJA')}
                    fillOpacity="0.85"
                    stroke="#111827"
                    strokeWidth="3"
                    className="transition-all duration-300 hover:fill-opacity-100 cursor-help"
                  >
                    <title>Recursos: {coreResults['Recursos']?.level}</title>
                  </polygon>
                  <text x="225" y="150" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold" fontFamily="monospace">RECURSOS</text>
                  <text x="225" y="165" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold" fontFamily="monospace">
                    V: {coreResults['Recursos']?.average.toFixed(2)}
                  </text>

                  {/* 4. BOTTOM ROMBO: Systems and Processes (Sistemas) */}
                  <polygon
                    points="150,165 225,240 150,315 75,240"
                    fill={getVulColorClass(coreResults['Sistemas']?.level || 'BAJA')}
                    fillOpacity="0.85"
                    stroke="#111827"
                    strokeWidth="3"
                    className="transition-all duration-300 hover:fill-opacity-100 cursor-help"
                  >
                    <title>Sistemas: {coreResults['Sistemas']?.level}</title>
                  </polygon>
                  <text x="150" y="225" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold" fontFamily="monospace">SISTEMAS</text>
                  <text x="150" y="240" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold" fontFamily="monospace">
                    V: {coreResults['Sistemas']?.average.toFixed(2)}
                  </text>

                  {/* Center Hub Indicator Box */}
                  <circle cx="150" cy="165" r="14" fill="#030712" stroke="#4b5563" strokeWidth="1.5" />
                  <text x="150" y="168" textAnchor="middle" fill="#2dd4bf" fontSize="8" fontWeight="bold" fontFamily="sans-serif">
                    V={redVulnerabilityRombosCount}R
                  </text>
                </svg>

                {/* Subtitle list descriptors */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 mt-5 w-full text-xs font-mono text-slate-300 bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-md" style={{ backgroundColor: getThreatColorClass(threatLevel).fill }} />
                    <span className="truncate w-full text-slate-400">AMENAZA:</span>
                    <strong className="text-white">{threatLevel}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-md" style={{ backgroundColor: getVulColorClass(coreResults['Personas']?.level || 'BAJA') }} />
                    <span className="truncate w-full text-slate-400">PERSONAS:</span>
                    <strong className="text-white">{coreResults['Personas']?.level}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-md" style={{ backgroundColor: getVulColorClass(coreResults['Recursos']?.level || 'BAJA') }} />
                    <span className="truncate w-full text-slate-400">RECURSOS:</span>
                    <strong className="text-white">{coreResults['Recursos']?.level}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-md" style={{ backgroundColor: getVulColorClass(coreResults['Sistemas']?.level || 'BAJA') }} />
                    <span className="truncate w-full text-slate-400">SISTEMAS:</span>
                    <strong className="text-white">{coreResults['Sistemas']?.level}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* METHODOLOGICAL DECISION INTERSECT MATRIX */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center gap-1.5 border-b border-slate-100 pb-3 mb-4">
                <span className="w-2.5 h-4 bg-teal-600 rounded-xs inline-block" />
                <h4 className="font-bold text-slate-950 font-display text-xs uppercase tracking-wider">
                  Matriz de Decisión (Cruce Técnico)
                </h4>
              </div>

              <div className="text-xs text-slate-500 mb-3 leading-relaxed">
                El cruce final se realiza contrastando la Vulnerabilidad Consolidada (abajo) contra la probabilidad de Amenaza en Colombia:
              </div>

              {/* Real SVG Grid Matriz */}
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] font-mono border-collapse min-w-[280px]">
                  <thead>
                    <tr>
                      <th className="p-1 px-1.5 text-slate-300 font-sans border border-slate-100 text-left">VULN ↓ / AMENAZA →</th>
                      <th className={`p-2 border font-bold text-center border-slate-100 text-emerald-800 ${threatLevel === 'POSIBLE' ? 'bg-emerald-50 ring-2 ring-emerald-400 ring-inset' : 'bg-slate-50'}`}>
                        POSIBLE (V)
                      </th>
                      <th className={`p-2 border font-bold text-center border-slate-100 text-amber-800 ${threatLevel === 'PROBABLE' ? 'bg-amber-50 ring-2 ring-amber-400 ring-inset' : 'bg-slate-50'}`}>
                        PROBABLE (A)
                      </th>
                      <th className={`p-2 border font-bold text-center border-slate-100 text-rose-850 ${threatLevel === 'INMINENTE' ? 'bg-rose-50 ring-2 ring-rose-400 ring-inset' : 'bg-slate-50'}`}>
                        INMINENTE (R)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Vul BAJA */}
                    <tr className={consolidatedVulnerabilityLevel === 'BAJA' ? 'bg-teal-50/50' : ''}>
                      <td className={`p-1.5 border font-semibold border-slate-100 text-slate-700 ${consolidatedVulnerabilityLevel === 'BAJA' ? 'font-bold text-teal-700 bg-teal-50' : ''}`}>
                        BAJA (Verde)
                      </td>
                      <td className={`p-2 border text-center border-slate-100 ${consolidatedVulnerabilityLevel === 'BAJA' && threatLevel === 'POSIBLE' ? 'bg-emerald-500 text-white font-bold scale-102 ring-4 ring-cyan-350' : 'text-emerald-600 bg-emerald-50/40'}`}>
                        BAJO (V)
                      </td>
                      <td className={`p-2 border text-center border-slate-100 ${consolidatedVulnerabilityLevel === 'BAJA' && threatLevel === 'PROBABLE' ? 'bg-amber-400 text-black font-bold scale-102 ring-4 ring-cyan-350' : 'text-amber-600 bg-amber-50/40'}`}>
                        MEDIO (Y)
                      </td>
                      <td className={`p-2 border text-center border-slate-100 ${consolidatedVulnerabilityLevel === 'BAJA' && threatLevel === 'INMINENTE' ? 'bg-amber-400 text-black font-bold scale-102 ring-4 ring-cyan-350' : 'text-amber-600 bg-amber-50/40'}`}>
                        MEDIO (Y)
                      </td>
                    </tr>

                    {/* Vul MEDIA */}
                    <tr className={consolidatedVulnerabilityLevel === 'MEDIA' ? 'bg-teal-50/50' : ''}>
                      <td className={`p-1.5 border font-semibold border-slate-100 text-slate-705 ${consolidatedVulnerabilityLevel === 'MEDIA' ? 'font-bold text-teal-700 bg-teal-50' : ''}`}>
                        MEDIA (Amarillo)
                      </td>
                      <td className={`p-2 border text-center border-slate-100 ${consolidatedVulnerabilityLevel === 'MEDIA' && threatLevel === 'POSIBLE' ? 'bg-amber-400 text-black font-bold scale-102 ring-4 ring-cyan-350' : 'text-amber-600 bg-amber-50/40'}`}>
                        MEDIO (Y)
                      </td>
                      <td className={`p-2 border text-center border-slate-100 ${consolidatedVulnerabilityLevel === 'MEDIA' && threatLevel === 'PROBABLE' ? 'bg-amber-400 text-black font-bold scale-102 ring-4 ring-cyan-350' : 'text-amber-600 bg-amber-50/40'}`}>
                        MEDIO (Y)
                      </td>
                      <td className={`p-2 border text-center border-slate-100 ${consolidatedVulnerabilityLevel === 'MEDIA' && threatLevel === 'INMINENTE' ? 'bg-red-500 text-white font-bold scale-102 ring-4 ring-cyan-350' : 'text-rose-600 bg-rose-50/40'}`}>
                        ALTO (R)
                      </td>
                    </tr>

                    {/* Vul ALTA */}
                    <tr className={consolidatedVulnerabilityLevel === 'ALTA' ? 'bg-teal-50/50' : ''}>
                      <td className={`p-1.5 border font-semibold border-slate-100 text-slate-707 ${consolidatedVulnerabilityLevel === 'ALTA' ? 'font-bold text-teal-700 bg-teal-50' : ''}`}>
                        ALTA (Rojo)
                      </td>
                      <td className={`p-2 border text-center border-slate-100 ${consolidatedVulnerabilityLevel === 'ALTA' && threatLevel === 'POSIBLE' ? 'bg-amber-400 text-black font-bold scale-102 ring-4 ring-cyan-350' : 'text-amber-600 bg-amber-50/40'}`}>
                        MEDIO (Y)
                      </td>
                      <td className={`p-2 border text-center border-slate-100 ${consolidatedVulnerabilityLevel === 'ALTA' && threatLevel === 'PROBABLE' ? 'bg-red-500 text-white font-bold scale-102 ring-4 ring-cyan-350' : 'text-rose-600 bg-rose-50/40'}`}>
                        ALTO (R)
                      </td>
                      <td className={`p-2 border text-center border-slate-100 ${consolidatedVulnerabilityLevel === 'ALTA' && threatLevel === 'INMINENTE' ? 'bg-red-500 text-white font-bold scale-102 ring-4 ring-cyan-350' : 'text-rose-600 bg-rose-50/40'}`}>
                        ALTO (R)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* PRINT DYNAMIC SYSTEM REPORT CARD */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-600" />
                  <h4 className="font-bold text-slate-950 font-display text-sm tracking-tight">Reporte de Desempeño Consolidado</h4>
                </div>
                <span className="text-[9px] text-slate-400 font-mono tracking-wider">Gatillo automático</span>
              </div>

              {/* Global risk indicator flag */}
              <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                globalRiskIntersections.color === 'green' ? 'bg-emerald-50 text-emerald-950 border-emerald-150' :
                globalRiskIntersections.color === 'yellow' ? 'bg-amber-50 text-amber-950 border-amber-150' :
                'bg-rose-50 text-rose-950 border-rose-150 animate-pulse'
              }`}>
                <div className="mt-1">
                  {globalRiskIntersections.color === 'green' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-amber-600" />}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block">Nivel de Riesgo Corporativo</span>
                  <p className="text-sm font-bold font-display leading-tight mt-0.5">
                    RIESGO {globalRiskIntersections.level} ante {customThreatName}
                  </p>
                  <p className="text-xs text-slate-700 leading-relaxed mt-1.5">
                    {globalRiskIntersections.description}
                  </p>
                </div>
              </div>

              {/* Dynamic Narrative formulation */}
              <div className="bg-slate-50 rounded-xl p-3.5 text-xs text-slate-800 leading-relaxed space-y-1.5 border border-slate-200/60">
                <p>
                  <strong>Formulación Metodológica:</strong> El nivel de amenaza se califica como <strong>{threatLevel}</strong>. 
                  En la evaluación, se identificaron <strong>{redVulnerabilityRombosCount}</strong> de 3 componentes del núcleo (Personas, Recursos, Sistemas) con vulnerabilidad <strong>ALTA</strong>.
                </p>
                <p>
                  Esto genera una <strong>Vulnerabilidad Consolidada {consolidatedVulnerabilityLevel}</strong> en el diamante representativo, ubicando el plano en la coordenada correspondiente de la matriz.
                </p>
              </div>

              {/* SPECIAL REGULATORY ALERTS IN COLOMBIA */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-900 font-display">Alertas de Procesos Críticos de Alto Riesgo:</span>
                </div>

                {specialAlerts.length > 0 ? (
                  <div className="space-y-3">
                    {specialAlerts.map(alert => {
                      const isHigh = transversalResults[alert.blockId]?.level === 'ALTA';
                      return (
                        <div 
                          key={alert.blockId} 
                          className={`p-3.5 rounded-lg border text-xs ${
                            isHigh 
                              ? 'bg-rose-50/70 border-rose-200 text-rose-950' 
                              : 'bg-amber-50/70 border-amber-200 text-amber-950'
                          }`}
                        >
                          <div className="flex justify-between items-center pb-1.5 mb-1.5 border-b border-black/5">
                            <span className="font-bold underline tracking-tight">⚠️ Alerta {alert.title}</span>
                            <span className="font-mono text-[10px] font-bold">PROM: {alert.avg.toFixed(2)}</span>
                          </div>
                          
                          <p className="text-[11px] mb-2 leading-relaxed">
                            {alert.message}
                          </p>
                          
                          {alert.recs.length > 0 && (
                            <div className="space-y-1">
                              <span className="font-semibold text-[10px] block text-slate-600">Correctores Obligatorios:</span>
                              <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-700">
                                {alert.recs.slice(0, 3).map((v, idx) => (
                                  <li key={idx} className="leading-tight">{v}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-emerald-50 text-emerald-800 p-3.5 border border-emerald-100 rounded-lg text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>✓ Todos los bloques transversales están protegidos y cumplen plenamente la norma local. ¡Excelente compromiso técnico!</span>
                  </div>
                )}
              </div>
            </div>

            {/* REGULATORY APPENDIX LINK FOR PERSISTENCE */}
            <div className="bg-slate-100 rounded-xl p-4 border border-slate-200 text-xs text-slate-600 leading-normal space-y-2 no-print">
              <div className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-bold text-slate-800">Marco Legal de Aplicabilidad</span>
              </div>
              <p className="text-[11px]">
                En Colombia, la metodología de los rombos se ajusta a las auditorías solicitadas por las Administradoras de Riesgos Laborales (ARL) para la estructuración del Plan de Prevención y Respuesta ante Emergencias. Los hallazgos deben incorporarse en el Auto-reporte de Estándares Mínimos de la Resolución 0312 de 2019.
              </p>
            </div>

          </section>

        </div>

        {/* PRINT ONLY SYSTEM SECTION FOR PRECISE PDF EXPORTS */}
        <section className="hidden print:block mt-8 space-y-8 text-neutral-900">
          <div className="border-t-2 border-slate-900 pt-5 text-center">
            <h2 className="text-xl font-bold uppercase tracking-wide">REPORTE TÉCNICO FORMAL DE VULNERABILIDAD POR ROMBOS</h2>
            <p className="text-xs text-slate-500 mt-1">
              Emitido el {new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 text-xs">
            <div className="border p-4 rounded bg-slate-50">
              <h3 className="font-bold border-b pb-1.5 mb-2 uppercase">DIAGNÓSTICO GENERAL</h3>
              <p className="mb-1"><strong>Amenaza Analizada:</strong> {customThreatName}</p>
              <p className="mb-1"><strong>Calificación de Amenaza:</strong> {threatLevel}</p>
              <p className="mb-1"><strong>Vulnerabilidad Consolidada:</strong> {consolidatedVulnerabilityLevel} ({redVulnerabilityRombosCount} rombos rojos)</p>
              <p className="mb-1"><strong>Nivel de Riesgo Resultante:</strong> RIESGO {globalRiskIntersections.level}</p>
              <p className="mt-2 text-[11px] text-justify italic">{globalRiskIntersections.description}</p>
            </div>

            <div className="border p-4 rounded bg-slate-50">
              <h3 className="font-bold border-b pb-1.5 mb-2 uppercase">INDICADORES DE DESEMPEÑO</h3>
              <p className="mb-1"><strong>V_Personas (Promedio):</strong> {coreResults['Personas']?.average.toFixed(2)} ({coreResults['Personas']?.level})</p>
              <p className="mb-1"><strong>V_Recursos (Promedio):</strong> {coreResults['Recursos']?.average.toFixed(2)} ({coreResults['Recursos']?.level})</p>
              <p className="mb-1"><strong>V_Sistemas (Promedio):</strong> {coreResults['Sistemas']?.average.toFixed(2)} ({coreResults['Sistemas']?.level})</p>
              <div className="border-t mt-2 pt-2 text-[10px]">
                <p><strong>PESV:</strong> {transversalResults['PESV']?.average.toFixed(2)} | <strong>Psicosocial:</strong> {transversalResults['Psicosocial']?.average.toFixed(2)}</p>
                <p><strong>Alturas:</strong> {transversalResults['Alturas']?.average.toFixed(2)} | <strong>Litio:</strong> {transversalResults['Litio']?.average.toFixed(2)} | <strong>Químicos:</strong> {transversalResults['Quimicos']?.average.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="border p-4 rounded">
            <h3 className="font-bold border-b pb-1.5 mb-3 uppercase text-xs">HALLAZGOS Y CORRECTIVOS RECOMENDADOS</h3>
            <table className="w-full text-[10px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b">
                  <th className="p-1 px-2">Bloque Normativo</th>
                  <th className="p-1">Estado</th>
                  <th className="p-1">Medida Técnica Recomendada</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(transversalResults).map(key => {
                  const r = transversalResults[key];
                  const block = TRANSVERSAL_BLOCKS.find(b => b.id === key);
                  const badQuestions = block?.questions.filter(q => (answers[q.id] || 0) < 1.0) || [];
                  return (
                    <tr key={key} className="border-b">
                      <td className="p-1.5 font-semibold">{r.name}</td>
                      <td className="p-1.5 uppercase font-mono">{r.level} ({r.average})</td>
                      <td className="p-1.5 text-neutral-600">
                        {badQuestions.length > 0 
                          ? badQuestions.map((q, i) => q.recommendation).join('; ') 
                          : 'Cumple totalmente la reglamentación aplicable.'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* SIGNATURE FIELDS FOR PDF EXPORTS */}
          <div className="pt-12 grid grid-cols-2 gap-12 text-center text-xs">
            <div>
              <div className="border-b border-black w-4/5 mx-auto h-12" />
              <p className="mt-2 font-bold">Responsable del SG-SST</p>
              <p className="text-slate-500">Firma Autorizada y Licencia</p>
            </div>
            <div>
              <div className="border-b border-black w-4/5 mx-auto h-12" />
              <p className="mt-2 font-bold">Representante Legal / COE</p>
              <p className="text-slate-500">Firma de Recibido y Responso</p>
            </div>
          </div>
        </section>

      </main>

      {/* INTERACTIVE PDF CORPORATE REPORT PREVISUALIZER MODAL */}
      <AnimatePresence>
        {showInteractiveReport && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/80 z-50 overflow-y-auto no-print flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-100 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col my-8 h-[90vh]"
            >
              {/* Modal Header Controls */}
              <div className="bg-slate-950 text-white px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-600 text-white p-2 rounded-xl">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base font-display">Previsualización de Informe Ejecutivo Formal</h3>
                    <p className="text-xs text-slate-400">Pristino diseño corporativo para presentación ante gerencia, ARL o auditores</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button 
                    onClick={handleExportWord}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Descargar Word (.docx)</span>
                  </button>
                  <button 
                    onClick={handleExportExcel}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Volcar Excel (.xlsx)</span>
                  </button>
                  <button 
                    onClick={() => {
                      executePrint();
                    }}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir / PDF</span>
                  </button>
                  <button 
                    onClick={() => setShowInteractiveReport(false)}
                    className="text-slate-400 hover:text-white hover:bg-slate-800/80 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all"
                  >
                    Cerrar (Regresar)
                  </button>
                </div>
              </div>

              {/* Modal Body: Styled A4 Document Area */}
              <div className="p-6 overflow-y-auto flex-1 bg-slate-200/50 flex flex-col items-center">
                <div className="bg-white max-w-4xl w-full shadow-lg p-8 sm:p-12 rounded-sm text-slate-900 font-sans space-y-8 border-t-[12px] border-slate-900 leading-relaxed">
                  
                  {/* Document Institutional Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-200 pb-5">
                    <div>
                      <span className="text-[10px] tracking-widest text-slate-400 uppercase font-mono block font-bold">Documento Corporativo Emergencias SG-SST</span>
                      <h2 className="text-2xl font-bold text-slate-950 font-display tracking-tight leading-none mt-1">PLAN DE EMERGENCIAS INSTITUCIONAL</h2>
                      <p className="text-xs font-semibold text-teal-700 mt-1 uppercase">Sede Corporativa Principal - República de Colombia</p>
                    </div>
                    <div className="text-right text-xs font-mono text-slate-500 space-y-0.5 border border-slate-200 p-3 rounded bg-slate-50 shrink-0">
                      <p><strong>CÓDIGO:</strong> SG-SST-EMERG-044</p>
                      <p><strong>FECHA:</strong> {new Date().toLocaleDateString()}</p>
                      <p><strong>VERSIÓN:</strong> 1.0 Original</p>
                    </div>
                  </div>

                  {/* Characterization of the Accident Hypoth */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display">I. Caracterización del Riesgo y Amenaza</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-slate-100 rounded-xl p-4.5 bg-slate-50/50">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Amenaza Evaluada</span>
                        <strong className="text-sm text-slate-800 font-display leading-tight block mt-0.5">{customThreatName}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Nivel de Probabilidad</span>
                        <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-md mt-1.5 ${getThreatColorClass(threatLevel).bg}`}>
                          {getThreatColorClass(threatLevel).text}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Marco Regulador</span>
                        <strong className="text-xs text-slate-600 block mt-1">Decreto 1072, Resol. 0312</strong>
                      </div>
                      <div className="md:col-span-3 border-t border-slate-250 pt-3 mt-1.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Detalles del Escenario Evaluado</span>
                        <p className="text-xs text-slate-700 mt-1 leading-relaxed text-justify">{customThreatDesc}</p>
                      </div>
                    </div>
                  </div>

                  {/* Diamond Visuals Context */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center border-y border-slate-150 py-6">
                    <div className="md:col-span-6 flex flex-col items-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-3.5">II. Estructura del Diamante de Riesgo</span>
                      
                      {/* Interactive SVG embedded inside formal report */}
                      <svg viewBox="0 0 300 300" className="w-52 h-52 drop-shadow-sm bg-slate-900 rounded-2xl p-3 border border-slate-800">
                        <line x1="150" y1="0" x2="150" y2="300" stroke="#1f2937" strokeWidth="1" strokeDasharray="3" />
                        <line x1="0" y1="150" x2="300" y2="150" stroke="#1f2937" strokeWidth="1" strokeDasharray="3" />
                        
                        {/* TOP */}
                        <polygon points="150,15 225,90 150,165 75,90" fill={getThreatColorClass(threatLevel).fill} stroke="#111827" strokeWidth="2.5" />
                        <text x="150" y="70" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold">AMENAZA</text>
                        <text x="150" y="82" textAnchor="middle" fill="#FFFFFF" fontSize="8">{threatLevel}</text>

                        {/* LEFT */}
                        <polygon points="75,90 150,165 75,240 0,165" fill={getVulColorClass(coreResults['Personas']?.level || 'BAJA')} stroke="#111827" strokeWidth="2.5" />
                        <text x="75" y="148" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold">PERSONAS</text>
                        <text x="75" y="160" textAnchor="middle" fill="#FFFFFF" fontSize="8">V: {coreResults['Personas']?.average.toFixed(2)}</text>

                        {/* RIGHT */}
                        <polygon points="225,90 300,165 225,240 150,165" fill={getVulColorClass(coreResults['Recursos']?.level || 'BAJA')} stroke="#111827" strokeWidth="2.5" />
                        <text x="225" y="148" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold">RECURSOS</text>
                        <text x="225" y="160" textAnchor="middle" fill="#FFFFFF" fontSize="8">V: {coreResults['Recursos']?.average.toFixed(2)}</text>

                        {/* BOTTOM */}
                        <polygon points="150,165 225,240 150,315 75,240" fill={getVulColorClass(coreResults['Sistemas']?.level || 'BAJA')} stroke="#111827" strokeWidth="2.5" />
                        <text x="150" y="222" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold">SISTEMAS</text>
                        <text x="150" y="234" textAnchor="middle" fill="#FFFFFF" fontSize="8">V: {coreResults['Sistemas']?.average.toFixed(2)}</text>

                        {/* Center hub */}
                        <circle cx="150" cy="165" r="14" fill="#030712" stroke="#4b5563" strokeWidth="1.5" />
                        <text x="150" y="168" textAnchor="middle" fill="#2dd4bf" fontSize="8" fontWeight="bold">V={redVulnerabilityRombosCount}R</text>
                      </svg>
                    </div>

                    <div className="md:col-span-6 space-y-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block border-b pb-1.5">Conclusiones Generales del Análisis</span>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Nivel de Riesgo Interceptado</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`w-3.5 h-3.5 rounded-full ${
                            globalRiskIntersections.color === 'green' ? 'bg-emerald-500' :
                            globalRiskIntersections.color === 'yellow' ? 'bg-amber-500' : 'bg-red-500'
                          }`} />
                          <strong className="text-base text-slate-900 font-display tracking-tight">
                            RIESGO {globalRiskIntersections.level}
                          </strong>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed text-justify mt-1">
                        {globalRiskIntersections.description}
                      </p>
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded text-xs space-y-0.5 text-slate-600">
                        <p><strong>Vulnerabilidad Consolidada Sede:</strong> {consolidatedVulnerabilityLevel}</p>
                        <p><strong>Rombos en Rojo (Fallas Core):</strong> {redVulnerabilityRombosCount} de 3 componentes</p>
                      </div>
                    </div>
                  </div>

                  {/* Core Semaphore Table inside report */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-display">III. Calificaciones Core (Matriz del Semáforo)</h3>
                    <table className="w-full text-left text-xs border border-slate-200 border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-white border-b border-slate-800">
                          <th className="p-2.5">Componente Core de Vulnerabilidad</th>
                          <th className="p-2.5 text-center">Promedio Numérico</th>
                          <th className="p-2.5 text-center">Calificación Cualitativa</th>
                          <th className="p-2.5 text-center">Estado de Alerta</th>
                        </tr>
                      </thead>
                      <tbody>
                        {COMPONENT_BLOCKS.map(b => {
                          const res = coreResults[b.id];
                          return (
                            <tr key={b.id} className="border-b border-slate-200 hover:bg-slate-50">
                              <td className="p-2.5 font-semibold text-slate-800">{res?.name}</td>
                              <td className="p-2.5 text-center font-mono font-bold text-slate-900">{res?.average.toFixed(2)}</td>
                              <td className="p-2.5 text-center font-bold">
                                <span className={`inline-block px-2 py-0.5 text-[10px] rounded ${
                                  res?.level === 'BAJA' ? 'bg-emerald-100 text-emerald-800' :
                                  res?.level === 'MEDIA' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {res?.level}
                                </span>
                              </td>
                              <td className="p-2.5 text-center font-mono font-bold capitalize" style={{ color: res?.colorHex }}>
                                {res?.color === 'red' ? '🔴 ALERTA CRÍTICA' : res?.color === 'yellow' ? '🟡 ADVERTENCIA' : '🟢 PROTEGIDO'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Transversal High Impact Blocks Status inside report */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-display">IV. Auditoría de Módulos Especiales Transversales</h3>
                    <table className="w-full text-left text-xs border border-slate-200 border-collapse">
                      <thead>
                        <tr className="bg-slate-800 text-white border-b border-slate-700">
                          <th className="p-2.5">Bloques Regulatorios Especiales</th>
                          <th className="p-2.5">Marco Jurídico de Referencia</th>
                          <th className="p-2.5 text-center">Puntaje Obtenido</th>
                          <th className="p-2.5 text-center">Nivel Riesgo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {TRANSVERSAL_BLOCKS.map(b => {
                          const r = transversalResults[b.id];
                          return (
                            <tr key={b.id} className="border-b border-slate-200 hover:bg-slate-50">
                              <td className="p-2.5 font-semibold text-slate-800">{r?.name}</td>
                              <td className="p-2.5 font-mono text-xs text-slate-500">{r?.lawReference}</td>
                              <td className="p-2.5 text-center font-mono font-bold text-slate-900">{r?.average.toFixed(2)}</td>
                              <td className="p-2.5 text-center font-bold">
                                <span className={`inline-block px-2 py-0.5 text-[10px] rounded-md ${
                                  r?.level === 'BAJA' ? 'bg-emerald-100 text-emerald-800' :
                                  r?.level === 'MEDIA' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {r?.level}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Critical Action Alerts list inside report */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-display">V. Alertas de Severidad e Intervención Legal</h3>
                    {specialAlerts.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {specialAlerts.map(alert => (
                          <div key={alert.blockId} className="border border-red-200 bg-rose-50/40 p-4 rounded-xl">
                            <h4 className="font-bold text-xs text-rose-950 uppercase border-b pb-1 mb-1.5 flex justify-between items-center">
                              <span>⚠️ Falla en {alert.title}</span>
                              <span className="font-mono text-[10px]">{alert.law}</span>
                            </h4>
                            <p className="text-[11px] text-slate-700 leading-normal mb-2">{alert.message}</p>
                            {alert.recs.length > 0 && (
                              <div className="space-y-1">
                                <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Correctores Obligatorios:</span>
                                <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-700">
                                  {alert.recs.slice(0, 3).map((rec, i) => (
                                    <li key={i} className="leading-tight">{rec}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-emerald-50 text-emerald-800 p-4 border border-emerald-100 rounded-lg text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Todos los bloques transversales se encuentran protegidos. ¡Estupendo cumplimiento reglamentario!</span>
                      </div>
                    )}
                  </div>

                  {/* Signatures block */}
                  <div className="pt-12 grid grid-cols-2 gap-12 text-center text-xs">
                    <div>
                      <div className="border-b border-slate-400 w-3/4 mx-auto h-12" />
                      <p className="mt-2 font-bold text-slate-800">Responsable Licenciado SG-SST</p>
                      <p className="text-slate-400">Licencia de SST vigente / Firma Digitalizada</p>
                    </div>
                    <div>
                      <div className="border-b border-slate-400 w-3/4 mx-auto h-12" />
                      <p className="mt-2 font-bold text-slate-800">Director del COE / Representante Legal</p>
                      <p className="text-slate-400">Firma de Recibido y Validación Presupuestal</p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="bg-slate-950 border-t border-slate-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between shrink-0 gap-3">
                <p className="text-slate-400 text-xs text-left">
                  Este informe se genera dinámicamente según lo estipulado en la metodología del SG-SST de la República de Colombia.
                </p>
                <button 
                  onClick={() => setShowInteractiveReport(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-5 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Regresar a la Evaluación
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
