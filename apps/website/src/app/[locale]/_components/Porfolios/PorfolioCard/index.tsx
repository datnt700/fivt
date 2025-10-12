import { Icon } from '@revt/diverse';
import styles from '@/app/[locale]/_components/Porfolios/PorfolioCard/index.module.scss';
import React, { useContext } from 'react';
import { ThemeContext } from '@/app/context/ThemeContext';

export const PorfolioCard = ({
  name,
  detail,
  icon,
}: {
  name: string;
  detail: string;
  icon: React.JSX.Element;
}) => {
  const { isDarkModeChecked } = useContext(ThemeContext);

  return (
    <div className={styles.portfolio}>
      <Icon
        source={icon}
        className={
          isDarkModeChecked ? `${styles.icon}${styles.light}` : `${styles.icon}`
        }
      />
      <div className={styles.text}>
        <h3 className={styles.name}>{name}</h3>
        <p className={styles.detail}>{detail}</p>
      </div>
    </div>
  );
};
