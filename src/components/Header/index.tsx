import Image from 'next/image';
import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <Image
          src="/images/logo.svg"
          alt="logo"
          width="238.62"
          height="25.63"
        />
      </div>
    </header>
  );
}
