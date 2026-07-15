import DisplayFilterInfo from '@arcgis/core/layers/support/DisplayFilterInfo';
import UniqueValueClass from '@arcgis/core/renderers/support/UniqueValueClass';
import UniqueValueGroup from '@arcgis/core/renderers/support/UniqueValueGroup';
import UniqueValueRenderer from '@arcgis/core/renderers/UniqueValueRenderer';
import SizeVariable from '@arcgis/core/renderers/visualVariables/SizeVariable';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';

import windrushData from '@/data/windrush_upgrades.json';

import {
  otherWaterAlertStatusSymbolArcade,
  scottishWaterAlertStatusSymbolArcade,
} from './dischargeSourceRendererArcade';

/**
 * Defines the visual representation for different discharge statuses.
 * Uses clean coloured dots for clarity.
 */
const uniqueValueGroups = [
  new UniqueValueGroup({
    classes: [
      new UniqueValueClass({
        label: 'Discharging',
        symbol: new SimpleMarkerSymbol({ style: 'circle', color: [239, 68, 68, 1], outline: { color: [255, 255, 255, 0.8], width: 1 } }),
        values: 3,
      }),
      new UniqueValueClass({
        label: 'Not Discharging',
        symbol: new SimpleMarkerSymbol({ style: 'circle', color: [34, 197, 94, 1], outline: { color: [255, 255, 255, 0.8], width: 1 } }),
        values: 0,
      }),
      new UniqueValueClass({
        label: 'Recent Discharge',
        symbol: new SimpleMarkerSymbol({ style: 'circle', color: [245, 158, 11, 1], outline: { color: [255, 255, 255, 0.8], width: 1 } }),
        values: 2,
      }),
      new UniqueValueClass({
        label: 'Offline',
        symbol: new SimpleMarkerSymbol({ style: 'circle', color: [156, 163, 175, 1], outline: { color: [255, 255, 255, 0.8], width: 1 } }),
        values: 1,
      }),
      new UniqueValueClass({
        label: 'Unknown Status',
        symbol: new SimpleMarkerSymbol({ style: 'circle', color: [156, 163, 175, 1], outline: { color: [255, 255, 255, 0.8], width: 1 } }),
        values: 999,
      }),
      new UniqueValueClass({
        label: 'Discharging (Urgent Deadline)',
        symbol: new SimpleMarkerSymbol({ style: 'circle', color: [239, 68, 68, 1], outline: { color: [0, 255, 255, 1], width: 3 } }),
        values: 13,
      }),
      new UniqueValueClass({
        label: 'Not Discharging (Urgent Deadline)',
        symbol: new SimpleMarkerSymbol({ style: 'circle', color: [34, 197, 94, 1], outline: { color: [0, 255, 255, 1], width: 3 } }),
        values: 10,
      }),
      new UniqueValueClass({
        label: 'Recent Discharge (Urgent Deadline)',
        symbol: new SimpleMarkerSymbol({ style: 'circle', color: [245, 158, 11, 1], outline: { color: [0, 255, 255, 1], width: 3 } }),
        values: 12,
      }),
      new UniqueValueClass({
        label: 'Offline (Urgent Deadline)',
        symbol: new SimpleMarkerSymbol({ style: 'circle', color: [156, 163, 175, 1], outline: { color: [0, 255, 255, 1], width: 3 } }),
        values: 11,
      }),
    ],
  }),
];

/**
 * Creates a smooth scaled symbol size based on the current map scale.
 * Uses a quadratic ease-out function to create a more gradual transition between zoom levels,
 * with more size changes happening in the middle zoom ranges rather than at the extremes.
 * The scale is normalized between baseScale and zoomedScale, then mapped to symbol sizes.
 * Symbols get larger as the scale decreases (zooming in).
 *
 * @param {number} scale - The current map scale
 * @param {number} [minScale=32] - The minimum symbol size
 * @param {number} [maxScale=10] - The maximum symbol size
 * @param {number} [baseScale=100000000] - The scale at which symbols are smallest (zoomed out)
 * @param {number} [zoomedScale=10000] - The scale at which symbols are largest (zoomed in)
 * @returns {number} The calculated symbol size
 */
export function createSmoothScaledSymbolSize(
  scale: number,
  minScale: number = 32,
  maxScale: number = 10,
  baseScale = 100000000,
  zoomedScale = 10000,
): number {
  // Calculate the zoom level (log base 4 of the scale)
  const zoomLevel = Math.log(scale) / Math.log(4);

  // Calculate the base zoom level and zoomed zoom level
  const baseZoomLevel = Math.log(baseScale) / Math.log(4);
  const zoomedZoomLevel = Math.log(zoomedScale) / Math.log(4);

  // Normalize the zoom level between 0 and 1, inverted so 0 is zoomed out and 1 is zoomed in
  const normalizedZoom = 1 - (zoomLevel - baseZoomLevel) / (zoomedZoomLevel - baseZoomLevel);

  // Apply quadratic ease-out function for more gradual transition
  // This will distribute size changes more evenly across the zoom range
  const easedZoom = 1 - Math.pow(1 - normalizedZoom, 2);

  // Interpolate between min and max sizes
  const calculatedSize = minScale + (maxScale - minScale) * easedZoom;

  // Clamp to ensure within bounds
  return Math.max(maxScale, Math.min(minScale, calculatedSize));
}

