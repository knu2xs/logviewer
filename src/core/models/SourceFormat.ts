export const SOURCE_FORMATS = [
  'Python Pipe Delimited',
  'ArcGIS Server',
  'ArcGIS Portal',
  'Unknown',
] as const;

export type SourceFormat = (typeof SOURCE_FORMATS)[number];
