import { useState } from 'react'
import Modal from './Modal'

export default function JoinListModal({ onClose, onJoin }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!code.trim()) return
    setLoading(true)
    await onJoin(code.trim())
    setLoading(false)
  }

  return (
    <Modal title="Join a List" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Enter share code</label>
          <input
            type="text"
            placeholder="e.g. UAW4XD"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            maxLength={6}
            autoFocus
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm font-mono tracking-widest uppercase"
          />
          <p className="text-xs text-gray-400 mt-1">Ask the list owner to share their 6-character code</p>
        </div>
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg">
            Cancel
          </button>
          <button
            type="submit"
            disabled={code.length !== 6 || loading}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Joining...' : 'Join List'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
