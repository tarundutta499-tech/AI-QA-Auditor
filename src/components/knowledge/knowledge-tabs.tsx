"use client"

import { useState } from 'react'
import { KnowledgeManager, KnowledgeEntry } from './knowledge-manager'
import { CoachingRefresher } from './coaching-refresher'
import { BookOpen, Award } from 'lucide-react'

export function KnowledgeTabs({ entries }: { entries: KnowledgeEntry[] }) {
  const [activeTab, setActiveTab] = useState<'runbooks' | 'refresher'>('runbooks')

  return (
    <div className="space-y-6">
      
      {/* Tabs Header Toggle */}
      <div className="flex border-b border-gray-800 gap-6">
        <button
          onClick={() => setActiveTab('runbooks')}
          className={`pb-3 font-semibold text-sm transition-all flex items-center gap-2 ${
            activeTab === 'runbooks' 
              ? 'border-b-2 border-blue-500 text-white' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Company Runbooks
        </button>

        <button
          onClick={() => setActiveTab('refresher')}
          className={`pb-3 font-semibold text-sm transition-all flex items-center gap-2 ${
            activeTab === 'refresher' 
              ? 'border-b-2 border-blue-500 text-white' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          Smart AI Refresher Plan
        </button>
      </div>

      {/* Tabs Content */}
      <div className="mt-4 animate-in fade-in duration-200">
        {activeTab === 'runbooks' ? (
          <KnowledgeManager entries={entries} />
        ) : (
          <CoachingRefresher runbooks={entries} />
        )}
      </div>

    </div>
  )
}
