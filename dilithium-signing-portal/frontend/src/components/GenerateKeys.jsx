import { useState } from 'react'
import { generateKeys } from '../api'

export default function GenerateKeys({ publicKey, privateKey, onKeysGenerated }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copiedField, setCopiedField] = useState(null)

  const handleGenerateKeys = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await generateKeys()
      onKeysGenerated(result.public_key, result.private_key)
      setCopiedField(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    })
  }

  return (
    <div className="space-y-8">
      {/* Generate Button */}
      <div className="flex justify-center">
        <button
          onClick={handleGenerateKeys}
          disabled={loading}
          className="px-8 py-4 bg-[#1A3C5E] text-white font-bold rounded-lg hover:bg-blue-900 disabled:bg-gray-400 transition-colors text-lg"
        >
          {loading ? 'Generating Dilithium3 key pair...' : 'Generate Key Pair'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-semibold">Error: {error}</p>
        </div>
      )}

      {/* Keys Display */}
      {(publicKey || privateKey) && (
        <>
          {/* Public Key */}
          <div className="space-y-2">
            <label className="block text-lg font-semibold text-[#1A3C5E]">Public Key</label>
            <div className="space-y-2">
              <div className="relative">
                <textarea
                  value={publicKey}
                  readOnly
                  rows={6}
                  className="w-full p-4 font-mono text-sm bg-slate-50 border border-slate-300 rounded-lg overflow-auto text-slate-700"
                />
                <button
                  onClick={() => copyToClipboard(publicKey, 'public')}
                  className="absolute top-2 right-2 px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 text-sm font-semibold rounded transition-colors"
                >
                  {copiedField === 'public' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <p className="text-sm text-slate-600">
                ✓ Share this publicly for verification. Others can use this to verify signatures you create.
              </p>
            </div>
          </div>

          {/* Private Key */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="block text-lg font-semibold text-[#1A3C5E]">Private Key</label>
              <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                ⚠️ Secret
              </span>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <textarea
                  value={privateKey}
                  readOnly
                  rows={6}
                  className="w-full p-4 font-mono text-sm bg-slate-50 border border-red-300 rounded-lg overflow-auto text-slate-700"
                />
                <button
                  onClick={() => copyToClipboard(privateKey, 'private')}
                  className="absolute top-2 right-2 px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 text-sm font-semibold rounded transition-colors"
                >
                  {copiedField === 'private' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <p className="text-sm text-red-600 font-semibold">
                ⚠️ Never share your private key. Keep it secret and secure. Anyone with this key can sign documents on your behalf.
              </p>
            </div>
          </div>

          {/* Info Panel */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-3">
            <h3 className="text-lg font-semibold text-blue-900">About Public and Private Keys</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <div>
                <strong>Public Key:</strong> Used to verify signatures. You can share this with anyone. They use it to confirm that a signature was created by you.
              </div>
              <div>
                <strong>Private Key:</strong> Used to create signatures. Keep this secret. Only you should have this key. Never share it or upload it anywhere.
              </div>
              <div>
                <strong>ML-DSA-65 (Dilithium3):</strong> A post-quantum cryptographic algorithm that is resistant to attacks from quantum computers. It's part of NIST's standardized post-quantum cryptography suite (FIPS 204).
              </div>
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {!publicKey && !privateKey && !loading && (
        <div className="text-center p-8 bg-slate-50 rounded-lg">
          <p className="text-slate-600">Click the button above to generate your first key pair</p>
        </div>
      )}
    </div>
  )
}
