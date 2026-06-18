import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import dayjs from 'dayjs';
import type {
  Schedule, ScheduleStatus,
  Station, StationType,
  Occupancy, OccupancyStatus,
  Batch, BatchStatus, BloodBag, BloodType,
  Recall, RecallStatus,
  FlowRecord, Hospital
} from '@/types';
import { mockSchedules } from '@/data/schedule';
import { mockStations } from '@/data/station';
import { mockOccupancies, rawOccupanciesData } from '@/data/occupancy';
import { mockBatches } from '@/data/batch';
import { mockFlowRecords, mockRecalls, mockHospitals } from '@/data/recall';
import {
  generateId, generateBatchNumber, generateBagNumber, generateRecallNumber,
  mergeOccupancies
} from '@/utils';

const STORE_CHANGE = 'store_change';
export const SCHEDULE_LIST_FOCUS = 'schedule_list_focus';

let _schedules: Schedule[] = [...mockSchedules];
let _stations: Station[] = [...mockStations];
let _rawOccupancies: Occupancy[] = [...rawOccupanciesData];
let _batches: Batch[] = [...mockBatches];
let _recalls: Recall[] = [...mockRecalls];
let _flowRecords: FlowRecord[] = [...mockFlowRecords];
let _hospitals: Hospital[] = [...mockHospitals];

function notify() {
  Taro.eventCenter.trigger(STORE_CHANGE);
}

export function getSchedules(): Schedule[] { return _schedules; }
export function getStations(): Station[] { return _stations; }
export function getActiveStations(): Station[] { return _stations.filter(s => s.status === 'active'); }
export function getOccupancies(): Occupancy[] { return mergeOccupancies(_rawOccupancies); }
export function getRawOccupancies(): Occupancy[] { return _rawOccupancies; }
export function getBatches(): Batch[] { return _batches; }
export function getRecalls(): Recall[] { return _recalls; }
export function getFlowRecords(): FlowRecord[] { return _flowRecords; }
export function getHospitals(): Hospital[] { return _hospitals; }

