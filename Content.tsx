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
import getStroke from 'perfect-freehand';
import {
  PointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {ResizePayload, useResizeDetector} from 'react-resize-detector';
import {
  ActiveColorAtom,
  BoundingBoxes2DAtom,
  BoundingBoxes3DAtom,
  BoundingBoxMasksAtom,
  DetectTypeAtom,
  DrawModeAtom,
  FOVAtom,
  ImageSentAtom,
  ImageSrcAtom,
  LinesAtom,
  LineWidthAtom,
  PointsAtom,
  RedoLinesAtom,
  RevealOnHoverModeAtom,
  ShareStream,
  VideoRefAtom,
} from './atoms';
import {lineOptions, segmentationColorsRgb} from './consts';
import {getSvgPathFromStroke} from './utils';

export function Content() {
  const [imageSrc] = useAtom(ImageSrcAtom);
  const [boundingBoxes2D] = useAtom(BoundingBoxes2DAtom);
  const [boundingBoxes3D] = useAtom(BoundingBoxes3DAtom);
  const [boundingBoxMasks] = useAtom(BoundingBoxMasksAtom);
  const [stream] = useAtom(ShareStream);
  const [detectType] = useAtom(DetectTypeAtom);
  const [videoRef] = useAtom(VideoRefAtom);
  const [fov] = useAtom(FOVAtom);
  const [, setImageSent] = useAtom(ImageSentAtom);
  const [points] = useAtom(PointsAtom);
  const [revealOnHover] = useAtom(RevealOnHoverModeAtom);
  const [hoverEntered, setHoverEntered] = useState(false);
  const [hoveredBox, _setHoveredBox] = useState<number | null>(null);
  const [drawMode] = useAtom(DrawModeAtom);
  const [lines, setLines] = useAtom(LinesAtom);
  const [, setRedoLines] = useAtom(RedoLinesAtom);
  const [lineWidth] = useAtom(LineWidthAtom);
  const [activeColor] = useAtom(ActiveColorAtom);

  const boundingBoxContainerRef = useRef<HTMLDivElement | null>(null);
  const [containerDims, setContainerDims] = useState({
    width: 0,
    height: 0,
  });
  const [activeMediaDimensions, setActiveMediaDimensions] = useState({
    width: 1,
    height: 1,
  });

  const onResize = useCallback((el: ResizePayload) => {
    if (el.width && el.height) {
      setContainerDims({
        width: el.width,
        height: el.height,
      });
    }
  }, []);

  const {ref: containerRef} = useResizeDetector({onResize});

  const boundingBoxContainer = useMemo(() => {
    const {width, height} = activeMediaDimensions;
    if (height === 0 || containerDims.height === 0) return {width: 0, height: 0};
    const aspectRatio = width / height;
    const containerAspectRatio = containerDims.width / containerDims.height;
    if (aspectRatio < containerAspectRatio) {
      return {
        height: containerDims.height,
        width: containerDims.height * aspectRatio,
      };
    } else {
      return {
        width: containerDims.width,
        height: containerDims.width / aspectRatio,
      };
    }
  }, [containerDims, activeMediaDimensions]);

  function matrixMultiply(m: number[][], v: number[]): number[] {
    return m.map((row: number[]) =>
      row.reduce((sum, val, i) => sum + val * v[i], 0),
    );
  }

  const linesAndLabels3D = useMemo(() => {
    if (!boundingBoxContainer || boundingBoxes3D.length === 0) {
      return null;
    }
    let allLines: any[] = [];
    let allLabels: any[] = [];
    for (const box of boundingBoxes3D) {
      const {center, size, rpy} = box;

      const [sr, sp, sy] = rpy.map((x) => Math.sin(x / 2));
      const [cr, cp, cz] = rpy.map((x) => Math.cos(x / 2));
      const quaternion = [
        sr * cp * cz - cr * sp * sy,
        cr * sp * cz + sr * cp * sy,
        cr * cp * sy - sr * sp * cz,
        cr * cp * cz + sr * sp * sy,
      ];

      const height = boundingBoxContainer.height;
      const width = boundingBoxContainer.width;
      const f = width / (2 * Math.tan(((fov / 2) * Math.PI) / 180));
      const cx = width / 2;
      const cy = height / 2;
      const intrinsics = [
        [f, 0, cx],
        [0, f, cy],
        [0, 0, 1],
      ];

      const halfSize = size.map((s) => s / 2);
      let corners = [];
      for (let x of [-halfSize[0], halfSize[0]]) {
        for (let y of [-halfSize[1], halfSize[1]]) {
          for (let z of [-halfSize[2], halfSize[2]]) {
            corners.push([x, y, z]);
          }
        }
      }
      corners = [
        corners[1],
        corners[3],
        corners[7],
        corners[5],
        corners[0],
        corners[2],
        corners[6],
        corners[4],
      ];

      const q = quaternion;
      const rotationMatrix = [
        [
          1 - 2 * q[1] ** 2 - 2 * q[2] ** 2,
          2 * q[0] * q[1] - 2 * q[3] * q[2],
          2 * q[0] * q[2] + 2 * q[3] * q[1],
        ],
        [
          2 * q[0] * q[1] + 2 * q[3] * q[2],
          1 - 2 * q[0] ** 2 - 2 * q[2] ** 2,
          2 * q[1] * q[2] - 2 * q[3] * q[0],
        ],
        [
          2 * q[0] * q[2] - 2 * q[3] * q[1],
          2 * q[1] * q[2] + 2 * q[3] * q[0],
          1 - 2 * q[0] ** 2 - 2 * q[1] ** 2,
        ],
      ];

      const boxVertices = corners.map((corner) => {
        const rotated = matrixMultiply(rotationMatrix, corner);
        return rotated.map((val, idx) => val + center[idx]);
      });

      const tiltAngle = 90.0;
      const viewRotationMatrix = [
        [1, 0, 0],
        [
          0,
          Math.cos((tiltAngle * Math.PI) / 180),
          -Math.sin((tiltAngle * Math.PI) / 180),
        ],
        [
          0,
          Math.sin((tiltAngle * Math.PI) / 180),
          Math.cos((tiltAngle * Math.PI) / 180),
        ],
      ];

      const points = boxVertices;
      const rotatedPoints = points.map((p) =>
        matrixMultiply(viewRotationMatrix, p),
      );
      const projectedPoints = rotatedPoints.map((p) =>
        matrixMultiply(intrinsics, p),
      );
      const vertices = projectedPoints.map((p) => [p[0] / p[2], p[1] / p[2]]);

      const topVertices = vertices.slice(0, 4);
      const bottomVertices = vertices.slice(4, 8);

      for (let i = 0; i < 4; i++) {
        const lines = [
          [topVertices[i], topVertices[(i + 1) % 4]],
          [bottomVertices[i], bottomVertices[(i + 1) % 4]],
          [topVertices[i], bottomVertices[i]],
        ];

        for (let [start, end] of lines) {
          const dx = end[0] - start[0];
          const dy = end[1] - start[1];
          const length = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx);
          allLines.push({start, end, length, angle});
        }
      }

      const textPosition3d = points[0].map(
        (_, idx) => points.reduce((sum, p) => sum + p[idx], 0) / points.length,
      );
      textPosition3d[2] += 0.1;

      const textPoint = matrixMultiply(
        intrinsics,
        matrixMultiply(viewRotationMatrix, textPosition3d),
      );
      const textPos = [
        textPoint[0] / textPoint[2],
        textPoint[1] / textPoint[2],
      ];
      allLabels.push({label: box.label, pos: textPos});
    }
    return [allLines, allLabels] as const;
  }, [boundingBoxes3D, boundingBoxContainer, fov]);

  function setHoveredBox(e: PointerEvent) {
    const boxes = document.querySelectorAll('.bbox');
    const dimensionsAndIndex = Array.from(boxes).map((box, i) => {
      const {top, left, width, height} = box.getBoundingClientRect();
      return {top, left, width, height, index: i};
    });
    const sorted = dimensionsAndIndex.sort(
      (a, b) => a.width * a.height - b.width * b.height,
    );
    const {clientX, clientY} = e;
    const found = sorted.find(
      ({top, left, width, height}) =>
        clientX > left &&
        clientX < left + width &&
        clientY > top &&
        clientY < top + height,
    );
    _setHoveredBox(found ? found.index : null);
  }

  const downRef = useRef<Boolean>(false);

  return (
    <div ref={containerRef} className="w-full h-full grow relative">
      {stream ? (
        <video
          className="absolute top-0 left-0 w-full h-full object-contain"
          autoPlay
          onLoadedMetadata={(e) => {
            setActiveMediaDimensions({
              width: e.currentTarget.videoWidth,
              height: e.currentTarget.videoHeight,
            });
          }}
          ref={(video) => {
            if (video) {
              videoRef.current = video;
              if (!video.srcObject) {
                video.srcObject = stream;
              }
            }
          }}
        />
      ) : imageSrc ? (
        <img
          src={imageSrc}
          className="absolute top-0 left-0 w-full h-full object-contain"
          alt="Uploaded content"
          onLoad={(e) => {
            setActiveMediaDimensions({
              width: e.currentTarget.naturalWidth,
              height: e.currentTarget.naturalHeight,
            });
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-[var(--text-color-secondary)]">
          Upload an image or select an example to begin analysis.
        </div>
      )}
      <div
        className={`absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 ${
          hoverEntered ? 'hide-box' : ''
        } ${drawMode ? 'cursor-crosshair' : ''}`}
        ref={boundingBoxContainerRef}
        onPointerEnter={(e) => {
          if (revealOnHover && !drawMode) {
            setHoverEntered(true);
            setHoveredBox(e);
          }
        }}
        onPointerMove={(e) => {
          if (revealOnHover && !drawMode) setHoveredBox(e);
          if (downRef.current) {
            const parentBounds =
              boundingBoxContainerRef.current!.getBoundingClientRect();
            setLines((prev) => [
              ...prev.slice(0, prev.length - 1),
              [
                [
                  ...prev[prev.length - 1][0],
                  [
                    (e.clientX - parentBounds.left) /
                      boundingBoxContainer!.width,
                    (e.clientY - parentBounds.top) /
                      boundingBoxContainer!.height,
                  ],
                ],
                prev[prev.length - 1][1],
              ],
            ]);
          }
        }}
        onPointerLeave={(e) => {
          if (revealOnHover && !drawMode) {
            setHoverEntered(false);
            _setHoveredBox(null);
          }
        }}
        onPointerDown={(e) => {
          if (drawMode) {
            setRedoLines([]);
            setImageSent(false);
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            downRef.current = true;
            const parentBounds =
              boundingBoxContainerRef.current!.getBoundingClientRect();
            setLines((prev) => [
              ...prev,
              [
                [
                  [
                    (e.clientX - parentBounds.left) /
                      boundingBoxContainer!.width,
                    (e.clientY - parentBounds.top) /
                      boundingBoxContainer!.height,
                  ],
                ],
                activeColor,
              ],
            ]);
          }
        }}
        onPointerUp={(e) => {
          if (drawMode) {
            (e.target as HTMLElement).releasePointerCapture(e.pointerId);
            downRef.current = false;
          }
        }}
        style={{
          width: boundingBoxContainer.width,
          height: boundingBoxContainer.height,
        }}>
        {lines.length > 0 && (
          <svg
            className="absolute top-0 left-0 w-full h-full"
            style={{
              pointerEvents: 'none',
              width: boundingBoxContainer?.width,
              height: boundingBoxContainer?.height,
            }}>
            {lines.map(([points, color], i) => (
              <path
                key={i}
                d={getSvgPathFromStroke(
                  getStroke(
                    points.map(([x, y]) => [
                      x * boundingBoxContainer!.width,
                      y * boundingBoxContainer!.height,
                      0.5,
                    ]),
                    {...lineOptions, size: lineWidth},
                  ),
                )}
                fill={color}
              />
            ))}
          </svg>
        )}
        {detectType === '2D bounding boxes' &&
          boundingBoxes2D.map((box, i) => (
            <div
              key={i}
              className={`absolute bbox border-2 border-[var(--accent-color)] ${
                i === hoveredBox ? 'reveal' : ''
              }`}
              style={{
                top: `${box.y * 100}%`,
                left: `${box.x * 100}%`,
                width: `${box.width * 100}%`,
                height: `${box.height * 100}%`,
              }}>
              <div className="bg-[var(--accent-color)] text-black absolute left-0 -top-6 text-xs px-1 rounded-sm font-semibold">
                {box.label}
              </div>
            </div>
          ))}
        {detectType === 'Segmentation masks' &&
          boundingBoxMasks.map((box, i) => (
            <div
              key={i}
              className={`absolute bbox ${i === hoveredBox ? 'reveal' : ''}`}
              style={{
                top: `${box.y * 100}%`,
                left: `${box.x * 100}%`,
                width: `${box.width * 100}%`,
                height: `${box.height * 100}%`,
              }}>
              <BoxMask box={box} index={i} />
              <div className="bg-[var(--accent-color)] text-black absolute left-0 -top-6 text-xs px-1 rounded-sm font-semibold">
                {box.label}
              </div>
            </div>
          ))}

        {detectType === 'Points' &&
          points.map((point, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${point.point.x * 100}%`,
                top: `${point.point.y * 100}%`,
              }}>
              <div className="absolute bg-[var(--accent-color)] text-black text-center text-xs px-1 bottom-4 rounded-sm -translate-x-1/2 left-1/2 font-semibold">
                {point.label}
              </div>
              <div className="absolute w-4 h-4 bg-[var(--accent-color)] rounded-full border-white border-2 -translate-x-1/2 -translate-y-1/2"></div>
            </div>
          ))}
        {detectType === '3D bounding boxes' &&
          linesAndLabels3D && (
            <>
              {linesAndLabels3D[0].map((line, i) => (
                <div
                  key={i}
                  className="absolute h-0.5 bg-[var(--accent-color)]"
                  style={{
                    width: `${line.length}px`,
                    transform: `translate(${line.start[0]}px, ${line.start[1]}px) rotate(${line.angle}rad)`,
                    transformOrigin: '0 0',
                  }}></div>
              ))}
              {linesAndLabels3D[1].map((label, i) => (
                <div
                  key={i}
                  className="absolute bg-[var(--accent-color)] text-black text-xs px-1 rounded-sm"
                  style={{
                    top: `${label.pos[1]}px`,
                    left: `${label.pos[0]}px`,
                    transform: 'translate(-50%, -50%)',
                  }}>
                  {label.label}
                </div>
              ))}
            </>
          )}
      </div>
    </div>
  );
}

function BoxMask({
  box,
  index,
}: {
  box: {imageData: string};
  index: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rgb = segmentationColorsRgb[index % segmentationColorsRgb.length];

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        const image = new Image();
        image.src = box.imageData;
        image.onload = () => {
          canvasRef.current!.width = image.width;
          canvasRef.current!.height = image.height;
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(image, 0, 0);
          const pixels = ctx.getImageData(0, 0, image.width, image.height);
          const data = pixels.data;
          for (let i = 0; i < data.length; i += 4) {
            data[i + 3] = data[i]; // alpha from mask
            data[i] = rgb[0];
            data[i + 1] = rgb[1];
            data[i + 2] = rgb[2];
          }
          ctx.putImageData(pixels, 0, 0);
        };
      }
    }
  }, [canvasRef, box.imageData, rgb]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full"
      style={{opacity: 0.6}}
    />
  );
}
