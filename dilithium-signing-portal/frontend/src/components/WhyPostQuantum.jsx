import { useState } from 'react'

export default function WhyPostQuantum() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="bg-white border-b border-slate-300">
      <div className="max-w-7xl mx-auto px-6">
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full text-left py-4 font-semibold text-[#1A3C5E] hover:text-blue-900 transition-colors flex items-center gap-2"
        >
          Why Post-Quantum? {isOpen ? '^' : 'v'}
        </button>

        {/* Collapsible Content */}
        {isOpen && (
          <div className="pb-6 space-y-4">
            {/* Explanation */}
            <p className="text-slate-700 text-sm leading-relaxed">
              Classical cryptographic schemes like RSA and ECDSA are vulnerable to{' '}
              <strong>Shor's algorithm</strong> on quantum computers. Once quantum computers
              become powerful enough, they could break all existing digital signatures used
              today. Dilithium is a post-quantum cryptographic algorithm that is mathematically
              hard even for quantum computers to break.
            </p>

            {/* Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 px-4 py-3 text-left font-semibold text-slate-900">
                      Property
                    </th>
                    <th className="border border-slate-300 px-4 py-3 text-center font-semibold text-slate-900">
                      RSA-2048
                    </th>
                    <th className="border border-slate-300 px-4 py-3 text-center font-semibold text-slate-900">
                      ECDSA-256
                    </th>
                    <th className="border border-slate-300 px-4 py-3 text-center font-semibold text-white bg-[#1A3C5E]">
                      <div className="flex items-center justify-center gap-2">
                        Dilithium3
                        <span className="inline-block px-2 py-1 bg-green-400 text-slate-900 text-xs font-bold rounded">
                          ✓ Quantum Safe
                        </span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-300 px-4 py-3 font-semibold text-slate-900">
                      Public Key Size
                    </td>
                    <td className="border border-slate-300 px-4 py-3 text-center text-slate-700">
                      256 bytes
                    </td>
                    <td className="border border-slate-300 px-4 py-3 text-center text-slate-700">
                      64 bytes
                    </td>
                    <td className="border border-slate-300 px-4 py-3 text-center text-white bg-[#1A3C5E]">
                      1,952 bytes
                    </td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="border border-slate-300 px-4 py-3 font-semibold text-slate-900">
                      Private Key Size
                    </td>
                    <td className="border border-slate-300 px-4 py-3 text-center text-slate-700">
                      1,218 bytes
                    </td>
                    <td className="border border-slate-300 px-4 py-3 text-center text-slate-700">
                      32 bytes
                    </td>
                    <td className="border border-slate-300 px-4 py-3 text-center text-white bg-[#1A3C5E]">
                      4,000 bytes
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 px-4 py-3 font-semibold text-slate-900">
                      Signature Size
                    </td>
                    <td className="border border-slate-300 px-4 py-3 text-center text-slate-700">
                      256 bytes
                    </td>
                    <td className="border border-slate-300 px-4 py-3 text-center text-slate-700">
                      64 bytes
                    </td>
                    <td className="border border-slate-300 px-4 py-3 text-center text-white bg-[#1A3C5E]">
                      3,293 bytes
                    </td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="border border-slate-300 px-4 py-3 font-semibold text-slate-900">
                      Quantum Safe?
                    </td>
                    <td className="border border-slate-300 px-4 py-3 text-center text-red-600 font-semibold">
                      No
                    </td>
                    <td className="border border-slate-300 px-4 py-3 text-center text-red-600 font-semibold">
                      No
                    </td>
                    <td className="border border-slate-300 px-4 py-3 text-center text-green-300 font-bold bg-[#1A3C5E]">
                      ✓ Yes
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 px-4 py-3 font-semibold text-slate-900">
                      NIST Standard?
                    </td>
                    <td className="border border-slate-300 px-4 py-3 text-center text-slate-600">
                      Legacy
                    </td>
                    <td className="border border-slate-300 px-4 py-3 text-center text-slate-600">
                      Legacy
                    </td>
                    <td className="border border-slate-300 px-4 py-3 text-center font-semibold text-white bg-[#1A3C5E]">
                      FIPS 204 (2024)
                    </td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="border border-slate-300 px-4 py-3 font-semibold text-slate-900">
                      Security Basis
                    </td>
                    <td className="border border-slate-300 px-4 py-3 text-center text-slate-700">
                      Integer factors
                    </td>
                    <td className="border border-slate-300 px-4 py-3 text-center text-slate-700">
                      Elliptic curves
                    </td>
                    <td className="border border-slate-300 px-4 py-3 text-center text-white bg-[#1A3C5E]">
                      Lattice problems
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Additional Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800 space-y-2">
              <p>
                <strong>Shor's Algorithm:</strong> A quantum algorithm that can efficiently solve
                the integer factorization problem (used in RSA) and discrete logarithm problems (used
                in ECDSA) in polynomial time.
              </p>
              <p>
                <strong>Lattice Problems:</strong> Dilithium is based on the hardness of lattice problems,
                which are believed to be difficult even for quantum computers.
              </p>
              <p>
                <strong>FIPS 204:</strong> The new NIST standard for post-quantum digital signatures,
                officially standardized in 2024.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
