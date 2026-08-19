import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardScreen } from '../screens/main/DashboardScreen';
import { TransactionsScreen } from '../screens/main/TransactionsScreen';
import { BudgetScreen } from '../screens/main/BudgetScreen';
import { InvestmentsScreen } from '../screens/main/InvestmentsScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { AiInsightsScreen } from '../screens/main/AiInsightsScreen';
import { AiInsightDetailScreen } from '../screens/main/AiInsightDetailScreen';
import { NewTransactionScreen } from '../screens/main/NewTransactionScreen';
import { ReportPreviewScreen } from '../screens/main/ReportPreviewScreen';
import { NotificationsScreen } from '../screens/main/NotificationsScreen';
import { DatePickerScreen } from '../screens/main/DatePickerScreen';

// Budget sub-screens
import { CreateBudgetScreen } from '../screens/main/budgets/CreateBudgetScreen';
import { BudgetHistoryScreen } from '../screens/main/budgets/BudgetHistoryScreen';
import { DefineLimitScreen } from '../screens/main/budgets/DefineLimitScreen';
import { BudgetOptionsScreen } from '../screens/main/budgets/BudgetOptionsScreen';
import { RedefineLimitsScreen } from '../screens/main/budgets/RedefineLimitsScreen';
import { ManageCategoriesScreen } from '../screens/main/budgets/ManageCategoriesScreen';
import { AddCategoryScreen } from '../screens/main/budgets/AddCategoryScreen';
import { IconGalleryScreen } from '../screens/main/budgets/IconGalleryScreen';

// Investment sub-screens
import { AddAssetScreen } from '../screens/main/investments/AddAssetScreen';
import { RegisteredInstitutionsScreen } from '../screens/main/investments/RegisteredInstitutionsScreen';
import { InvestmentOptionsScreen } from '../screens/main/investments/InvestmentOptionsScreen';
import { AssetNewsScreen } from '../screens/main/investments/AssetNewsScreen';
import { NewsDetailsScreen } from '../screens/main/investments/NewsDetailsScreen';
import { PriceAlertsScreen } from '../screens/main/investments/PriceAlertsScreen';

// Profile sub-screens
import { PersonalDataScreen } from '../screens/profile/PersonalDataScreen';
import { SecurityScreen } from '../screens/profile/SecurityScreen';
import { ConnectedAccountsScreen } from '../screens/profile/ConnectedAccountsScreen';
import { UpdatePasswordScreen } from '../screens/profile/UpdatePasswordScreen';
import { TwoStepAuthScreen } from '../screens/profile/TwoStepAuthScreen';
import { BackupCodesScreen } from '../screens/profile/BackupCodesScreen';
import { NotificationSettingsScreen } from '../screens/profile/NotificationSettingsScreen';
import { NotificationOptionsScreen } from '../screens/profile/NotificationOptionsScreen';
import { AppearanceScreen } from '../screens/profile/AppearanceScreen';
import { DeleteAccountScreen } from '../screens/profile/DeleteAccountScreen';
import { DeleteAccountConfirmScreen } from '../screens/profile/DeleteAccountConfirmScreen';
import { DeletedAccountScreen } from '../screens/profile/DeletedAccountScreen';
import { LeaveAccountScreen } from '../screens/profile/LeaveAccountScreen';

// Report sub-screens
import { CustomDateScreen } from '../screens/report/CustomDateScreen';

// Payment Methods & Installments
import { FinancialResourceFormScreen } from '../screens/main/payment-methods/FinancialResourceFormScreen';
import { InstallmentPurchaseDetailScreen } from '../screens/main/installments/InstallmentPurchaseDetailScreen';
import { FinancialAccountsScreen } from '../screens/main/financial-accounts/FinancialAccountsScreen';

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
        options={{ tabBarLabel: 'Investimentos' }}
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
      
      {/* AI & Notifications */}
      <Stack.Screen name="AiInsights" component={AiInsightsScreen} />
      <Stack.Screen name="AiInsightDetail" component={AiInsightDetailScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      
      {/* Transactions */}
      <Stack.Screen name="NewTransaction" component={NewTransactionScreen} />
      <Stack.Screen name="DatePicker" component={DatePickerScreen} />
      
      {/* Reports */}
      <Stack.Screen name="ReportPreview" component={ReportPreviewScreen} />
      <Stack.Screen name="CustomDate" component={CustomDateScreen} />
      
      {/* Budgets */}
      <Stack.Screen name="CreateBudget" component={CreateBudgetScreen} />
      <Stack.Screen name="BudgetHistory" component={BudgetHistoryScreen} />
      <Stack.Screen name="DefineLimit" component={DefineLimitScreen} />
      <Stack.Screen name="BudgetOptions" component={BudgetOptionsScreen} />
      <Stack.Screen name="RedefineLimits" component={RedefineLimitsScreen} />
      <Stack.Screen name="ManageCategories" component={ManageCategoriesScreen} />
      <Stack.Screen name="AddCategory" component={AddCategoryScreen} />
      <Stack.Screen name="IconGallery" component={IconGalleryScreen} />
      
      {/* Investments */}
      <Stack.Screen name="AddAsset" component={AddAssetScreen} />
      <Stack.Screen name="RegisteredInstitutions" component={RegisteredInstitutionsScreen} />
      <Stack.Screen name="InvestmentOptions" component={InvestmentOptionsScreen} />
      <Stack.Screen name="AssetNews" component={AssetNewsScreen} />
      <Stack.Screen name="NewsDetails" component={NewsDetailsScreen} />
      <Stack.Screen name="PriceAlerts" component={PriceAlertsScreen} />

      {/* Profile */}
      <Stack.Screen name="PersonalData" component={PersonalDataScreen} />
      <Stack.Screen name="Security" component={SecurityScreen} />
      <Stack.Screen name="ConnectedAccounts" component={ConnectedAccountsScreen} />
      <Stack.Screen name="UpdatePassword" component={UpdatePasswordScreen} />
      <Stack.Screen name="TwoStepAuth" component={TwoStepAuthScreen} />
      <Stack.Screen name="BackupCodes" component={BackupCodesScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="NotificationOptions" component={NotificationOptionsScreen} />
      <Stack.Screen name="Appearance" component={AppearanceScreen} />
      <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
      <Stack.Screen name="DeleteAccountConfirm" component={DeleteAccountConfirmScreen} />
      <Stack.Screen name="DeletedAccount" component={DeletedAccountScreen} />
      <Stack.Screen name="LeaveAccount" component={LeaveAccountScreen} />

      {/* Payment Methods & Installments */}
      <Stack.Screen name="FinancialResourceForm" component={FinancialResourceFormScreen} />
      <Stack.Screen name="InstallmentPurchaseDetail" component={InstallmentPurchaseDetailScreen} />
      <Stack.Screen name="FinancialAccounts" component={FinancialAccountsScreen} />
    </Stack.Navigator>
  );
}
