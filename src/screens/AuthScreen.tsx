import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { supabase } from '../lib/supabase';

export function AuthScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleLogin = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Oops', 'Bitte gib eine gültige E-Mail-Adresse ein.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'moodsync://auth-callback',
      },
    });

    setLoading(false);

    if (error) {
      Alert.alert('Fehler', error.message);
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <View style={styles.container}>
        <Text style={styles.emoji}>📬</Text>
        <Text style={styles.title}>Check deine E-Mails!</Text>
        <Text style={styles.subtitle}>
          Wir haben dir einen Magic Link an{'\n'}
          <Text style={styles.emailHighlight}>{email}</Text>{'\n'}
          geschickt.
        </Text>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setSent(false)}
        >
          <Text style={styles.secondaryButtonText}>Andere E-Mail verwenden</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.logo}>🌈</Text>
      <Text style={styles.title}>MoodSync</Text>
      <Text style={styles.subtitle}>
        Verstehe deine Stimmungen.{'\n'}Verbinde dich mit anderen.
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="deine@email.de"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Magic Link senden ✨</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>
        Kein Passwort nötig – wir senden dir{'\n'}einen sicheren Login-Link.
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#fff',
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
  },
  emailHighlight: {
    fontWeight: '600',
    color: '#7c3aed',
  },
  inputContainer: {
    width: '100%',
    gap: 16,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  button: {
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#c4b5fd',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    marginTop: 24,
    padding: 12,
  },
  secondaryButtonText: {
    color: '#7c3aed',
    fontSize: 16,
  },
  footer: {
    marginTop: 48,
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
});
