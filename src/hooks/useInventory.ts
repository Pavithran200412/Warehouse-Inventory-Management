import { useState, useEffect } from 'react';

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  warehouse: string;
  lastUpdated: string;
  minStock?: number;
  price?: number;
}

const initialInventory: InventoryItem[] = [
  {
    id: 'INV001',
    name: 'iPhone 15 Pro',
    category: 'Electronics',
    stock: 45,
    status: 'In Stock',
    warehouse: 'Main Warehouse',
    lastUpdated: '2025-01-15',
    minStock: 10,
    price: 999,
  },
  {
    id: 'INV002',
    name: 'Samsung Galaxy S24',
    category: 'Electronics',
    stock: 8,
    status: 'Low Stock',
    warehouse: 'Electronics Hub',
    lastUpdated: '2025-01-14',
    minStock: 10,
    price: 899,
  },
  {
    id: 'INV003',
    name: 'MacBook Air M2',
    category: 'Electronics',
    stock: 0,
    status: 'Out of Stock',
    warehouse: 'Tech Center',
    lastUpdated: '2025-01-13',
    minStock: 5,
    price: 1199,
  },
  {
    id: 'INV004',
    name: 'Nike Air Force 1',
    category: 'Clothing',
    stock: 125,
    status: 'In Stock',
    warehouse: 'Fashion Store',
    lastUpdated: '2025-01-12',
    minStock: 20,
    price: 110,
  },
  {
    id: 'INV005',
    name: 'The Great Gatsby',
    category: 'Books',
    stock: 67,
    status: 'In Stock',
    warehouse: 'Book Depot',
    lastUpdated: '2025-01-11',
    minStock: 15,
    price: 15,
  },
];

export const useInventory = () => {
  const [items, setItems] = useState<InventoryItem[]>(() => {
    const stored = localStorage.getItem('inventory_items');
    return stored ? JSON.parse(stored) : initialInventory;
  });

  useEffect(() => {
    localStorage.setItem('inventory_items', JSON.stringify(items));
  }, [items]);

  const addItem = (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: `INV${String(items.length + 1).padStart(3, '0')}`,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setItems([...items, newItem]);
    return newItem;
  };

  const updateItem = (id: string, updates: Partial<InventoryItem>) => {
    setItems(items.map(item => 
      item.id === id 
        ? { ...item, ...updates, lastUpdated: new Date().toISOString().split('T')[0] }
        : item
    ));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const getItemById = (id: string) => items.find(item => item.id === id);

  return {
    items,
    addItem,
    updateItem,
    deleteItem,
    getItemById,
  };
};