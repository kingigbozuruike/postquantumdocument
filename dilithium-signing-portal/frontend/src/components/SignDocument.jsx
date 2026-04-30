import { useState, useRef } from 'react'
import { signDocument } from '../api'
import SignatureBytePreview from './SignatureBytePreview'
import PerformanceMetrics from './PerformanceMetrics'

export default function SignDocument({ privateKey, onSignatureGenerated }) {
  const [document, setDocument] = useState('')
  const [signature, setSignature] = useState(null)
  const [performance, setPerformance] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      setDocument(event.target.result)
      setError(null)
      setSignature(null)
    }
    reader.onerror = () => {
      setError('Failed to read file')
    }
    reader.readAsText(file)
  }

  const handleSign = async () => {
    setError(null)
    setSignature(null)

    if (!document.trim()) {
      setError('Please enter or upload a document to sign')
      return
    }

    if (!privateKey) {
      setError('Private key not available. Please generate keys first.')
      return
    }

    setLoading(true)

    try {
      const result = await signDocument(privateKey, document)

      if (result.error) {
        setError(result.error)
      } else {
        const timestamp = new Date().toISOString()
        setSignature({
          value: result.signature,
          document: result.document,
          timestamp,
          algorithm: 'ML-DSA-65 (Dilithium)',
          byteLength: Math.ceil(result.signature.length / 2),
        })
        setPerformance(result.performance)
        onSignatureGenerated(result.signature, result.document)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copySignature = () => {
    navigator.clipboard.writeText(signature.value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="space-y-8">
      {/* Empty State */}
      {!privateKey && (
        <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 font-semibold text-center">
            📌 Generate your key pair in <strong>Step 1</strong> first to enable signing.
          </p>
        </div>
      )}

      {/* Document Input Section */}
      <div className="space-y-4">
        <label className="block text-lg font-semibold text-[#1A3C5E]">Document to Sign</label>

        {/* Textarea */}
        <textarea
          value={document}
          onChange={(e) => {
            setDocument(e.target.value)
            setPerformance(null)
            setSignature(null)
          }}
          placeholder="Type or paste your document here..."
          rows={8}
          className="w-full p-4 border border-slate-300 rounded-lg font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A3C5E] focus:border-transparent"
        />

        {/* File Upload Button */}
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition-colors"
          >
            📄 Upload File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            accept=".txt,.doc,.docx,.pdf"
            className="hidden"
          />
          <span className="text-sm text-slate-500 self-center">
            Supported: .txt, .doc, .docx, .pdf, or any text file
          </span>
        </div>
      </div>

      {/* Private Key Input Section */}
      <div className="space-y-2">
        <label className="block text-lg font-semibold text-[#1A3C5E]">Private Key</label>
        <textarea
          value={privateKey || ''}
          readOnly
          rows={4}
          className="w-full p-4 border border-slate-300 rounded-lg font-mono text-sm bg-slate-50 text-slate-700"
          placeholder="Your private key will appear here after generation"
        />
        {!privateKey && (
          <p className="text-sm text-orange-600 font-semibold">
            ⚠️ Generate a key pair first to enable signing
          </p>
        )}
      </div>

      {/* Sign Button */}
      <div className="flex justify-center">
        <button
          onClick={handleSign}
          disabled={loading || !privateKey || !document.trim()}
          className="px-8 py-4 bg-[#1A3C5E] text-white font-bold rounded-lg hover:bg-blue-900 disabled:bg-gray-400 transition-colors text-lg"
        >
          {loading ? 'Signing Document...' : 'Sign Document'}
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-semibold">❌ Error: {error}</p>
        </div>
      )}

      {/* Success Banner */}
      {signature && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 font-semibold">✓ Document Signed Successfully</p>
        </div>
      )}
Performance Metrics */}
      {performance && (
        <PerformanceMetrics performance={performance} operationType="signing" />
      )}

      {/* 
      {/* Signature Display */}
      {signature && (
        <>
          {/* Signature */}
          <div className="space-y-2">
            <label className="block text-lg font-semibold text-[#1A3C5E]">Digital Signature</label>
            <div className="relative">
              <textarea
                value={signature.value}
                readOnly
                rows={6}
                className="w-full p-4 font-mono text-sm bg-slate-50 border border-slate-300 rounded-lg overflow-auto text-slate-700"
              />
              <button
                onClick={copySignature}
                className="absolute top-2 right-2 px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 text-sm font-semibold rounded transition-colors"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Signature Details Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 space-y-3">
            <h3 className="text-lg font-semibold text-slate-900">Signature Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-slate-600 font-semibold">Algorithm</p>
                <p className="text-slate-900 font-mono">{signature.algorithm}</p>
              </div>
              <div>
                <p className="text-slate-600 font-semibold">Signature Size</p>
                <p className="text-slate-900 font-mono">{signature.byteLength} bytes</p>
              </div>
              <div>
                <p className="text-slate-600 font-semibold">Timestamp</p>
                <p className="text-slate-900 font-mono text-xs">{signature.timestamp}</p>
              </div>
            </div>
          </div>

          {/* Signature Byte Preview */}
          <SignatureBytePreview signature={signature.value} />

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              ✓ This signature proves that the document above was signed with your private key. Share the signature and original document with others so they can verify using your public key.
            </p>
          </div>
        </>
      )}

      {/* Empty State */}
      {!signature && !loading && (
        <div className="text-center p-8 bg-slate-50 rounded-lg">
          <p className="text-slate-600">Enter a document and click "Sign Document" to create a signature</p>
        </div>
      )}
    </div>
  )
}
