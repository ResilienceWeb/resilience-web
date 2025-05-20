'use client'

import { useEffect, useState } from 'react'
import type { Web } from '@prisma/client'
import { toast } from 'sonner'
import { FEATURES } from '@helpers/features'
import { Switch } from '@components/ui/switch'
import useUpdateWebFeature from '@hooks/webs/useUpdateWebFeature'

type Feature = {
  id: number
  feature: string
  enabled: boolean
}

type WebFeaturesProps = {
  web: Web & {
    features: Feature[]
  }
}

export default function WebFeatures({ web }: WebFeaturesProps) {
  const [features, setFeatures] = useState<Feature[]>([])
  const { updateWebFeature, isPending } = useUpdateWebFeature()

  useEffect(() => {
    if (web?.features) {
      setFeatures(web.features)
    }
  }, [web])

  const handleFeatureToggle = (featureKey: string, enabled: boolean) => {
    try {
      setFeatures((prevFeatures) =>
        prevFeatures.map((f) =>
          f.feature === featureKey ? { ...f, enabled } : f,
        ),
      )

      updateWebFeature({
        feature: featureKey,
        enabled: enabled,
        slug: web.slug,
        webId: web.id,
      })

      toast.success('Feature updated successfully')
    } catch (error) {
      console.error('Failed to update feature:', error)
      toast.error('Failed to update feature')
      // Revert on error
      setFeatures(web.features)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div>
        <h3 className="text-lg font-semibold">Features</h3>
        <p className="text-sm text-muted-foreground">
          Enable or disable features for this web
        </p>
      </div>
      <div className="rounded-md border">
        {Object.entries(FEATURES).map(([_key, featureKey]) => {
          const feature = features?.find((f) => f.feature === featureKey)
          console.log(feature)
          return (
            <div
              key={featureKey}
              className="flex items-center justify-between p-4 border-b last:border-b-0"
            >
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium leading-none">Show map</p>
                <p className="text-sm text-muted-foreground">
                  {getFeatureDescription(featureKey)}
                </p>
              </div>
              <Switch
                checked={feature?.enabled ?? false}
                onCheckedChange={(checked) =>
                  handleFeatureToggle(featureKey, checked)
                }
                disabled={isPending}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

function getFeatureDescription(feature: string): string {
  const descriptions: Record<string, string> = {
    [FEATURES.showMap]: 'Display the interactive map on the web',
  }

  return descriptions[feature] || 'No description available'
}
