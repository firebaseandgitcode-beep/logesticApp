import { useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Alert, Image, Platform,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'

const JOB_LABELS = {
  create_trip: 'Trip Creator',
  fuel_details: 'Fuel Manager',
  manage_trip: 'Trip Manager',
}

function ProfileRow({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value || '—'}</Text>
    </View>
  )
}

export default function ProfileScreen() {
  const { currentUser, logout, updateAvatar } = useAuth()
  const [avatarUri, setAvatarUri] = useState(currentUser?.avatar || null)

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo library access to change your profile picture.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    })
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0]
      // Show local uri immediately for responsive UI
      setAvatarUri(asset.uri)
      try {
        const base64Data = `data:image/jpeg;base64,${asset.base64}`
        const uploadResult = await api.upload(base64Data, 'management')
        const remoteUrl = uploadResult.url
        setAvatarUri(remoteUrl)
        updateAvatar(remoteUrl)
      } catch (e) {
        // Fall back to local uri if upload fails
        updateAvatar(asset.uri)
        Alert.alert('Upload failed', 'Profile picture saved locally but could not be uploaded.')
      }
    }
  }

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to sign out?')) {
        await logout()
      }
      return
    }

    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => { logout() } },
    ])
  }

  if (!currentUser) return null

  const initials = currentUser.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <TouchableOpacity onPress={handlePickImage} activeOpacity={0.8}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
          )}
          <View style={styles.editBadge}>
            <Text style={styles.editBadgeText}>Edit</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>{currentUser.name}</Text>
        <Text style={styles.role}>{currentUser.role}</Text>
      </View>

      {/* Jobs */}
      <View style={styles.jobsRow}>
        {(currentUser.jobs || []).map(job => (
          <View key={job} style={styles.jobBadge}>
            <Text style={styles.jobBadgeText}>{JOB_LABELS[job] || job}</Text>
          </View>
        ))}
      </View>

      {/* Details */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Personal Info</Text>
        <ProfileRow label="Manager ID" value={currentUser.managerId} />
        <ProfileRow label="Full Name" value={currentUser.name} />
        <ProfileRow label="Email" value={currentUser.email} />
        <ProfileRow label="Phone" value={currentUser.phone} />
        <ProfileRow label="Status" value={currentUser.status} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Bank Details</Text>
        <ProfileRow label="Bank" value={currentUser.bankDetails?.bank} />
        <ProfileRow label="Account" value={currentUser.bankDetails?.account} />
        <ProfileRow label="IFSC" value={currentUser.bankDetails?.ifsc} />
      </View>

      <View style={styles.noteCard}>
        <Text style={styles.noteText}>
          Profile details can only be updated by the admin. Only your profile picture is editable.
        </Text>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 20, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', marginBottom: 16 },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#e5e7eb' },
  avatarPlaceholder: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center',
  },
  avatarInitials: { color: '#fff', fontSize: 28, fontWeight: '700' },
  editBadge: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb',
    borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2,
  },
  editBadgeText: { fontSize: 10, color: '#2563eb', fontWeight: '700' },
  name: { fontSize: 20, fontWeight: '700', color: '#111827', marginTop: 10 },
  role: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  jobsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 20 },
  jobBadge: {
    backgroundColor: '#eff6ff', paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1, borderColor: '#bfdbfe',
  },
  jobBadgeText: { fontSize: 12, color: '#1d4ed8', fontWeight: '600' },
  card: {
    backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb',
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4, marginBottom: 14,
  },
  cardTitle: { fontSize: 12, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderColor: '#f3f4f6',
  },
  rowLabel: { fontSize: 13, color: '#6b7280', flex: 1 },
  rowValue: { fontSize: 13, color: '#111827', fontWeight: '500', flex: 1, textAlign: 'right' },
  noteCard: {
    backgroundColor: '#fef9c3', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#fde68a', marginBottom: 20,
  },
  noteText: { fontSize: 12, color: '#92400e', lineHeight: 18 },
  logoutBtn: {
    backgroundColor: '#fee2e2', borderRadius: 14, paddingVertical: 14,
    alignItems: 'center', borderWidth: 1, borderColor: '#fca5a5',
  },
  logoutText: { fontSize: 15, color: '#dc2626', fontWeight: '700' },
})
