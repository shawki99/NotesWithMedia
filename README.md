# Visual Notes

A production-ready React Native app built with Expo, TypeScript, Supabase, and React Query for managing notes with optional image attachments.

Kindly find the demo  video attached at the end of this documentation

## Features

- 🔐 **Authentication**: Email/password authentication with Supabase Auth
- 📝 **Notes Management**: Create, read, update, and delete notes
- 🖼️ **Image Support**: Attach images to notes with automatic thumbnail generation
- ⚡ **Optimistic Updates**: Instant UI updates with React Query
- 🔒 **Row Level Security**: Users can only access their own notes
- ♿ **Accessibility**: Full accessibility support with proper labels
- 🧪 **Testing**: Component and unit tests included

## Tech Stack

- **Framework**: React Native with Expo SDK 51
- **Language**: TypeScript (strict mode)
- **Navigation**: React Navigation v6
- **State Management**: TanStack React Query v5
- **Backend**: Supabase (Auth + Postgres + Storage)
- **Testing**: React Native Testing Library + Jest

## Prerequisites

- Node.js 18+ 
- Expo CLI
- Supabase account
- iOS Simulator (for iOS development) or Android Studio (for Android development)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd visual-notes
npm install
```

### 2. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL commands below in your Supabase SQL editor
3. Create a storage bucket named \`note-images\` and set it to private
4. Run the storage policies SQL commands below

### 3. Environment Variables

Create a \`.env\` file in the root directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_SUPABASE_BUCKET=note-images
```

### 4. Run the App

```bash
# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run tests
npm test
```

## Database Schema

### Notes Table

```sql
-- Create notes table
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS notes_user_id_created_at_idx 
ON public.notes(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "read own notes" ON public.notes
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "insert own notes" ON public.notes
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "update own notes" ON public.notes
FOR UPDATE USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "delete own notes" ON public.notes
FOR DELETE USING (user_id = auth.uid());
```

### Storage Bucket Policies

```sql
-- Create storage bucket (run in Supabase dashboard)
INSERT INTO storage.buckets (id, name, public) VALUES ('note-images', 'note-images', false);

-- Storage policies for note-images bucket
CREATE POLICY "read own images" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'note-images' AND split_part(name, '/', 1) = auth.uid()::text);

CREATE POLICY "insert own images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'note-images' AND split_part(name, '/', 1) = auth.uid()::text);

CREATE POLICY "update own images" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'note-images' AND split_part(name, '/', 1) = auth.uid()::text)
WITH CHECK (bucket_id = 'note-images' AND split_part(name, '/', 1) = auth.uid()::text);

CREATE POLICY "delete own images" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'note-images' AND split_part(name, '/', 1) = auth.uid()::text);
```

## Project Structure

```
src/
├── app/
│   └── AppNavigator.tsx          # Main navigation setup
├── lib/
│   ├── supabase.ts               # Supabase client configuration
│   └── queryClient.ts            # React Query client setup
├── features/
│   ├── auth/
│   │   ├── AuthProvider.tsx      # Authentication context
│   │   ├── LoginScreen.tsx       # Login screen
│   │   └── SignupScreen.tsx      # Signup screen
│   └── notes/
│       ├── NotesListScreen.tsx   # Notes list view
│       ├── NoteDetailsScreen.tsx # Individual note view
│       ├── NoteForm.tsx          # Create/edit note form
│       ├── api.ts                # Notes API functions
│       ├── hooks.ts              # React Query hooks
│       └── types.ts              # TypeScript types
├── components/
│   ├── ImagePickerField.tsx      # Image selection component
│   ├── EmptyState.tsx            # Empty state component
│   └── ErrorView.tsx             # Error display component
└── utils/
    └── validators.ts             # Utility functions
```

## Key Features Implementation

### Authentication
- Uses Supabase Auth for email/password authentication
- Automatic session management with persistence
- Protected routes with authentication state

### Notes Management
- CRUD operations with optimistic updates
- Image attachment support with signed URLs
- Real-time updates with React Query invalidation

### Image Handling
- Expo Image Picker for image selection
- Automatic upload to Supabase Storage
- Signed URL generation for secure access
- Automatic cleanup on note deletion

### Data Fetching
- React Query for server state management
- Optimistic updates for create/delete operations
- Automatic retry and error handling
- Background refetching and cache management

## Testing

The project includes comprehensive testing setup:

- **Component Tests**: Using React Native Testing Library
- **Unit Tests**: Jest for utility functions
- **Mocking**: Proper mocking of Expo modules and Supabase

Run tests:
```bash
npm test
npm run test:watch
```

## Accessibility

The app follows accessibility best practices:
- Proper accessibility labels on all interactive elements
- Adequate touch target sizes (minimum 44pt)
- Semantic text and clear navigation
- Support for screen readers

## Production Considerations

- Environment variables for configuration
- Proper error boundaries and error handling
- Loading states and user feedback
- Image optimization and caching
- Secure storage policies with RLS
- Optimistic updates for better UX

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## Demo
https://drive.google.com/drive/folders/1tPwSL-Tuj4Re_c41cCqVrNLOzO3jISZo?usp=sharing
