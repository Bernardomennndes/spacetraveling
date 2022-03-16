import styles from './button.module.scss';
import commonStyles from '../../styles/common.module.scss';

export function PreviewButton(): JSX.Element {
  return (
    <>
      <button
        className={`${commonStyles.maxComponentWidth} ${styles.previewButton}`}
        onClick={() => {}}
        type="button"
      >
        Entrar no modo Preview
      </button>
    </>
  );
}
