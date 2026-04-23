import { useState } from 'react'
import {
  View, Text, TouchableOpacity, FlatList, ScrollView,
  StyleSheet, Alert,
} from 'react-native'
import { useData } from '../context/DataContext'
import { initialDrivers, tripRevenue, tripFuelCost, tripAllExpenses, tripNetPay } from '../data/store'

const STATUS_COLORS = {
  planned: { bg: '#fef3c7', text: '#92400e' },
  in_progress: { bg: '#dbeafe', text: '#1e40af' },
  completed: { bg: '#d1fae5', text: '#065f46' },
}

function InfoRow({ label, value, bold }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, bold && { fontWeight: '700' }]}>{value}</Text>
    </View>
  )
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  )
}

function VerifyButton({ label, checked, onPress, disabled }) {
  return (
    <TouchableOpacity
      style={[styles.verifyBtn, checked && styles.verifyBtnChecked, disabled && styles.verifyBtnDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={[styles.verifyLabel, checked && styles.verifyLabelChecked]}>{label}</Text>
    </TouchableOpacity>
  )
}

function TripDetail({ trip, onBack }) {
  const { updateTrip, trips } = useData()
  const updated = trips.find(t => t.id === trip.id) || trip

  const driver = initialDrivers.find(d => d.driverId === updated.driverId)
  const revenue = tripRevenue(updated)
  const fuel = tripFuelCost(updated)
  const expenses = tripAllExpenses(updated)
  const net = tripNetPay(updated)

  const handleVerifyTrip = () => {
    if (updated.verifiedTripDetails) {
      Alert.alert('Already Verified', 'Trip details are already marked as verified.')
      return
    }
    Alert.alert(
      'Verify Trip Details',
      'Mark trip details as correct and verified? The trip creator will no longer be able to edit them.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Verify', onPress: () => updateTrip(updated.id, { verifiedTripDetails: true }) },
      ]
    )
  }

  const handleVerifyFuel = () => {
    if (updated.verifiedFuelDetails) {
      Alert.alert('Already Verified', 'Fuel details are already marked as verified.')
      return
    }
    Alert.alert(
      'Verify Fuel Details',
      'Mark fuel details as correct and verified? The fuel manager will no longer be able to edit them.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Verify', onPress: () => updateTrip(updated.id, { verifiedFuelDetails: true }) },
      ]
    )
  }

  const sc = STATUS_COLORS[updated.status] || STATUS_COLORS.planned

  return (
    <View style={styles.container}>
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={[styles.badge, { backgroundColor: sc.bg }]}>
          <Text style={[styles.badgeText, { color: sc.text }]}>
            {updated.status.replace('_', ' ')}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scroll}>
        {/* Verification actions */}
        <View style={styles.verifySection}>
          <Text style={styles.verifySectionTitle}>Verification</Text>
          <VerifyButton
            label="Trip details are correct and verified"
            checked={updated.verifiedTripDetails}
            onPress={handleVerifyTrip}
          />
          <VerifyButton
            label="Fuel details are correct and verified"
            checked={updated.verifiedFuelDetails}
            onPress={handleVerifyFuel}
          />
          {updated.verifiedTripDetails && updated.verifiedFuelDetails && (
            <View style={styles.allVerifiedBanner}>
              <Text style={styles.allVerifiedText}>All verified — Trip is complete</Text>
            </View>
          )}
        </View>

        <Section title="Trip Details">
          <InfoRow label="Date" value={updated.date} />
          <InfoRow label="From" value={`${updated.originCustomer || '—'}, ${updated.originCity}, ${updated.originState}`} />
          <InfoRow label="To" value={`${updated.destCustomer || '—'}, ${updated.destCity}, ${updated.destState}`} />
          <InfoRow label="Commodity" value={updated.commodity} />
          <InfoRow label="Tons" value={`${updated.tons} T`} />
          {updated.notes ? <InfoRow label="Notes" value={updated.notes} /> : null}
        </Section>

        <Section title="Driver & Vehicle">
          <InfoRow label="Driver" value={driver ? driver.name : updated.driverId || '—'} />
          <InfoRow label="Vehicle" value={updated.vehicleNumber || '—'} />
          <InfoRow label="Total Payment" value={`₹${Number(updated.driverPayment?.totalAmount || 0).toLocaleString('en-IN')}`} />
          <InfoRow label="Advance" value={`₹${Number(updated.driverPayment?.advance || 0).toLocaleString('en-IN')}`} />
        </Section>

        <Section title="Fuel Entries">
          {(updated.fuelEntries || []).length === 0 ? (
            <Text style={styles.noData}>No fuel entries</Text>
          ) : (
            (updated.fuelEntries || []).map(f => {
              const cost = (Number(f.litres) || 0) * (Number(f.perLtrCost) || 0)
              return (
                <View key={f.id} style={styles.fuelEntryRow}>
                  <View>
                    <Text style={styles.fuelEntryDate}>{f.date}</Text>
                    <Text style={styles.fuelEntryDetail}>
                      {f.litres}L @ ₹{f.perLtrCost}/L
                    </Text>
                  </View>
                  <Text style={styles.fuelEntryCost}>₹{cost.toLocaleString('en-IN')}</Text>
                </View>
              )
            })
          )}
        </Section>

        <Section title="Expenses">
          {(updated.otherExpenses || []).map(e => (
            <InfoRow key={e.id} label={e.type} value={`₹${Number(e.amount).toLocaleString('en-IN')}`} />
          ))}
          {(updated.managedExpenses || []).map(e => (
            <InfoRow key={e.id} label={e.type} value={`₹${Number(e.amount).toLocaleString('en-IN')}`} />
          ))}
          {(updated.tollExpense > 0) && (
            <InfoRow label="Toll" value={`₹${Number(updated.tollExpense).toLocaleString('en-IN')}`} />
          )}
          {(updated.otherExpenses || []).length === 0 &&
           (updated.managedExpenses || []).length === 0 &&
           !updated.tollExpense && (
            <Text style={styles.noData}>No expenses recorded</Text>
          )}
        </Section>

        <Section title="Financial Summary">
          <InfoRow label="Revenue" value={`₹${revenue.toLocaleString('en-IN')}`} />
          <InfoRow label="Fuel Cost" value={`₹${fuel.toLocaleString('en-IN')}`} />
          <InfoRow label="Other Expenses" value={`₹${expenses.toLocaleString('en-IN')}`} />
          <View style={styles.divider} />
          <InfoRow label="Net Pay" value={`₹${net.toLocaleString('en-IN')}`} bold />
        </Section>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  )
}

