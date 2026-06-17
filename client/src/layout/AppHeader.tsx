import { Menu } from 'lucide-react';
import { useSidebar } from '../contexts/SidebarContext';
import { useHeader } from '../contexts/HeaderContext';

const AppHeader = () => {
  const { toggleSidebar } = useSidebar();
  const { title } = useHeader();

  return (
    <header className="fixed top-0 right-0 left-0 z-30 h-16 border-b border-gray-200 bg-white sm:left-64">
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 sm:hidden"
          >
            <Menu size={20} />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-[#111827]">{title}</h2>
            <p className="hidden text-xs text-gray-500 sm:block">OFitness Gym Management System</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
