import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTransfers, Transfer } from '@/hooks/useTransfers';
import { TransferDialog } from '@/components/transfer/TransferDialog';
import { useAuth } from '@/contexts/AuthContext';

const Transfers = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { transfers, addTransfer, updateTransferStatus } = useTransfers();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Redirect staff users away from this page
  useEffect(() => {
    if (user && user.role === 'staff') {
      navigate('/dashboard');
      toast({
        title: "Access Denied",
        description: "You don't have permission to view transfers",
        variant: "destructive",
      });
    }
  }, [user, navigate, toast]);

  const handleNewTransfer = () => {
    setDialogOpen(true);
  };

  const handleSaveTransfer = (transferData: any) => {
    addTransfer(transferData);
    toast({
      title: "Transfer Created",
      description: "New stock transfer has been created successfully",
    });
  };

  const handleStatusChange = (id: string, status: Transfer['status']) => {
    updateTransferStatus(id, status);
    toast({
      title: "Status Updated",
      description: `Transfer status changed to ${status}`,
    });
  };

  const getStatusBadge = (status: Transfer['status']) => {
    const variants: Record<Transfer['status'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'Pending': 'secondary',
      'In Transit': 'default',
      'Completed': 'outline',
      'Cancelled': 'destructive',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Stock Transfers</h1>
            <p className="text-muted-foreground">Manage inventory transfers between warehouses</p>
          </div>
          <Button onClick={handleNewTransfer}>
            <Plus className="w-4 h-4 mr-2" />
            New Transfer
          </Button>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>TRANSFER ID</TableHead>
                <TableHead>ITEM</TableHead>
                <TableHead>QUANTITY</TableHead>
                <TableHead>ROUTE</TableHead>
                <TableHead>REQUESTED BY</TableHead>
                <TableHead>DATE</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead className="text-right">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfers.map((transfer) => (
                <TableRow key={transfer.id}>
                  <TableCell className="font-medium">{transfer.id}</TableCell>
                  <TableCell>{transfer.itemName}</TableCell>
                  <TableCell className="font-semibold">{transfer.quantity}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{transfer.fromWarehouse}</span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{transfer.toWarehouse}</span>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{transfer.requestedBy}</TableCell>
                  <TableCell>{transfer.requestedDate}</TableCell>
                  <TableCell>{getStatusBadge(transfer.status)}</TableCell>
                  <TableCell className="text-right">
                    <Select
                      value={transfer.status}
                      onValueChange={(value: Transfer['status']) => handleStatusChange(transfer.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In Transit">In Transit</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <TransferDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveTransfer}
      />
    </DashboardLayout>
  );
};

export default Transfers;