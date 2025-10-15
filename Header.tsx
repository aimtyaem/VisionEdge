/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
// Copyright 2024 Google LLC

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     https://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {useResetState} from './hooks';

export function Header() {
  const resetState = useResetState();
  return (
    <header className="flex items-center justify-between p-4 border-b border-[var(--border-color)] shrink-0">
      <div className="flex gap-2">
        <button className="secondary text-sm">Region: Global</button>
        <button className="secondary text-sm">Model: Gemini 2.5 Pro</button>
      </div>
      <div className="flex items-center gap-4">
        <button
          className="secondary text-sm"
          onClick={() => {
            resetState();
          }}>
          Reset Session
        </button>
        <div className="flex items-center gap-3">
          <img
            src="https://www.gstatic.com/aistudio/assets/images/profile_placeholder.png"
            alt="User profile picture"
            className="w-10 h-10 rounded-full"
          />
          <div className="text-sm">
            <div className="font-semibold text-[var(--text-color-primary)]">
              Dr. Evelyn Reed
            </div>
            <div className="text-[var(--text-color-secondary)]">
              Environmental Scientist
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
