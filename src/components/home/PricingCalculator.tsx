"use client"

import { useState } from "react"
import { RegionPricing } from "@/lib/pricing-config"

interface PricingCalculatorProps {
  config: RegionPricing
}

export default function PricingCalculator({ config }: PricingCalculatorProps) {
  const [agents, setAgents] = useState<number>(50)
  const [callsPerDay, setCallsPerDay] = useState<number>(25)
  const [callLength, setCallLength] = useState<number>(7)

  // Standard BPO monthly working days
  const monthlyWorkDays = 22

  // Live Math
  const totalCallsPerMonth = agents * callsPerDay * monthlyWorkDays
  const totalMinutesPerMonth = totalCallsPerMonth * callLength
  const estimatedMonthlyBill = totalMinutesPerMonth * config.rate
  
  // For manual QA, we calculate in local currency first, then convert to the rate currency for accurate comparison.
  const manualQaMonthlyCostLocal = totalCallsPerMonth * config.manualQaCostPerCall
  const manualQaMonthlyCostRateCurrency = manualQaMonthlyCostLocal / (config.exchangeRateToUSD || 1)
  
  const monthlySavings = Math.max(0, manualQaMonthlyCostRateCurrency - estimatedMonthlyBill)
  const savingsPercent = manualQaMonthlyCostRateCurrency > 0 ? (monthlySavings / manualQaMonthlyCostRateCurrency) * 100 : 0

  // Format Helper
  const formatValue = (val: number, symbol: string) => {
    return `${symbol}${Math.round(val).toLocaleString()}`
  }

  return (
    <div className="bg-[#0F172A]/40 border border-gray-800 rounded-3xl p-6 md:p-8">
      <div className="text-center md:text-left mb-8">
        <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Estimate Your Savings</h3>
        <p className="text-sm text-gray-400">Adjust the sliders to estimate your volume and compare costs with manual QA.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Inputs */}
        <div className="lg:col-span-7 space-y-6">
          {/* Input 1: Number of Agents */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-300">Number of Agents</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={agents}
                  onChange={(e) => setAgents(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-16 px-2 py-1 bg-[#1E293B] border border-gray-700 rounded text-right text-sm font-semibold text-white focus:outline-none focus:border-blue-500"
                  min="1"
                />
                <span className="text-xs text-gray-500">agents</span>
              </div>
            </div>
            <input
              type="range"
              min="5"
              max="500"
              value={agents}
              onChange={(e) => setAgents(parseInt(e.target.value))}
              className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none"
            />
            <div className="flex justify-between text-[10px] text-gray-600">
              <span>5 agents</span>
              <span>500 agents</span>
            </div>
          </div>

          {/* Input 2: Average Calls per Agent per Day */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-300">Avg Calls per Agent / Day</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={callsPerDay}
                  onChange={(e) => setCallsPerDay(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-16 px-2 py-1 bg-[#1E293B] border border-gray-700 rounded text-right text-sm font-semibold text-white focus:outline-none focus:border-blue-500"
                  min="1"
                />
                <span className="text-xs text-gray-500">calls</span>
              </div>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              value={callsPerDay}
              onChange={(e) => setCallsPerDay(parseInt(e.target.value))}
              className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none"
            />
            <div className="flex justify-between text-[10px] text-gray-600">
              <span>5 calls</span>
              <span>100 calls</span>
            </div>
          </div>

          {/* Input 3: Average Call Length */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-300">Avg Call Length</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={callLength}
                  onChange={(e) => setCallLength(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-16 px-2 py-1 bg-[#1E293B] border border-gray-700 rounded text-right text-sm font-semibold text-white focus:outline-none focus:border-blue-500"
                  min="1"
                />
                <span className="text-xs text-gray-500">mins</span>
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="45"
              value={callLength}
              onChange={(e) => setCallLength(parseInt(e.target.value))}
              className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none"
            />
            <div className="flex justify-between text-[10px] text-gray-600">
              <span>1 min</span>
              <span>45 mins</span>
            </div>
          </div>

          <div className="text-[10px] text-gray-500 italic mt-4 text-center lg:text-left">
            * Calculations assume an average of {monthlyWorkDays} working days per month per agent.
          </div>
        </div>

        {/* Right Side: Results Card */}
        <div className="lg:col-span-5 bg-[#1E293B]/50 rounded-2xl p-6 border border-gray-800 flex flex-col justify-between h-full relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-4 flex-grow mb-6">
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Monthly Minutes</span>
              <div className="text-2xl font-bold text-white">
                {totalMinutesPerMonth.toLocaleString()} mins
              </div>
            </div>

            <div className="pt-3 border-t border-gray-800">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Estimated Monthly Bill</span>
              <div className="text-3xl font-extrabold text-blue-400">
                {formatValue(estimatedMonthlyBill, config.symbol)}
              </div>
              <span className="text-[10px] text-gray-500 mt-0.5 block">
                At {config.symbol}{config.rate < 0.1 ? config.rate.toFixed(3) : config.rate.toFixed(2)}/min usage rate
              </span>
            </div>

            <div className="pt-3 border-t border-gray-800">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Manual QA Equivalent</span>
              <div className="text-xl font-semibold text-gray-300">
                {formatValue(manualQaMonthlyCostRateCurrency, config.symbol)}
              </div>
              <span className="text-[10px] text-gray-500 mt-0.5 block">
                At {config.manualQaSymbol}{config.manualQaCostPerCall} equivalent cost per call reviewed ({formatValue(manualQaMonthlyCostLocal, config.manualQaSymbol)})
              </span>
            </div>
          </div>

          {/* Bold Savings Area */}
          <div className="mt-auto bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl p-4 text-center">
            <span className="text-xs font-medium uppercase tracking-wider block mb-1">Estimated Monthly Savings</span>
            <div className="text-xl md:text-2xl font-bold">
              You save ~{formatValue(monthlySavings, config.symbol)}
            </div>
            <div className="text-xs mt-1 font-semibold">
              ({savingsPercent.toFixed(1)}% Cost Reduction)
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
