'use client';

import { useState, useRef, useEffect } from 'react';
import styles from '../css/TerminalLog.module.css';

const BOOT_LOGS = [
  {
    text: 'root@vps-hostinger:~# docker-compose up -d',
    delay: 400,
    type: 'cmd',
  },
  {
    text: '[INFO] Starting football-api_1 ... done',
    delay: 1000,
    type: 'info',
  },
  {
    text: '[OK] MongoDB & Redis containers are healthy.',
    delay: 1600,
    type: 'success',
  },
  { text: '[INFO] NestJS application initialized.', delay: 2200, type: 'info' },
  {
    text: '--- SYSTEM READY. TYPE "HELP" TO START ---',
    delay: 2800,
    type: 'success',
  },
];

export default function TerminalLog() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isBooting, setIsBooting] = useState(true);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // 1. 자동 부팅 시퀀스
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && logs.length === 0) {
          BOOT_LOGS.forEach((line, i) => {
            setTimeout(() => {
              setLogs((prev) => [...prev, { ...line, id: Date.now() + i }]);
              if (i === BOOT_LOGS.length - 1) setIsBooting(false);
            }, line.delay);
          });
        }
      },
      { threshold: 0.5 },
    );

    if (terminalRef.current) observer.observe(terminalRef.current);
    return () => observer.disconnect();
  }, [logs]);

  useEffect(() => {
    if (logs.length > 0) {
      endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [logs]);

  // 2. 명령어 처리 (추가 아이디어: system info 명령어)
  const handleCommand = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const cmd = input.trim().toLowerCase();
      if (!cmd) return;

      const newLogs: any[] = [
        { id: Date.now(), text: `root@vps:~# ${cmd}`, type: 'input' },
      ];

      if (cmd === 'help') {
        newLogs.push({
          id: Date.now() + 1,
          text: 'Commands: ping, whoami, clear, sys-info',
          type: 'info',
        });
      } else if (cmd === 'sys-info') {
        newLogs.push({
          id: Date.now() + 1,
          text: `OS: ${navigator.platform} | Arch: x64 | Engine: V8`,
          type: 'success',
        });
      } else if (cmd === 'ping') {
        newLogs.push({
          id: Date.now() + 1,
          text: '64 bytes from api.footballuz: icmp_seq=1 ttl=64 time=22.4 ms',
          type: 'success',
        });
      } else if (cmd === 'whoami') {
        newLogs.push({
          id: Date.now() + 1,
          text: 'Abror - Lead Developer',
          type: 'success',
        });
      } else if (cmd === 'clear') {
        setLogs([]);
        setInput('');
        return;
      } else {
        newLogs.push({
          id: Date.now() + 1,
          text: `Command not found: ${cmd}`,
          type: 'error',
        });
      }

      setLogs((prev) => [...prev, ...newLogs]);
      setInput('');
    }
  };

  return (
    <div className={styles.wrapper} ref={terminalRef}>
      <div className={styles.header}>
        <div className={styles.dots}>
          <span className={styles.dotRed} />
          <span className={styles.dotYellow} />
          <span className={styles.dotGreen} />
        </div>
        <span className={styles.title}>bash — football-uz</span>
      </div>
      <div
        className={styles.body}
        onClick={() => document.getElementById('term-in')?.focus()}
      >
        {logs.map((l) => (
          <div key={l.id} className={`${styles.line} ${styles[l.type]}`}>
            {l.text}
          </div>
        ))}
        {!isBooting && (
          <div className={styles.inputRow}>
            <span className={styles.prompt}>root@vps:~#</span>
            <input
              id="term-in"
              className={styles.inputField}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleCommand}
              autoComplete="off"
            />
          </div>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
