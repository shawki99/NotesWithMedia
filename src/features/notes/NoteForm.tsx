import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../app/AppNavigator';
import { useNotes, useCreateNote, useUpdateNote } from './hooks';
import { ImagePickerField } from '../../components/ImagePickerField';
import { notesApi } from './api';

type NoteFormRouteProp = RouteProp<RootStackParamList, 'NoteForm'>;
type NoteFormNavigationProp = NativeStackNavigationProp<RootStackParamList, 'NoteForm'>;

export function NoteForm() {
  const navigation = useNavigation<NoteFormNavigationProp>();
  const route = useRoute<NoteFormRouteProp>();
  const { noteId } = route.params || {};
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<{
    uri: string;
    name: string;
    type: string;
  } | undefined>(undefined);

  const { data: notes } = useNotes();
  const createNoteMutation = useCreateNote();
  const updateNoteMutation = useUpdateNote();

  const isEditing = !!noteId;
  const currentNote = notes?.find((note) => note.id === noteId);

  useEffect(() => {
    if (isEditing && currentNote) {
      setTitle(currentNote.title);
      setContent(currentNote.content);
    }
  }, [isEditing, currentNote]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Please fill in both title and content');
      return;
    }

    try {
      if (isEditing) {
        await updateNoteMutation.mutateAsync({
          id: noteId,
          patch: { title: title.trim(), content: content.trim() },
        });
      } else {
        await createNoteMutation.mutateAsync({
          title: title.trim(),
          content: content.trim(),
          image,
        });
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save note. Please try again.');
    }
  };

  const isLoading = createNoteMutation.isPending || updateNoteMutation.isPending;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TextInput
          style={styles.titleInput}
          placeholder="Note title"
          value={title}
          onChangeText={setTitle}
          accessibilityLabel="Note title input"
        />

        <TextInput
          style={styles.contentInput}
          placeholder="Write your note content here..."
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
          accessibilityLabel="Note content input"
        />

        <ImagePickerField
          image={image}
          onImageSelected={setImage}
          onImageRemoved={() => setImage(undefined)}
        />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
          accessibilityLabel="Save note"
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>
              {isEditing ? 'Update' : 'Create'} Note
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    color: '#333',
  },
  contentInput: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    minHeight: 200,
    color: '#333',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
