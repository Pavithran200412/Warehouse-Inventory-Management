import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWarehouses } from '@/hooks/useWarehouses';
import { useAuth } from '@/contexts/AuthContext';

interface TransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (transfer: any) => void;
}

export const TransferDialog = ({ open, onOpenChange, onSave }: TransferDialogProps) => {
  const { warehouses } = useWarehouses();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    itemName: '',
    quantity: 1,
    fromWarehouse: '',
    toWarehouse: '',
    status: 'Pending' as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      requestedBy: user?.role || 'Unknown',
    });
    setFormData({
      itemName: '',
      quantity: 1,
      fromWarehouse: '',
      toWarehouse: '',
      status: 'Pending',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Stock Transfer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="itemName">Item Name</Label>
              <Input
                id="itemName"
                value={formData.itemName}
                onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                placeholder="Enter item name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                min="1"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fromWarehouse">From Warehouse</Label>
                <Select 
                  value={formData.fromWarehouse} 
                  onValueChange={(value) => setFormData({ ...formData, fromWarehouse: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.filter(wh => wh.id !== formData.toWarehouse).map((wh) => (
                      <SelectItem key={wh.id} value={wh.name}>{wh.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="toWarehouse">To Warehouse</Label>
                <Select 
                  value={formData.toWarehouse} 
                  onValueChange={(value) => setFormData({ ...formData, toWarehouse: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.filter(wh => wh.name !== formData.fromWarehouse).map((wh) => (
                      <SelectItem key={wh.id} value={wh.name}>{wh.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Transfer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};