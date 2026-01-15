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
