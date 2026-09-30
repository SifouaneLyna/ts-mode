import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'ts-mode-cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function addToCart(product, attributes, quantity, unitPrice) {
    setItems(prev => {
      // Same product + same variant attributes = update quantity instead of duplicating
      const existingIndex = prev.findIndex(
        item => item.productId === product._id &&
          JSON.stringify(item.attributes) === JSON.stringify(attributes)
      );

      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      return [...prev, {
        productId: product._id,
        name: product.name,
        image: product.images?.[0] || '/template/images/product-item-1.jpg',
        attributes,
        quantity,
        unitPrice,
      }];
    });
  }

  function removeFromCart(productId, attributes) {
    setItems(prev => prev.filter(
      item => !(item.productId === productId && JSON.stringify(item.attributes) === JSON.stringify(attributes))
    ));
  }

  function updateQuantity(productId, attributes, quantity) {
    setItems(prev => prev.map(item =>
      item.productId === productId && JSON.stringify(item.attributes) === JSON.stringify(attributes)
        ? { ...item, quantity }
        : item
    ));
  }

  function clearCart() {
    setItems([]);
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}