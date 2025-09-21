import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../app/AppNavigator';
import { useAuth } from '../auth/AuthProvider';
import { useNotes } from './hooks';
import { EmptyState } from '../../components/EmptyState';
import { ErrorView } from '../../components/ErrorView';
import { notesApi } from './api';

type NotesListNavigationProp = NativeStackNavigationProp<RootStackParamList, 'NotesList'>;

interface NoteItemProps {
  note: {
    id: string;
    title: string;
    content: string;
    image_path?: string;
    created_at: string;
  };
  onPress: () => void;
}

function NoteItem({ note, onPress }: NoteItemProps) {
  const [imageUri, setImageUri] = useState<string | null>(null);

  React.useEffect(() => {
    if (note.image_path) {
      notesApi.getSignedUrl(note.image_path)
        .then(setImageUri)
        .catch(() => setImageUri(null));
    }
  }, [note.image_path]);

  return (
    <TouchableOpacity style={styles.noteItem} onPress={onPress}>
      <View style={styles.noteContent}>
        <Text style={styles.noteTitle} numberOfLines={2}>
          {note.title}
        </Text>
        <Text style={styles.notePreview} numberOfLines={3}>
          {note.content}
        </Text>
        <Text style={styles.noteDate}>
          {new Date(note.created_at).toLocaleDateString()}
        </Text>
      </View>
      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.thumbnail} />
      )}
    </TouchableOpacity>
  );
}

export function NotesListScreen() {
  const navigation = useNavigation<NotesListNavigationProp>();
  const { signOut } = useAuth();
  const { data: notes, isLoading, error, refetch } = useNotes();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const handleCreateNote = () => {
    navigation.navigate('NoteForm', {});
  };

  const handleNotePress = (noteId: string) => {
    navigation.navigate('NoteDetails', { noteId });
  };

  if (error) {
    return (
      <ErrorView
        message="Failed to load notes. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    );
  }

  if (!isLoading && (!notes || notes.length === 0)) {
    return (
      <EmptyState
        message="You haven't created any notes yet. Start by creating your first note!"
        buttonText="Create Note"
        onButtonPress={handleCreateNote}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Notes</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.newButton}
            onPress={handleCreateNote}
            accessibilityLabel="Create new note"
          >
            <Text style={styles.newButtonText}>New</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
            accessibilityLabel="Sign out"
          >
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NoteItem
            note={item}
            onPress={() => handleNotePress(item.id)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  newButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  newButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  noteItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  noteContent: {
    flex: 1,
    marginRight: 12,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  notePreview: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 12,
    color: '#999',
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
});
