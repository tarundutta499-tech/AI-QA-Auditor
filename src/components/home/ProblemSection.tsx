"use client"

export default function ProblemSection() {
  return (
    <section className="py-24 bg-[#0B1120] relative border-y border-gray-800/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">The Old Way Is Broken</h2>
          <p className="text-xl text-gray-400">Traditional QA is too slow, too biased, and covers too little.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#020617]/50 border border-red-900/30 p-8 rounded-2xl">
            <div className="text-red-500 text-4xl mb-4 font-black">2%</div>
            <h3 className="text-xl font-medium text-white mb-2">Blind Spots</h3>
            <p className="text-gray-400">You audit 2% of calls. The other 98% of customer interactions are completely invisible to management.</p>
          </div>
          <div className="bg-[#020617]/50 border border-orange-900/30 p-8 rounded-2xl">
            <div className="text-orange-500 text-4xl mb-4 font-black">Bias</div>
            <h3 className="text-xl font-medium text-white mb-2">Inconsistent Grading</h3>
            <p className="text-gray-400">Human reviewers are inconsistent. Scores vary wildly based on the auditor's mood, not the agent's merit.</p>
          </div>
          <div className="bg-[#020617]/50 border border-yellow-900/30 p-8 rounded-2xl">
            <div className="text-yellow-500 text-4xl mb-4 font-black">Delay</div>
            <h3 className="text-xl font-medium text-white mb-2">Too Late</h3>
            <p className="text-gray-400">Feedback reaches agents days or weeks later. Coaching never lands in time to actually fix behaviors.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
