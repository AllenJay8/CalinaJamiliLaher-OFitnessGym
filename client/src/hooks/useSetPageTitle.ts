import { useEffect } from 'react';
import { useHeader } from '../contexts/HeaderContext';

export const useSetPageTitle = (title: string) => {
  const { setTitle } = useHeader();
  useEffect(() => {
    setTitle(title);
  }, [title, setTitle]);
};
