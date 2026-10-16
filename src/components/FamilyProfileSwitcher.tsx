import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  FamilyProfile,
  FamilyRelation,
  useFamilyProfilesStore,
} from '../store/familyProfilesStore';
import { useUserStore } from '../store/userStore';
import { Button } from './Button';

const RELATION_ICONS: Record<FamilyRelation, string> = {
  Self: '👑',
  Spouse: '💍',
  Child: '👶',
  Father: '👴',
  Mother: '👵',
  Sibling: '🤝',
  Business: '💼',
  Friend: '🌟',
};

const RELATION_LIST: FamilyRelation[] = [
  'Spouse',
  'Child',
  'Father',
  'Mother',
  'Sibling',
  'Business',
  'Friend',
];

export function FamilyProfileSwitcher() {
  const userProfile = useUserStore((s) => s.profile);
  const {
    profiles,
    activeProfileId,
    setActiveProfileId,
    addFamilyProfile,
    removeFamilyProfile,
  } = useFamilyProfilesStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState<FamilyRelation>('Spouse');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('female');
  const [dob, setDob] = useState('1996-05-15');
  const [time, setTime] = useState('10:30');
  const [place, setPlace] = useState('New Delhi, India');

  const handleSelect = (id: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    setActiveProfileId(id);
  };

  const handleAddMember = () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter a name for your family member.');
      return;
    }

    addFamilyProfile({
      name: name.trim(),
      relation,
      gender,
      birthProfile: {
        name: name.trim(),
        date: dob,
        time: time,
        place: {
          name: place,
          state: 'Delhi',
          lat: 28.6139,
          lon: 77.209,
          tz: 5.5,
        },
        gender,
      },
    });

    setName('');
    setModalVisible(false);

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  };

  const confirmDelete = (p: FamilyProfile) => {
    Alert.alert(
      'Remove Profile',
      `Are you sure you want to remove ${p.name}'s chart from your family vault?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeFamilyProfile(p.id),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        {/* Self Profile Pill */}
        <Pressable
          onPress={() => handleSelect('self')}
          style={[
            styles.profilePill,
            activeProfileId === 'self' && styles.profilePillActive,
          ]}
        >
          <Text style={styles.pillIcon}>👑</Text>
          <View>
            <Text
              style={[
                styles.pillName,
                activeProfileId === 'self' && styles.pillNameActive,
              ]}
              numberOfLines={1}
            >
              {userProfile?.name || 'Self'}
            </Text>
            <Text style={styles.pillSub}>My Chart</Text>
          </View>
        </Pressable>

        {/* Saved Family Member Pills */}
        {profiles.map((p) => {
          const isActive = activeProfileId === p.id;
          return (
            <Pressable
              key={p.id}
              onPress={() => handleSelect(p.id)}
              onLongPress={() => confirmDelete(p)}
              style={[styles.profilePill, isActive && styles.profilePillActive]}
            >
              <Text style={styles.pillIcon}>{RELATION_ICONS[p.relation] || '👤'}</Text>
              <View>
                <Text
                  style={[styles.pillName, isActive && styles.pillNameActive]}
                  numberOfLines={1}
                >
                  {p.name}
                </Text>
                <Text style={styles.pillSub}>{p.relation}</Text>
              </View>
            </Pressable>
          );
        })}

        {/* Add Member Button */}
        <Pressable
          style={styles.addPill}
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            }
            setModalVisible(true);
          }}
        >
          <Text style={styles.addPlus}>+</Text>
          <Text style={styles.addText}>Add Member</Text>
        </Pressable>
      </ScrollView>

      {/* Add Member Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setModalVisible(false)}
          />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Family Member Kundli</Text>
              <Pressable
                style={styles.modalClose}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Name Input */}
              <Text style={styles.fieldLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Pooja, Aarav..."
                placeholderTextColor="#64748B"
                value={name}
                onChangeText={setName}
              />

              {/* Relationship Picker */}
              <Text style={styles.fieldLabel}>Relationship</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.relRow}
              >
                {RELATION_LIST.map((rel) => {
                  const isRelActive = relation === rel;
                  return (
                    <Pressable
                      key={rel}
                      onPress={() => setRelation(rel)}
                      style={[
                        styles.relChip,
                        isRelActive && styles.relChipActive,
                      ]}
                    >
                      <Text style={{ fontSize: 13 }}>{RELATION_ICONS[rel]}</Text>
                      <Text
                        style={[
                          styles.relChipText,
                          isRelActive && styles.relChipTextActive,
                        ]}
                      >
                        {rel}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Date of Birth */}
              <Text style={styles.fieldLabel}>Date of Birth (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="1996-05-15"
                placeholderTextColor="#64748B"
                value={dob}
                onChangeText={setDob}
              />

              {/* Time of Birth */}
              <Text style={styles.fieldLabel}>Time of Birth (24hr HH:mm)</Text>
              <TextInput
                style={styles.input}
                placeholder="10:30"
                placeholderTextColor="#64748B"
                value={time}
                onChangeText={setTime}
              />

              {/* Place of Birth */}
              <Text style={styles.fieldLabel}>Place of Birth</Text>
              <TextInput
                style={styles.input}
                placeholder="New Delhi, India"
                placeholderTextColor="#64748B"
                value={place}
                onChangeText={setPlace}
              />

              <Button
                label="Generate Family Kundli ✨"
                variant="primary"
                size="lg"
                style={{ marginTop: 16 }}
                onPress={handleAddMember}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  scrollList: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  profilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(26, 33, 64, 0.7)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1.2,
    borderColor: 'rgba(129, 140, 248, 0.2)',
    minWidth: 110,
  },
  profilePillActive: {
    borderColor: '#FCD34D',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  pillIcon: {
    fontSize: 18,
  },
  pillName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#CBD5E1',
    maxWidth: 90,
  },
  pillNameActive: {
    color: '#FCD34D',
  },
  pillSub: {
    fontSize: 10,
    color: '#94A3B8',
  },
  addPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderStyle: 'dashed',
  },
  addPlus: {
    fontSize: 16,
    color: '#A5B4FC',
    fontWeight: '700',
  },
  addText: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#0F1322',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.35)',
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#EEF2FF',
  },
  modalClose: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    color: '#CBD5E1',
    fontWeight: '700',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#CBD5E1',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: 'rgba(26, 33, 64, 0.7)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    color: '#EEF2FF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  relRow: {
    gap: 8,
    paddingVertical: 4,
  },
  relChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(26, 33, 64, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  relChipActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: '#FCD34D',
  },
  relChipText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  relChipTextActive: {
    color: '#FCD34D',
  },
});
