import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardScreen } from '../screens/main/DashboardScreen';
import { TransactionsScreen } from '../screens/main/TransactionsScreen';
import { BudgetScreen } from '../screens/main/BudgetScreen';
import { InvestmentsScreen } from '../screens/main/InvestmentsScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { AiInsightsScreen } from '../screens/main/AiInsightsScreen';
import { NewTransactionScreen } from '../screens/main/NewTransactionScreen';
import { ReportPreviewScreen } from '../screens/main/ReportPreviewScreen';
import { Colors } from '../constants/colors';
import { MaterialIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surfaceContainer,
          borderTopColor: Colors.outlineVariant,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.onSurfaceVariant,
        tabBarIcon: ({ color, size }) => {
          let iconName: any = 'home';

          if (route.name === 'Dashboard') {
            iconName = 'home';
          } else if (route.name === 'Transactions') {
            iconName = 'receipt-long';
          } else if (route.name === 'Budgets') {
            iconName = 'account-balance-wallet';
          } else if (route.name === 'Investments') {
            iconName = 'trending-up';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return <MaterialIcons name={iconName} size={28} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ tabBarLabel: 'Início' }}
      />
      <Tab.Screen 
        name="Transactions" 
        component={TransactionsScreen} 
        options={{ tabBarLabel: 'Transações' }}
      />
      <Tab.Screen 
        name="Budgets" 
        component={BudgetScreen} 
        options={{ tabBarLabel: 'Orçamentos' }}
      />
      <Tab.Screen 
        name="Investments" 
        component={InvestmentsScreen} 
        options={{ tabBarLabel: 'Investir' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ tabBarLabel: 'Perfil' }}
      />
    </Tab.Navigator>
  );
}

export function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="AiInsights" component={AiInsightsScreen} />
      <Stack.Screen name="NewTransaction" component={NewTransactionScreen} />
      <Stack.Screen name="ReportPreview" component={ReportPreviewScreen} />
    </Stack.Navigator>
  );
}
