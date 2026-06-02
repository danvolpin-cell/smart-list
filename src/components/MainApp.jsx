import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import HomeScreen from './HomeScreen'
import ListContent from './ListContent'
import CreateListModal from './modals/CreateListModal'
import JoinListModal from './modals/JoinListModal'
import ShareSnapshotModal from './modals/ShareSnapshotModal'

export default function MainApp({ session }) {
  const [lists, setLists] = useState([])
  const [selectedListId, setSelectedListId] = useState(null)
  const [loading, setLoading] = useState(true)
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
      await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email.split('@')[0],
      }, { onConflict: 'id', ignoreDuplicates: true })

      const { data: existing } = await supabase
        .from('lists').select('id').eq('owner_id', user.id).eq('is_personal', true).maybeSingle()
      if (!existing) {
        await supabase.from('lists').insert({ name: 'Personal', is_personal: true, owner_id: user.id })
      }

      await loadLists()
      setLoading(false)
    }
    init()
  }, [user.id, loadLists])

  const selectList = (id) => {
    setSelectedListId(id)
    localStorage.setItem(`smartlist_last_list_${user.id}`, id)
  }

  const handleCreateList = async (name) => {
    const shareCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    const { data, error } = await supabase
      .from('lists')
      .insert({ name, is_personal: false, share_code: shareCode, owner_id: user.id })
      .select().single()
    if (error) { toast.error('Failed to create list'); return }
    await supabase.from('list_members').insert({ list_id: data.id, user_id: user.id })
    setShowCreateModal(false)
    await loadLists()
    selectList(data.id)
    toast.success(`List created! Code: ${shareCode}`)
  }

  const handleJoinList = async (code) => {
    const { data: list, error } = await supabase
      .from('lists').select('*').eq('share_code', code.toUpperCase().trim()).maybeSingle()
    if (error || !list) { toast.error('List not found. Check the code.'); return }
    const { data: existing } = await supabase
      .from('list_members').select('list_id').eq('list_id', list.id).eq('user_id', user.id).maybeSingle()
    if (existing) { toast.error('You are already in this list'); return }
    const { error: joinError } = await supabase.from('list_members').insert({ list_id: list.id, user_id: user.id })
    if (joinError) { toast.error('Failed to join list'); return }
    setShowJoinModal(false)
    await loadLists()
    selectList(list.id)
    toast.success(`Joined "${list.name}"!`)
  }

  const handleSignOut = () => supabase.auth.signOut()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const selectedList = lists.find(l => l.id === selectedListId)

  // ── Home screen ──────────────────────────────────────────────────────────────
  if (!selectedList) {
    return (
      <>
        <HomeScreen
          session={session}
          lists={lists}
          onSelectList={selectList}
          onCreateList={() => setShowCreateModal(true)}
          onJoinList={() => setShowJoinModal(true)}
          onSignOut={handleSignOut}
        />
        {showCreateModal && <CreateListModal onClose={() => setShowCreateModal(false)} onCreate={handleCreateList} />}
        {showJoinModal && <JoinListModal onClose={() => setShowJoinModal(false)} onJoin={handleJoinList} />}
      </>
    )
  }

  // ── List view ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => setSelectedListId(null)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            title="Back to lists"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-bold text-gray-800 text-lg flex-1 truncate">{selectedList.name}</h1>
          <button
            onClick={() => setShowReceiveSnapshot(true)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
            title="Paste shared list"
          >
            <Download size={18} />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full p-4">
        <ListContent
          key={selectedList.id}
          list={selectedList}
          userId={user.id}
          allLists={lists.filter(l => !l.is_personal && l.id !== selectedList.id)}
          onRefreshLists={loadLists}
        />
      </main>

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
