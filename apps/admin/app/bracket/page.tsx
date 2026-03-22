'use client';

import { useState, useEffect, useRef } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import { adminApi, api } from '../lib/api';

const LEAGUES = [
  { id: 2, name: 'UCL', fullName: 'UEFA Champions League', season: 2025 },
  { id: 3, name: 'UEL', fullName: 'UEFA Europa League', season: 2025 },
];

const ROUNDS = [
  {
    key: 'Round of 32',
    label: '플레이오프',
    next: 'Round of 16',
    expectedPairs: 12,
  },
  {
    key: 'Round of 16',
    label: '16강',
    next: 'Quarter-finals',
    expectedPairs: 8,
  },
  {
    key: 'Quarter-finals',
    label: '8강',
    next: 'Semi-finals',
    expectedPairs: 4,
  },
  { key: 'Semi-finals', label: '준결승', next: 'Final', expectedPairs: 2 },
  { key: 'Final', label: '결승', next: null, expectedPairs: 1 },
];

interface Team {
  teamId: number;
  teamName: string;
  teamLogo: string;
}

interface MatchPair {
  pairId: string;
  homeTeam: Team;
  awayTeam: Team;
  aggHome: number;
  aggAway: number;
  finished: boolean;
  hasScore: boolean;
  winner: 'home' | 'away' | null;
}

interface Slot {
  slotIndex: number;
  teams: Team[];
}

function DraggableTeam({
  team,
  pairId,
  side,
  score,
  won,
  lost,
  hasScore,
}: {
  team: Team;
  pairId: string;
  side: 'home' | 'away';
  score?: number;
  won?: boolean;
  lost?: boolean;
  hasScore?: boolean;
}) {
  const id = `${pairId}-${side}`;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        background: 'var(--sidebar)',
        borderRadius: 8,
        cursor: 'grab',
        border: '1px solid var(--border)',
        userSelect: 'none',
      }}
    >
      {/* ⭐️ TBD 팀일 경우 로고 대신 회색 원 표시 */}
      {team.teamLogo ? (
        <img
          src={team.teamLogo}
          width={20}
          height={20}
          style={{ objectFit: 'contain', flexShrink: 0 }}
        />
      ) : (
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: 'var(--border)',
            flexShrink: 0,
          }}
        />
      )}

      <span
        style={{
          flex: 1,
          fontSize: 13,
          color: won ? '#22c55e' : lost ? '#ef4444' : 'var(--text)',
          fontWeight: won ? 700 : 400,
          textDecoration: lost ? 'line-through' : 'none',
          opacity: lost ? 0.7 : 1,
        }}
      >
        {team.teamName}
      </span>
      {hasScore && score !== undefined && (
        <span
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: won ? '#22c55e' : lost ? '#ef4444' : 'var(--muted2)',
            minWidth: 24,
            textAlign: 'right',
          }}
        >
          {score}
        </span>
      )}
    </div>
  );
}

