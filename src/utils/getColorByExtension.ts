const extColor = {
  pdf: "purple",
  xls: "green",
  doc: "blue",
  txt: "blue",
  png: "orange",
  jpg: "orange",
  jpeg: "orange",
  zip: "red",
} as const;

export type Extension = keyof typeof extColor;
export type Color = (typeof extColor)[Extension];

export const getColorByExtension = (ext: string): Color | undefined => {
  if (ext in extColor) {
    return extColor[ext as Extension];
  }
  return undefined;
};