const MIN_SYMBOL_SIZE = 10;
const MAX_SYMBOL_SIZE = 42;
// Scale steps follow a 2x progression for more gradual zoom level changes
// Adjusted to focus on the main zoom range between 5,000 and 5,000,000
const SCALE_STEPS = [5000, 10000, 20000, 50000, 100000, 250000, 1000000, 5000000];
export const STEPS = SCALE_STEPS.map((scale) => ({
  size: createSmoothScaledSymbolSize(scale, MAX_SYMBOL_SIZE, MIN_SYMBOL_SIZE, 5000000, 5000),
  value: scale,
}));

const sizeVariable = new SizeVariable({
  valueExpression: '$view.scale',
  stops: STEPS,
});

const delayMappingArcade = `
  var loc = Lower($feature.LocationName);
  if (IsEmpty(loc)) return 0;
  ${windrushData
    .filter((d) => (d.Delay_length || 0) > 0)
    .map((d) => `if (Find("${String(d.STW).toLowerCase()}", loc) > -1) return ${d.Delay_length};`)
    .join('\n  ')}
  return 0;
`;

const delaySizeVariable = new SizeVariable({
  valueExpression: delayMappingArcade,
  stops: [
    { value: 0, size: "18px" },
    { value: 1, size: "26px" },
    { value: 2, size: "34px" },
    { value: 3, size: "42px" },
    { value: 4, size: "50px" },
    { value: 5, size: "58px" }
  ]
});

const urgentMappingArcade = `
  var loc = Lower($feature.LocationName);
  var isUrgent = false;
  if (!IsEmpty(loc)) {
    ${windrushData
      .filter((d) => d.Revised_date == 2025 || d.Revised_date == 2026)
      .map((d) => `if (Find("${String(d.STW).toLowerCase()}", loc) > -1) isUrgent = true;`)
      .join('\n    ')}
  }
  
  var status = 999;
  if (
      Boolean($feature.AlertPast48Hours) == true &&
      Lower(Trim($feature.AlertStatus)) != "discharging" &&
      Lower(Trim($feature.AlertStatus)) != "offline"
  ) {
      status = 2; // Recent Discharge
  } else if (Lower(Trim($feature.AlertStatus)) == "not discharging") {
      status = 0; // Not Discharging
  } else if ($feature.AlertStatus == null || IsEmpty($feature.AlertStatus)) {
      status = 999; // Unknown Status
  } else if (Lower(Trim($feature.AlertStatus)) == "discharging") {
      status = 3; // Discharging
  } else if (Lower(Trim($feature.AlertStatus)) == "offline") {
      status = 1; // Offline
  }

  if (isUrgent && status != 999) {
      return status + 10;
  }
  return status;
`;

export const thamesWaterAlertStatusRenderer = new UniqueValueRenderer({
  valueExpression: urgentMappingArcade,
  uniqueValueGroups,
  visualVariables: [delaySizeVariable],
});

/**
 * Renderer for other water company discharge sources.
 * Uses unique value rendering with scale-based symbol sizing.
 */
export const otherWaterAlertStatusRenderer = new UniqueValueRenderer({
  valueExpression: otherWaterAlertStatusSymbolArcade,
  uniqueValueGroups,
  visualVariables: [sizeVariable],
});

/**
 * Renderer for Scottish Water discharge sources.
 * Uses unique value rendering based on OVERFLOW_STATUS_ID with scale-based symbol sizing.
 */
export const scottishWaterAlertStatusRenderer = new UniqueValueRenderer({
  valueExpression: scottishWaterAlertStatusSymbolArcade,
  uniqueValueGroups,
  visualVariables: [sizeVariable],
});

const SWITCH_TO_SHOW_ALL_SCALE = 2000000;

/**
 * Display filter for Thames Water sources that switches between showing all sources
 * and only alerting sources based on zoom level.
 * - Below 1:2,000,000 scale: Shows all sources
 * - Above 1:2,000,000 scale: Shows only discharging or recently discharged sources
 */
export const thamesWaterDisplayFilterInfo = new DisplayFilterInfo({
  mode: 'scale',
  filters: [
    {
      title: 'display all',
      minScale: SWITCH_TO_SHOW_ALL_SCALE,
      maxScale: 0,
      where: '1=1',
    },
    {
      title: 'display only alerting sources',
      minScale: Infinity,
      maxScale: SWITCH_TO_SHOW_ALL_SCALE,
      where:
        "LOWER(TRIM(AlertStatus)) = 'discharging' OR (AlertPast48Hours = 'true' AND LOWER(TRIM(AlertStatus)) NOT IN ('discharging', 'offline'))",
    },
  ],
});

/**
 * Display filter for other water company sources that switches between showing all sources
 * and only alerting sources based on zoom level.
 * - Below 1:2,000,000 scale: Shows all sources
 * - Above 1:2,000,000 scale: Shows only active or recently active sources
 */
export const otherWaterDisplayFilterInfo = new DisplayFilterInfo({
  mode: 'scale',
  filters: [
    {
      title: 'display all',
      minScale: SWITCH_TO_SHOW_ALL_SCALE,
      maxScale: 0,
      where: '1=1',
    },
    {
      title: 'display only alerting sources',
      minScale: Infinity,
      maxScale: SWITCH_TO_SHOW_ALL_SCALE,
      where: 'status = 1 OR (status = 0 AND latestEventEnd >= CURRENT_TIMESTAMP - 48/24)',
    },
  ],
});
