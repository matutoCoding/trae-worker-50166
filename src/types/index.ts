export type ScheduleStatus = 'pending' | 'ongoing' | 'completed' | 'cancelled';
export type OccupancyStatus = 'occupied' | 'free' | 'partial' | 'cancelled';
export type BatchStatus = 'qualified' | 'pending' | 'abnormal' | 'recalled';
export type RecallStatus = 'pending' | 'processing' | 'completed';
export type StationType = 'vehicle' | 'fixed';
export type BloodType = 'A' | 'B' | 'AB' | 'O';

export interface Station {
  id: string;
  name: string;
  type: StationType;
  location: string;
  capacity: number;
  status: 'active' | 'inactive';
  description?: string;
}

export interface Schedule {
  id: string;
  stationId: string;
  stationName: string;
  groupName: string;
  date: string;
  startTime: string;
  endTime: string;
  expectedDonors: number;
  actualDonors?: number;
  status: ScheduleStatus;
  contactPerson?: string;
  contactPhone?: string;
  notes?: string;
  merged?: boolean;
  mergedIds?: string[];
  createdAt: string;
}

export interface Occupancy {
  id: string;
  stationId: string;
  stationName: string;
  groupName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: OccupancyStatus;
  merged: boolean;
  mergedFrom?: string[];
  splitFrom?: string;
  createdAt: string;
}

export interface BloodBag {
  id: string;
  bagNumber: string;
  bloodType: BloodType;
  volume: number;
  donorId?: string;
  donorName?: string;
}

export interface Batch {
  id: string;
  batchNumber: string;
  collectDate: string;
  expiryDate: string;
  stationId: string;
  stationName: string;
  totalBags: number;
  totalVolume: number;
  bloodTypeDistribution: Record<BloodType, number>;
  status: BatchStatus;
  bags: BloodBag[];
  notes?: string;
  createdAt: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
}

export interface FlowRecord {
  id: string;
  batchId: string;
  batchNumber: string;
  hospitalId: string;
  hospitalName: string;
  bagsCount: number;
  volume: number;
  shippedAt: string;
  receivedAt?: string;
  bloodTypes: BloodType[];
}

export interface Recall {
  id: string;
  recallNumber: string;
  batchId: string;
  batchNumber: string;
  reason: string;
  status: RecallStatus;
  flowRecords: FlowRecord[];
  createdAt: string;
  completedAt?: string;
}

export interface CalendarDay {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  scheduleCount: number;
}
