import dayjs from 'dayjs';
import type { Batch, BloodBag, BloodType } from '@/types';
import { generateBagNumber } from '@/utils';

const today = dayjs();

const generateBags = (batchNumber: string, count: number): BloodBag[] => {
  const bloodTypes: BloodType[] = ['A', 'B', 'AB', 'O'];
  const bags: BloodBag[] = [];
  for (let i = 1; i <= count; i++) {
    bags.push({
      id: `bag${batchNumber}${i}`,
      bagNumber: generateBagNumber(batchNumber, i),
      bloodType: bloodTypes[Math.floor(Math.random() * 4)],
      volume: 200 + Math.floor(Math.random() * 2) * 100,
      donorName: `献血者${String(i).padStart(3, '0')}`
    });
  }
  return bags;
};

const calcDistribution = (bags: BloodBag[]): Record<BloodType, number> => {
  const dist: Record<BloodType, number> = { A: 0, B: 0, AB: 0, O: 0 };
  bags.forEach(bag => {
    dist[bag.bloodType]++;
  });
  return dist;
};

const bags1 = generateBags('B202606170001', 38);
const bags2 = generateBags('B202606170002', 75);
const bags3 = generateBags('B202606160003', 68);
const bags4 = generateBags('B202606160004', 45);
const bags5 = generateBags('B202606180005', 32);

export const mockBatches: Batch[] = [
  {
    id: 'bat001',
    batchNumber: 'B202606170001',
    collectDate: today.subtract(1, 'day').format('YYYY-MM-DD'),
    expiryDate: today.add(34, 'day').format('YYYY-MM-DD'),
    stationId: 'st001',
    stationName: '1号采血车',
    totalBags: bags1.length,
    totalVolume: bags1.reduce((s, b) => s + b.volume, 0),
    bloodTypeDistribution: calcDistribution(bags1),
    status: 'qualified',
    bags: bags1,
    notes: '第一人民医院组织献血',
    createdAt: today.subtract(1, 'day').toISOString()
  },
  {
    id: 'bat002',
    batchNumber: 'B202606170002',
    collectDate: today.subtract(1, 'day').format('YYYY-MM-DD'),
    expiryDate: today.add(34, 'day').format('YYYY-MM-DD'),
    stationId: 'st002',
    stationName: '2号采血车',
    totalBags: bags2.length,
    totalVolume: bags2.reduce((s, b) => s + b.volume, 0),
    bloodTypeDistribution: calcDistribution(bags2),
    status: 'qualified',
    bags: bags2,
    notes: '师范大学献血活动',
    createdAt: today.subtract(1, 'day').toISOString()
  },
  {
    id: 'bat003',
    batchNumber: 'B202606160003',
    collectDate: today.subtract(2, 'day').format('YYYY-MM-DD'),
    expiryDate: today.add(33, 'day').format('YYYY-MM-DD'),
    stationId: 'st002',
    stationName: '2号采血车',
    totalBags: bags3.length,
    totalVolume: bags3.reduce((s, b) => s + b.volume, 0),
    bloodTypeDistribution: calcDistribution(bags3),
    status: 'pending',
    bags: bags3,
    notes: '理工大学献血活动，检测中',
    createdAt: today.subtract(2, 'day').toISOString()
  },
  {
    id: 'bat004',
    batchNumber: 'B202606160004',
    collectDate: today.subtract(2, 'day').format('YYYY-MM-DD'),
    expiryDate: today.add(33, 'day').format('YYYY-MM-DD'),
    stationId: 'st004',
    stationName: '中心献血屋',
    totalBags: bags4.length,
    totalVolume: bags4.reduce((s, b) => s + b.volume, 0),
    bloodTypeDistribution: calcDistribution(bags4),
    status: 'abnormal',
    bags: bags4,
    notes: '发现2袋ALT异常，待复核',
    createdAt: today.subtract(2, 'day').toISOString()
  },
  {
    id: 'bat005',
    batchNumber: 'B202606180005',
    collectDate: today.format('YYYY-MM-DD'),
    expiryDate: today.add(35, 'day').format('YYYY-MM-DD'),
    stationId: 'st001',
    stationName: '1号采血车',
    totalBags: bags5.length,
    totalVolume: bags5.reduce((s, b) => s + b.volume, 0),
    bloodTypeDistribution: calcDistribution(bags5),
    status: 'pending',
    bags: bags5,
    notes: '市直机关工委献血活动',
    createdAt: today.toISOString()
  },
  {
    id: 'bat006',
    batchNumber: 'B202606180006',
    collectDate: today.format('YYYY-MM-DD'),
    expiryDate: today.add(35, 'day').format('YYYY-MM-DD'),
    stationId: 'st004',
    stationName: '中心献血屋',
    totalBags: 45,
    totalVolume: 11200,
    bloodTypeDistribution: { A: 12, B: 10, AB: 5, O: 18 },
    status: 'qualified',
    bags: generateBags('B202606180006', 45),
    notes: '日常散客采血',
    createdAt: today.toISOString()
  },
  {
    id: 'bat007',
    batchNumber: 'B202606150007',
    collectDate: today.subtract(3, 'day').format('YYYY-MM-DD'),
    expiryDate: today.add(32, 'day').format('YYYY-MM-DD'),
    stationId: 'st004',
    stationName: '中心献血屋',
    totalBags: 82,
    totalVolume: 20500,
    bloodTypeDistribution: { A: 22, B: 18, AB: 12, O: 30 },
    status: 'recalled',
    bags: generateBags('B202606150007', 82),
    notes: '因设备校准问题召回',
    createdAt: today.subtract(3, 'day').toISOString()
  }
];
