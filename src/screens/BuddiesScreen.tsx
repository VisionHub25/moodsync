import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useBuddies } from '../hooks/useBuddies';
import { BuddyCard, BuddyRequestCard } from '../components/BuddyCard';

const MAX_BUDDIES = 3;

export function BuddiesScreen() {
  const {
    buddies,
    pendingRequests,
    isLoading,
    error,
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeBuddy,
    refresh,
  } = useBuddies();

  const [showAddModal, setShowAddModal] = useState(false);
  const [username, setUsername] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSendRequest = async () => {
    if (!username.trim()) {
      Alert.alert('Oops', 'Bitte gib einen Usernamen ein.');
      return;
    }

    setSubmitting(true);
    const success = await sendRequest(username.trim());
    setSubmitting(false);

    if (success) {
      setShowAddModal(false);
      setUsername('');
      Alert.alert('📤 Anfrage gesendet!', 'Warte auf Bestätigung.');
    }
  };

  const handleAccept = async (buddyUserId: string, buddyName: string) => {
    const success = await acceptRequest(buddyUserId);
    if (success) {
      Alert.alert('🎉 Buddy hinzugefügt!', `${buddyName} ist jetzt dein Buddy.`);
    }
  };

  const handleReject = async (buddyUserId: string) => {
    await rejectRequest(buddyUserId);
  };

  const handleRemove = async (buddyUserId: string, buddyName: string) => {
    Alert.alert(
      'Buddy entfernen?',
      `Möchtest du ${buddyName} wirklich entfernen?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Entfernen',
          style: 'destructive',
          onPress: async () => {
            await removeBuddy(buddyUserId);
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Buddies</Text>
          <Text style={styles.subtitle}>
            Teile deine Stimmung mit engen Freunden
          </Text>
        </View>

        {/* Add Button */}
        {buddies.length < MAX_BUDDIES && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={styles.addButtonEmoji}>➕</Text>
            <Text style={styles.addButtonText}>Buddy hinzufügen</Text>
            <Text style={styles.addButtonCount}>
              {buddies.length}/{MAX_BUDDIES}
            </Text>
          </TouchableOpacity>
        )}

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              📬 Anfragen ({pendingRequests.length})
            </Text>
            {pendingRequests.map(({ buddy, profile }) => (
              <BuddyRequestCard
                key={`${buddy.user_a}-${buddy.user_b}`}
                profile={profile}
                onAccept={() => handleAccept(profile.id, profile.username || 'Buddy')}
                onReject={() => handleReject(profile.id)}
              />
            ))}
          </View>
        )}

        {/* Buddies List */}
        {buddies.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Deine Buddies</Text>
            {buddies.map(({ buddy, profile, todayMood }) => (
              <BuddyCard
                key={`${buddy.user_a}-${buddy.user_b}`}
                profile={profile}
                todayMood={todayMood}
                onRemove={() => handleRemove(profile.id, profile.username || 'Buddy')}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>💜</Text>
            <Text style={styles.emptyTitle}>Noch keine Buddies</Text>
            <Text style={styles.emptyText}>
              Füge bis zu {MAX_BUDDIES} enge Freunde hinzu,{'\n'}
              um eure Stimmungen zu teilen.
            </Text>
          </View>
        )}

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>💡 So funktioniert's</Text>
          <Text style={styles.infoText}>
            • Ihr seht gegenseitig eure Tages-Stimmung{'\n'}
            • Nur wenn beide eingecheckt haben{'\n'}
            • Perfekt für enge Freunde & Partner
          </Text>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}
      </ScrollView>

      {/* Add Buddy Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Buddy hinzufügen</Text>
            <Text style={styles.modalHint}>
              Gib den Usernamen deines Freundes ein
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.modalButtonSecondaryText}>Abbrechen</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButtonPrimary, submitting && styles.modalButtonDisabled]}
                onPress={handleSendRequest}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalButtonPrimaryText}>Anfragen</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#7c3aed',
    borderStyle: 'dashed',
  },
  addButtonEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  addButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#7c3aed',
  },
  addButtonCount: {
    fontSize: 14,
    color: '#999',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  infoBox: {
    backgroundColor: '#ede9fe',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7c3aed',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  error: {
    color: '#dc2626',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalHint: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButtonSecondary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  modalButtonSecondaryText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  modalButtonPrimary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#7c3aed',
  },
  modalButtonDisabled: {
    backgroundColor: '#c4b5fd',
  },
  modalButtonPrimaryText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
