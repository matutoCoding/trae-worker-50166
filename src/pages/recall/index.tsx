import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Input, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import PageHeader from '@/components/PageHeader';
import StatusTag from '@/components/StatusTag';
import EmptyState from '@/components/EmptyState';
import { mockFlowRecords, mockRecalls } from '@/data/recall';
import type { RecallStatus } from '@/types';
import { formatDateTime, getRecallStatusText } from '@/utils';
import styles from './index.module.scss';

type TabType = 'flow' | 'recall';

const RecallPage: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('flow');
  const [searchBatch, setSearchBatch] = useState('');
  const [searchResult, setSearchResult] = useState<typeof mockFlowRecords>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const recalls = useMemo(() => {
    return [...mockRecalls].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, []);

  const handleSearch = () => {
    if (!searchBatch.trim()) {
      Taro.showToast({ title: '请输入批号', icon: 'none' });
      return;
    }
    const kw = searchBatch.trim().toUpperCase();
    const results = mockFlowRecords.filter(f => f.batchNumber.toUpperCase().includes(kw));
    setSearchResult(results);
    setHasSearched(true);
  };

  const handleRecallClick = (recallId: string) => {
    Taro.navigateTo({
      url: `/pages/recall-detail/index?id=${recallId}`
    });
  };

  const getStatusType = (status: RecallStatus): 'warning' | 'info' | 'success' => {
    const map: Record<RecallStatus, 'warning' | 'info' | 'success'> = {
      pending: 'warning',
      processing: 'info',
      completed: 'success'
    };
    return map[status];
  };

  return (
    <View className={styles.page}>
      <PageHeader
        title="流向召回"
        subtitle="批次流向追踪与问题血液召回"
      />

      <ScrollView
        className={styles.content}
        scrollY
        refresherEnabled
        refresherTriggered={false}
        onRefresherRefresh={() => Taro.stopPullDownRefresh()}
      >
        <View className={styles.tabSection}>
          <Button
            className={classnames(styles.tabBtn, activeTab === 'flow' && styles.active)}
            onClick={() => setActiveTab('flow')}
          >
            🔍 流向反查
          </Button>
          <Button
            className={classnames(styles.tabBtn, activeTab === 'recall' && styles.active)}
            onClick={() => setActiveTab('recall')}
          >
            ⚠️ 召回管理
          </Button>
        </View>

        {activeTab === 'flow' && (
          <>
            <View className={styles.searchPanel}>
              <Text className={styles.searchTitle}>按批号反查流向医院</Text>
              <View className={styles.searchRow}>
                <Input
                  className={styles.searchInput}
                  placeholder="请输入血液批号，如：B202606180001"
                  value={searchBatch}
                  onInput={(e) => setSearchBatch(e.detail.value)}
                  onConfirm={handleSearch}
                />
                <Button className={styles.searchBtn} onClick={handleSearch}>
                  查询
                </Button>
              </View>
            </View>

            {hasSearched && (
              searchResult.length > 0 ? (
                <View className={styles.flowResult}>
                  <View className={styles.resultHeader}>
                    <Text className={styles.resultTitle}>
                      批号 {searchBatch} 流向记录
                    </Text>
                    <Text className={styles.resultBadge}>
                      共 {searchResult.length} 条
                    </Text>
                  </View>
                  {searchResult.map(record => (
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
                    </View>
                  ))}
                </View>
              ) : (
                <View className={styles.emptyHint}>
                  <Text className={styles.emptyTitle}>未找到该批号的流向记录</Text>
                  <Text className={styles.emptyDesc}>请检查批号是否正确</Text>
                </View>
              )
            )}

            {!hasSearched && (
              <EmptyState
                icon="🔍"
                title="输入批号进行反查"
                description="输入血液批号即可查询发往哪些医院"
              />
            )}
          </>
        )}

        {activeTab === 'recall' && (
          recalls.length > 0 ? (
            recalls.map(recall => (
              <View
                key={recall.id}
                className={styles.recallCard}
                onClick={() => handleRecallClick(recall.id)}
              >
                <View className={styles.recallHeader}>
                  <View>
                    <Text className={styles.recallNumber}>{recall.recallNumber}</Text>
                    <Text className={styles.recallBatch}>涉及批号：{recall.batchNumber}</Text>
                  </View>
                  <StatusTag
                    type={getStatusType(recall.status)}
                    text={getRecallStatusText(recall.status)}
                    size="sm"
                  />
                </View>
                <View className={styles.recallBody}>
                  <Text className={styles.recallReason}>{recall.reason}</Text>
                  <View className={styles.recallStats}>
                    <View className={styles.recallStatItem}>
                      <Text className={styles.recallStatNum}>{recall.flowRecords.length}</Text>
                      <Text className={styles.recallStatLabel}>涉及医院</Text>
                    </View>
                    <View className={styles.recallStatItem}>
                      <Text className={styles.recallStatNum}>
                        {recall.flowRecords.reduce((s, f) => s + f.bagsCount, 0)}
                      </Text>
                      <Text className={styles.recallStatLabel}>血袋数</Text>
                    </View>
                    <View className={styles.recallStatItem}>
                      <Text className={styles.recallStatNum}>
                        {(recall.flowRecords.reduce((s, f) => s + f.volume, 0) / 1000).toFixed(1)}
                      </Text>
                      <Text className={styles.recallStatLabel}>总血量(L)</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <EmptyState
              icon="✅"
              title="暂无召回任务"
              description="当前没有进行中的召回任务"
            />
          )
        )}
      </ScrollView>
    </View>
  );
};

export default RecallPage;
