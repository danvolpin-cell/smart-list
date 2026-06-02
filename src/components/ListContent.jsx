import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import ListHeader from './ListHeader'
import AddItemForm from './AddItemForm'
import AddFolderForm from './AddFolderForm'
import ItemList from './ItemList'
import SearchBar from './SearchBar'
import MembersModal from './modals/MembersModal'
import ShareSnapshotModal from './modals/ShareSnapshotModal'
import EditItemModal from './modals/EditItemModal'

export default function ListContent({ list, userId, allLists, onRefreshLists }) {
  const [items, setItems] = useState([])
  const [folders, setFolders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showMembers, setShowMembers] = useState(false)
  const [showSnapshot, setShowSnapshot] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const channelRef = useRef(null)
  const mountedRef = useRef(true)

  const loadData = async () => {
    const [{ data: itemsData }, { data: foldersData }] = await Promise.all([
      supabase.from('items').select('*').eq('list_id', list.id).order('sort_order').order('created_at'),
      supabase.from('folders').select('*').eq('list_id', list.id).order('sort_order').order('created_at'),
    ])
    if (!mountedRef.current) return
    setItems(itemsData || [])
    setFolders(foldersData || [])
    setLoading(false)
  }

  useEffect(() => {
    mountedRef.current = true
    setLoading(true)
    loadData()

    if (!list.is_personal) {
      channelRef.current = supabase
        .channel(`list-${list.id}-${Date.now()}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'items', filter: `list_id=eq.${list.id}` }, loadData)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'folders', filter: `list_id=eq.${list.id}` }, loadData)
        .subscribe()
    }

    return () => {
      mountedRef.current = false
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [list.id])

  const addItem = async ({ name, quantity, folderId }) => {
    const { error } = await supabase.from('items').insert({
      list_id: list.id,
      folder_id: folderId || null,
      name: name.trim(),
      quantity: quantity?.trim() || '1',
    })
    if (error) { toast.error('Failed to add item'); return }
    loadData()
  }

  const addFolder = async (name) => {
    const { error } = await supabase.from('folders').insert({ list_id: list.id, name: name.trim() })
    if (error) { toast.error('Failed to add folder'); return }
    loadData()
  }

  const toggleItem = async (item) => {
    const { error } = await supabase.from('items')
      .update({ is_purchased: !item.is_purchased, updated_at: new Date().toISOString() })
      .eq('id', item.id)
    if (error) toast.error('Failed to update item')
    else loadData()
  }

  const deleteItem = async (itemId) => {
    const { error } = await supabase.from('items').delete().eq('id', itemId)
    if (error) toast.error('Failed to delete item')
    else loadData()
  }

  const toggleFavorite = async (item) => {
    await supabase.from('items').update({ is_favorite: !item.is_favorite }).eq('id', item.id)
    loadData()
  }

  const deleteFolder = async (folderId) => {
    await supabase.from('items').update({ folder_id: null }).eq('folder_id', folderId)
    const { error } = await supabase.from('folders').delete().eq('id', folderId)
    if (error) toast.error('Failed to delete folder')
    else loadData()
  }

  const renameFolder = async (folderId, name) => {
    const { error } = await supabase.from('folders').update({ name: name.trim() }).eq('id', folderId)
    if (error) toast.error('Failed to rename folder')
    else loadData()
  }

  const reorderFolders = async (orderedIds) => {
    setFolders(prev => orderedIds.map(id => prev.find(f => f.id === id)).filter(Boolean))
    await Promise.all(
      orderedIds.map((id, i) => supabase.from('folders').update({ sort_order: i }).eq('id', id))
    )
  }

  const reorderItems = async (orderedIds) => {
    setItems(prev => {
      const updated = [...prev]
      orderedIds.forEach((id, i) => {
        const idx = updated.findIndex(it => it.id === id)
        if (idx !== -1) updated[idx] = { ...updated[idx], sort_order: i }
      })
      return updated
    })
    await Promise.all(
      orderedIds.map((id, i) => supabase.from('items').update({ sort_order: i }).eq('id', id))
    )
  }

  const toggleFolderExpand = async (folder) => {
    setFolders(prev => prev.map(f => f.id === folder.id ? { ...f, is_expanded: !f.is_expanded } : f))
    await supabase.from('folders').update({ is_expanded: !folder.is_expanded }).eq('id', folder.id)
  }

  const updateItem = async (id, updates) => {
    const { error } = await supabase.from('items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) { toast.error('Failed to update item'); return }
    loadData()
    setEditItem(null)
  }

  const scrollToItem = (item) => {
    setTimeout(() => {
      const el = document.getElementById(`item-${item.id}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 50)
  }

  const checkAll = async () => {
    const unchecked = items.filter(i => !i.is_purchased).map(i => i.id)
    if (!unchecked.length) return
    await supabase.from('items').update({ is_purchased: true }).in('id', unchecked)
    loadData()
  }

  const uncheckAll = async () => {
    const checked = items.filter(i => i.is_purchased).map(i => i.id)
    if (!checked.length) return
    await supabase.from('items').update({ is_purchased: false }).in('id', checked)
    loadData()
  }

  const handleDeleteList = async () => {
    if (!confirm(`Delete "${list.name}"? This will remove all items and folders. Cannot be undone.`)) return
    const { error } = await supabase.from('lists').delete().eq('id', list.id)
    if (error) { toast.error('Failed to delete list'); return }
    toast.success('List deleted')
    onRefreshLists()
  }

  const handleLeaveList = async () => {
    if (!confirm(`Leave "${list.name}"?`)) return
    await supabase.from('list_members').delete().eq('list_id', list.id).eq('user_id', userId)
    toast.success('Left list')
    onRefreshLists()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading...</div>
    )
  }

  const isOwner = list.owner_id === userId

  return (
    <div className="space-y-4 pb-8">
      {!list.is_personal && (
        <ListHeader
          list={list}
          isOwner={isOwner}
          onShowMembers={() => setShowMembers(true)}
          onShareSnapshot={() => setShowSnapshot(true)}
          onDeleteList={handleDeleteList}
          onLeaveList={handleLeaveList}
        />
      )}

      {list.is_personal && (
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Personal List</h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Private</span>
        </div>
      )}

      <SearchBar items={items} folders={folders} onAdd={addItem} onScrollToItem={scrollToItem} />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
        <AddItemForm folders={folders} onAdd={addItem} />
        <div className="border-t border-gray-100 pt-3">
          <AddFolderForm onAdd={addFolder} />
        </div>
      </div>

      <ItemList
        items={items}
        folders={folders}
        onToggle={toggleItem}
        onDelete={deleteItem}
        onFavorite={toggleFavorite}
        onEdit={setEditItem}
        onDeleteFolder={deleteFolder}
        onRenameFolder={renameFolder}
        onToggleFolderExpand={toggleFolderExpand}
        onReorderFolders={reorderFolders}
        onReorderItems={reorderItems}
        onCheckAll={checkAll}
        onUncheckAll={uncheckAll}
      />

      {showMembers && (
        <MembersModal list={list} userId={userId} onClose={() => setShowMembers(false)} />
      )}

      {showSnapshot && (
        <ShareSnapshotModal
          onClose={() => setShowSnapshot(false)}
          userId={userId}
          targetLists={allLists}
          items={items}
          folders={folders}
          listName={list.name}
          mode="send"
        />
      )}

      {editItem && (
        <EditItemModal
          item={editItem}
          folders={folders}
          onClose={() => setEditItem(null)}
          onSave={updateItem}
        />
      )}
    </div>
  )
}
