import React, { useState, useEffect } from "react";

export default function Cart({ userId, userData, selectedProducts, setSelectedProducts }) {
  const [shippingAddressId, setShippingAddressId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [stockLevels, setStockLevels] = useState({});

  useEffect(() => {
    const calculateTotal = () => {
      if (!selectedProducts || selectedProducts.length === 0) return 0;
      return selectedProducts.reduce((acc, item) => {
        if (!item.productId || !item.productId.price) return acc;
        const price = item.productId.discount > 0 
            ? item.productId.price * (1 - item.productId.discount / 100)
            : item.productId.price;
        return acc + price * item.quantity;
      }, 0);
    };
    setTotalPrice(calculateTotal());
  }, [selectedProducts]);

  useEffect(() => {
    const fetchStockLevels = async () => {
      if (!selectedProducts || selectedProducts.length === 0) return;

      const productIds = selectedProducts.map(item => item.productId._id);
      
      try {
        const response = await fetch("http://localhost:3001/api/products/stock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productIds }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch stock levels");
        }

        const data = await response.json();
        if (data.success) {
          setStockLevels(data.stockLevels);
        }
      } catch (error) {
        console.error("Error fetching stock levels:", error);
      }
    };

    fetchStockLevels();
  }, [selectedProducts]);

  const handleQuantityChange = async (productId, newQuantity) => {
    try {
      if (!userId) throw new Error("User ID is missing");

      const url = newQuantity <= 0
        ? `http://localhost:3001/cart/delete-product/${userId}/${productId}`
        : `http://localhost:3001/cart/update-quantity/${userId}/${productId}`;

      const response = await fetch(url, {
        method: newQuantity <= 0 ? "DELETE" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: newQuantity > 0 ? JSON.stringify({ quantity: newQuantity }) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update cart");
      }

      const data = await response.json();
      setSelectedProducts(data.selectedProducts);
    } catch (error) {
      console.error("Failed to update product quantity:", error);
    }
  };

  const getDeliveryPrice = () => {
      if (!shippingAddressId) return 0;
      const selectedAddr = userData.address.find(addr => addr._id === shippingAddressId);
      if (!selectedAddr) return 0;
      // Example pricing, adjust as needed
      switch (selectedAddr.country?.toLowerCase()) {
          case 'united states': return 5;
          case 'europe': return 10;
          case 'asia': return 15;
          default: return 20;
      }
  }

  const deliveryPrice = getDeliveryPrice();
  const finalTotalPrice = totalPrice + deliveryPrice;

  const isCartInvalid = selectedProducts.some(item => item.quantity > stockLevels[item.productId._id]);

  const saveOrderDetails = async () => {
    try {
      if (isCartInvalid) {
        alert("Cannot proceed to checkout due to insufficient stock for some items. Please adjust quantities.");
        return;
      }
      if (!userId || !shippingAddressId || !paymentMethod) {
        alert("Please select shipping address and payment method.");
        return;
      }

      const shippingAddress = userData.address.find(addr => addr._id === shippingAddressId);
      if (!shippingAddress) {
          alert("Selected shipping address not found.");
          return;
      }

      const orderDetails = {
        userId,
        productSelected: selectedProducts.map(item => ({ productId: item.productId._id, quantity: item.quantity })),
        shippingAddress: {
            firstName: shippingAddress.firstName,
            lastName: shippingAddress.lastName,
            city: shippingAddress.city,
            postalCode: shippingAddress.postalCode,
            country: shippingAddress.country,
            address: shippingAddress.address,
            phone: shippingAddress.phone,
        },
        payment: paymentMethod,
        deliveryPrice: deliveryPrice,
      };

      const response = await fetch("http://localhost:3001/orders/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderDetails),
      });

      if (!response.ok) throw new Error("Failed to save order details");

      await fetch(`http://localhost:3001/cart/clear/${userId}`, { method: "DELETE" });
      setSelectedProducts([]);
      window.location.href = "/Orderstatus";
    } catch (error) {
      console.error("Error saving order details:", error);
    }
  };

  // Helper function to display color/size name correctly
  const getOptionName = (item, optionType) => {
      const optionValue = optionType === 'color' ? item.selectedColor : item.selectedSize;
      const optionsArray = optionType === 'color' ? item.productId?.colors : item.productId?.sizes;
      
      if (!optionsArray) return optionValue; // Return value if no options array

      // Try to find by ID (for old data)
      const foundById = optionsArray.find(opt => opt._id === optionValue);
      if (foundById) return foundById.name;

      // If not found by ID, assume the value is already the name (for new data)
      return optionValue;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-2/3">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Shopping Cart</h2>
                <span className="text-lg font-medium text-gray-600">{selectedProducts.length} Items</span>
              </div>

              <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-gray-200">
                <div className="col-span-5"><p className="text-sm text-gray-500">Product</p></div>
                <div className="col-span-3 text-center"><p className="text-sm text-gray-500">Quantity</p></div>
                <div className="col-span-4 text-right"><p className="text-sm text-gray-500">Total</p></div>
              </div>

              {selectedProducts && selectedProducts.map((item) => {
                if (!item.productId) return null;
                const price = item.productId.discount > 0 ? item.productId.price * (1 - item.productId.discount / 100) : item.productId.price;
                const itemTotalPrice = price * item.quantity;
                const colorName = getOptionName(item, 'color');
                const sizeName = getOptionName(item, 'size');
                const availableStock = stockLevels[item.productId._id];
                const isOutOfStock = availableStock !== undefined && item.quantity > availableStock;
                
                let stockMessage = '';
                if (availableStock !== undefined) {
                  if (availableStock <= 0) {
                    stockMessage = "Out of stock";
                  } else if (item.quantity > availableStock) {
                    stockMessage = `Only ${availableStock} left`;
                  }
                }

                return (
                  <div key={item.productId._id + item.selectedColor + item.selectedSize} className="py-4 border-b border-gray-200 last:border-b-0">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      <div className="col-span-12 md:col-span-5 flex items-center gap-4">
                        <img src={item.productId.imageSrc} alt={item.productId.name} className="w-20 h-20 object-cover rounded-md" />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800">{item.productId.name}</h3>
                          <p className="text-sm text-gray-600">${price.toFixed(2)}</p>
                          <p className="text-sm text-gray-500">Color: {colorName}, Size: {sizeName}</p>
                        </div>
                      </div>
                      <div className="col-span-6 md:col-span-3 mt-2 md:mt-0">
                        <div className="flex items-center justify-center">
                          <button onClick={() => handleQuantityChange(item.productId._id, item.quantity - 1)} className="w-10 h-10 flex items-center justify-center border rounded-l-md hover:bg-gray-50"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M20 12H4" /></svg></button>
                          <input type="text" value={item.quantity} readOnly className="w-16 h-10 text-center border-t border-b focus:outline-none" />
                          <button onClick={() => handleQuantityChange(item.productId._id, item.quantity + 1)} className="w-10 h-10 flex items-center justify-center border rounded-r-md hover:bg-gray-50"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M12 4v16m8-8H4" /></svg></button>
                        </div>
                        {isOutOfStock && <p className="text-red-500 text-sm text-center mt-1">{stockMessage}</p>}
                      </div>
                      <div className="col-span-6 md:col-span-4 mt-2 md:mt-0">
                        <p className="text-lg font-semibold text-indigo-600 text-right">${itemTotalPrice.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm text-gray-600">Shipping Address</label>
                  <select value={shippingAddressId} onChange={(e) => setShippingAddressId(e.target.value)} className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:border-indigo-500">
                    <option value="">Select an address</option>
                    {userData.address && userData.address.map((addr) => (
                        <option key={addr._id} value={addr._id}>{`${addr.firstName} ${addr.lastName}, ${addr.address}, ${addr.city}`}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-600">Payment Method</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2"><input type="radio" value="credit" checked={paymentMethod === "credit"} onChange={(e) => setPaymentMethod(e.target.value)} className="text-indigo-600"/>Credit Card</label>
                    <label className="flex items-center gap-2"><input type="radio" value="paypal" checked={paymentMethod === "paypal"} onChange={(e) => setPaymentMethod(e.target.value)} className="text-indigo-600"/>PayPal</label>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>${totalPrice.toFixed(2)}</span></div>
                  <div className="flex justify-between text-gray-600"><span>Shipping</span><span>${deliveryPrice.toFixed(2)}</span></div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-semibold"><span>Total</span><span className="text-indigo-600">${finalTotalPrice.toFixed(2)}</span></div>
                  </div>
                  <button onClick={saveOrderDetails} disabled={!shippingAddressId || !paymentMethod || selectedProducts.length === 0 || isCartInvalid} className={`w-full py-3 rounded-md font-semibold text-white transition-colors ${
                      !shippingAddressId || !paymentMethod || selectedProducts.length === 0 || isCartInvalid ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}`}>
                    Proceed to Checkout
                  </button>
                  {isCartInvalid && <p className="text-red-500 text-sm text-center mt-2">Please resolve the stock issues before proceeding.</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
