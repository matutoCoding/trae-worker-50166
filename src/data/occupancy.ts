import dayjs from 'dayjs';
import type { Occupancy } from '@/types';
import { mergeOccupancies } from '@/utils';

const today = dayjs();

const rawOccupancies: Occupancy[] = [
  {
    id: 'occ001',
    stationId: 'st001',
    stationName: '1号采血车',
    groupName: '市直机关工委',
    date: today.format('YYYY-MM-DD'),
    startTime: '08:30',
    endTime: '10:00',
    status: 'occupied',
    merged: false,
    createdAt: today.subtract(3, 'day').toISOString()
  },
  {
    id: 'occ002',
    stationId: 'st001',
    stationName: '1号采血车',
    groupName: '市直机关工委',
    date: today.format('YYYY-MM-DD'),
    startTime: '10:00',
    endTime: '11:30',
    status: 'occupied',
    merged: false,
    createdAt: today.subtract(3, 'day').toISOString()
  },
  {
    id: 'occ003',
    stationId: 'st001',
    stationName: '1号采血车',
    groupName: '市直机关工委',
    date: today.format('YYYY-MM-DD'),
    startTime: '13:30',
    endTime: '15:00',
    status: 'occupied',
    merged: false,
    createdAt: today.subtract(3, 'day').toISOString()
  },
  {
    id: 'occ004',
    stationId: 'st001',
    stationName: '1号采血车',
    groupName: '市直机关工委',
    date: today.format('YYYY-MM-DD'),
    startTime: '15:00',
    endTime: '16:30',
    status: 'occupied',
    merged: false,
    createdAt: today.subtract(3, 'day').toISOString()
  },
  {
    id: 'occ005',
    stationId: 'st002',
    stationName: '2号采血车',
    groupName: '理工大学',
    date: today.format('YYYY-MM-DD'),
    startTime: '09:00',
    endTime: '11:00',
    status: 'occupied',
    merged: false,
    createdAt: today.subtract(5, 'day').toISOString()
  },
  {
    id: 'occ006',
    stationId: 'st002',
    stationName: '2号采血车',
    groupName: '理工大学',
    date: today.format('YYYY-MM-DD'),
    startTime: '11:00',
    endTime: '14:00',
    status: 'occupied',
    merged: false,
    createdAt: today.subtract(5, 'day').toISOString()
  },
  {
    id: 'occ007',
    stationId: 'st002',
    stationName: '2号采血车',
    groupName: '理工大学',
    date: today.format('YYYY-MM-DD'),
    startTime: '14:00',
    endTime: '17:00',
    status: 'occupied',
    merged: false,
    createdAt: today.subtract(5, 'day').toISOString()
  },
  {
    id: 'occ008',
    stationId: 'st004',
    stationName: '中心献血屋',
    groupName: '散客采血',
    date: today.format('YYYY-MM-DD'),
    startTime: '08:00',
    endTime: '18:00',
    status: 'occupied',
    merged: false,
    createdAt: today.subtract(1, 'day').toISOString()
  },
  {
    id: 'occ009',
    stationId: 'st003',
    stationName: '3号采血车',
    groupName: '华为科技园区',
    date: today.add(1, 'day').format('YYYY-MM-DD'),
    startTime: '09:00',
    endTime: '12:00',
    status: 'occupied',
    merged: false,
    createdAt: today.subtract(2, 'day').toISOString()
  },
  {
    id: 'occ010',
    stationId: 'st003',
    stationName: '3号采血车',
    groupName: '华为科技园区',
    date: today.add(1, 'day').format('YYYY-MM-DD'),
    startTime: '13:00',
    endTime: '16:00',
    status: 'occupied',
    merged: false,
    createdAt: today.subtract(2, 'day').toISOString()
  },
  {
    id: 'occ011',
    stationId: 'st005',
    stationName: '东区献血屋',
    groupName: '散客采血',
    date: today.add(1, 'day').format('YYYY-MM-DD'),
    startTime: '08:30',
    endTime: '17:30',
    status: 'occupied',
    merged: false,
    createdAt: today.toISOString()
  },
  {
    id: 'occ012',
    stationId: 'st003',
    stationName: '3号采血车',
    groupName: '市建设银行',
    date: today.add(2, 'day').format('YYYY-MM-DD'),
    startTime: '09:00',
    endTime: '15:00',
    status: 'cancelled',
    merged: false,
    createdAt: today.subtract(3, 'day').toISOString()
  },
  {
    id: 'occ013',
    stationId: 'st004',
    stationName: '中心献血屋',
    groupName: '散客采血',
    date: today.add(2, 'day').format('YYYY-MM-DD'),
    startTime: '08:00',
    endTime: '18:00',
    status: 'occupied',
    merged: false,
    createdAt: today.toISOString()
  }
];

export const rawOccupanciesData: Occupancy[] = [...rawOccupancies];
export const mockOccupancies: Occupancy[] = mergeOccupancies(rawOccupancies);
