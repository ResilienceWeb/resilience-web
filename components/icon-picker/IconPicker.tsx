import { useRef, useState, type ReactNode } from 'react'
import type { IconBaseProps } from 'react-icons'
import { greenMapIconDescriptions } from '@helpers/green-map-icon-descriptions'
import {
  getIcon,
  iconSets,
  type IconEntry,
  type IconSetId,
} from '@helpers/icons'
import GreenMapCredit from '@components/green-map-credit'
import { cn } from '@components/lib/utils'
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
  /** Hex colour, with or without '#'. Every icon is shown in it, in one colour. */
  color?: string
  /** Offer to clear the icon. */
  allowNone?: boolean
  /** Show icons in one colour, as they will appear (tags). */
  monochrome?: boolean
  /** How the thing being edited will look with an icon, e.g. its chip. */
  renderPreview?: (icon: IconEntry) => ReactNode
}

const IconGlyph = ({
  icon,
  monochrome,
  ...props
}: IconBaseProps & { icon: IconEntry; monochrome: boolean }) =>
  monochrome ? <icon.monochrome {...props} /> : <icon.icon {...props} />

const IconTile = ({
  icon,
  monochrome,
  captioned,
  pressed,
  tint,
  ...handlers
}: {
  icon: IconEntry
  monochrome: boolean
  captioned: boolean
  pressed: boolean
  tint?: string
} & Pick<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onClick' | 'onDoubleClick' | 'onMouseEnter' | 'onFocus'
>) => (
  <button
    type="button"
    aria-label={icon.label}
    aria-pressed={pressed}
    className={cn(
      'text-foreground/75 hover:bg-muted hover:text-foreground focus-visible:ring-ring aria-pressed:bg-primary/10 aria-pressed:text-foreground aria-pressed:ring-primary flex flex-col items-center gap-1.5 rounded-lg p-2 transition-colors focus-visible:ring-2 focus-visible:outline-none aria-pressed:ring-2',
      captioned ? 'justify-start' : 'aspect-square justify-center',
    )}
    {...handlers}
  >
    <IconGlyph
      icon={icon}
      monochrome={monochrome}
      className="h-8 w-8 shrink-0"
      style={tint ? { color: tint } : undefined}
      aria-hidden="true"
    />
    {captioned && (
      <span className="text-muted-foreground line-clamp-2 text-center text-[11px] leading-tight">
        {icon.label}
      </span>
    )}
  </button>
)

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
  monochrome = false,
  renderPreview,
}: Props) {
  const [open, setOpen] = useState(false)
  const selected = value && value !== 'default' ? getIcon(value) : undefined
  const [activeSet, setActiveSet] = useState<IconSetId>(selected?.set ?? 'fa')
  const [query, setQuery] = useState('')
  // Green Map icons aren't self-explanatory, so choosing one takes two steps:
  // its name and description show first, on touch screens too, where there is
  // no hover. Font Awesome icons are picked with a single click.
  const selectedGreenMap = selected?.set === 'gm' ? selected : undefined
  const [pending, setPending] = useState<IconEntry | undefined>(
    selectedGreenMap,
  )
  const [previewed, setPreviewed] = useState<IconEntry | undefined>()
  const shownInPanel = previewed ?? pending
  const sectionsRef = useRef<Record<string, HTMLElement | null>>({})

  const hex = color ? `#${color.replace(/^#/, '')}` : undefined
  // Given a colour, icons are shown in it rather than in their own colours
  const singleColour = monochrome || Boolean(hex)
  const searching = query.trim() !== ''

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      setPending(selectedGreenMap)
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
            <IconGlyph
              icon={selected}
              monochrome={singleColour}
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
      <DialogContent className="sm:max-w-3xl" overlayClassName="bg-transparent">
        <DialogHeader>
          <DialogTitle>Select an icon</DialogTitle>
        </DialogHeader>
        <DialogDescription>{description}</DialogDescription>

        <Tabs
          value={activeSet}
          onValueChange={(set) => setActiveSet(set as IconSetId)}
          className="min-w-0"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <TabsList className="w-fit">
              {iconSets.map((set) => (
                <TabsTrigger key={set.id} value={set.id}>
                  {set.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <Input
              type="search"
              placeholder="Search icons"
              aria-label="Search icons"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="sm:flex-1"
            />
          </div>

          {iconSets.map((set) => {
            const explained = set.id === 'gm'
            const shown = search(set.icons, query)
            // Green Map's 169 icons are grouped by category, but searching
            // ranks them instead. Font Awesome's few fit in one grid.
            const grouped = explained && !searching
            const groups = !grouped
              ? [{ category: null, icons: shown }]
              : set.categories.map((category) => ({
                  category,
                  icons: shown.filter((icon) => icon.category === category),
                }))

            const tileProps = (icon: IconEntry) =>
              explained
                ? {
                    pressed: icon.name === pending?.name,
                    onMouseEnter: () => setPreviewed(icon),
                    onFocus: () => setPreviewed(icon),
                    onClick: () => setPending(icon),
                    onDoubleClick: () => choose(icon.name),
                  }
                : {
                    pressed: icon.name === selected?.name,
                    onClick: () => choose(icon.name),
                  }

            return (
              <TabsContent
                key={set.id}
                value={set.id}
                className={cn(
                  'mt-3',
                  explained && 'md:grid md:grid-cols-[1fr_15rem] md:gap-5',
                )}
              >
                <div className="flex min-w-0 flex-col gap-2">
                  {grouped && (
                    <nav
                      aria-label="Icon categories"
                      className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0"
                    >
                      {set.categories.map((category) => (
                        <button
                          key={category}
                          type="button"
                          className="bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground shrink-0 rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors"
                          onClick={() =>
                            sectionsRef.current[
                              `${set.id}:${category}`
                            ]?.scrollIntoView?.({
                              block: 'start',
                              behavior: 'smooth',
                            })
                          }
                        >
                          {category}
                        </button>
                      ))}
                    </nav>
                  )}

                  <div
                    className="max-h-[min(55vh,30rem)] overflow-y-auto pr-1"
                    onMouseLeave={() => setPreviewed(undefined)}
                    onBlur={() => setPreviewed(undefined)}
                  >
                    {groups
                      .filter((group) => group.icons.length > 0)
                      .map((group) => (
                        <section
                          key={group.category ?? 'results'}
                          ref={(element) => {
                            sectionsRef.current[`${set.id}:${group.category}`] =
                              element
                          }}
                          aria-label={group.category ?? undefined}
                          className="pb-3"
                        >
                          {group.category && (
                            <h3 className="bg-background text-muted-foreground sticky top-0 z-10 py-1.5 text-xs font-semibold tracking-wide uppercase">
                              {group.category}
                            </h3>
                          )}
                          <div
                            className={cn(
                              'grid gap-1',
                              explained
                                ? 'grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))]'
                                : 'grid-cols-[repeat(auto-fill,minmax(3.5rem,1fr))]',
                            )}
                          >
                            {group.icons.map((icon) => (
                              <IconTile
                                key={icon.name}
                                icon={icon}
                                monochrome={singleColour}
                                tint={hex}
                                captioned={explained}
                                {...tileProps(icon)}
                              />
                            ))}
                          </div>
                        </section>
                      ))}
                    {shown.length === 0 && (
                      <p className="text-muted-foreground py-6 text-center text-sm">
                        No icons match “{query.trim()}”.
                      </p>
                    )}
                  </div>
                </div>

                {explained && (
                  <aside className="bg-muted/50 mt-3 flex flex-col gap-3 rounded-lg p-4 text-sm md:mt-0">
                    {shownInPanel ? (
                      <>
                        {renderPreview && (
                          <div className="bg-background flex justify-center rounded-md p-3">
                            {renderPreview(shownInPanel)}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold">{shownInPanel.label}</p>
                          {descriptionOf(shownInPanel) && (
                            <p className="text-muted-foreground mt-1 line-clamp-6 md:line-clamp-[12]">
                              {descriptionOf(shownInPanel)}
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="text-muted-foreground">
                        Choose an icon to see what it means.
                      </p>
                    )}
                    <GreenMapCredit className="text-muted-foreground mt-auto text-xs" />
                  </aside>
                )}
              </TabsContent>
            )
          })}
        </Tabs>

        {((allowNone && selected) || activeSet === 'gm') && (
          <div className="flex flex-wrap justify-end gap-2">
            {allowNone && selected && (
              <Button
                type="button"
                variant="destructive"
                className="mr-auto"
                onClick={() => choose(null)}
              >
                Remove icon
              </Button>
            )}
            {activeSet === 'gm' && (
              <Button
                type="button"
                disabled={!pending || pending.name === selected?.name}
                onClick={() => pending && choose(pending.name)}
              >
                Use this icon
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
