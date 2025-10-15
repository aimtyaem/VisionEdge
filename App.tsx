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
import {useEffect} from 'react';
import {AnalysisTypeSelector} from './AnalysisTypeSelector';
import {ContentToolbar} from './ContentToolbar';
import {DataSource} from './DataSource';
import {Header} from './Header';
import {MainView} from './MainView';
import {PromptControls} from './PromptControls';
import {Sidebar} from './Sidebar';
import {DetectTypes} from './Types';
import {DetectTypeAtom} from './atoms';
import {hash} from './utils';

function App() {
  const [, setDetectType] = useAtom(DetectTypeAtom);

  useEffect(() => {
    // Force dark mode
    document.documentElement.classList.add('dark');

    const params = hash();
    const taskParam = params.task;

    if (taskParam) {
      let newDetectType: DetectTypes | null = null;
      switch (taskParam) {
        case '2d-bounding-boxes':
          newDetectType = '2D bounding boxes';
          break;
        case 'segmentation-masks':
          newDetectType = 'Segmentation masks';
          break;
        case 'points':
          newDetectType = 'Points';
          break;
        case '3d-bounding-boxes':
          newDetectType = '3D bounding boxes';
          break;
        default:
          console.warn(`Unknown task parameter in URL hash: ${taskParam}`);
      }
      if (newDetectType) {
        setDetectType(newDetectType);
      }
    }
  }, [setDetectType]);

  return (
    <div className="flex h-[100dvh] bg-[var(--bg-color)] text-[var(--text-color-primary)]">
      <Sidebar>
        <AnalysisTypeSelector />
        <DataSource />
        <PromptControls />
      </Sidebar>
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <MainView />
      </div>
    </div>
  );
}

export default App;
