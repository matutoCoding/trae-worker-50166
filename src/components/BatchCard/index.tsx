import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import StatusTag, { StatusType } from '@/components/StatusTag';
import type { Batch } from '@/types';
import { getBatchStatusText, formatDate } from '@/utils';
import styles from './index.module.scss';

interface BatchCardProps {
  batch: Batch;
  className?: string;
}

const getStatusType = (status: string): StatusType => {
  const map: Record<string, StatusType> = {
    qualified: 'success',
    pending: 'warning',
    abnormal: 'danger',
    recalled: 'purple'
  };
  return map[status] || 'default';
};

const BatchCard: React.FC<BatchCardProps> = ({ batch, className }) => {
  const handleClick = () => {
    Taro.navigateTo({
      url: `/pages/batch-detail/index?id=${batch.id}`
    });
  };

  return (
    <View className={classnames(styles.batchCard, className)} onClick={handleClick}>
      <View className={styles.cardHeader}>
        <Text className={styles.batchNumber}>{batch.batchNumber}</Text>
        <StatusTag
          type={getStatusType(batch.status)}
          text={getBatchStatusText(batch.status)}
          size="sm"
        />
      </View>

      <View className={styles.cardBody}>
        <View className={styles.infoRow}>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>采血点</Text>
            <Text className={styles.infoValue}>{batch.stationName}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>采集日期</Text>
            <Text className={styles.infoValue}>{formatDate(batch.collectDate, 'MM-DD')}</Text>
          </View>
        </View>

        <View className={styles.infoRow}>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>血袋数</Text>
            <Text className={classnames(styles.infoValue, styles.highlight)}>{batch.totalBags}袋</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>总血量</Text>
            <Text className={classnames(styles.infoValue, styles.highlight)}>{(batch.totalVolume / 1000).toFixed(1)}L</Text>
          </View>
        </View>

        <View className={styles.bloodTypes}>
          {(Object.keys(batch.bloodTypeDistribution) as Array<keyof typeof batch.bloodTypeDistribution>).map(type => (
            <View key={type} className={styles.bloodTypeItem}>
              <Text className={styles.bloodType}>{type}</Text>
              <Text className={styles.bloodCount}>{batch.bloodTypeDistribution[type]}</Text>
            </View>
          ))}
        </View>

        <View className={styles.expiryRow}>
          <Text className={styles.expiryLabel}>有效期至</Text>
          <Text className={styles.expiryDate}>{formatDate(batch.expiryDate)}</Text>
        </View>
      </View>
    </View>
  );
};

export default BatchCard;
