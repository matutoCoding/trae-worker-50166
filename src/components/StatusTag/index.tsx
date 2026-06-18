import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

export type StatusType = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default' | 'purple';

interface StatusTagProps {
  type?: StatusType;
  text: string;
  size?: 'sm' | 'md';
  className?: string;
}

const StatusTag: React.FC<StatusTagProps> = ({ type = 'default', text, size = 'md', className }) => {
  return (
    <View className={classnames(styles.statusTag, styles[type], styles[size], className)}>
      <Text className={styles.text}>{text}</Text>
    </View>
  );
};

export default StatusTag;
