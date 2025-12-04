import React, { createContext, useContext, useEffect, useState } from "react";

// E-commerce Frontend — single-file React component
// Tailwind CSS classes used. Paste into a React + Tailwind project (Vite/Create React App with Tailwind).
// Features: product listing, product details, cart (add/remove/update), user auth (mock), checkout form, localStorage persistence.

// ----------------------------- Mock Product Data -----------------------------
const SAMPLE_PRODUCTS = [
  {
    id: "p1",
    title: "Minimalist Wooden Chair",
    price: 79.99,
    description: "Comfortable, modern wooden chair for living & office.",
    image: "https://picsum.photos/seed/p1/800/600",
    stock: 12,
  },
  {
    id: "p2",
    title: "Elegant Floor Lamp",
    price: 129.99,
    description: "Warm LED light and slim frame. Perfect for reading corners.",
    image: "https://picsum.photos/seed/p2/800/600",
    stock: 8,
  },
  {
    id: "p3",
    title: "Modern Desk Organizer",
    price: 24.5,
    description: "Keep your desk clean and organized with compartments.",
    image: "https://picsum.photos/seed/p3/800/600",
    stock: 30,
  },
  {
    id: "p4",
    title: "Cozy Throw Blanket",
    price: 39.0,
    description: "Soft, machine-washable throw blanket for couch or bed.",
    image: "https://picsum.photos/seed/p4/800/600",
    stock: 20,
  },
];

// ----------------------------- Utilities -----------------------------
const formatCurrency = (n) => `₹${n.toFixed(2)}`;

// ----------------------------- Auth Context -----------------------------
const AuthContext = createContext();
function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ecom_user")) || null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem("ecom_user", JSON.stringify(user));
  }, [user]);

  function signIn({ email, password }) {
    // MOCK: Accept any email/password — return fake token + name
    const u = { id: email, email, name: email.split("@")[0], token: "mock-token" };
    setUser(u);
    return u;
  }

  function signOut() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>{children}</AuthContext.Provider>
  );
}
function useAuth() {
  return useContext(AuthContext);
}

// ----------------------------- Cart Context -----------------------------
const CartContext = createContext();
function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ecom_cart")) || [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("ecom_cart", JSON.stringify(items));
  }, [items]);

  function addToCart(product, qty = 1) {
    setItems((prev) => {
      const found = prev.find((x) => x.id === product.id);
      if (found) return prev.map((x) => (x.id === product.id ? { ...x, qty: Math.min(x.qty + qty, product.stock) } : x));
      return [{ id: product.id, product, qty: Math.min(qty, product.stock) }, ...prev];
    });
  }

  function removeFromCart(id) {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  function updateQty(id, qty) {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, qty: Math.max(1, Math.min(qty, x.product.stock)) } : x)));
  }

  function clearCart() {
    setItems([]);
  }

  const subtotal = items.reduce((s, it) => s + it.product.price * it.qty, 0);
  const shipping = subtotal > 1000 || subtotal === 0 ? 0 : 49;
  const total = subtotal + shipping;

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQty, clearCart, subtotal, shipping, total }}>
      {children}
    </CartContext.Provider>
  );
}
function useCart() {
  return useContext(CartContext);
}

// ----------------------------- Main App -----------------------------
export default function EcommerceApp() {
  return (
    <AuthProvider>
      <CartProvider>
        <ShopFront />
      </CartProvider>
    </AuthProvider>
  );
}

// ----------------------------- Shop Front -----------------------------
function ShopFront() {
  const [products] = useState(SAMPLE_PRODUCTS);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null); // product for details
  const [showCart, setShowCart] = useState(false);
  const [route, setRoute] = useState("home"); // home | checkout | order-complete
  const { user, signOut } = useAuth();

  function filtered() {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onOpenCart={() => setShowCart(true)}
        cartOpen={showCart}
        cartToggle={() => setShowCart((s) => !s)}
        onSearch={(v) => setQuery(v)}
        onRoute={(r) => setRoute(r)}
      />

      <main className="container mx-auto p-4">
        {route === "home" && (
          <section>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">Products</h2>
                  <div className="text-sm text-gray-600">{filtered().length} items</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered().map((p) => (
                    <ProductCard key={p.id} product={p} onView={() => setSelected(p)} />
                  ))}
                </div>
              </div>

              <aside className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-medium mb-2">Quick Checkout</h3>
                <p className="text-sm text-gray-600 mb-3">Proceed to checkout faster with saved address.</p>
                <button onClick={() => setRoute("checkout")} className="w-full px-3 py-2 rounded bg-indigo-600 text-white">Go to Checkout</button>
              </aside>
            </div>
          </section>
        )}

        {route === "checkout" && <Checkout onBack={() => setRoute("home")} onComplete={() => setRoute("order-complete")} />}

        {route === "order-complete" && <OrderComplete onContinue={() => setRoute("home")} />}
      </main>

      <ProductModal product={selected} onClose={() => setSelected(null)} />
      <CartDrawer open={showCart} onClose={() => setShowCart(false)} />

      <Footer user={user} onSignOut={() => signOut()} />
    </div>
  );
}

