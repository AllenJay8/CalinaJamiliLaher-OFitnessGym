import { Outlet } from 'react-router-dom';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import { SidebarProvider } from '../contexts/SidebarContext';
import { HeaderProvider } from '../contexts/HeaderContext';

const LayoutContent = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppSidebar />
      <AppHeader />
      <main className="p-4 pt-20 sm:ml-64">
        <Outlet />
      </main>
    </div>
  );
};

const AppLayout = () => {
  return (
    <HeaderProvider>
      <SidebarProvider>
        <LayoutContent />
      </SidebarProvider>
    </HeaderProvider>
  );
};

export default AppLayout;
