import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { supabase, isSupabaseConfigured } from './src/lib/supabase';
import { TabNavigator } from './src/navigation/TabNavigator';
import { AuthScreen } from './src/screens/AuthScreen';
import { DemoProvider } from './src/context/DemoContext';
import { Session } from '@supabase/supabase-js';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    // If Supabase is not configured, show demo mode option
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  // Show demo mode option if Supabase is not configured
  if (!isSupabaseConfigured() && !demoMode) {
    return (
      <SafeAreaProvider>
        <View style={styles.demoContainer}>
          <Text style={styles.demoTitle}>🎭 MoodSync</Text>
          <Text style={styles.demoSubtitle}>Demo Mode</Text>
          <Text style={styles.demoText}>
            Supabase ist nicht konfiguriert.{'\n'}
            Starte den Demo-Modus um die App zu erkunden!
          </Text>
          <TouchableOpacity
            style={styles.demoButton}
            onPress={() => setDemoMode(true)}
          >
            <Text style={styles.demoButtonText}>Demo starten</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <DemoProvider initialDemoMode={demoMode}>
      <SafeAreaProvider>
        <NavigationContainer>
          <View style={styles.container}>
            <StatusBar style="dark" />
            {session || demoMode ? <TabNavigator /> : <AuthScreen />}
          </View>
        </NavigationContainer>
      </SafeAreaProvider>
    </DemoProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  demoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f3ff',
    padding: 20,
  },
  demoTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginBottom: 8,
  },
  demoSubtitle: {
    fontSize: 18,
    color: '#a78bfa',
    marginBottom: 32,
  },
  demoText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  demoButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  demoButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
