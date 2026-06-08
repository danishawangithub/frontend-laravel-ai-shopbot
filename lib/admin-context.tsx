'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  total: number;
  status: 'Pending' | 'Shipped' | 'Delivered';
  items: number;
  date: string;
  address: string;
  city: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  joinDate: string;
  lastOrder: string;
}

interface AdminContextType {
  orders: Order[];
  customers: Customer[];
  addOrder: (order: Order) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  addCustomer: (customer: Customer) => void;
  getAdminStats: () => { totalOrders: number; totalRevenue: number; totalCustomers: number; pendingOrders: number };
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedOrders = localStorage.getItem('admin_orders');
    const savedCustomers = localStorage.getItem('admin_customers');

    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    } else {
      // Initialize with sample data
      const sampleOrders: Order[] = [
        {
          id: '1',
          orderNumber: 'ORD-001',
          customerName: 'Ayesha Khan',
          customerEmail: 'ayesha@example.com',
          customerPhone: '03001234567',
          total: 4500,
          status: 'Delivered',
          items: 2,
          date: '2025-05-10',
          address: 'House 123, Street 5',
          city: 'Karachi',
        },
        {
          id: '2',
          orderNumber: 'ORD-002',
          customerName: 'Fatima Ali',
          customerEmail: 'fatima@example.com',
          customerPhone: '03009876543',
          total: 3200,
          status: 'Shipped',
          items: 1,
          date: '2025-05-12',
          address: 'Apartment 45',
          city: 'Lahore',
        },
        {
          id: '3',
          orderNumber: 'ORD-003',
          customerName: 'Zainab Hassan',
          customerEmail: 'zainab@example.com',
          customerPhone: '03104567890',
          total: 5800,
          status: 'Pending',
          items: 3,
          date: '2025-05-14',
          address: 'Block C, Plaza',
          city: 'Islamabad',
        },
      ];
      setOrders(sampleOrders);
      localStorage.setItem('admin_orders', JSON.stringify(sampleOrders));
    }

    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers));
    } else {
      // Initialize with sample customer data
      const sampleCustomers: Customer[] = [
        {
          id: '1',
          name: 'Ayesha Khan',
          email: 'ayesha@example.com',
          phone: '03001234567',
          totalOrders: 5,
          totalSpent: 22500,
          joinDate: '2025-01-15',
          lastOrder: '2025-05-10',
        },
        {
          id: '2',
          name: 'Fatima Ali',
          email: 'fatima@example.com',
          phone: '03009876543',
          totalOrders: 2,
          totalSpent: 8900,
          joinDate: '2025-03-20',
          lastOrder: '2025-05-12',
        },
        {
          id: '3',
          name: 'Zainab Hassan',
          email: 'zainab@example.com',
          phone: '03104567890',
          totalOrders: 1,
          totalSpent: 5800,
          joinDate: '2025-05-01',
          lastOrder: '2025-05-14',
        },
      ];
      setCustomers(sampleCustomers);
      localStorage.setItem('admin_customers', JSON.stringify(sampleCustomers));
    }

    setIsLoaded(true);
  }, []);

  const addOrder = (order: Order) => {
    const newOrders = [...orders, order];
    setOrders(newOrders);
    localStorage.setItem('admin_orders', JSON.stringify(newOrders));
  };

  const updateOrder = (id: string, updates: Partial<Order>) => {
    const newOrders = orders.map(order => 
      order.id === id ? { ...order, ...updates } : order
    );
    setOrders(newOrders);
    localStorage.setItem('admin_orders', JSON.stringify(newOrders));
  };

  const deleteOrder = (id: string) => {
    const newOrders = orders.filter(order => order.id !== id);
    setOrders(newOrders);
    localStorage.setItem('admin_orders', JSON.stringify(newOrders));
  };

  const addCustomer = (customer: Customer) => {
    const newCustomers = [...customers, customer];
    setCustomers(newCustomers);
    localStorage.setItem('admin_customers', JSON.stringify(newCustomers));
  };

  const getAdminStats = () => {
    return {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
      totalCustomers: customers.length,
      pendingOrders: orders.filter(order => order.status === 'Pending').length,
    };
  };

  if (!isLoaded) {
    return <>{children}</>;
  }

  return (
    <AdminContext.Provider value={{ orders, customers, addOrder, updateOrder, deleteOrder, addCustomer, getAdminStats }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
}
