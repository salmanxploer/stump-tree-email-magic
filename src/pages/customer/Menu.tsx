import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import Layout from '@/components/shared/Layout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { Plus, Search } from 'lucide-react';
import { foodCategories } from '@/data/mockData';
import QuickReorder from '@/components/features/QuickReorder';

const Menu = () => {
  const { foodItems, addToCart } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredItems = foodItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory && item.isAvailable;
  });

  const handleAddToCart = (item: typeof foodItems[0]) => {
    addToCart(item, 1);
  };

  return (
    <Layout title="Menu">
      <div className="space-y-6">
        {/* Quick Reorder Feature */}
        <QuickReorder />

        {/* Search Bar with animation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search for food..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-2 focus:border-blue-500 dark:focus:border-purple-500 transition-colors"
            />
          </div>
        </motion.div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="w-full flex flex-wrap h-auto">
            <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
            {foodCategories.map(category => (
              <TabsTrigger key={category} value={category} className="flex-1">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -8 }}
                >
                  <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 hover:border-blue-300 dark:hover:border-purple-600">
                    <CardHeader className="p-0">
                      <div className="relative h-48 overflow-hidden group">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        {item.stock < 10 && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 right-2"
                          >
                            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 shadow-lg">
                              Low Stock
                            </Badge>
                          </motion.div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <CardTitle className="text-lg mb-2">{item.name}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-blue-600">
                          ৳{item.price}
                        </span>
                        <Badge variant="outline">{item.category}</Badge>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <motion.div 
                        className="w-full"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 shadow-md hover:shadow-lg transition-all"
                          onClick={() => handleAddToCart(item)}
                          disabled={item.stock === 0}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          {item.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </Button>
                      </motion.div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-lg text-gray-500">No items found</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Menu;
