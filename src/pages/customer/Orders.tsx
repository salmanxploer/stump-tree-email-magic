import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import Layout from '@/components/shared/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const CustomerOrders = () => {
  const navigate = useNavigate();
  const { user, authToken } = useAuth();
  const { orders } = useData();

  const handleViewInvoice = async (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    if (!authToken) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/invoice`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        navigate(`/customer/invoices/${data.invoice.id}`);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to load invoice' }));
        alert(errorData.message || 'Invoice not yet generated for this order.');
      }
    } catch (error) {
      console.error('Failed to fetch invoice', error);
      alert('Failed to load invoice. Please try again.');
    }
  };

  const myOrders = orders
    .filter(order => order.customerId === user?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'preparing': return 'bg-blue-500';
      case 'ready': return 'bg-green-500';
      case 'delivered': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  if (myOrders.length === 0) {
    return (
      <Layout title="My Orders">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-lg text-gray-500 mb-4">You haven't placed any orders yet</p>
            <Button onClick={() => navigate('/customer/menu')}>
              Browse Menu
            </Button>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout title="My Orders">
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {myOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/customer/orders/${order.id}`)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">#{order.id}</span>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                    <div className="space-y-1">
                      {order.items.map((item, idx) => (
                        <p key={idx} className="text-sm">
                          {item.quantity}x {item.foodName}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      ৳{order.totalAmount}
                    </p>
                    <div className="flex flex-col gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/customer/orders/${order.id}`);
                        }}
                      >
                        Track Order
                      </Button>
                      {order.status === 'delivered' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => handleViewInvoice(e, order.id)}
                          className="flex items-center gap-1"
                        >
                          <FileText className="h-3 w-3" />
                          Invoice
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default CustomerOrders;
