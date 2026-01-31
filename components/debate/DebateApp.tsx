/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect, useRef, useState } from 'react';
import { Modality } from '@google/genai';
import { useLiveApi } from '@/hooks/media/use-live-api';
import { Agent, Charlotte, Paul } from '@/lib/presets/agents';
import BasicFace from '../demo/basic-face/BasicFace';
import cn from 'classnames';
import { renderBasicFace } from '../demo/basic-face/basic-face-render';
import useFace from '@/hooks/demo/use-face';
import useHover from '@/hooks/demo/use-hover';
import useTilt from '@/hooks/demo/use-tilt';

const API_KEY = process.env.API_KEY as string;

// Separate component for a single debater to manage their own Face render state
function DebaterFace({
  agent,
  volume,
  isLeft,
}: {
  agent: Agent;
  volume: number;
  isLeft: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <div className={cn('debater-container', { left: isLeft, right: !isLeft })}>
      <div className="face-wrapper">
        <BasicFace
          canvasRef={canvasRef}
          color={agent.bodyColor}
          volumeProp={volume}
        />
      </div>
      <div className="debater-info">
        <h3>{agent.name}</h3>
      </div>
    </div>
  );
}

export default function DebateApp() {
  // Agent 1: Pro-Topic (Left)
  const leftAgent = Paul;
  const leftClient = useLiveApi({ apiKey: API_KEY });

  // Agent 2: Anti-Topic (Right)
  const rightAgent = Charlotte;
  const rightClient = useLiveApi({ apiKey: API_KEY });

  const [topic, setTopic] = useState('');
  const [debating, setDebating] = useState(false);
  const [transcriptA, setTranscriptA] = useState('');
  const [transcriptB, setTranscriptB] = useState('');
  const transcriptBufferA = useRef('');
  const transcriptBufferB = useRef('');

  // Initial Configuration
  useEffect(() => {
    // Config Left
    leftClient.setConfig({
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: leftAgent.voice } },
      },
      systemInstruction: {
        parts: [
          {
            text: `You are ${leftAgent.name}. ${leftAgent.personality}. 
            You are participating in a debate. You are currently DEBATING against ${rightAgent.name}.
            Your opponent is sophisticated but wrong.
            Keep your responses short (max 2 sentences), punchy, and witty.
            Listen to your opponent's argument and rebut it directly.`,
          },
        ],
      },
      outputAudioTranscription: {},
    });

    // Config Right
    rightClient.setConfig({
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: rightAgent.voice } },
      },
      systemInstruction: {
        parts: [
          {
            text: `You are ${rightAgent.name}. ${rightAgent.personality}. 
            You are participating in a debate. You are currently DEBATING against ${leftAgent.name}.
            Your opponent is loud and wrong.
            Keep your responses short (max 2 sentences), punchy, and witty.
            Listen to your opponent's argument and rebut it directly.`,
          },
        ],
      },
      outputAudioTranscription: {},
    });
  }, [leftClient.setConfig, rightClient.setConfig]);

  // Handle Turn Taking Logic
  useEffect(() => {
    const onTranscriptionA = (text: string) => {
      transcriptBufferA.current += text;
      setTranscriptA(prev => prev + text);
    };

    const onTurnCompleteA = () => {
      const text = transcriptBufferA.current;
      transcriptBufferA.current = '';
      if (text.trim()) {
        // Send A's output as input to B
        rightClient.client.send({
          text: `Your opponent ${leftAgent.name} said: "${text}". Rebut this!`,
        });
      }
    };

    const onTranscriptionB = (text: string) => {
      transcriptBufferB.current += text;
      setTranscriptB(prev => prev + text);
    };

    const onTurnCompleteB = () => {
      const text = transcriptBufferB.current;
      transcriptBufferB.current = '';
      if (text.trim()) {
        // Send B's output as input to A
        leftClient.client.send({
          text: `Your opponent ${rightAgent.name} said: "${text}". Rebut this!`,
        });
      }
    };

    leftClient.client.on('transcription', onTranscriptionA);
    leftClient.client.on('turncomplete', onTurnCompleteA);

    rightClient.client.on('transcription', onTranscriptionB);
    rightClient.client.on('turncomplete', onTurnCompleteB);

    return () => {
      leftClient.client.off('transcription', onTranscriptionA);
      leftClient.client.off('turncomplete', onTurnCompleteA);
      rightClient.client.off('transcription', onTranscriptionB);
      rightClient.client.off('turncomplete', onTurnCompleteB);
    };
  }, [leftClient.client, rightClient.client]);

  const startDebate = async () => {
    if (!topic.trim()) return;
    setDebating(true);
    setTranscriptA('');
    setTranscriptB('');

    await leftClient.connect();
    await rightClient.connect();

    // Kick it off with Agent A
    setTimeout(() => {
        leftClient.client.send({
          text: `Start a heated debate about: "${topic}". You are in favor of it. State your opening argument now.`,
        });
    }, 1000)
  };

  const stopDebate = () => {
    leftClient.disconnect();
    rightClient.disconnect();
    setDebating(false);
  };

  return (
    <div className="debate-wrapper">
      <div className="debate-controls">
        {!debating ? (
          <div className="setup-box">
            <h1>AI Debate Arena</h1>
            <input
              type="text"
              placeholder="Enter a controversial topic (e.g., Pineapple on Pizza)"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && startDebate()}
            />
            <button
              className="start-btn"
              disabled={!topic.trim()}
              onClick={startDebate}
            >
              Start Debate
            </button>
          </div>
        ) : (
          <button className="stop-btn" onClick={stopDebate}>
            End Debate
          </button>
        )}
      </div>

      <div className="arenas">
        <div className={cn('arena-side left', { active: leftClient.volume > 0.01 })}>
            <DebateFaceRenderer
                client={leftClient}
                agent={leftAgent}
                transcript={transcriptA}
                isTalking={leftClient.volume > 0.01}
            />
        </div>
        
        <div className="vs-badge">VS</div>

        <div className={cn('arena-side right', { active: rightClient.volume > 0.01 })}>
             <DebateFaceRenderer
                client={rightClient}
                agent={rightAgent}
                transcript={transcriptB}
                isTalking={rightClient.volume > 0.01}
            />
        </div>
      </div>
    </div>
  );
}

function DebateFaceRenderer({ client, agent, transcript, isTalking }: any) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { eyeScale } = useFace(); 
    const mouthScale = Math.min(client.volume * 2, 1);
    
    const hoverPosition = useHover();
    const tiltAngle = useTilt({
        maxAngle: 5,
        speed: 0.075,
        isActive: isTalking,
    });

    useEffect(() => {
        if(canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d')!;
            canvasRef.current.width = 400;
            canvasRef.current.height = 400;
            renderBasicFace({
                ctx,
                eyeScale,
                mouthScale,
                color: agent.bodyColor
            })
        }
    }, [eyeScale, mouthScale, agent.bodyColor]);

    return (
        <div className="debater">
             <canvas
                ref={canvasRef}
                style={{
                    width: '300px',
                    height: '300px',
                    transform: `translateY(${hoverPosition}px) rotate(${tiltAngle}deg)`,
                }}
            />
            <h2>{agent.name}</h2>
            <div className="captions">
                {transcript.slice(-150)}
            </div>
        </div>
    )
}