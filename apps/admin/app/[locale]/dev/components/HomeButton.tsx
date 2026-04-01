import Link from 'next/link';
import styles from '../css/HomeButton.module.css';

export default function HomeButton() {
  return (
    <Link href="/" className={styles.homeBtn}>
      <span className={styles.icon}>←</span>
      <span className={styles.text}>cd ~</span>
    </Link>
  );
}
