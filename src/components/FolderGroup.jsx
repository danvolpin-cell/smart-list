import { useState, useRef } from 'react'
import { ChevronDown, ChevronRight, FolderOpen, Folder, Trash2, Pencil, Check, X, GripVertical } from 'lucide-react'
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import ItemRow from './ItemRow'

function SortableItemRow({ item, onToggle, onDelete, onFavorite, onEdit }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center group/drag">
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="pl-4 pr-1 py-3 text-gray-200 hover:text-gray-400 cursor-grab active:cursor-grabbing touch-none flex-shrink-0 opacity-0 group-hover/drag:opacity-100 transition-opacity"
      >
        <GripVertical size={14} />
      </button>
      <div className="flex-1 min-w-0">
        <ItemRow item={item} onToggle={onToggle} onDelete={onDelete} onFavorite={onFavorite} onEdit={onEdit} indent={false} noLeftPad />
      </div>
    </div>
  )
}

export default function FolderGroup({
  folder, items, dragHandle,
  onToggle, onDelete, onFavorite, onEdit,
  onDeleteFolder, onRenameFolder, onToggleFolderExpand, onReorderItems,
}) {
  const isExpanded = folder.is_expanded !== false
  const [renaming, setRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(folder.name)
  const renameRef = useRef(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  )

  const startRename = (e) => {
    e.stopPropagation()
    setRenameValue(folder.name)
    setRenaming(true)
    setTimeout(() => renameRef.current?.focus(), 0)
  }

  const commitRename = () => {
    if (renameValue.trim() && renameValue.trim() !== folder.name) {
      onRenameFolder(folder.id, renameValue.trim())
    }
    setRenaming(false)
  }

  const handleItemDragEnd = (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex(i => i.id === active.id)
    const newIndex = items.findIndex(i => i.id === over.id)
    const reordered = arrayMove(items, oldIndex, newIndex)
    onReorderItems(reordered.map(i => i.id))
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-1 px-3 py-2.5 bg-gray-50 border-b border-gray-100 group/folder">
        {/* Drag handle for folder reordering */}
        <div {...dragHandle} className="text-gray-200 hover:text-gray-400 cursor-grab active:cursor-grabbing touch-none flex-shrink-0 opacity-0 group-hover/folder:opacity-100 transition-opacity">
          <GripVertical size={14} />
        </div>

        <button onClick={() => onToggleFolderExpand(folder)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
          {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
        </button>
        {isExpanded
          ? <FolderOpen size={15} className="text-amber-500 flex-shrink-0" />
          : <Folder size={15} className="text-amber-500 flex-shrink-0" />
        }

        {renaming ? (
          <form onSubmit={e => { e.preventDefault(); commitRename() }} className="flex items-center gap-1 flex-1 min-w-0">
            <input
              ref={renameRef}
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Escape') setRenaming(false) }}
              onBlur={commitRename}
              dir="auto"
              className="flex-1 min-w-0 text-sm font-medium text-gray-700 bg-white border border-blue-400 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
            <button type="submit" className="p-0.5 text-green-600 hover:text-green-700 flex-shrink-0"><Check size={13} /></button>
            <button type="button" onClick={() => setRenaming(false)} className="p-0.5 text-gray-400 hover:text-gray-600 flex-shrink-0"><X size={13} /></button>
          </form>
        ) : (
          <>
            <span className="font-medium text-gray-700 flex-1 text-sm truncate" dir="auto">{folder.name}</span>
            <button onClick={startRename} className="p-1 text-gray-300 hover:text-blue-500 transition-colors flex-shrink-0 opacity-0 group-hover/folder:opacity-100" title="Rename">
              <Pencil size={12} />
            </button>
          </>
        )}

        <span className="text-xs text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded-full flex-shrink-0">{items.length}</span>
        <button onClick={() => onDeleteFolder(folder.id)} className="p-1 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0" title="Delete folder">
          <Trash2 size={13} />
        </button>
      </div>

      {isExpanded && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleItemDragEnd}>
          <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
            <div className="divide-y divide-gray-50">
              {items.map(item => (
                <SortableItemRow
                  key={item.id}
                  item={item}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onFavorite={onFavorite}
                  onEdit={onEdit}
                />
              ))}
              {items.length === 0 && (
                <div className="px-4 py-3 text-sm text-gray-400 italic text-center">Empty folder</div>
              )}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
