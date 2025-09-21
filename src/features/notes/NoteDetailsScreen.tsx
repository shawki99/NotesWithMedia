import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../app/AppNavigator';
import { useNotes, useDeleteNote } from './hooks';
import { ErrorView } from '../../components/ErrorView';
import { notesApi } from './api';

type NoteDetailsRouteProp = RouteProp<RootStackParamList, 'NoteDetails'>;
type NoteDetailsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'NoteDetails'>;

export function NoteDetailsScreen() {
  const navigation = useNavigation<NoteDetailsNavigationProp>();
  const route = useRoute<NoteDetailsRouteProp>();
  const { noteId } = route.params;

  const { data: notes, isLoading } = useNotes();
  const deleteNoteMutation = useDeleteNote();

  const [imageUri, setImageUri] = useState<string | null>(null);

  const note = notes?.find((n) => n.id === noteId);

  React.useEffect(() => {
    if (note?.image_path) {
      notesApi.getSignedUrl(note.image_path)
        .then(setImageUri)
        .catch(() => setImageUri(null));
    }
  }, [note?.image_path]);

  const handleEdit = () => {
    navigation.navigate('NoteForm', { noteId });
  };

  const handleDelete = () => {
    if (!note) return;

    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNoteMutation.mutateAsync(note);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete note. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading note...</Text>
      </View>
    );
  }

  if (!note) {
    return (
      <ErrorView
        message="Note not found. It may have been deleted."
        onRetry={() => navigation.goBack()}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEdit}
            accessibilityLabel="Edit note"
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.deleteButton,
              deleteNoteMutation.isPending && styles.buttonDisabled,
            ]}
            onPress={handleDelete}
            disabled={deleteNoteMutation.isPending}
            accessibilityLabel="Delete note"
          >
            {deleteNoteMutation.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.deleteButtonText}>Delete</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{note.title}</Text>
        
        {imageUri && (
          <Image source={{ uri: imageUri }} style={styles.image} />
        )}
        
        <Text style={styles.content}>{note.content}</Text>
        
        <Text style={styles.date}>
          Created: {new Date(note.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
        
        {note.updated_at !== note.created_at && (
          <Text style={styles.date}>
            Updated: {new Date(note.updated_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    lineHeight: 34,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: '#f0f0f0',
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 20,
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
});
