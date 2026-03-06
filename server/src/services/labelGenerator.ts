import fs from "node:fs";
import path from "node:path";
import { DOMParser } from "@xmldom/xmldom";
import { Box3, Group, Mesh, MeshNormalMaterial, Shape, ShapeGeometry, type BufferGeometry } from "three";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { ExtrudeGeometry } from "three";
import type { LabelInput } from "../types.js";

const EMBOSS_HEIGHT = 0.4;
const BASE_X = 0;
const BASE_Y = 0;

const SVG_BOX = {
  x1: 1.5,
  y1: 0.5,
  x2: 11,
  y2: 10
};

const TEXT_TOP_BOX = {
  x1: 12,
  y1: 5.75,
  x2: 33.3,
  y2: 10
};

const TEXT_BOTTOM_BOX = {
  x1: 12,
  y1: 0.5,
  x2: 33.3,
  y2: 4.75
};

const material = new MeshNormalMaterial();
const stlLoader = new STLLoader();
const svgLoader = new SVGLoader();
const exporter = new STLExporter();

if (!("DOMParser" in globalThis)) {
  (globalThis as any).DOMParser = DOMParser;
}

const baseStlPath = path.resolve(process.cwd(), "..", "GridfinityBinLabel.stl");
const baseStlBuffer = fs.readFileSync(baseStlPath);
const baseGeometry = stlLoader.parse(baseStlBuffer.buffer.slice(baseStlBuffer.byteOffset, baseStlBuffer.byteOffset + baseStlBuffer.byteLength));
baseGeometry.computeBoundingBox();
const baseBounds = baseGeometry.boundingBox ?? new Box3();
const topZ = baseBounds.max.z;

const fontJsonPath = path.resolve(process.cwd(), "node_modules", "three", "examples", "fonts", "helvetiker_regular.typeface.json");
const fontJson = JSON.parse(fs.readFileSync(fontJsonPath, "utf8"));
const font = new FontLoader().parse(fontJson);

function cloneBaseMesh(): Mesh<BufferGeometry> {
  return new Mesh(baseGeometry.clone(), material);
}

function toExtrudedMesh(shapes: Shape[], depth: number): Mesh {
  const geometry = new ExtrudeGeometry(shapes, {
    depth,
    bevelEnabled: false,
    curveSegments: 10
  });
  return new Mesh(geometry, material);
}

function getTextBounds(text: string, size: number): Box3 | null {
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  const shapes = font.generateShapes(trimmed, size);
  if (shapes.length === 0) {
    return null;
  }

  const geometry = new ShapeGeometry(shapes);
  geometry.computeBoundingBox();
  return geometry.boundingBox;
}

function getBoxSize(box: { x1: number; y1: number; x2: number; y2: number }): { width: number; height: number } {
  return {
    width: box.x2 - box.x1,
    height: box.y2 - box.y1
  };
}

function buildIconMesh(iconSvg: string): Mesh {
  const parsed = svgLoader.parse(iconSvg);
  const shapes: Shape[] = [];

  for (const p of parsed.paths) {
    const nextShapes = SVGLoader.createShapes(p);
    shapes.push(...nextShapes);
  }

  if (shapes.length === 0) {
    throw new Error("Invalid icon SVG");
  }

  const icon2D = new ShapeGeometry(shapes);
  icon2D.computeBoundingBox();
  const box = icon2D.boundingBox;
  if (!box) {
    throw new Error("Invalid icon SVG bounds");
  }

  const sourceWidth = box.max.x - box.min.x;
  const sourceHeight = box.max.y - box.min.y;
  if (sourceWidth <= 0 || sourceHeight <= 0) {
    throw new Error("Invalid icon SVG bounds");
  }

  const svgBoxSize = getBoxSize(SVG_BOX);
  const scale = Math.min(svgBoxSize.width / sourceWidth, svgBoxSize.height / sourceHeight);

  const extruded = toExtrudedMesh(shapes, EMBOSS_HEIGHT);
  extruded.scale.set(scale, scale, 1);

  const scaledWidth = sourceWidth * scale;
  const scaledHeight = sourceHeight * scale;

  const iconBoxX = BASE_X + SVG_BOX.x1;
  const iconBoxY = BASE_Y + SVG_BOX.y1;
  const tx = iconBoxX + ((svgBoxSize.width - scaledWidth) / 2) - (box.min.x * scale);
  const ty = iconBoxY + ((svgBoxSize.height - scaledHeight) / 2) - (box.min.y * scale);

  extruded.position.set(tx, ty, topZ);
  return extruded;
}

function chooseTextSizeForBox(text: string, maxWidth: number, maxHeight: number): number {
  let size = 6;
  const minSize = 1.2;
  while (size > minSize) {
    const bounds = getTextBounds(text, size);
    const width = bounds ? bounds.max.x - bounds.min.x : 0;
    const height = bounds ? bounds.max.y - bounds.min.y : 0;

    if (width <= maxWidth && height <= maxHeight) {
      return size;
    }
    size -= 0.1;
  }
  return minSize;
}

function createTextLineMesh(text: string, size: number, x: number, y: number, width: number, height: number): Mesh | null {
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  const shapes = font.generateShapes(trimmed, size);
  if (shapes.length === 0) {
    return null;
  }

  const text2D = new ShapeGeometry(shapes);
  text2D.computeBoundingBox();
  const box = text2D.boundingBox;
  if (!box) {
    return null;
  }

  const textWidth = box.max.x - box.min.x;
  const textHeight = box.max.y - box.min.y;
  if (textWidth > width || textHeight > height) {
    return null;
  }

  const mesh = toExtrudedMesh(shapes, EMBOSS_HEIGHT);
  const tx = x - box.min.x;
  const ty = y + ((height - textHeight) / 2) - box.min.y;
  mesh.position.set(tx, ty, topZ);
  return mesh;
}

function buildTextMeshes(label: LabelInput): Mesh[] {
  const topSize = getBoxSize(TEXT_TOP_BOX);
  const bottomSize = getBoxSize(TEXT_BOTTOM_BOX);

  const topFontSize = chooseTextSizeForBox(label.line1, topSize.width, topSize.height);
  const bottomFontSize = chooseTextSizeForBox(label.line2, bottomSize.width, bottomSize.height);

  const meshes: Mesh[] = [];
  const line1Mesh = createTextLineMesh(
    label.line1,
    topFontSize,
    BASE_X + TEXT_TOP_BOX.x1,
    BASE_Y + TEXT_TOP_BOX.y1,
    topSize.width,
    topSize.height
  );
  const line2Mesh = createTextLineMesh(
    label.line2,
    bottomFontSize,
    BASE_X + TEXT_BOTTOM_BOX.x1,
    BASE_Y + TEXT_BOTTOM_BOX.y1,
    bottomSize.width,
    bottomSize.height
  );

  if (line1Mesh) {
    meshes.push(line1Mesh);
  }

  if (line2Mesh) {
    meshes.push(line2Mesh);
  }

  return meshes;
}

export function generateLabelStl(label: LabelInput): Buffer {
  if (!label.line1.trim() && !label.line2.trim()) {
    throw new Error("At least one text line is required.");
  }

  const root = new Group();
  root.add(cloneBaseMesh());
  root.add(buildIconMesh(label.iconSvg));

  for (const textMesh of buildTextMeshes(label)) {
    root.add(textMesh);
  }

  const result = exporter.parse(root, { binary: true });
  if (result instanceof DataView) {
    return Buffer.from(result.buffer, result.byteOffset, result.byteLength);
  }

  return Buffer.from(result);
}
