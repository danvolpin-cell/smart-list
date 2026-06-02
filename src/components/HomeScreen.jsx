import { useEffect, useState } from 'react'
import { ShoppingCart, Users, User, Plus, LogIn, Copy, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function ListCard({ list, onSelect }) {
  const [count, setCount] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    supabase
      .from('items')
      .select('id', { count: 'exact', head: true })
      .eq('list_id', list.id)
      .eq('is_purchased', false)
      .then(({ count: c }) => setCount(c ?? 0))
  }, [list.id])

  const copyCode = (e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(list.share_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const isPersonal = list.is_personal

  return (
    <button
      onClick={() => onSelect(list.id)}
      className="group relative w-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 p-5 overflow-hidden"
    >
      {/* Accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl ${isPersonal ? 'bg-gradient-to-r from-violet-400 to-purple-500' : 'bg-gradient-to-r from-blue-400 to-blue-600'}`} />

      <div className="flex items-start justify-between gap-3 mt-1">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${isPersonal ? 'bg-violet-50' : 'bg-blue-50'}`}>
            {isPersonal
              ? <User size={20} className="text-violet-500" />
              : <Users size={20} className="text-blue-500" />
            }
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-base leading-tight">{list.name}</h3>
            <p className={`text-xs mt-0.5 font-medium ${isPersonal ? 'text-violet-400' : 'text-blue-400'}`}>
              {isPersonal ? 'Personal' : 'Family list'}
            </p>
          </div>
        </div>
        {count !== null && (
          <div className="flex-shrink-0 text-right">
            <p className="text-2xl font-bold text-gray-800">{count}</p>
            <p className="text-xs text-gray-400">to get</p>
          </div>
        )}
      </div>

      {!isPersonal && list.share_code && (
        <div className="mt-4 flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
          <span className="text-xs text-gray-400">Code: <span className="font-mono font-semibold text-gray-600">{list.share_code}</span></span>
          <button
            onClick={copyCode}
            className="text-gray-400 hover:text-blue-500 transition-colors"
            title="Copy code"
          >
            {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
          </button>
        </div>
      )}
    </button>
  )
}

export default function HomeScreen({ session, lists, onSelectList, onCreateList, onJoinList, onSignOut }) {
  const name = session.user.user_metadata?.full_name?.split(' ')[0] || session.user.email.split('@')[0]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart size={22} className="text-blue-600" />
            <span className="font-bold text-blue-600 text-lg">Smart List</span>
          </div>
          <button onClick={onSignOut} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            Sign out
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-8 pb-12">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">{greeting()}, {name} 👋</h1>
          <p className="text-gray-400 text-sm mt-1">Which list are you shopping from?</p>
        </div>

        {/* List cards */}
        <div className="space-y-3 mb-8">
          {lists.map(list => (
            <ListCard key={list.id} list={list} onSelect={onSelectList} />
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCreateList}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            New List
          </button>
          <button
            onClick={onJoinList}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-medium hover:border-blue-300 hover:text-blue-600 transition-colors"
          >
            <LogIn size={16} />
            Join List
          </button>
        </div>
      </div>
    </div>
  )
}
