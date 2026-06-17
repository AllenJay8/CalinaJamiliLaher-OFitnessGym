const AppFooter = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="fixed right-0 bottom-0 left-0 z-20 border-t border-[#EAB308] bg-[#FACC15] sm:left-64">
      <div className="flex h-12 items-center justify-between px-4 text-sm text-[#111827]">
        <p className="font-medium">OFitness Gym Management System</p>
        <p className="text-xs text-[#111827]/70">&copy; {year} OFitness Gym. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default AppFooter;
