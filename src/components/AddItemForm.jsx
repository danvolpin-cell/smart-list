import { useState, useRef } from 'react'
import { Plus } from 'lucide-react'

export default function AddItemForm({ folders, onAdd }) {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [folderId, setFolderId] = useState('')
  const nameRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onAdd({ name, quantity, folderId: folderId || null })
    setName('')
    setQuantity('')
    nameRef.current?.focus()
  }

  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Add Item</p>
      <form onSubmit={handleSubmit} className="flex gap-2 flex-wrap">
        <input
          ref={nameRef}
          type="text"
          placeholder="Item name (e.g. Milk, חלב)"
          value={name}
          onChange={e => setName(e.target.value)}
          dir="auto"
          className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 placeholder-gray-400"
          style={{ minWidth: '120px' }}
        />
        <input
          type="text"
          placeholder="Qty"
          value={quantity}
          onChange={e => setQuantity(e.target.value)}
          className="w-20 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 placeholder-gray-400"
        />
        {folders.length > 0 && (
          <select
            value={folderId}
            onChange={e => setFolderId(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-700 bg-white"
          >
            <option value="">No folder</option>
            {folders.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        )}
        <button
          type="submit"
          disabled={!name.trim()}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-40"
        >
          <Plus size={15} />
          Add
        </button>
      </form>
    </div>
  )
}
