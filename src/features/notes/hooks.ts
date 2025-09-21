import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notesApi } from './api';
import { Note, CreateNoteData, UpdateNoteData } from './types';

export function useNotes() {
  return useQuery({
    queryKey: ['notes'],
    queryFn: notesApi.listNotes,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notesApi.createNote,
    onMutate: async (newNote) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['notes'] });

      // Snapshot the previous value
      const previousNotes = queryClient.getQueryData<Note[]>(['notes']);

      // Optimistically update to the new value
      const optimisticNote: Note = {
        id: `optimistic-${Date.now()}`,
        user_id: 'temp-user-id',
        title: newNote.title,
        content: newNote.content,
        image_path: newNote.image ? 'temp-image-path' : undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      queryClient.setQueryData<Note[]>(['notes'], (old = []) => [optimisticNote, ...old]);

      return { previousNotes };
    },
    onError: (err, newNote, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousNotes) {
        queryClient.setQueryData(['notes'], context.previousNotes);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateNoteData }) =>
      notesApi.updateNote(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notesApi.deleteNote,
    onMutate: async (noteToDelete) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['notes'] });

      // Snapshot the previous value
      const previousNotes = queryClient.getQueryData<Note[]>(['notes']);

      // Optimistically update to remove the note
      queryClient.setQueryData<Note[]>(
        ['notes'],
        (old = []) => old.filter((note) => note.id !== noteToDelete.id)
      );

      return { previousNotes };
    },
    onError: (err, noteToDelete, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousNotes) {
        queryClient.setQueryData(['notes'], context.previousNotes);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}
