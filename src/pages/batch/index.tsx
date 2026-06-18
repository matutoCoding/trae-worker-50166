import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import PageHeader from '@/components/PageHeader';
import BatchCard from '@/components/BatchCard';
import EmptyState from '@/components/EmptyState';
import { mockBatches } from '@/data/batch';
import type { BatchStatus } from '@/types';
import styles from './index.module.scss';

type FilterType = 'all' | BatchStatus;

const BatchPage: React.FC = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  const stats = useMemo(() => {
    return {
      total: mockBatches.length,
      totalBags: mockBatches.reduce((sum, b) => sum + b.totalBags, 0),
      totalVolume: mockBatches.reduce((sum, b) => sum + b.totalVolume, 0),
      qualified: mockBatches.filter(b => b.status === 'qualified').length
    };
  }, []);

  const filteredBatches = useMemo(() => {
    let list = mockBatches;
    if (filter !== 'all') {
      list = list.filter(b => b.status === filter);
    }
    if (searchKeyword.trim()) {
      const kw = searchKeyword.trim().toLowerCase();
      list = list.filter(b =>
        b.batchNumber.toLowerCase().includes(kw) ||
        b.stationName.toLowerCase().includes(kw) ||
        (b.notes && b.notes.toLowerCase().includes(kw))
      );
    }
    return list.sort((a, b) => b.collectDate.localeCompare(a.collectDate));
  }, [filter, searchKeyword]);

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'qualified', label: '合格' },
    { key: 'pending', label: '待检' },
    { key: 'abnormal', label: '异常' },
    { key: 'recalled', label: '已召回' }
  ];

  const handleAdd = () => {
    Taro.navigateTo({ url: '/pages/batch-create/index' });
  };

  const handleStationManage = () => {
    Taro.navigateTo({ url: '/pages/station/index' });
  };

  return (
    <View className={styles.page}>
      <PageHeader
        title="批次管理"
        subtitle={`共 ${stats.total} 个批次，${stats.totalBags} 袋血液`}
        rightContent={
          <View className={styles.headerActions}>
            <Button className={styles.addBtn} onClick={handleAdd}>+ 登记</Button>
          </View>
        }
      />

      <ScrollView
        className={styles.content}
        scrollY
        refresherEnabled
        refresherTriggered={false}
        onRefresherRefresh={() => Taro.stopPullDownRefresh()}
      >
        <Button className={styles.stationManageBtn} onClick={handleStationManage}>
          🏥 采血位/采血车资源管理
        </Button>

        <View className={styles.searchBar}>
          <Input
            className={styles.searchInput}
            placeholder="搜索批号、采血点..."
            value={searchKeyword}
            onInput={(e) => setSearchKeyword(e.detail.value)}
          />
        </View>

        <View className={styles.statsOverview}>
          <View className={styles.statCard}>
            <View className={styles.statCardMain}>
              <Text className={classnames(styles.statNum, styles.red)}>{stats.total}</Text>
              <Text className={styles.statUnit}>个</Text>
            </View>
            <Text className={styles.statLabel}>总批次</Text>
          </View>
          <View className={styles.statCard}>
            <View className={styles.statCardMain}>
              <Text className={classnames(styles.statNum, styles.green)}>{stats.totalBags}</Text>
              <Text className={styles.statUnit}>袋</Text>
            </View>
            <Text className={styles.statLabel}>总血袋</Text>
          </View>
          <View className={styles.statCard}>
            <View className={styles.statCardMain}>
              <Text className={classnames(styles.statNum, styles.orange)}>{(stats.totalVolume / 1000).toFixed(0)}</Text>
              <Text className={styles.statUnit}>L</Text>
            </View>
            <Text className={styles.statLabel}>总血量</Text>
          </View>
        </View>

        <View className={styles.filterTabs}>
          {filters.map(f => (
            <Button
              key={f.key}
              className={classnames(styles.filterTab, filter === f.key && styles.active)}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </Button>
          ))}
        </View>

        <View className={styles.batchList}>
          {filteredBatches.length > 0 ? (
            filteredBatches.map(batch => (
              <BatchCard key={batch.id} batch={batch} />
            ))
          ) : (
            <EmptyState
              icon="🩸"
              title="暂无批次数据"
              description="点击右上角登记按钮创建批次"
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default BatchPage;
