import { useState } from 'react'
import { getIcon, iconSets, type IconSetId } from '@helpers/icons'
import GreenMapCredit from '@components/green-map-credit'
import { Button } from '@components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@components/ui/dialog'
import { Input } from '@components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'

type Props = {
  value: string | null | undefined
  onChange: (value: string | null) => void
  description: string
  /** Hex colour, with or without '#', for the trigger and Font Awesome icons. */
  color?: string
  /** Offer to clear the icon. */
  allowNone?: boolean
}

export default function IconPicker({
  value,
  onChange,
  description,
  color,
  allowNone = false,
}: Props) {
  const [open, setOpen] = useState(false)
  const selected = value && value !== 'default' ? getIcon(value) : undefined
  const [activeSet, setActiveSet] = useState<IconSetId>(selected?.set ?? 'fa')
  const [category, setCategory] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  const hex = color ? `#${color.replace(/^#/, '')}` : undefined

  const choose = (name: string | null) => {
    onChange(name)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {selected ? (
          <Button
            type="button"
            variant="outline"
            className="hover:bg-muted/50 flex h-14 w-14 rounded-[50%] p-0 transition-colors"
            style={hex ? { border: `2px solid ${hex}` } : undefined}
          >
            <selected.icon
              className="!h-8 !w-8"
              style={hex ? { color: hex } : undefined}
              aria-hidden="true"
            />
            <span className="sr-only">Change icon ({selected.label})</span>
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="flex w-fit justify-start"
          >
            Select an icon...
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Select an icon</DialogTitle>
        </DialogHeader>
        <DialogDescription>{description}</DialogDescription>

        <Tabs
          value={activeSet}
          onValueChange={(set) => {
            setActiveSet(set as IconSetId)
            setCategory(null)
          }}
        >
          <TabsList>
            {iconSets.map((set) => (
              <TabsTrigger key={set.id} value={set.id}>
                {set.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {iconSets.map((set) => {
            const search = query.trim().toLowerCase()
            const shown = set.icons.filter(
              (icon) =>
                (!category || icon.category === category) &&
                (!search || icon.label.toLowerCase().includes(search)),
            )

            return (
              <TabsContent
                key={set.id}
                value={set.id}
                className="flex flex-col gap-3"
              >
                <Input
                  type="search"
                  placeholder="Search icons"
                  aria-label="Search icons"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                <div className="flex flex-wrap gap-1">
                  {[null, ...set.categories].map((option) => (
                    <Button
                      key={option ?? 'all'}
                      type="button"
                      size="sm"
                      variant={category === option ? 'default' : 'outline'}
                      aria-pressed={category === option}
                      onClick={() => setCategory(option)}
                    >
                      {option ?? 'All'}
                    </Button>
                  ))}
                </div>

                <div className="grid max-h-[40vh] grid-cols-5 gap-3 overflow-y-auto sm:grid-cols-6">
                  {shown.map((icon) => (
                    <Button
                      key={icon.name}
                      type="button"
                      variant="outline"
                      className="aria-pressed:ring-primary h-14 w-14 p-0 aria-pressed:ring-2"
                      title={icon.label}
                      aria-label={icon.label}
                      aria-pressed={icon.name === selected?.name}
                      onClick={() => choose(icon.name)}
                    >
                      <icon.icon className="!h-8 !w-8" aria-hidden="true" />
                    </Button>
                  ))}
                </div>
                {shown.length === 0 && (
                  <p className="text-muted-foreground text-sm">
                    No icons match.
                  </p>
                )}

                {set.id === 'gm' && (
                  <GreenMapCredit className="text-muted-foreground" />
                )}
              </TabsContent>
            )
          })}
        </Tabs>

        {allowNone && selected && (
          <Button
            type="button"
            variant="ghost"
            className="w-fit"
            onClick={() => choose(null)}
          >
            Remove icon
          </Button>
        )}
      </DialogContent>
    </Dialog>
  )
}
