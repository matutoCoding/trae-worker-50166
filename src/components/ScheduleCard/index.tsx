import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import StatusTag, { StatusType } from '@/components/StatusTag';
import TimeBar from '@/components/TimeBar';
import type { Schedule } from '@/types';
import { getScheduleStatusText, formatDate } from '@/utils';
import styles from './index.module.scss';

interface ScheduleCardProps {
  schedule: Schedule;
  className?: string;
}

const getStatusType = (status: string): StatusType => {
  const map: Record<string, StatusType> = {
    pending: 'info',
    ongoing: 'primary',
    completed: 'success',
    cancelled: 'default'
  };
  return map[status] || 'default';
};

const ScheduleCard: React.FC<ScheduleCardProps> = ({ schedule, className }) => {
  const handleClick = () => {
    Taro.navigateTo({
      url: `/pages/schedule-detail/index?id=${schedule.id}`
    });
  };

  return (
    <View className={classnames(styles.scheduleCard, className)} onClick={handleClick}>
      <View className={styles.cardHeader}>
        <View className={styles.stationInfo}>
          <Text className={styles.stationName}>{schedule.stationName}</Text>
          {schedule.merged && (
            <View className={styles.mergedBadge}>
              <Text className={styles.mergedText}>已合并</Text>
            </View>
          )}
        </View>
        <StatusTag
          type={getStatusType(schedule.status)}
          text={getScheduleStatusText(schedule.status)}
          size="sm"
        />
      </View>

      <View className={styles.cardBody}>
        <View className={styles.groupRow}>
          <Text className={styles.groupLabel}>团体</Text>
          <Text className={styles.groupName}>{schedule.groupName}</Text>
        </View>

        <View className={styles.timeRow}>
          <TimeBar
            startTime={schedule.startTime}
            endTime={schedule.endTime}
            status={schedule.status === 'cancelled' ? 'cancelled' : 'occupied'}
            label={formatDate(schedule.date, 'MM-DD')}
          />
        </View>

        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{schedule.expectedDonors}</Text>
            <Text className={styles.statLabel}>预计人数</Text>
          </View>
          {schedule.actualDonors !== undefined && (
            <View className={styles.statDivider} />
          )}
          {schedule.actualDonors !== undefined && (
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{schedule.actualDonors}</Text>
              <Text className={styles.statLabel}>实际人数</Text>
            </View>
          )}
          <View className={styles.statDivider} />
          <View className={styles.statItem}>
            <Text className={classnames(styles.statValue, styles.arrow)}>→</Text>
            <Text className={styles.statLabel}>查看详情</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ScheduleCard;
