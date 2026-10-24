import { useState } from 'react'
import { greenMapIconDescriptions } from '@helpers/green-map-icon-descriptions'
import {
  getIcon,
  iconSets,
  type IconEntry,
  type IconSetId,
} from '@helpers/icons'
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

const descriptionOf = (icon: IconEntry) =>
  icon.set === 'gm' ? greenMapIconDescriptions[icon.name.slice(3)] : undefined

/** Name matches first, then icons whose description mentions the search. */
const search = (icons: IconEntry[], query: string) => {
  const term = query.trim().toLowerCase()
  if (!term) return icons
  const byName = icons.filter((icon) => icon.label.toLowerCase().includes(term))
  const byDescription = icons.filter(
    (icon) =>
      !byName.includes(icon) &&
      descriptionOf(icon)?.toLowerCase().includes(term),
  )
  return [...byName, ...byDescription]
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
  // Choosing takes two steps so that a name and description can be read before
  // committing to an icon, on touch screens too, where there is no hover.
  const [pending, setPending] = useState<IconEntry | undefined>(selected)
  const [previewed, setPreviewed] = useState<IconEntry | undefined>()
  const shownInPanel = previewed ?? pending

  const hex = color ? `#${color.replace(/^#/, '')}` : undefined

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      setPending(selected)
      setPreviewed(undefined)
    }
  }

  const choose = (name: string | null) => {
    onChange(name)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
      {/* Opened from inside another dialog, whose overlay already dims the page */}
      <DialogContent className="sm:max-w-lg" overlayClassName="bg-transparent">
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
            const shown = search(
              set.icons.filter(
                (icon) => !category || icon.category === category,
              ),
              query,
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

                <div
                  className="grid max-h-[34vh] grid-cols-5 gap-3 overflow-y-auto p-1 sm:grid-cols-6"
                  onMouseLeave={() => setPreviewed(undefined)}
                  onBlur={() => setPreviewed(undefined)}
                >
                  {shown.map((icon) => (
                    <Button
                      key={icon.name}
                      type="button"
                      variant="outline"
                      className="aria-pressed:ring-primary h-14 w-14 p-0 aria-pressed:ring-2"
                      aria-label={icon.label}
                      aria-pressed={icon.name === pending?.name}
                      onMouseEnter={() => setPreviewed(icon)}
                      onFocus={() => setPreviewed(icon)}
                      onClick={() => setPending(icon)}
                      onDoubleClick={() => choose(icon.name)}
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

        <div className="bg-muted/50 min-h-20 rounded-md p-3 text-sm">
          {shownInPanel ? (
            <>
              <p className="font-semibold">{shownInPanel.label}</p>
              {descriptionOf(shownInPanel) && (
                <p className="text-muted-foreground mt-1 line-clamp-3">
                  {descriptionOf(shownInPanel)}
                </p>
              )}
            </>
          ) : (
            <p className="text-muted-foreground">
              Choose an icon to see what it means.
            </p>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          {allowNone && selected && (
            <Button
              type="button"
              variant="ghost"
              className="mr-auto"
              onClick={() => choose(null)}
            >
              Remove icon
            </Button>
          )}
          <Button
            type="button"
            disabled={!pending || pending.name === selected?.name}
            onClick={() => pending && choose(pending.name)}
          >
            Use this icon
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
