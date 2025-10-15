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

import {GoogleGenAI} from '@google/genai';
import {useAtom} from 'jotai';
import getStroke from 'perfect-freehand';
// Fix: Import `KeyboardEvent` to resolve namespace error.
import {useState, KeyboardEvent} from 'react';
import {
  BoundingBoxMasksAtom,
  BoundingBoxes2DAtom,
  BoundingBoxes3DAtom,
  DetectTypeAtom,
  HoverEnteredAtom,
  ImageSrcAtom,
  IsLoadingAtom,
  LinesAtom,
  LineWidthAtom,
  PointsAtom,
  PromptsAtom,
  ShareStream,
  TemperatureAtom,
  VideoRefAtom,
} from './atoms';
import {lineOptions} from './consts';
import {DetectTypes} from './Types';
import {getSvgPathFromStroke, loadImage} from './utils';

const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

export function PromptControls() {
  const [temperature, setTemperature] = useAtom(TemperatureAtom);
  const [, setBoundingBoxes2D] = useAtom(BoundingBoxes2DAtom);
  const [, setBoundingBoxes3D] = useAtom(BoundingBoxes3DAtom);
  const [, setBoundingBoxMasks] = useAtom(BoundingBoxMasksAtom);
  const [stream] = useAtom(ShareStream);
  const [detectType] = useAtom(DetectTypeAtom);
  const [, setPoints] = useAtom(PointsAtom);
  const [, setHoverEntered] = useAtom(HoverEnteredAtom);
  const [lines] = useAtom(LinesAtom);
  const [lineWidth] = useAtom(LineWidthAtom);
  const [videoRef] = useAtom(VideoRefAtom);
  const [imageSrc] = useAtom(ImageSrcAtom);
  const [targetPrompt, setTargetPrompt] = useState('items');
  const [labelPrompt, setLabelPrompt] = useState('');
  const [segmentationLanguage, setSegmentationLanguage] = useState('English');

  const [prompts, setPrompts] = useAtom(PromptsAtom);
  const [isLoading, setIsLoading] = useAtom(IsLoadingAtom);

  const is2d = detectType === '2D bounding boxes';

  const get2dPrompt = () =>
    `Detect ${targetPrompt}, with no more than 20 items. Output a json list where each entry contains the 2D bounding box in "box_2d" and ${
      labelPrompt || 'a text label'
    } in "label".`;

  const getSegmentationPrompt = () => {
    const promptParts = prompts['Segmentation masks'];
    const prefix = promptParts[0];
    const items = promptParts[1];
    let suffix = promptParts[2];

    const originalLabelInstruction =
      ' text label in the key "label". Use descriptive labels.';
    if (
      segmentationLanguage &&
      segmentationLanguage.trim() !== '' &&
      segmentationLanguage.toLowerCase() !== 'english'
    ) {
      if (suffix.endsWith(originalLabelInstruction)) {
        suffix = suffix.substring(
          0,
          suffix.length - originalLabelInstruction.length,
        );
      }
      suffix += ` text label in language ${segmentationLanguage} in the key "label". Use descriptive labels in ${segmentationLanguage}. Ensure labels are in ${segmentationLanguage}. DO NOT USE ENGLISH FOR LABELS.`;
    }
    return `${prefix} ${items}${suffix}`;
  };

  const getGenericPrompt = (type: DetectTypes) => {
    if (!prompts[type] || prompts[type].length < 3)
      return prompts[type]?.join(' ') || '';
    const [p0, p1, p2] = prompts[type];
    return `${p0} ${p1}${p2}`;
  };

  async function handleSend() {
    setIsLoading(true);
    try {
      let activeDataURL;
      const maxSize = 640;
      const copyCanvas = document.createElement('canvas');
      const ctx = copyCanvas.getContext('2d')!;

      if (stream) {
        const video = videoRef.current!;
        const scale = Math.min(
          maxSize / video.videoWidth,
          maxSize / video.videoHeight,
        );
        copyCanvas.width = video.videoWidth * scale;
        copyCanvas.height = video.videoHeight * scale;
        ctx.drawImage(video, 0, 0, copyCanvas.width, copyCanvas.height);
      } else if (imageSrc) {
        const image = await loadImage(imageSrc);
        const scale = Math.min(maxSize / image.width, maxSize / image.height);
        copyCanvas.width = image.width * scale;
        copyCanvas.height = image.height * scale;
        ctx.drawImage(image, 0, 0, copyCanvas.width, copyCanvas.height);
      } else {
        setIsLoading(false);
        return;
      }
      activeDataURL = copyCanvas.toDataURL('image/png');

      if (lines.length > 0) {
        for (const line of lines) {
          const p = new Path2D(
            getSvgPathFromStroke(
              getStroke(
                line[0].map(([x, y]) => [
                  x * copyCanvas.width,
                  y * copyCanvas.height,
                  0.5,
                ]),
                {...lineOptions, size: lineWidth},
              ),
            ),
          );
          ctx.fillStyle = line[1];
          ctx.fill(p);
        }
        activeDataURL = copyCanvas.toDataURL('image/png');
      }

      setHoverEntered(false);
      const config: {
        temperature: number;
        thinkingConfig?: {thinkingBudget: number};
      } = {temperature};

      let model = 'gemini-2.5-flash';
      if (detectType === '3D bounding boxes') {
        model = 'gemini-2.0-flash';
      } else {
        config['thinkingConfig'] = {thinkingBudget: 0};
      }

      let textPromptToSend = '';
      if (is2d) {
        textPromptToSend = get2dPrompt();
      } else if (detectType === 'Segmentation masks') {
        textPromptToSend = getSegmentationPrompt();
      } else {
        textPromptToSend = getGenericPrompt(detectType);
      }

      const result = await ai.models.generateContent({
        model,
        contents: {
          parts: [
            {
              inlineData: {
                data: activeDataURL.replace('data:image/png;base64,', ''),
                mimeType: 'image/png',
              },
            },
            {text: textPromptToSend},
          ],
        },
        config,
      });

      let response = result.text;
      if (response.includes('```json')) {
        response = response.split('```json')[1].split('```')[0];
      }

      try {
        const parsedResponse = JSON.parse(response);
        if (detectType === '2D bounding boxes') {
          const formattedBoxes = parsedResponse.map(
            (box: {
              box_2d: [number, number, number, number];
              label: string;
            }) => {
              const [ymin, xmin, ymax, xmax] = box.box_2d;
              return {
                x: xmin / 1000,
                y: ymin / 1000,
                width: (xmax - xmin) / 1000,
                height: (ymax - ymin) / 1000,
                label: box.label,
              };
            },
          );
          setBoundingBoxes2D(formattedBoxes);
        } else if (detectType === 'Points') {
          const formattedPoints = parsedResponse.map(
            (point: {point: [number, number]; label: string}) => ({
              point: {x: point.point[1] / 1000, y: point.point[0] / 1000},
              label: point.label,
            }),
          );
          setPoints(formattedPoints);
        } else if (detectType === 'Segmentation masks') {
          const formattedBoxes = parsedResponse.map(
            (box: {
              box_2d: [number, number, number, number];
              label: string;
              mask: string;
            }) => {
              const [ymin, xmin, ymax, xmax] = box.box_2d;
              return {
                x: xmin / 1000,
                y: ymin / 1000,
                width: (xmax - xmin) / 1000,
                height: (ymax - ymin) / 1000,
                label: box.label,
                imageData: box.mask,
              };
            },
          );
          const sortedBoxes = formattedBoxes.sort(
            (a: any, b: any) => b.width * b.height - a.width * a.height,
          );
          setBoundingBoxMasks(sortedBoxes);
        } else {
          const formattedBoxes = parsedResponse.map(
            (box: {
              box_3d: number[];
              label: string;
            }) => ({
              center: box.box_3d.slice(0, 3),
              size: box.box_3d.slice(3, 6),
              rpy: box.box_3d.slice(6).map((x) => (x * Math.PI) / 180),
              label: box.label,
            }),
          );
          setBoundingBoxes3D(formattedBoxes);
        }
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', {response, jsonError});
        alert(`Model returned invalid response:\n\n${response}`);
        setBoundingBoxes2D([]);
        setPoints([]);
        setBoundingBoxMasks([]);
        setBoundingBoxes3D([]);
      }
    } catch (apiError) {
      console.error('Gemini API call failed:', apiError);
      alert('An error occurred. Please check the console for details.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold uppercase text-[var(--text-color-secondary)] tracking-wider">
        Prompt
      </h2>
      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-[var(--text-color-secondary)]">
          {is2d ? 'Detect:' : prompts[detectType][0]}
        </label>
        <textarea
          placeholder="e.g., cars, trees, buildings"
          rows={2}
          value={is2d ? targetPrompt : prompts[detectType][1]}
          onChange={(e) => {
            if (is2d) {
              setTargetPrompt(e.target.value);
            } else {
              const newPrompts = {...prompts};
              newPrompts[detectType][1] = e.target.value;
              setPrompts(newPrompts);
            }
          }}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        {detectType === 'Segmentation masks' && (
          <>
            <label className="text-sm font-medium text-[var(--text-color-secondary)]">
              Label Language:
            </label>
            <textarea
              placeholder="e.g., Deutsch, Français, Español"
              rows={1}
              value={segmentationLanguage}
              onChange={(e) => setSegmentationLanguage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
          </>
        )}
        {is2d && (
          <>
            <label className="text-sm font-medium text-[var(--text-color-secondary)]">
              Label with (optional):
            </label>
            <textarea
              placeholder="e.g., a description of each item"
              rows={1}
              value={labelPrompt}
              onChange={(e) => setLabelPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
          </>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <label className="flex justify-between items-center text-sm text-[var(--text-color-secondary)]">
          <span>Temperature:</span>
          <span>{temperature.toFixed(2)}</span>
        </label>
        <input
          type="range"
          min="0"
          max="2"
          step="0.05"
          value={temperature}
          onChange={(e) => setTemperature(Number(e.target.value))}
          disabled={isLoading}
        />
      </div>
      <button className="primary w-full" onClick={handleSend} disabled={isLoading}>
        {isLoading ? 'Sending...' : 'Send'}
      </button>
    </div>
  );
}
