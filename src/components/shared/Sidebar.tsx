import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, ShoppingBag, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types';
import { motion } from 'framer-motion';

interface SidebarProps {
  role: UserRole;
}

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const location = useLocation();

  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/foods', icon: UtensilsCrossed, label: 'Food Management' },
    { to: '/admin/orders', icon: ShoppingBag, label: 'All Orders' },
    { to: '/admin/users', icon: Users, label: 'User Management' },
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
    <aside className="hidden md:flex w-64 flex-col border-r bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-4">
      <nav className="space-y-2">
        {links.map((link, index) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;
          
          return (
            <motion.div
              key={link.to}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={link.to}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden',
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className={cn("h-5 w-5 relative z-10 transition-transform group-hover:scale-110", isActive && "animate-pulse")} />
                <span className="font-medium relative z-10">{link.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
