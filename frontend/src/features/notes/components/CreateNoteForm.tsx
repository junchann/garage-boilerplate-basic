'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createNote } from '@/features/notes/actions/notes.actions'

// same shape as the server action's schema, so bad input gets caught before
// it even leaves the browser
const createNoteFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  body: z.string().max(10_000, 'Note is too long'),
})

type CreateNoteFormInput = z.infer<typeof createNoteFormSchema>

export function CreateNoteForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateNoteFormInput>({
    resolver: zodResolver(createNoteFormSchema),
  })

  const onSubmit = async (data: CreateNoteFormInput) => {
    const result = await createNote(data)
    if (result.success) {
      toast.success('Note created')
      reset()
    } else {
      toast.error(result.error ?? 'Failed to create note')
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="space-y-1.5">
        <label htmlFor="title" className="text-sm font-medium">
          Title
        </label>
        <input
          id="title"
          type="text"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'title-error' : undefined}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-500 focus:outline-none aria-invalid:border-red-500 dark:border-zinc-700 dark:bg-zinc-900"
          placeholder="Note title"
          {...register('title')}
        />
        {errors.title && (
          <p id="title-error" className="text-xs text-red-500" role="alert">
            {errors.title.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="body" className="text-sm font-medium">
          Body
        </label>
        <textarea
          id="body"
          rows={3}
          aria-invalid={!!errors.body}
          aria-describedby={errors.body ? 'body-error' : undefined}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-500 focus:outline-none aria-invalid:border-red-500 dark:border-zinc-700 dark:bg-zinc-900"
          placeholder="Write something…"
          {...register('body')}
        />
        {errors.body && (
          <p id="body-error" className="text-xs text-red-500" role="alert">
            {errors.body.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-black px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        {isSubmitting ? 'Saving…' : 'Add note'}
      </button>
    </form>
  )
}
