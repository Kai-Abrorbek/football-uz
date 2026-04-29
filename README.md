<div align="center">

<img src="https://footballuz.online/images/app-logo.png" alt="Football UZ Logo" width="120"/>

# ⚽ Football UZ

**AI-powered real-time football platform for Uzbekistan fans**

🌐 **Live Service** → [footballuz.online](https://footballuz.online)

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![React Native](https://img.shields.io/badge/React_Native-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)

</div>

---

## 📌 프로젝트 소개

Football UZ는 우즈베키스탄 축구 팬을 위한 **AI 기반 실시간 축구 정보 플랫폼**입니다.  
전 세계 리그 라이브 스코어, AI 경기 예측, 실시간 뉴스, 선수 통계를 한 곳에서 제공합니다.  
**2026 FIFA 월드컵**을 앞두고 실제 서비스 운영 중입니다.

> "Track every match. Never miss a goal."

---

## 🛠 Tech Stack

| Category         | Technologies                                  |
| ---------------- | --------------------------------------------- |
| **Backend**      | NestJS · TypeScript · REST API · GraphQL      |
| **Database**     | MongoDB · Mongoose · Redis                    |
| **Realtime**     | Socket.io · FCM (Firebase Cloud Messaging)    |
| **Mobile**       | React Native (Expo)                           |
| **AI**           | OpenAI GPT-4o mini                            |
| **Auth**         | JWT · Telegram OAuth · Google OAuth           |
| **Infra**        | Docker Compose · GitHub Actions · Nginx · VPS |
| **External API** | API-Football · News API                       |

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client Layer                         │
│          React Native App  │  Next.js Homepage           │
└──────────────┬─────────────────────────┬────────────────┘
               │ REST API / Socket.io    │
┌──────────────▼─────────────────────────▼────────────────┐
│                   NestJS API Server                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │  Match   │ │   FCM    │ │   Auth   │ │ ChatGPT   │  │
│  │  Module  │ │  Module  │ │  Module  │ │  Module   │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────┘  │
│           NestJS Scheduler (Cron Jobs)                   │
└──────────────┬───────────────────────┬──────────────────┘
               │                       │
┌──────────────▼──────┐  ┌─────────────▼──────────────────┐
│      MongoDB        │  │            Redis                │
│  Match · User       │  │  Live Score Cache · Sessions   │
│  Notification       │  │  TTL-based Auto Expiry         │
└─────────────────────┘  └────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    Infrastructure                        │
│   GitHub Actions CI/CD → Docker Compose → Nginx → VPS  │
└─────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features

### ⚡ 실시간 라이브 스코어

- API-Football 연동, 60초 간격 Cron Job으로 라이브 데이터 수집
- Redis TTL 캐싱으로 DB 부하 없이 빠른 응답
- Socket.io로 실시간 스코어 업데이트 푸시

### 🤖 AI 경기 예측

- GPT-4o mini 연동, 팀 최근 5경기 통계 기반 승부 예측
- Streaming 응답으로 사용자 대기 시간 최소화
- gpt-4o 대비 15배 저렴한 비용으로 운영

### 🔔 FCM 푸시 알림

- 경기 시작·골·종료 이벤트별 알림 발송
- Data-Only Message 방식으로 중복 알림 완전 제거
- Notifee 기반 커스텀 알림 UI

### 🔐 소셜 로그인

- Google OAuth · Telegram Bot Deeplink 로그인
- Telegram: Redis Polling 방식으로 표준 OAuth 미지원 문제 해결
- JWT Access(15분) + Refresh(7일) 이중 토큰 전략

### 📰 실시간 뉴스

- 외부 뉴스 API 폴링으로 축구 관련 최신 뉴스 제공
- 리그별 · 팀별 필터링

---

## 🔥 Troubleshooting

### 1. FCM 알림 중복 수신 및 딥링크 라우팅 실패

**문제**

- 백그라운드·종료 상태에서 동일 알림 2개 수신
- 알림 클릭 시 앱 미실행 또는 라우팅 무시

**원인**

- FCM `notification` + `data` 객체 동시 전송 → OS 자동 알림 + Notifee 알림 중복 발생
- 잘못된 `clickAction` 값으로 AndroidManifest Intent 매칭 실패
- Expo Router 마운트 전 `router.push` 실행으로 이벤트 무시

**해결**

- FCM **Data-Only Message**로 전환 (notification 객체 제거)
- `pressAction: { id: 'default', launchActivity: 'default' }` 설정
- `AsyncStorage` + `setTimeout(300ms)` 비동기 지연 라우팅

**결과** → 중복 알림 0건, 모든 앱 상태에서 정확한 딥링크 동작

---

### 2. Docker 프로덕션 서버 CPU 폭발

**문제**

- VPS 서버 간헐적 강제 종료
- `lunotel-next` 컨테이너 CPU 24% 지속 점유

**원인**

- `docker-compose.yml` command에 빌드 로직 포함
- `restart: always` + 앱 에러 → 무한 재시작 루프
- 디스크 I/O wait 47.6% 치솟음

**해결**

- Dockerfile 기반으로 전환, 빌드를 `docker build` 타임으로 분리
- `restart: always` → `restart: on-failure:3` 변경

| 항목       | 개선 전     | 개선 후       |
| ---------- | ----------- | ------------- |
| CPU 사용률 | 24.31%      | **0.03%**     |
| 메모리     | 1.08GB      | **65MB**      |
| 강제 종료  | 간헐적 발생 | **완전 해결** |

---

## 🚀 Getting Started

### Prerequisites

```bash
Node.js >= 18
Docker & Docker Compose
MongoDB Atlas URI
Redis
Firebase Admin SDK
```

### Installation

```bash
# Clone repository
git clone https://github.com/Kai-Abrorbek/football-uz.git
cd football-uz

# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Fill in your environment variables

# Run with Docker Compose
docker-compose up -d
```

### Environment Variables

```env
MONGODB_URI=your_mongodb_uri
REDIS_HOST=your_redis_host
JWT_SECRET=your_jwt_secret
FCM_SERVER_KEY=your_fcm_key
OPENAI_API_KEY=your_openai_key
API_FOOTBALL_KEY=your_api_football_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

---

## 📁 Project Structure

```
football-uz/
├── apps/
│   ├── api/              # NestJS Backend
│   │   ├── src/
│   │   │   ├── modules/  # Feature modules
│   │   │   ├── common/   # Guards, Interceptors, Pipes
│   │   │   └── config/   # Configuration
│   ├── mobile/           # React Native (Expo)
│   ├── web/              # Next.js Homepage
│   └── admin/            # Next.js Admin Panel
├── docker-compose.yml
└── turbo.json            # Turborepo config
```

---

## 👨‍💻 Developer

|               |                                                  |
| ------------- | ------------------------------------------------ |
| **Name**      | Kai                                              |
| **Email**     | abror0dev@gmail.com                              |
| **GitHub**    | [@Kai-Abrorbek](https://github.com/Kai-Abrorbek) |
| **Portfolio** | [footballuz.online](https://footballuz.online)   |

---

<div align="center">

⭐ If you find this project useful, please give it a star!

</div>
