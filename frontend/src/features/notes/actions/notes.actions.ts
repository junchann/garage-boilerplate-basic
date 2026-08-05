'use server'

import { z } from 'zod'
import { Timestamp } from 'firebase-admin/firestore'
import { adminDb } from '@/lib/firebase/admin'
import { requireAuth } from '@/actions/auth.actions'
import type { ActionResult } from '@/types'

const createNoteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  body: z.string().max(10_000, 'Note is too long'),
})

/**
 * Create a note owned by the signed-in user.
 * The uid comes from the session, never from the caller — otherwise anyone
 * could write a note into someone else's account.
 */
export async function createNote(input: unknown): Promise<ActionResult<string>> {
  const session = await requireAuth()

  const parsed = createNoteSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' }
  }

  try {
    const now = Timestamp.now()
    const ref = await adminDb.collection('notes').add({
      ...parsed.data,
      uid: session.uid,
      createdAt: now,
      updatedAt: now,
      _schemaVersion: 1,
    })
    return { success: true, data: ref.id }
  } catch {
    return { success: false, error: 'Failed to create note' }
  }
}
