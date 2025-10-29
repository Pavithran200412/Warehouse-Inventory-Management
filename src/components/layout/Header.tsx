import { Bell, User, LogOut, Package, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useTransfers } from '@/hooks/useTransfers';
import { useInventory } from '@/hooks/useInventory';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { transfers } = useTransfers();
  const { items } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');

  // Get recent transfers (last 5) - only for admin and manager
  const recentTransfers = user?.role !== 'staff' ? transfers.slice(-5).reverse() : [];
  
  // Get low stock items
  const lowStockItems = items.filter(item => 
    item.status === 'Low Stock' || item.status === 'Out of Stock'
  );
  
  const totalNotifications = recentTransfers.length + lowStockItems.length;

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/inventory?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 fixed top-0 right-0 left-64 z-10">
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <Input
          type="search"
          placeholder="Search inventory..."
          className="w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {totalNotifications > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  variant="destructive"
                >
                  {totalNotifications}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <ScrollArea className="h-[400px]">
              {totalNotifications === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No notifications
                </div>
              ) : (
                <>
                  {lowStockItems.length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                        Low Stock Alerts
                      </div>
                      {lowStockItems.map((item) => (
                        <DropdownMenuItem 
                          key={item.id}
                          className="flex items-start gap-3 p-3 cursor-pointer"
                          onClick={() => navigate('/inventory')}
                        >
                          <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.status} - Only {item.stock} units left in {item.warehouse}
                            </p>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
                  
                  {recentTransfers.length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                        Recent Transfers
                      </div>
                      {recentTransfers.map((transfer) => (
                        <DropdownMenuItem 
                          key={transfer.id}
                          className="flex items-start gap-3 p-3 cursor-pointer"
                          onClick={() => navigate('/transfers')}
                        >
                          <Package className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium">{transfer.itemName}</p>
                            <p className="text-xs text-muted-foreground">
                              {transfer.quantity} units • {transfer.fromWarehouse} → {transfer.toWarehouse}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Status: {transfer.status}
                            </p>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
                </>
              )}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-medium capitalize">{user?.role}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-semibold">{user?.name}</span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;