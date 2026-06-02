import { Heart, Pencil, Trash2, CheckCircle2, Circle } from 'lucide-react'

export default function ItemRow({ item, onToggle, onDelete, onFavorite, onEdit, indent = false }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group ${indent ? 'pl-8' : ''}`}>
      <button
        onClick={() => onToggle(item)}
        className="flex-shrink-0 transition-colors"
      >
        {item.is_purchased
          ? <CheckCircle2 size={20} className="text-green-500" />
          : <Circle size={20} className="text-gray-300 hover:text-green-400" />
        }
      </button>

      <div className="flex-1 min-w-0 flex items-baseline gap-1.5">
        <span
          dir="auto"
          className={`text-sm font-medium break-words ${
            item.is_purchased ? 'line-through text-gray-400' : 'text-gray-800'
          }`}
        >
          {item.name}
        </span>
        <span className={`text-xs flex-shrink-0 ${item.is_purchased ? 'text-gray-300' : 'text-gray-400'}`}>
          x{item.quantity || '1'}
        </span>
        {item.is_favorite && !item.is_purchased && (
          <Heart size={11} className="text-red-400 flex-shrink-0 fill-red-400" />
        )}
      </div>

      <div className="flex items-center gap-0.5 flex-shrink-0">
        <button
          onClick={() => onFavorite(item)}
          className={`p-1.5 rounded-lg transition-colors ${
            item.is_favorite ? 'text-red-400 hover:text-red-500' : 'text-gray-300 hover:text-red-400'
          }`}
          title="Favorite"
        >
          <Heart size={13} fill={item.is_favorite ? 'currentColor' : 'none'} />
        </button>
        <button
          onClick={() => onEdit(item)}
          className="p-1.5 rounded-lg text-gray-300 hover:text-blue-500 transition-colors"
          title="Edit"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 transition-colors"
          title="Delete"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}
