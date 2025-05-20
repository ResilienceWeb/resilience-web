export const FEATURES = {
  showMap: 'show-map',
} as const
export type Feature = (typeof FEATURES)[keyof typeof FEATURES]

type FeatureConfig = {
  feature: string
  enabled: boolean
}

export const isFeatureEnabled = (
  featureName: Feature,
  features: FeatureConfig[],
) => {
  return features.find((f) => f.feature === featureName)?.enabled ?? false
}