// ----------------------------- Header -----------------------------
function Header({ onOpenCart, cartToggle, onSearch, onRoute }) {
  const { items } = useCart();
  const { user, signIn } = useAuth();
  const [q, setQ] = useState("");

  useEffect(() => {
    const id = setTimeout(() => onSearch(q), 250);
    return () => clearTimeout(id);
  }, [q]);

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto p-4 flex items-center gap-4">
        <div className="flex-1 flex items-center gap-3">
          <h1 className="text-xl font-bold cursor-pointer" onClick={() => onRoute("home")}>MyStore</h1>

          <div className="hidden sm:block">
            <input
              placeholder="Search products..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="px-3 py-2 border rounded-lg w-72"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <AuthButtons />

          <button onClick={cartToggle} className="relative px-3 py-2 rounded-lg border">
            Cart
            {items.length > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{items.length}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}

function AuthButtons() {
  const { user, signIn, signOut } = useAuth();
  const [show, setShow] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            // quick mock sign-in
            const email = prompt("Enter email for demo sign-in:", "demo@example.com");
            if (email) signIn({ email, password: "demo" });
          }}
          className="px-3 py-2 rounded border"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="text-sm">Hi, <strong>{user.name}</strong></div>
      <button onClick={() => signOut()} className="px-3 py-2 rounded border">Sign Out</button>
    </div>
  );
}

// ----------------------------- Product Card -----------------------------
function ProductCard({ product, onView }) {
  const { addToCart } = useCart();
  return (
    <article className="bg-white rounded-lg shadow-sm overflow-hidden">
      <img src={product.image} alt={product.title} className="w-full h-44 object-cover" />
      <div className="p-3">
        <h4 className="font-medium">{product.title}</h4>
        <div className="text-sm text-gray-600">{product.description}</div>
        <div className="mt-3 flex items-center justify-between">
          <div className="font-semibold">{formatCurrency(product.price)}</div>
          <div className="flex gap-2">
            <button onClick={() => addToCart(product, 1)} className="px-3 py-1 rounded bg-green-600 text-white text-sm">Add</button>
            <button onClick={onView} className="px-3 py-1 rounded border text-sm">View</button>
          </div>
        </div>
      </div>
    </article>
  );
}

