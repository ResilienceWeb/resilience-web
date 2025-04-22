'use client'

import { useState } from 'react'
import { Button } from '@components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@components/ui/dialog'
import {
  FaLeaf,
  FaTree,
  FaHome,
  FaBuilding,
  FaCar,
  FaBus,
  FaBicycle,
  FaSolarPanel,
  FaWind,
  FaHandsHelping,
  FaBalanceScale,
  FaAppleAlt,
  FaCarrot,
  FaSeedling,
  FaTools,
  FaGraduationCap,
} from 'react-icons/fa'
import {
  MdWaterDrop,
  MdForest,
  MdApartment,
  MdElectricCar,
  MdOutlineEnergySavingsLeaf,
} from 'react-icons/md'
import { IoFlower, IoHomeSharp, IoPeople } from 'react-icons/io5'

// Define our available icons
const icons = [
  // Environment
  { icon: FaLeaf, name: 'Leaf', category: 'Environment' },
  { icon: FaTree, name: 'Tree', category: 'Environment' },
  { icon: MdWaterDrop, name: 'Water', category: 'Environment' },
  { icon: MdForest, name: 'Forest', category: 'Environment' },
  { icon: IoFlower, name: 'Flower', category: 'Environment' },

  // Housing
  { icon: FaHome, name: 'Home', category: 'Housing' },
  { icon: FaBuilding, name: 'Building', category: 'Housing' },
  { icon: MdApartment, name: 'Apartment', category: 'Housing' },
  { icon: IoHomeSharp, name: 'HomeSharp', category: 'Housing' },

  // Transportation
  { icon: FaCar, name: 'Car', category: 'Transportation' },
  { icon: FaBus, name: 'Bus', category: 'Transportation' },
  { icon: FaBicycle, name: 'Bicycle', category: 'Transportation' },
  { icon: MdElectricCar, name: 'ElectricCar', category: 'Transportation' },

  // Energy
  { icon: FaWind, name: 'Wind', category: 'Energy' },
  { icon: FaSolarPanel, name: 'SolarPanel', category: 'Energy' },
  {
    icon: MdOutlineEnergySavingsLeaf,
    name: 'EnergySavings',
    category: 'Energy',
  },

  // Social Justice
  { icon: FaHandsHelping, name: 'HandsHelping', category: 'Social Justice' },
  { icon: FaBalanceScale, name: 'Balance', category: 'Social Justice' },
  { icon: IoPeople, name: 'Community', category: 'Social Justice' },

  // Food
  { icon: FaAppleAlt, name: 'Apple', category: 'Food' },
  { icon: FaCarrot, name: 'Carrot', category: 'Food' },
  { icon: FaSeedling, name: 'Seedling', category: 'Food' },

  // Other
  { icon: FaTools, name: 'Tools', category: 'Other' },
  { icon: FaGraduationCap, name: 'Education', category: 'Other' },
]

// Group icons by category
const categories = [...new Set(icons.map((icon) => icon.category))]

interface IconSelectorProps {
  value: string
  onChange: (value: string) => void
}

export function IconSelector({ value, onChange }: IconSelectorProps) {
  const [open, setOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredIcons = selectedCategory
    ? icons.filter((icon) => icon.category === selectedCategory)
    : icons

  const DisplayIcon =
    value && value !== 'default'
      ? icons.find((icon) => icon.name === value).icon
      : null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start gap-2">
          {value && value !== 'default' ? (
            <DisplayIcon className="h-5 w-5" />
          ) : (
            <span>Select an icon</span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select an Icon</DialogTitle>
        </DialogHeader>

        <div className="mb-4 flex flex-wrap gap-1">
          <Button
            key="all"
            variant={selectedCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-3 overflow-y-auto">
          {filteredIcons.map((iconObj) => {
            const IconComponent = iconObj.icon
            return (
              <Button
                key={iconObj.name}
                variant="outline"
                className="h-16 w-16 p-0"
                onClick={() => {
                  onChange(iconObj.name)
                  setOpen(false)
                }}
              >
                <IconComponent className="!h-8 !w-8" />
              </Button>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
