import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../features/auth/AuthProvider';
import { LoginScreen } from '../features/auth/LoginScreen';
import { SignupScreen } from '../features/auth/SignupScreen';
import { NotesListScreen } from '../features/notes/NotesListScreen';
import { NoteDetailsScreen } from '../features/notes/NoteDetailsScreen';
import { NoteForm } from '../features/notes/NoteForm';

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  NotesList: undefined;
  NoteDetails: { noteId: string };
  NoteForm: { noteId?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { session, loading } = useAuth();

  if (loading) {
    return null; // You might want to show a loading screen here
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          // Authenticated stack
          <>
            <Stack.Screen name="NotesList" component={NotesListScreen} />
            <Stack.Screen name="NoteDetails" component={NoteDetailsScreen} />
            <Stack.Screen name="NoteForm" component={NoteForm} />
          </>
        ) : (
          // Unauthenticated stack
          <>
            <Stack.Screen name="Login">
              {(props) => (
                <LoginScreen
                  {...props}
                  onNavigateToSignup={() => props.navigation.navigate('Signup')}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Signup">
              {(props) => (
                <SignupScreen
                  {...props}
                  onNavigateToLogin={() => props.navigation.navigate('Login')}
                />
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
