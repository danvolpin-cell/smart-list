import { useState, useEffect, useCallback } from 'react'
import { Menu, ShoppingCart, LogOut, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import Sidebar from './Sidebar'
import ListContent from './ListContent'
import CreateListModal from './modals/CreateListModal'
import JoinListModal from './modals/JoinListModal'
import ShareSnapshotModal from './modals/ShareSnapshotModal'

export default function MainApp({ session }) {
  const [lists, setLists] = useState([])
  const [selectedListId, setSelectedListId] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [showReceiveSnapshot, setShowReceiveSnapshot] = useState(false)

  const user = session.user

  const loadLists = useCallback(async () => {
    const [{ data: owned }, { data: memberships }] = await Promise.all([
      supabase.from('lists').select('*').eq('owner_id', user.id).order('is_personal', { ascending: false }).order('created_at'),
      supabase.from('list_members').select('list_id, lists(*)').eq('user_id', user.id),
    ])

    const memberLists = (memberships || []).map(m => m.lists).filter(Boolean)
    const allLists = [...(owned || []), ...memberLists]
    const unique = allLists.filter((l, i, arr) => arr.findIndex(x => x.id === l.id) === i)

    setLists(unique)
    return unique
  }, [user.id])

  useEffect(() => {
    const init = async () => {
      // Ensure profile exists
      await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email.split('@')[0],
      }, { onConflict: 'id', ignoreDuplicates: true })

      // Ensure personal list exists
      const { data: existing } = await supabase
        .from('lists')
        .select('id')
        .eq('owner_id', user.id)
        .eq('is_personal', true)
        .maybeSingle()

      if (!existing) {
        await supabase.from('lists').insert({
          name: 'Personal',
          is_personal: true,
          owner_id: user.id,
        })
      }

      const allLists = await loadLists()
      const personal = allLists.find(l => l.is_personal)
      if (personal) setSelectedListId(personal.id)
    }
    init()
  }, [user.id, loadLists])

  const handleCreateList = async (name) => {
    const shareCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    const { data, error } = await supabase
      .from('lists')
      .insert({ name, is_personal: false, share_code: shareCode, owner_id: user.id })
      .select()
      .single()

    if (error) { toast.error('Failed to create list'); return }

    // Add owner as member for real-time membership checks
    await supabase.from('list_members').insert({ list_id: data.id, user_id: user.id })

    setShowCreateModal(false)
    await loadLists()
    setSelectedListId(data.id)
    toast.success(`List created! Code: ${shareCode}`)
  }

  const handleJoinList = async (code) => {
    const { data: list, error } = await supabase
      .from('lists')
      .select('*')
      .eq('share_code', code.toUpperCase().trim())
      .maybeSingle()

    if (error || !list) { toast.error('List not found. Check the code.'); return }

    const { data: existing } = await supabase
      .from('list_members')
      .select('list_id')
      .eq('list_id', list.id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (existing) { toast.error('You are already in this list'); return }

    const { error: joinError } = await supabase.from('list_members').insert({ list_id: list.id, user_id: user.id })
    if (joinError) { toast.error('Failed to join list'); return }

    setShowJoinModal(false)
    await loadLists()
    setSelectedListId(list.id)
    toast.success(`Joined "${list.name}"!`)
  }

  const handleSignOut = () => supabase.auth.signOut()

  const selectedList = lists.find(l => l.id === selectedListId)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 lg:hidden">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-blue-600" />
            <span className="font-bold text-blue-600 text-lg">Smart List</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowReceiveSnapshot(true)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
              title="Paste shared list"
            >
              <Download size={18} />
            </button>
            <button onClick={handleSignOut} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500" title="Sign out">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-6xl mx-auto w-full">
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <aside className={`
          fixed top-14 left-0 bottom-0 w-68 bg-white border-r border-gray-200 z-50 transition-transform duration-200
          lg:relative lg:top-0 lg:translate-x-0 lg:flex-shrink-0 lg:w-64
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <Sidebar
            lists={lists}
            selectedListId={selectedListId}
            onSelectList={(id) => { setSelectedListId(id); setSidebarOpen(false) }}
            onCreateList={() => setShowCreateModal(true)}
            onJoinList={() => setShowJoinModal(true)}
          />
        </aside>

        <main className="flex-1 min-w-0 p-4">
          {selectedList ? (
            <ListContent
              key={selectedList.id}
              list={selectedList}
              userId={user.id}
              allLists={lists.filter(l => !l.is_personal && l.id !== selectedList.id)}
              onRefreshLists={loadLists}
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
              Select or create a list to get started
            </div>
          )}
        </main>
      </div>

      {showCreateModal && <CreateListModal onClose={() => setShowCreateModal(false)} onCreate={handleCreateList} />}
      {showJoinModal && <JoinListModal onClose={() => setShowJoinModal(false)} onJoin={handleJoinList} />}
      {showReceiveSnapshot && (
        <ShareSnapshotModal
          onClose={() => setShowReceiveSnapshot(false)}
          userId={user.id}
          targetLists={lists}
          mode="receive"
        />
      )}
    </div>
  )
}
