import { NavLink } from 'react-router-dom'
import { Home, MessageSquare, Users, LifeBuoy, User } from 'lucide-react'

const Item = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex flex-col items-center justify-center gap-1 px-3 py-2 text-xs ${isActive ? 'text-primary' : 'text-muted-foreground'}`
    }
  >
    <Icon size={20} />
    <span className="leading-none">{label}</span>
  </NavLink>
)

export default function BottomTabBar({ t }: { t: (k: string) => string }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 py-1">
        <Item to="/" icon={Home} label={t('nav:home')} />
        <Item to="/chat" icon={MessageSquare} label="Auri" />
        <Item to="/roleplay" icon={Users} label={t('nav:roleplay')} />
        <Item to="/crisis" icon={LifeBuoy} label={t('nav:crisis')} />
        <Item to="/profile" icon={User} label={t('nav:profile')} />
      </div>
    </nav>
  )
}