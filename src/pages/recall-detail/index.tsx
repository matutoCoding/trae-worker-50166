import React, { useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import StatusTag from '@/components/StatusTag';
import EmptyState from '@/components/EmptyState';
import { mockRecalls, mockHospitals } from '@/data/recall';
import type { Recall, RecallStatus } from '@/types';
import {
  formatDateTime,
  getRecallStatusText
} from '@/utils';
import styles from './index.module.scss';

const RecallDetailPage: React.FC = () => {
  const router = useRouter();
  const id = router.params.id;

  const recall = useMemo<Recall | undefined>(() => {
    return mockRecalls.find(r => r.id === id);
  }, [id]);

  const stats = useMemo(() => {
    if (!recall) return { hospitals: 0, bags: 0, volume: 0 };
    return {
      hospitals: recall.flowRecords.length,
      bags: recall.flowRecords.reduce((s, f) => s + f.bagsCount, 0),
      volume: recall.flowRecords.reduce((s, f) => s + f.volume, 0)
    };
  }, [recall]);

  const getStatusType = (status: RecallStatus): 'warning' | 'info' | 'success' => {
    const map: Record<RecallStatus, 'warning' | 'info' | 'success'> = {
      pending: 'warning',
      processing: 'info',
      completed: 'success'
    };
    return map[status];
  };

  const handleStartRecall = () => {
    Taro.showModal({
      title: '开始召回',
      content: '确定开始执行召回流程吗？将通知所有涉及医院。',
      confirmColor: '#E53935',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '召回已启动', icon: 'success' });
        }
      }
    });
  };

  const handleCompleteRecall = () => {
    Taro.showModal({
      title: '完成召回',
      content: '确认所有血液制品已回收完毕？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '召回已完成', icon: 'success' });
        }
      }
    });
  };

  const handleCallHospital = (phone: string) => {
    Taro.showToast({ title: `拨打 ${phone}`, icon: 'none' });
  };

  const getStepStatus = (step: number) => {
    if (!recall) return 'pending';
    if (recall.status === 'pending') return step === 1 ? 'active' : 'pending';
    if (recall.status === 'processing') return step <= 2 ? (step === 2 ? 'active' : 'done') : 'pending';
    if (recall.status === 'completed') return 'done';
    return 'pending';
  };

  if (!recall) {
    return (
      <View className={styles.page}>
        <EmptyState icon="❓" title="未找到召回信息" description="该召回记录可能已被删除" />
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <ScrollView className={styles.content} scrollY>
        <View className={classnames(styles.statusBar, styles[recall.status])}>
          <Text className={classnames(styles.statusBarText, styles[recall.status])}>
            当前状态：{getRecallStatusText(recall.status)}
          </Text>
          <StatusTag
            type={getStatusType(recall.status)}
            text={getRecallStatusText(recall.status)}
            size="sm"
          />
        </View>

        <View className={styles.recallHeader}>
          <Text className={styles.recallNumber}>⚠️ {recall.recallNumber}</Text>
          <Text className={styles.recallBatch}>涉及批号：{recall.batchNumber}</Text>
        </View>

        <View className={styles.detailCard}>
          <Text className={styles.sectionTitle}>
            <View className={styles.titleDot} />
            召回进度
          </Text>
          <View className={styles.recallProgress}>
            <View className={classnames(styles.progressStep, styles[getStepStatus(1)])}>
              1. 发起召回
            </View>
            <View className={classnames(styles.progressStep, styles[getStepStatus(2)])}>
              2. 医院回收
            </View>
            <View className={classnames(styles.progressStep, styles[getStepStatus(3)])}>
              3. 召回完成
            </View>
          </View>
        </View>

        <View className={styles.detailCard}>
          <Text className={styles.sectionTitle}>
            <View className={styles.titleDot} />
            召回信息
          </Text>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>召回单号</Text>
            <Text className={styles.infoValue}>{recall.recallNumber}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>涉及批号</Text>
            <Text className={styles.infoValue}>{recall.batchNumber}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>发起时间</Text>
            <Text className={styles.infoValue}>{formatDateTime(recall.createdAt)}</Text>
          </View>
          {recall.completedAt && (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>完成时间</Text>
              <Text className={styles.infoValue}>{formatDateTime(recall.completedAt)}</Text>
            </View>
          )}
        </View>

        <View className={styles.detailCard}>
          <Text className={styles.sectionTitle}>
            <View className={styles.titleDot} />
            召回原因
          </Text>
          <Text className={styles.reasonText}>{recall.reason}</Text>
        </View>

        <View className={styles.detailCard}>
          <Text className={styles.sectionTitle}>
            <View className={styles.titleDot} />
            召回统计
          </Text>
          <View className={styles.statsGrid}>
            <View className={styles.statItem}>
              <Text className={styles.statNum}>
                {stats.hospitals}
                <Text className={styles.statUnit}>家</Text>
              </Text>
              <Text className={styles.statLabel}>涉及医院</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statNum}>
                {stats.bags}
                <Text className={styles.statUnit}>袋</Text>
              </Text>
              <Text className={styles.statLabel}>血袋总数</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statNum}>
                {(stats.volume / 1000).toFixed(1)}
                <Text className={styles.statUnit}>L</Text>
              </Text>
              <Text className={styles.statLabel}>总血量</Text>
            </View>
          </View>
        </View>

        {recall.flowRecords.length > 0 && (
          <View className={styles.detailCard}>
            <Text className={styles.sectionTitle}>
              <View className={styles.titleDot} />
              涉及医院（{recall.flowRecords.length}家）
            </Text>
            {recall.flowRecords.map(record => {
              const hospital = mockHospitals.find(h => h.id === record.hospitalId);
              return (
                <View key={record.id} className={styles.hospitalItem}>
                  <View className={styles.hospitalRow}>
                    <Text className={styles.hospitalName}>{record.hospitalName}</Text>
                    <Text className={styles.hospitalStats}>
                      {record.bagsCount}袋 / {(record.volume / 1000).toFixed(1)}L
                    </Text>
                  </View>
                  <Text className={styles.hospitalInfo}>
                    发运：{formatDateTime(record.shippedAt)}
                    {record.receivedAt && ` | 接收：${formatDateTime(record.receivedAt)}`}
                  </Text>
                  <View className={styles.bloodTypesRow}>
                    {record.bloodTypes.map(bt => (
                      <Text key={bt} className={styles.bloodTypeChip}>{bt}型</Text>
                    ))}
                  </View>
                  {hospital && (
                    <View
                      className={styles.hospitalContact}
                      onClick={() => handleCallHospital(hospital.contactPhone)}
                    >
                      <Text className={styles.contactText}>
                        📞 联系人：{hospital.contactPerson}
                      </Text>
                      <Text className={styles.contactText}>
                        {hospital.contactPhone}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {recall.flowRecords.length === 0 && (
          <View className={styles.detailCard}>
            <Text className={styles.sectionTitle}>
              <View className={styles.titleDot} />
              流向信息
            </Text>
            <Text className={styles.infoValue} style={{ color: '#86909C' }}>
              该批次尚未发往医院，暂无需召回
            </Text>
          </View>
        )}
      </ScrollView>

      <View className={styles.actionBar}>
        {recall.status === 'pending' && (
          <Button className={classnames(styles.actionBtn, styles.danger)} onClick={handleStartRecall}>
            开始召回
          </Button>
        )}
        {recall.status === 'processing' && (
          <Button className={classnames(styles.actionBtn, styles.success)} onClick={handleCompleteRecall}>
            标记完成
          </Button>
        )}
        <Button className={classnames(styles.actionBtn, styles.default)} onClick={() => Taro.navigateBack()}>
          返回
        </Button>
      </View>
    </View>
  );
};

export default RecallDetailPage;
