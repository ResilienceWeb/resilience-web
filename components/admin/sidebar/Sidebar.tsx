import dynamic from 'next/dynamic'

const SidebarContent = dynamic(() => import('./SidebarContent'), {
  ssr: false,
})

export default function Sidebar({ isOpen, onClose }) {
  return (
    <div className="relative h-screen w-0 shrink-0 lg:w-60">
      <div className="hidden lg:block">
        <SidebarContent closeMenu={onClose} />
      </div>

      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ease-in-out lg:hidden ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'} `}
      >
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0'} `}
          onClick={onClose}
        />

        <div
          className={`fixed left-0 top-0 h-full w-full transform bg-white transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} `}
        >
          <SidebarContent closeMenu={onClose} />
        </div>
      </div>
    </div>
  )
}
