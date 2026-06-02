import { useState } from 'react'
import { Copy, Check, Download, Share2 } from 'lucide-react'
import Modal from './Modal'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

// SEND mode: user creates a snapshot of their current list to share
function SendMode({ items, folders, listName, onClose }) {
  const [code, setCode] = useState(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  const createSnapshot = async () => {
    setLoading(true)
    const shareCode = generateCode()
    const unpurchased = items.filter(i => !i.is_purchased)

    const snapshot = unpurchased.map(item => ({
      name: item.name,
      quantity: item.quantity,
      folder: item.folder_id ? folders.find(f => f.id === item.folder_id)?.name || null : null,
    }))

    const { error } = await supabase.from('shared_snapshots').insert({
      share_code: shareCode,
      list_name: listName,
      items: snapshot,
    })

    if (error) { toast.error('Failed to create share'); setLoading(false); return }
    setCode(shareCode)
    setLoading(false)
  }

  const copyCode = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Code copied!')
  }

  const unpurchasedCount = items.filter(i => !i.is_purchased).length

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Share your shopping list with someone. They'll enter the code in their app to import all items.
      </p>
      <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
        <strong>{unpurchasedCount} unchecked items</strong> from <em>{listName}</em> will be shared
      </div>

      {!code ? (
        <button
          onClick={createSnapshot}
          disabled={loading || unpurchasedCount === 0}
          className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          <Share2 size={16} />
          {loading ? 'Creating...' : 'Generate Share Code'}
        </button>
      ) : (
        <div className="space-y-3">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-2">Share this code:</p>
            <div className="flex items-center justify-center gap-3">
              <code className="text-3xl font-mono font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl tracking-widest">
                {code}
              </code>
              <button onClick={copyCode} className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600">
                {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
              </button>
            </div>
          </div>
          <p className="text-xs text-center text-gray-400">
            The recipient opens the app → tap the download icon in the header → enter this code
          </p>
          <button onClick={onClose} className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200">
            Done
          </button>
        </div>
      )}
    </div>
  )
}

// RECEIVE mode: user enters a code to import items from someone else's snapshot
function ReceiveMode({ userId, targetLists, onClose }) {
  const [code, setCode] = useState('')
  const [snapshot, setSnapshot] = useState(null)
  const [selectedListId, setSelectedListId] = useState(targetLists[0]?.id || '')
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)

  const lookupCode = async () => {
    if (code.length !== 6) return
    setLoading(true)
    const { data, error } = await supabase
      .from('shared_snapshots')
      .select('*')
      .eq('share_code', code.toUpperCase())
      .maybeSingle()

    if (error || !data) {
      toast.error('Code not found. Check and try again.')
      setLoading(false)
      return
    }
    setSnapshot(data)
    setLoading(false)
  }

  const importItems = async () => {
    if (!selectedListId || !snapshot) return
    setImporting(true)

    // Get or create folders in target list
    const { data: existingFolders } = await supabase
      .from('folders')
      .select('*')
      .eq('list_id', selectedListId)

    const folderMap = {}
    for (const item of snapshot.items) {
      if (item.folder && !folderMap[item.folder]) {
        const existing = existingFolders?.find(f => f.name === item.folder)
        if (existing) {
          folderMap[item.folder] = existing.id
        } else {
          const { data: newFolder } = await supabase
            .from('folders')
            .insert({ list_id: selectedListId, name: item.folder })
            .select()
            .single()
          if (newFolder) folderMap[item.folder] = newFolder.id
        }
      }
    }

    const rows = snapshot.items.map(item => ({
      list_id: selectedListId,
      folder_id: item.folder ? (folderMap[item.folder] || null) : null,
      name: item.name,
      quantity: item.quantity || '1',
      is_purchased: false,
    }))

    const { error } = await supabase.from('items').insert(rows)
    if (error) { toast.error('Failed to import items'); setImporting(false); return }

    toast.success(`Imported ${rows.length} items!`)
    onClose()
  }

  const sharedLists = targetLists.filter(l => !l.is_personal)

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">Enter a share code to import items into one of your lists.</p>

      {!snapshot ? (
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Share code</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. ABC123"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm font-mono tracking-widest uppercase"
              />
              <button
                onClick={lookupCode}
                disabled={code.length !== 6 || loading}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? '...' : 'Look Up'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-3">
            <p className="text-sm font-medium text-green-800">Found: {snapshot.list_name}</p>
            <p className="text-xs text-green-600 mt-0.5">{snapshot.items.length} items to import</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-3 max-h-40 overflow-y-auto space-y-1">
            {snapshot.items.map((item, i) => (
              <div key={i} className="text-sm text-gray-700 flex gap-2">
                <span className="text-gray-400">•</span>
                <span dir="auto">{item.name}</span>
                <span className="text-gray-400 text-xs">x{item.quantity}</span>
                {item.folder && <span className="text-gray-400 text-xs">({item.folder})</span>}
              </div>
            ))}
          </div>

          {sharedLists.length > 0 ? (
            <div>
              <label className="block text-sm text-gray-600 mb-1">Import into</label>
              <select
                value={selectedListId}
                onChange={e => setSelectedListId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm bg-white"
              >
                {targetLists.map(l => (
                  <option key={l.id} value={l.id}>{l.name}{l.is_personal ? ' (Personal)' : ''}</option>
                ))}
              </select>
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center">Items will be added to your Personal list</p>
          )}

          <button
            onClick={importItems}
            disabled={importing}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Download size={16} />
            {importing ? 'Importing...' : `Import ${snapshot.items.length} Items`}
          </button>

          <button onClick={() => setSnapshot(null)} className="w-full py-2 text-sm text-gray-500 hover:text-gray-700">
            Try a different code
          </button>
        </div>
      )}
    </div>
  )
}

export default function ShareSnapshotModal({ onClose, userId, targetLists = [], items = [], folders = [], listName = '', mode = 'send' }) {
  return (
    <Modal title={mode === 'send' ? 'Share List' : 'Paste Shared List'} onClose={onClose}>
      {mode === 'send' ? (
        <SendMode items={items} folders={folders} listName={listName} onClose={onClose} />
      ) : (
        <ReceiveMode userId={userId} targetLists={targetLists} onClose={onClose} />
      )}
    </Modal>
  )
}