function DroppableSlot({
  slotIndex,
  teams,
  onRemove,
}: {
  slotIndex: number;
  teams: Team[];
  onRemove: (slotIndex: number, teamId: number) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `slot-${slotIndex}` });

  return (
    <div
      ref={setNodeRef}
      style={{
        background: isOver ? 'rgba(0,229,255,0.08)' : 'var(--card)',
        border: `1px solid ${isOver ? 'var(--cyan)' : 'var(--border)'}`,
        borderRadius: 10,
        padding: 12,
        minHeight: 100,
        transition: 'all 0.15s',
      }}
    >
      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>
        슬롯 {slotIndex + 1}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[0, 1].map((i) => {
          const team = teams[i];
          return team ? (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 10px',
                background: 'var(--sidebar)',
                borderRadius: 6,
                border: '1px solid var(--border)',
              }}
            >
              {team.teamLogo ? (
                <img
                  src={team.teamLogo}
                  width={18}
                  height={18}
                  style={{ objectFit: 'contain' }}
                />
              ) : (
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    backgroundColor: 'var(--border)',
                  }}
                />
              )}
              <span style={{ flex: 1, fontSize: 12, color: 'var(--text)' }}>
                {team.teamName}
              </span>
              <button
                onClick={() => onRemove(slotIndex, team.teamId)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--muted)',
                  cursor: 'pointer',
                  fontSize: 14,
                  padding: '0 4px',
                  fontFamily: 'inherit',
                }}
              >
                ×
              </button>
            </div>
          ) : (
            <div
              key={i}
              style={{
                height: 34,
                border: '1px dashed var(--border)',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                color: 'var(--muted)',
              }}
            >
              팀 드롭
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function BracketPage() {
  const [selectedLeague, setSelectedLeague] = useState(LEAGUES[0]);
  const [selectedRoundIdx, setSelectedRoundIdx] = useState(0);
  const [pairs, setPairs] = useState<MatchPair[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const selectedRound = ROUNDS[selectedRoundIdx];
  const nextRound = ROUNDS.find((r) => r.key === selectedRound.next);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    fetchData();
  }, [selectedLeague, selectedRoundIdx]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const matchRes = await api.get(
        `/matches?leagueId=${selectedLeague.id}&season=${selectedLeague.season}&limit=999&allDates=true`,
      );
      const allMatches: any[] = matchRes.data ?? [];

      const roundMatches = allMatches.filter(
        (m) => m.round === selectedRound.key,
      );

      const pairMap = new Map<string, any[]>();
      roundMatches.forEach((m) => {
        const key = [m.homeTeam.id, m.awayTeam.id].sort().join('-');
        if (!pairMap.has(key)) {
          pairMap.set(key, [m]);
        } else {
          pairMap.get(key)!.push(m);
        }
      });

      let pairList: MatchPair[] = Array.from(pairMap.values()).map(
        (matches) => {
          const sorted = matches.sort(
            (a: any, b: any) =>
              new Date(a.date).getTime() - new Date(b.date).getTime(),
          );

          const first = sorted[0];
          const teamA_Id = first.homeTeam.id;
          const teamB_Id = first.awayTeam.id;

          let teamA_Total = 0;
          let teamB_Total = 0;

          sorted.forEach((m: any) => {
            if (m.homeTeam.id === teamA_Id) {
              teamA_Total += m.goals.home ?? 0;
              teamB_Total += m.goals.away ?? 0;
            } else if (m.homeTeam.id === teamB_Id) {
              teamA_Total += m.goals.away ?? 0;
              teamB_Total += m.goals.home ?? 0;
            }
          });

          let winner: 'home' | 'away' | null = null;

          if (teamA_Total > teamB_Total) {
            winner = 'home';
          } else if (teamB_Total > teamA_Total) {
            winner = 'away';
          } else {
            const lastMatch = sorted[sorted.length - 1];
            if (
              lastMatch.score?.penalty?.home != null &&
              lastMatch.score?.penalty?.away != null
            ) {
              let penA = 0;
              let penB = 0;

              if (lastMatch.homeTeam.id === teamA_Id) {
                penA = lastMatch.score.penalty.home;
                penB = lastMatch.score.penalty.away;
              } else {
                penA = lastMatch.score.penalty.away;
                penB = lastMatch.score.penalty.home;
              }

              if (penA > penB) winner = 'home';
              if (penB > penA) winner = 'away';
            }
          }

          const finished = sorted.every((m: any) =>
            ['FT', 'AET', 'PEN'].includes(m.status.short),
          );
          const hasScore = sorted.some((m: any) =>
            ['FT', 'AET', 'PEN', '1H', 'HT', '2H', 'ET'].includes(
              m.status.short,
            ),
          );

          return {
            pairId: `${first.homeTeam.id}-${first.awayTeam.id}`,
            homeTeam: {
              teamId: first.homeTeam.id,
              teamName: first.homeTeam.name,
              teamLogo: first.homeTeam.logo,
            },
            awayTeam: {
              teamId: first.awayTeam.id,
              teamName: first.awayTeam.name,
              teamLogo: first.awayTeam.logo,
            },
            aggHome: teamA_Total,
            aggAway: teamB_Total,
            finished,
            hasScore,
            winner,
          };
        },
      );

      // ⭐️ 핵심 추가 로직: 실제 경기 데이터가 없을 경우 저장된 "슬롯(대진)" 정보를 렌더링
      const currentSlotRes = await adminApi.getBracketSlots(
        selectedLeague.id,
        selectedLeague.season,
        selectedRound.key,
      );
      const currentSlots: Slot[] = currentSlotRes.data?.slots ?? [];

      if (pairList.length === 0 && currentSlots.length > 0) {
        pairList = currentSlots
          .filter((slot) => slot.teams && slot.teams.length > 0) // 한 팀이라도 배정된 슬롯만
          .map((slot) => {
            const home = slot.teams[0];
            const away = slot.teams[1];

            return {
              pairId: `slot-${slot.slotIndex}`,
              homeTeam: home ?? { teamId: -1, teamName: 'TBD', teamLogo: '' },
              awayTeam: away ?? { teamId: -2, teamName: 'TBD', teamLogo: '' },
              aggHome: 0,
              aggAway: 0,
              finished: false,
              hasScore: false,
              winner: null,
            };
          });
      }

      setPairs(pairList);

      // 다음 라운드 슬롯 불러오기
      if (nextRound) {
        const slotRes = await adminApi.getBracketSlots(
          selectedLeague.id,
          selectedLeague.season,
          nextRound.key,
        );
        const savedSlots: Slot[] = slotRes.data?.slots ?? [];
        const filledSlots: Slot[] = Array.from({
          length: nextRound.expectedPairs,
        }).map((_, i) => {
          return (
            savedSlots.find((s) => s.slotIndex === i) ?? {
              slotIndex: i,
              teams: [],
            }
          );
        });
        setSlots(filledSlots);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getActiveTeam = () => {
    if (!activeId) return null;
    for (const pair of pairs) {
      if (`${pair.pairId}-home` === activeId) return pair.homeTeam;
      if (`${pair.pairId}-away` === activeId) return pair.awayTeam;
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const overId = over.id as string;
    if (!overId.startsWith('slot-')) return;

    const slotIndex = parseInt(overId.replace('slot-', ''));
    const activeTeam = getActiveTeam();
    if (!activeTeam) return;

    setSlots((prev) => {
      const updated = [...prev];
      const slot = { ...updated[slotIndex] };
      if (slot.teams.some((t) => t.teamId === activeTeam.teamId)) return prev;
      if (slot.teams.length >= 2) return prev;
      slot.teams = [...slot.teams, activeTeam];
      updated[slotIndex] = slot;
      return updated;
    });
  };

  const handleRemoveTeam = (slotIndex: number, teamId: number) => {
    setSlots((prev) => {
      const updated = [...prev];
      updated[slotIndex] = {
        ...updated[slotIndex],
        teams: updated[slotIndex].teams.filter((t) => t.teamId !== teamId),
      };
      return updated;
    });
  };

  const handleSave = async () => {
    if (!nextRound) return;
    setSaving(true);
    try {
      await adminApi.updateBracketSlots({
        leagueId: selectedLeague.id,
        season: selectedLeague.season,
        round: nextRound.key,
        slots,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        <h1
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: 'var(--text)',
            marginBottom: 12,
          }}
        >
          브라켓 대진 설정
        </h1>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {LEAGUES.map((league) => (
            <button
              key={league.id}
              onClick={() => setSelectedLeague(league)}
              style={{
                padding: '6px 16px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background:
                  selectedLeague.id === league.id
                    ? 'var(--cyan)'
                    : 'var(--card)',
                color:
                  selectedLeague.id === league.id ? '#000' : 'var(--muted2)',
                fontWeight: selectedLeague.id === league.id ? 700 : 400,
                cursor: 'pointer',
                fontSize: 12,
                fontFamily: 'inherit',
              }}
            >
              {league.name}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {ROUNDS.map((round, idx) => (
            <button
              key={round.key}
              onClick={() => setSelectedRoundIdx(idx)}
              style={{
                padding: '5px 14px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background:
                  selectedRoundIdx === idx
                    ? 'rgba(0,229,255,0.15)'
                    : 'var(--card)',
                color:
                  selectedRoundIdx === idx ? 'var(--cyan)' : 'var(--muted2)',
                fontWeight: selectedRoundIdx === idx ? 700 : 400,
                cursor: 'pointer',
                fontSize: 12,
                fontFamily: 'inherit',
              }}
            >
              {round.label}
            </button>
          ))}
        </div>
      </div>

      {/* 메인 */}
      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        {loading ? (
          <div
            style={{
              textAlign: 'center',
              color: 'var(--muted2)',
              fontSize: 13,
              paddingTop: 60,
            }}
          >
            로딩중...
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div
              style={{
                display: 'flex',
                gap: 32,
                minWidth: 'max-content',
                alignItems: 'flex-start',
              }}
            >
              {/* 왼쪽: 현재 라운드 */}
              <div style={{ width: 360 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'var(--cyan)',
                    marginBottom: 12,
                  }}
                >
                  {selectedRound.label} ({pairs.length}쌍)
                </div>
                <SortableContext
                  items={pairs.flatMap((p) => [
                    `${p.pairId}-home`,
                    `${p.pairId}-away`,
                  ])}
                  strategy={verticalListSortingStrategy}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                    }}
                  >
                    {pairs.map((pair, idx) => {
                      return (
                        <div
                          key={pair.pairId}
                          style={{
                            background: 'var(--card)',
                            border: '1px solid var(--border)',
                            borderRadius: 10,
                            padding: 12,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 11,
                              color: 'var(--muted)',
                              marginBottom: 8,
                            }}
                          >
                            #{idx + 1}
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 6,
                            }}
                          >
                            <DraggableTeam
                              team={pair.homeTeam}
                              pairId={pair.pairId}
                              side="home"
                              score={pair.aggHome}
                              won={pair.winner === 'home'}
                              lost={pair.hasScore && pair.winner === 'away'}
                              hasScore={pair.hasScore}
                            />
                            <DraggableTeam
                              team={pair.awayTeam}
                              pairId={pair.pairId}
                              side="away"
                              score={pair.aggAway}
                              won={pair.winner === 'away'}
                              lost={pair.hasScore && pair.winner === 'home'}
                              hasScore={pair.hasScore}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </SortableContext>
              </div>

              {/* 오른쪽: 다음 라운드 슬롯 */}
              {nextRound ? (
                <div style={{ width: 280 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 12,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: 'var(--text)',
                      }}
                    >
                      {nextRound.label} 대진 배정
                    </div>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      style={{
                        padding: '5px 14px',
                        borderRadius: 8,
                        border: 'none',
                        background: saved ? '#22c55e' : 'var(--cyan)',
                        color: '#000',
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: saving ? 'not-allowed' : 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      {saving ? '저장중...' : saved ? '✓ 저장됨' : '저장'}
                    </button>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                    }}
                  >
                    {slots.map((slot) => (
                      <DroppableSlot
                        key={slot.slotIndex}
                        slotIndex={slot.slotIndex}
                        teams={slot.teams}
                        onRemove={handleRemoveTeam}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 280,
                    color: 'var(--muted2)',
                    fontSize: 13,
                  }}
                >
                  마지막 라운드입니다
                </div>
              )}
            </div>

            <DragOverlay>
              {activeId && getActiveTeam() && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 12px',
                    background: 'var(--cyan)',
                    borderRadius: 8,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  }}
                >
                  <img
                    src={getActiveTeam()!.teamLogo}
                    width={20}
                    height={20}
                    style={{ objectFit: 'contain' }}
                  />
                  <span
                    style={{ fontSize: 13, color: '#000', fontWeight: 600 }}
                  >
                    {getActiveTeam()!.teamName}
                  </span>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </div>
  );
}
