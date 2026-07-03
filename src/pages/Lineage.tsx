import { useParams, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { dummyLineage } from '@/data/lineage'
import { ReactFlow, Background, Controls, type Node, type Edge } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

const nodeColors: Record<string, { bg: string; border: string; text: string; sub: string }> = {
  origin:     { bg: '#E1F5EE', border: '#1D9E75', text: '#085041', sub: '#0F6E56' },
  tu:         { bg: '#EFF6FF', border: '#93C5FD', text: '#1E3A5F', sub: '#3B82F6' },
  tu_current: { bg: '#D1FAE5', border: '#059669', text: '#064E3B', sub: '#065F46' },
  actor:      { bg: '#FEF3C7', border: '#F59E0B', text: '#78350F', sub: '#92400E' },
}

function buildNodes(rawNodes: typeof dummyLineage[string]['nodes']): Node[] {
  return rawNodes.map((n) => ({
    id: n.id,
    position: { x: n.x, y: n.y },
    data: {
      label: (
        <div style={{ textAlign: 'center', padding: '4px 8px' }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: nodeColors[n.type].text }}>{n.label}</div>
          <div style={{ fontSize: 10, color: nodeColors[n.type].sub, marginTop: 2 }}>{n.sublabel}</div>
        </div>
      ),
    },
    style: {
      background: nodeColors[n.type].bg,
      border: `1.5px solid ${nodeColors[n.type].border}`,
      borderRadius: 8,
      minWidth: 140,
    },
  }))
}

function buildEdges(rawEdges: typeof dummyLineage[string]['edges']): Edge[] {
  return rawEdges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    labelStyle: { fontSize: 10, fill: '#6B7280' },
    style: { stroke: '#D1D5DB', strokeWidth: 1.5 },
    animated: e.label === 'transferred',
  }))
}

export function Lineage() {
  const { id } = useParams({ from: '/app/trace-units/$id/lineage' })
  const lineage = dummyLineage[id]

  return (
    <div>
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <h1 className="text-base font-medium text-gray-900 font-mono">{id} — Lineage</h1>
        <Link to="/trace-units/$id" params={{ id }} className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors">
          <ArrowLeft size={16} />
          Back
        </Link>
      </div>

      {!lineage ? (
        <div className="p-6">
          <div className="bg-white rounded-lg border border-gray-200 p-5 text-center">
            <p className="text-sm text-gray-500">No lineage data for this trace unit yet.</p>
          </div>
        </div>
      ) : (
        <div className="p-6">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden" style={{ height: 480 }}>
            <ReactFlow
              nodes={buildNodes(lineage.nodes)}
              edges={buildEdges(lineage.edges)}
              fitView
              fitViewOptions={{ padding: 0.3 }}
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
            >
              <Background gap={20} color="#F3F4F6" />
              <Controls showInteractive={false} />
            </ReactFlow>
          </div>

          <div className="flex gap-4 mt-4">
            {[
              { type: 'origin', label: 'Point of Origin' },
              { type: 'tu', label: 'Trace Unit' },
              { type: 'tu_current', label: 'Current TU' },
              { type: 'actor', label: 'Actor / Custodian' },
            ].map(({ type, label }) => (
              <div key={type} className="flex items-center gap-1.5 text-xs text-gray-500">
                <div
                  className="w-3 h-3 rounded"
                  style={{ background: nodeColors[type].bg, border: `1.5px solid ${nodeColors[type].border}` }}
                />
                {label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
