import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { FloatingActionButton } from '../../components/FloatingActionButton';
import { TransactionItem } from '../../components/TransactionItem';
import { BarChart, LineChart, PieChart } from 'react-native-gifted-charts';
import { LinearGradient } from 'expo-linear-gradient';
import { ExportReportSheet } from './ExportReportSheet';
import { useAuth } from '../../contexts/AuthContext';
import { transactionService } from '../../services/transaction.service';
import { budgetService } from '../../services/budget.service';
import { Transaction, TransactionSummary, MonthlyFlow } from '../../types/transaction';
import { BudgetStatusResponse } from '../../types/budget';
import { getErrorMessage, isNetworkError } from '../../utils/errors';
import { useErrorToast } from '../../contexts/ErrorToastContext';
import { formatCurrency } from '../../utils/currency';
import { formatSmartDate, formatRelativeTime } from '../../utils/dates';
import { notificationService } from '../../services/notification.service';
import { Notification } from '../../types/notification';
import { financialResourceService } from '../../services/financialResourceService';
import { FinancialResource } from '../../types/financialResource';
import { AccountsAndCardsWidget } from '../../components/dashboard/AccountsAndCardsWidget';
import { goalService } from '../../services/goal.service';
import { Goal } from '../../types/goal';

export function DashboardScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { showError } = useErrorToast();
  const [showReportSheet, setShowReportSheet] = useState(false);
  // Checkbox options elevated here so they persist across CustomDate navigation
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeAi, setIncludeAi] = useState(true);
  const [includeCategories, setIncludeCategories] = useState(true);
  const [includeComparison, setIncludeComparison] = useState(false);

  useEffect(() => {
    if (route.params?.source === 'CustomDate') {
      setShowReportSheet(true);
    }
  }, [route.params]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatusResponse[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [financialResources, setFinancialResources] = useState<FinancialResource[]>([]);
  const [recentGoals, setRecentGoals] = useState<Goal[]>([]);
  const [monthlyFlow, setMonthlyFlow] = useState<MonthlyFlow[]>([]);

  const loadDashboardData = useCallback(async () => {
    try {
      setError(null);
      const [summaryData, recentData, budgetData, notificationsData, count, pmData, goalsData, flowData] = await Promise.all([
        transactionService.getSummary(),
        transactionService.getRecentTransactions(5),
        budgetService.getBudgetStatus(),
        notificationService.getNotifications(undefined, false, 0, 3),
        notificationService.getUnreadCount(),
        financialResourceService.getAll(),
        goalService.getGoals(),
        transactionService.getMonthlyFlow(12),
      ]);
      setSummary(summaryData);
      setRecentTransactions(recentData);
      setBudgetStatus(budgetData);
      setRecentNotifications(notificationsData.content);
      setUnreadCount(count);
      setFinancialResources(pmData);
      setRecentGoals(goalsData.slice(0, 2));
      setMonthlyFlow(flowData);
    } catch (err) {
      const msg = getErrorMessage(err, 'Falha ao carregar dados do dashboard.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();

      const interval = setInterval(async () => {
        try {
          const count = await notificationService.getUnreadCount();
          setUnreadCount(count);
        } catch (e) {
          // Ignore polling errors
        }
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }, [loadDashboardData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  }, [loadDashboardData]);

  // Build chart data from monthly flow (strict Jan to Dec calendar year)
  const monthNames = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];
  const fullFlow = monthNames.map((mName) => {
    const existing = monthlyFlow?.find(
      (item) => item.month.toLowerCase().replace('.', '') === mName.toLowerCase().replace('.', '')
    );
    return existing || { month: mName, income: 0, expense: 0 };
  });

  const barData = fullFlow.map((item) => ({
    value: item.expense,
    label: item.month,
  }));
  const lineChartData = fullFlow.map((item) => ({
    value: item.income,
    label: item.month,
  }));

  if (loading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text className="text-on-surface-variant text-body-md mt-4">Carregando...</Text>
      </View>
    );
  }

  if (error && !summary) {
    return (
      <View className="flex-1 bg-background">
        <View
          className="flex-row justify-between items-center px-5 h-20 bg-surface z-50"
          style={{ paddingTop: insets.top }}
        >
          <Text className="text-headline-md font-bold text-on-surface">Dashboard</Text>
        </View>
        <View className="flex-1 justify-center items-center px-5 gap-4">
          <View className="w-16 h-16 rounded-full bg-error/10 items-center justify-center">
            <MaterialIcons name="cloud-off" size={32} color={Colors.error} />
          </View>
          <Text className="text-headline-md font-bold text-on-surface text-center">
            Erro ao carregar
          </Text>
          <Text className="text-body-md text-on-surface-variant text-center">{error}</Text>
          <TouchableOpacity
            className="bg-primary-container px-6 py-3 rounded-xl mt-2"
            onPress={() => {
              setLoading(true);
              loadDashboardData();
            }}
          >
            <Text className="text-on-primary-container font-label-md font-bold">Tentar novamente</Text>
          </TouchableOpacity>

        </View>
      </View>
    );
  }

  const formatCurrency = (val: number) => {
    return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <View className="flex-1 bg-background" style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Top App Bar */}
      <View
        className="flex-row justify-between items-center px-5 bg-surface z-50 border-b border-outline-variant/10"
        style={{ paddingTop: insets.top + 8, paddingBottom: 16 }}
      >
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-high border border-outline-variant/30 mr-1">
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} className="w-full h-full" />
            ) : (
              <View className="w-full h-full bg-primary/20 items-center justify-center">
                <MaterialIcons name="person" size={24} color={Colors.primary} />
              </View>
            )}
          </View>
          <View>
            <Text className="text-headline-md font-bold text-on-surface">Olá, {user?.name || 'Usuário'}</Text>
            <Text className="text-label-md text-on-surface-variant">Veja como estão suas finanças</Text>
          </View>
        </View>
        <View className="flex-row gap-1">
          <TouchableOpacity
            className="w-10 h-10 items-center justify-center rounded-full"
            onPress={() => setShowReportSheet(true)}
          >
            <MaterialIcons name="description" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', position: 'relative' }}
            onPress={() => navigation.navigate('Notifications')}
          >
            <MaterialIcons name="notifications" size={24} color={Colors.primary} />
            {unreadCount > 0 && (
              <View style={{
                position: 'absolute',
                top: 4,
                right: 4,
                minWidth: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: '#ef4444',
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 3,
                borderWidth: 1.5,
                borderColor: Colors.surface,
              }}>
                <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#fff', lineHeight: 12 }}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5 pt-4"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {error && summary && (
          <View className="bg-error/10 rounded-xl px-4 py-3 flex-row items-center gap-3 mb-4 border border-error/20">
            <MaterialIcons name="error-outline" size={20} color={Colors.error} />
            <Text className="text-body-sm text-error flex-1">{error}</Text>
            <TouchableOpacity onPress={() => setError(null)}>
              <MaterialIcons name="close" size={18} color={Colors.error} />
            </TouchableOpacity>
          </View>
        )}
        {/* Main Balance Card - Net Worth (Tappable) */}
        <TouchableOpacity
          className="bg-surface-variant rounded-xl p-6 shadow-md mb-6 relative overflow-hidden"
          onPress={() => navigation.navigate('FinancialAccounts')}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={[`${Colors.primary}20`, 'rgba(0,0,0,0)']}
            style={{ position: 'absolute', right: -40, top: -40, width: 220, height: 220, borderRadius: 110 }}
          />
          <View className="flex-row justify-between items-start">
            <View>
              <Text className="text-label-md text-on-surface-variant">Patrimônio Líquido</Text>
              <Text className="text-numeric-display font-medium text-on-surface mt-1">
                {formatCurrency(financialResources.filter(m => m.type !== 'CREDIT_CARD').reduce((acc, curr) => acc + (curr.currentBalance || 0), 0))}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={Colors.outline} />
          </View>
          <View className="flex-row items-center gap-1 mt-2">
            <MaterialIcons
              name={(summary?.savingsRate || 0) >= 0 ? "trending-up" : "trending-down"}
              size={16}
              color={(summary?.savingsRate || 0) >= 0 ? "#4ade80" : Colors.error}
            />
            <Text className={`text-label-md ${(summary?.savingsRate || 0) >= 0 ? 'text-[#4ade80]' : 'text-error'}`}>
              Taxa de poupança: {summary?.savingsRate?.toFixed(1) || '0'}%
            </Text>
          </View>
        </TouchableOpacity>

        {/* Quick Summary Grid */}
        <View className="flex-row justify-between mb-8 gap-3">
          <View className="flex-1 bg-surface-variant rounded-xl p-4 shadow-sm">
            <View className="flex-row items-center justify-between">
              <Text className="text-label-md text-on-surface-variant">Receitas</Text>
              <MaterialIcons name="arrow-downward" size={16} color="#4ade80" />
            </View>
            <Text className="text-body-lg font-bold text-on-surface mt-2">
              {formatCurrency(summary?.totalIncome || 0)}
            </Text>
          </View>
          <View className="flex-1 bg-surface-variant rounded-xl p-4 shadow-sm">
            <View className="flex-row items-center justify-between">
              <Text className="text-label-md text-on-surface-variant">Despesas</Text>
              <MaterialIcons name="arrow-upward" size={16} color={Colors.error} />
            </View>
            <Text className="text-body-lg font-bold text-on-surface mt-2">
              {formatCurrency(summary?.totalExpense || 0)}
            </Text>
          </View>
        </View>

        {/* Recent Notifications Widget */}
        <View className="mb-8">
          <View className="flex-row justify-between items-end mb-4">
            <Text className="text-headline-md font-semibold text-on-surface">Notificações recentes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
              <Text className="text-label-md text-primary">Ver todas</Text>
            </TouchableOpacity>
          </View>
          <View className="bg-surface-variant rounded-xl p-2 shadow-sm">
            {recentNotifications.length === 0 ? (
              <View className="p-4 items-center">
                <Text className="text-on-surface-variant text-label-md">Nenhuma notificação</Text>
              </View>
            ) : (
              recentNotifications.map((n, i) => (
                <TouchableOpacity
                  key={n.id}
                  className={`p-3 flex-row items-center gap-3 ${i < recentNotifications.length - 1 ? 'border-b border-outline-variant/10' : ''}`}
                  onPress={() => navigation.navigate('Notifications')}
                >
                  <View className={`w-8 h-8 rounded-full items-center justify-center ${n.isRead ? 'bg-surface-container' : 'bg-primary/10'}`}>
                    <MaterialIcons
                      name={n.category === 'INVESTMENTS' ? 'show-chart' : n.category === 'FINANCE' ? 'account-balance-wallet' : 'notifications'}
                      size={16}
                      color={n.isRead ? Colors.onSurfaceVariant : Colors.primary}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className={`text-body-sm ${n.isRead ? 'text-on-surface-variant' : 'text-on-surface font-semibold'}`} numberOfLines={1}>{n.title}</Text>
                    <Text className="text-[10px] text-on-surface-variant">{formatRelativeTime(n.createdAt)}</Text>
                  </View>
                  {!n.isRead && <View className="w-2 h-2 rounded-full bg-primary" />}
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

        {/* AI Assistant Banner */}
        <TouchableOpacity
          className="bg-primary/10 rounded-2xl p-4 flex-row items-center justify-between border border-primary/20 mb-8"
          onPress={() => navigation.navigate('AiInsights')}
        >
          <View className="flex-row items-center gap-4 flex-1">
            <View className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
              <MaterialIcons name="auto-awesome" size={28} color={Colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-body-lg text-on-surface font-semibold">Conversar com IA</Text>
              <Text className="text-label-sm text-on-surface-variant" numberOfLines={1}>
                Obtenha insights personalizados sobre seus gastos
              </Text>
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={Colors.primary} />
        </TouchableOpacity>

        {/* Financial Goals Widget */}
        <View className="mb-8">
          <View className="flex-row justify-between items-end mb-4">
            <Text className="text-headline-md font-semibold text-on-surface">Minhas Metas</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Goals')}>
              <Text className="text-label-md text-primary">Ver todas</Text>
            </TouchableOpacity>
          </View>
          <View className="bg-surface-variant rounded-xl p-4 shadow-sm">
            {recentGoals.length === 0 ? (
              <TouchableOpacity
                className="items-center py-4"
                onPress={() => navigation.navigate('GoalForm')}
              >
                <MaterialIcons name="flag" size={32} color={Colors.outline} />
                <Text className="text-on-surface-variant text-label-md mt-2">Nenhuma meta. Vamos criar uma?</Text>
              </TouchableOpacity>
            ) : (
              recentGoals.map((g) => (
                <TouchableOpacity
                  key={g.id}
                  className="mb-4 last:mb-0"
                  onPress={() => navigation.navigate('Goals')}
                >
                  <View className="flex-row justify-between items-center mb-2">
                    <View className="flex-row items-center gap-2">
                      <MaterialIcons name={(g.icon || 'star') as any} size={16} color={g.color || Colors.primary} />
                      <Text className="text-body-sm font-semibold text-on-surface">{g.name}</Text>
                    </View>
                    <Text className="text-[10px] font-bold text-on-surface-variant">{g.progressPercent.toFixed(0)}%</Text>
                  </View>
                  <View className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <View
                      className="h-full rounded-full"
                      style={{ width: `${Math.min(g.progressPercent, 100)}%`, backgroundColor: g.color || Colors.primary }}
                    />
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

        {/* Charts Section */}
        <View className="mb-8 rounded-xl p-5 shadow-sm" style={{ backgroundColor: 'rgb(50, 52, 61)' }}>
          <Text className="text-label-md text-on-surface-variant mb-4">Fluxo Mensal</Text>
          <View className="items-center">
            <BarChart
              data={barData.map((d) => ({ ...d, frontColor: Colors.primary + '80' }))}
              lineData={lineChartData.map((d) => ({ ...d, dataPointColor: '#4ade80' }))}
              width={260}
              height={130}
              barWidth={10}
              spacing={10}
              initialSpacing={8}
              noOfSections={4}
              yAxisTextStyle={{ color: Colors.onSurfaceVariant, fontSize: 9 }}
              yAxisColor={Colors.onSurfaceVariant + '40'}
              xAxisColor={Colors.onSurfaceVariant + '40'}
              rulesColor={Colors.onSurfaceVariant + '15'}
              rulesType="solid"
              formatYLabel={(val) => {
                const num = Number(val);
                if (isNaN(num) || num === 0) return '0';
                if (num >= 1000) return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}k`;
                return `${num}`;
              }}
              xAxisLabelTextStyle={{ color: Colors.onSurfaceVariant, fontSize: 8 }}
              lineBehindBars={false}
              lineConfig={{
                color: '#4ade80',
                thickness: 2,
                dataPointsColor: '#4ade80',
                dataPointsRadius: 3,
              }}
            />
          </View>
        </View>

        {/* Donut Chart — Gastos por Categoria */}
        {budgetStatus.length > 0 && (
          <View className="rounded-xl p-5 shadow-sm mb-8" style={{ backgroundColor: 'rgb(50, 52, 61)' }}>
            <Text className="text-label-md text-on-surface-variant mb-4">Gastos por Categoria</Text>
            <View className="flex-row items-center">
              <View className="items-center justify-center mr-4">
                <PieChart
                  data={budgetStatus
                    .filter((b) => b.spent > 0)
                    .map((b, i) => ({
                      value: b.spent,
                      color: [Colors.primary, '#51ac6fff', Colors.error, Colors.tertiary, Colors.secondary, Colors.warning][i % 6],
                    }))}
                  donut
                  radius={60}
                  innerRadius={40}
                  backgroundColor='#32343d'
                  centerLabelComponent={() => {
                    const total = budgetStatus.reduce((s, b) => s + b.spent, 0);
                    return (
                      <Text className="text-label-sm text-on-surface font-bold text-center">
                        {formatCurrency(total).replace(' ', '')}
                      </Text>
                    );
                  }}
                />
              </View>
              <View className="flex-1 gap-2">
                {budgetStatus.filter((b) => b.spent > 0).slice(0, 5).map((b, i) => (
                  <View key={b.categoryId} className="flex-row items-center gap-2">
                    <View
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: [Colors.primary, '#4ade80', Colors.error, Colors.tertiary, Colors.secondary, Colors.warning][i % 6],
                      }}
                    />
                    <Text className="text-label-sm text-on-surface">
                      {b.categoryName} • {formatCurrency(b.spent)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Recent Transactions */}
        <View className="mb-4">
          <View className="flex-row justify-between items-end mb-4">
            <Text className="text-headline-md font-semibold text-on-surface">Transações recentes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
              <Text className="text-label-md text-primary">Ver todas</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-surface-variant rounded-xl p-2 shadow-sm">
            {recentTransactions.length === 0 ? (
              <View className="p-6 items-center">
                <Text className="text-on-surface-variant text-body-md">Nenhuma transação encontrada</Text>
              </View>
            ) : (
              recentTransactions.map((tx) => (
                <View key={tx.id}>
                  <TransactionItem
                    id={tx.id}
                    title={tx.description}
                    subtitle={`${tx.category?.name || 'Outros'} • ${formatSmartDate(tx.date)}`}
                    amount={tx.amount}
                    type={tx.type}
                    icon={(tx.category?.icon || 'help-outline') as any}
                    onPress={() => { }}
                  />
                  <View className="h-[1px] bg-outline-variant/20 mx-3 my-1" />
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <FloatingActionButton onPress={() => navigation.navigate('NewTransaction')} />

      <ExportReportSheet
        visible={showReportSheet}
        onClose={() => setShowReportSheet(false)}
        onGenerated={(pdfUri, month, year, startDate, endDate) => {
          setShowReportSheet(false);
          navigation.navigate('ReportPreview', { pdfUri, month, year, startDate, endDate });
        }}
        onCustomDate={() => {
          setShowReportSheet(false); // Close modal before navigating
          navigation.navigate('CustomDate');
        }}
        customRange={route.params?.source === 'CustomDate' ? {
          startDate: route.params.customStartDate,
          endDate: route.params.customEndDate
        } : undefined}
        includeCharts={includeCharts}
        onIncludeChartsChange={setIncludeCharts}
        includeAi={includeAi}
        onIncludeAiChange={setIncludeAi}
        includeCategories={includeCategories}
        onIncludeCategoriesChange={setIncludeCategories}
        includeComparison={includeComparison}
        onIncludeComparisonChange={setIncludeComparison}
      />
    </View>
  );
}
