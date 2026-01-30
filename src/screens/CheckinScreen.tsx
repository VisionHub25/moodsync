import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { EmojiPicker } from '../components/EmojiPicker';
import { TagSelector } from '../components/TagSelector';
import { StreakFlame } from '../components/StreakFlame';
import { useCheckin } from '../hooks/useCheckin';
import { useStreak } from '../hooks/useStreak';
import { MoodEmoji, MoodTagId } from '../constants/tags';

export function CheckinScreen() {
  const [selectedEmoji, setSelectedEmoji] = useState<MoodEmoji | null>(null);
  const [sentimentScore, setSentimentScore] = useState(0.5);
  const [selectedTags, setSelectedTags] = useState<MoodTagId[]>([]);
  const [note, setNote] = useState('');

  const { isLoading, error, submitCheckin, todayCheckin, fetchTodayCheckin } = useCheckin();
  const { streak, refresh: refreshStreak } = useStreak();

  useEffect(() => {
    fetchTodayCheckin();
  }, []);

  const handleEmojiSelect = (emoji: MoodEmoji, score: number) => {
    setSelectedEmoji(emoji);
    setSentimentScore(score);
  };

  const handleTagToggle = (tagId: MoodTagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((t) => t !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSubmit = async () => {
    if (!selectedEmoji) {
      Alert.alert('Oops', 'Bitte wähle einen Emoji aus!');
      return;
    }

    const result = await submitCheckin({
      emoji: selectedEmoji,
      sentimentScore,
      tags: selectedTags,
      note, // Stored locally only
    });

    if (result) {
      Alert.alert('✨ Eingecheckt!', 'Dein Mood wurde gespeichert.');
      refreshStreak();
      // Reset form
      setSelectedEmoji(null);
      setSelectedTags([]);
      setNote('');
    }
  };

  // Already checked in today
  if (todayCheckin) {
    return (
      <View style={styles.container}>
        <View style={styles.checkedInContainer}>
          <Text style={styles.checkedInEmoji}>{todayCheckin.emoji}</Text>
          <Text style={styles.checkedInText}>
            Du hast heute schon eingecheckt!
          </Text>
          <StreakFlame streak={streak?.current_streak || 0} />
          <Text style={styles.comeBackText}>Komm morgen wieder 💜</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Streak Display */}
        <StreakFlame streak={streak?.current_streak || 0} />

        {/* Emoji Picker */}
        <EmojiPicker selected={selectedEmoji} onSelect={handleEmojiSelect} />

        {/* Tag Selector */}
        <TagSelector selected={selectedTags} onToggle={handleTagToggle} />

        {/* Optional Note */}
        <View style={styles.noteContainer}>
          <Text style={styles.noteLabel}>
            Möchtest du noch etwas notieren? (bleibt lokal)
          </Text>
          <TextInput
            style={styles.noteInput}
            placeholder="Was beschäftigt dich heute..."
            value={note}
            onChangeText={setNote}
            multiline
            maxLength={280}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{note.length}/280</Text>
        </View>

        {/* Error Display */}
        {error && <Text style={styles.error}>{error}</Text>}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, !selectedEmoji && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading || !selectedEmoji}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Einchecken ✨</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  checkedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  checkedInEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  checkedInText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 24,
    textAlign: 'center',
  },
  comeBackText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  noteContainer: {
    padding: 16,
  },
  noteLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  noteInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  charCount: {
    textAlign: 'right',
    color: '#999',
    fontSize: 12,
    marginTop: 4,
  },
  error: {
    color: '#dc2626',
    textAlign: 'center',
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  submitButton: {
    backgroundColor: '#7c3aed',
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#c4b5fd',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
