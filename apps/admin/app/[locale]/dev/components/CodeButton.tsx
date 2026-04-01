import React from 'react';
import styles from '../css/CodeButton.module.css';

interface CodeButtonProps {
  onClick?: () => void;
  text?: string;
}

export const CodeButton: React.FC<CodeButtonProps> = ({
  onClick,
  text = '</>',
}) => {
  return (
    <button className={styles.btnCode} onClick={onClick}>
      {/* 🚀 퍼플-시안 그라데이션 광원 코어 */}
      <span className={styles.coreGlow}></span>

      {/* 🔮 중앙 그라데이션 기호/글자 */}
      <span className={styles.symbol}>{text}</span>

      {/* ⚡️ 상단 반사광 디테일 */}
      <span className={styles.reflection}></span>
    </button>
  );
};
