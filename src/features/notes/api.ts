import { supabase } from '../../lib/supabase';
import { Note, CreateNoteData, UpdateNoteData } from './types';

export const notesApi = {
  async listNotes(): Promise<Note[]> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch notes: ${error.message}`);
    }

    return data || [];
  },

  async createNote({ title, content, image }: CreateNoteData): Promise<Note> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Insert the note first
    const { data: noteData, error: insertError } = await supabase
      .from('notes')
      .insert({
        user_id: user.id,
        title,
        content,
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to create note: ${insertError.message}`);
    }

    // If image is provided, upload it
    if (image && noteData) {
      const fileExt = image.name.split('.').pop();
      const fileName = `${user.id}/${noteData.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from(process.env.EXPO_PUBLIC_SUPABASE_BUCKET!)
        .upload(fileName, {
          uri: image.uri,
          type: image.type,
          name: image.name,
        } as any);

      if (uploadError) {
        throw new Error(`Failed to upload image: ${uploadError.message}`);
      }

      // Update the note with the image path
      const { data: updatedNote, error: updateError } = await supabase
        .from('notes')
        .update({ image_path: fileName })
        .eq('id', noteData.id)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to update note with image: ${updateError.message}`);
      }

      return updatedNote;
    }

    return noteData;
  },

  async updateNote(id: string, patch: UpdateNoteData): Promise<Note> {
    const { data, error } = await supabase
      .from('notes')
      .update(patch)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update note: ${error.message}`);
    }

    return data;
  },

  async deleteNote(note: Note): Promise<void> {
    // If note has an image, delete it from storage first
    if (note.image_path) {
      const { error: storageError } = await supabase.storage
        .from(process.env.EXPO_PUBLIC_SUPABASE_BUCKET!)
        .remove([note.image_path]);

      if (storageError) {
        console.warn('Failed to delete image from storage:', storageError.message);
      }
    }

    // Delete the note
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', note.id);

    if (error) {
      throw new Error(`Failed to delete note: ${error.message}`);
    }
  },

  async getSignedUrl(imagePath: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from(process.env.EXPO_PUBLIC_SUPABASE_BUCKET!)
      .createSignedUrl(imagePath, 600); // 10 minutes

    if (error) {
      throw new Error(`Failed to get signed URL: ${error.message}`);
    }

    return data.signedUrl;
  },
};
