import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, ScrollView, Alert, Modal,
} from 'react-native'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'

function SelectModal({ visible, title, options, onSelect, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={sel.overlay} activeOpacity={1} onPress={onClose} />
      <View style={sel.sheet}>
        <View style={sel.header}>
          <Text style={sel.title}>{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={sel.close}>✕</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={options}
          keyExtractor={o => o.value}
          renderItem={({ item }) => (
            <TouchableOpacity style={sel.option} onPress={() => { onSelect(item.value); onClose() }}>
              <Text style={sel.optionLabel}>{item.label}</Text>
              {item.sub ? <Text style={sel.optionSub}>{item.sub}</Text> : null}
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={sel.empty}>No options available</Text>}
        />
      </View>
    </Modal>
  )
}

function SelectField({ value, placeholder, onPress, disabled }) {
  return (
    <TouchableOpacity
      style={[styles.input, sel.field, disabled && sel.fieldDisabled]}
      onPress={disabled ? undefined : onPress}
      activeOpacity={0.7}
    >
      <Text style={value ? sel.fieldValue : sel.fieldPlaceholder} numberOfLines={1}>
        {value || placeholder}
      </Text>
      <Text style={sel.chevron}>▾</Text>
    </TouchableOpacity>
  )
}

const sel = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '60%', paddingBottom: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderColor: '#f3f4f6' },
  title: { fontSize: 15, fontWeight: '700', color: '#111827' },
  close: { fontSize: 16, color: '#6b7280', padding: 4 },
  option: { paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderColor: '#f9fafb' },
  optionLabel: { fontSize: 14, fontWeight: '600', color: '#111827' },
  optionSub: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  empty: { textAlign: 'center', padding: 24, color: '#9ca3af', fontSize: 14 },
  field: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fieldDisabled: { backgroundColor: '#f9fafb', opacity: 0.7 },
  fieldValue: { fontSize: 14, color: '#111827', flex: 1 },
  fieldPlaceholder: { fontSize: 14, color: '#9ca3af', flex: 1 },
  chevron: { fontSize: 14, color: '#9ca3af', marginLeft: 8 },
})

const STATUS_COLORS = {
  planned: { bg: '#fef3c7', text: '#92400e' },
  in_progress: { bg: '#dbeafe', text: '#1e40af' },
  completed: { bg: '#d1fae5', text: '#065f46' },
}

const EMPTY_FORM = {
  date: new Date().toISOString().split('T')[0],
  originCustomer: '', originCity: '', originState: '',
  destCustomer: '', destCity: '', destState: '',
  commodity: '', tons: '',
  driverId: '', vehicleNumber: '',
  notes: '',
  driverPayment: { totalAmount: '', advance: '' },
}

