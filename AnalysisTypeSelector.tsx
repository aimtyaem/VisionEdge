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

import {useAtom} from 'jotai';
import {DetectTypeAtom, HoverEnteredAtom} from './atoms';
import {DetectTypes} from './Types';

// Fix: Add optional key to props type to satisfy strict type checking for components used in lists.
function SelectOption({label}: {label: DetectTypes; key?: string}) {
  const [detectType, setDetectType] = useAtom(DetectTypeAtom);
  const [, setHoverEntered] = useAtom(HoverEnteredAtom);

  const isActive = detectType === label;

  return (
    <button
      className={`w-full text-left p-2 rounded-md text-sm font-medium transition-colors duration-150 ${
        isActive
          ? 'bg-[var(--accent-color)] text-black'
          : 'bg-transparent text-[var(--text-color-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-color-primary)]'
      }`}
      onClick={() => {
        setHoverEntered(false);
        setDetectType(label);
      }}>
      {label}
    </button>
  );
}

export function AnalysisTypeSelector() {
  const analysisTypes: DetectTypes[] = [
    '2D bounding boxes',
    'Segmentation masks',
    'Points',
    '3D bounding boxes',
  ];

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold uppercase text-[var(--text-color-secondary)] tracking-wider">
        Analysis
      </h2>
      <div className="flex flex-col gap-1">
        {analysisTypes.map((label) => (
          <SelectOption key={label} label={label} />
        ))}
      </div>
    </div>
  );
}
