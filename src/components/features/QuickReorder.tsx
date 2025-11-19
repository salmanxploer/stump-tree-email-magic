import { motion } from 'framer-motion';
import { RotateCw, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

const QuickReorder = () => {
  const { orders, addToCart, foodItems } = useData();
  const { user } = useAuth();

  // Get last 3 unique orders for the current user
  const recentOrders = orders
    .filter(order => order.customerId === user?.id)
    .slice(0, 3);

  const handleQuickReorder = (order: typeof orders[0]) => {
    let addedCount = 0;
    order.items.forEach(item => {
      const foodItem = foodItems.find(f => f.id === item.foodId);
      if (foodItem && foodItem.isAvailable) {
        addToCart(foodItem, item.quantity);
        addedCount++;
      }
    });
    
    if (addedCount > 0) {
      toast.success(`Added ${addedCount} items to cart!`);
    } else {
      toast.error('Items are no longer available');
    }
  };

  if (recentOrders.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="border-2 border-dashed border-blue-300 dark:border-purple-600 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-gray-800/50 dark:to-gray-850/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <RotateCw className="h-5 w-5 text-blue-600" />
            Quick Reorder
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Reorder your recent favorites with one click
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm font-medium line-clamp-2">
                        {order.items.length > 2 
                          ? `${order.items.slice(0, 2).map(item => item.foodName).join(', ')}...`
                          : order.items.map(item => item.foodName).join(', ')
                        }
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-blue-600">
                        ৳{order.totalAmount}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickReorder(order)}
                        className="hover:bg-blue-50 dark:hover:bg-blue-900"
                      >
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        Reorder
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QuickReorder;
