import { useState, useEffect } from 'react';

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  capacity: string;
  currentStock: number;
  utilization: number;
  status: 'Active' | 'Maintenance' | 'Inactive';
}

const initialWarehouses: Warehouse[] = [
  {
    id: 'WH001',
    name: 'Main Warehouse',
    location: 'New York, NY',
    capacity: '50,000 sq ft',
    currentStock: 1247,
    utilization: 85,
    status: 'Active',
  },
  {
    id: 'WH002',
    name: 'Electronics Hub',
    location: 'Los Angeles, CA',
    capacity: '30,000 sq ft',
    currentStock: 892,
    utilization: 72,
    status: 'Active',
  },
  {
    id: 'WH003',
    name: 'Tech Center',
    location: 'Austin, TX',
    capacity: '25,000 sq ft',
    currentStock: 456,
    utilization: 45,
    status: 'Active',
  },
  {
    id: 'WH004',
    name: 'Fashion Store',
    location: 'Miami, FL',
    capacity: '20,000 sq ft',
    currentStock: 678,
    utilization: 68,
    status: 'Maintenance',
  },
  {
    id: 'WH005',
    name: 'Book Depot',
    location: 'Chicago, IL',
    capacity: '15,000 sq ft',
    currentStock: 234,
    utilization: 32,
    status: 'Active',
  },
];

export const useWarehouses = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>(() => {
    const stored = localStorage.getItem('warehouses');
    return stored ? JSON.parse(stored) : initialWarehouses;
  });

  useEffect(() => {
    localStorage.setItem('warehouses', JSON.stringify(warehouses));
  }, [warehouses]);

  const addWarehouse = (warehouse: Omit<Warehouse, 'id'>) => {
    const newWarehouse: Warehouse = {
      ...warehouse,
      id: `WH${String(warehouses.length + 1).padStart(3, '0')}`,
    };
    setWarehouses([...warehouses, newWarehouse]);
    return newWarehouse;
  };

  const updateWarehouse = (id: string, updates: Partial<Warehouse>) => {
    setWarehouses(warehouses.map(wh => 
      wh.id === id ? { ...wh, ...updates } : wh
    ));
  };

  const deleteWarehouse = (id: string) => {
    setWarehouses(warehouses.filter(wh => wh.id !== id));
  };

  return {
    warehouses,
    addWarehouse,
    updateWarehouse,
    deleteWarehouse,
  };
};