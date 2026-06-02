import { useState } from 'react'
import { CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react'
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import FolderGroup from './FolderGroup'
import ItemRow from './ItemRow'

function SortableFolderGroup({ folder, items, onToggle, onDelete, onFavorite, onEdit, onDeleteFolder, onRenameFolder, onToggleFolderExpand, onReorderItems }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: folder.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1, zIndex: isDragging ? 50 : undefined }

  return (
    <div ref={setNodeRef} style={style}>
      <FolderGroup
        folder={folder}
        items={items}
        dragHandle={{ ...attributes, ...listeners }}
        onToggle={onToggle}
        onDelete={onDelete}
        onFavorite={onFavorite}
        onEdit={onEdit}
        onDeleteFolder={onDeleteFolder}
        onRenameFolder={onRenameFolder}
        onToggleFolderExpand={onToggleFolderExpand}
        onReorderItems={onReorderItems}
      />
    </div>
  )
}

export default function ItemList({
  items, folders, onToggle, onDelete, onFavorite, onEdit,
  onDeleteFolder, onRenameFolder, onToggleFolderExpand,
  onReorderFolders, onReorderItems, onCheckAll, onUncheckAll,
}) {
  const [purchasedOpen, setPurchasedOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  )

  const unpurchased = items.filter(i => !i.is_purchased)
  const purchased = items.filter(i => i.is_purchased)
  const bareItems = unpurchased.filter(i => !i.folder_id)

  const handleFolderDragEnd = (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = folders.findIndex(f => f.id === active.id)
    const newIndex = folders.findIndex(f => f.id === over.id)
    onReorderFolders(arrayMove(folders, oldIndex, newIndex).map(f => f.id))
  }

  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-700 text-sm">
            Shopping List <span className="text-gray-400 font-normal">({unpurchased.length})</span>
          </h3>
          {unpurchased.length > 0 && (
            <button onClick={onCheckAll} className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium">
              <CheckCircle2 size={13} />
              Check All
            </button>
          )}
        </div>

        <div className="space-y-2">
          {bareItems.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50 overflow-hidden">
              {bareItems.map(item => (
                <ItemRow key={item.id} item={item} onToggle={onToggle} onDelete={onDelete} onFavorite={onFavorite} onEdit={onEdit} />
              ))}
            </div>
          )}

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleFolderDragEnd}>
            <SortableContext items={folders.map(f => f.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {folders.map(folder => {
                  const folderItems = unpurchased.filter(i => i.folder_id === folder.id)
                  if (folderItems.length === 0 && !folder.is_expanded) return null
                  return (
                    <SortableFolderGroup
                      key={folder.id}
                      folder={folder}
                      items={folderItems}
                      onToggle={onToggle}
                      onDelete={onDelete}
                      onFavorite={onFavorite}
                      onEdit={onEdit}
                      onDeleteFolder={onDeleteFolder}
                      onRenameFolder={onRenameFolder}
                      onToggleFolderExpand={onToggleFolderExpand}
                      onReorderItems={onReorderItems}
                    />
                  )
                })}
              </div>
            </SortableContext>
          </DndContext>

          {unpurchased.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm bg-white rounded-xl border border-gray-100">
              No items yet. Add something above!
            </div>
          )}
        </div>
      </div>

      {purchased.length > 0 && (
        <div>
          <button
            onClick={() => setPurchasedOpen(o => !o)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-gray-600 transition-colors mb-2 w-full text-left"
          >
            {purchasedOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            Purchased <span className="font-normal">({purchased.length})</span>
            {purchasedOpen && (
              <button
                onClick={e => { e.stopPropagation(); onUncheckAll() }}
                className="ml-auto text-xs text-blue-500 hover:text-blue-700 font-medium"
              >
                Uncheck All
              </button>
            )}
          </button>
          {purchasedOpen && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50 overflow-hidden">
              {purchased.map(item => (
                <ItemRow key={item.id} item={item} onToggle={onToggle} onDelete={onDelete} onFavorite={onFavorite} onEdit={onEdit} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
