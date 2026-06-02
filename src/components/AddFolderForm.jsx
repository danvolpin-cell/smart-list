import { useState } from 'react'
import { FolderPlus } from 'lucide-react'

export default function AddFolderForm({ onAdd }) {
  const [name, setName] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onAdd(name)
    setName('')
  }

  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Add Folder</p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Folder name (e.g. Dairy, ירקות)"
          value={name}
          onChange={e => setName(e.target.value)}
          dir="auto"
          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm text-gray-900 placeholder-gray-400"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors disabled:opacity-40"
        >
          <FolderPlus size={15} />
          Add Folder
        </button>
      </form>
    </div>
  )
}
