export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  image_path?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteData {
  title: string;
  content: string;
  image?: {
    uri: string;
    name: string;
    type: string;
  };
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
}
