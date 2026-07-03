export const dummyLineage: Record<string, { nodes: LineageNode[]; edges: LineageEdge[] }> = {
  'TU-2026-0142': {
    nodes: [
      { id: 'poo-1', type: 'origin', label: 'Burger Joint', sublabel: 'Point of Origin', x: 250, y: 0 },
      { id: 'TU-2026-0142', type: 'tu', label: 'TU-2026-0142', sublabel: '48.2 kg · Active', x: 250, y: 120 },
    ],
    edges: [
      { id: 'e1', source: 'poo-1', target: 'TU-2026-0142', label: 'collected' },
    ],
  },
  'TU-2026-0140': {
    nodes: [
      { id: 'poo-2', type: 'origin', label: 'Maria Garcia', sublabel: 'Point of Origin', x: 250, y: 0 },
      { id: 'TU-2026-0140-src', type: 'tu', label: 'TU-2026-0140', sublabel: '25.0 kg · Consumed', x: 250, y: 120 },
      { id: 'TU-2026-0140a', type: 'tu', label: 'TU-0140a', sublabel: '12.5 kg · Active', x: 100, y: 260 },
      { id: 'TU-2026-0140', type: 'tu_current', label: 'TU-0140b', sublabel: '12.5 kg · Active', x: 400, y: 260 },
    ],
    edges: [
      { id: 'e1', source: 'poo-2', target: 'TU-2026-0140-src', label: 'collected' },
      { id: 'e2', source: 'TU-2026-0140-src', target: 'TU-2026-0140a', label: 'split' },
      { id: 'e3', source: 'TU-2026-0140-src', target: 'TU-2026-0140', label: 'split' },
    ],
  },
  'TU-2026-0141': {
    nodes: [
      { id: 'poo-3', type: 'origin', label: 'Pizza Palace', sublabel: 'Point of Origin', x: 250, y: 0 },
      { id: 'TU-2026-0141', type: 'tu_current', label: 'TU-2026-0141', sublabel: '31.0 kg · In Transit', x: 250, y: 120 },
      { id: 'uco-lab', type: 'actor', label: 'UCO Analytics Lab', sublabel: 'Custody transfer', x: 250, y: 260 },
    ],
    edges: [
      { id: 'e1', source: 'poo-3', target: 'TU-2026-0141', label: 'collected' },
      { id: 'e2', source: 'TU-2026-0141', target: 'uco-lab', label: 'transferred' },
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
}
