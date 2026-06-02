import { useState } from 'react'
import { Copy, Users, Share2, Trash2, LogOut, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ListHeader({ list, isOwner, onShowMembers, onShareSnapshot, onDeleteList, onLeaveList }) {
  const [copied, setCopied] = useState(false)

  const copyCode = () => {
    navigator.clipboard.writeText(list.share_code)
    setCopied(true)
    toast.success('Code copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">{list.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-400">Share code:</span>
            <code className="text-sm font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              {list.share_code}
            </code>
            <button onClick={copyCode} className="text-gray-400 hover:text-blue-600 transition-colors">
              {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onShowMembers}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm transition-colors"
          >
            <Users size={14} />
            Members
          </button>
          <button
            onClick={onShareSnapshot}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm transition-colors"
          >
            <Share2 size={14} />
            Share List
          </button>
          {isOwner ? (
            <button
              onClick={onDeleteList}
              className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Delete list"
            >
              <Trash2 size={16} />
            </button>
          ) : (
            <button
              onClick={onLeaveList}
              className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Leave list"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
