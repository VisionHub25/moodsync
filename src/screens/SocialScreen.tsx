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
  Share,
} from 'react-native';
import { useGroups } from '../hooks/useGroups';

export function SocialScreen() {
  const { groups, isLoading, error, createGroup, joinGroup, leaveGroup, refresh } = useGroups();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Oops', 'Bitte gib einen Gruppennamen ein.');
      return;
    }

    setSubmitting(true);
    const group = await createGroup(groupName.trim());
    setSubmitting(false);

    if (group) {
      setShowCreateModal(false);
      setGroupName('');
      Alert.alert(
        '🎉 Gruppe erstellt!',
        `Teile den Code ${group.invite_code} mit deinen Freunden.`
      );
    }
  };

  const handleJoinGroup = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Oops', 'Bitte gib einen Einladungscode ein.');
      return;
    }

    setSubmitting(true);
    const success = await joinGroup(inviteCode.trim());
    setSubmitting(false);

    if (success) {
      setShowJoinModal(false);
      setInviteCode('');
      Alert.alert('🎉 Willkommen!', 'Du bist der Gruppe beigetreten.');
    }
  };

  const handleLeaveGroup = async (groupId: string, groupName: string) => {
    Alert.alert(
      'Gruppe verlassen?',
      `Möchtest du "${groupName}" wirklich verlassen?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Verlassen',
          style: 'destructive',
          onPress: async () => {
            await leaveGroup(groupId);
          },
        },
      ]
    );
  };

  const handleShareCode = async (code: string, name: string) => {
    try {
      await Share.share({
        message: `Tritt meiner MoodSync Gruppe "${name}" bei! Code: ${code}`,
      });
    } catch (err) {
      // Share cancelled
    }
  };

  const getVibeEmoji = (score: number | null) => {
    if (score === null) return '❓';
    if (score >= 0.7) return '🌟';
    if (score >= 0.5) return '☀️';
    if (score >= 0.3) return '🌤️';
    return '🌧️';
  };

  const getVibeText = (score: number | null) => {
    if (score === null) return 'Noch keine Check-ins heute';
    return `Team-Vibe: ${(score * 10).toFixed(1)}/10`;
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
          <Text style={styles.title}>Gemeinsam</Text>
          <Text style={styles.subtitle}>Teile deine Stimmung mit anderen</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Text style={styles.actionEmoji}>➕</Text>
            <Text style={styles.actionText}>Gruppe erstellen</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowJoinModal(true)}
          >
            <Text style={styles.actionEmoji}>🔗</Text>
            <Text style={styles.actionText}>Beitreten</Text>
          </TouchableOpacity>
        </View>

        {/* Groups List */}
        {groups.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>👥</Text>
            <Text style={styles.emptyTitle}>Noch keine Gruppen</Text>
            <Text style={styles.emptyText}>
              Erstelle eine Gruppe oder tritt einer bei,{'\n'}um Team-Vibes zu teilen!
            </Text>
          </View>
        ) : (
          <View style={styles.groupsList}>
            <Text style={styles.sectionTitle}>Deine Gruppen</Text>
            {groups.map((group) => (
              <View key={group.id} style={styles.groupCard}>
                <View style={styles.groupHeader}>
                  <Text style={styles.vibeEmoji}>{getVibeEmoji(group.todayVibe)}</Text>
                  <View style={styles.groupInfo}>
                    <Text style={styles.groupName}>{group.name}</Text>
                    <Text style={styles.groupMeta}>
                      {group.memberCount} {group.memberCount === 1 ? 'Mitglied' : 'Mitglieder'}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.vibeText}>{getVibeText(group.todayVibe)}</Text>
                
                <View style={styles.groupActions}>
                  <TouchableOpacity
                    style={styles.groupActionButton}
                    onPress={() => handleShareCode(group.invite_code, group.name)}
                  >
                    <Text style={styles.groupActionText}>📤 Code teilen</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.groupActionButton, styles.groupActionButtonDanger]}
                    onPress={() => handleLeaveGroup(group.id, group.name)}
                  >
                    <Text style={styles.groupActionTextDanger}>Verlassen</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.inviteCodeContainer}>
                  <Text style={styles.inviteCodeLabel}>Code:</Text>
                  <Text style={styles.inviteCode}>{group.invite_code}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {error && <Text style={styles.error}>{error}</Text>}
      </ScrollView>

      {/* Create Group Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Neue Gruppe</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Gruppenname"
              value={groupName}
              onChangeText={setGroupName}
              maxLength={30}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.modalButtonSecondaryText}>Abbrechen</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButtonPrimary, submitting && styles.modalButtonDisabled]}
                onPress={handleCreateGroup}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalButtonPrimaryText}>Erstellen</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Join Group Modal */}
      <Modal
        visible={showJoinModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowJoinModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Gruppe beitreten</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Einladungscode (z.B. ABC123)"
              value={inviteCode}
              onChangeText={(text) => setInviteCode(text.toUpperCase())}
              maxLength={6}
              autoCapitalize="characters"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={() => setShowJoinModal(false)}
              >
                <Text style={styles.modalButtonSecondaryText}>Abbrechen</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButtonPrimary, submitting && styles.modalButtonDisabled]}
                onPress={handleJoinGroup}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalButtonPrimaryText}>Beitreten</Text>
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
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a2e',
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginLeft: 16,
    marginBottom: 12,
  },
  groupsList: {
    marginTop: 8,
  },
  groupCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  vibeEmoji: {
    fontSize: 40,
    marginRight: 12,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  groupMeta: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  vibeText: {
    fontSize: 14,
    color: '#7c3aed',
    fontWeight: '500',
    marginBottom: 12,
  },
  groupActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  groupActionButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  groupActionButtonDanger: {
    backgroundColor: '#fef2f2',
  },
  groupActionText: {
    fontSize: 13,
    color: '#1a1a2e',
    fontWeight: '500',
  },
  groupActionTextDanger: {
    fontSize: 13,
    color: '#dc2626',
    fontWeight: '500',
  },
  inviteCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
  },
  inviteCodeLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  inviteCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7c3aed',
    letterSpacing: 2,
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
    marginBottom: 20,
    textAlign: 'center',
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
