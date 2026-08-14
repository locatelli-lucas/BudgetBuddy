import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
  ActivityIndicator, TextInput, LayoutAnimation
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/colors';
import { financialResourceService } from '../../../services/financialResourceService';
import { GroupedFinancialResources, FinancialInstitutionGroup, FinancialResource } from '../../../types/financialResource';
import { useErrorToast } from '../../../contexts/ErrorToastContext';
import { formatCurrency } from '../../../utils/currency';

export function FinancialAccountsScreen({ navigation }: any) {
  const [data, setData] = useState<GroupedFinancialResources | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const { showError } = useErrorToast();

  const loadData = useCallback(async () => {
    try {
      const result = await financialResourceService.getGrouped();
      setData(result);
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const toggleExpand = (name: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const filteredInstitutions = data?.institutions.filter(inst => {
    const matchesSearch = inst.institutionName.toLowerCase().includes(search.toLowerCase()) ||
      inst.financialResources.some(pm => pm.name.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (filter === 'ALL') return true;

    return inst.financialResources.some(pm => {
      if (filter === 'CREDIT_CARD') return pm.type === 'CREDIT_CARD';
      if (filter === 'ACCOUNTS') return pm.type === 'CHECKING_ACCOUNT' || pm.type === 'SAVINGS_ACCOUNT';
      if (filter === 'PIX') return pm.type === 'CASH_WALLET'; // Note: PIX is now a payment method, not a resource type
      if (filter === 'WALLETS') return pm.type === 'DIGITAL_WALLET';
      return true;
    });
  }) || [];

  const stats = {
    accounts: data?.institutions.reduce((acc, inst) => acc + inst.financialResources.filter(m => m.type.includes('ACCOUNT')).length, 0) || 0,
    cards: data?.institutions.reduce((acc, inst) => acc + inst.financialResources.filter(m => m.type === 'CREDIT_CARD').length, 0) || 0,
    wallets: data?.institutions.reduce((acc, inst) => acc + inst.financialResources.filter(m => m.type === 'DIGITAL_WALLET').length, 0) || 0,
    cash: data?.netWorth || 0,
    creditLimit: data?.institutions.reduce((acc, inst) => acc + inst.financialResources.reduce((sum, m) => sum + (m.creditLimit || 0), 0), 0) || 0,
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']} style={{ flex: 1, backgroundColor: Colors.background }}>
      <View className="flex-row items-center px-5 py-4 border-b border-outline-variant/10 bg-surface">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <View className="ml-2 flex-1">
          <Text className="text-headline-sm font-bold text-on-surface">Recursos Financeiros</Text>
          <Text className="text-label-md text-on-surface-variant">Gerencie suas contas, cartões e saldos</Text>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <ScrollView
          className="flex-1 px-5"
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingVertical: 24, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        >
          {/* Net Worth Summary */}
          <View className="bg-primary-container p-6 rounded-3xl mb-8 relative overflow-hidden">
            <Text className="text-label-md text-on-primary-container/70 font-medium">Patrimônio Líquido Total</Text>
            <Text className="text-display-sm font-bold text-on-primary-container mt-1">
              {formatCurrency(data?.netWorth || 0)}
            </Text>
            <View className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-on-primary-container/10" />
          </View>

          {/* Quick Stats Grid */}
          <View className="flex-row flex-wrap gap-3 mb-8">
             <StatCard label="Contas" value={stats.accounts} icon="account-balance" color={Colors.primary} />
             <StatCard label="Cartões" value={stats.cards} icon="credit-card" color="#ef4444" />
             <StatCard label="Carteiras" value={stats.wallets} icon="account-balance-wallet" color="#10b981" />
             <StatCard label="Crédito Disp." value={formatCurrency(stats.creditLimit)} icon="payments" color="#f59e0b" wide />
          </View>

          {/* Search and Filters */}
          <View className="gap-4 mb-6">
            <View className="flex-row items-center bg-surface-container rounded-2xl px-4 h-12 border border-outline-variant/20">
              <MaterialIcons name="search" size={20} color={Colors.outline} />
              <TextInput
                className="flex-1 ml-2 text-body-md text-on-surface"
                placeholder="Buscar instituição ou conta..."
                placeholderTextColor={Colors.outline}
                value={search}
                onChangeText={setSearch}
              />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5 px-5">
              <FilterChip label="Tudo" active={filter === 'ALL'} onPress={() => setFilter('ALL')} />
              <FilterChip label="Contas" active={filter === 'ACCOUNTS'} onPress={() => setFilter('ACCOUNTS')} />
              <FilterChip label="Crédito" active={filter === 'CREDIT_CARD'} onPress={() => setFilter('CREDIT_CARD')} />
              <FilterChip label="Carteiras" active={filter === 'WALLETS'} onPress={() => setFilter('WALLETS')} />
            </ScrollView>
          </View>

          {/* Institution List */}
          <View className="gap-4">
            {filteredInstitutions.length === 0 ? (
              <View className="py-12 items-center">
                 <MaterialIcons name="account-balance" size={48} color={Colors.outline} />
                 <Text className="text-body-lg text-on-surface-variant mt-4 text-center">Nenhuma conta encontrada</Text>
              </View>
            ) : (
              filteredInstitutions.map((inst) => (
                <InstitutionCard
                  key={inst.institutionName}
                  inst={inst}
                  isExpanded={expanded[inst.institutionName]}
                  onToggle={() => toggleExpand(inst.institutionName)}
                  onPressPM={(pm) => navigation.navigate('FinancialResourceForm', { item: pm })}
                />
              ))
            )}
          </View>
        </ScrollView>
      </View>

      {/* FAB */}
      <TouchableOpacity
        className="absolute right-6 bottom-6 w-14 h-14 rounded-2xl bg-primary items-center justify-center shadow-lg"
        onPress={() => navigation.navigate('FinancialResourceForm')}
      >
        <MaterialIcons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function StatCard({ label, value, icon, color, wide }: any) {
  return (
    <View
      className={`${wide ? 'w-full' : 'flex-1'} bg-surface-container p-4 rounded-2xl border border-outline-variant/10`}
      style={wide ? {} : { minWidth: '30%' }}
    >
      <View className="flex-row items-center gap-2 mb-1">
        <MaterialIcons name={icon} size={16} color={color} />
        <Text className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">{label}</Text>
      </View>
      <Text className="text-body-lg font-bold text-on-surface">{value}</Text>
    </View>
  );
}

function FilterChip({ label, active, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`px-4 py-2 rounded-full mr-2 border ${active ? 'bg-primary border-primary' : 'bg-surface-container border-outline-variant/30'}`}
    >
      <Text className={`text-label-md ${active ? 'text-white font-bold' : 'text-on-surface-variant'}`}>{label}</Text>
    </TouchableOpacity>
  );
}

function InstitutionCard({ inst, isExpanded, onToggle, onPressPM }: { inst: FinancialInstitutionGroup, isExpanded: boolean, onToggle: () => void, onPressPM: (pm: FinancialResource) => void }) {
  return (
    <View className="bg-surface-variant rounded-3xl overflow-hidden border border-outline-variant/20 shadow-sm">
      <TouchableOpacity
        onPress={onToggle}
        className="p-5 flex-row items-center justify-between"
      >
        <View className="flex-row items-center gap-4">
           <View className="w-12 h-12 rounded-2xl bg-surface-container items-center justify-center">
              <MaterialIcons name="account-balance" size={24} color={Colors.primary} />
           </View>
           <View>
              <Text className="text-title-md font-bold text-on-surface">{inst.institutionName}</Text>
              <Text className="text-label-sm text-on-surface-variant">{inst.resourceCount} recurso(s) vinculado(s)</Text>
           </View>
        </View>
        <View className="flex-row items-center gap-2">
           <Text className="text-title-md font-bold text-on-surface">{formatCurrency(inst.totalBalance)}</Text>
           <MaterialIcons name={isExpanded ? "expand-less" : "expand-more"} size={20} color={Colors.onSurfaceVariant} />
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View className="px-5 pb-5 pt-0 gap-3 border-t border-outline-variant/10">
          {inst.financialResources.map(pm => (
            <TouchableOpacity
              key={pm.id}
              onPress={() => onPressPM(pm)}
              className="flex-row items-center justify-between bg-surface-container/50 p-4 rounded-2xl border border-outline-variant/10"
            >
              <View className="flex-row items-center gap-3">
                 <MaterialIcons
                    name={pm.type === 'CREDIT_CARD' ? 'credit-card' : 'account-balance'}
                    size={20}
                    color={pm.type === 'CREDIT_CARD' ? Colors.primary : Colors.onSurfaceVariant}
                 />
                 <View>
                    <Text className="text-body-md font-semibold text-on-surface">{pm.name}</Text>
                    <Text className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">{pm.type.replace('_', ' ')}</Text>
                 </View>
              </View>
              <View className="items-end">
                 {pm.type === 'CREDIT_CARD' ? (
                   <>
                     <Text className="text-body-md font-bold text-primary">{formatCurrency(pm.creditLimit || 0)}</Text>
                     <Text className="text-[9px] text-on-surface-variant uppercase font-bold">Limite</Text>
                   </>
                 ) : (
                   <Text className="text-body-md font-bold text-on-surface">{formatCurrency(pm.currentBalance || 0)}</Text>
                 )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
