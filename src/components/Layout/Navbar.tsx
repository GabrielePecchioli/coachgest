import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu } from '@headlessui/react';
import { LogOut, ChevronDown } from 'lucide-react';
import { auth } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

export function Navbar() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Errore durante il logout:', error);
    }
  };

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="text-xl font-semibold text-gray-900">CoachGest</div>
          
          {currentUser && (
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <span>{currentUser.nome} {currentUser.cognome}</span>
                <ChevronDown className="h-4 w-4" />
              </Menu.Button>

              <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Menu>
          )}
        </div>
      </div>
    </nav>
  );
}