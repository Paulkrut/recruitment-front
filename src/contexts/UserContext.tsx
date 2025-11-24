'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiFetch } from '@/utils/api';

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';

interface User {
  name: string;
  phone: string;
  email?: string;
  position?: string;
}

interface Company {
  id: number;
  name: string;
  role: string;
}

interface Invite {
  id: number;
  company: {
    id: number;
    name: string;
  };
  role: string;
  email: string;
}

interface UserContextType {
  user: User | null;
  companies: Company[];
  invites: Invite[];
  currentCompany: Company | null;
  isLoading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  refreshCompanies: () => Promise<void>;
  refreshInvites: () => Promise<void>;
  setCurrentCompany: (company: Company | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = async () => {
    try {
      const response = await apiFetch(`${API_BASE}/api/user/me`);
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (err) {
      console.error('Error loading user:', err);
    }
  };

  const refreshCompanies = async () => {
    try {
      const response = await apiFetch(`${API_BASE}/api/user/companies`);
      if (response.ok) {
        const companiesData = await response.json();
        console.log('UserContext: Загружены компании:', companiesData);
        setCompanies(companiesData);

        if (!currentCompany && companiesData.length > 0) {
          const storedCompanyId = localStorage.getItem('current_company');
          console.log('UserContext: Сохраненная компания в localStorage:', storedCompanyId);

          if (storedCompanyId) {
            const storedCompany = companiesData.find((c: Company) => c.id === Number(storedCompanyId));
            if (storedCompany) {
              console.log('UserContext: Найдена сохраненная компания:', storedCompany.name);
              setCurrentCompany(storedCompany);
            } else {
              // Если сохраненная компания не найдена
              if (companiesData.length === 1) {
                // Если компания одна - выбираем её автоматически
                const firstCompany = companiesData[0];
                console.log('UserContext: Сохраненная компания не найдена, но компания одна - выбираем:', firstCompany.name);
                setCurrentCompany(firstCompany);
                localStorage.setItem('current_company', firstCompany.id.toString());
              } else {
                // Если компаний несколько - НЕ выбираем автоматически, пусть пользователь выберет
                console.log('UserContext: Компаний несколько, сохраненная не найдена - не выбираем автоматически');
              }
            }
          } else {
            // Если нет сохраненной компании
            if (companiesData.length === 1) {
              // Если компания одна - выбираем её автоматически
              const firstCompany = companiesData[0];
              console.log('UserContext: Нет сохраненной компании, но компания одна - выбираем:', firstCompany.name);
              setCurrentCompany(firstCompany);
              localStorage.setItem('current_company', firstCompany.id.toString());
            } else {
              // Если компаний несколько - НЕ выбираем автоматически, пусть пользователь выберет
              console.log('UserContext: Компаний несколько, нет сохраненной - не выбираем автоматически');
            }
          }
        }
      }
    } catch (err) {
      console.error('Error loading companies:', err);
    }
  };

  const refreshInvites = async () => {
    try {
      const response = await apiFetch(`${API_BASE}/api/user/invites`);
      if (response.ok) {
        const invitesData = await response.json();
        setInvites(invitesData);
      }
    } catch (err) {
      console.error('Error loading invites:', err);
    }
  };

  const handleSetCurrentCompany = (company: Company | null) => {
    console.log('UserContext: Устанавливаем текущую компанию:', company?.name || 'null');
    setCurrentCompany(company);
    if (company) {
      localStorage.setItem('current_company', company.id.toString());
      localStorage.setItem('currentCompanyId', company.id.toString()); // Для совместимости
      console.log('UserContext: Сохранена компания в localStorage:', company.id);
    } else {
      localStorage.removeItem('current_company');
      localStorage.removeItem('currentCompanyId'); // Для совместимости
      console.log('UserContext: Удалена компания из localStorage');
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        await Promise.all([
          refreshUser(),
          refreshCompanies()
        ]);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    const token = localStorage.getItem('recruitment_token');
    if (token) {
      loadInitialData();
    } else {
      setIsLoading(false);
    }
  }, []);

  const value: UserContextType = {
    user,
    companies,
    invites,
    currentCompany,
    isLoading,
    error,
    refreshUser,
    refreshCompanies,
    refreshInvites,
    setCurrentCompany: handleSetCurrentCompany,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