export default function ManageTripScreen() {
  const { trips } = useData()
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [filter, setFilter] = useState('all')

  if (selectedTrip) {
    return (
      <TripDetail
        trip={selectedTrip}
        onBack={() => setSelectedTrip(null)}
      />
    )
  }

  const filtered = filter === 'all'
    ? trips
    : trips.filter(t => t.status === filter)

  const renderTrip = ({ item: trip }) => {
    const sc = STATUS_COLORS[trip.status] || STATUS_COLORS.planned
    const needsVerify = !trip.verifiedTripDetails || !trip.verifiedFuelDetails

    return (
      <TouchableOpacity
        style={styles.tripCard}
        onPress={() => setSelectedTrip(trip)}
        activeOpacity={0.7}
      >
        <View style={styles.tripCardHeader}>
          <Text style={styles.tripRoute}>{trip.originCity} → {trip.destCity}</Text>
          <View style={[styles.badge, { backgroundColor: sc.bg }]}>
            <Text style={[styles.badgeText, { color: sc.text }]}>
              {trip.status.replace('_', ' ')}
            </Text>
          </View>
        </View>
        <Text style={styles.tripSub}>{trip.commodity} · {trip.tons}T · {trip.date}</Text>
        {needsVerify && trip.verifiedCreate && (
          <Text style={styles.pendingVerify}>Pending verification</Text>
        )}
        <View style={styles.verifyStatus}>
          <Text style={[styles.verifyDot, { color: trip.verifiedTripDetails ? '#059669' : '#d1d5db' }]}>
            ● Trip details
          </Text>
          <Text style={[styles.verifyDot, { color: trip.verifiedFuelDetails ? '#059669' : '#d1d5db' }]}>
            ● Fuel details
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={t => String(t.id)}
        renderItem={renderTrip}
        contentContainerStyle={styles.list}
        ListHeaderComponent={() => (
          <View>
            <Text style={styles.listTitle}>All Trips</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
              {['all', 'planned', 'in_progress', 'completed'].map(f => (
                <TouchableOpacity
                  key={f}
                  style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
                  onPress={() => setFilter(f)}
                >
                  <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                    {f === 'all' ? 'All' : f.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No trips found</Text>
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  list: { padding: 16 },
  listTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
  filterRow: { marginBottom: 14 },
  filterBtn: {
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: '#f3f4f6', marginRight: 8,
  },
  filterBtnActive: { backgroundColor: '#2563eb' },
  filterText: { fontSize: 13, color: '#6b7280', fontWeight: '600', textTransform: 'capitalize' },
  filterTextActive: { color: '#fff' },
  tripCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: '#e5e7eb',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  tripCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  tripRoute: { fontSize: 15, fontWeight: '700', color: '#111827', flex: 1, marginRight: 8 },
  badge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  tripSub: { fontSize: 13, color: '#6b7280', marginBottom: 4 },
  pendingVerify: { fontSize: 12, color: '#d97706', fontWeight: '600', marginBottom: 4 },
  verifyStatus: { flexDirection: 'row', gap: 12 },
  verifyDot: { fontSize: 12, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { fontSize: 16, color: '#9ca3af', fontWeight: '600' },
  detailHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff',
  },
  backText: { fontSize: 15, color: '#2563eb', fontWeight: '600' },
  scroll: { flex: 1 },
  verifySection: { margin: 16, backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  verifySectionTitle: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 12 },
  verifyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, paddingHorizontal: 14,
    backgroundColor: '#f9fafb', borderRadius: 12,
    borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 8,
  },
  verifyBtnChecked: { backgroundColor: '#f0fdf4', borderColor: '#86efac' },
  verifyBtnDisabled: { opacity: 0.5 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 2, borderColor: '#d1d5db',
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: '#059669', borderColor: '#059669' },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: '700' },
  verifyLabel: { flex: 1, fontSize: 13, color: '#6b7280', fontWeight: '500' },
  verifyLabelChecked: { color: '#065f46', fontWeight: '600' },
  allVerifiedBanner: {
    backgroundColor: '#d1fae5', borderRadius: 10, padding: 10, marginTop: 4, alignItems: 'center',
  },
  allVerifiedText: { fontSize: 13, color: '#065f46', fontWeight: '700' },
  section: { marginHorizontal: 16, marginBottom: 14 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  sectionCard: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 16, paddingVertical: 4 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#f3f4f6' },
  infoLabel: { fontSize: 13, color: '#6b7280', flex: 1 },
  infoValue: { fontSize: 13, color: '#111827', flex: 2, textAlign: 'right' },
  noData: { fontSize: 13, color: '#9ca3af', textAlign: 'center', paddingVertical: 12 },
  fuelEntryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#f3f4f6' },
  fuelEntryDate: { fontSize: 13, fontWeight: '600', color: '#111827' },
  fuelEntryDetail: { fontSize: 12, color: '#6b7280' },
  fuelEntryCost: { fontSize: 14, fontWeight: '700', color: '#2563eb' },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 4 },
})
