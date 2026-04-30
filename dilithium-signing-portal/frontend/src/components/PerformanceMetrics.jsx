import { useState } from 'react'

export default function PerformanceMetrics({ performance, operationType = 'signing' }) {
  if (!performance) return null

  const [isExpanded, setIsExpanded] = useState(true)

  const timeKey = operationType === 'signing' ? 'signing_time_ms' : 'verification_time_ms'
  const operationTime = performance[timeKey]

  // Determine performance tier
  const getPerformanceTier = () => {
    if (operationTime < 1) return { label: '⚡ Lightning', color: 'bg-green-50 border-green-300' }
    if (operationTime < 5) return { label: '🚀 Excellent', color: 'bg-green-50 border-green-300' }
    if (operationTime < 20) return { label: '✅ Good', color: 'bg-blue-50 border-blue-300' }
    if (operationTime < 100) return { label: '⏱️ Acceptable', color: 'bg-yellow-50 border-yellow-300' }
    return { label: '⚠️ Slow', color: 'bg-orange-50 border-orange-300' }
  }

  const tier = getPerformanceTier()

  return (
    <div className={`border-l-4 border-[#1A3C5E] bg-slate-50 rounded-lg overflow-hidden`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">📊</span>
          <div className="text-left">
            <h3 className="font-bold text-[#1A3C5E]">Performance Metrics</h3>
            <p className="text-sm text-slate-600">
              {operationType === 'signing' ? 'Signing' : 'Verification'} completed successfully
            </p>
          </div>
        </div>
        <span className="text-2xl">{isExpanded ? '▼' : '▶'}</span>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 border-t border-slate-200 space-y-4">
          {/* Performance Tier */}
          <div className={`${tier.color} border rounded-lg p-3`}>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Performance Rating</span>
              <span className="text-lg font-bold">{tier.label}</span>
            </div>
          </div>

          {/* Main Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {/* Signing/Verification Time */}
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <div className="text-xs text-slate-600 font-semibold uppercase">
                {operationType === 'signing' ? 'Signing' : 'Verification'} Time
              </div>
              <div className="text-2xl font-bold text-[#1A3C5E] mt-1">
                {operationTime.toFixed(2)}
                <span className="text-sm ml-1">ms</span>
              </div>
            </div>

            {/* Document Size */}
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <div className="text-xs text-slate-600 font-semibold uppercase">Document Size</div>
              <div className="text-2xl font-bold text-[#1A3C5E] mt-1">
                {performance.document_size_bytes < 1024
                  ? performance.document_size_bytes
                  : performance.document_size_kb}
                <span className="text-sm ml-1">
                  {performance.document_size_bytes < 1024 ? 'B' : 'KB'}
                </span>
              </div>
            </div>

            {/* Signature Size */}
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <div className="text-xs text-slate-600 font-semibold uppercase">Signature Size</div>
              <div className="text-2xl font-bold text-[#1A3C5E] mt-1">
                {performance.signature_size_kb.toFixed(1)}
                <span className="text-sm ml-1">KB</span>
              </div>
            </div>

            {/* Throughput */}
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <div className="text-xs text-slate-600 font-semibold uppercase">Throughput</div>
              <div className="text-2xl font-bold text-[#1A3C5E] mt-1">
                {performance.throughput_mbps > 0 ? performance.throughput_mbps.toFixed(1) : '∞'}
                <span className="text-sm ml-1">MB/s</span>
              </div>
            </div>
          </div>

          {/* Detailed Information */}
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <h4 className="font-semibold text-slate-700 mb-3">Detailed Breakdown</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600">Document Size</span>
                <span className="font-mono font-semibold">
                  {performance.document_size_bytes.toLocaleString()} bytes
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600">Signature Size</span>
                <span className="font-mono font-semibold">
                  {performance.signature_size_bytes.toLocaleString()} bytes ({performance.signature_size_kb} KB)
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600">
                  {operationType === 'signing' ? 'Signing' : 'Verification'} Duration
                </span>
                <span className="font-mono font-semibold">{operationTime.toFixed(3)} ms</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-600">Signature Overhead</span>
                <span className="font-mono font-semibold">
                  {(
                    (performance.signature_size_bytes / performance.document_size_bytes) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-semibold text-blue-900 mb-2">💡 Performance Insight</h4>
            <PerformanceInsight
              operationTime={operationTime}
              documentSize={performance.document_size_bytes}
              operationType={operationType}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function PerformanceInsight({ operationTime, documentSize, operationType }) {
  const insights = []

  if (operationTime < 1) {
    insights.push('Ultra-fast performance! This is near-instant.')
  } else if (operationTime < 10) {
    insights.push('Excellent performance for quantum-safe cryptography!')
  } else if (operationTime < 100) {
    insights.push('Good performance. Acceptable for most applications.')
  }

  if (documentSize < 10000) {
    insights.push(
      'Document is relatively small. Signature overhead is significant but acceptable for small files.'
    )
  } else if (documentSize < 1000000) {
    insights.push('Medium-sized document. Signature size is minimal relative to document size.')
  } else {
    insights.push('Large document. Signature adds negligible overhead.')
  }

  if (operationType === 'signing') {
    insights.push(
      'ML-DSA-65 (Dilithium) provides quantum-safe security without sacrificing performance.'
    )
  }

  return (
    <ul className="space-y-1 text-sm text-blue-800">
      {insights.map((insight, idx) => (
        <li key={idx} className="flex gap-2">
          <span>•</span>
          <span>{insight}</span>
        </li>
      ))}
    </ul>
  )
}
