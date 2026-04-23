import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Text } from 'react-native'
import { useAuth } from '../context/AuthContext'
import LoginScreen from '../screens/LoginScreen'
import CreateTripScreen from '../screens/CreateTripScreen'
import FuelDetailsScreen from '../screens/FuelDetailsScreen'
import ManageTripScreen from '../screens/ManageTripScreen'
import ProfileScreen from '../screens/ProfileScreen'

const Tab = createBottomTabNavigator()

const TAB_ICONS = {
  'Create Trip': '🗺',
  'Fuel Details': '⛽',
  'Manage Trip': '📋',
  'Profile': '👤',
}

function TabIcon({ label, focused }) {
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
      {TAB_ICONS[label] || '●'}
    </Text>
  )
}

export default function AppNavigator() {
  const { currentUser } = useAuth()

  if (!currentUser) {
    return (
      <NavigationContainer>
        <LoginScreen />
      </NavigationContainer>
    )
  }

  const jobs = currentUser.jobs || []

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => (
            <TabIcon label={route.name} focused={focused} />
          ),
          tabBarActiveTintColor: '#2563eb',
          tabBarInactiveTintColor: '#9ca3af',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopColor: '#e5e7eb',
            height: 80,
            paddingBottom: 16,
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
          headerStyle: { backgroundColor: '#fff', shadowColor: 'transparent' },
          headerTintColor: '#111827',
          headerTitleStyle: { fontWeight: '700', fontSize: 17 },
        })}
      >
        {jobs.includes('create_trip') && (
          <Tab.Screen
            name="Create Trip"
            component={CreateTripScreen}
            options={{ title: 'Create Trip', headerTitle: 'My Trips' }}
          />
        )}
        {jobs.includes('fuel_details') && (
          <Tab.Screen
            name="Fuel Details"
            component={FuelDetailsScreen}
            options={{ title: 'Fuel Details', headerTitle: 'Fuel Details' }}
          />
        )}
        {jobs.includes('manage_trip') && (
          <Tab.Screen
            name="Manage Trip"
            component={ManageTripScreen}
            options={{ title: 'Manage Trip', headerTitle: 'Manage Trips' }}
          />
        )}
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: 'Profile', headerTitle: 'My Profile' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  )
}
