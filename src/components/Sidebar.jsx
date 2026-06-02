import { Home, Users, Plus, LogIn } from 'lucide-react'

export default function Sidebar({ lists, selectedListId, onSelectList, onCreateList, onJoinList }) {
  const personalList = lists.find(l => l.is_personal)
  const sharedLists = lists.filter(l => !l.is_personal)

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <div className="p-4 flex-1">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">My Lists</p>

        {personalList && (
          <ListButton
            label="Personal"
            sub="Just for you"
            icon={<Home size={15} />}
            iconBg="bg-blue-100 text-blue-600"
            selected={selectedListId === personalList.id}
            onClick={() => onSelectList(personalList.id)}
          />
        )}

        {sharedLists.length > 0 && (
          <>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-5 mb-2 px-1">Shared Lists</p>
            {sharedLists.map(list => (
              <ListButton
                key={list.id}
                label={list.name}
                sub={`Code: ${list.share_code}`}
                icon={<Users size={15} />}
                iconBg="bg-purple-100 text-purple-600"
                selected={selectedListId === list.id}
                onClick={() => onSelectList(list.id)}
              />
            ))}
          </>
        )}
      </div>

      <div className="p-4 border-t border-gray-100 space-y-2">
        <button
          onClick={onCreateList}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg border border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors text-sm"
        >
          <Plus size={15} />
          Create New List
        </button>
        <button
          onClick={onJoinList}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg border border-dashed border-gray-300 text-gray-500 hover:border-purple-400 hover:text-purple-600 transition-colors text-sm"
        >
          <LogIn size={15} />
          Join Existing List
        </button>
      </div>
    </div>
  )
}

function ListButton({ label, sub, icon, iconBg, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl mb-1 text-left transition-colors ${
        selected ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'
      }`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${selected ? 'bg-blue-100 text-blue-600' : iconBg}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="font-medium text-sm truncate">{label}</div>
        <div className="text-xs text-gray-400">{sub}</div>
      </div>
    </button>
  )
}
