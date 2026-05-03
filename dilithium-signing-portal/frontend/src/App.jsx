import { useState, useEffect } from 'react'
import GenerateKeys from './components/GenerateKeys'
import SignDocument from './components/SignDocument'
import VerifyDocument from './components/VerifyDocument'
import WhyPostQuantum from './components/WhyPostQuantum'
import StepProgress from './components/StepProgress'

function App() {
  const [activeTab, setActiveTab] = useState(1)
  const [publicKey, setPublicKey] = useState(null)
  const [privateKey, setPrivateKey] = useState(null)
  const [signature, setSignature] = useState(null)
  const [signedDocument, setSignedDocument] = useState(null)
  const [verificationRun, setVerificationRun] = useState(false)
  const [trustedPublicKey, setTrustedPublicKey] = useState(null)

  const tabs = [
    { id: 1, label: '1. Generate Keys' },
    { id: 2, label: '2. Sign Document' },
    { id: 3, label: '3. Verify Document' },
  ]

  // Load keys from sessionStorage on mount
  useEffect(() => {
    const savedPubKey = sessionStorage.getItem('publicKey')
    const savedPrivKey = sessionStorage.getItem('privateKey')
    const savedTrustedKey = sessionStorage.getItem('trustedPublicKey')
    
    if (savedPubKey) setPublicKey(savedPubKey)
    if (savedPrivKey) setPrivateKey(savedPrivKey)
    if (savedTrustedKey) setTrustedPublicKey(savedTrustedKey)
  }, [])

  // Save keys to sessionStorage whenever they change
  useEffect(() => {
    if (publicKey) sessionStorage.setItem('publicKey', publicKey)
  }, [publicKey])

  useEffect(() => {
    if (privateKey) sessionStorage.setItem('privateKey', privateKey)
  }, [privateKey])

  useEffect(() => {
    if (trustedPublicKey) sessionStorage.setItem('trustedPublicKey', trustedPublicKey)
  }, [trustedPublicKey])

  const handleKeysGenerated = (pub, priv) => {
    setPublicKey(pub)
    setPrivateKey(priv)
  }

  const handleClearKeys = () => {
    if (window.confirm('Clear all keys and start a fresh demo?')) {
      setPublicKey(null)
      setPrivateKey(null)
      setTrustedPublicKey(null)
      setSignature(null)
      setSignedDocument(null)
      setVerificationRun(false)
      sessionStorage.clear()
    }
  }

  const handleSignatureGenerated = (sig, doc) => {
    setSignature(sig)
    setSignedDocument(doc)
  }

  const handleVerificationRun = () => {
    setVerificationRun(true)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-[#1A3C5E] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Quantum-Safe Signing Portal</h1>
          <div className="flex items-center gap-4">
            <div className="bg-slate-700 text-slate-100 px-4 py-2 rounded-full text-sm font-semibold">
              Powered by CRYSTALS-Dilithium
            </div>
            {(publicKey || privateKey) && (
              <button
                onClick={handleClearKeys}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Clear Demo
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="bg-slate-100 border-b border-slate-300">
        <div className="max-w-7xl mx-auto px-6 flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 font-semibold transition-all ${
                activeTab === tab.id
                  ? 'text-[#1A3C5E] border-b-4 border-[#1A3C5E]'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Why Post-Quantum Panel */}
      <WhyPostQuantum />

      {/* Step Progress */}
      <StepProgress
        keysGenerated={!!publicKey && !!privateKey}
        documentSigned={!!signature}
        verificationRun={verificationRun}
      />

      {/* Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        {/* Tab 1: Generate Keys */}
        {activeTab === 1 && (
          <div className="bg-white rounded-lg border border-slate-200 p-8">
            <h2 className="text-3xl font-bold text-[#1A3C5E] mb-4">Generate Keys</h2>
            <p className="text-slate-600 text-lg mb-8">
              Create a new ML-DSA-65 (NIST-standardized Dilithium) public/private key pair for signing and verification.
            </p>
            <GenerateKeys
              publicKey={publicKey}
              privateKey={privateKey}
              onKeysGenerated={handleKeysGenerated}
            />
          </div>
        )}

        {/* Tab 2: Sign Document */}
        {activeTab === 2 && (
          <div className="bg-white rounded-lg border border-slate-200 p-8">
            <h2 className="text-3xl font-bold text-[#1A3C5E] mb-4">Sign Document</h2>
            <p className="text-slate-600 text-lg mb-8">
              Use your private key to digitally sign a document using post-quantum cryptography.
            </p>
            <SignDocument
              privateKey={privateKey}
              onSignatureGenerated={handleSignatureGenerated}
            />
          </div>
        )}

        {/* Tab 3: Verify Document */}
        {activeTab === 3 && (
          <div className="bg-white rounded-lg border border-slate-200 p-8">
            <h2 className="text-3xl font-bold text-[#1A3C5E] mb-4">Verify Document</h2>
            <p className="text-slate-600 text-lg mb-8">
              Verify a document signature using a trusted public key to ensure authenticity and integrity.
            </p>
            <VerifyDocument
              publicKey={publicKey}
              signature={signature}
              signedDocument={signedDocument}
              trustedPublicKey={trustedPublicKey}
              onVerificationRun={handleVerificationRun}
              onTrustedKeyChange={setTrustedPublicKey}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-100 border-t border-slate-300 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-slate-600 text-sm">
          Post-Quantum Cryptography Demo | FIPS 204 | CRYSTALS-Dilithium
        </div>
      </footer>
    </div>
  )
}

export default App
