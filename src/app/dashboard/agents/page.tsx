"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Plus, Loader2, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'

export default function AgentsPage() {
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAgents() {
      try {
        const res = await fetch('/api/agents')
        const data = await res.json()
        
        if (!res.ok) throw new Error(data.error || "Failed to load team")
        setAgents(data.agents)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchAgents()
  }, [])

  const handleDeleteMember = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to delete ${userName || 'this user'}? This will remove their credentials and audit logs permanentely.`)) {
      return
    }

    setDeletingId(userId)
    setError(null)

    try {
      const res = await fetch('/api/agents', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetUserId: userId })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete team member")
      }

      // Remove deleted agent from state immediately
      setAgents(prev => prev.filter(a => a.id !== userId))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
          <p className="text-muted-foreground mt-2">Manage QA Analysts, Team Leaders, and Agents.</p>
        </div>
        <Link href="/dashboard/agents/new">
          <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl"><Plus className="mr-2 h-4 w-4" /> Add Member</Button>
        </Link>
      </div>

      <Card className="bg-[#0B1120] border-gray-800 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-white">Directory</CardTitle>
          <CardDescription>All members in your company.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-500/10 text-red-500 p-4 rounded-xl mb-4 text-sm border border-red-500/20 font-semibold">
              {error}
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-transparent">
                <TableHead className="text-gray-400">Name</TableHead>
                <TableHead className="text-gray-400">Email</TableHead>
                <TableHead className="text-gray-400">Role</TableHead>
                <TableHead className="text-gray-400">Joined</TableHead>
                <TableHead className="text-right text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => (
                <TableRow key={agent.id} className="border-gray-800/50 hover:bg-gray-800/20 transition-all">
                  <TableCell className="font-semibold text-white">{agent.name || 'Unknown'}</TableCell>
                  <TableCell className="text-gray-300">{agent.email}</TableCell>
                  <TableCell className="capitalize text-gray-300">
                    <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase">
                      {agent.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-400 text-xs">{new Date(agent.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right flex items-center justify-end gap-2">
                    <Link href={`/dashboard/agents/${agent.id}`}>
                      <Button variant="outline" size="sm" className="h-8 border-gray-800 hover:bg-gray-800 hover:text-white bg-transparent text-gray-300 text-xs font-semibold gap-1 rounded-lg">
                        <Eye className="w-3.5 h-3.5" /> View Profile
                      </Button>
                    </Link>
                    <Button 
                      onClick={() => handleDeleteMember(agent.id, agent.name)}
                      disabled={deletingId === agent.id}
                      variant="destructive" 
                      size="sm" 
                      className="h-8 text-xs font-semibold gap-1 rounded-lg"
                    >
                      {deletingId === agent.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {agents.length === 0 && !error && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No team members found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
