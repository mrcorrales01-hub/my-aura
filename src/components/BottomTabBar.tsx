import { NavLink } from 'react-router-dom'
import { Home, MessageSquare, Users, LifeBuoy, User } from 'lucide-react'

const Item = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex flex-col items-center justify-center gap-1 px-3 py-2 text-xs transition-all duration-200 ${
        isActive 
          ? 'text-primary font-medium' 
          : 'text-muted-foreground hover:text-foreground hover:scale-105'
      }`
    }
  >
    {({ isActive }) => (
      <>
        <div className={`relative ${isActive ? 'drop-shadow-sm' : ''}`}>
          <Icon className={`h-5 w-5 ${isActive ? 'stroke-2 drop-shadow-[0_0_8px_hsl(var(--primary))]' : 'stroke-1.5'}`} />
        </div>
        <span className="leading-none">{label}</span>
      </>
    )}
  </NavLink>
)

export default function BottomTabBar({ t }: { t: (k: string) => string }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-md border-t border-border/50 z-30 md:hidden">
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