import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Input, Button, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import dayjs from 'dayjs';
import { useStoreData, addBatch } from '@/store';
import type { BloodType } from '@/types';
import styles from './index.module.scss';

const BatchCreatePage: React.FC = () => {
  const { stations } = useStoreData();
  const today = dayjs();
  const [form, setForm] = useState({
    stationId: '',
    collectDate: today.format('YYYY-MM-DD'),
    expiryDate: today.add(35, 'day').format('YYYY-MM-DD'),
    notes: '',
    bloodTypeDistribution: {
      A: 0,
      B: 0,
      AB: 0,
      O: 0
    } as Record<BloodType, number>
  });

  const stationOptions = stations.filter(s => s.status === 'active');

  const totalBags = useMemo(() => {
    return Object.values(form.bloodTypeDistribution).reduce((s, n) => s + n, 0);
  }, [form.bloodTypeDistribution]);

  const totalVolume = useMemo(() => {
    return totalBags * 250;
  }, [totalBags]);

  const updateField = (key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const updateBloodType = (type: BloodType, value: number) => {
    setForm(prev => ({
      ...prev,
      bloodTypeDistribution: {
        ...prev.bloodTypeDistribution,
        [type]: Math.max(0, value)
      }
    }));
  };

  const handleStationSelect = () => {
    Taro.showActionSheet({
      itemList: stationOptions.map(s => `${s.name} (${s.location})`),
      success: (res) => {
        const station = stationOptions[res.tapIndex];
        updateField('stationId', station.id);
      }
    });
  };

  const handleSubmit = () => {
    if (!form.stationId) {
      Taro.showToast({ title: '请选择采血点位', icon: 'none' });
      return;
    }
    if (totalBags === 0) {
      Taro.showToast({ title: '请录入至少一袋血液', icon: 'none' });
      return;
    }
    const selectedStation = stationOptions.find(s => s.id === form.stationId);
    Taro.showModal({
      title: '确认登记',
      content: `确定登记该批次吗？\n采血点：${selectedStation?.name}\n血袋数：${totalBags}袋\n总血量：${(totalVolume / 1000).toFixed(1)}L`,
      confirmColor: '#E53935',
      success: (res) => {
        if (res.confirm) {
          addBatch({
            stationId: form.stationId,
            stationName: selectedStation?.name || '',
            collectDate: form.collectDate,
            expiryDate: form.expiryDate,
            bloodTypeDistribution: form.bloodTypeDistribution,
            notes: form.notes
          });
          Taro.showToast({ title: '登记成功', icon: 'success' });
          setTimeout(() => Taro.navigateBack(), 1000);
        }
      }
    });
  };

  const selectedStation = stationOptions.find(s => s.id === form.stationId);

  return (
    <View className={styles.page}>
      <ScrollView className={styles.content} scrollY>
        <View className={styles.formCard}>
          <Text className={styles.sectionTitle}>批次信息</Text>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>
              批号
            </Text>
            <View className={styles.previewBox}>
              <Text className={styles.previewLabel}>提交后系统自动生成</Text>
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>
              <Text className={styles.required}>*</Text>采血点位
            </Text>
            <View
              className={classnames(styles.selector, !form.stationId && styles.placeholder)}
              onClick={handleStationSelect}
            >
              <Text>{selectedStation ? selectedStation.name : '请选择采血点位'}</Text>
              <Text className={styles.selectorArrow}>›</Text>
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>
              <Text className={styles.required}>*</Text>采集日期
            </Text>
            <Input
              className={styles.formInput}
              type="text"
              placeholder="YYYY-MM-DD"
              value={form.collectDate}
              onInput={(e) => updateField('collectDate', e.detail.value)}
            />
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>
              <Text className={styles.required}>*</Text>有效期至
            </Text>
            <Input
              className={styles.formInput}
              type="text"
              placeholder="YYYY-MM-DD"
              value={form.expiryDate}
              onInput={(e) => updateField('expiryDate', e.detail.value)}
            />
          </View>
        </View>

        <View className={styles.formCard}>
          <Text className={styles.sectionTitle}>血型分布（袋数）</Text>

          <View className={styles.bloodTypeRow}>
            {(['A', 'B', 'AB', 'O'] as BloodType[]).map(type => (
              <View key={type} className={styles.bloodTypeInputGroup}>
                <Text className={styles.bloodTypeInputLabel}>{type}型</Text>
                <Input
                  className={styles.bloodTypeInput}
                  type="number"
                  value={String(form.bloodTypeDistribution[type])}
                  onInput={(e) => updateBloodType(type, parseInt(e.detail.value) || 0)}
                />
              </View>
            ))}
          </View>

          <View className={styles.statsPreview}>
            <View className={styles.statsPreviewItem}>
              <Text className={styles.statsPreviewNum}>{totalBags}</Text>
              <Text className={styles.statsPreviewLabel}>总袋数</Text>
            </View>
            <View className={styles.statsPreviewItem}>
              <Text className={styles.statsPreviewNum}>{(totalVolume / 1000).toFixed(1)}</Text>
              <Text className={styles.statsPreviewLabel}>总血量(L)</Text>
            </View>
          </View>
        </View>

        <View className={styles.formCard}>
          <Text className={styles.sectionTitle}>其他信息</Text>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>备注说明</Text>
            <Textarea
              className={styles.formTextarea}
              placeholder="请输入备注信息（选填）"
              value={form.notes}
              onInput={(e) => updateField('notes', e.detail.value)}
            />
          </View>
        </View>
      </ScrollView>

      <View className={styles.actionBar}>
        <Button className={classnames(styles.actionBtn, styles.default)} onClick={() => Taro.navigateBack()}>
          取消
        </Button>
        <Button className={classnames(styles.actionBtn, styles.primary)} onClick={handleSubmit}>
          确认登记
        </Button>
      </View>
    </View>
  );
};

export default BatchCreatePage;
