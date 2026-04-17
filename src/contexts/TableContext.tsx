import React, { createContext, useContext, useState, useEffect } from 'react';

interface TableSession {
  tableId: string;
  tableNumber: string;
  qrToken: string;
}

interface TableContextType {
  session: TableSession | null;
  setSession: (session: TableSession) => void;
  clearSession: () => void;
  isLoading: boolean;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

export const TableProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSessionState] = useState<TableSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Rehydrate session from localStorage
    const savedSession = localStorage.getItem('pos_table_session');
    if (savedSession) {
      try {
        setSessionState(JSON.parse(savedSession));
      } catch (e) {
        console.error('Failed to parse saved table session', e);
        localStorage.removeItem('pos_table_session');
      }
    }
    setIsLoading(false);
  }, []);

  const setSession = (newSession: TableSession) => {
    setSessionState(newSession);
    localStorage.setItem('pos_table_session', JSON.stringify(newSession));
  };

  const clearSession = () => {
    setSessionState(null);
    localStorage.removeItem('pos_table_session');
  };

  return (
    <TableContext.Provider value={{ session, setSession, clearSession, isLoading }}>
      {children}
    </TableContext.Provider>
  );
};

export const useTable = () => {
  const context = useContext(TableContext);
  if (context === undefined) {
    throw new Error('useTable must be used within a TableProvider');
  }
  return context;
};
