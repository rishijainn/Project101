import React from 'react';
import { StatusBar } from 'react-native';
import { AuthProvider } from './AuthProvider';
import AppContent from './AppContent';

const App = () => {
  return (
    <AuthProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AppContent />
    </AuthProvider>
  );
};

export default App;