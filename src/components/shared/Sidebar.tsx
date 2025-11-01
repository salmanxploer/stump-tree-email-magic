import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, ShoppingBag, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types';

interface SidebarProps {
  role: UserRole;
}

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const location = useLocation();

  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/foods', icon: UtensilsCrossed, label: 'Food Management' },
    { to: '/admin/orders', icon: ShoppingBag, label: 'All Orders' },
  ];

  const staffLinks = [
    { to: '/staff/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  ];

  const customerLinks = [
    { to: '/customer/menu', icon: UtensilsCrossed, label: 'Menu' },
    { to: '/customer/orders', icon: ShoppingBag, label: 'My Orders' },
  ];

  const links =
    role === 'admin' ? adminLinks :
    role === 'staff' ? staffLinks :
    customerLinks;

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-white dark:bg-gray-800 p-4">
      <nav className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;
          
          return (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
