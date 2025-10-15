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

import {Content} from './Content';
import {ContentToolbar} from './ContentToolbar';

export function MainView() {
  return (
    <main className="flex-1 flex flex-col overflow-hidden p-6 gap-4">
      <div className="flex justify-between items-center shrink-0">
        <h1 className="text-xl font-semibold text-[var(--text-color-primary)]">
          AI Inference - Anomaly Hotspots
        </h1>
        {/* Placeholder for filters like Date Range, Location, etc. */}
      </div>
      <div className="flex-1 bg-[var(--sidebar-bg)] rounded-lg border border-[var(--border-color)] flex flex-col overflow-hidden">
        <ContentToolbar />
        <div className="flex-1 p-2 relative">
          <Content />
        </div>
      </div>
    </main>
  );
}
