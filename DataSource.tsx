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
  BumpSessionAtom,
  DrawModeAtom,
  ImageSentAtom,
  ImageSrcAtom,
  IsUploadedImageAtom,
  ShareStream,
} from './atoms';
import {imageOptions} from './consts';
import {useResetState} from './hooks';

export function DataSource() {
  const [, setImageSrc] = useAtom(ImageSrcAtom);
  const [, setIsUploadedImage] = useAtom(IsUploadedImageAtom);
  const [, setStream] = useAtom(ShareStream);
  const [, setDrawMode] = useAtom(DrawModeAtom);
  const [, setBumpSession] = useAtom(BumpSessionAtom);
  const [, setImageSent] = useAtom(ImageSentAtom);
  const resetState = useResetState();

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold uppercase text-[var(--text-color-secondary)] tracking-wider">
        Data Source
      </h2>
      <label className="w-full button primary">
        <input
          className="hidden"
          type="file"
          accept=".jpg, .jpeg, .png, .webp"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (e) => {
                resetState();
                setImageSrc(e.target?.result as string);
                setIsUploadedImage(true);
                setImageSent(false);
                setBumpSession((prev) => prev + 1);
              };
              reader.readAsDataURL(file);
            }
          }}
        />
        <div>Upload Image</div>
      </label>
      <div className="grid grid-cols-4 gap-2">
        {imageOptions.map((image) => (
          <button
            key={image}
            className="p-0 aspect-square relative overflow-hidden rounded-md border-2 border-transparent hover:border-[var(--accent-color)] focus:border-[var(--accent-color)] focus:outline-none"
            onClick={() => {
              setIsUploadedImage(false);
              setImageSrc(image);
              resetState();
            }}>
            <img
              src={image}
              alt="Example image"
              className="absolute left-0 top-0 w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          className="w-full"
          onClick={() => {
            setDrawMode(true);
          }}>
          Draw on Image
        </button>
        <button
          className="w-full"
          onClick={() => {
            resetState();
            navigator.mediaDevices
              .getDisplayMedia({video: true})
              .then((stream) => {
                setStream(stream);
              });
          }}>
          Screenshare
        </button>
      </div>
    </div>
  );
}
