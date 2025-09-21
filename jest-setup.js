import '@testing-library/jest-native/extend-expect';

// Mock expo modules
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'Images',
  },
  ImagePickerResult: {
    canceled: false,
    assets: [
      {
        uri: 'file://test-image.jpg',
        name: 'test-image.jpg',
        type: 'image/jpeg',
      },
    ],
  },
}));

// Mock react-native-url-polyfill
jest.mock('react-native-url-polyfill/auto', () => {});

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(),
    storage: {
      from: jest.fn(),
    },
  })),
}));
