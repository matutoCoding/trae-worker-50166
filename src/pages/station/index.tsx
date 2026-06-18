import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import PageHeader from '@/components/PageHeader';
import StatusTag from '@/components/StatusTag';
import EmptyState from '@/components/EmptyState';
import { mockStations } from '@/data/station';
import type { Station, StationType } from '@/types';
import { getStationTypeText } from '@/utils';
import styles from './index.module.scss';

type FilterType = 'all' | StationType | 'active' | 'inactive';

const StationPage: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [stations, setStations] = useState<Station[]>(mockStations);

  const stats = useMemo(() => {
    return {
      total: stations.length,
      active: stations.filter(s => s.status === 'active').length,
      vehicle: stations.filter(s => s.type === 'vehicle').length,
      fixed: stations.filter(s => s.type === 'fixed').length
    };
  }, [stations]);

  const filteredStations = useMemo(() => {
    let list = stations;
    if (filter === 'active') {
      list = list.filter(s => s.status === 'active');
    } else if (filter === 'inactive') {
      list = list.filter(s => s.status === 'inactive');
    } else if (filter === 'vehicle') {
      list = list.filter(s => s.type === 'vehicle');
    } else if (filter === 'fixed') {
      list = list.filter(s => s.type === 'fixed');
    }
    return list;
  }, [filter, stations]);

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'active', label: '启用中' },
    { key: 'inactive', label: '已停用' },
    { key: 'vehicle', label: '采血车' },
    { key: 'fixed', label: '固定点' }
  ];

  const handleToggleStatus = (stationId: string) => {
    const station = stations.find(s => s.id === stationId);
    if (!station) return;
    const nextStatus = station.status === 'active' ? 'inactive' : 'active';
    Taro.showModal({
      title: nextStatus === 'active' ? '启用采血位' : '停用采血位',
      content: `确定${nextStatus === 'active' ? '启用' : '停用'}「${station.name}」吗？`,
      confirmColor: nextStatus === 'active' ? '#00B42A' : '#E53935',
      success: (res) => {
        if (res.confirm) {
          setStations(prev =>
            prev.map(s =>
              s.id === stationId ? { ...s, status: nextStatus as 'active' | 'inactive' } : s
            )
          );
          Taro.showToast({ title: `已${nextStatus === 'active' ? '启用' : '停用'}`, icon: 'success' });
        }
      }
    });
  };

  const handleAdd = () => {
    Taro.showToast({ title: '新增功能开发中', icon: 'none' });
  };

  const handleStationClick = (station: Station) => {
    Taro.showActionSheet({
      itemList: ['编辑信息', '查看排期', station.status === 'active' ? '停用' : '启用'],
      success: (res) => {
        if (res.tapIndex === 0) {
          Taro.showToast({ title: '编辑功能开发中', icon: 'none' });
        } else if (res.tapIndex === 1) {
          Taro.switchTab({ url: '/pages/schedule/index' });
        } else if (res.tapIndex === 2) {
          handleToggleStatus(station.id);
        }
      }
    });
  };

  return (
    <View className={styles.page}>
      <PageHeader
        title="采血位管理"
        subtitle={`共 ${stats.total} 个采血点位`}
        rightContent={
          <View className={styles.headerActions}>
            <Button className={styles.addBtn} onClick={handleAdd}>+ 新增</Button>
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
        <View className={styles.statsOverview}>
          <View className={styles.statCard}>
            <View className={styles.statCardMain}>
              <Text className={classnames(styles.statNum, styles.red)}>{stats.total}</Text>
              <Text className={styles.statUnit}>个</Text>
            </View>
            <Text className={styles.statLabel}>总点位</Text>
          </View>
          <View className={styles.statCard}>
            <View className={styles.statCardMain}>
              <Text className={classnames(styles.statNum, styles.green)}>{stats.active}</Text>
              <Text className={styles.statUnit}>个</Text>
            </View>
            <Text className={styles.statLabel}>启用中</Text>
          </View>
          <View className={styles.statCard}>
            <View className={styles.statCardMain}>
              <Text className={classnames(styles.statNum, styles.blue)}>{stats.vehicle}</Text>
              <Text className={styles.statUnit}>辆</Text>
            </View>
            <Text className={styles.statLabel}>采血车</Text>
          </View>
          <View className={styles.statCard}>
            <View className={styles.statCardMain}>
              <Text className={classnames(styles.statNum, styles.orange)}>{stats.fixed}</Text>
              <Text className={styles.statUnit}>个</Text>
            </View>
            <Text className={styles.statLabel}>固定点</Text>
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

        {filteredStations.length > 0 ? (
          filteredStations.map(station => (
            <View
              key={station.id}
              className={styles.stationCard}
              onClick={() => handleStationClick(station)}
            >
              <View className={styles.cardHeader}>
                <View style={{ display: 'flex', alignItems: 'center', gap: '16rpx' }}>
                  <Text className={styles.stationName}>{station.name}</Text>
                  <Text className={classnames(styles.stationTypeBadge, styles[station.type])}>
                    {getStationTypeText(station.type)}
                  </Text>
                </View>
                <StatusTag
                  type={station.status === 'active' ? 'success' : 'default'}
                  text={station.status === 'active' ? '启用中' : '已停用'}
                  size="sm"
                />
              </View>

              <View className={styles.cardBody}>
                <View className={styles.infoRow}>
                  <Text className={styles.infoLabel}>位置</Text>
                  <Text className={styles.infoValue}>{station.location}</Text>
                </View>
                {station.description && (
                  <View className={styles.infoRow}>
                    <Text className={styles.infoLabel}>说明</Text>
                    <Text className={styles.infoValue}>{station.description}</Text>
                  </View>
                )}
              </View>

              <View className={styles.cardFooter}>
                <Text className={styles.capacityInfo}>
                  日采集容量：
                  <Text className={styles.capacityNum}>{station.capacity}</Text>
                  人次
                </Text>
                <View
                  className={styles.statusToggle}
                  onClick={(e) => {
                    e.stopPropagation?.();
                    handleToggleStatus(station.id);
                  }}
                >
                  <Text className={styles.statusLabel}>
                    {station.status === 'active' ? '停用' : '启用'}
                  </Text>
                  <View className={classnames(styles.switchTrack, styles[station.status])}>
                    <View className={classnames(styles.switchThumb, styles[station.status])} />
                  </View>
                </View>
              </View>
            </View>
          ))
        ) : (
          <EmptyState
            icon="🏥"
            title="暂无采血位数据"
            description="点击右上角新增按钮添加采血位"
          />
        )}
      </ScrollView>
    </View>
  );
};

export default StationPage;
