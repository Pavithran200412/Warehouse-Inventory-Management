import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { FileDown, FileSpreadsheet, Settings, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useInventory } from '@/hooks/useInventory';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const Reports = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { items } = useInventory();
  const [reportType, setReportType] = useState('inventory-summary');
  const [dateRange, setDateRange] = useState('30');
  const [warehouse, setWarehouse] = useState('all');
  const [category, setCategory] = useState('all');
  const [reportData, setReportData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const generateReportData = () => {
    let filteredItems = items;
    
    if (warehouse !== 'all') {
      filteredItems = filteredItems.filter(item => item.warehouse === warehouse);
    }
    
    if (category !== 'all') {
      filteredItems = filteredItems.filter(item => item.category === category);
    }

    switch (reportType) {
      case 'low-stock':
        return filteredItems.filter(item => item.status === 'Low Stock' || item.status === 'Out of Stock');
      case 'stock-movement':
        return filteredItems.map(item => ({ ...item, movement: Math.floor(Math.random() * 50) }));
      case 'inventory-valuation':
        return filteredItems.map(item => ({ ...item, value: item.stock * (item.price || 0) }));
      default:
        return filteredItems;
    }
  };

  const handleGenerateReport = () => {
    const data = generateReportData();
    setReportData(data);
    setShowPreview(true);
    
    toast({
      title: "Report Generated",
      description: `${data.length} items found. Review and download when ready.`,
    });
  };

  const handleDownloadReport = () => {
    let csv = '';
    if (reportType === 'inventory-valuation') {
      csv = [
        ['Item ID', 'Name', 'Category', 'Stock', 'Price', 'Total Value', 'Warehouse'],
        ...reportData.map((item: any) => [
          item.id, item.name, item.category, item.stock, 
          item.price || 0, item.value || 0, item.warehouse
        ])
      ].map(row => row.join(',')).join('\n');
    } else if (reportType === 'stock-movement') {
      csv = [
        ['Item ID', 'Name', 'Category', 'Stock', 'Movement', 'Warehouse'],
        ...reportData.map((item: any) => [
          item.id, item.name, item.category, item.stock, item.movement || 0, item.warehouse
        ])
      ].map(row => row.join(',')).join('\n');
    } else {
      csv = [
        ['Item ID', 'Name', 'Category', 'Stock', 'Status', 'Warehouse'],
        ...reportData.map((item: any) => [
          item.id, item.name, item.category, item.stock, item.status, item.warehouse
        ])
      ].map(row => row.join(',')).join('\n');
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast({
      title: "Report Downloaded",
      description: "Your report has been downloaded successfully",
    });
  };

  const handleExport = (format: string) => {
    const reportData = generateReportData();
    
    const csv = [
      ['Item ID', 'Name', 'Category', 'Stock', 'Status', 'Warehouse'],
      ...reportData.map((item: any) => [
        item.id, item.name, item.category, item.stock, item.status, item.warehouse
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export-${format}-${new Date().toISOString().split('T')[0]}.${format}`;
    a.click();
    
    toast({
      title: `Exported as ${format.toUpperCase()}`,
      description: "Download complete",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground">Generate comprehensive reports on your inventory data</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport('pdf')}>
              <FileDown className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="secondary" onClick={() => handleExport('csv')}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Report Builder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-3">
                <Label>Report Type</Label>
                <RadioGroup value={reportType} onValueChange={setReportType}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="inventory-summary" id="inventory-summary" />
                    <Label htmlFor="inventory-summary" className="font-normal cursor-pointer">
                      Inventory Summary
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low-stock" id="low-stock" />
                    <Label htmlFor="low-stock" className="font-normal cursor-pointer">
                      Low Stock Report
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="stock-movement" id="stock-movement" />
                    <Label htmlFor="stock-movement" className="font-normal cursor-pointer">
                      Stock Movement
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="inventory-valuation" id="inventory-valuation" />
                    <Label htmlFor="inventory-valuation" className="font-normal cursor-pointer">
                      Inventory Valuation
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>Date Range</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 Days</SelectItem>
                    <SelectItem value="30">Last 30 Days</SelectItem>
                    <SelectItem value="90">Last 90 Days</SelectItem>
                    <SelectItem value="365">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Warehouse</Label>
                <Select value={warehouse} onValueChange={setWarehouse}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Warehouses</SelectItem>
                    <SelectItem value="Main Warehouse">Main Warehouse</SelectItem>
                    <SelectItem value="Electronics Hub">Electronics Hub</SelectItem>
                    <SelectItem value="Tech Center">Tech Center</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Clothing">Clothing</SelectItem>
                    <SelectItem value="Books">Books</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleGenerateReport} size="lg">
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {showPreview && reportData.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Report Preview</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Showing {reportData.length} items
                </p>
              </div>
              <Button onClick={handleDownloadReport}>
                <Download className="w-4 h-4 mr-2" />
                Download CSV
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Stock</TableHead>
                      {reportType === 'inventory-valuation' && (
                        <>
                          <TableHead>Price</TableHead>
                          <TableHead>Total Value</TableHead>
                        </>
                      )}
                      {reportType === 'stock-movement' && (
                        <TableHead>Movement</TableHead>
                      )}
                      {reportType !== 'inventory-valuation' && reportType !== 'stock-movement' && (
                        <TableHead>Status</TableHead>
                      )}
                      <TableHead>Warehouse</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.id}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.stock}</TableCell>
                        {reportType === 'inventory-valuation' && (
                          <>
                            <TableCell>${item.price || 0}</TableCell>
                            <TableCell>${item.value || 0}</TableCell>
                          </>
                        )}
                        {reportType === 'stock-movement' && (
                          <TableCell>{item.movement || 0}</TableCell>
                        )}
                        {reportType !== 'inventory-valuation' && reportType !== 'stock-movement' && (
                          <TableCell>{item.status}</TableCell>
                        )}
                        <TableCell>{item.warehouse}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Reports;