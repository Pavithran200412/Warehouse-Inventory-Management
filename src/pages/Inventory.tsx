import { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Upload, Download, Settings, Search, Filter, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useInventory, InventoryItem } from '@/hooks/useInventory';
import { InventoryDialog } from '@/components/inventory/InventoryDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
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

const Inventory = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const { items, addItem, updateItem, deleteItem } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [minStock, setMinStock] = useState('');
  const [maxStock, setMaxStock] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (location.state?.openAddDialog) {
      handleAddItem();
    }
    // Handle search query from URL
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [location]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesWarehouse = warehouseFilter === 'all' || item.warehouse === warehouseFilter;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesMinStock = !minStock || item.stock >= parseInt(minStock);
      const matchesMaxStock = !maxStock || item.stock <= parseInt(maxStock);
      return matchesSearch && matchesCategory && matchesWarehouse && matchesStatus && matchesMinStock && matchesMaxStock;
    });
  }, [items, searchQuery, categoryFilter, warehouseFilter, statusFilter, minStock, maxStock]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      'In Stock': 'default',
      'Low Stock': 'secondary',
      'Out of Stock': 'destructive',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const handleAddItem = () => {
    setDialogMode('add');
    setSelectedItem(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (item: InventoryItem) => {
    if (user?.role === 'staff') {
      toast({
        title: "Permission Denied",
        description: "Staff members cannot edit items",
        variant: "destructive",
      });
      return;
    }
    setDialogMode('edit');
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const handleSave = (itemData: Partial<InventoryItem>) => {
    if (dialogMode === 'add') {
      addItem(itemData as Omit<InventoryItem, 'id' | 'lastUpdated'>);
      toast({
        title: "Item Added",
        description: "New inventory item has been added successfully",
      });
    } else if (selectedItem) {
      updateItem(selectedItem.id, itemData);
      toast({
        title: "Item Updated",
        description: "Inventory item has been updated successfully",
      });
    }
  };

  const handleDeleteClick = (id: string) => {
    if (user?.role !== 'admin') {
      toast({
        title: "Permission Denied",
        description: "Only admins can delete items",
        variant: "destructive",
      });
      return;
    }
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteItem(itemToDelete);
      toast({
        title: "Item Deleted",
        description: "Inventory item has been deleted successfully",
      });
      setItemToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const handleImportCSV = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const csv = event.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        
        toast({
          title: "Import Complete",
          description: `Successfully imported ${lines.length - 1} items from CSV`,
        });
      };
      reader.readAsText(file);
    }
  };

  const handleExportCSV = () => {
    const csv = [
      ['Item ID', 'Name', 'Category', 'Stock', 'Status', 'Warehouse', 'Last Updated'],
      ...filteredItems.map(item => [
        item.id,
        item.name,
        item.category,
        item.stock,
        item.status,
        item.warehouse,
        item.lastUpdated,
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory-export.csv';
    a.click();
    
    toast({
      title: "Export Successful",
      description: "Inventory data has been exported to CSV",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Inventory Management</h1>
            <p className="text-muted-foreground">Manage your inventory items across all warehouses</p>
          </div>
          {user?.role !== 'staff' && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleImportCSV}>
                <Upload className="w-4 h-4 mr-2" />
                Import CSV
              </Button>
              <Button variant="secondary" onClick={handleExportCSV}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button onClick={handleAddItem}>
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categorys" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Electronics">Electronics</SelectItem>
              <SelectItem value="Clothing">Clothing</SelectItem>
              <SelectItem value="Books">Books</SelectItem>
              <SelectItem value="Furniture">Furniture</SelectItem>
            </SelectContent>
          </Select>
          <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Warehouses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Warehouses</SelectItem>
              <SelectItem value="Main Warehouse">Main Warehouse</SelectItem>
              <SelectItem value="Electronics Hub">Electronics Hub</SelectItem>
              <SelectItem value="Tech Center">Tech Center</SelectItem>
              <SelectItem value="Fashion Store">Fashion Store</SelectItem>
              <SelectItem value="Book Depot">Book Depot</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setFilterDialogOpen(true)}>
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ITEM ID</TableHead>
                <TableHead>NAME</TableHead>
                <TableHead>CATEGORY</TableHead>
                <TableHead>STOCK LEVEL</TableHead>
                <TableHead>WAREHOUSE</TableHead>
                <TableHead>LAST UPDATED</TableHead>
                <TableHead className="text-right">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{item.stock}</span>
                      {getStatusBadge(item.status)}
                    </div>
                  </TableCell>
                  <TableCell>{item.warehouse}</TableCell>
                  <TableCell>{item.lastUpdated}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {user?.role !== 'staff' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(item.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <InventoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        item={selectedItem}
        mode={dialogMode}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this inventory item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Advanced Filters</DialogTitle>
            <DialogDescription>Apply additional filters to refine your search</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="In Stock">In Stock</SelectItem>
                  <SelectItem value="Low Stock">Low Stock</SelectItem>
                  <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Stock</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={minStock}
                  onChange={(e) => setMinStock(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Stock</Label>
                <Input
                  type="number"
                  placeholder="999"
                  value={maxStock}
                  onChange={(e) => setMaxStock(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setStatusFilter('all');
                  setMinStock('');
                  setMaxStock('');
                }}
              >
                Clear Filters
              </Button>
              <Button onClick={() => setFilterDialogOpen(false)}>
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Inventory;