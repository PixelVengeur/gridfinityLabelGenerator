export type LabelMode = "custom" | "predefined";

export interface LabelInput {
  id?: string;
  title: string;
  line1: string;
  line2: string;
  iconSvg: string;
}

export interface GenerateRequest {
  labels: LabelInput[];
}
