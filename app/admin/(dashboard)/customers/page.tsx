'use client';

import { useState } from 'react';
import { useAdmin } from '@/lib/admin-context';
import { ArrowUpDown } from 'lucide-react';

type SortField = 'name' | 'joinDate' | 'totalSpent' | 'totalOrders';
type SortOrder = 'asc' | 'desc';

export default function CustomersPage() {
  const { customers } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('joinDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Filter and sort customers
  let filteredCustomers = customers.filter((customer) => {
    return (
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
    );
  });

  // Sort customers
  filteredCustomers = [...filteredCustomers].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const totalRevenue = customers.reduce((sum, customer) => sum + customer.totalSpent, 0);
  const avgSpending = customers.length > 0 ? totalRevenue / customers.length : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Customers</h1>
        <p className="text-muted-foreground">View and manage your customer base</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg shadow p-4">
          <p className="text-muted-foreground text-sm mb-1">Total Customers</p>
          <p className="text-2xl font-bold text-foreground">{customers.length}</p>
        </div>
        <div className="bg-card rounded-lg shadow p-4">
          <p className="text-muted-foreground text-sm mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-foreground">Rs. {totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-lg shadow p-4">
          <p className="text-muted-foreground text-sm mb-1">Average Spending</p>
          <p className="text-2xl font-bold text-foreground">Rs. {Math.round(avgSpending).toLocaleString()}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-card rounded-lg shadow p-4 md:p-6">
        <label className="block text-sm font-medium text-foreground mb-2">Search Customers</label>
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-card rounded-lg shadow overflow-hidden">
        {filteredCustomers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-secondary/30 border-b border-border">
                  <th className="px-4 md:px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary"
                    >
                      Name
                      {sortField === 'name' && <ArrowUpDown className="w-4 h-4" />}
                    </button>
                  </th>
                  <th className="px-4 md:px-6 py-4 text-left text-sm font-semibold text-foreground">Email</th>
                  <th className="px-4 md:px-6 py-4 text-left text-sm font-semibold text-foreground">Phone</th>
                  <th className="px-4 md:px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('totalOrders')}
                      className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary"
                    >
                      Orders
                      {sortField === 'totalOrders' && <ArrowUpDown className="w-4 h-4" />}
                    </button>
                  </th>
                  <th className="px-4 md:px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('totalSpent')}
                      className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary"
                    >
                      Total Spent
                      {sortField === 'totalSpent' && <ArrowUpDown className="w-4 h-4" />}
                    </button>
                  </th>
                  <th className="px-4 md:px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('joinDate')}
                      className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary"
                    >
                      Join Date
                      {sortField === 'joinDate' && <ArrowUpDown className="w-4 h-4" />}
                    </button>
                  </th>
                  <th className="px-4 md:px-6 py-4 text-left text-sm font-semibold text-foreground">Last Order</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b border-border hover:bg-secondary/10">
                    <td className="px-4 md:px-6 py-4 text-sm font-medium text-foreground">{customer.name}</td>
                    <td className="px-4 md:px-6 py-4 text-sm text-muted-foreground">{customer.email}</td>
                    <td className="px-4 md:px-6 py-4 text-sm text-muted-foreground">{customer.phone}</td>
                    <td className="px-4 md:px-6 py-4 text-sm font-medium text-foreground">{customer.totalOrders}</td>
                    <td className="px-4 md:px-6 py-4 text-sm font-medium text-foreground">
                      Rs. {customer.totalSpent.toLocaleString()}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-sm text-muted-foreground">{customer.joinDate}</td>
                    <td className="px-4 md:px-6 py-4 text-sm text-muted-foreground">{customer.lastOrder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-muted-foreground">No customers found</p>
          </div>
        )}
      </div>

      {/* Results Info */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredCustomers.length} of {customers.length} customers
      </p>
    </div>
  );
}
