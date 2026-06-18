import type { Station } from '@/types';

export const mockStations: Station[] = [
  {
    id: 'st001',
    name: '1号采血车',
    type: 'vehicle',
    location: '市中心广场',
    capacity: 30,
    status: 'active',
    description: '配备3张采血椅，移动灵活'
  },
  {
    id: 'st002',
    name: '2号采血车',
    type: 'vehicle',
    location: '大学城东门',
    capacity: 25,
    status: 'active',
    description: '配备2张采血椅，适合校园'
  },
  {
    id: 'st003',
    name: '3号采血车',
    type: 'vehicle',
    location: '开发区工业园',
    capacity: 30,
    status: 'active',
    description: '配备3张采血椅'
  },
  {
    id: 'st004',
    name: '中心献血屋',
    type: 'fixed',
    location: '市血液中心一楼',
    capacity: 50,
    status: 'active',
    description: '固定采血点，配备6张采血椅'
  },
  {
    id: 'st005',
    name: '东区献血屋',
    type: 'fixed',
    location: '东区市民服务中心',
    capacity: 35,
    status: 'active',
    description: '固定采血点，配备4张采血椅'
  },
  {
    id: 'st006',
    name: '4号采血车',
    type: 'vehicle',
    location: '备用',
    capacity: 25,
    status: 'inactive',
    description: '维修中'
  }
];
