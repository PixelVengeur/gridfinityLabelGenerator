export interface LabelInput {
  id?: string;
  title: string;
  line1: string;
  line2: string;
  iconSvg: string;
  iconText?: string;
  line2Svg?: string; // SVG to render in the line-2 box instead of text
}

export type LabelCategory = "fasteners" | "inserts";
export type IconKey = "tx" | "washer" | "screwLowHead" | "insert" | "nut" | "nylock";

export interface PredefinedLabel extends LabelInput {
  icon: IconKey;
  category: LabelCategory;
  size: string;
  wrenchSize?: string;
}
