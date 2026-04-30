export default function SignatureBytePreview({ signature }) {
  if (!signature) return null

  // Split hex string into 2-char chunks (bytes)
  const bytes = signature.match(/.{1,2}/g) || []
  const firstSixtyFour = bytes.slice(0, 64)
  const totalBytes = bytes.length

  // Color function based on byte value
  const getColorClass = (hexByte) => {
    const value = parseInt(hexByte, 16)

    if (value <= 0x55) {
      // Blue tones: 00-55
      if (value < 0x20) return 'bg-blue-900'
      if (value < 0x40) return 'bg-blue-700'
      return 'bg-blue-500'
    } else if (value <= 0xaa) {
      // Green tones: 56-AA
      if (value < 0x70) return 'bg-green-700'
      if (value < 0x90) return 'bg-green-600'
      return 'bg-green-500'
    } else {
      // Purple/red tones: AB-FF
      if (value < 0xd0) return 'bg-purple-600'
      if (value < 0xe5) return 'bg-purple-500'
      return 'bg-red-500'
    }
  }

  return (
    <div className="mt-6 bg-slate-50 border border-slate-200 rounded-lg p-6">
      <h3 className="text-sm font-semibold text-slate-900 mb-3">
        Signature Byte Preview (first 64 of {totalBytes} total bytes)
      </h3>

      {/* 8x8 Grid */}
      <div
        className="inline-grid gap-1 bg-white p-4 rounded border border-slate-300 mb-4"
        style={{ gridTemplateColumns: 'repeat(8, 1fr)' }}
      >
        {firstSixtyFour.map((byte, index) => (
          <div
            key={index}
            className={`flex items-center justify-center text-[10px] font-mono font-bold text-white rounded cursor-pointer transition-transform hover:scale-110 ${getColorClass(byte)}`}
            style={{ width: '36px', height: '36px' }}
            title={`Byte ${index}: 0x${byte.toUpperCase()}`}
          >
            {byte.toUpperCase()}
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-600 leading-relaxed">
        Each tile represents 1 byte of the Dilithium3 signature. The pattern changes entirely if the
        document is modified.
      </p>
    </div>
  )
}
