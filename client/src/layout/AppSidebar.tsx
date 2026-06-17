import {
  LayoutDashboard,
  Users,
  CreditCard,
  ClipboardCheck,
  FileText,
  Bell,
  Webhook,
  Dumbbell,
  LogOut,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useSidebar } from '../contexts/SidebarContext';
import { useAuth } from '../contexts/AuthContext';

const AppSidebar = () => {
  const { isOpen, toggleSidebar, closeSidebar } = useSidebar();
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();

  const staffItems = [
    { path: '/dashboard', text: 'Dashboard', icon: LayoutDashboard },
    { path: '/members', text: 'Members', icon: Users },
    { path: '/membership-plans', text: 'Membership Plans', icon: Dumbbell },
    { path: '/attendance', text: 'Attendance', icon: ClipboardCheck },
    { path: '/payments', text: 'Payments', icon: CreditCard },
    { path: '/notifications', text: 'Notifications', icon: Bell },
  ];

  const adminItems = [
    { path: '/reports', text: 'Reports', icon: FileText },
    { path: '/webhooks', text: 'Webhooks', icon: Webhook },
  ];

  const sidebarItems = isAdmin ? [...staffItems, ...adminItems] : staffItems;

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-x-0 top-16 bottom-12 z-30 bg-gray-900/50 sm:hidden"
          onClick={toggleSidebar}
        />
      )}
      <aside
        className={`fixed top-0 bottom-12 left-0 z-40 flex w-64 flex-col border-r border-[#EAB308] bg-[#FACC15] transition-transform duration-200 ease-in-out sm:bottom-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } sm:translate-x-0`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-[#EAB308] px-4">
          <Dumbbell className="h-8 w-8 text-[#111827]" />
          <div>
            <h1 className="text-sm font-bold text-[#111827]">OFitness Gym</h1>
            <p className="text-[10px] leading-tight text-[#111827]/70">Management System</p>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col justify-between overflow-y-auto bg-[#FACC15] px-3 py-4">
          <ul className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={closeSidebar}
                    className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'bg-white text-[#111827] shadow-sm'
                        : 'text-[#111827]/80 hover:bg-white/60 hover:text-[#111827]'
                    }`}
                  >
                    <Icon size={18} />
                    {item.text}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 border-t border-[#EAB308] bg-[#FACC15] pt-4">
            <div className="mb-3 rounded-lg border border-[#EAB308]/40 bg-white/50 px-3 py-2">
              <p className="text-sm font-medium text-[#111827]">{user?.name}</p>
              <p className="text-xs capitalize text-[#111827]/70">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-700 hover:bg-white/60"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
