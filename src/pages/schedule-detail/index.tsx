import React, { useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import StatusTag from '@/components/StatusTag';
import EmptyState from '@/components/EmptyState';
import { useStoreData, updateScheduleStatus } from '@/store';
import type { Schedule, ScheduleStatus } from '@/types';
import {
  formatDate,
  getScheduleStatusText,
  getStationTypeText
} from '@/utils';
import styles from './index.module.scss';

const ScheduleDetailPage: React.FC = () => {
  const { schedules } = useStoreData();
  const router = useRouter();
  const id = router.params.id;

  const schedule = useMemo<Schedule | undefined>(() => {
    return schedules.find(s => s.id === id);
  }, [id]);

  const getStatusType = (status: ScheduleStatus): 'info' | 'primary' | 'success' | 'default' => {
    const map: Record<ScheduleStatus, 'info' | 'primary' | 'success' | 'default'> = {
      pending: 'info',
      ongoing: 'primary',
      completed: 'success',
      cancelled: 'default'
    };
    return map[status];
  };

  if (!schedule) {
    return (
      <View className={styles.page}>
        <EmptyState icon="❓" title="未找到排期信息" description="该排期可能已被删除" />
      </View>
    );
  }

  const handleEdit = () => {
    Taro.showToast({ title: '编辑功能开发中', icon: 'none' });
  };

  const handleCancel = () => {
    Taro.showModal({
      title: '取消排期',
      content: '确定要取消该排期吗？取消后将释放占用时段。',
      confirmColor: '#E53935',
      success: (res) => {
        if (res.confirm) {
          updateScheduleStatus(id, 'cancelled');
          Taro.showToast({ title: '已取消排期', icon: 'success' });
          setTimeout(() => Taro.navigateBack(), 1000);
        }
      }
    });
  };

  const handleComplete = () => {
    updateScheduleStatus(id, 'completed');
    Taro.showToast({ title: '已标记完成', icon: 'success' });
  };

  return (
    <View className={styles.page}>
      <ScrollView className={styles.content} scrollY>
        <View className={classnames(styles.statusBar, styles[schedule.status])}>
          <Text className={classnames(styles.statusBarText, styles[schedule.status])}>
            当前状态：{getScheduleStatusText(schedule.status)}
          </Text>
          <StatusTag
            type={getStatusType(schedule.status)}
            text={getScheduleStatusText(schedule.status)}
            size="sm"
          />
        </View>

        <View className={styles.timeBarWrap}>
          <Text className={styles.timeBarText}>
            {schedule.startTime} - {schedule.endTime}
          </Text>
          <Text className={styles.timeBarDate}>
            {formatDate(schedule.date, 'YYYY年MM月DD日 dddd')}
          </Text>
        </View>

        <View className={styles.detailCard}>
          <Text className={styles.sectionTitle}>
            <View className={styles.titleDot} />
            基本信息
          </Text>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>采血点位</Text>
            <Text className={styles.infoValue}>{schedule.stationName}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>采血团体</Text>
            <Text className={styles.infoValue}>{schedule.groupName}</Text>
          </View>
          {schedule.merged && (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>合并状态</Text>
              <Text className={styles.infoValue}>
                已合并 {schedule.mergedIds?.length || 0} 个时段
              </Text>
            </View>
          )}
          {schedule.contactPerson && (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>联系人</Text>
              <Text className={styles.infoValue}>{schedule.contactPerson}</Text>
            </View>
          )}
          {schedule.contactPhone && (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>联系电话</Text>
              <Text className={styles.infoValue}>{schedule.contactPhone}</Text>
            </View>
          )}
        </View>

        <View className={styles.detailCard}>
          <Text className={styles.sectionTitle}>
            <View className={styles.titleDot} />
            采集统计
          </Text>
          <View className={styles.statsGrid}>
            <View className={styles.statItem}>
              <Text className={styles.statNum}>{schedule.expectedDonors}</Text>
              <Text className={styles.statLabel}>预计人数</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statNum}>{schedule.actualDonors ?? '-'}</Text>
              <Text className={styles.statLabel}>实际人数</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statNum}>
                {schedule.actualDonors ? `${Math.round((schedule.actualDonors / schedule.expectedDonors) * 100)}%` : '-'}
              </Text>
              <Text className={styles.statLabel}>完成率</Text>
            </View>
          </View>
        </View>

        {schedule.notes && (
          <View className={styles.detailCard}>
            <Text className={styles.sectionTitle}>
              <View className={styles.titleDot} />
              备注说明
            </Text>
            <Text style={{ fontSize: '28rpx', color: '#4E5969', lineHeight: 1.6 }}>
              {schedule.notes}
            </Text>
          </View>
        )}
      </ScrollView>

      <View className={styles.actionBar}>
        {schedule.status === 'pending' && (
          <Button className={classnames(styles.actionBtn, styles.danger)} onClick={handleCancel}>
            取消排期
          </Button>
        )}
        {schedule.status === 'ongoing' && (
          <Button className={classnames(styles.actionBtn, styles.primary)} onClick={handleComplete}>
            标记完成
          </Button>
        )}
        {schedule.status !== 'completed' && schedule.status !== 'cancelled' && (
          <Button className={classnames(styles.actionBtn, schedule.status === 'pending' ? styles.default : styles.primary)} onClick={handleEdit}>
            编辑排期
          </Button>
        )}
      </View>
    </View>
  );
};

export default ScheduleDetailPage;
