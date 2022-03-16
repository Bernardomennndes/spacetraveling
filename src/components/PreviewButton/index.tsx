import Link from 'next/link';
import styles from './button.module.scss';
import commonStyles from '../../styles/common.module.scss';

export function PreviewButton(): JSX.Element {
  return (
    <>
      <Link href="/api/exit-preview">
        <a
          className={`${commonStyles.maxComponentWidth} ${styles.previewButton}`}
        >
          Sair do modo Preview
        </a>
      </Link>
    </>
  );
}
