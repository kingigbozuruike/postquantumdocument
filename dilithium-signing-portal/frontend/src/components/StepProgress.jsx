export default function StepProgress({ keysGenerated, documentSigned, verificationRun }) {
  const steps = [
    { number: 1, label: 'Generate Keys', completed: keysGenerated },
    { number: 2, label: 'Sign Document', completed: documentSigned },
    { number: 3, label: 'Verify Signature', completed: verificationRun },
  ]

  return (
    <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-300 py-6">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-4">Progress</p>
        
        {/* Steps Container */}
        <div className="flex items-center justify-between relative">
          {/* Progress Line */}
          <div className="absolute top-6 left-0 right-0 h-1 bg-slate-300 -z-10">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
              style={{
                width: `${(steps.filter(s => s.completed).length / steps.length) * 100}%`,
              }}
            />
          </div>

          {/* Step Circles */}
          {steps.map((step, index) => (
            <div key={step.number} className="flex flex-col items-center z-10">
              {/* Circle */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                  step.completed
                    ? 'bg-green-500 text-white shadow-lg scale-110'
                    : 'bg-white text-slate-400 border-2 border-slate-300'
                }`}
              >
                {step.completed ? '✓' : step.number}
              </div>

              {/* Label */}
              <p
                className={`text-xs font-semibold mt-3 text-center transition-colors duration-300 ${
                  step.completed ? 'text-green-600' : 'text-slate-600'
                }`}
              >
                {step.label}
              </p>

              {/* Status Badge */}
              {step.completed && (
                <span className="text-xs text-green-600 font-bold mt-1">✓ Done</span>
              )}
            </div>
          ))}
        </div>

        {/* Summary Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-700">
            {steps.filter(s => s.completed).length} of {steps.length} steps completed
          </p>
        </div>
      </div>
    </div>
  )
}
