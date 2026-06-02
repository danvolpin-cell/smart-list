import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { supabase } from './lib/supabase'
import AuthPage from './components/Auth/AuthPage'
import MainApp from './components/MainApp'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    )
  }

  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      {session ? <MainApp session={session} /> : <AuthPage />}
    </>
  )
}
