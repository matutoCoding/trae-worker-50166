import dayjs from 'dayjs';
import type { FlowRecord, Recall, Hospital } from '@/types';

const today = dayjs();

export const mockHospitals: Hospital[] = [
  { id: 'h001', name: '市第一人民医院', address: '市中心人民路1号', contactPerson: '李主任', contactPhone: '13900139001' },
  { id: 'h002', name: '市第二人民医院', address: '东区建设路88号', contactPerson: '王主任', contactPhone: '13900139002' },
  { id: 'h003', name: '市中心医院', address: '中山大道120号', contactPerson: '张主任', contactPhone: '13900139003' },
  { id: 'h004', name: '市妇幼保健院', address: '和平路56号', contactPerson: '赵主任', contactPhone: '13900139004' },
  { id: 'h005', name: '市中医院', address: '文化路200号', contactPerson: '刘主任', contactPhone: '13900139005' },
  { id: 'h006', name: '铁路医院', address: '火车站旁', contactPerson: '孙主任', contactPhone: '13900139006' }
];

export const mockFlowRecords: FlowRecord[] = [
  {
    id: 'fl001',
    batchId: 'bat001',
    batchNumber: 'B202606170001',
    hospitalId: 'h001',
    hospitalName: '市第一人民医院',
    bagsCount: 15,
    volume: 3750,
    shippedAt: today.subtract(1, 'day').hour(10).minute(30).toISOString(),
    receivedAt: today.subtract(1, 'day').hour(11).minute(45).toISOString(),
    bloodTypes: ['A', 'B', 'O']
  },
  {
    id: 'fl002',
    batchId: 'bat001',
    batchNumber: 'B202606170001',
    hospitalId: 'h003',
    hospitalName: '市中心医院',
    bagsCount: 12,
    volume: 3000,
    shippedAt: today.subtract(1, 'day').hour(10).minute(30).toISOString(),
    receivedAt: today.subtract(1, 'day').hour(12).minute(10).toISOString(),
    bloodTypes: ['A', 'AB', 'O']
  },
  {
    id: 'fl003',
    batchId: 'bat001',
    batchNumber: 'B202606170001',
    hospitalId: 'h004',
    hospitalName: '市妇幼保健院',
    bagsCount: 11,
    volume: 2750,
    shippedAt: today.subtract(1, 'day').hour(14).minute(0).toISOString(),
    receivedAt: today.subtract(1, 'day').hour(15).minute(20).toISOString(),
    bloodTypes: ['A', 'B', 'AB']
  },
  {
    id: 'fl004',
    batchId: 'bat002',
    batchNumber: 'B202606170002',
    hospitalId: 'h002',
    hospitalName: '市第二人民医院',
    bagsCount: 25,
    volume: 6250,
    shippedAt: today.subtract(1, 'day').hour(16).minute(0).toISOString(),
    receivedAt: today.subtract(1, 'day').hour(17).minute(30).toISOString(),
    bloodTypes: ['A', 'B', 'AB', 'O']
  },
  {
    id: 'fl005',
    batchId: 'bat002',
    batchNumber: 'B202606170002',
    hospitalId: 'h005',
    hospitalName: '市中医院',
    bagsCount: 20,
    volume: 5000,
    shippedAt: today.hour(9).minute(0).toISOString(),
    receivedAt: today.hour(10).minute(30).toISOString(),
    bloodTypes: ['A', 'O']
  },
  {
    id: 'fl006',
    batchId: 'bat002',
    batchNumber: 'B202606170002',
    hospitalId: 'h006',
    hospitalName: '铁路医院',
    bagsCount: 18,
    volume: 4500,
    shippedAt: today.hour(9).minute(0).toISOString(),
    receivedAt: today.hour(10).minute(45).toISOString(),
    bloodTypes: ['B', 'AB', 'O']
  },
  {
    id: 'fl007',
    batchId: 'bat007',
    batchNumber: 'B202606150007',
    hospitalId: 'h001',
    hospitalName: '市第一人民医院',
    bagsCount: 30,
    volume: 7500,
    shippedAt: today.subtract(2, 'day').hour(10).minute(0).toISOString(),
    receivedAt: today.subtract(2, 'day').hour(11).minute(30).toISOString(),
    bloodTypes: ['A', 'B', 'AB', 'O']
  },
  {
    id: 'fl008',
    batchId: 'bat007',
    batchNumber: 'B202606150007',
    hospitalId: 'h003',
    hospitalName: '市中心医院',
    bagsCount: 28,
    volume: 7000,
    shippedAt: today.subtract(2, 'day').hour(10).minute(0).toISOString(),
    receivedAt: today.subtract(2, 'day').hour(12).minute(0).toISOString(),
    bloodTypes: ['A', 'B', 'O']
  },
  {
    id: 'fl009',
    batchId: 'bat007',
    batchNumber: 'B202606150007',
    hospitalId: 'h002',
    hospitalName: '市第二人民医院',
    bagsCount: 24,
    volume: 6000,
    shippedAt: today.subtract(2, 'day').hour(14).minute(30).toISOString(),
    receivedAt: today.subtract(2, 'day').hour(16).minute(0).toISOString(),
    bloodTypes: ['A', 'AB', 'O']
  }
];

export const mockRecalls: Recall[] = [
  {
    id: 'rc001',
    recallNumber: 'R202606180001',
    batchId: 'bat007',
    batchNumber: 'B202606150007',
    reason: '采集设备校准记录异常，存在潜在质量风险',
    status: 'processing',
    flowRecords: mockFlowRecords.filter(f => f.batchId === 'bat007'),
    createdAt: today.hour(8).minute(30).toISOString()
  },
  {
    id: 'rc002',
    recallNumber: 'R202606160002',
    batchId: 'bat004',
    batchNumber: 'B202606160004',
    reason: '初检发现ALT异常，待复核后决定是否召回',
    status: 'pending',
    flowRecords: [],
    createdAt: today.subtract(1, 'day').hour(15).minute(0).toISOString()
  }
];
