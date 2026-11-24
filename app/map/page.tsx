import { permanentRedirect } from 'next/navigation'

// The map started here as an experiment and is now the homepage's default
export default function MapPage() {
  permanentRedirect('/#webs')
}
