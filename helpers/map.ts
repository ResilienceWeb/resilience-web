import L from 'leaflet'
import { renderIconSvg } from '@helpers/icon-render'

const DEFAULT_MARKER_COLOR = '#3388ff'

export function createCustomIcon(iconName: string, color: string) {
  const markerColor = color || DEFAULT_MARKER_COLOR
  // Fall back to the default map-marker icon if the name is not found
  const iconSvg =
    renderIconSvg(iconName, markerColor, 16) ??
    renderIconSvg('default', markerColor, 16)

  const iconHtml = `
    <div style="
      background-color: white;
      border-radius: 50%;
      height: 32px;
      width: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 1px 5px rgba(0,0,0,0.2);
      border: 2px solid ${markerColor};
    ">${iconSvg}</div>
  `

  return L.divIcon({
    html: iconHtml,
    className: 'custom-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  })
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Resilience Web logo in a white circle with the web's name underneath,
// matching how related webs appear on the network (web) view
export function createRelatedWebIcon(title: string) {
  const html = `
    <div style="position: relative; width: 36px; height: 36px; cursor: pointer;">
      <img
        src="/logo-circle.png"
        alt=""
        style="
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: white;
          border: 1px solid rgba(0,0,0,0.12);
          box-shadow: 0 1px 5px rgba(0,0,0,0.3);
        "
      />
      <div style="
        position: absolute;
        top: 38px;
        left: 50%;
        transform: translateX(-50%);
        white-space: nowrap;
        font-family: Inter, system-ui, sans-serif;
        font-size: 12px;
        font-weight: 600;
        color: #333;
        text-shadow:
          0 0 3px white,
          0 0 3px white,
          0 0 4px white,
          0 1px 2px white;
      ">${escapeHtml(title)}</div>
    </div>
  `

  return L.divIcon({
    html,
    className: 'related-web-icon',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  })
}

function clusterMiniIcon(
  iconName: string | undefined,
  color: string,
  offset: number,
  zIndex: number,
) {
  // Fall back to the default map-marker icon if the name is not found
  const iconSvg =
    (iconName ? renderIconSvg(iconName, color, 13) : null) ??
    renderIconSvg('default', color, 13)

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
    ">${iconSvg}</div>
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
