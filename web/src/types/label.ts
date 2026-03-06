export interface LabelInput {
  id?: string;
  title: string;
  line1: string;
  line2: string;
  iconSvg: string;
}

export interface PredefinedLabel extends LabelInput {
  icon: string;
}
