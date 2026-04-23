import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, ScrollView, Alert, Modal,
} from 'react-native'
import { useData } from '../context/DataContext'

const STATUS_COLORS = {
  planned: { bg: '#fef3c7', text: '#92400e' },
  in_progress: { bg: '#dbeafe', text: '#1e40af' },
  completed: { bg: '#d1fae5', text: '#065f46' },
}

function FuelEntry({ entry, isLocked }) {
  const total = (Number(entry.litres) || 0) * (Number(entry.perLtrCost) || 0)
  return (
    <View style={styles.fuelEntry}>
      <View style={styles.fuelEntryRow}>
        <Text style={styles.fuelDate}>{entry.date}</Text>
        <Text style={styles.fuelTotal}>₹{total.toLocaleString('en-IN')}</Text>
      </View>
      <Text style={styles.fuelDetail}>
        {entry.litres}L @ ₹{entry.perLtrCost}/L · ODO {entry.odometer?.toLocaleString('en-IN')} km
      </Text>
    </View>
  )
}

export default function FuelDetailsScreen() {
  const { trips, updateTrip } = useData()
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [fuelForm, setFuelForm] = useState({ date: '', odometer: '', litres: '', perLtrCost: '' })

  const activableTrips = trips.filter(t => t.verifiedCreate)

  const openTrip = (trip) => setSelectedTrip(trip)

  const openAddFuel = () => {
    if (selectedTrip.verifiedFuelDetails) {
      Alert.alert('Locked', 'Fuel details have been verified and cannot be edited.')
      return
    }
    setFuelForm({ date: new Date().toISOString().split('T')[0], odometer: '', litres: '', perLtrCost: '' })
    setShowForm(true)
  }

  const handleAddFuel = async () => {
    if (!fuelForm.litres || !fuelForm.perLtrCost) {
      Alert.alert('Required', 'Please enter litres and cost per litre.')
      return
    }
    const entry = {
      id: (selectedTrip.fuelEntries?.length || 0) + 1,
      date: fuelForm.date,
      odometer: Number(fuelForm.odometer) || 0,
      litres: Number(fuelForm.litres),
      perLtrCost: Number(fuelForm.perLtrCost),
    }
    const updatedEntries = [...(selectedTrip.fuelEntries || []), entry]
    try {
      await updateTrip(selectedTrip.id, { fuelEntries: updatedEntries })
      setSelectedTrip(prev => ({ ...prev, fuelEntries: updatedEntries }))
      setShowForm(false)
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to save fuel entry. Please try again.')
    }
  }

  const setF = (k) => (v) => setFuelForm(f => ({ ...f, [k]: v }))

  if (selectedTrip) {
    const updated = trips.find(t => t.id === selectedTrip.id) || selectedTrip
    const totalFuel = (updated.fuelEntries || []).reduce(
      (s, e) => s + (Number(e.litres) || 0) * (Number(e.perLtrCost) || 0), 0
    )
    const isLocked = updated.verifiedFuelDetails

    return (
      <View style={styles.container}>
        <View style={styles.detailHeader}>
          <TouchableOpacity onPress={() => setSelectedTrip(null)} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          {!isLocked && (
            <TouchableOpacity style={styles.addBtn} onPress={openAddFuel}>
              <Text style={styles.addBtnText}>+ Add Fuel</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={styles.detailScroll}>
          <View style={styles.tripInfoCard}>
            <Text style={styles.tripRoute}>{updated.originCity} → {updated.destCity}</Text>
            <Text style={styles.tripMeta}>{updated.commodity} · {updated.tons}T · {updated.date}</Text>
            {updated.vehicleNumber && (
              <Text style={styles.tripMeta}>Vehicle: {updated.vehicleNumber}</Text>
            )}
          </View>

          <View style={styles.fuelSummary}>
            <Text style={styles.fuelSummaryLabel}>Total Fuel Cost</Text>
            <Text style={styles.fuelSummaryValue}>₹{totalFuel.toLocaleString('en-IN')}</Text>
            {isLocked && <Text style={styles.verifiedBadge}>Verified</Text>}
          </View>

          <Text style={styles.sectionTitle}>Fuel Entries ({updated.fuelEntries?.length || 0})</Text>
          {(updated.fuelEntries || []).length === 0 ? (
            <View style={styles.emptyEntries}>
              <Text style={styles.emptyText}>No fuel entries yet</Text>
              {!isLocked && <Text style={styles.emptySubText}>Tap &quot;Add Fuel&quot; to add an entry</Text>}
            </View>
          ) : (
            (updated.fuelEntries || []).map(entry => (
              <FuelEntry key={entry.id} entry={entry} isLocked={isLocked} />
            ))
          )}
        </ScrollView>

        <Modal visible={showForm} animationType="slide" presentationStyle="formSheet">
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Add Fuel Entry</Text>
              <TouchableOpacity onPress={handleAddFuel}>
                <Text style={styles.modalSave}>Add</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
              <Text style={styles.inputLabel}>Date</Text>
              <TextInput style={styles.input} value={fuelForm.date} onChangeText={setF('date')} placeholder="YYYY-MM-DD" placeholderTextColor="#9ca3af" />
              <Text style={styles.inputLabel}>Odometer Reading (km)</Text>
              <TextInput style={styles.input} value={fuelForm.odometer} onChangeText={setF('odometer')} placeholder="45000" placeholderTextColor="#9ca3af" keyboardType="numeric" />
              <View style={styles.row}>
                <View style={styles.flex}>
                  <Text style={styles.inputLabel}>Litres *</Text>
                  <TextInput style={styles.input} value={fuelForm.litres} onChangeText={setF('litres')} placeholder="40" placeholderTextColor="#9ca3af" keyboardType="numeric" />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.inputLabel}>Price per Litre (₹) *</Text>
                  <TextInput style={styles.input} value={fuelForm.perLtrCost} onChangeText={setF('perLtrCost')} placeholder="105" placeholderTextColor="#9ca3af" keyboardType="numeric" />
                </View>
              </View>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </Modal>
      </View>
    )
  }

  const renderTrip = ({ item: trip }) => {
    const sc = STATUS_COLORS[trip.status] || STATUS_COLORS.planned
    const fuelCount = trip.fuelEntries?.length || 0
    const isVerified = trip.verifiedFuelDetails
    return (
      <TouchableOpacity style={styles.tripCard} onPress={() => openTrip(trip)} activeOpacity={0.7}>
        <View style={styles.tripHeader}>
          <Text style={styles.tripRouteText}>{trip.originCity} → {trip.destCity}</Text>
          <View style={[styles.badge, { backgroundColor: sc.bg }]}>
            <Text style={[styles.badgeText, { color: sc.text }]}>{trip.status.replace('_', ' ')}</Text>
          </View>
        </View>
        <Text style={styles.tripSubText}>{trip.commodity} · {trip.date}</Text>
        {trip.vehicleNumber && <Text style={styles.tripMetaText}>Vehicle: {trip.vehicleNumber}</Text>}
        <View style={styles.fuelCountRow}>
          <Text style={styles.fuelCountText}>{fuelCount} fuel {fuelCount === 1 ? 'entry' : 'entries'}</Text>
          {isVerified && <Text style={styles.verifiedSmall}>Verified</Text>}
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={activableTrips}
        keyExtractor={t => String(t.id)}
        renderItem={renderTrip}
        contentContainerStyle={styles.list}
        ListHeaderComponent={() => (
          <Text style={styles.listTitle}>Select a Trip to Add Fuel</Text>
        )}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No active trips</Text>
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  list: { padding: 16 },
  listTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  tripCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: '#e5e7eb',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  tripHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  tripRouteText: { fontSize: 15, fontWeight: '700', color: '#111827', flex: 1, marginRight: 8 },
  badge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  tripSubText: { fontSize: 13, color: '#6b7280' },
  tripMetaText: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  fuelCountRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  fuelCountText: { fontSize: 12, color: '#6b7280' },
  verifiedSmall: { fontSize: 11, color: '#059669', fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { fontSize: 16, color: '#9ca3af', fontWeight: '600' },
  emptySubText: { fontSize: 13, color: '#d1d5db', marginTop: 4 },
  detailHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  backBtn: { paddingVertical: 4 },
  backText: { fontSize: 15, color: '#2563eb', fontWeight: '600' },
  addBtn: { backgroundColor: '#2563eb', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  detailScroll: { flex: 1, padding: 16 },
  tripInfoCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 12,
  },
  tripRoute: { fontSize: 16, fontWeight: '700', color: '#111827' },
  tripMeta: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  fuelSummary: {
    backgroundColor: '#eff6ff', borderRadius: 14, padding: 16, marginBottom: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  fuelSummaryLabel: { fontSize: 13, color: '#1e40af', fontWeight: '600' },
  fuelSummaryValue: { fontSize: 20, fontWeight: '700', color: '#1e40af' },
  verifiedBadge: { fontSize: 11, color: '#059669', fontWeight: '700', backgroundColor: '#d1fae5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  fuelEntry: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  fuelEntryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  fuelDate: { fontSize: 13, fontWeight: '600', color: '#111827' },
  fuelTotal: { fontSize: 14, fontWeight: '700', color: '#2563eb' },
  fuelDetail: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  emptyEntries: { alignItems: 'center', paddingVertical: 24 },
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderColor: '#e5e7eb',
  },
  modalCancel: { fontSize: 15, color: '#6b7280' },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  modalSave: { fontSize: 15, color: '#2563eb', fontWeight: '700' },
  modalScroll: { flex: 1, padding: 20 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: '#111827', backgroundColor: '#fff', marginBottom: 16,
  },
  row: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
})
