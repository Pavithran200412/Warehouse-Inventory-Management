import { useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, AlertTriangle, Warehouse, TrendingUp, Plus, Upload, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useInventory } from '@/hooks/useInventory';
import { useWarehouses } from '@/hooks/useWarehouses';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items } = useInventory();
  const { warehouses } = useWarehouses();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate real-time stats
  const realTimeStats = useMemo(() => {
    const totalStock = items.reduce((sum, item) => sum + item.stock, 0);
    const lowStockCount = items.filter(item => 
      item.status === 'Low Stock' || item.status === 'Out of Stock'
    ).length;
    const totalWarehouses = warehouses.length;
    
    // Calculate monthly revenue (sum of stock * price, assuming avg price of $100 per unit)
    const monthlyRevenue = items.reduce((sum, item) => sum + (item.stock * 100), 0);
    
    // Calculate stock by status
    const inStockCount = items.filter(item => item.status === 'In Stock').length;
    const outOfStockCount = items.filter(item => item.status === 'Out of Stock').length;
    
    // Calculate top categories
    const categoryCount = items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topCategories = Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name, count]) => ({ name, count: `${count} items` }));

    return {
      totalStock,
      lowStockCount,
      totalWarehouses,
      monthlyRevenue,
      inStockCount,
      outOfStockCount,
      topCategories
    };
  }, [items, warehouses]);

  const handleAddItem = () => {
    navigate('/inventory', { state: { openAddDialog: true } });
  };

  const handleImportCSV = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast({
        title: "Importing CSV",
        description: `Processing ${file.name}...`,
      });
      // Simulate import
      setTimeout(() => {
        toast({
          title: "Import Complete",
          description: "CSV data has been imported successfully",
        });
      }, 1500);
    }
  };

  const handleGenerateReport = () => {
    const reportData = items.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      stock: item.stock,
      status: item.status,
      warehouse: item.warehouse,
    }));

    const csv = [
      ['Item ID', 'Name', 'Category', 'Stock', 'Status', 'Warehouse'],
      ...reportData.map(item => [item.id, item.name, item.category, item.stock, item.status, item.warehouse])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast({
      title: "Report Generated",
      description: "Your inventory report has been downloaded",
    });
  };

  const stats = [
    {
      title: 'Total Stock Items',
      value: realTimeStats.totalStock.toLocaleString(),
      change: '+12%',
      changeType: 'positive',
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      title: 'Low Stock Items',
      value: realTimeStats.lowStockCount.toString(),
      change: realTimeStats.lowStockCount > 0 ? 'Needs attention' : 'All good',
      changeType: realTimeStats.lowStockCount > 0 ? 'negative' : 'positive',
      icon: AlertTriangle,
      color: 'bg-orange-500',
    },
    {
      title: 'Total Warehouses',
      value: realTimeStats.totalWarehouses.toString(),
      change: `${items.length} items tracked`,
      changeType: 'positive',
      icon: Warehouse,
      color: 'bg-teal-500',
    },
    {
      title: 'Monthly Revenue',
      value: `$${realTimeStats.monthlyRevenue.toLocaleString()}`,
      change: '+18%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'bg-green-500',
    },
  ];

  const recentActivity = [
    {
      title: 'Item Added',
      description: 'Samsung Galaxy S24 • Main Warehouse',
      time: '2 hours ago',
    },
    {
      title: 'Stock Updated',
      description: 'iPhone 15 Pro • Electronics Hub',
      time: '4 hours ago',
    },
    {
      title: 'Low Stock Alert',
      description: 'MacBook Air M2 • Tech Center',
      time: '6 hours ago',
    },
  ];

  const stockSummary = [
    { label: 'In Stock', value: `${realTimeStats.inStockCount} items`, color: 'text-green-600' },
    { label: 'Low Stock', value: `${realTimeStats.lowStockCount} items`, color: 'text-orange-600' },
    { label: 'Out of Stock', value: `${realTimeStats.outOfStockCount} items`, color: 'text-red-600' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's an overview of your inventory system.</p>
          </div>
          {user?.role !== 'staff' && (
            <div className="flex gap-2">
              <Button onClick={handleAddItem}>
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
              <Button variant="secondary" onClick={handleImportCSV}>
                <Upload className="w-4 h-4 mr-2" />
                Import CSV
              </Button>
              <Button variant="outline" onClick={handleGenerateReport}>
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <p className={`text-sm ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change} from last month
                    </p>
                  </div>
                  <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start justify-between py-3 border-b last:border-b-0">
                    <div>
                      <p className="font-semibold">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                    </div>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Stock Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stockSummary.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                      <span className={`font-semibold ${item.color}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {realTimeStats.topCategories.length > 0 ? (
                    realTimeStats.topCategories.map((category, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{category.name}</span>
                        <span className="text-sm font-semibold">{category.count}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No categories yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;