// ----------------------------- Product Modal -----------------------------
function ProductModal({ product, onClose }) {
  const { addToCart } = useCart();
  if (!product) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <img src={product.image} alt={product.title} className="w-full h-72 object-cover" />
          <div className="p-4">
            <h3 className="text-xl font-semibold">{product.title}</h3>
            <div className="text-gray-600 mt-2">{product.description}</div>
            <div className="mt-4 font-bold text-lg">{formatCurrency(product.price)}</div>

            <div className="mt-4 flex gap-2">
              <button onClick={() => { addToCart(product, 1); alert('Added to cart'); }} className="px-3 py-2 rounded bg-green-600 text-white">Add to Cart</button>
              <button onClick={onClose} className="px-3 py-2 rounded border">Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------- Cart Drawer -----------------------------
function CartDrawer({ open, onClose }) {
  const { items, removeFromCart, updateQty, subtotal, shipping, total, clearCart } = useCart();

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1" onClick={onClose} />
      <aside className="w-full sm:w-96 bg-white p-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Your Cart</h3>
          <div className="text-sm text-gray-500">{items.length} item(s)</div>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-auto">
          {items.length === 0 && <div className="text-center text-gray-500">Cart is empty</div>}
          {items.map((it) => (
            <div key={it.id} className="flex items-center gap-3 border-b pb-2">
              <img src={it.product.image} alt={it.product.title} className="w-16 h-16 object-cover rounded" />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{it.product.title}</div>
                <div className="text-sm text-gray-500">{formatCurrency(it.product.price)} x {it.qty}</div>
                <div className="mt-1 flex items-center gap-2">
                  <button onClick={() => updateQty(it.id, it.qty - 1)} className="px-2 py-1 rounded border">-</button>
                  <div>{it.qty}</div>
                  <button onClick={() => updateQty(it.id, it.qty + 1)} className="px-2 py-1 rounded border">+</button>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{formatCurrency(it.product.price * it.qty)}</div>
                <button onClick={() => removeFromCart(it.id)} className="text-sm text-red-600 mt-2">Remove</button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t pt-3">
          <div className="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
          <div className="flex justify-between text-sm text-gray-600"><span>Shipping</span><span>{formatCurrency(shipping)}</span></div>
          <div className="flex justify-between font-semibold text-lg mt-2"><span>Total</span><span>{formatCurrency(total)}</span></div>

          <div className="mt-4 flex gap-2">
            <button className="flex-1 px-3 py-2 rounded bg-indigo-600 text-white" onClick={() => { onClose(); window.location.hash = '#checkout'; window.location.reload(); }}>Checkout</button>
            <button className="px-3 py-2 rounded border" onClick={() => clearCart()}>Clear</button>
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-500">Demo store — payment not processed.</div>
      </aside>
    </div>
  );
}

// ----------------------------- Checkout -----------------------------
function Checkout({ onBack, onComplete }) {
  const { items, subtotal, shipping, total, clearCart } = useCart();
  const { user } = useAuth();
  const [form, setForm] = useState(() => ({ name: user?.name || "", email: user?.email || "", address: "", city: "", pincode: "" }));
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  }

  async function placeOrder(e) {
    e.preventDefault();
    if (items.length === 0) return alert("Cart empty");
    setLoading(true);
    // MOCK order processing delay
    await new Promise((res) => setTimeout(res, 1000));
    setLoading(false);
    clearCart();
    onComplete();
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={onBack} className="text-sm text-indigo-600 mb-4">&larr; Back to shop</button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <form onSubmit={placeOrder} className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold mb-3">Shipping Details</h3>
          <div className="space-y-2">
            <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="w-full px-3 py-2 border rounded" />
            <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full px-3 py-2 border rounded" />
            <input name="address" value={form.address} onChange={handleChange} placeholder="Address" className="w-full px-3 py-2 border rounded" />
            <div className="flex gap-2">
              <input name="city" value={form.city} onChange={handleChange} placeholder="City" className="flex-1 px-3 py-2 border rounded" />
              <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="Pincode" className="w-28 px-3 py-2 border rounded" />
            </div>
          </div>

          <div className="mt-4">
            <h4 className="font-medium mb-2">Payment</h4>
            <div className="text-sm text-gray-600">This is a demo — no real payment is taken.</div>
            <button disabled={loading} type="submit" className="mt-3 px-4 py-2 rounded bg-green-600 text-white">{loading ? 'Placing...' : 'Place Order'}</button>
          </div>
        </form>

        <aside className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold mb-3">Order Summary</h3>
          <div className="space-y-2">
            {items.map((it) => (
              <div key={it.id} className="flex justify-between text-sm"><div>{it.product.title} × {it.qty}</div><div>{formatCurrency(it.product.price * it.qty)}</div></div>
            ))}
          </div>

          <div className="mt-4 border-t pt-3">
            <div className="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between text-sm text-gray-600"><span>Shipping</span><span>{formatCurrency(shipping)}</span></div>
            <div className="flex justify-between font-semibold text-lg mt-2"><span>Total</span><span>{formatCurrency(total)}</span></div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ----------------------------- Order Complete -----------------------------
function OrderComplete({ onContinue }) {
  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-lg text-center">
      <h2 className="text-2xl font-semibold">Thank you!</h2>
      <p className="mt-2 text-gray-600">Your order has been placed (demo only).</p>
      <button onClick={onContinue} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded">Continue Shopping</button>
    </div>
  );
}

// ----------------------------- Footer -----------------------------
function Footer({ user, onSignOut }) {
  return (
    <footer className="bg-white mt-8 border-t">
      <div className="container mx-auto p-4 text-center text-sm text-gray-600">© {new Date().getFullYear()} MyStore — Demo frontend. {user ? <button onClick={onSignOut} className="ml-2 text-indigo-600">Sign out</button> : null}</div>
    </footer>
  );
}

