import { Loader2 } from 'lucide-react'

export default function DashboardLoading() {
  return (
    <div className="flex flex-col h-[60vh] w-full items-center justify-center animate-in fade-in duration-500">
      <div className="relative flex items-center justify-center">
        {/* Glowing backdrop */}
        <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full" />
        
        <Loader2 className="h-12 w-12 text-purple-500 animate-spin relative z-10" />
      </div>
      
      <h3 className="mt-6 text-xl font-semibold text-white/90">Loading Module...</h3>
      <p className="text-sm text-gray-500 mt-2">Connecting to secure server</p>
    </div>
  )
}
