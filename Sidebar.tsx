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

import {PropsWithChildren} from 'react';

export function Sidebar({children}: PropsWithChildren) {
  return (
    <aside className="w-80 bg-[var(--sidebar-bg)] flex flex-col shrink-0 border-r border-[var(--border-color)] h-full">
      <div className="flex items-center gap-3 p-4 border-b border-[var(--border-color)]">
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <rect
            width="32"
            height="32"
            rx="8"
            fill="url(#paint0_linear_1_2)"
          />
          <defs>
            <linearGradient
              id="paint0_linear_1_2"
              x1="16"
              y1="0"
              x2="16"
              y2="32"
              gradientUnits="userSpaceOnUse">
              <stop stopColor="#25D3B8" />
              <stop offset="1" stopColor="#1DBFA5" />
            </linearGradient>
          </defs>
        </svg>

        <h1 className="text-xl font-semibold text-white">VisionEdge</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        {children}
      </div>
      <div className="p-4 border-t border-[var(--border-color)] text-sm text-[var(--text-color-secondary)] flex flex-col gap-2">
        <button className="bg-transparent text-left !p-0">Help</button>
        <button className="bg-transparent text-left !p-0">Logout</button>
      </div>
    </aside>
  );
}
