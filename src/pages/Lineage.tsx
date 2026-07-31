import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useParams, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { ReactFlow, Background, Controls, type Node, type Edge } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { Id } from '../../convex/_generated/dataModel'

const nodeColors: Record<string, { bg: string; border: string; text: string; sub: string }> = {
  origin:     { bg: '#E1F5EE', border: '#1D9E75', text: '#085041', sub: '#0F6E56' },
  tu:         { bg: '#EFF6FF', border: '#93C5FD', text: '#1E3A5F', sub: '#3B82F6' },
  tu_current: { bg: '#D1FAE5', border: '#059669', text: '#064E3B', sub: '#065F46' },
  tu_consumed:{ bg: '#F3F4F6', border: '#9CA3AF', text: '#6B7280', sub: '#9CA3AF' },
}

export function Lineage() {
  const { id } = useParams({ from: '/app/trace-units/$id/lineage' })
  const lineage = useQuery(api.traceUnits.getLineage, { id: id as Id<'traceUnits'> })

  if (lineage === undefined) {
    return <div className="p-6 text-sm text-gray-400">Loading…</div>
  }

  if (!lineage) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg border border-gray-200 p-5 text-center">
          <p className="text-sm text-gray-500">Trace unit not found.</p>
        </div>
      </div>
    )
  }

  const { tu, parents, splitChildren } = lineage

  // Build nodes from real data
  const nodes: Node[] = []
  const edges: Edge[] = []

  // Layout: parents top, current TU middle, children bottom
  const centerX = 300

  // Origin node
  nodes.push({
    id: 'origin',
    position: { x: centerX, y: 0 },
    data: {
      label: (
        <div style={{ textAlign: 'center', padding: '4px 8px' }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: nodeColors.origin.text }}>{tu.origin_snapshot.name}</div>
          <div style={{ fontSize: 10, color: nodeColors.origin.sub, marginTop: 2 }}>Point of Origin · {tu.origin_snapshot.type}</div>
        </div>
      ),
    },
    style: { background: nodeColors.origin.bg, border: `1.5px solid ${nodeColors.origin.border}`, borderRadius: 8, minWidth: 160 },
  })

  // Parent TU nodes
  parents.forEach((p, i) => {
    const nodeId = `parent-${p._id}`
    nodes.push({
      id: nodeId,
      position: { x: centerX, y: 100 + i * 100 },
      data: {
        label: (
          <div style={{ textAlign: 'center', padding: '4px 8px' }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: nodeColors.tu_consumed.text }}>{p.tu_code}</div>
            <div style={{ fontSize: 10, color: nodeColors.tu_consumed.sub, marginTop: 2 }}>{p.mass_kg} kg · {p.status}</div>
            {p.asset_name && <div style={{ fontSize: 10, color: nodeColors.tu_consumed.sub, marginTop: 1 }}>📦 {p.asset_name}</div>}
          </div>
        ),
      },
      style: { background: nodeColors.tu_consumed.bg, border: `1.5px solid ${nodeColors.tu_consumed.border}`, borderRadius: 8, minWidth: 140 },
    })
    const prevId = i === 0 ? 'origin' : `parent-${parents[i - 1]._id}`
    edges.push({ id: `e-${prevId}-${nodeId}`, source: prevId, target: nodeId, label: 'split', labelStyle: { fontSize: 10, fill: '#6B7280' }, style: { stroke: '#D1D5DB', strokeWidth: 1.5 } })
  })

  // Current TU node
  const currentY = 100 + parents.length * 100
  const prevNodeId = parents.length > 0 ? `parent-${parents[parents.length - 1]._id}` : 'origin'
  const currentColors = tu.status === 'consumed' ? nodeColors.tu_consumed : nodeColors.tu_current
  nodes.push({
    id: 'current',
    position: { x: centerX, y: currentY },
    data: {
      label: (
        <div style={{ textAlign: 'center', padding: '4px 8px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: currentColors.text }}>{tu.tu_code}</div>
          <div style={{ fontSize: 10, color: currentColors.sub, marginTop: 2 }}>{tu.mass_kg} kg · {tu.status}</div>
          {(tu as any).asset_name && <div style={{ fontSize: 10, color: currentColors.sub, marginTop: 1 }}>📦 {(tu as any).asset_name}</div>}
        </div>
      ),
    },
    style: { background: currentColors.bg, border: `1.5px solid ${currentColors.border}`, borderRadius: 8, minWidth: 140 },
  })
  edges.push({ id: `e-${prevNodeId}-current`, source: prevNodeId, target: 'current', label: parents.length > 0 ? 'split' : 'collected', labelStyle: { fontSize: 10, fill: '#6B7280' }, style: { stroke: '#D1D5DB', strokeWidth: 1.5 } })

  // Child TU nodes — only show if current TU is not consumed (consumed TU lineage stops here)
  const visibleChildren = tu.status === 'consumed' ? [] : splitChildren
  visibleChildren.forEach((child, i) => {
    const nodeId = `child-${child._id}`
    const xOffset = (i - (splitChildren.length - 1) / 2) * 200
    nodes.push({
      id: nodeId,
      position: { x: centerX + xOffset, y: currentY + 100 },
      data: {
        label: (
          <div style={{ textAlign: 'center', padding: '4px 8px' }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: nodeColors.tu.text }}>{child.tu_code}</div>
            <div style={{ fontSize: 10, color: nodeColors.tu.sub, marginTop: 2 }}>{child.mass_kg} kg · {child.status}</div>
            {(child as any).asset_name && <div style={{ fontSize: 10, color: nodeColors.tu.sub, marginTop: 1 }}>📦 {(child as any).asset_name}</div>}
          </div>
        ),
      },
      style: { background: nodeColors.tu.bg, border: `1.5px solid ${nodeColors.tu.border}`, borderRadius: 8, minWidth: 140 },
    })
    edges.push({ id: `e-current-${nodeId}`, source: 'current', target: nodeId, label: 'split', labelStyle: { fontSize: 10, fill: '#6B7280' }, style: { stroke: '#D1D5DB', strokeWidth: 1.5 }, animated: true })
  })

  const hasLineage = parents.length > 0 || visibleChildren.length > 0

  return (
    <div>
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <h1 className="text-base font-medium text-gray-900 font-mono">{tu.tu_code} — Lineage</h1>
        <Link to="/trace-units/$id" params={{ id }} className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors">
          <ArrowLeft size={16} />
          Back
        </Link>
      </div>

      <div className="p-6">
        {!hasLineage && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-md px-4 py-2 text-xs text-amber-700">
            This TU has no parent or child TUs yet — showing origin connection only.
          </div>
        )}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden" style={{ height: 480 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
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
            { type: 'tu_current', label: 'This TU' },
            { type: 'tu', label: 'Child TU' },
            { type: 'tu_consumed', label: 'Consumed (parent)' },
          ].map(({ type, label }) => (
            <div key={type} className="flex items-center gap-1.5 text-xs text-gray-500">
              <div className="w-3 h-3 rounded" style={{ background: nodeColors[type].bg, border: `1.5px solid ${nodeColors[type].border}` }} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
