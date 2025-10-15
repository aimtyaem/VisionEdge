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
import {
  ActiveColorAtom,
  DetectTypeAtom,
  DrawModeAtom,
  HoverEnteredAtom,
  LinesAtom,
  LineWidthAtom,
  RedoLinesAtom,
  RevealOnHoverModeAtom,
} from './atoms';
import {colors} from './consts';

function Palette() {
  const [activeColor, setActiveColor] = useAtom(ActiveColorAtom);
  return (
    <div
      className="flex items-center gap-2"
      onClick={(e) => {
        e.stopPropagation();
      }}>
      {colors.map((color, i) => (
        <button
          key={i}
          className={`w-6 h-6 rounded-full cursor-pointer transition-transform duration-150 ease-in-out hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--sidebar-bg)] focus:ring-[var(--accent-color)] ${
            activeColor === color
              ? 'ring-2 ring-offset-2 ring-offset-[var(--sidebar-bg)] ring-[var(--text-color-primary)]'
              : ''
          }`}
          style={{backgroundColor: color}}
          onClick={(e) => {
            e.stopPropagation();
            setActiveColor(color);
          }}
          aria-label={`Select color ${color}`}
        />
      ))}
    </div>
  );
}

export function ContentToolbar() {
  const [detectType] = useAtom(DetectTypeAtom);
  const [revealOnHover, setRevealOnHoverMode] = useAtom(RevealOnHoverModeAtom);
  const [, setHoverEntered] = useAtom(HoverEnteredAtom);
  const [drawMode, setDrawMode] = useAtom(DrawModeAtom);
  const [lines, setLines] = useAtom(LinesAtom);
  const [redoLines, setRedoLines] = useAtom(RedoLinesAtom);
  const [lineWidth, setLineWidth] = useAtom(LineWidthAtom);

  const handleUndo = () => {
    if (lines.length > 0) {
      const lastLine = lines[lines.length - 1];
      setLines(lines.slice(0, -1));
      setRedoLines((prev) => [...prev, lastLine]);
    }
  };

  const handleRedo = () => {
    if (redoLines.length > 0) {
      const lineToRedo = redoLines[redoLines.length - 1];
      setRedoLines(redoLines.slice(0, -1));
      setLines((prev) => [...prev, lineToRedo]);
    }
  };

  const tabs = ['AI Inference', 'Time Series', 'Correlations', 'Ground Data'];

  return (
    <div className="shrink-0 border-b border-[var(--border-color)]">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center -mb-px">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              className={`py-3 px-4 border-b-2 text-sm font-medium ${
                i === 0
                  ? 'border-[var(--accent-color)] text-[var(--accent-color)]'
                  : 'border-transparent text-[var(--text-color-secondary)] hover:text-[var(--text-color-primary)]'
              } bg-transparent`}>
              {tab}
            </button>
          ))}
        </div>
        {detectType === '2D bounding boxes' ||
        detectType === 'Segmentation masks' ? (
          <div>
            <label className="flex items-center gap-2 text-sm text-[var(--text-color-secondary)] select-none whitespace-nowrap">
              <input
                type="checkbox"
                className="w-4 h-4 rounded"
                checked={revealOnHover}
                onChange={(e) => {
                  setHoverEntered(!e.target.checked);
                  setRevealOnHoverMode(e.target.checked);
                }}
              />
              <div>Reveal on hover</div>
            </label>
          </div>
        ) : null}
      </div>
      {drawMode && (
        <div className="flex gap-4 px-4 py-2 items-center justify-between bg-[var(--bg-color)]">
          <div className="flex gap-2">
            <button
              className="secondary"
              onClick={handleUndo}
              disabled={lines.length === 0}>
              Undo
            </button>
            <button
              className="secondary"
              onClick={handleRedo}
              disabled={redoLines.length === 0}>
              Redo
            </button>
          </div>
          <div className="grow flex justify-center items-center gap-4">
            <Palette />
            <div className="flex items-center gap-2 text-sm text-[var(--text-color-secondary)]">
              <span>Thickness:</span>
              <input
                type="range"
                min="2"
                max="40"
                value={lineWidth}
                onChange={(e) => setLineWidth(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className="secondary"
              onClick={() => {
                setLines([]);
                setRedoLines([]);
              }}>
              Clear
            </button>
            <button className="primary" onClick={() => setDrawMode(false)}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
