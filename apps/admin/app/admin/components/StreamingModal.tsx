'use client';

import { useState } from 'react';
import { Radio, X, Copy, Check } from 'lucide-react';
import { api } from '@/app/lib/api';

export default function StreamingModal({ match, onClose, onSuccess }: any) {
  const [streamKey, setStreamKey] = useState(match.streamKey || '');
  const [isStreaming, setIsStreaming] = useState(match.isStreaming || false);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.post(`/matches/${match._id}/streaming`, {
        isStreaming,
        streamKey,
      });
      onSuccess();
    } catch {
      alert('저장 실패');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111827]/90 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2">
            <Radio className="text-red-400 animate-pulse" size={18} />
            <h2 className="text-sm font-bold text-white tracking-wide">
              스트리밍 설정
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* 매치 정보 */}
          <div className="text-center p-3 bg-white/5 rounded-xl border border-white/5">
            <p className="text-sm font-semibold text-white">
              {match.homeTeam.name}{' '}
              <span className="text-slate-500 mx-2">vs</span>{' '}
              {match.awayTeam.name}
            </p>
          </div>

          {/* 스트림 키 입력 */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 block">
              스트림 키 (Stream Key)
            </label>
            <input
              type="text"
              value={streamKey}
              onChange={(e) => setStreamKey(e.target.value)}
              placeholder="예: match_001"
              className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-slate-600"
            />
          </div>

          {/* 스트리밍 토글 */}
          <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-medium text-white">스트리밍 활성화</p>
              <p className="text-xs text-slate-500 mt-0.5">
                앱에서 라이브 탭이 켜집니다
              </p>
            </div>
            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                isStreaming ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                  isStreaming ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* 스트리밍 URL 정보 (복사 기능 포함) */}
          {streamKey && (
            <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-3">
              {[
                { label: 'RTMP 서버', value: 'rtmp://localhost/live' },
                { label: '스트림 키', value: streamKey },
                {
                  label: 'HLS URL',
                  value: `http://localhost:8080/hls/${streamKey}.m3u8`,
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="group flex items-center justify-between gap-4"
                >
                  <div className="overflow-hidden">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      {label}
                    </p>
                    <p className="text-xs text-emerald-400 font-mono truncate">
                      {value}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(value, label)}
                    className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-md transition-colors shrink-0"
                    title="복사하기"
                  >
                    {copiedField === label ? (
                      <Check size={14} className="text-emerald-400" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="flex gap-3 px-6 py-4 border-t border-white/10 bg-black/20">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 flex justify-center items-center"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              '저장하기'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