export default function CreateTripScreen() {
  const { currentUser } = useAuth()
  const { trips, drivers, updateTrip, addTrip } = useData()
  const [showForm, setShowForm] = useState(false)
  const [editTrip, setEditTrip] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [driverModal, setDriverModal] = useState(false)
  const [vehicleModal, setVehicleModal] = useState(false)

  const myTrips = trips.filter(t => t.createdBy === currentUser?.managerId)

  const openCreate = () => {
    setEditTrip(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  const openEdit = (trip) => {
    if (trip.verifiedTripDetails) {
      Alert.alert('Locked', 'Trip details have been verified and cannot be edited.')
      return
    }
    setEditTrip(trip)
    setForm({
      date: trip.date,
      originCustomer: trip.originCustomer,
      originCity: trip.originCity,
      originState: trip.originState,
      destCustomer: trip.destCustomer,
      destCity: trip.destCity,
      destState: trip.destState,
      commodity: trip.commodity,
      tons: String(trip.tons || ''),
      driverId: trip.driverId || '',
      vehicleNumber: trip.vehicleNumber || '',
      notes: trip.notes || '',
      driverPayment: {
        totalAmount: String(trip.driverPayment?.totalAmount || ''),
        advance: String(trip.driverPayment?.advance || ''),
      },
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.originCity || !form.destCity || !form.commodity) {
      Alert.alert('Required Fields', 'Please fill in origin city, destination city, and commodity.')
      return
    }
    const data = {
      ...form,
      tons: Number(form.tons) || 0,
      driverPayment: {
        totalAmount: Number(form.driverPayment.totalAmount) || 0,
        advance: Number(form.driverPayment.advance) || 0,
      },
      verifiedCreate: true,
      createdBy: currentUser?.managerId,
    }
    try {
      if (editTrip) {
        await updateTrip(editTrip.id, data)
      } else {
        await addTrip(data)
      }
      setShowForm(false)
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to save trip. Please try again.')
    }
  }

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }))
  const setPayment = (k) => (v) => setForm(f => ({
    ...f,
    driverPayment: { ...f.driverPayment, [k]: v },
  }))

  const renderTrip = ({ item: trip }) => {
    const sc = STATUS_COLORS[trip.status] || STATUS_COLORS.planned
    const isLocked = trip.verifiedTripDetails
    return (
      <TouchableOpacity
        style={styles.tripCard}
        onPress={() => openEdit(trip)}
        activeOpacity={0.7}
      >
        <View style={styles.tripHeader}>
          <Text style={styles.tripRoute}>
            {trip.originCity} → {trip.destCity}
          </Text>
          <View style={[styles.badge, { backgroundColor: sc.bg }]}>
            <Text style={[styles.badgeText, { color: sc.text }]}>
              {trip.status.replace('_', ' ')}
            </Text>
          </View>
        </View>
        <Text style={styles.tripSub}>
          {trip.commodity} · {trip.tons}T · {trip.date}
        </Text>
        {trip.driverId && (
          <Text style={styles.tripMeta}>
            Driver: {drivers.find(d => d.driverId === trip.driverId)?.name || trip.driverId}
          </Text>
        )}
        {isLocked && (
          <Text style={styles.lockedText}>Verified — read only</Text>
        )}
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={myTrips}
        keyExtractor={t => String(t.id)}
        renderItem={renderTrip}
        contentContainerStyle={styles.list}
        ListHeaderComponent={() => (
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>My Trips ({myTrips.length})</Text>
            <TouchableOpacity style={styles.createBtn} onPress={openCreate}>
              <Text style={styles.createBtnText}>+ New Trip</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No trips yet</Text>
            <Text style={styles.emptySubText}>Tap &quot;New Trip&quot; to create your first trip</Text>
          </View>
        )}
      />

      <Modal visible={showForm} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowForm(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editTrip ? 'Edit Trip' : 'New Trip'}</Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
            <Text style={styles.sectionTitle}>Trip Date</Text>
            <TextInput
              style={styles.input}
              value={form.date}
              onChangeText={set('date')}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.sectionTitle}>Origin</Text>
            <TextInput style={styles.input} value={form.originCustomer} onChangeText={set('originCustomer')} placeholder="Customer / Company name" placeholderTextColor="#9ca3af" />
            <View style={styles.row}>
              <TextInput style={[styles.input, styles.flex]} value={form.originCity} onChangeText={set('originCity')} placeholder="City *" placeholderTextColor="#9ca3af" />
              <TextInput style={[styles.input, styles.short]} value={form.originState} onChangeText={set('originState')} placeholder="State" placeholderTextColor="#9ca3af" />
            </View>

            <Text style={styles.sectionTitle}>Destination</Text>
            <TextInput style={styles.input} value={form.destCustomer} onChangeText={set('destCustomer')} placeholder="Customer / Company name" placeholderTextColor="#9ca3af" />
            <View style={styles.row}>
              <TextInput style={[styles.input, styles.flex]} value={form.destCity} onChangeText={set('destCity')} placeholder="City *" placeholderTextColor="#9ca3af" />
              <TextInput style={[styles.input, styles.short]} value={form.destState} onChangeText={set('destState')} placeholder="State" placeholderTextColor="#9ca3af" />
            </View>

            <Text style={styles.sectionTitle}>Cargo</Text>
            <View style={styles.row}>
              <TextInput style={[styles.input, styles.flex]} value={form.commodity} onChangeText={set('commodity')} placeholder="Commodity *" placeholderTextColor="#9ca3af" />
              <TextInput style={[styles.input, styles.short]} value={form.tons} onChangeText={set('tons')} placeholder="Tons" placeholderTextColor="#9ca3af" keyboardType="numeric" />
            </View>

            <Text style={styles.sectionTitle}>Driver & Vehicle</Text>
            <SelectField
              value={form.driverId ? `${drivers.find(d => d.driverId === form.driverId)?.name || ''} (${form.driverId})` : ''}
              placeholder="Select driver…"
              onPress={() => setDriverModal(true)}
            />
            <SelectField
              value={form.vehicleNumber || ''}
              placeholder="Select vehicle…"
              onPress={() => setVehicleModal(true)}
            />

            <Text style={styles.sectionTitle}>Driver Payment</Text>
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text style={styles.inputLabel}>Total Amount (₹)</Text>
                <TextInput style={styles.input} value={form.driverPayment.totalAmount} onChangeText={setPayment('totalAmount')} placeholder="0" placeholderTextColor="#9ca3af" keyboardType="numeric" />
              </View>
              <View style={styles.short}>
                <Text style={styles.inputLabel}>Advance (₹)</Text>
                <TextInput style={styles.input} value={form.driverPayment.advance} onChangeText={setPayment('advance')} placeholder="0" placeholderTextColor="#9ca3af" keyboardType="numeric" />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={form.notes}
              onChangeText={set('notes')}
              placeholder="Any special instructions…"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
            />

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>

      <SelectModal
        visible={driverModal}
        title="Select Driver"
        options={drivers
          .filter(d => d.status === 'active')
          .map(d => ({
            value: d.driverId,
            label: d.name,
            sub: `${d.driverId}${d.assignedVehicle ? ` · Vehicle: ${d.assignedVehicle}` : ' · No vehicle assigned'}`,
          }))}
        onSelect={v => { set('driverId')(v); const d = drivers.find(x => x.driverId === v); if (d?.assignedVehicle && !form.vehicleNumber) set('vehicleNumber')(d.assignedVehicle) }}
        onClose={() => setDriverModal(false)}
      />

      <SelectModal
        visible={vehicleModal}
        title="Select Vehicle"
        options={vehicles
          .filter(v => v.status === 'active')
          .map(v => ({
            value: v.vehicleNumber,
            label: v.vehicleNumber,
            sub: `${v.make} ${v.vehicleType}${v.assignedDriver ? ` · Driver: ${v.assignedDriver}` : ''}`,
          }))}
        onSelect={v => set('vehicleNumber')(v)}
        onClose={() => setVehicleModal(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  list: { padding: 16 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  listTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  createBtn: { backgroundColor: '#2563eb', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  createBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  tripCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    marginBottom: 10, borderWidth: 1, borderColor: '#e5e7eb',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  tripHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  tripRoute: { fontSize: 15, fontWeight: '700', color: '#111827', flex: 1, marginRight: 8 },
  badge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  tripSub: { fontSize: 13, color: '#6b7280' },
  tripMeta: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  lockedText: { fontSize: 11, color: '#059669', marginTop: 4, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#9ca3af' },
  emptySubText: { fontSize: 13, color: '#d1d5db', marginTop: 4 },
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderColor: '#e5e7eb',
  },
  modalCancel: { fontSize: 15, color: '#6b7280' },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  modalSave: { fontSize: 15, color: '#2563eb', fontWeight: '700' },
  modalScroll: { flex: 1, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 20, marginBottom: 8 },
  inputLabel: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  input: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: '#111827', backgroundColor: '#fff', marginBottom: 10,
  },
  textarea: { height: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 10 },
  flex: { flex: 1 },
  short: { width: 90 },
})
