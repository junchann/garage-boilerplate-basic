'use client'

import { orderBy, where } from 'firebase/firestore'
import { useAuth } from '@/hooks/useAuth'
import { useCollection } from '@/hooks/useFirestore'
import { getNotesCollection } from '@/lib/firebase/firestore'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatDatetime } from '@/lib/utils'

export function NotesList() {
  const { user } = useAuth()
  // onSnapshot subscription, so a new note shows up without a refresh
  const { data: notes, loading } = useCollection(
    getNotesCollection(),
    where('uid', '==', user?.uid ?? ''),
    orderBy('createdAt', 'desc')
  )

  if (loading) return <LoadingSpinner />
  if (notes.length === 0) {
    return <EmptyState title="No notes yet" description="Add your first note above." />
  }

  return (
    <ul className="space-y-2">
      {notes.map((note) => (
        <li
          key={note.id}
          className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-medium">{note.title}</h3>
            <span className="shrink-0 text-xs text-zinc-400">
              {formatDatetime(note.createdAt.toDate())}
            </span>
          </div>
          {note.body && (
            <p className="mt-1 text-sm whitespace-pre-wrap text-zinc-500">{note.body}</p>
          )}
        </li>
      ))}
    </ul>
  )
}
