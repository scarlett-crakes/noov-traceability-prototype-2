export const dummyLineage: Record<string, { nodes: LineageNode[]; edges: LineageEdge[] }> = {
  'TU-2026-0142': {
    nodes: [
      { id: 'poo-1', type: 'origin', label: 'Burger Joint', sublabel: 'Point of Origin · business', x: 200, y: 0 },
      { id: 'TU-2026-0142', type: 'tu_current', label: 'TU-2026-0142', sublabel: '48.2 kg · Active', x: 200, y: 130 },
    ],
    edges: [
      { id: 'e1', source: 'poo-1', target: 'TU-2026-0142', label: 'collected 2026-06-20' },
    ],
  },
  'TU-2026-0140': {
    nodes: [
      { id: 'poo-2', type: 'origin', label: 'Maria Garcia', sublabel: 'Point of Origin · individual', x: 200, y: 0 },
      { id: 'TU-2026-0140-src', type: 'tu', label: 'TU-2026-0140', sublabel: '25.0 kg · Active (remainder)', x: 200, y: 130 },
      { id: 'TU-2026-0140-S1', type: 'tu', label: 'TU-2026-0140-S1', sublabel: '12.5 kg · Active', x: 400, y: 280 },
    ],
    edges: [
      { id: 'e1', source: 'poo-2', target: 'TU-2026-0140-src', label: 'collected 2026-06-18' },
      { id: 'e2', source: 'TU-2026-0140-src', target: 'TU-2026-0140-S1', label: 'split 2026-06-19 · 12.5 kg' },
    ],
  },
  'TU-2026-0140-S1': {
    nodes: [
      { id: 'poo-2', type: 'origin', label: 'Maria Garcia', sublabel: 'Point of Origin · individual', x: 200, y: 0 },
      { id: 'TU-2026-0140-src', type: 'tu', label: 'TU-2026-0140', sublabel: '25.0 kg · Active (parent)', x: 200, y: 130 },
      { id: 'TU-2026-0140-S1', type: 'tu_current', label: 'TU-2026-0140-S1', sublabel: '12.5 kg · Active', x: 400, y: 280 },
    ],
    edges: [
      { id: 'e1', source: 'poo-2', target: 'TU-2026-0140-src', label: 'collected 2026-06-18' },
      { id: 'e2', source: 'TU-2026-0140-src', target: 'TU-2026-0140-S1', label: 'split 2026-06-19 · 12.5 kg' },
    ],
  },
  'TU-2026-0141': {
    nodes: [
      { id: 'poo-3', type: 'origin', label: 'Pizza Palace Restaurant', sublabel: 'Point of Origin · business', x: 200, y: 0 },
      { id: 'TU-2026-0141', type: 'tu_current', label: 'TU-2026-0141', sublabel: '31.0 kg · In Transit', x: 200, y: 130 },
      { id: 'uco-lab', type: 'actor', label: 'UCO Analytics Lab', sublabel: 'Custody transferred 2026-06-20', x: 200, y: 280 },
    ],
    edges: [
      { id: 'e1', source: 'poo-3', target: 'TU-2026-0141', label: 'collected 2026-06-19' },
      { id: 'e2', source: 'TU-2026-0141', target: 'uco-lab', label: 'transferred 2026-06-20', animated: true },
    ],
  },
}

export interface LineageNode {
  id: string
  type: 'origin' | 'tu' | 'tu_current' | 'actor'
  label: string
  sublabel: string
  x: number
  y: number
}

export interface LineageEdge {
  id: string
  source: string
  target: string
  label: string
  animated?: boolean
}
