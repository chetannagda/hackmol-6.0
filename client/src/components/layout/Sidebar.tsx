import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  CreditCard, 
  ArrowRightLeft, 
  Wallet, 
  UserCog, 
  LogOut, 
  Menu, 
  X, 
  ShieldCheck 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ 
  href, 
  icon, 
  label, 
  active, 
  onClick 
}) => {
  return (
    <li>
      <Link href={href}>
        <a
          className={cn(
            "flex items-center py-2 px-4 text-gray-700 hover:bg-gray-100 hover:text-primary rounded-md group",
            active && "bg-gray-100 text-primary"
          )}
          onClick={onClick}
        >
          {icon}
          <span className="ml-3">{label}</span>
        </a>
      </Link>
    </li>
  );
};

export default function Sidebar() {
  const [location] = useLocation();
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  const sidebarLinks = [
    { href: '/dashboard', icon: <LayoutDashboard className="mr-3 h-5 w-5" />, label: 'Dashboard' },
    { href: '/payments', icon: <CreditCard className="mr-3 h-5 w-5" />, label: 'Payments' },
    { href: '/transactions', icon: <ArrowRightLeft className="mr-3 h-5 w-5" />, label: 'Transactions' },
    { href: '/wallet', icon: <Wallet className="mr-3 h-5 w-5" />, label: 'Wallet' },
    { href: '/profile', icon: <UserCog className="mr-3 h-5 w-5" />, label: 'Profile' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 bg-white shadow-md max-h-screen w-60 hidden lg:block">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-20 border-b">
            <div className="flex items-center">
              <ShieldCheck className="h-8 w-8 text-primary mr-2" />
              <h1 className="text-xl font-bold text-gray-800">DFPG</h1>
            </div>
          </div>
          
          <nav className="flex-grow p-4">
            <ul className="space-y-1">
              {sidebarLinks.map((link) => (
                <SidebarLink
                  key={link.href}
                  href={link.href}
                  icon={link.icon}
                  label={link.label}
                  active={location === link.href}
                />
              ))}
            </ul>
          </nav>
          
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className="flex items-center w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </aside>
      
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white shadow-md sticky top-0 z-10">
        <div className="flex items-center">
          <ShieldCheck className="h-6 w-6 text-primary mr-2" />
          <h1 className="text-lg font-bold text-gray-800">DFPG</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
          <Menu className="h-6 w-6" />
        </Button>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-gray-900 bg-opacity-50 z-20 flex">
          <div className="bg-white h-full w-64 shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center">
                <ShieldCheck className="h-6 w-6 text-primary mr-2" />
                <h1 className="text-lg font-bold text-gray-800">DFPG</h1>
              </div>
              <Button variant="ghost" size="icon" onClick={closeMobileMenu}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            
            <nav className="p-4">
              <ul className="space-y-1">
                {sidebarLinks.map((link) => (
                  <SidebarLink
                    key={link.href}
                    href={link.href}
                    icon={link.icon}
                    label={link.label}
                    active={location === link.href}
                    onClick={closeMobileMenu}
                  />
                ))}
              </ul>
            </nav>
            
            <div className="p-4 border-t mt-auto">
              <Button
                variant="ghost"
                className="flex items-center w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="mr-3 h-5 w-5" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
