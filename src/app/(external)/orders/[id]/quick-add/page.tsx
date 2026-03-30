"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuthMe } from "@/hooks/useAuthMe";
import { companyService } from "@/services/company.service";
import { productService } from "@/services/product.service";
import { categoryService } from "@/services/category.service";
import { orderService } from "@/services/order.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Trash2, Package, ArrowLeft } from "lucide-react";
import LoadingState from "@/components/LoadingState";
import { toast } from "sonner";
import { Product } from "@/types/product";
import { OrderItemDetail } from "@/types/order";

interface CartItem {
  product: Product;
  quantity: number;
  note: string;
}

const QuickAddOrderPage = () => {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const { data: user, isLoading: userLoading } = useAuthMe();
  const [companyId, setCompanyId] = useState<string>("");
  const [branchId, setBranchId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [cart, setCart] = useState<CartItem[]>([]);

  // Get company
  const { data: companies } = useQuery({
    queryKey: ["companies"],
    queryFn: () => companyService.getMyCompanies(),
    enabled: !!user,
  });

  // Get branches
  const { data: branchResponse } = useQuery({
    queryKey: ["branches", companyId],
    queryFn: () => companyService.getBranchesByCompanyId(companyId),
    enabled: !!companyId,
  });

  // Get categories
  const { data: categoryResponse } = useQuery({
    queryKey: ["categories", branchId, companyId],
    queryFn: () => categoryService.getCategories(branchId, companyId),
    enabled: !!branchId && !!companyId,
  });

  // Get products
  const { data: productResponse, isLoading: productsLoading } = useQuery({
    queryKey: ["products", branchId],
    queryFn: () => {
      const params: { page: number; limit: number; branch_id?: string } = {
        page: 1,
        limit: 100,
      };
      
      if (branchId) {
        params.branch_id = branchId;
      }
      
      return productService.getProducts(params);
    },
    enabled: !!user,
  });

  // Get order details
  const { data: order, isLoading: orderLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderService.getOrderById(orderId),
    enabled: !!orderId,
  });

  useEffect(() => {
    if (companies && companies.length > 0) {
      setCompanyId(companies[0].id);
    }
  }, [companies]);

  useEffect(() => {
    if (branchResponse?.data && branchResponse.data.length > 0) {
      setBranchId(branchResponse.data[0].id);
    }
  }, [branchResponse]);

  useEffect(() => {
    if (userLoading) return;

    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (user.role.type !== "EXTERNAL") {
      router.push("/dashboard");
    }
  }, [user, userLoading, router]);

  const quickAddMutation = useMutation({
    mutationFn: ({ productId, quantity, note }: { productId: string; quantity: number; note?: string }) =>
      orderService.quickAddItem(orderId, {
        product_id: productId,
        quantity,
        note,
      }),
    onSuccess: () => {
      toast.success("Item berhasil ditambahkan ke order");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Gagal menambahkan item");
    },
  });

  const handleAddToCartByProductId = (productId: string, productName: string, price: number, image?: string) => {
    const product: Product = {
      id: productId,
      name: productName,
      price: price,
      image: image || "",
      category_id: "",
      company_id: "",
      branch_id: "",
      description: "",
      stock: 0,
      position: "",
      is_available: true,
      created_at: "",
      updated_at: "",
    };
    
    const existingCartItem = cart.find(c => c.product.id === productId);
    if (existingCartItem) {
      setCart(cart.map(c => 
        c.product.id === productId 
          ? { ...c, quantity: c.quantity + 1 }
          : c
      ));
    } else {
      setCart([...cart, { product, quantity: 1, note: "" }]);
    }
  };

  const handleQuickAddByProductId = (productId: string) => {
    const cartItem = cart.find(c => c.product.id === productId);
    if (cartItem) {
      quickAddMutation.mutate({
        productId: productId,
        quantity: cartItem.quantity,
        note: cartItem.note || undefined,
      });
      // Remove from cart after adding
      removeFromCart(productId);
    }
  };

  const handleAddExistingItem = (item: OrderItemDetail) => {
    // Check if this product is already in cart
    const existingCartItem = cart.find(c => c.product.id === item.product_id);
    
    if (existingCartItem) {
      // If already in cart, increase quantity
      setCart(cart.map(c => 
        c.product.id === item.product_id 
          ? { ...c, quantity: c.quantity + 1 }
          : c
      ));
    } else {
      // If not in cart, we need to create a Product object from OrderItemDetail
      const product: Product = {
        id: item.product_id,
        name: item.product?.name || item.product_name || "",
        price: item.price,
        image: item.product?.image || "",
        category_id: "",
        company_id: "",
        branch_id: "",
        description: "",
        stock: 0,
        position: "",
        is_available: true,
        created_at: "",
        updated_at: "",
      };
      
      setCart([...cart, { product, quantity: 1, note: item.note || "" }]);
    }
  };

  const addToCart = (product: Product) => {
    // Check if product exists in existing order items
    const existingOrderItem = order?.order_items.find(item => item.product_id === product.id);
    
    // Check if product exists in cart
    const existingCartItem = cart.find(item => item.product.id === product.id);
    
    if (existingCartItem) {
      // If already in cart, increase quantity
      setCart(cart.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else if (existingOrderItem) {
      // If exists in order but not in cart, add to cart with quantity 1
      // This represents additional quantity to be added
      setCart([...cart, { product, quantity: 1, note: "" }]);
    } else {
      // New product, add to cart
      setCart([...cart, { product, quantity: 1, note: "" }]);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(cart.map(item => 
      item.product.id === productId 
        ? { ...item, quantity }
        : item
    ));
  };

  const updateNote = (productId: string, note: string) => {
    setCart(cart.map(item => 
      item.product.id === productId 
        ? { ...item, note }
        : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const handleSubmitAll = () => {
    if (cart.length === 0) {
      toast.error("Keranjang masih kosong");
      return;
    }

    // Submit all items one by one
    cart.forEach(item => {
      quickAddMutation.mutate({
        productId: item.product.id,
        quantity: item.quantity,
        note: item.note || undefined,
      });
    });

    // Clear cart after submit
    setCart([]);
  };

  const handleQuickAdd = (item: CartItem) => {
    quickAddMutation.mutate({
      productId: item.product.id,
      quantity: item.quantity,
      note: item.note || undefined,
    });

    // Remove from cart after adding
    removeFromCart(item.product.id);
  };

  if (userLoading || !user || orderLoading) {
    return <LoadingState />;
  }

  if (productsLoading) {
    return <LoadingState />;
  }

  const products = productResponse?.data || [];
  const categories = categoryResponse?.data || [];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory && product.is_available;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          size="sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-4 h-full">
        {/* Left: Products */}
        <div className="col-span-4 flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Produk</CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Cari produk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                <Button
                  size="sm"
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  onClick={() => setSelectedCategory("all")}
                >
                  Semua
                </Button>
                {categories.map(cat => (
                  <Button
                    key={cat.id}
                    size="sm"
                    variant={selectedCategory === cat.id ? "default" : "outline"}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Package className="h-16 w-16 mb-2" />
                  <p className="text-sm">
                    {products.length === 0 
                      ? "Belum ada produk tersedia" 
                      : "Tidak ada produk yang sesuai"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {filteredProducts.map(product => (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="text-left border rounded-lg p-3 hover:border-blue-500 hover:shadow-md transition-all"
                    >
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-24 object-cover rounded mb-2"
                        />
                      ) : (
                        <div className="w-full h-24 bg-gray-200 rounded flex items-center justify-center mb-2">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <div className="font-medium text-sm line-clamp-1">{product.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{formatCurrency(product.price)}</div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Middle: All Order Items */}
        <div className="col-span-5 flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Daftar Pesanan</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              {(!order || order.order_items.length === 0) && cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Package className="h-16 w-16 mb-2" />
                  <p>Belum ada item dalam pesanan</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Merge existing order items with cart items */}
                  {(() => {
                    // Create a map of all items (existing + new)
                    const itemsMap = new Map<string, {
                      productId: string;
                      productName: string;
                      price: number;
                      image?: string;
                      existingQty: number;
                      newQty: number;
                      existingNote?: string;
                      newNote?: string;
                      isExisting: boolean;
                    }>();

                    // Add existing order items and merge duplicates
                    order?.order_items.forEach(item => {
                      const existing = itemsMap.get(item.product_id);
                      if (existing) {
                        // If product already exists, sum the quantities
                        existing.existingQty += item.quantity;
                      } else {
                        itemsMap.set(item.product_id, {
                          productId: item.product_id,
                          productName: item.product?.name || item.product_name || "",
                          price: item.price,
                          image: item.product?.image,
                          existingQty: item.quantity,
                          newQty: 0,
                          existingNote: item.note,
                          isExisting: true,
                        });
                      }
                    });

                    // Add or merge cart items
                    cart.forEach(item => {
                      const existing = itemsMap.get(item.product.id);
                      if (existing) {
                        existing.newQty = item.quantity;
                        existing.newNote = item.note;
                      } else {
                        itemsMap.set(item.product.id, {
                          productId: item.product.id,
                          productName: item.product.name,
                          price: item.product.price,
                          image: item.product.image,
                          existingQty: 0,
                          newQty: item.quantity,
                          newNote: item.note,
                          isExisting: false,
                        });
                      }
                    });

                    return Array.from(itemsMap.values()).map((item) => {
                      const totalQty = item.existingQty + item.newQty;
                      const isNewItem = item.existingQty === 0;
                      const hasAddition = item.newQty > 0;

                      return (
                        <div 
                          key={item.productId} 
                          className={`border rounded-lg p-3 ${isNewItem ? 'bg-blue-50 border-blue-200' : hasAddition ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50'}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="font-medium text-sm">{item.productName}</div>
                              <div className="text-xs text-gray-500">{formatCurrency(item.price)}</div>
                            </div>
                            {hasAddition && (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleQuickAddByProductId(item.productId)}
                                  disabled={quickAddMutation.isPending}
                                  className="text-green-600 hover:text-green-700 h-8 px-2"
                                >
                                  Tambah
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeFromCart(item.productId)}
                                  className="h-8 px-2"
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 mb-2">
                            {item.isExisting ? (
                              <>
                                <span className="text-sm text-gray-600">Qty:</span>
                                <div className="px-3 py-1 bg-white border rounded text-center font-medium text-sm">
                                  {item.existingQty}
                                </div>
                                {item.newQty > 0 && (
                                  <>
                                    <div className="flex items-center gap-1">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => updateQuantity(item.productId, item.newQty - 1)}
                                        className="h-8 w-8 p-0"
                                      >
                                        -
                                      </Button>
                                      <div className="px-3 py-1 bg-blue-100 border border-blue-300 rounded text-center font-medium text-sm text-blue-700 min-w-[40px]">
                                        +{item.newQty}
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => updateQuantity(item.productId, item.newQty + 1)}
                                        className="h-8 w-8 p-0"
                                      >
                                        +
                                      </Button>
                                    </div>
                                  </>
                                )}
                                {item.newQty === 0 && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleAddToCartByProductId(item.productId, item.productName, item.price, item.image)}
                                    className="h-8 w-8 p-0"
                                  >
                                    +
                                  </Button>
                                )}
                              </>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateQuantity(item.productId, item.newQty - 1)}
                                >
                                  -
                                </Button>
                                <Input
                                  type="number"
                                  value={item.newQty}
                                  onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
                                  className="w-16 text-center"
                                  min="1"
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateQuantity(item.productId, item.newQty + 1)}
                                >
                                  +
                                </Button>
                              </>
                            )}
                            <div className="ml-auto font-medium text-sm">
                              {formatCurrency(item.price * totalQty)}
                            </div>
                          </div>

                          {item.existingNote && (
                            <div className="text-xs text-gray-500 italic bg-white p-2 rounded border mb-2">
                              {item.existingNote}
                            </div>
                          )}

                          {hasAddition && (
                            <Input
                              placeholder="Catatan tambahan (opsional)"
                              value={item.newNote || ""}
                              onChange={(e) => updateNote(item.productId, e.target.value)}
                              className="text-sm"
                            />
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Order Info */}
        <div className="col-span-3 flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Info Order</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="space-y-3 flex-1">
                {order && (
                  <>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="text-xs font-medium text-gray-700 mb-1">Order ID</div>
                      <div className="text-sm font-mono">{order.id.slice(0, 8)}...</div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-700">Nama Customer</label>
                      <Input
                        value={order.customer_name || "-"}
                        disabled
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-700">Nomor Meja *</label>
                      <Input
                        value={order.table_number}
                        disabled
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-700">Catatan Order</label>
                      <Input
                        value={order.notes || "-"}
                        disabled
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-2 block">Metode Pesanan</label>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={order.order_method === "DINE_IN" ? "default" : "outline"}
                          disabled
                          className="flex-1"
                        >
                          Dine In
                        </Button>
                        <Button
                          size="sm"
                          variant={order.order_method === "TAKE_AWAY" ? "default" : "outline"}
                          disabled
                          className="flex-1"
                        >
                          Take Away
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="border-t pt-3 mt-3 space-y-2">
                {order && (
                  <>
                    {(() => {
                      // Calculate new items subtotal
                      const newItemsSubtotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
                      const currentSubtotal = order.subtotal_amount + newItemsSubtotal;
                      
                      // Calculate discount (if promo exists, apply to new subtotal)
                      let discountAmount = order.discount_amount || 0;
                      if (order.promo_details && newItemsSubtotal > 0) {
                        // Recalculate discount based on new subtotal
                        if (order.promo_details.promo_type === "percentage") {
                          const newDiscount = (currentSubtotal * order.promo_details.promo_value) / 100;
                          discountAmount = order.promo_details.max_discount 
                            ? Math.min(newDiscount, order.promo_details.max_discount)
                            : newDiscount;
                        } else {
                          discountAmount = order.promo_details.promo_value;
                        }
                      }
                      
                      const subtotalAfterDiscount = currentSubtotal - discountAmount;
                      
                      // Calculate taxes based on new subtotal
                      let runningTotal = subtotalAfterDiscount;
                      const newTaxDetails: Array<{ tax_id: string; tax_name: string; percentage: number; tax_amount: number }> = [];
                      
                      if (order.tax_details) {
                        order.tax_details.forEach(tax => {
                          const taxAmount = (runningTotal * tax.percentage) / 100;
                          newTaxDetails.push({
                            tax_id: tax.tax_id,
                            tax_name: tax.tax_name,
                            percentage: tax.percentage,
                            tax_amount: taxAmount,
                          });
                          runningTotal += taxAmount;
                        });
                      }
                      
                      const totalTax = newTaxDetails.reduce((sum, tax) => sum + tax.tax_amount, 0);
                      const finalTotal = subtotalAfterDiscount + totalTax;
                      
                      return (
                        <>
                          <div className="flex justify-between text-sm">
                            <span>Subtotal</span>
                            <span>{formatCurrency(currentSubtotal)}</span>
                          </div>
                          {newItemsSubtotal > 0 && (
                            <div className="flex justify-between text-xs text-blue-600 -mt-1">
                              <span className="italic">+ Item baru</span>
                              <span className="italic">{formatCurrency(newItemsSubtotal)}</span>
                            </div>
                          )}
                          {order.promo_details && (
                            <div className="flex justify-between text-sm text-green-600">
                              <span>Diskon Promo</span>
                              <span>-{formatCurrency(discountAmount)}</span>
                            </div>
                          )}
                          {newTaxDetails.map((tax) => (
                            <div key={tax.tax_id} className="flex justify-between text-sm">
                              <span>{tax.tax_name} ({tax.percentage}%)</span>
                              <span>{formatCurrency(tax.tax_amount)}</span>
                            </div>
                          ))}
                          <div className="flex justify-between font-bold text-base border-t pt-2">
                            <span>Total</span>
                            <span>{formatCurrency(finalTotal)}</span>
                          </div>
                        </>
                      );
                    })()}
                  </>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setCart([])}
                >
                  BATAL
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleSubmitAll}
                  disabled={quickAddMutation.isPending || cart.length === 0}
                >
                  {quickAddMutation.isPending ? "PROSES..." : "TAMBAH SEMUA"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuickAddOrderPage;
