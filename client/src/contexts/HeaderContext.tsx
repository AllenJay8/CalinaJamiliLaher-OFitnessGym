import { createContext, useContext, useState, type FC, type ReactNode } from 'react';

type HeaderContextType = {
  title: string;
  setTitle: (title: string) => void;
};

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export const useHeader = () => {
  const context = useContext(HeaderContext);
  if (!context) throw new Error('useHeader must be used within a HeaderProvider');
  return context;
};

export const HeaderProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [title, setTitle] = useState('Dashboard');

  return (
    <HeaderContext.Provider value={{ title, setTitle }}>
      {children}
    </HeaderContext.Provider>
  );
};
