import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Search, Filter, Eye, Edit, Trash2, MapPin, Package } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useWarehouses, Warehouse } from '@/hooks/useWarehouses';
import { WarehouseDialog } from '@/components/warehouse/WarehouseDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const Warehouses = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { warehouses, addWarehouse, updateWarehouse, deleteWarehouse } = useWarehouses();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [warehouseToDelete, setWarehouseToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const filteredWarehouses = warehouses.filter(wh => {
    const matchesSearch = wh.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wh.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wh.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || wh.status === filterStatus;
    const matchesLocation = filterLocation === 'all' || wh.location === filterLocation;
    
    return matchesSearch && matchesStatus && matchesLocation;
  });

  const uniqueLocations = Array.from(new Set(warehouses.map(wh => wh.location)));

  const clearFilters = () => {
    setFilterStatus('all');
    setFilterLocation('all');
  };

  const getStatusBadge = (status: string) => {
    return status === 'Active' ? (
      <Badge className="bg-green-500">{status}</Badge>
    ) : (
      <Badge variant="secondary">{status}</Badge>
    );
  };

  const handleAddWarehouse = () => {
    setDialogMode('add');
    setSelectedWarehouse(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (warehouse: Warehouse) => {
    if (user?.role === 'staff') {
      toast({
        title: "Permission Denied",
        description: "Staff members cannot edit warehouses",
        variant: "destructive",
      });
      return;
    }
    setDialogMode('edit');
    setSelectedWarehouse(warehouse);
    setDialogOpen(true);
  };

  const handleSave = (warehouseData: Partial<Warehouse>) => {
    if (dialogMode === 'add') {
      addWarehouse(warehouseData as Omit<Warehouse, 'id'>);
      toast({
        title: "Warehouse Added",
        description: "New warehouse has been added successfully",
      });
    } else if (selectedWarehouse) {
      updateWarehouse(selectedWarehouse.id, warehouseData);
      toast({
        title: "Warehouse Updated",
        description: "Warehouse has been updated successfully",
      });
    }
  };

  const handleDeleteClick = (id: string) => {
    if (user?.role !== 'admin') {
      toast({
        title: "Permission Denied",
        description: "Only admins can delete warehouses",
        variant: "destructive",
      });
      return;
    }
    setWarehouseToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (warehouseToDelete) {
      deleteWarehouse(warehouseToDelete);
      toast({
        title: "Warehouse Deleted",
        description: "Warehouse has been deleted successfully",
      });
      setWarehouseToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Warehouse Management</h1>
            <p className="text-muted-foreground">Manage your warehouse locations and monitor capacity</p>
          </div>
          {user?.role === 'admin' && (
            <Button onClick={handleAddWarehouse}>
              <Plus className="w-4 h-4 mr-2" />
              Add Warehouse
            </Button>
          )}
        </div>

        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search warehouses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
                {(filterStatus !== 'all' || filterLocation !== 'all') && (
                  <Badge variant="secondary" className="ml-2">
                    Active
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Warehouses</SheetTitle>
                <SheetDescription>
                  Apply filters to narrow down your warehouse search
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-6 mt-6">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Location</Label>
                  <Select value={filterLocation} onValueChange={setFilterLocation}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {uniqueLocations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button onClick={clearFilters} variant="outline" className="flex-1">
                    Clear Filters
                  </Button>
                  <Button onClick={() => setFilterSheetOpen(false)} className="flex-1">
                    Apply Filters
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>WAREHOUSE ID</TableHead>
                <TableHead>NAME</TableHead>
                <TableHead>LOCATION</TableHead>
                <TableHead>CAPACITY</TableHead>
                <TableHead>CURRENT STOCK</TableHead>
                <TableHead>UTILIZATION</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead className="text-right">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWarehouses.map((warehouse) => (
                <TableRow key={warehouse.id}>
                  <TableCell className="font-medium">{warehouse.id}</TableCell>
                  <TableCell>{warehouse.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      {warehouse.location}
                    </div>
                  </TableCell>
                  <TableCell>{warehouse.capacity}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold">{warehouse.currentStock} items</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={warehouse.utilization} 
                          className="w-24 h-2"
                        />
                        <span className="text-sm font-semibold">{warehouse.utilization}%</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(warehouse.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {user?.role !== 'staff' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(warehouse)}
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Button>
                      )}
                      {user?.role === 'admin' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(warehouse.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <WarehouseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        warehouse={selectedWarehouse}
        mode={dialogMode}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this warehouse.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Warehouses;