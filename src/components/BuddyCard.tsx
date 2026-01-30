import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Profile } from '../lib/supabase';

interface BuddyCardProps {
  profile: Profile;
  todayMood: { emoji: string; score: number } | null;
  onRemove: () => void;
}

export function BuddyCard({ profile, todayMood, onRemove }: BuddyCardProps) {
  const getMoodStatus = () => {
    if (!todayMood) {
      return {
        text: 'Noch nicht eingecheckt',
        color: '#999',
        emoji: '💤',
      };
    }
    
    if (todayMood.score >= 0.7) {
      return { text: 'Geht\'s gut!', color: '#22c55e', emoji: todayMood.emoji };
    }
    if (todayMood.score >= 0.5) {
      return { text: 'Geht so', color: '#f59e0b', emoji: todayMood.emoji };
    }
    return { text: 'Harter Tag', color: '#ef4444', emoji: todayMood.emoji };
  };

  const status = getMoodStatus();
  const displayName = profile.username || 'Anonym';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        {profile.avatar_url ? (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        )}
        <Text style={styles.moodEmoji}>{status.emoji}</Text>
      </View>
      
      <View style={styles.info}>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={[styles.status, { color: status.color }]}>{status.text}</Text>
      </View>

      <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
        <Text style={styles.removeButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

interface BuddyRequestCardProps {
  profile: Profile;
  onAccept: () => void;
  onReject: () => void;
}

export function BuddyRequestCard({ profile, onAccept, onReject }: BuddyRequestCardProps) {
  const displayName = profile.username || 'Anonym';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <View style={styles.requestContainer}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      
      <View style={styles.requestInfo}>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.requestText}>möchte dein Buddy sein</Text>
      </View>

      <View style={styles.requestActions}>
        <TouchableOpacity style={styles.rejectButton} onPress={onReject}>
          <Text style={styles.rejectButtonText}>✕</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
          <Text style={styles.acceptButtonText}>✓</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  moodEmoji: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    fontSize: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  info: {
    flex: 1,
    marginLeft: 14,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  status: {
    fontSize: 13,
    marginTop: 2,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: 'bold',
  },
  requestContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ede9fe',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  requestInfo: {
    flex: 1,
    marginLeft: 14,
  },
  requestText: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  rejectButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: 'bold',
  },
  acceptButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
