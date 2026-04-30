import { useState, useRef } from 'react'
import { verifyDocument } from '../api'
import PerformanceMetrics from './PerformanceMetrics'

export default function VerifyDocument({ publicKey, signature, signedDocument, onVerificationRun }) {
  const [document, setDocument] = useState(signedDocument || '')
  const [sig, setSig] = useState(signature || '')
  const [pubKey, setPubKey] = useState(publicKey || '')
  const [result, setResult] = useState(null)
  const [performance, setPerformance] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)
  const tamperFileInputRef = useRef(null)

  // Tamper simulator state
  const [tamperedDocument, setTamperedDocument] = useState(document)
  const [tamperedResult, setTamperedResult] = useState(null)
  const [tamperedPerformance, setTamperedPerformance] = useState(null)

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      setDocument(event.target.result)
      setTamperedDocument(event.target.result)
      setError(null)
      setResult(null)
      setTamperedResult(null)
    }
    reader.onerror = () => {
      setError('Failed to read file')
    }
    reader.readAsText(file)
  }

  const handleTamperFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      setTamperedDocument(event.target.result)
      setTamperedResult(null)
    }
    reader.onerror = () => {
      setError('Failed to read file')
    }
    reader.readAsText(file)
  }

  const handleVerify = async () => {
    setError(null)
    setResult(null)
    setPerformance(null)

    if (!document.trim()) {
      setError('Please enter a document to verify')
      return
    }

    if (!sig.trim()) {
      setError('Please enter a signature to verify')
      return
    }

    if (!pubKey.trim()) {
      setError('Please enter a public key to verify against')
      return
    }

    setLoading(true)

    try {
      const res = await verifyDocument(pubKey, document, sig)
      onVerificationRun?.()

      if (res.error) {
        setError(res.error)
      } else {
        setResult({
          valid: res.valid,
          message: res.message,
        })
        setPerformance(res.performance)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyTampered = async () => {
    setTamperedPerformance(null)

    if (!tamperedDocument.trim()) {
      setError('Please enter a document to verify')
      return
    }

    if (!sig.trim()) {
      setError('Please enter a signature to verify')
      return
    }

    if (!pubKey.trim()) {
      setError('Please enter a public key to verify against')
      return
    }

    setLoading(true)

    try {
      const res = await verifyDocument(pubKey, tamperedDocument, sig)
      onVerificationRun?.()

      if (res.error) {
        setError(res.error)
      } else {
        setTamperedResult({
          valid: res.valid,
          message: res.message,
        })
        setTamperedPerformance(res.performance)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Empty State */}
      {(!publicKey || !signature) && (
        <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 font-semibold text-center">
            📌 Complete <strong>Step 1 (Generate Keys)</strong> and <strong>Step 2 (Sign Document)</strong> first to enable verification.
          </p>
        </div>
      )}

      {/* Input Section */}
      <div className="space-y-6">
        {/* Document */}
        <div className="space-y-2">
          <label className="block text-lg font-semibold text-[#1A3C5E]">Document</label>
          <textarea
            value={document}
            onChange={(e) => setDocument(e.target.value)}
            rows={6}
            className="w-full p-4 border border-slate-300 rounded-lg font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A3C5E] focus:border-transparent"
            placeholder="Paste the document that was signed..."
          />
          {/* File Upload Button */}
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition-colors"
            >
              📄 Upload Document
            </button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              accept=".txt,.doc,.docx,.pdf"
              className="hidden"
            />
            <span className="text-sm text-slate-500 self-center">
              Or paste the document text above
            </span>
          </div>
        </div>

        {/* Signature */}
        <div className="space-y-2">
          <label className="block text-lg font-semibold text-[#1A3C5E]">Signature</label>
          <textarea
            value={sig}
            onChange={(e) => setSig(e.target.value)}
            rows={6}
            className="w-full p-4 border border-slate-300 rounded-lg font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A3C5E] focus:border-transparent"
            placeholder="Paste the signature to verify..."
          />
        </div>

        {/* Public Key */}
        <div className="space-y-2">
          <label className="block text-lg font-semibold text-[#1A3C5E]">Public Key</label>
          <textarea
            value={pubKey}
            onChange={(e) => setPubKey(e.target.value)}
            rows={4}
            className="w-full p-4 border border-slate-300 rounded-lg font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A3C5E] focus:border-transparent"
            placeholder="Paste the signer's public key..."
          />
        </div>
      </div>

      {/* Verify Button */}
      <div className="flex justify-center">
        <button
          onClick={handleVerify}
          disabled={loading || !document.trim() || !sig.trim() || !pubKey.trim()}
          className="px-8 py-4 bg-[#1A3C5E] text-white font-bold rounded-lg hover:bg-blue-900 disabled:bg-gray-400 transition-colors text-lg"
        >
          {loading ? 'Verifying Signature...' : 'Verify Signature'}
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-semibold">❌ Error: {error}</p>
        </div>
      )}

      {/* Result Panel */}
      {result && (
        <div
          className={`p-6 rounded-lg border-2 ${
            result.valid
              ? 'bg-green-50 border-green-300'
              : 'bg-red-50 border-red-300'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="text-4xl flex-shrink-0">
              {result.valid ? '✓' : '✗'}
            </div>
            <div>
              <h3 className={`text-2xl font-bold ${
                result.valid ? 'text-green-700' : 'text-red-700'
              }`}>
                {result.valid ? 'Signature Valid' : 'Signature Invalid'}
              </h3>
              <p className={`mt-2 text-lg ${
                result.valid ? 'text-green-600' : 'text-red-600'
              }`}>
                {result.valid
                  ? 'This document is authentic and has not been tampered with.'
                  : 'This document has been modified or the signature does not match.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Performance Metrics for Main Verification */}
      {performance && (
        <PerformanceMetrics performance={performance} operationType="verification" />
      )}

      {/* Tamper Simulator Section */}
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 space-y-4">
        <h3 className="text-xl font-bold text-yellow-900">🔬 Tamper Simulator</h3>
        <p className="text-yellow-800 text-sm">
          Edit the document below and re-verify to see how the signature detects tampering. This demonstrates the integrity protection of digital signatures.
        </p>

        {/* Tampered Document */}
        <div className="space-y-2">
          <label className="block font-semibold text-yellow-900">Editable Document Copy</label>
          <textarea
            value={tamperedDocument}
            onChange={(e) => setTamperedDocument(e.target.value)}
            rows={6}
            className="w-full p-4 border-2 border-yellow-300 rounded-lg font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            placeholder="Edit this copy of the document..."
          />
          {/* File Upload Button for Tamper Section */}
          <div className="flex gap-2">
            <button
              onClick={() => tamperFileInputRef.current?.click()}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              📄 Upload Different Document
            </button>
            <input
              ref={tamperFileInputRef}
              type="file"
              onChange={handleTamperFileUpload}
              accept=".txt,.doc,.docx,.pdf"
              className="hidden"
            />
            <span className="text-xs text-yellow-700 self-center">
              Or edit the text above
            </span>
          </div>
          <p className="text-xs text-yellow-700">
            Try modifying the text above or uploading a different document, then click "Re-Verify Tampered Document" to see the signature fail.
          </p>
        </div>

        {/* Re-Verify Button */}
        <div className="flex justify-center">
          <button
            onClick={handleVerifyTampered}
            disabled={loading}
            className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-lg transition-colors"
          >
            {loading ? 'Verifying...' : 'Re-Verify Tampered Document'}
          </button>
        </div>

        {/* Tampered Result */}
        {tamperedResult && (
          <div
            className={`p-4 rounded-lg border-2 ${
              tamperedResult.valid
                ? 'bg-green-100 border-green-400'
                : 'bg-red-100 border-red-400'
            }`}
          >
            <div className="flex items-start gap-2">
              <div className="text-2xl flex-shrink-0">
                {tamperedResult.valid ? '✓' : '✗'}
              </div>
              <div>
                <p className={`font-bold ${
                  tamperedResult.valid ? 'text-green-700' : 'text-red-700'
                }`}>
                  {tamperedResult.valid ? 'Valid' : 'Invalid'}
                </p>
                <p className="text-sm text-gray-700">{tamperedResult.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Performance Metrics for Tampered Verification */}
        {tamperedPerformance && (
          <div className="mt-4">
            <PerformanceMetrics performance={tamperedPerformance} operationType="verification" />
          </div>
        )}
      </div>

      {/* Info Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-3">
        <h3 className="text-lg font-semibold text-blue-900">How Signature Verification Works</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <div>
            <strong>Valid Signature:</strong> The signature matches the exact document and was created with the corresponding private key. The document has not been modified.
          </div>
          <div>
            <strong>Invalid Signature:</strong> Either the document has been changed, the signature is corrupted, or it doesn't match the public key provided.
          </div>
          <div>
            <strong>Integrity Protection:</strong> Post-quantum signatures like ML-DSA-65 guarantee that any change to the document, no matter how small, will make the signature invalid.
          </div>
        </div>
      </div>

      {/* Empty State */}
      {!result && !tamperedResult && !loading && (
        <div className="text-center p-8 bg-slate-50 rounded-lg">
          <p className="text-slate-600">Fill in the fields above and click "Verify Signature" to check a document</p>
        </div>
      )}
    </div>
  )
}
