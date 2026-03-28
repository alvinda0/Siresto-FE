"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuthMe } from "@/hooks/useAuthMe";
import { companyService } from "@/services/company.service";
import { productService } from "@/services/product.service";
import { categoryService } from "@/services/category.service";
import { orderService } from "@/services/order.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Trash2, Package } from "lucide-react";
import LoadingState from "@/components/LoadingState";
import { toast } from "sonner";
import { CreateOrderPayload, OrderMethod } from "@/types/order";
import { Product } from "@/types/product";

interface CartItem {
  product: Product;
  quantity: number;
  note: string;
}

const OrdersPage = () => {
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useAuthMe();
  const [companyId, setCompanyId] = useState<string>("");
  const [branchId, setBranchId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [orderMethod, setOrderMethod] = useState<OrderMethod>("DINE_IN");
  const [promoCode, setPromoCode] = useState("");
  const [referralCode, setReferralCode] = useState("");

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

  const createOrderMutation = useMutation({
    mutationFn: (payload: CreateOrderPayload) => orderService.createOrder(payload),
    onSuccess: () => {
      toast.success("Order berhasil dibuat");
      resetOrder();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Gagal membuat order");
    },
  });

  const resetOrder = () => {
    setCart([]);
    setCustomerName("");
    setTableNumber("");
    setOrderMethod("DINE_IN");
    setPromoCode("");
    setReferralCode("");
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
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

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const handleSubmit = () => {
    if (!tableNumber) {
      toast.error("Nomor meja wajib diisi");
      return;
    }

    if (cart.length === 0) {
      toast.error("Keranjang masih kosong");
      return;
    }

    const payload: CreateOrderPayload = {
      table_number: tableNumber,
      order_method: orderMethod,
      order_items: cart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        ...(item.note && { note: item.note })
      })),
      ...(customerName && { customer_name: customerName }),
      ...(promoCode && { promo_code: promoCode }),
      ...(referralCode && { referral_code: referralCode }),
    };

    createOrderMutation.mutate(payload);
  };

  if (userLoading || !user) {
    return <LoadingState />;
  }

  if (productsLoading) {
    return <LoadingState />;
  }

  const products = productResponse?.data || [];
  const categories = categoryResponse?.data || [];

  console.log("Products loaded:", products.length);
  console.log("Categories loaded:", categories.length);

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
                  {products.length === 0 && (
                    <p className="text-xs mt-1">Silakan tambahkan produk terlebih dahulu</p>
                  )}
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

        {/* Middle: Order List */}
        <div className="col-span-5 flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Daftar Pesanan</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Package className="h-16 w-16 mb-2" />
                  <p>Belum ada item dalam pesanan</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.product.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.product.name}</div>
                          <div className="text-xs text-gray-500">{formatCurrency(item.product.price)}</div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFromCart(item.product.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.product.id, Number(e.target.value))}
                          className="w-16 text-center"
                          min="1"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                        <div className="ml-auto font-medium text-sm">
                          {formatCurrency(item.product.price * item.quantity)}
                        </div>
                      </div>

                      <Input
                        placeholder="Catatan (opsional)"
                        value={item.note}
                        onChange={(e) => updateNote(item.product.id, e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Payment */}
        <div className="col-span-3 flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="space-y-3 flex-1">
                <div>
                  <label className="text-xs font-medium text-gray-700">Nama Customer</label>
                  <Input
                    placeholder="Masukkan nama"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700">Nomor Meja *</label>
                  <Input
                    placeholder="Contoh: A1"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700">Catatan Order</label>
                  <Input
                    placeholder="Catatan tambahan"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700">Kode Promo</label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      placeholder="Kode Promo"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />
                    <Button size="sm" variant="outline">Pakai</Button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700">Kode Referral (Opsional)</label>
                  <Input
                    placeholder="Masukkan kode referral"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 mb-2 block">Metode Pesanan</label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={orderMethod === "DINE_IN" ? "default" : "outline"}
                      onClick={() => setOrderMethod("DINE_IN")}
                      className="flex-1"
                    >
                      Dine In
                    </Button>
                    <Button
                      size="sm"
                      variant={orderMethod === "TAKE_AWAY" ? "default" : "outline"}
                      onClick={() => setOrderMethod("TAKE_AWAY")}
                      className="flex-1"
                    >
                      Take Away
                    </Button>
                  </div>
                </div>
              </div>

              <div className="border-t pt-3 mt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(calculateTotal())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Service (5%)</span>
                  <span>Rp0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>PB1 (10%)</span>
                  <span>Rp0</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t pt-2">
                  <span>Total</span>
                  <span>{formatCurrency(calculateTotal())}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={resetOrder}
                >
                  BATAL
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={createOrderMutation.isPending || cart.length === 0}
                >
                  {createOrderMutation.isPending ? "PROSES..." : "BUAT PESANAN"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
