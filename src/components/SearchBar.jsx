import { useState, useRef, useEffect } from 'react'
import { Search, Plus, X, FolderOpen } from 'lucide-react'

export default function SearchBar({ items, folders, onAdd, onScrollToItem }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const inputRef = useRef(null)
  const containerRef = useRef(null)

  const folderMap = Object.fromEntries(folders.map(f => [f.id, f.name]))

  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)

  const matches = words.length === 0 ? [] : items.filter(item => {
    const name = item.name.toLowerCase()
    return words.some(w => name.includes(w))
  })

  const exactMatch = items.some(
    item => item.name.toLowerCase() === query.trim().toLowerCase()
  )

  const handleQuickAdd = () => {
    if (!query.trim()) return
    onAdd({ name: query.trim(), quantity: '1', folderId: null })
    setQuery('')
    setOpen(false)
  }

  const handleSelect = (item) => {
    onScrollToItem(item)
    setQuery('')
    setOpen(false)
  }

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-400 transition-all">
        <Search size={15} className="text-gray-400 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search items..."
          value={query}
          dir="auto"
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={e => {
            if (e.key === 'Escape') { setOpen(false); setQuery('') }
            if (e.key === 'Enter' && !exactMatch && query.trim()) handleQuickAdd()
          }}
          className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
        />
        {query && (
          <button onClick={() => { setQuery(''); setOpen(false) }} className="text-gray-300 hover:text-gray-500 flex-shrink-0">
            <X size={14} />
          </button>
        )}
      </div>

      {open && query.trim().length > 0 && (
        <div className="absolute z-50 top-full mt-1.5 left-0 right-0 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden max-h-72 overflow-y-auto">
          {matches.length > 0 ? (
            <>
              {matches.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    <p dir="auto" className={`text-sm font-medium truncate ${item.is_purchased ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {item.name}
                    </p>
                    {item.folder_id && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <FolderOpen size={10} />
                        {folderMap[item.folder_id] ?? ''}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">x{item.quantity || '1'}</span>
                </button>
              ))}
              {!exactMatch && (
                <button
                  onClick={handleQuickAdd}
                  className="w-full flex items-center gap-2 px-4 py-2.5 border-t border-gray-100 text-blue-600 hover:bg-blue-50 transition-colors text-sm font-medium"
                >
                  <Plus size={14} />
                  Add "{query.trim()}"
                </button>
              )}
            </>
          ) : (
            <button
              onClick={handleQuickAdd}
              className="w-full flex items-center gap-2 px-4 py-3 text-blue-600 hover:bg-blue-50 transition-colors text-sm font-medium"
            >
              <Plus size={14} />
              Add "{query.trim()}"
            </button>
          )}
        </div>
      )}
    </div>
  )
}