export function addSchedule(data: {
  stationId: string;
  stationName: string;
  groupName: string;
  date: string;
  startTime: string;
  endTime: string;
  expectedDonors: number;
  contactPerson?: string;
  contactPhone?: string;
  notes?: string;
}) {
  const schedule: Schedule = {
    id: generateId(),
    ...data,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  _schedules = [schedule, ..._schedules];

  const occupancy: Occupancy = {
    id: generateId(),
    stationId: data.stationId,
    stationName: data.stationName,
    groupName: data.groupName,
    date: data.date,
    startTime: data.startTime,
    endTime: data.endTime,
    status: 'occupied',
    merged: false,
    createdAt: new Date().toISOString()
  };
  _rawOccupancies = [..._rawOccupancies, occupancy];

  notify();
  Taro.eventCenter.trigger(SCHEDULE_LIST_FOCUS, { date: schedule.date, status: schedule.status });
}

export function updateScheduleStatus(id: string, status: ScheduleStatus) {
  const updated = _schedules.map(s => {
    if (s.id !== id) return s;
    return { ...s, status, ...(status === 'completed' ? { actualDonors: s.actualDonors || s.expectedDonors } : {}) };
  });
  const changedSchedule = updated.find(s => s.id === id);
  _schedules = updated;

  if (status === 'cancelled') {
    const schedule = _schedules.find(s => s.id === id);
    if (schedule) {
      _rawOccupancies = _rawOccupancies.map(o => {
        if (o.stationId === schedule.stationId &&
            o.date === schedule.date &&
            o.groupName === schedule.groupName &&
            o.startTime >= schedule.startTime &&
            o.endTime <= schedule.endTime &&
            o.status === 'occupied') {
          return { ...o, status: 'cancelled' as OccupancyStatus };
        }
        return o;
      });
    }
  }

  notify();
  if (changedSchedule) {
    Taro.eventCenter.trigger(SCHEDULE_LIST_FOCUS, { date: changedSchedule.date, status });
  }
}

export function addStation(data: {
  name: string;
  type: StationType;
  location: string;
  capacity: number;
  description?: string;
}) {
  const station: Station = {
    id: generateId(),
    ...data,
    status: 'active'
  };
  _stations = [..._stations, station];
  notify();
}

export function toggleStationStatus(id: string) {
  _stations = _stations.map(s => {
    if (s.id !== id) return s;
    return { ...s, status: s.status === 'active' ? 'inactive' as const : 'active' as const };
  });
  notify();
}

export function splitOccupancySegment(mergedOcc: Occupancy, splitTime: string) {
  const splitDT = dayjs(`${mergedOcc.date} ${splitTime}`);
  const rangeStart = dayjs(`${mergedOcc.date} ${mergedOcc.startTime}`);
  const rangeEnd = dayjs(`${mergedOcc.date} ${mergedOcc.endTime}`);

  if (!splitDT.isAfter(rangeStart) || !splitDT.isBefore(rangeEnd)) return;

  const result: Occupancy[] = [];
  const splitGroupId = generateId();

  for (const o of _rawOccupancies) {
    if (
      o.stationId !== mergedOcc.stationId ||
      o.date !== mergedOcc.date ||
      o.groupName !== mergedOcc.groupName ||
      o.status !== 'occupied'
    ) {
      result.push(o);
      continue;
    }

    const segStart = dayjs(`${o.date} ${o.startTime}`);
    const segEnd = dayjs(`${o.date} ${o.endTime}`);

    if (!segEnd.isAfter(rangeStart) || !segStart.isBefore(rangeEnd)) {
      result.push(o);
      continue;
    }

    if (!segEnd.isAfter(splitDT)) {
      result.push({ ...o, preventMerge: true, splitFrom: splitGroupId });
    } else if (!segStart.isBefore(splitDT)) {
      result.push({ ...o, preventMerge: true, splitFrom: splitGroupId });
    } else {
      result.push(
        { ...o, endTime: splitTime, merged: false, id: generateId(), createdAt: new Date().toISOString(), preventMerge: true, splitFrom: splitGroupId },
        { ...o, startTime: splitTime, merged: false, id: generateId(), createdAt: new Date().toISOString(), preventMerge: true, splitFrom: splitGroupId }
      );
    }
  }

  _rawOccupancies = result;
  notify();
}

export function cancelOccupancyTimeRange(mergedOcc: Occupancy, cancelStart: string, cancelEnd: string) {
  const cs = dayjs(`${mergedOcc.date} ${cancelStart}`);
  const ce = dayjs(`${mergedOcc.date} ${cancelEnd}`);
  if (!cs.isBefore(ce)) return;

  const result: Occupancy[] = [];

  for (const o of _rawOccupancies) {
    if (
      o.stationId !== mergedOcc.stationId ||
      o.date !== mergedOcc.date ||
      o.groupName !== mergedOcc.groupName ||
      o.status !== 'occupied'
    ) {
      result.push(o);
      continue;
    }

    const segStart = dayjs(`${o.date} ${o.startTime}`);
    const segEnd = dayjs(`${o.date} ${o.endTime}`);

    if (!segEnd.isAfter(cs) || !segStart.isBefore(ce)) {
      result.push(o);
    } else if (!segStart.isBefore(cs) && !segEnd.isAfter(ce)) {
      result.push({ ...o, status: 'cancelled' as OccupancyStatus });
    } else if (segStart.isBefore(cs) && segEnd.isAfter(ce)) {
      result.push(
        { ...o, endTime: cancelStart, merged: false, id: generateId(), createdAt: new Date().toISOString(), preventMerge: true },
        { ...o, startTime: cancelStart, endTime: cancelEnd, status: 'cancelled' as OccupancyStatus, merged: false, id: generateId(), createdAt: new Date().toISOString() },
        { ...o, startTime: cancelEnd, merged: false, id: generateId(), createdAt: new Date().toISOString(), preventMerge: true }
      );
    } else if (segStart.isBefore(cs)) {
      result.push(
        { ...o, endTime: cancelStart, merged: false, preventMerge: true },
        { ...o, startTime: cancelStart, status: 'cancelled' as OccupancyStatus, merged: false, id: generateId(), createdAt: new Date().toISOString() }
      );
    } else {
      result.push(
        { ...o, endTime: cancelEnd, status: 'cancelled' as OccupancyStatus, merged: false, id: generateId(), createdAt: new Date().toISOString() },
        { ...o, startTime: cancelEnd, merged: false, preventMerge: true }
      );
    }
  }

  _rawOccupancies = result;
  notify();
}

export function cancelOccupancySegment(mergedOcc: Occupancy) {
  cancelOccupancyTimeRange(mergedOcc, mergedOcc.startTime, mergedOcc.endTime);
}

export function addBatch(data: {
  stationId: string;
  stationName: string;
  collectDate: string;
  expiryDate: string;
  bloodTypeDistribution: Record<BloodType, number>;
  notes?: string;
}) {
  const batchNumber = generateBatchNumber();
  const bags: BloodBag[] = [];
  const bloodTypes: BloodType[] = ['A', 'B', 'AB', 'O'];

  let bagIndex = 1;
  for (const type of bloodTypes) {
    const count = data.bloodTypeDistribution[type] || 0;
    for (let i = 0; i < count; i++) {
      bags.push({
        id: `bag_${batchNumber}_${bagIndex}`,
        bagNumber: generateBagNumber(batchNumber, bagIndex),
        bloodType: type,
        volume: 250,
        donorName: `献血者${String(bagIndex).padStart(3, '0')}`
      });
      bagIndex++;
    }
  }

  const totalBags = bags.length;
  const totalVolume = bags.reduce((s, b) => s + b.volume, 0);

  const batch: Batch = {
    id: generateId(),
    batchNumber,
    collectDate: data.collectDate,
    expiryDate: data.expiryDate,
    stationId: data.stationId,
    stationName: data.stationName,
    totalBags,
    totalVolume,
    bloodTypeDistribution: data.bloodTypeDistribution,
    status: 'pending',
    bags,
    notes: data.notes,
    createdAt: new Date().toISOString()
  };

  _batches = [batch, ..._batches];
  notify();
}

export function updateBatchStatus(id: string, status: BatchStatus) {
  _batches = _batches.map(b => b.id === id ? { ...b, status } : b);
  notify();
}

export function initiateRecall(batchId: string, reason: string) {
  const batch = _batches.find(b => b.id === batchId);
  if (!batch) return;

  const relatedFlows = _flowRecords.filter(f => f.batchId === batchId);

  _batches = _batches.map(b => b.id === batchId ? { ...b, status: 'recalled' as BatchStatus } : b);

  const recall: Recall = {
    id: generateId(),
    recallNumber: generateRecallNumber(),
    batchId,
    batchNumber: batch.batchNumber,
    reason,
    status: 'pending',
    flowRecords: relatedFlows,
    createdAt: new Date().toISOString()
  };

  _recalls = [recall, ..._recalls];
  notify();
}

export function updateRecallStatus(id: string, status: RecallStatus) {
  _recalls = _recalls.map(r => {
    if (r.id !== id) return r;
    return {
      ...r,
      status,
      ...(status === 'completed' ? { completedAt: new Date().toISOString() } : {})
    };
  });
  notify();
}

export function useStoreData() {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const handler = () => setVersion(v => v + 1);
    Taro.eventCenter.on(STORE_CHANGE, handler);
    return () => {
      Taro.eventCenter.off(STORE_CHANGE, handler);
    };
  }, []);

  return {
    schedules: _schedules,
    stations: _stations,
    occupancies: mergeOccupancies(_rawOccupancies),
    batches: _batches,
    recalls: _recalls,
    flowRecords: _flowRecords,
    hospitals: _hospitals,
    version
  };
}
