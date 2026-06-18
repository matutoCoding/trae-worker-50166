import dayjs from 'dayjs';
import type { CalendarDay, Occupancy } from '@/types';

export const formatDate = (date: string | Date, format = 'YYYY-MM-DD'): string => {
  return dayjs(date).format(format);
};

export const formatDateTime = (date: string | Date, format = 'YYYY-MM-DD HH:mm'): string => {
  return dayjs(date).format(format);
};

export const formatTime = (date: string | Date, format = 'HH:mm'): string => {
  return dayjs(date).format(format);
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

export const generateBatchNumber = (): string => {
  const now = dayjs();
  const dateStr = now.format('YYYYMMDD');
  const random = Math.floor(Math.random() * 9000 + 1000);
  return `B${dateStr}${random}`;
};

export const generateBagNumber = (batchNumber: string, index: number): string => {
  return `${batchNumber}-${String(index).padStart(4, '0')}`;
};

export const generateRecallNumber = (): string => {
  const now = dayjs();
  const dateStr = now.format('YYYYMMDD');
  const random = Math.floor(Math.random() * 9000 + 1000);
  return `R${dateStr}${random}`;
};

export const getCalendarDays = (year: number, month: number): CalendarDay[] => {
  const firstDay = dayjs(`${year}-${month + 1}-01`);
  const startWeekday = firstDay.day();
  const daysInMonth = firstDay.daysInMonth();
  const today = dayjs().format('YYYY-MM-DD');
  const days: CalendarDay[] = [];
  
  const prevMonth = firstDay.subtract(1, 'month');
  const prevMonthDays = prevMonth.daysInMonth();
  for (let i = startWeekday - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const date = prevMonth.date(day).format('YYYY-MM-DD');
    days.push({
      date,
      day,
      isCurrentMonth: false,
      isToday: date === today,
      scheduleCount: 0
    });
  }
  
  for (let d = 1; d <= daysInMonth; d++) {
    const date = dayjs(`${year}-${month + 1}-${d}`).format('YYYY-MM-DD');
    days.push({
      date,
      day: d,
      isCurrentMonth: true,
      isToday: date === today,
      scheduleCount: 0
    });
  }
  
  const remaining = 42 - days.length;
  const nextMonth = firstDay.add(1, 'month');
  for (let d = 1; d <= remaining; d++) {
    const date = nextMonth.date(d).format('YYYY-MM-DD');
    days.push({
      date,
      day: d,
      isCurrentMonth: false,
      isToday: date === today,
      scheduleCount: 0
    });
  }
  
  return days;
};

export const getScheduleStatusText = (status: string): string => {
  const map: Record<string, string> = {
    pending: '待开始',
    ongoing: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  };
  return map[status] || status;
};

export const getOccupancyStatusText = (status: string): string => {
  const map: Record<string, string> = {
    occupied: '已占用',
    free: '空闲',
    partial: '部分占用',
    cancelled: '已取消'
  };
  return map[status] || status;
};

export const getBatchStatusText = (status: string): string => {
  const map: Record<string, string> = {
    qualified: '合格',
    pending: '待检',
    abnormal: '异常',
    recalled: '已召回'
  };
  return map[status] || status;
};

export const getRecallStatusText = (status: string): string => {
  const map: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    completed: '已完成'
  };
  return map[status] || status;
};

export const getStationTypeText = (type: string): string => {
  return type === 'vehicle' ? '采血车' : '固定采血点';
};

export const isAdjacentAndSameGroup = (o1: Occupancy, o2: Occupancy): boolean => {
  if (o1.preventMerge || o2.preventMerge) return false;
  if (o1.splitFrom || o2.splitFrom) return false;
  if (o1.groupName !== o2.groupName) return false;
  if (o1.date !== o2.date) return false;
  if (o1.stationId !== o2.stationId) return false;

  const t1Start = dayjs(`${o1.date} ${o1.startTime}`);
  const t1End = dayjs(`${o1.date} ${o1.endTime}`);
  const t2Start = dayjs(`${o2.date} ${o2.startTime}`);
  const t2End = dayjs(`${o2.date} ${o2.endTime}`);

  return t1End.isSame(t2Start) || t2End.isSame(t1Start) ||
    (t1Start.isBefore(t2Start) && t1End.isAfter(t2Start)) ||
    (t2Start.isBefore(t1Start) && t2End.isAfter(t1Start));
};

export const mergeOccupancies = (list: Occupancy[]): Occupancy[] => {
  if (list.length <= 1) return list;
  
  const sorted = [...list].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    if (a.stationId !== b.stationId) return a.stationId.localeCompare(b.stationId);
    return a.startTime.localeCompare(b.startTime);
  });
  
  const result: Occupancy[] = [];
  let current: Occupancy | null = null;
  const mergedIds: string[] = [];
  
  for (const item of sorted) {
    if (item.status === 'cancelled') {
      if (current) {
        result.push({ ...current, merged: mergedIds.length > 0, mergedFrom: [...mergedIds] });
        current = null;
        mergedIds.length = 0;
      }
      result.push(item);
      continue;
    }
    
    if (!current) {
      current = { ...item };
      mergedIds.length = 0;
      continue;
    }
    
    if (isAdjacentAndSameGroup(current, item)) {
      const t1Start = dayjs(`${current.date} ${current.startTime}`);
      const t1End = dayjs(`${current.date} ${current.endTime}`);
      const t2Start = dayjs(`${item.date} ${item.startTime}`);
      const t2End = dayjs(`${item.date} ${item.endTime}`);
      
      const newStart = t1Start.isBefore(t2Start) ? current.startTime : item.startTime;
      const newEnd = t1End.isAfter(t2End) ? current.endTime : item.endTime;
      
      mergedIds.push(current.id, item.id);
      current = {
        ...current,
        startTime: newStart,
        endTime: newEnd,
        status: 'occupied'
      };
    } else {
      result.push({ ...current, merged: mergedIds.length > 0, mergedFrom: [...mergedIds] });
      current = { ...item };
      mergedIds.length = 0;
    }
  }
  
  if (current) {
    result.push({ ...current, merged: mergedIds.length > 0, mergedFrom: [...mergedIds] });
  }
  
  return result;
};

export const splitOccupancy = (occupancy: Occupancy, splitTime: string): Occupancy[] => {
  const splitDateTime = dayjs(`${occupancy.date} ${splitTime}`);
  const startTime = dayjs(`${occupancy.date} ${occupancy.startTime}`);
  const endTime = dayjs(`${occupancy.date} ${occupancy.endTime}`);
  
  if (splitDateTime.isBefore(startTime) || splitDateTime.isAfter(endTime)) {
    return [occupancy];
  }
  
  return [
    {
      ...occupancy,
      id: generateId(),
      startTime: occupancy.startTime,
      endTime: splitTime,
      merged: false,
      splitFrom: occupancy.id,
      createdAt: new Date().toISOString()
    },
    {
      ...occupancy,
      id: generateId(),
      startTime: splitTime,
      endTime: occupancy.endTime,
      merged: false,
      splitFrom: occupancy.id,
      createdAt: new Date().toISOString()
    }
  ];
};
