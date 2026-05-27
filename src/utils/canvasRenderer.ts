import { VulnerabilityLevel, UrgencyLevel } from '../types';

export function getThreatColorHex(lvl: UrgencyLevel): string {
  if (lvl === 'POSIBLE') return '#10B981'; // Emerald
  if (lvl === 'PROBABLE') return '#F59E0B'; // Amber
  return '#EF4444'; // Rose/Red
}

export function getVulColorHex(lvl: VulnerabilityLevel): string {
  if (lvl === 'BAJA') return '#10B981'; // Emerald
  if (lvl === 'MEDIA') return '#F59E0B'; // Amber
  return '#EF4444'; // Rose/Red
}

interface RenderParams {
  threatLevel: UrgencyLevel;
  threatName: string;
  personasAvg: number;
  personasLvl: VulnerabilityLevel;
  recursosAvg: number;
  recursosLvl: VulnerabilityLevel;
  sistemasAvg: number;
  sistemasLvl: VulnerabilityLevel;
  redRombosCount: number;
}

export function generateDiamondImgBase64(params: RenderParams): string {
  const canvas = document.createElement('canvas');
  // 600x660 double resolution for high quality docx image inserts
  canvas.width = 600;
  canvas.height = 660;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Scale context to draw with 300x330 coordinates
  ctx.scale(2, 2);

  // Background
  ctx.fillStyle = '#1e293b'; // Slate-800 look for a sleek, cohesive corporate style
  ctx.fillRect(0, 0, 300, 330);

  // Helper function to draw filled & border polygons
  const drawRombo = (points: { x: number; y: number }[], fillColor: string) => {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.stroke();
  };

  // Draw Dotted Guides
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(150, 0);
  ctx.lineTo(150, 330);
  ctx.moveTo(0, 165);
  ctx.lineTo(300, 165);
  ctx.stroke();
  ctx.setLineDash([]); // reset

  // Colors
  const tColor = getThreatColorHex(params.threatLevel);
  const pColor = getVulColorHex(params.personasLvl);
  const rColor = getVulColorHex(params.recursosLvl);
  const sColor = getVulColorHex(params.sistemasLvl);

  // 1. TOP Rombo: Threat
  drawRombo([
    { x: 150, y: 15 },
    { x: 225, y: 90 },
    { x: 150, y: 165 },
    { x: 75, y: 90 }
  ], tColor);

  // 2. LEFT Rombo: Personas
  drawRombo([
    { x: 75, y: 90 },
    { x: 150, y: 165 },
    { x: 75, y: 240 },
    { x: 0, y: 165 }
  ], pColor);

  // 3. RIGHT Rombo: Recursos
  drawRombo([
    { x: 225, y: 90 },
    { x: 300, y: 165 },
    { x: 225, y: 240 },
    { x: 150, y: 165 }
  ], rColor);

  // 4. BOTTOM Rombo: Sistemas Y Procesos
  drawRombo([
    { x: 150, y: 165 },
    { x: 225, y: 240 },
    { x: 150, y: 315 },
    { x: 75, y: 240 }
  ], sColor);

  // DRAW METADATA TEXTS ON TOP
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // AMENAZA texts
  ctx.fillText('AMENAZA', 150, 65);
  ctx.font = 'bold 8px monospace';
  ctx.fillText(params.threatLevel, 150, 80);

  // PERSONAS texts
  ctx.font = 'bold 9px monospace';
  ctx.fillText('PERSONAS', 75, 140);
  ctx.font = 'bold 8px monospace';
  ctx.fillText(`V: ${params.personasAvg.toFixed(2)}`, 75, 155);

  // RECURSOS texts
  ctx.font = 'bold 9px monospace';
  ctx.fillText('RECURSOS', 225, 140);
  ctx.font = 'bold 8px monospace';
  ctx.fillText(`V: ${params.recursosAvg.toFixed(2)}`, 225, 155);

  // SISTEMAS texts
  ctx.font = 'bold 9px monospace';
  ctx.fillText('SISTEMAS', 150, 215);
  ctx.font = 'bold 8px monospace';
  ctx.fillText(`V: ${params.sistemasAvg.toFixed(2)}`, 150, 230);

  // Center Hub Indicator Box
  ctx.beginPath();
  ctx.arc(150, 165, 15, 0, 2 * Math.PI);
  ctx.fillStyle = '#0f172a';
  ctx.fill();
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Core indicator numbering
  ctx.fillStyle = '#38bdf8'; // Sky blue text for maximum high-contrast contrast
  ctx.font = 'bold 8px monospace';
  ctx.fillText(`V=${params.redRombosCount}R`, 150, 165);

  return canvas.toDataURL('image/png');
}
