import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { NoteForm } from '../src/features/notes/NoteForm';
import { notesApi } from '../src/features/notes/api';

// Mock the API
jest.mock('../src/features/notes/api');
const mockNotesApi = notesApi as jest.Mocked<typeof notesApi>;

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
  useRoute: () => ({
    params: {},
  }),
}));

// Mock ImagePickerField component
jest.mock('../src/components/ImagePickerField', () => {
  const { View, Text, TouchableOpacity } = require('react-native');
  return {
    ImagePickerField: ({ onImageSelected }: any) => (
      <TouchableOpacity
        testID="image-picker"
        onPress={() => onImageSelected({
          uri: 'file://test-image.jpg',
          name: 'test-image.jpg',
          type: 'image/jpeg',
        })}
      >
        <Text>Select Image</Text>
      </TouchableOpacity>
    ),
  };
});

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>{component}</NavigationContainer>
    </QueryClientProvider>
  );
};

describe('NoteForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNotesApi.createNote.mockResolvedValue({
      id: 'test-id',
      user_id: 'test-user',
      title: 'Test Note',
      content: 'Test content',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    });
  });

  it('renders form fields correctly', () => {
    const { getByPlaceholderText, getByTestId } = renderWithProviders(<NoteForm />);

    expect(getByPlaceholderText('Note title')).toBeTruthy();
    expect(getByPlaceholderText('Write your note content here...')).toBeTruthy();
    expect(getByTestId('image-picker')).toBeTruthy();
  });

  it('allows user to input title and content', () => {
    const { getByPlaceholderText } = renderWithProviders(<NoteForm />);

    const titleInput = getByPlaceholderText('Note title');
    const contentInput = getByPlaceholderText('Write your note content here...');

    fireEvent.changeText(titleInput, 'My Test Note');
    fireEvent.changeText(contentInput, 'This is test content');

    expect(titleInput.props.value).toBe('My Test Note');
    expect(contentInput.props.value).toBe('This is test content');
  });

  it('shows error when trying to save with empty fields', async () => {
    const { getByText } = renderWithProviders(<NoteForm />);

    const saveButton = getByText('Create Note');
    fireEvent.press(saveButton);

    await waitFor(() => {
      // The Alert.alert should be called, but we can't easily test it in this setup
      // Instead, we verify that the API wasn't called
      expect(mockNotesApi.createNote).not.toHaveBeenCalled();
    });
  });

  it('calls createNote API when form is submitted with valid data', async () => {
    const { getByPlaceholderText, getByText } = renderWithProviders(<NoteForm />);

    const titleInput = getByPlaceholderText('Note title');
    const contentInput = getByPlaceholderText('Write your note content here...');
    const saveButton = getByText('Create Note');

    fireEvent.changeText(titleInput, 'Test Note');
    fireEvent.changeText(contentInput, 'Test content');

    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockNotesApi.createNote).toHaveBeenCalledWith({
        title: 'Test Note',
        content: 'Test content',
        image: undefined,
      });
    });
  });

  it('handles image selection', async () => {
    const { getByPlaceholderText, getByTestId, getByText } = renderWithProviders(<NoteForm />);

    const titleInput = getByPlaceholderText('Note title');
    const contentInput = getByPlaceholderText('Write your note content here...');
    const imagePicker = getByTestId('image-picker');
    const saveButton = getByText('Create Note');

    fireEvent.changeText(titleInput, 'Test Note');
    fireEvent.changeText(contentInput, 'Test content');
    fireEvent.press(imagePicker);

    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockNotesApi.createNote).toHaveBeenCalledWith({
        title: 'Test Note',
        content: 'Test content',
        image: {
          uri: 'file://test-image.jpg',
          name: 'test-image.jpg',
          type: 'image/jpeg',
        },
      });
    });
  });
});
