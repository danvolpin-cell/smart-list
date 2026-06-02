import { ChevronDown, ChevronRight, FolderOpen, Folder, Trash2 } from 'lucide-react'
import ItemRow from './ItemRow'

export default function FolderGroup({ folder, items, onToggle, onDelete, onFavorite, onEdit, onDeleteFolder, onToggleFolderExpand }) {
  const isExpanded = folder.is_expanded !== false

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100 group">
        <button
          onClick={() => onToggleFolderExpand(folder)}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
        >
          {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
        </button>
        {isExpanded
          ? <FolderOpen size={15} className="text-amber-500 flex-shrink-0" />
          : <Folder size={15} className="text-amber-500 flex-shrink-0" />
        }
        <span className="font-medium text-gray-700 flex-1 text-sm truncate" dir="auto">
          {folder.name}
        </span>
        <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full flex-shrink-0">
          {items.length}
        </span>
        <button
          onClick={() => onDeleteFolder(folder.id)}
          className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
          title="Delete folder"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {isExpanded && (
        <div className="divide-y divide-gray-50">
          {items.map(item => (
            <ItemRow
              key={item.id}
              item={item}
              onToggle={onToggle}
              onDelete={onDelete}
              onFavorite={onFavorite}
              onEdit={onEdit}
              indent
            />
          ))}
          {items.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-400 italic text-center">Empty folder</div>
          )}
        </div>
      )}
    </div>
  )
}
