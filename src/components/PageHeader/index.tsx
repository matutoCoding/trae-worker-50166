import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  rightContent?: React.ReactNode;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, rightContent, className }) => {
  return (
    <View className={classnames(styles.pageHeader, className)}>
      <View className={styles.headerContent}>
        <View className={styles.titleWrap}>
          <Text className={styles.title}>{title}</Text>
          {subtitle && <Text className={styles.subtitle}>{subtitle}</Text>}
        </View>
        {rightContent && <View className={styles.rightContent}>{rightContent}</View>}
      </View>
    </View>
  );
};

export default PageHeader;
