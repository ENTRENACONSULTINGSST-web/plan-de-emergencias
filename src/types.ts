/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UrgencyLevel = 'POSIBLE' | 'PROBABLE' | 'INMINENTE';
export type VulnerabilityLevel = 'BAJA' | 'MEDIA' | 'ALTA';
export type RiskLevel = 'BAJO' | 'MEDIO' | 'ALTO';

export interface Threat {
  id: string;
  name: string;
  type: 'Natural' | 'Tecnologico' | 'Social';
  level: UrgencyLevel;
  description: string;
}

export interface Question {
  id: string;
  text: string;
  recommendation: string;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  questions: Question[];
}

export interface ComponentBlock {
  id: 'Personas' | 'Recursos' | 'Sistemas';
  name: string;
  items: Item[];
}

export interface TransversalBlock {
  id: 'PESV' | 'Psicosocial' | 'Alturas' | 'Litio' | 'Quimicos';
  name: string;
  lawReference: string;
  description: string;
  questions: Question[];
}

export interface FormAnswers {
  // Keyed by Question ID
  [questionId: string]: number; // 0.0, 0.5, or 1.0
}

export interface ComponentResults {
  id: string;
  name: string;
  itemAverages: { [itemId: string]: number };
  average: number;
  level: VulnerabilityLevel;
  color: 'green' | 'yellow' | 'red';
  colorHex: string;
}

export interface TransversalResults {
  id: string;
  name: string;
  lawReference: string;
  average: number;
  level: VulnerabilityLevel;
  color: 'green' | 'yellow' | 'red';
  colorHex: string;
}

export interface GeneralReport {
  timestamp: string;
  threat: Threat;
  v_personas: ComponentResults;
  v_recursos: ComponentResults;
  v_sistemas: ComponentResults;
  transversalResults: { [blockId: string]: TransversalResults };
  vulnerabilidadConsolidada: VulnerabilityLevel;
  redRombosCount: number;
  riesgoGlobal: RiskLevel;
  riesgoColor: 'green' | 'yellow' | 'red';
}

// Flowchart Node and Edge structures for PONS (Plan Operativo Normalizado)
export interface FlowNode {
  id: string;
  label: string;
  role: string | null;
  type: 'start' | 'action' | 'decision' | 'caution' | 'end';
}

export interface FlowEdge {
  from: string;
  to: string;
  condition?: string;
}

export interface PONFlow {
  id: string;
  title: string;
  threatType: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}
