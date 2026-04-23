export const initialManagement = [
  {
    id: 1, managerId: 'MGR001', name: 'Priya Sharma', phone: '9900112233',
    email: 'priya@mylogestic.com', avatar: null,
    role: 'Trip Creator', jobs: ['create_trip'],
    username: 'priya.sharma', password: 'Pass@1234',
    bankDetails: { account: '****7745', ifsc: 'UTIB0001234', bank: 'Axis' },
    status: 'active',
  },
  {
    id: 2, managerId: 'MGR002', name: 'Vikram Desai', phone: '9811223344',
    email: 'vikram@mylogestic.com', avatar: null,
    role: 'Trip Manager', jobs: ['manage_trip', 'fuel_details'],
    username: 'vikram.desai', password: 'Pass@5678',
    bankDetails: { account: '****3390', ifsc: 'HDFC0002345', bank: 'HDFC' },
    status: 'active',
  },
]

export const initialDrivers = [
  { id: 1, driverId: 'DRV001', name: 'Ramesh Kumar', vehicleNumber: 'MH12AB1234' },
  { id: 2, driverId: 'DRV002', name: 'Suresh Patil', vehicleNumber: 'DL3CX5678' },
  { id: 3, driverId: 'DRV003', name: 'Anand Singh', vehicleNumber: null },
]

export const initialVehicles = [
  { id: 1, vehicleNumber: 'MH12AB1234', make: 'Tata', vehicleType: 'Truck', status: 'active' },
  { id: 2, vehicleNumber: 'DL3CX5678', make: 'Mahindra', vehicleType: 'Van', status: 'active' },
  { id: 3, vehicleNumber: 'KA05MN9999', make: 'Ashok Leyland', vehicleType: 'Truck', status: 'inactive' },
  { id: 4, vehicleNumber: 'TN09ZZ4321', make: 'Eicher', vehicleType: 'Truck', status: 'active' },
]

export const initialTrips = [
  {
    id: 1, status: 'completed',
    date: '2026-04-10',
    originCustomer: 'ABC Traders', originCity: 'Mumbai', originState: 'MH',
    destCustomer: 'XYZ Distributors', destCity: 'Pune', destState: 'MH',
    commodity: 'Electronics', tons: 5,
    driverId: 'DRV001', vehicleNumber: 'MH12AB1234',
    notes: 'Handle with care',
    verifiedCreate: true,
    otherExpenses: [{ id: 1, type: 'Loading', amount: 500, description: 'Loading charges' }],
    driverPayment: { totalAmount: 3000, advance: 1500 },
    fuelEntries: [{ id: 1, date: '2026-04-10', odometer: 45000, litres: 40, perLtrCost: 105 }],
    fuelVerified: true,
    rateType: 'freight', costPerTon: 800, flatAmount: 0,
    tollExpense: 450, managedExpenses: [],
    verifiedManage: true, verifiedTripDetails: true, verifiedFuelDetails: true,
    createdBy: 'MGR001',
  },
  {
    id: 2, status: 'completed',
    date: '2026-04-14',
    originCustomer: 'Fresh Farms', originCity: 'Delhi', originState: 'DL',
    destCustomer: 'Retail Hub', destCity: 'Jaipur', destState: 'RJ',
    commodity: 'Dry Goods', tons: 8,
    driverId: 'DRV002', vehicleNumber: 'DL3CX5678',
    notes: 'Toll charges included',
    verifiedCreate: true,
    otherExpenses: [{ id: 1, type: 'Unloading', amount: 600, description: 'Unloading charges' }],
    driverPayment: { totalAmount: 4000, advance: 2000 },
    fuelEntries: [{ id: 1, date: '2026-04-14', odometer: 67000, litres: 60, perLtrCost: 104 }],
    fuelVerified: true,
    rateType: 'flat', costPerTon: 0, flatAmount: 4500,
    tollExpense: 650, managedExpenses: [],
    verifiedManage: true, verifiedTripDetails: true, verifiedFuelDetails: true,
    createdBy: 'MGR001',
  },
  {
    id: 3, status: 'in_progress',
    date: '2026-04-18',
    originCustomer: 'AutoParts Co', originCity: 'Bangalore', originState: 'KA',
    destCustomer: 'Service Hub', destCity: 'Chennai', destState: 'TN',
    commodity: 'Auto Parts', tons: 10,
    driverId: 'DRV001', vehicleNumber: 'MH12AB1234',
    notes: '',
    verifiedCreate: true,
    otherExpenses: [],
    driverPayment: { totalAmount: 5000, advance: 2000 },
    fuelEntries: [{ id: 1, date: '2026-04-18', odometer: 45150, litres: 50, perLtrCost: 106 }],
    fuelVerified: false,
    rateType: 'freight', costPerTon: 700, flatAmount: 0,
    tollExpense: 0, managedExpenses: [],
    verifiedManage: false, verifiedTripDetails: false, verifiedFuelDetails: false,
    createdBy: 'MGR001',
  },
  {
    id: 4, status: 'planned',
    date: '2026-04-22',
    originCustomer: 'FMCG Corp', originCity: 'Hyderabad', originState: 'TS',
    destCustomer: 'City Store', destCity: 'Vijayawada', destState: 'AP',
    commodity: 'FMCG', tons: 7.5,
    driverId: null, vehicleNumber: null,
    notes: 'Confirm loading time',
    verifiedCreate: false,
    otherExpenses: [],
    driverPayment: { totalAmount: 0, advance: 0 },
    fuelEntries: [],
    fuelVerified: false,
    rateType: 'freight', costPerTon: 0, flatAmount: 0,
    tollExpense: 0, managedExpenses: [],
    verifiedManage: false, verifiedTripDetails: false, verifiedFuelDetails: false,
    createdBy: 'MGR001',
  },
]

export function tripRevenue(trip) {
  if (trip.rateType === 'flat') return Number(trip.flatAmount) || 0
  return (Number(trip.tons) || 0) * (Number(trip.costPerTon) || 0)
}

export function tripFuelCost(trip) {
  return (trip.fuelEntries || []).reduce(
    (s, f) => s + (Number(f.litres) || 0) * (Number(f.perLtrCost) || 0), 0
  )
}

export function tripAllExpenses(trip) {
  const e1 = (trip.otherExpenses || []).reduce((s, e) => s + (Number(e.amount) || 0), 0)
  const e2 = (trip.managedExpenses || []).reduce((s, e) => s + (Number(e.amount) || 0), 0)
  return e1 + e2 + (Number(trip.tollExpense) || 0)
}

export function tripNetPay(trip) {
  return tripRevenue(trip) - tripFuelCost(trip) - tripAllExpenses(trip)
}

export function tripStatus(trip) {
  if (trip.verifiedManage && trip.verifiedTripDetails && trip.verifiedFuelDetails) return 'completed'
  if (trip.verifiedCreate) return 'in_progress'
  return 'planned'
}
