import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

export type TimeBarStatus = 'occupied' | 'free' | 'partial' | 'cancelled';

interface TimeBarProps {
  startTime: string;
  endTime: string;
  status: TimeBarStatus;
  label?: string;
  className?: string;
  onClick?: () => void;
}

const TimeBar: React.FC<TimeBarProps> = ({ startTime, endTime, status, label, className, onClick }) => {
  return (
    <View
      className={classnames(styles.timeBar, styles[status], className)}
      onClick={onClick}
    >
      <View className={styles.timeRange}>
        <Text className={styles.time}>{startTime}</Text>
        <Text className={styles.dash}>-</Text>
        <Text className={styles.time}>{endTime}</Text>
      </View>
      {label && <Text className={styles.label}>{label}</Text>}
    </View>
  );
};

export default TimeBar;
