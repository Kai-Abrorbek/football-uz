import React, { forwardRef } from 'react';
import styles from '../css/SystemArchitecture.module.css';

const SystemArchitecture = forwardRef<HTMLDivElement, {}>((props, ref) => {
  return (
    <div className={styles.container} ref={ref}>
      <div className={styles.pageHeader}>
        <h1>
          <span className={styles.liveDot}></span>System Architecture
        </h1>
        <h2>Football UZ</h2>
        <p>
          v1.0.0 &nbsp;·&nbsp; Hostinger KVM2 VPS &nbsp;·&nbsp; Docker Compose
          &nbsp;·&nbsp; Tashkent, UZ
        </p>
      </div>

      <div className={styles.diagram}>
        {/* ── Layer 1: Clients ── */}
        <div className={styles.layer}>
          <p className={styles.layerLabel}>Client layer</p>
          <div className={styles.nodesRow}>
            {/* React Native */}
            <div className={styles.node}>
              <div className={styles.nodeIcon}>
                <svg width="36" height="36" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="18" fill="#20232a" />
                  <g fill="none" stroke="#61dafb" strokeWidth="1.4">
                    <ellipse cx="18" cy="18" rx="10" ry="4.2" />
                    <ellipse
                      cx="18"
                      cy="18"
                      rx="10"
                      ry="4.2"
                      transform="rotate(60 18 18)"
                    />
                    <ellipse
                      cx="18"
                      cy="18"
                      rx="10"
                      ry="4.2"
                      transform="rotate(120 18 18)"
                    />
                  </g>
                  <circle cx="18" cy="18" r="2.2" fill="#61dafb" />
                </svg>
              </div>
              <span className={styles.nodeName}>React Native</span>
              <span className={styles.nodeSub}>Expo SDK 52</span>
            </div>

            {/* Next.js Web */}
            <div className={styles.node}>
              <div className={styles.nodeIcon}>
                <svg width="36" height="36" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="18" fill="#000" />
                  <path
                    d="M10 25.5V10.5l16 15.5V10.5"
                    stroke="#fff"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </div>
              <span className={styles.nodeName}>Next.js Web</span>
              <span className={styles.nodeSub}>:3000 · public</span>
            </div>

            {/* Next.js Admin */}
            <div className={styles.node}>
              <div className={styles.nodeIcon}>
                <svg width="36" height="36" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="18" fill="#111" />
                  <path
                    d="M10 25.5V10.5l16 15.5V10.5"
                    stroke="#888"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </div>
              <span className={styles.nodeName}>Next.js Admin</span>
              <span className={styles.nodeSub}>:3005 · internal</span>
            </div>
          </div>
        </div>

        {/* connector */}
        <div className={styles.connector}>
          <div
            className={styles.connectorLine}
            style={{ minHeight: '16px' }}
          ></div>
          <div className={styles.connectorLabel}>HTTPS · JWT Cookie</div>
          <div
            className={styles.connectorLine}
            style={{ minHeight: '10px' }}
          ></div>
          <div className={styles.arrowDown}></div>
        </div>

        {/* ── Layer 2: Nginx ── */}
        <div className={styles.layer}>
          <p className={styles.layerLabel}>Gateway · Host</p>
          <div
            className={`${styles.node} ${styles.nodeWide}`}
            style={{ maxWidth: '520px' }}
          >
            <div
              className={styles.nodeIcon}
              style={{
                background: '#009639',
                borderRadius: '10px',
                padding: '4px',
              }}
            >
              <svg width="34" height="34" viewBox="0 0 34 34">
                <rect width="34" height="34" rx="8" fill="#009639" />
                <text
                  x="17"
                  y="23"
                  textAnchor="middle"
                  fontFamily="monospace"
                  fontSize="14"
                  fontWeight="700"
                  fill="#fff"
                >
                  N
                </text>
              </svg>
            </div>
            <div className={styles.nodeText}>
              <span className={styles.nodeName}>Nginx</span>
              <span className={styles.nodeSub}>
                Reverse proxy · SSL termination · Static files
              </span>
              <span className={styles.nodeSub}>
                Let's Encrypt · domain routing · rate limit
              </span>
            </div>
            <span className={`${styles.nodeBadge} ${styles.badgeLive}`}>
              HOST
            </span>
          </div>
        </div>

        {/* connector */}
        <div className={styles.connector}>
          <div
            className={styles.connectorLine}
            style={{ minHeight: '16px' }}
          ></div>
          <div className={styles.connectorLabel}>
            HTTP :4000 · internal network
          </div>
          <div
            className={styles.connectorLine}
            style={{ minHeight: '10px' }}
          ></div>
          <div className={styles.arrowDown}></div>
        </div>

        {/* ── Layer 3: Docker Compose VPS ── */}
        <div className={styles.layer}>
          <p className={styles.layerLabel}>VPS · Docker Compose</p>
          <div className={styles.vpsBox}>
            <span className={styles.vpsLabel}>
              docker compose · Hostinger KVM2
            </span>
            <div className={styles.vpsInner}>
              {/* NestJS */}
              <div className={styles.node} style={{ minWidth: '160px' }}>
                <span className={`${styles.nodeBadge} ${styles.badgeLive}`}>
                  CORE
                </span>
                <div
                  className={styles.nodeIcon}
                  style={{
                    background: '#e0234e',
                    borderRadius: '10px',
                    padding: '2px',
                  }}
                >
                  <svg width="38" height="38" viewBox="0 0 38 38">
                    <rect width="38" height="38" rx="9" fill="#e0234e" />
                    <path
                      d="M19 8 C14 8 10 11 10 16 C10 20 13 23 17 24 L17 29 L19 27 L21 29 L21 24 C25 23 28 20 28 16 C28 11 24 8 19 8Z"
                      fill="rgba(255,255,255,0.15)"
                    />
                    <text
                      x="19"
                      y="23"
                      textAnchor="middle"
                      fontFamily="monospace"
                      fontSize="11"
                      fontWeight="700"
                      fill="#fff"
                    >
                      Nest
                    </text>
                  </svg>
                </div>
                <span className={styles.nodeName}>NestJS API</span>
                <span className={styles.nodeSub}>port 4000</span>
                <span className={styles.nodeSub}>Scheduler · Auth</span>
                <span className={styles.nodeSub}>Socket.io · FCM</span>
              </div>

              {/* Redis */}
              <div className={styles.node} style={{ minWidth: '130px' }}>
                <span className={`${styles.nodeBadge} ${styles.badgeCache}`}>
                  CACHE
                </span>
                <div className={styles.nodeIcon}>
                  <svg width="42" height="42" viewBox="0 0 42 42">
                    <rect width="42" height="42" rx="10" fill="#dc382d" />
                    <ellipse
                      cx="21"
                      cy="14"
                      rx="11"
                      ry="4"
                      fill="rgba(255,255,255,0.25)"
                    />
                    <rect
                      x="10"
                      y="14"
                      width="22"
                      height="10"
                      fill="rgba(255,255,255,0.1)"
                    />
                    <ellipse
                      cx="21"
                      cy="24"
                      rx="11"
                      ry="4"
                      fill="rgba(255,255,255,0.2)"
                    />
                    <rect
                      x="10"
                      y="24"
                      width="22"
                      height="6"
                      fill="rgba(255,255,255,0.08)"
                    />
                    <ellipse
                      cx="21"
                      cy="30"
                      rx="11"
                      ry="4"
                      fill="rgba(255,255,255,0.15)"
                    />
                  </svg>
                </div>
                <span className={styles.nodeName}>Redis</span>
                <span className={styles.nodeSub}>port 6379</span>
                <span className={styles.nodeSub}>Cache · Chat · Dedup</span>
              </div>

              {/* Admin container */}
              <div className={styles.node} style={{ minWidth: '130px' }}>
                <div className={styles.nodeIcon}>
                  <svg width="42" height="42" viewBox="0 0 42 42">
                    <rect width="42" height="42" rx="10" fill="#1a1a2e" />
                    <rect
                      x="8"
                      y="12"
                      width="26"
                      height="18"
                      rx="3"
                      fill="none"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="1.5"
                    />
                    <line
                      x1="8"
                      y1="18"
                      x2="34"
                      y2="18"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="1"
                    />
                    <rect
                      x="11"
                      y="21"
                      width="8"
                      height="2"
                      rx="1"
                      fill="rgba(255,255,255,0.4)"
                    />
                    <rect
                      x="11"
                      y="25"
                      width="14"
                      height="2"
                      rx="1"
                      fill="rgba(255,255,255,0.25)"
                    />
                  </svg>
                </div>
                <span className={styles.nodeName}>Admin Panel</span>
                <span className={styles.nodeSub}>Next.js :3005</span>
                <span className={styles.nodeSub}>Dashboard</span>
              </div>
            </div>
          </div>
        </div>

        {/* connector */}
        <div className={styles.connector}>
          <div
            className={styles.connectorLine}
            style={{ minHeight: '16px' }}
          ></div>
          <div className={styles.connectorLabel}>
            MongoDB driver · Mongoose ODM
          </div>
          <div
            className={styles.connectorLine}
            style={{ minHeight: '10px' }}
          ></div>
          <div className={styles.arrowDown}></div>
        </div>

        {/* ── Layer 4: MongoDB Atlas ── */}
        <div className={styles.layer}>
          <p className={styles.layerLabel}>Database · Cloud</p>
          <div className={styles.node} style={{ minWidth: '200px' }}>
            <span className={`${styles.nodeBadge} ${styles.badgeExt}`}>
              ATLAS
            </span>
            <div className={styles.nodeIcon}>
              <svg width="42" height="42" viewBox="0 0 42 42">
                <rect width="42" height="42" rx="10" fill="#13aa52" />
                <path
                  d="M21 8 C21 8 14 14 14 21 C14 28 17 32 21 34 C25 32 28 28 28 21 C28 14 21 8 21 8Z"
                  fill="rgba(255,255,255,0.9)"
                />
                <path
                  d="M21 12 C21 12 17 17 17 22 C17 27 19 30 21 32 C23 30 25 27 25 22 C25 17 21 12 21 12Z"
                  fill="#13aa52"
                />
              </svg>
            </div>
            <span className={styles.nodeName}>MongoDB Atlas</span>
            <span className={styles.nodeSub}>Managed cloud · M0 free</span>
            <span className={styles.nodeSub}>
              Matches · Users · Predictions
            </span>
          </div>
        </div>

        {/* connector */}
        <div className={styles.connector}>
          <div
            className={styles.connectorLine}
            style={{ minHeight: '16px' }}
          ></div>
          <div className={styles.connectorLabel}>
            External API calls · HTTPS
          </div>
          <div
            className={styles.connectorLine}
            style={{ minHeight: '10px' }}
          ></div>
          <div className={styles.arrowDown}></div>
        </div>

        {/* ── Layer 5: External Services ── */}
        <div className={styles.layer}>
          <p className={styles.layerLabel}>External services</p>
          <div className={styles.extBox}>
            <span className={styles.extLabel}>3rd party services</span>
            <div
              style={{
                display: 'flex',
                gap: '14px',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              {/* api-football */}
              <div className={styles.node}>
                <span className={`${styles.nodeBadge} ${styles.badgeExt}`}>
                  20s CRON
                </span>
                <div
                  className={styles.nodeIcon}
                  style={{
                    background: '#1a1a2e',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <svg width="38" height="38" viewBox="0 0 38 38">
                    <rect width="38" height="38" rx="8" fill="#1e293b" />
                    <circle
                      cx="19"
                      cy="19"
                      r="10"
                      fill="none"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M19 9 L22 17 L30 17 L24 22 L26 30 L19 25 L12 30 L14 22 L8 17 L16 17Z"
                      fill="rgba(255,255,255,0.5)"
                      stroke="none"
                    />
                  </svg>
                </div>
                <span className={styles.nodeName}>api-football</span>
                <span className={styles.nodeSub}>RapidAPI</span>
                <span className={styles.nodeSub}>Live · Fixtures</span>
              </div>

              {/* Firebase */}
              <div className={styles.node}>
                <span className={`${styles.nodeBadge} ${styles.badgeExt}`}>
                  EXT
                </span>
                <div className={styles.nodeIcon}>
                  <svg width="42" height="42" viewBox="0 0 42 42">
                    <rect width="42" height="42" rx="10" fill="#1c1c1c" />
                    <path d="M21 8 L16 20 L21 17 L26 20Z" fill="#ffa000" />
                    <path
                      d="M16 20 L13 34 L21 29 L29 34 L26 20 L21 17Z"
                      fill="#f57c00"
                    />
                    <path d="M21 17 L21 29 L29 34 L26 20Z" fill="#ffca28" />
                  </svg>
                </div>
                <span className={styles.nodeName}>Firebase</span>
                <span className={styles.nodeSub}>FCM Push</span>
                <span className={styles.nodeSub}>Google OAuth</span>
              </div>

              {/* OpenAI */}
              <div className={styles.node}>
                <div
                  className={styles.nodeIcon}
                  style={{ background: '#10a37f', borderRadius: '10px' }}
                >
                  <svg width="38" height="38" viewBox="0 0 38 38">
                    <rect width="38" height="38" rx="8" fill="#10a37f" />
                    <path
                      d="M19 9 C15 9 12 12 12 16 C10 17 9 19 9 21 C9 25 12 28 16 28 L16 30 L22 30 L22 28 C26 28 29 25 29 21 C29 19 28 17 26 16 C26 12 23 9 19 9Z"
                      fill="rgba(255,255,255,0.2)"
                    />
                    <text
                      x="19"
                      y="23"
                      textAnchor="middle"
                      fontFamily="monospace"
                      fontSize="11"
                      fontWeight="700"
                      fill="#fff"
                    >
                      GPT
                    </text>
                  </svg>
                </div>
                <span className={styles.nodeName}>OpenAI</span>
                <span className={styles.nodeSub}>GPT-4o mini</span>
                <span className={styles.nodeSub}>AI Predictions</span>
              </div>

              {/* Telegram */}
              <div className={styles.node}>
                <div className={styles.nodeIcon}>
                  <svg width="42" height="42" viewBox="0 0 42 42">
                    <rect width="42" height="42" rx="10" fill="#229ED9" />
                    <path
                      d="M8 19 L34 10 L28 32 L20 25 L15 29 L16 22Z"
                      fill="white"
                      opacity="0.9"
                    />
                    <path d="M20 25 L28 32 L30 22Z" fill="rgba(0,0,0,0.15)" />
                  </svg>
                </div>
                <span className={styles.nodeName}>Telegram</span>
                <span className={styles.nodeSub}>Bot API</span>
                <span className={styles.nodeSub}>Deeplink Auth</span>
              </div>

              {/* GitHub Actions */}
              <div className={styles.node}>
                <div
                  className={styles.nodeIcon}
                  style={{ background: '#24292e', borderRadius: '10px' }}
                >
                  <svg width="38" height="38" viewBox="0 0 38 38">
                    <rect width="38" height="38" rx="8" fill="#24292e" />
                    <path
                      d="M19 7 C12.4 7 7 12.4 7 19 C7 24.2 10.4 28.6 15.1 30.1 C15.7 30.2 15.9 29.8 15.9 29.5 L15.9 27.4 C12.6 28.1 11.9 25.9 11.9 25.9 C11.4 24.6 10.6 24.2 10.6 24.2 C9.5 23.5 10.7 23.5 10.7 23.5 C11.9 23.6 12.5 24.7 12.5 24.7 C13.6 26.5 15.3 26 15.9 25.7 C16 25 16.3 24.4 16.7 24.1 C14 23.8 11.1 22.7 11.1 18.1 C11.1 16.8 11.6 15.8 12.5 15 C12.4 14.7 12 13.5 12.6 12 C12.6 12 13.6 11.7 15.9 13.1 C16.9 12.8 17.9 12.7 19 12.7 C20.1 12.7 21.1 12.8 22.1 13.1 C24.4 11.7 25.4 12 25.4 12 C26 13.5 25.6 14.7 25.5 15 C26.4 15.8 26.9 16.8 26.9 18.1 C26.9 22.7 24 23.8 21.3 24.1 C21.8 24.5 22.2 25.3 22.2 26.5 L22.2 29.5 C22.2 29.8 22.4 30.2 23 30.1 C27.7 28.6 31.1 24.2 31.1 19 C31 12.4 25.6 7 19 7Z"
                      fill="white"
                    />
                  </svg>
                </div>
                <span className={styles.nodeName}>GitHub Actions</span>
                <span className={styles.nodeSub}>CI/CD Pipeline</span>
                <span className={styles.nodeSub}>Auto deploy</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Data flow legend ── */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={`${styles.legendLine} ${styles.colored}`}></div>
          HTTPS / REST
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendLine}></div>
          Internal HTTP
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendLine} ${styles.dashed}`}></div>
          WebSocket (Socket.io)
        </div>
        <div className={styles.legendItem} style={{ marginLeft: 'auto' }}>
          <span style={{ fontSize: '9px', color: '#3ecf8e' }}>● LIVE</span>
          &nbsp;
          <span style={{ fontSize: '9px', color: '#4f8ef7' }}>● EXT</span>
          &nbsp;
          <span style={{ fontSize: '9px', color: '#f59e0b' }}>● CACHE</span>
        </div>
      </div>

      <div className={styles.footerNote}>
        football-uz &nbsp;·&nbsp; kai-dev &nbsp;·&nbsp; Generated 2026
      </div>
    </div>
  );
});

SystemArchitecture.displayName = 'SystemArchitecture';

export default SystemArchitecture;
