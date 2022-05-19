import { ReactNode } from 'react';

import styles from './style.module.scss'

interface IProps {
  title: ReactNode | string;

  /**
   * Operating area, at the end of the line of the title line
   */
  extra?: [ReactNode];
}

const PageHeader = (props: IProps) => {
  return (
    <div className={styles['header']}>
      <div className={styles['header__title']}>
        <h1>{props.title}</h1>
      </div>

      {
        props?.extra && props.extra.length && (
          <div className={styles['header__extra']}>
            {
              props.extra.map(ex => ex)
            }
          </div>
        )
      }
    </div>
  )
}

export default PageHeader;

