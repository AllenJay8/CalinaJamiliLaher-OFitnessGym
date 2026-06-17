import { Outlet } from 'react-router-dom';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import AppFooter from './AppFooter';
import { SidebarProvider } from '../contexts/SidebarContext';
import { HeaderProvider } from '../contexts/HeaderContext';

const LayoutContent = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppSidebar />
      <AppHeader />
      <main className="p-4 pt-20 pb-16 sm:ml-64">
        <Outlet />
      </main>
      <AppFooter />
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
