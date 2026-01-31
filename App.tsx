/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useState } from 'react';
import AgentEdit from './components/AgentEdit';
import ControlTray from './components/console/control-tray/ControlTray';
import ErrorScreen from './components/demo/ErrorSreen';
import KeynoteCompanion from './components/demo/keynote-companion/KeynoteCompanion';
import DebateApp from './components/debate/DebateApp';
import Header from './components/Header';
import UserSettings from './components/UserSettings';
import { LiveAPIProvider } from './contexts/LiveAPIContext';
import { useUI, useUser } from './lib/state';

const API_KEY = process.env.API_KEY as string;
if (typeof API_KEY !== 'string') {
  throw new Error('set REACT_APP_API_KEY or VITE_API_KEY in your environment');
}

/**
 * Main application component that provides a streaming interface for Live API.
 * Manages video streaming state and provides controls for webcam/screen capture.
 */
function App() {
  const { showUserConfig, showAgentEdit } = useUI();
  const [mode, setMode] = useState<'companion' | 'debate'>('debate');

  return (
    <div className="App">
      <div className="mode-toggle" style={{ position: 'fixed', bottom: 20, left: 20, zIndex: 9999 }}>
        <button 
            className={`action-button ${mode === 'companion' ? 'connected' : ''}`} 
            onClick={() => setMode('companion')}
            title="Companion Mode"
        >
            <span className="material-symbols-outlined">person</span>
        </button>
        <div style={{height: 10}} />
        <button 
            className={`action-button ${mode === 'debate' ? 'connected' : ''}`}
            onClick={() => setMode('debate')}
            title="Debate Mode"
        >
             <span className="material-symbols-outlined">forum</span>
        </button>
      </div>

      {mode === 'debate' ? (
        <DebateApp />
      ) : (
        <LiveAPIProvider apiKey={API_KEY}>
          <ErrorScreen />
          <Header />

          {showUserConfig && <UserSettings />}
          {showAgentEdit && <AgentEdit />}
          <div className="streaming-console">
            <main>
              <div className="main-app-area">
                <KeynoteCompanion />
              </div>

              <ControlTray></ControlTray>
            </main>
          </div>
        </LiveAPIProvider>
      )}
    </div>
  );
}

export default App;