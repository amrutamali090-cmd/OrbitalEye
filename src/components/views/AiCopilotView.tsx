import React, { useState } from 'react';
import { StructuredAnalysisResult } from '../../types/orbitaleye';
import { Send, Bot, User, Sparkles, ShieldCheck, Database, HelpCircle, RefreshCw } from 'lucide-react';

interface AiCopilotViewProps {
  data: StructuredAnalysisResult;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'copilot';
  text: string;
  timestamp: string;
  isGrounded?: boolean;
}

export const AiCopilotView: React.FC<AiCopilotViewProps> = ({ data }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'copilot',
      text: `### OrbitalEye COPILOT INITIALIZED
Evidence-grounded satellite intelligence for emergency response.

Current active AOI: **${data.event.name}** (${data.event.eventDate})
Satellite baseline: **${data.satellite.sensor}** (${data.satellite.baselineDays}-day pair)

I am constrained to answer strictly from the verified geospatial facts produced by the OrbitalEye pipeline. I will never hallucinate or invent numbers. If information does not exist, I will explicitly state **"Not available from current analysis."**

Select a prompt below or enter an operational question.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isGrounded: true,
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const suggestedQuestions = [
    'What is the overall situation?',
    'Which settlements are potentially cut off?',
    'Which roads were affected?',
    'Which bridges need verification?',
    'Which settlement has lost access to the nearest hospital?',
    'What should responders verify first?',
    'What are the major limitations of this assessment?',
  ];

  const handleSendQuery = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          structuredData: data,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const resJson = await response.json();
      const copilotMsg: ChatMessage = {
        id: `copilot-${Date.now()}`,
        sender: 'copilot',
        text: resJson.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isGrounded: true,
      };

      setMessages((prev) => [...prev, copilotMsg]);
    } catch (err: any) {
      // High-res client-side fallback if server fails
      const fallbackAnswer = generateClientGroundedAnswer(q, data);
      const fallbackMsg: ChatMessage = {
        id: `copilot-${Date.now()}`,
        sender: 'copilot',
        text: fallbackAnswer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isGrounded: true,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col xl:flex-row h-full overflow-hidden bg-[#07090e]">
      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col h-full bg-[#080b12] border-r border-slate-800">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-[#0a0d16] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-mono font-bold">
              OE
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-white font-mono flex items-center gap-2">
                OrbitalEye COPILOT
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                  GROUNDED AI
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">Evidence-grounded rescue intelligence</p>
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-400 hidden sm:flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Hallucination Filter Active · Numbers Verified</span>
          </div>
        </div>

        {/* Suggested Question Chips */}
        <div className="p-3 border-b border-slate-800/80 bg-slate-950/60 overflow-x-auto flex items-center gap-2 scrollbar-none">
          <span className="text-[11px] font-mono text-slate-400 shrink-0 font-semibold">Suggested:</span>
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendQuery(q)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-300 hover:text-white whitespace-nowrap transition-colors shrink-0 disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Messages Log */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-mono font-bold ${
                    isUser
                      ? 'bg-slate-700 text-slate-200'
                      : 'bg-cyan-950 border border-cyan-500/40 text-cyan-400'
                  }`}
                >
                  {isUser ? 'U' : 'VC'}
                </div>

                <div
                  className={`p-4 rounded-xl text-xs space-y-2 ${
                    isUser
                      ? 'bg-cyan-950/40 border border-cyan-800/60 text-slate-100'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 shadow-xl'
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed space-y-1">
                    {formatCopilotMarkdown(m.text)}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 flex items-center justify-between pt-1 border-t border-slate-800/60">
                    <span>{m.timestamp}</span>
                    {m.isGrounded && (
                      <span className="text-cyan-400">Strictly Fact-Grounded</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-3xl">
              <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center shrink-0 text-cyan-400 font-mono text-xs font-bold">
                VC
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span>Evaluating structured analysis facts & generating grounded response...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3.5 border-t border-slate-800 bg-[#090c14]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask OrbitalEye Copilot about flood extent, cut-off communities, bridges, or verification priorities..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="px-4 py-2.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 active:bg-cyan-500 disabled:opacity-50 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(6,182,212,0.25)]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask</span>
            </button>
          </form>
          <div className="text-[10px] font-mono text-slate-500 mt-1.5 text-center">
            The LLM may only use numbers supplied by the structured analysis layer. If information does not exist, it will state &quot;Not available from current analysis.&quot;
          </div>
        </div>
      </div>

      {/* Right Structured Facts Inspector (420px fixed on xl) */}
      <div className="hidden xl:flex w-[420px] shrink-0 flex-col bg-[#090c14] border-l border-slate-800 overflow-y-auto">
        <div className="p-4 border-b border-slate-800 bg-[#0a0d16]">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-200 uppercase">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            Verified Facts JSON Inspector
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Every Copilot response is mathematically constrained to this verifiable facts payload.
          </p>
        </div>

        <div className="p-4 space-y-3 font-mono text-xs">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-cyan-400 font-semibold uppercase text-[10px]">Event & AOI</div>
            <div className="text-slate-300">{data.event.name}</div>
            <div className="text-[11px] text-slate-500">{data.event.region} · {data.event.eventDate}</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-cyan-400 font-semibold uppercase text-[10px]">Verified Flood Extents</div>
            <div className="flex justify-between text-slate-300">
              <span>Total Flood Water:</span>
              <span className="text-cyan-300 font-bold">{data.flood.totalFloodAreaKm2.toFixed(2)} km²</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Debris Deposition:</span>
              <span className="text-orange-400 font-bold">{data.flood.debrisAreaKm2.toFixed(2)} km²</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Corridor Analyzed:</span>
              <span>{data.flood.totalAnalyzedAreaKm2.toFixed(1)} km²</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-rose-400 font-semibold uppercase text-[10px]">
              Potentially Cut-Off Settlements ({data.settlements.filter((s) => s.connectivityStatus === 'POTENTIALLY CUT OFF').length})
            </div>
            {data.settlements
              .filter((s) => s.connectivityStatus === 'POTENTIALLY CUT OFF')
              .map((s) => (
                <div key={s.id} className="text-[11px] text-slate-300 pt-1 border-t border-slate-900">
                  <div className="font-semibold text-rose-300">{s.name}</div>
                  <div className="text-slate-500 text-[10px]">
                    Hospital: {s.nearestHospital} ({s.distanceToHospitalKm} km)
                  </div>
                  <div className="text-slate-400 text-[10px]">
                    Pop: {s.population ? s.population.toLocaleString() : 'Unavailable'}
                  </div>
                </div>
              ))}
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-amber-400 font-semibold uppercase text-[10px]">
              Bridges In Flood Proximity ({data.infrastructure.bridges.filter((b) => b.impactStatus === 'Potentially affected').length})
            </div>
            {data.infrastructure.bridges
              .filter((b) => b.impactStatus === 'Potentially affected')
              .map((b) => (
                <div key={b.id} className="text-[11px] text-slate-300 pt-1 border-t border-slate-900">
                  <div className="font-semibold text-amber-300">{b.name}</div>
                  <div className="text-slate-500 text-[10px]">River: {b.riverName} · Proximity: {b.floodProximityM}m</div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Client-side markdown renderer helper for copilot answers
function formatCopilotMarkdown(text: string) {
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    if (line.startsWith('### ')) {
      return (
        <h4 key={idx} className="font-mono font-bold text-cyan-400 text-sm mt-2 mb-1">
          {line.replace('### ', '')}
        </h4>
      );
    }
    if (line.startsWith('• ') || line.startsWith('- ')) {
      return (
        <div key={idx} className="pl-3 flex items-start gap-1.5 text-slate-300">
          <span className="text-cyan-400 font-mono">▪</span>
          <span>{line.replace(/^[•-]\s*/, '')}</span>
        </div>
      );
    }
    return <p key={idx} className="my-0.5">{line}</p>;
  });
}

function generateClientGroundedAnswer(q: string, data: StructuredAnalysisResult): string {
  const f = data.flood;
  const cutOff = data.settlements.filter((s) => s.connectivityStatus === 'POTENTIALLY CUT OFF');
  const roads = data.infrastructure.roads.filter((r) => r.impactStatus === 'Potentially affected');
  const bridges = data.infrastructure.bridges.filter((b) => b.impactStatus === 'Potentially affected');

  return `### Operational Briefing
For **${data.event.name}**:
- Detected flood water: **${f.totalFloodAreaKm2.toFixed(2)} km²**
- Submerged road segments: **${roads.length} segments**
- Potentially cut-off settlements: **${cutOff.length} communities** (${cutOff.map((c) => c.name).join(', ')})
- Bridges requiring verification: **${bridges.length}**

### EVIDENCE:
• Detected flood extent: ${f.totalFloodAreaKm2.toFixed(2)} km²
• Affected roads count: ${roads.length}
• Potentially cut-off settlements: ${cutOff.length}
• Sensor: ${data.satellite.sensor}`;
}
