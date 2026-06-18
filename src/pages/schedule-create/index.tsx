import React, { useState } from 'react';
import { View, Text, ScrollView, Input, Button, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import dayjs from 'dayjs';
import { mockStations } from '@/data/station';
import styles from './index.module.scss';

const ScheduleCreatePage: React.FC = () => {
  const today = dayjs();
  const [form, setForm] = useState({
    stationId: '',
    groupName: '',
    date: today.format('YYYY-MM-DD'),
    startTime: '09:00',
    endTime: '12:00',
    expectedDonors: 30,
    contactPerson: '',
    contactPhone: '',
    notes: ''
  });

  const stationOptions = mockStations.filter(s => s.status === 'active');

  const updateField = (key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
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

  const handleDateSelect = () => {
    const selected = form.date;
    if (typeof Taro.showDatePicker === 'function') {
      Taro.showDatePicker({
        success: (res: any) => updateField('date', res.value)
      });
    } else {
      Taro.showToast({ title: '请手动输入日期', icon: 'none' });
    }
  };

  const handleSubmit = () => {
    if (!form.stationId) {
      Taro.showToast({ title: '请选择采血点位', icon: 'none' });
      return;
    }
    if (!form.groupName.trim()) {
      Taro.showToast({ title: '请输入团体名称', icon: 'none' });
      return;
    }
    if (form.startTime >= form.endTime) {
      Taro.showToast({ title: '结束时间需晚于开始时间', icon: 'none' });
      return;
    }
    Taro.showModal({
      title: '确认提交',
      content: `确定创建该排期吗？\n${form.groupName}\n${form.date} ${form.startTime}-${form.endTime}`,
      success: (res) => {
        if (res.confirm) {
          console.log('[ScheduleCreate] 创建排期:', form);
          Taro.showToast({ title: '创建成功', icon: 'success' });
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
          <Text className={styles.sectionTitle}>采血信息</Text>

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
              <Text className={styles.required}>*</Text>采血团体
            </Text>
            <Input
              className={styles.formInput}
              placeholder="请输入团体/单位名称"
              value={form.groupName}
              onInput={(e) => updateField('groupName', e.detail.value)}
            />
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>
              <Text className={styles.required}>*</Text>采血日期
            </Text>
            <Input
              className={styles.formInput}
              type="text"
              placeholder="YYYY-MM-DD"
              value={form.date}
              onInput={(e) => updateField('date', e.detail.value)}
            />
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>
              <Text className={styles.required}>*</Text>采血时段
            </Text>
            <View className={styles.timeRow}>
              <Input
                className={styles.timeInput}
                placeholder="HH:mm"
                value={form.startTime}
                onInput={(e) => updateField('startTime', e.detail.value)}
              />
              <Text className={styles.timeSep}>至</Text>
              <Input
                className={styles.timeInput}
                placeholder="HH:mm"
                value={form.endTime}
                onInput={(e) => updateField('endTime', e.detail.value)}
              />
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>预计献血人数</Text>
            <Input
              className={styles.formInput}
              type="number"
              value={String(form.expectedDonors)}
              onInput={(e) => updateField('expectedDonors', parseInt(e.detail.value) || 0)}
            />
          </View>
        </View>

        <View className={styles.formCard}>
          <Text className={styles.sectionTitle}>联系信息</Text>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>联系人</Text>
            <Input
              className={styles.formInput}
              placeholder="请输入联系人姓名"
              value={form.contactPerson}
              onInput={(e) => updateField('contactPerson', e.detail.value)}
            />
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>联系电话</Text>
            <Input
              className={styles.formInput}
              type="phone"
              placeholder="请输入联系电话"
              value={form.contactPhone}
              onInput={(e) => updateField('contactPhone', e.detail.value)}
            />
          </View>

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
          提交排期
        </Button>
      </View>
    </View>
  );
};

export default ScheduleCreatePage;
