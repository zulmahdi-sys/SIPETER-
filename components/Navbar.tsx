
import React from 'react';
import { ViewState } from '../types';
import { Menu, Wrench, X, Car, Building2 } from 'lucide-react';

interface NavbarProps {
  currentView: ViewState;
  changeView: (view: ViewState) => void;
  isLoggedIn: boolean;
  logout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, changeView, isLoggedIn, logout }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const navClass = (view: ViewState) =>
    `relative px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer overflow-hidden group ${
      currentView === view
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
        : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
    }`;

  const handleNav = (view: ViewState) => {
    changeView(view);
    setIsOpen(false);
  };

  return (
    <nav className="fixed w-full z-50 top-0 transition-all duration-300">
      <div className="absolute inset-0 glass shadow-sm"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center cursor-pointer group" onClick={() => handleNav('HOME')}>
            <div className="relative w-10 h-10 mr-3 flex items-center justify-center bg-blue-600 rounded-xl shadow-lg shadow-blue-500/40 group-hover:scale-110 transition-transform duration-300">
              <Wrench className="h-6 w-6 text-white animate-spin-slow" style={{ animationDuration: '10s' }} />
            </div>
            <span className="font-extrabold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-cyan-500 tracking-tight">SIPETER</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2">
            <button onClick={() => handleNav('HOME')} className={navClass('HOME')}>Home</button>
            <button onClick={() => handleNav('ABOUT')} className={navClass('ABOUT')}>About</button>
            <button onClick={() => handleNav('VEHICLE_USAGE')} className={navClass('VEHICLE_USAGE')}>
                   <span className="flex items-center"><Car className="w-4 h-4 mr-1"/> Kendaraan</span>
            </button>
            <button onClick={() => handleNav('BUILDING_USAGE')} className={navClass('BUILDING_USAGE')}>
                   <span className="flex items-center"><Building2 className="w-4 h-4 mr-1"/> Gedung</span>
            </button>
            
            {isLoggedIn && (
              <>
                <button onClick={() => handleNav('DASHBOARD')} className={navClass('DASHBOARD')}>Dashboard</button>
                <button onClick={() => handleNav('RECAP')} className={navClass('RECAP')}>Rekap</button>
              </>
            )}

            {isLoggedIn ? (
              <button
                onClick={() => { logout(); handleNav('HOME'); }}
                className="ml-4 px-6 py-2.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-red-500 to-pink-600 shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transform hover:-translate-y-0.5 transition-all duration-300"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => handleNav('LOGIN')}
                className="ml-4 px-6 py-2.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transform hover:-translate-y-0.5 transition-all duration-300"
              >
                Login Admin
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-blue-600 hover:bg-gray-100 focus:outline-none"
            >
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute w-full glass border-t border-gray-100">
          <div className="px-4 pt-2 pb-4 space-y-2">
            <button onClick={() => handleNav('HOME')} className={`block w-full text-left ${navClass('HOME')}`}>Home</button>
            <button onClick={() => handleNav('ABOUT')} className={`block w-full text-left ${navClass('ABOUT')}`}>About</button>
            <button onClick={() => handleNav('VEHICLE_USAGE')} className={`block w-full text-left ${navClass('VEHICLE_USAGE')}`}>Kendaraan</button>
            <button onClick={() => handleNav('BUILDING_USAGE')} className={`block w-full text-left ${navClass('BUILDING_USAGE')}`}>Gedung</button>
            
            {isLoggedIn && (
              <>
                <button onClick={() => handleNav('DASHBOARD')} className={`block w-full text-left ${navClass('DASHBOARD')}`}>Dashboard</button>
                <button onClick={() => handleNav('RECAP')} className={`block w-full text-left ${navClass('RECAP')}`}>Rekap</button>
              </>
            )}

            {isLoggedIn ? (
               <button onClick={() => { logout(); setIsOpen(false); }} className="block w-full text-left px-4 py-3 text-red-600 font-bold bg-red-50 rounded-xl mt-2">Logout</button>
            ) : (
               <button onClick={() => handleNav('LOGIN')} className="block w-full text-left px-4 py-3 text-blue-600 font-bold bg-blue-50 rounded-xl mt-2">Login Admin</button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
