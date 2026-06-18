import L from 'leaflet'
import { getIconUnicode } from '@helpers/icons'

export function createCustomIcon(iconName: string, color: string) {
  const iconUnicode = getIconUnicode(iconName) ?? '\uf3c5' // Default to map-marker if not found

  const iconHtml = `
    <div style="
      background-color: white;
      border-radius: 50%;
      height: 32px;
      width: 32px;
      line-height: 26px;
      text-align: center;
      box-shadow: 0 1px 5px rgba(0,0,0,0.2);
      border: 2px solid ${color || '#3388ff'};
    ">
      <span style="
        font-family: 'Font Awesome 5 Free';
        font-weight: 900;
        font-size: 16px;
        color: ${color || '#3388ff'};
      ">${iconUnicode}</span>
    </div>
  `

  return L.divIcon({
    html: iconHtml,
    className: 'custom-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  })
}

const DEFAULT_MARKER_UNICODE = '' // map-marker
const DEFAULT_MARKER_COLOR = '#3388ff'

function clusterMiniIcon(
  iconName: string | undefined,
  color: string,
  offset: number,
  zIndex: number,
) {
  const iconUnicode = iconName
    ? (getIconUnicode(iconName) ?? DEFAULT_MARKER_UNICODE)
    : DEFAULT_MARKER_UNICODE

  return `
    <div style="
      position: absolute;
      left: ${offset}px;
      top: 0;
      z-index: ${zIndex};
      height: 28px;
      width: 28px;
      background-color: white;
      border-radius: 50%;
      border: 2px solid ${color};
      box-shadow: 0 1px 4px rgba(0,0,0,0.25);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <span style="
        font-family: 'Font Awesome 5 Free';
        font-weight: 900;
        font-size: 13px;
        color: ${color};
      ">${iconUnicode}</span>
    </div>
  `
}

// Renders a cluster as a small fanned stack of the categories it contains,
// with a count badge, so it's obvious it's a group of several listings.
export function createClusterIcon(cluster: any) {
  const count = cluster.getChildCount()
  const childMarkers = cluster.getAllChildMarkers()

  // Collect up to 3 distinct categories present in the cluster.
  const seen = new Set<string>()
  const categories: Array<{ icon?: string; color: string }> = []
  for (const marker of childMarkers) {
    const category = marker.itemCategory
    const key = category?.icon ?? '__default'
    if (seen.has(key)) continue
    seen.add(key)
    categories.push({
      icon: category?.icon,
      color: category?.color || DEFAULT_MARKER_COLOR,
    })
    if (categories.length >= 3) break
  }

  if (categories.length === 0) {
    categories.push({ color: DEFAULT_MARKER_COLOR })
  }

  const overlap = 14
  const miniSize = 28
  const width = miniSize + overlap * (categories.length - 1)

  const icons = categories
    .map((category, index) =>
      clusterMiniIcon(
        category.icon,
        category.color,
        index * overlap,
        index + 1,
      ),
    )
    .join('')

  const html = `
    <div style="position: relative; width: ${width}px; height: ${miniSize}px;">
      ${icons}
      <div style="
        position: absolute;
        top: -7px;
        right: -7px;
        z-index: 10;
        min-width: 18px;
        height: 18px;
        padding: 0 4px;
        box-sizing: border-box;
        background-color: #1f2937;
        color: white;
        border: 2px solid white;
        border-radius: 9px;
        font-family: system-ui, sans-serif;
        font-size: 11px;
        font-weight: 700;
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
      ">${count}</div>
    </div>
  `

  return L.divIcon({
    html,
    className: 'custom-cluster-icon',
    iconSize: [width, miniSize],
    iconAnchor: [width / 2, miniSize / 2],
  })
}
