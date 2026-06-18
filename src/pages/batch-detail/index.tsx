import React, { useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import StatusTag from '@/components/StatusTag';
import EmptyState from '@/components/EmptyState';
import { useStoreData, updateBatchStatus, initiateRecall } from '@/store';
import type { Batch, BatchStatus, BloodType } from '@/types';
import {
  formatDate,
  formatDateTime,
  getBatchStatusText
} from '@/utils';
import styles from './index.module.scss';

const BatchDetailPage: React.FC = () => {
  const router = useRouter();
  const id = router.params.id;
  const { batches, flowRecords: storeFlowRecords } = useStoreData();

  const batch = useMemo<Batch | undefined>(() => {
    return batches.find(b => b.id === id);
  }, [id, batches]);

  const flowRecords = useMemo(() => {
    if (!batch) return [];
    return storeFlowRecords.filter(f => f.batchId === batch.id);
  }, [batch, storeFlowRecords]);

  const getStatusType = (status: BatchStatus): 'success' | 'warning' | 'danger' | 'purple' => {
    const map: Record<BatchStatus, 'success' | 'warning' | 'danger' | 'purple'> = {
      qualified: 'success',
      pending: 'warning',
      abnormal: 'danger',
      recalled: 'purple'
    };
    return map[status];
  };

  const handleInitiateRecall = () => {
    Taro.showModal({
      title: '发起召回',
      content: `确定对批号 ${batch?.batchNumber} 发起召回吗？该操作将通知所有流向医院。`,
      confirmColor: '#E53935',
      success: (res) => {
        if (res.confirm) {
          if (batch) {
            initiateRecall(batch.id, '需召回检查');
          }
          Taro.showToast({ title: '召回已发起', icon: 'success' });
        }
      }
    });
  };

  const handleMarkQualified = () => {
    if (batch) {
      updateBatchStatus(batch.id, 'qualified');
    }
    Taro.showToast({ title: '已标记合格', icon: 'success' });
  };

  if (!batch) {
    return (
      <View className={styles.page}>
        <EmptyState icon="❓" title="未找到批次信息" description="该批次可能已被删除" />
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <ScrollView className={styles.content} scrollY>
        <View className={classnames(styles.statusBar, styles[batch.status])}>
          <Text className={classnames(styles.statusBarText, styles[batch.status])}>
            当前状态：{getBatchStatusText(batch.status)}
          </Text>
          <StatusTag
            type={getStatusType(batch.status)}
            text={getBatchStatusText(batch.status)}
            size="sm"
          />
        </View>

        <View className={styles.batchHeader}>
          <Text className={styles.batchNumber}>{batch.batchNumber}</Text>
          <Text className={styles.batchDates}>
            采集：{formatDate(batch.collectDate)} | 有效期至：{formatDate(batch.expiryDate)}
          </Text>
        </View>

        <View className={styles.detailCard}>
          <Text className={styles.sectionTitle}>
            <View className={styles.titleDot} />
            基本信息
          </Text>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>采血点位</Text>
            <Text className={styles.infoValue}>{batch.stationName}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>采集日期</Text>
            <Text className={styles.infoValue}>{formatDate(batch.collectDate, 'YYYY年MM月DD日')}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>有效期至</Text>
            <Text className={styles.infoValue}>{formatDate(batch.expiryDate, 'YYYY年MM月DD日')}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>登记时间</Text>
            <Text className={styles.infoValue}>{formatDateTime(batch.createdAt)}</Text>
          </View>
          {batch.notes && (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>备注说明</Text>
              <Text className={styles.infoValue}>{batch.notes}</Text>
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
              <Text className={styles.statNum}>
                {batch.totalBags}
                <Text className={styles.statUnit}>袋</Text>
              </Text>
              <Text className={styles.statLabel}>血袋总数</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statNum}>
                {(batch.totalVolume / 1000).toFixed(1)}
                <Text className={styles.statUnit}>L</Text>
              </Text>
              <Text className={styles.statLabel}>总血量</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statNum}>
                {Math.round(batch.totalVolume / batch.totalBags)}
                <Text className={styles.statUnit}>ml</Text>
              </Text>
              <Text className={styles.statLabel}>平均每袋</Text>
            </View>
          </View>

          <Text className={styles.sectionSubTitle}>血型分布</Text>
          <View className={styles.bloodTypeDist}>
            {(Object.keys(batch.bloodTypeDistribution) as BloodType[]).map(type => (
              <View key={type} className={styles.bloodTypeCard}>
                <Text className={styles.bloodTypeLabel}>{type}</Text>
                <Text className={styles.bloodTypeCount}>
                  {batch.bloodTypeDistribution[type]}袋
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.detailCard}>
          <Text className={styles.sectionTitle}>
            <View className={styles.titleDot} />
            血袋列表（{batch.bags.length}袋）
          </Text>
          <View className={styles.bagList}>
            {batch.bags.slice(0, 10).map(bag => (
              <View key={bag.id} className={styles.bagItem}>
                <View>
                  <Text className={styles.bagNumber}>{bag.bagNumber}</Text>
                  {bag.donorName && (
                    <Text className={styles.bagDonor}>{bag.donorName}</Text>
                  )}
                </View>
                <View className={styles.bagInfo}>
                  <Text className={styles.bagTypeChip}>{bag.bloodType}型</Text>
                  <Text className={styles.bagVolume}>{bag.volume}ml</Text>
                </View>
              </View>
            ))}
            {batch.bags.length > 10 && (
              <View className={styles.infoRow} style={{ justifyContent: 'center' }}>
                <Text className={styles.infoValue} style={{ color: '#1976D2' }}>
                  还有 {batch.bags.length - 10} 袋，点击查看全部
                </Text>
              </View>
            )}
          </View>
        </View>

        {flowRecords.length > 0 && (
          <View className={styles.detailCard}>
            <Text className={styles.sectionTitle}>
              <View className={styles.titleDot} />
              流向记录（{flowRecords.length}家医院）
            </Text>
            {flowRecords.map(record => (
              <View key={record.id} className={styles.flowCard}>
                <View className={styles.flowHeader}>
                  <Text className={styles.flowHospital}>{record.hospitalName}</Text>
                  <Text className={styles.flowStats}>
                    {record.bagsCount}袋 / {(record.volume / 1000).toFixed(1)}L
                  </Text>
                </View>
                <Text className={styles.flowInfo}>
                  发运：{formatDateTime(record.shippedAt)}
                  {record.receivedAt && ` | 接收：${formatDateTime(record.receivedAt)}`}
                </Text>
                <View className={styles.flowBloodTypes}>
                  {record.bloodTypes.map(bt => (
                    <Text key={bt} className={styles.bagTypeChip}>{bt}型</Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View className={styles.actionBar}>
        {batch.status === 'pending' && (
          <Button className={classnames(styles.actionBtn, styles.primary)} onClick={handleMarkQualified}>
            标记合格
          </Button>
        )}
        {(batch.status === 'qualified' || batch.status === 'abnormal') && flowRecords.length > 0 && (
          <Button className={classnames(styles.actionBtn, styles.danger)} onClick={handleInitiateRecall}>
            发起召回
          </Button>
        )}
        <Button className={classnames(styles.actionBtn, styles.default)} onClick={() => Taro.navigateBack()}>
          返回
        </Button>
      </View>
    </View>
  );
};

export default BatchDetailPage;
