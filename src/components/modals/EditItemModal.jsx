import { useState } from 'react'
import Modal from './Modal'

export default function EditItemModal({ item, folders, onClose, onSave }) {
  const [name, setName] = useState(item.name)
  const [quantity, setQuantity] = useState(item.quantity || '1')
  const [folderId, setFolderId] = useState(item.folder_id || '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    await onSave(item.id, {
      name: name.trim(),
      quantity: quantity.trim() || '1',
      folder_id: folderId || null,
    })
    setLoading(false)
  }

  return (
    <Modal title="Edit Item" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Item name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            dir="auto"
            autoFocus
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Quantity</label>
          <input
            type="text"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
          />
        </div>
        {folders.length > 0 && (
          <div>
            <label className="block text-sm text-gray-600 mb-1">Folder</label>
            <select
              value={folderId}
              onChange={e => setFolderId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm bg-white"
            >
              <option value="">No folder</option>
              {folders.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
        )}
        <div className="flex gap-2 justify-end pt-1">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg">
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim() || loading}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
