import type { SourceFormat, SeverityValue } from '../core/models';

export interface SeverityOption {
  label: string;
  value: SeverityValue;
}

const PIPE_DELIMITED_SEVERITY_OPTIONS: SeverityOption[] = [
  { label: 'NOTSET', value: 'NOTSET' },
  { label: 'DEBUG', value: 'DEBUG' },
  { label: 'INFO', value: 'INFO' },
  { label: 'WARNING', value: 'WARNING' },
  { label: 'ERROR', value: 'ERROR' },
  { label: 'CRITICAL', value: 'CRITICAL' },
];

const ARC_GIS_SERVER_SEVERITY_OPTIONS: SeverityOption[] = [
  { label: 'NOTSET', value: 'NOTSET' },
  { label: 'Debug', value: 'DEBUG' },
  { label: 'Verbose', value: 'VERBOSE' },
  { label: 'Info', value: 'INFO' },
  { label: 'Warning', value: 'WARNING' },
  { label: 'Severe', value: 'SEVERE' },
];

const ARC_GIS_PORTAL_SEVERITY_OPTIONS: SeverityOption[] = [
  { label: 'NOTSET', value: 'NOTSET' },
  { label: 'Verbose', value: 'VERBOSE' },
  { label: 'Fine', value: 'FINE' },
  { label: 'Info', value: 'INFO' },
  { label: 'Warning', value: 'WARNING' },
  { label: 'Severe', value: 'SEVERE' },
];

export function getSeverityOptions(
  sourceFormat: SourceFormat | null | undefined,
): SeverityOption[] {
  if (sourceFormat === 'ArcGIS Server') {
    return ARC_GIS_SERVER_SEVERITY_OPTIONS;
  }

  if (sourceFormat === 'ArcGIS Portal') {
    return ARC_GIS_PORTAL_SEVERITY_OPTIONS;
  }

  return PIPE_DELIMITED_SEVERITY_OPTIONS;
}
