import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import dayjs from 'dayjs';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import StatusTag from '@/components/StatusTag';
import { mockOccupancies } from '@/data/occupancy';
import { mockStations } from '@/data/station';
import type { Occupancy } from '@/types';
import { formatDate, getOccupancyStatusText, splitOccupancy } from '@/utils';
import styles from './index.module.scss';

const OccupancyPage: React.FC = () => {
  const today = dayjs();
  const [currentDate, setCurrentDate] = useState<string>(today.format('YYYY-MM-DD'));
  const [occupancies, setOccupancies] = useState<Occupancy[]>(mockOccupancies);

  const filteredOccupancies = useMemo(() => {
    return occupancies.filter(o => o.date === currentDate);
  }, [occupancies, currentDate]);

  const stationsWithOccupancy = useMemo(() => {
    const stationMap = new Map<string, Occupancy[]>();
    filteredOccupancies.forEach(o => {
      if (!stationMap.has(o.stationId)) {
        stationMap.set(o.stationId, []);
      }
      stationMap.get(o.stationId)!.push(o);
    });

    return mockStations
      .filter(s => s.status === 'active')
      .map(station => ({
        station,
        occupancies: (stationMap.get(station.id) || []).sort((a, b) => a.startTime.localeCompare(b.startTime))
      }));
  }, [filteredOccupancies]);

  const stats = useMemo(() => {
    const list = filteredOccupancies;
    return {
      total: list.length,
      occupied: list.filter(o => o.status === 'occupied').length,
      cancelled: list.filter(o => o.status === 'cancelled').length,
      merged: list.filter(o => o.merged).length
    };
  }, [filteredOccupancies]);

  const prevDay = () => {
    setCurrentDate(dayjs(currentDate).subtract(1, 'day').format('YYYY-MM-DD'));
  };

  const nextDay = () => {
    setCurrentDate(dayjs(currentDate).add(1, 'day').format('YYYY-MM-DD'));
  };

  const handleSplit = (occupancy: Occupancy) => {
    Taro.showModal({
      title: '拆分占用',
      content: `确定要拆分「${occupancy.groupName}」的时段占用吗？\n将在中间位置拆分成两段。`,
      success: (res) => {
        if (res.confirm) {
          const start = dayjs(`${occupancy.date} ${occupancy.startTime}`);
          const end = dayjs(`${occupancy.date} ${occupancy.endTime}`);
          const midTime = start.add(end.diff(start, 'minute') / 2, 'minute').format('HH:mm');
          const splitResult = splitOccupancy(occupancy, midTime);
          const newList = occupancies.filter(o => o.id !== occupancy.id);
          setOccupancies([...newList, ...splitResult]);
          Taro.showToast({ title: '拆分成功', icon: 'success' });
        }
      }
    });
  };

  const handleCancel = (occupancy: Occupancy) => {
    Taro.showModal({
      title: '取消占用',
      content: `确定要取消「${occupancy.groupName}」在 ${occupancy.startTime}-${occupancy.endTime} 的时段占用吗？`,
      confirmColor: '#E53935',
      success: (res) => {
        if (res.confirm) {
          const newList = occupancies.map(o =>
            o.id === occupancy.id ? { ...o, status: 'cancelled' as const } : o
          );
          setOccupancies(newList);
          Taro.showToast({ title: '已取消占用', icon: 'success' });
        }
      }
    });
  };

  const timeTicks = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];

  return (
    <View className={styles.page}>
      <PageHeader
        title="占用管理"
        subtitle={`共 ${stats.total} 个占用，${stats.merged} 个合并时段`}
      />

      <ScrollView
        className={styles.content}
        scrollY
        refresherEnabled
        refresherTriggered={false}
        onRefresherRefresh={() => Taro.stopPullDownRefresh()}
      >
        <View className={styles.statsRow}>
          <View className={styles.statCard}>
            <Text className={classnames(styles.statNum, styles.red)}>{stats.total}</Text>
            <Text className={styles.statText}>占用总数</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={classnames(styles.statNum, styles.green)}>{stats.occupied}</Text>
            <Text className={styles.statText}>生效中</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={classnames(styles.statNum, styles.orange)}>{stats.merged}</Text>
            <Text className={styles.statText}>已合并</Text>
          </View>
        </View>

        <View className={styles.legendBar}>
          <View className={styles.legendItem}>
            <View className={styles.legendDot} style={{ backgroundColor: '#E53935' }} />
            <Text className={styles.legendText}>已占用</Text>
          </View>
          <View className={styles.legendItem}>
            <View className={styles.legendDot} style={{ backgroundColor: '#43A047' }} />
            <Text className={styles.legendText}>空闲</Text>
          </View>
          <View className={styles.legendItem}>
            <View className={styles.legendDot} style={{ backgroundColor: '#C9CDD4' }} />
            <Text className={styles.legendText}>已取消</Text>
          </View>
          <View className={styles.legendItem}>
            <View className={styles.legendDot} style={{ backgroundColor: '#1976D2' }} />
            <Text className={styles.legendText}>合并时段</Text>
          </View>
        </View>

        <View className={styles.dateSelector}>
          <Button className={styles.dateNavBtn} onClick={prevDay}>‹</Button>
          <View className={styles.dateDisplay}>
            <Text className={styles.dateMain}>{formatDate(currentDate, 'YYYY-MM-DD')}</Text>
            <Text className={styles.dateSub}>{formatDate(currentDate, 'dddd')}</Text>
          </View>
          <Button className={styles.dateNavBtn} onClick={nextDay}>›</Button>
        </View>

        {stationsWithOccupancy.length > 0 ? (
          stationsWithOccupancy.map(({ station, occupancies: occList }) => (
            <View key={station.id} className={styles.stationCard}>
              <View className={styles.stationHeader}>
                <View className={styles.stationInfo}>
                  <Text className={styles.stationName}>{station.name}</Text>
                  <Text className={styles.stationLocation}>{station.location}</Text>
                </View>
                <Text className={styles.stationCapacity}>容量 {station.capacity}人</Text>
              </View>

              <View className={styles.timeAxis}>
                <View className={styles.axisRow}>
                  <Text className={styles.axisLabel}></Text>
                  <View className={styles.axisLine}>
                    {timeTicks.map(tick => (
                      <Text
                        key={tick}
                        style={{
                          position: 'absolute',
                          left: `${(parseInt(tick.slice(0, 2)) - 8) * 100 / 10}%`,
                          transform: 'translateX(-50%)',
                          fontSize: '20rpx',
                          color: '#86909C',
                          top: '-28rpx'
                        }}
                      >
                        {tick}
                      </Text>
                    ))}
                  </View>
                </View>
              </View>

              <View className={styles.occupancyList}>
                <View className={styles.occupancyRow}>
                  <View className={styles.occupancyLabel}>
                    <Text className={styles.occupancyLabelText}>占用</Text>
                  </View>
                  <View className={styles.occupancyBars}>
                    {occList.length > 0 ? (
                      occList.map(occ => (
                        <View
                          key={occ.id}
                          className={classnames(styles.occupancyBar, styles[occ.status])}
                        >
                          <View className={styles.barInfo}>
                            <View className={styles.barLeft}>
                              <Text className={styles.barTime}>
                                {occ.startTime} - {occ.endTime}
                              </Text>
                              {occ.status === 'cancelled' ? (
                                <Text className={styles.cancelledTag}>{occ.groupName}</Text>
                              ) : (
                                <Text className={styles.barGroup}>{occ.groupName}</Text>
                              )}
                              <View className={styles.barTags}>
                                {occ.merged && (
                                  <Text className={styles.mergedTag}>已合并</Text>
                                )}
                                <StatusTag
                                  type={occ.status === 'occupied' ? 'primary' : 'default'}
                                  text={getOccupancyStatusText(occ.status)}
                                  size="sm"
                                />
                              </View>
                            </View>
                            {occ.status === 'occupied' && (
                              <View className={styles.actionBtns}>
                                {occ.merged && (
                                  <Button
                                    className={classnames(styles.actionBtn, styles.split)}
                                    onClick={() => handleSplit(occ)}
                                  >
                                    拆分
                                  </Button>
                                )}
                                <Button
                                  className={classnames(styles.actionBtn, styles.cancel)}
                                  onClick={() => handleCancel(occ)}
                                >
                                  取消
                                </Button>
                              </View>
                            )}
                          </View>
                        </View>
                      ))
                    ) : (
                      <View className={styles.emptyOccupancy}>
                        <Text className={styles.emptyText}>当前时段空闲</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>
          ))
        ) : (
          <EmptyState
            icon="🕐"
            title="暂无占用数据"
            description="请选择其他日期查看"
          />
        )}
      </ScrollView>
    </View>
  );
};

export default OccupancyPage;
