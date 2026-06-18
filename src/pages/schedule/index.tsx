import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import dayjs from 'dayjs';
import PageHeader from '@/components/PageHeader';
import ScheduleCard from '@/components/ScheduleCard';
import EmptyState from '@/components/EmptyState';
import { useStoreData } from '@/store';
import type { ScheduleStatus } from '@/types';
import { getCalendarDays, formatDate } from '@/utils';
import styles from './index.module.scss';

type FilterType = 'all' | ScheduleStatus;

const SchedulePage: React.FC = () => {
  const { schedules } = useStoreData();
  const today = dayjs();
  const [year, setYear] = useState(today.year());
  const [month, setMonth] = useState(today.month());
  const [selectedDate, setSelectedDate] = useState<string>(today.format('YYYY-MM-DD'));
  const [filter, setFilter] = useState<FilterType>('all');

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const calendarDays = useMemo(() => {
    const days = getCalendarDays(year, month);
    const scheduleMap = new Map<string, number>();
    schedules.forEach(s => {
      scheduleMap.set(s.date, (scheduleMap.get(s.date) || 0) + 1);
    });
    return days.map(d => ({
      ...d,
      scheduleCount: scheduleMap.get(d.date) || 0
    }));
  }, [year, month, schedules]);

  const filteredSchedules = useMemo(() => {
    let list = schedules;
    if (filter !== 'all') {
      list = list.filter(s => s.status === filter);
    }
    if (selectedDate) {
      list = list.filter(s => s.date === selectedDate);
    }
    return list.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [filter, selectedDate, schedules]);

  const stats = useMemo(() => {
    const todaySchedules = schedules.filter(s => s.date === today.format('YYYY-MM-DD'));
    return {
      todayCount: todaySchedules.length,
      totalExpected: todaySchedules.reduce((sum, s) => sum + s.expectedDonors, 0),
      totalActual: todaySchedules.reduce((sum, s) => sum + (s.actualDonors || 0), 0)
    };
  }, [schedules]);

  const goPrevMonth = () => {
    if (month === 0) {
      setYear(year - 1);
      setMonth(11);
    } else {
      setMonth(month - 1);
    }
  };

  const goNextMonth = () => {
    if (month === 11) {
      setYear(year + 1);
      setMonth(0);
    } else {
      setMonth(month + 1);
    }
  };

  const goToday = () => {
    setYear(today.year());
    setMonth(today.month());
    setSelectedDate(today.format('YYYY-MM-DD'));
  };

  const handleAdd = () => {
    Taro.navigateTo({ url: '/pages/schedule-create/index' });
  };

  const handleRefresh = () => {
    Taro.stopPullDownRefresh();
    Taro.showToast({ title: '刷新成功', icon: 'success' });
  };

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待开始' },
    { key: 'ongoing', label: '进行中' },
    { key: 'completed', label: '已完成' },
    { key: 'cancelled', label: '已取消' }
  ];

  return (
    <View className={styles.page}>
      <PageHeader
        className={styles.header}
        title="采血排期"
        subtitle={formatDate(selectedDate, 'YYYY年MM月DD日 dddd')}
        rightContent={
          <View className={styles.headerActions}>
            <Button className={styles.addBtn} onClick={handleAdd}>+ 新增</Button>
          </View>
        }
      />

      <ScrollView
        className={styles.content}
        scrollY
        onScrollToLower={() => {}}
        refresherEnabled
        refresherTriggered={false}
        onRefresherRefresh={handleRefresh}
      >
        <View className={styles.calendarCard}>
          <View className={styles.calendarHeader}>
            <View className={styles.calendarNav}>
              <Button className={styles.navBtn} onClick={goPrevMonth}>‹</Button>
              <Text className={styles.calendarTitle}>{year}年{month + 1}月</Text>
              <Button className={styles.navBtn} onClick={goNextMonth}>›</Button>
            </View>
            <Button className={styles.todayBtn} onClick={goToday}>今天</Button>
          </View>

          <View className={styles.weekRow}>
            {weekDays.map(day => (
              <Text key={day} className={styles.weekDay}>{day}</Text>
            ))}
          </View>

          <View className={styles.daysGrid}>
            {calendarDays.map((day, index) => (
              <View
                key={index}
                className={classnames(
                  styles.dayCell,
                  day.isCurrentMonth || styles.otherMonth,
                  day.isToday && styles.today,
                  day.date === selectedDate && styles.selected
                )}
                onClick={() => setSelectedDate(day.date)}
              >
                <Text className={styles.dayNumber}>{day.day}</Text>
                {day.scheduleCount > 0 && (
                  <Text className={styles.dayCount}>{day.scheduleCount}排</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        <View className={styles.statsBar}>
          <View className={styles.statsItem}>
            <Text className={styles.statsNum}>{stats.todayCount}</Text>
            <Text className={styles.statsLabel}>今日排期</Text>
          </View>
          <View className={styles.statsDivider} />
          <View className={styles.statsItem}>
            <Text className={styles.statsNum}>{stats.totalExpected}</Text>
            <Text className={styles.statsLabel}>预计人数</Text>
          </View>
          <View className={styles.statsDivider} />
          <View className={styles.statsItem}>
            <Text className={styles.statsNum}>{stats.totalActual}</Text>
            <Text className={styles.statsLabel}>已采人数</Text>
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

        <View className={styles.scheduleList}>
          {filteredSchedules.length > 0 ? (
            filteredSchedules.map(schedule => (
              <ScheduleCard key={schedule.id} schedule={schedule} />
            ))
          ) : (
            <EmptyState
              icon="📅"
              title="暂无排期数据"
              description="点击右上角新增按钮创建排期"
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default SchedulePage;
