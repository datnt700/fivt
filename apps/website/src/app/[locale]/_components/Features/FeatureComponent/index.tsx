import { ThemeContext } from '@/app/context/ThemeContext';
import styles from './styles.module.scss';
import { Card, Icon } from '@revt/diverse';
import React, { useContext } from 'react';

interface FeatureComponentProps {
  title: string;
  description: string;
  icon: React.JSX.Element;
}

export const FeatureComponent = ({
  title,
  description,
  icon,
}: FeatureComponentProps) => {
  const { isDarkModeChecked } = useContext(ThemeContext);

  return (
    <Card className={styles.itemDetail}>
      <div className={styles.container}>
        <Icon
          source={icon}
          className={
            isDarkModeChecked
              ? `${styles.icon}${styles.light}`
              : `${styles.icon}`
          }
        />
        <div className={styles.featuresDescription}>
          <h2 className={styles.descriptionTitle}>{title}</h2>
          <h3 className={styles.descriptionDetail}>{description}</h3>
        </div>
      </div>
    </Card>
  );
};
