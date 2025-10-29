import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export interface Transfer {
  id: string;
  itemName: string;
  quantity: number;
  fromWarehouse: string;
  toWarehouse: string;
  status: 'Pending' | 'In Transit' | 'Completed' | 'Cancelled';
  requestedBy: string;
  requestedDate: string;
  completedDate?: string;
}

const initialTransfers: Transfer[] = [
  {
    id: 'TRF001',
    itemName: 'iPhone 15 Pro',
    quantity: 10,
    fromWarehouse: 'Main Warehouse',
    toWarehouse: 'Electronics Hub',
    status: 'In Transit',
    requestedBy: 'Manager',
    requestedDate: '2025-01-20',
  },
  {
    id: 'TRF002',
    itemName: 'Samsung Galaxy S24',
    quantity: 15,
    fromWarehouse: 'Tech Center',
    toWarehouse: 'Main Warehouse',
    status: 'Completed',
    requestedBy: 'Admin',
    requestedDate: '2025-01-18',
    completedDate: '2025-01-19',
  },
];

export const useTransfers = () => {
  const [transfers, setTransfers] = useState<Transfer[]>(() => {
    const stored = localStorage.getItem('transfers');
    return stored ? JSON.parse(stored) : initialTransfers;
  });

  useEffect(() => {
    localStorage.setItem('transfers', JSON.stringify(transfers));
  }, [transfers]);

  const addTransfer = (transfer: Omit<Transfer, 'id' | 'requestedDate'>) => {
    const newTransfer: Transfer = {
      ...transfer,
      id: `TRF${String(transfers.length + 1).padStart(3, '0')}`,
      requestedDate: new Date().toISOString().split('T')[0],
    };
    setTransfers([...transfers, newTransfer]);
    
    toast({
      title: "Transfer Created",
      description: `Transfer of ${transfer.quantity} ${transfer.itemName} from ${transfer.fromWarehouse} to ${transfer.toWarehouse} has been initiated.`,
    });
    
    return newTransfer;
  };

  const updateTransferStatus = (id: string, status: Transfer['status']) => {
    const transfer = transfers.find(t => t.id === id);
    
    setTransfers(transfers.map(t => 
      t.id === id 
        ? { 
            ...t, 
            status,
            completedDate: status === 'Completed' ? new Date().toISOString().split('T')[0] : t.completedDate
          }
        : t
    ));

    if (transfer) {
      toast({
        title: "Transfer Updated",
        description: `Transfer ${id} status changed to ${status}.`,
      });
    }
  };

  const deleteTransfer = (id: string) => {
    setTransfers(transfers.filter(t => t.id !== id));
  };

  return {
    transfers,
    addTransfer,
    updateTransferStatus,
    deleteTransfer,
  };
};