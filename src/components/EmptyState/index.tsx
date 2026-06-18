import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon = '📋', title, description, className }) => {
  return (
    <View className={classnames(styles.emptyState, className)}>
      <Text className={styles.icon}>{icon}</Text>
      <Text className={styles.title}>{title}</Text>
      {description && <Text className={styles.description}>{description}</Text>}
    </View>
  );
};

export default EmptyState;
