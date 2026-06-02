import { useState, useEffect } from 'react'
import { User, Crown, Trash2 } from 'lucide-react'
import Modal from './Modal'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

export default function MembersModal({ list, userId, onClose }) {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  const loadMembers = async () => {
    const { data } = await supabase
      .from('list_members')
      .select('user_id, joined_at, profiles(id, full_name, email)')
      .eq('list_id', list.id)
      .order('joined_at')

    setMembers(data || [])
    setLoading(false)
  }

  useEffect(() => { loadMembers() }, [list.id])

  const removeMember = async (memberId) => {
    if (memberId === list.owner_id) { toast.error("Can't remove the list owner"); return }
    if (!confirm('Remove this member?')) return
    await supabase.from('list_members').delete().eq('list_id', list.id).eq('user_id', memberId)
    loadMembers()
    toast.success('Member removed')
  }

  const isOwner = list.owner_id === userId

  return (
    <Modal title={`Members — ${list.name}`} onClose={onClose}>
      <div className="mb-3">
        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-1">
          <span>Share code:</span>
          <code className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{list.share_code}</code>
        </div>
        <p className="text-xs text-gray-400">Others can join with this code</p>
      </div>

      {loading ? (
        <div className="text-center py-6 text-gray-400 text-sm">Loading...</div>
      ) : (
        <div className="space-y-2">
          {members.map(({ user_id, joined_at, profiles: profile }) => (
            <div key={user_id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <User size={15} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800 truncate">
                  {profile?.full_name || profile?.email || 'Unknown'}
                  {user_id === list.owner_id && (
                    <span className="ml-1.5 text-xs text-amber-600 font-normal">Owner</span>
                  )}
                  {user_id === userId && (
                    <span className="ml-1.5 text-xs text-blue-600 font-normal">You</span>
                  )}
                </div>
                <div className="text-xs text-gray-400">{profile?.email}</div>
              </div>
              {isOwner && user_id !== list.owner_id && (
                <button
                  onClick={() => removeMember(user_id)}
                  className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                  title="Remove member"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
          {members.length === 0 && (
            <div className="text-center py-4 text-gray-400 text-sm">No members found</div>
          )}
        </div>
      )}
    </Modal>
  )
}
