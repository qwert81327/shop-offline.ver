import React, { useState, useEffect } from "react";
import {
  Plus,
  Minus,
  RefreshCw,
  Download,
  Trash2,
  X,
  PlusCircle,
  ShoppingCart,
  Package,
  Store,
  Edit3,
  Check,
  ShoppingBag,
  BarChart3,
  TrendingUp,
  History,
  Tag,
  PenLine,
  Save,
  RotateCcw,
  Clock,
  FileEdit,
  FolderCog,
} from "lucide-react";

// 初始範例資料
const defaultInventory = [
  {
    id: 1,
    category: "紙品",
    name: "手繪明信片",
    cost: 15,
    price: 50,
    quantity: 120,
    discounts: [
      { qty: 5, price: 200 },
      { qty: 3, price: 130 },
    ],
  },
  {
    id: 2,
    category: "周邊",
    name: "帆布袋",
    cost: 100,
    price: 350,
    quantity: 3,
    discounts: [],
  },
  {
    id: 3,
    category: "顏料",
    name: "塊狀水彩組",
    cost: 450,
    price: 800,
    quantity: 12,
    discounts: [],
  },
];

// 初始分類
const defaultCategories = ["紙品", "周邊", "顏料", "畫筆", "未分類"];

const InventoryApp = () => {
  // --- 狀態管理 ---
  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem("watercolor-pos-inventory-v7");
    return saved ? JSON.parse(saved) : defaultInventory;
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem("watercolor-pos-categories-v7");
    // 確保包含所有庫存中現有的分類，避免遺漏
    const inventoryCats = defaultInventory.map((i) => i.category);
    const merged = saved
      ? JSON.parse(saved)
      : [...new Set([...defaultCategories, ...inventoryCats])];
    return merged;
  });

  const [salesHistory, setSalesHistory] = useState(() => {
    const saved = localStorage.getItem("watercolor-pos-sales-v7");
    return saved ? JSON.parse(saved) : [];
  });

  const [appTitle, setAppTitle] = useState(() => {
    return localStorage.getItem("watercolor-pos-title-v7") || "水彩小舖 POS";
  });

  const [tempTitle, setTempTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("pos");

  // 表單狀態
  const [modalMode, setModalMode] = useState("closed");
  const [formData, setFormData] = useState({
    id: null,
    category: "",
    name: "",
    cost: "",
    price: "",
  });
  const [formDiscounts, setFormDiscounts] = useState([]);
  const [tempDiscount, setTempDiscount] = useState({ qty: "", price: "" });

  // 快速修改庫存狀態
  const [editingStockId, setEditingStockId] = useState(null);
  const [tempStockQty, setTempStockQty] = useState("");

  // 交易編輯狀態
  const [editingTransaction, setEditingTransaction] = useState(null);

  // 分類管理狀態 (New)
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState({
    original: "",
    current: "",
  }); // 用於編輯分類名稱

  // --- 儲存 Effect ---
  useEffect(() => {
    localStorage.setItem(
      "watercolor-pos-inventory-v7",
      JSON.stringify(inventory)
    );
  }, [inventory]);
  useEffect(() => {
    localStorage.setItem(
      "watercolor-pos-categories-v7",
      JSON.stringify(categories)
    );
  }, [categories]);
  useEffect(() => {
    localStorage.setItem("watercolor-pos-title-v7", appTitle);
  }, [appTitle]);
  useEffect(() => {
    localStorage.setItem(
      "watercolor-pos-sales-v7",
      JSON.stringify(salesHistory)
    );
  }, [salesHistory]);

  // --- 價格計算邏輯 ---
  const calculateItemSubtotal = (item, buyQty) => {
    let remaining = buyQty;
    let total = 0;
    const rules = item.discounts
      ? [...item.discounts].sort((a, b) => b.qty - a.qty)
      : [];
    for (const rule of rules) {
      if (remaining >= rule.qty) {
        const count = Math.floor(remaining / rule.qty);
        total += count * rule.price;
        remaining %= rule.qty;
      }
    }
    total += remaining * item.price;
    return total;
  };

  // --- 庫存管理 ---
  const updateQuantity = (id, delta) => {
    setInventory(
      inventory.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      )
    );
  };

  const saveStockEdit = () => {
    const qty = parseInt(tempStockQty);
    if (!isNaN(qty) && qty >= 0) {
      setInventory(
        inventory.map((item) =>
          item.id === editingStockId ? { ...item, quantity: qty } : item
        )
      );
      setEditingStockId(null);
    } else {
      alert("請輸入有效的數字");
    }
  };

  const deleteItem = (id, name) => {
    if (window.confirm(`確定要刪除「${name}」嗎？刪除後無法復原喔！`)) {
      setInventory(inventory.filter((item) => item.id !== id));
    }
  };

  // --- 分類管理邏輯 (New) ---
  const addCategory = () => {
    if (!newCategoryName.trim()) return;
    if (categories.includes(newCategoryName.trim())) {
      alert("此分類已存在！");
      return;
    }
    setCategories([...categories, newCategoryName.trim()]);
    setNewCategoryName("");
  };

  const deleteCategory = (cat) => {
    // 檢查是否有商品屬於此分類
    const hasItems = inventory.some((item) => item.category === cat);
    if (hasItems) {
      alert(
        `無法刪除「${cat}」，因為還有商品屬於此分類。\n請先將商品移動到其他分類，或刪除商品。`
      );
      return;
    }
    if (window.confirm(`確定要刪除分類「${cat}」嗎？`)) {
      setCategories(categories.filter((c) => c !== cat));
    }
  };

  const startEditCategory = (cat) => {
    setEditingCategory({ original: cat, current: cat });
  };

  const saveEditCategory = () => {
    const { original, current } = editingCategory;
    if (!current.trim() || original === current) {
      setEditingCategory({ original: "", current: "" });
      return;
    }
    if (categories.includes(current.trim())) {
      alert("此分類名稱已存在！");
      return;
    }

    // 1. 更新分類列表
    setCategories(categories.map((c) => (c === original ? current.trim() : c)));

    // 2. 連動更新庫存中的商品分類
    setInventory(
      inventory.map((item) =>
        item.category === original
          ? { ...item, category: current.trim() }
          : item
      )
    );

    setEditingCategory({ original: "", current: "" });
    alert(
      `分類「${original}」已更名為「${current.trim()}」，相關商品已同步更新。`
    );
  };

  // --- 交易編輯邏輯 ---
  const openEditTransaction = (record) => {
    setEditingTransaction(JSON.parse(JSON.stringify(record)));
  };

  const updateTransactionItemQty = (itemId, delta) => {
    setEditingTransaction((prev) => {
      const newItems = prev.items
        .map((item) => {
          if (item.id === itemId)
            return { ...item, cartQty: Math.max(0, item.cartQty + delta) };
          return item;
        })
        .filter((item) => item.cartQty > 0);
      const newTotal = newItems.reduce(
        (acc, item) => acc + calculateItemSubtotal(item, item.cartQty),
        0
      );
      return { ...prev, items: newItems, total: newTotal };
    });
  };

  const saveTransactionEdit = () => {
    const originalRecord = salesHistory.find(
      (r) => r.id === editingTransaction.id
    );
    if (!originalRecord) return;

    let tempInventory = [...inventory];
    originalRecord.items.forEach((oldItem) => {
      const stockItem = tempInventory.find((i) => i.id === oldItem.id);
      if (stockItem) stockItem.quantity += oldItem.cartQty;
    });

    let isStockEnough = true;
    editingTransaction.items.forEach((newItem) => {
      const stockItem = tempInventory.find((i) => i.id === newItem.id);
      if (stockItem) {
        if (stockItem.quantity < newItem.cartQty) isStockEnough = false;
        else stockItem.quantity -= newItem.cartQty;
      }
    });

    if (!isStockEnough) {
      alert("修改失敗：庫存不足！無法增加到該數量。");
      return;
    }

    setInventory(tempInventory);

    const updatedRecordItems = editingTransaction.items.map((item) => ({
      ...item,
      finalSubtotal: calculateItemSubtotal(item, item.cartQty),
    }));

    const updatedHistory = salesHistory.map((r) =>
      r.id === editingTransaction.id
        ? {
            ...editingTransaction,
            items: updatedRecordItems,
            total: editingTransaction.total,
          }
        : r
    );
    setSalesHistory(updatedHistory);
    setEditingTransaction(null);
    alert("訂單已修正，庫存與營收已更新。");
  };

  const deleteTransactionInModal = () => {
    if (window.confirm(`⚠️ 確定要刪除這筆交易嗎？\n\n庫存將會自動補回。`)) {
      const originalRecord = salesHistory.find(
        (r) => r.id === editingTransaction.id
      );
      const newInventory = inventory.map((stockItem) => {
        const soldItem = originalRecord.items.find(
          (rItem) => rItem.id === stockItem.id
        );
        if (soldItem)
          return {
            ...stockItem,
            quantity: stockItem.quantity + soldItem.cartQty,
          };
        return stockItem;
      });
      setInventory(newInventory);
      setSalesHistory(
        salesHistory.filter((r) => r.id !== editingTransaction.id)
      );
      setEditingTransaction(null);
    }
  };

  // --- 表單邏輯 ---
  const openAddModal = () => {
    setFormData({
      id: null,
      category: categories[0] || "",
      name: "",
      cost: "",
      price: "",
    });
    setFormDiscounts([]);
    setTempDiscount({ qty: "", price: "" });
    setModalMode("add");
  };

  const openEditModal = (item) => {
    setFormData({
      id: item.id,
      category: item.category,
      name: item.name,
      cost: item.cost,
      price: item.price,
    });
    setFormDiscounts(item.discounts ? [...item.discounts] : []);
    setTempDiscount({ qty: "", price: "" });
    setModalMode("edit");
  };

  const addDiscountRule = () => {
    const qty = parseInt(tempDiscount.qty);
    const price = parseInt(tempDiscount.price);
    if (qty > 1 && price > 0) {
      setFormDiscounts([...formDiscounts, { qty, price }]);
      setTempDiscount({ qty: "", price: "" });
    } else {
      alert("請輸入有效的數量(大於1)與金額");
    }
  };

  const removeDiscountRule = (index) => {
    setFormDiscounts(formDiscounts.filter((_, i) => i !== index));
  };

  const handleSaveForm = () => {
    if (!formData.name || !formData.category) {
      alert("請至少輸入「商品名稱」和「分類」！");
      return;
    }
    const newItemData = {
      category: formData.category,
      name: formData.name,
      cost: Number(formData.cost) || 0,
      price: Number(formData.price) || 0,
      discounts: [...formDiscounts],
    };

    if (modalMode === "add") {
      const itemToAdd = { ...newItemData, id: Date.now(), quantity: 0 };
      setInventory([...inventory, itemToAdd]);
      alert(`已新增：${itemToAdd.name}`);
    } else if (modalMode === "edit") {
      setInventory(
        inventory.map((item) =>
          item.id === formData.id ? { ...item, ...newItemData } : item
        )
      );
      alert(`已更新：${newItemData.name}`);
    }
    setModalMode("closed");
  };

  // --- POS & 結帳 ---
  const addToCart = (item) => {
    if (item.quantity <= 0) {
      alert("庫存不足！");
      return;
    }
    const existingItem = cart.find((c) => c.id === item.id);
    const currentCartQty = existingItem ? existingItem.cartQty : 0;
    if (currentCartQty >= item.quantity) {
      alert("已達庫存上限！");
      return;
    }

    if (existingItem) {
      setCart(
        cart.map((c) =>
          c.id === item.id ? { ...c, cartQty: c.cartQty + 1 } : c
        )
      );
    } else {
      setCart([...cart, { ...item, cartQty: 1 }]);
    }
  };

  const updateCartQty = (id, delta) => {
    setCart(
      cart.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.cartQty + delta);
          const stockItem = inventory.find((i) => i.id === id);
          if (stockItem && newQty > stockItem.quantity) return item;
          return { ...item, cartQty: newQty };
        }
        return item;
      })
    );
  };

  const cartTotal = cart.reduce(
    (acc, item) => acc + calculateItemSubtotal(item, item.cartQty),
    0
  );

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (!window.confirm(`總金額 $${cartTotal}，確定結帳嗎？`)) return;

    const newInventory = inventory.map((stockItem) => {
      const cartItem = cart.find((c) => c.id === stockItem.id);
      if (cartItem)
        return {
          ...stockItem,
          quantity: Math.max(0, stockItem.quantity - cartItem.cartQty),
        };
      return stockItem;
    });
    setInventory(newInventory);

    const recordItems = cart.map((item) => ({
      ...item,
      finalSubtotal: calculateItemSubtotal(item, item.cartQty),
    }));

    setSalesHistory([
      ...salesHistory,
      {
        id: Date.now(),
        date: new Date().toISOString(),
        total: cartTotal,
        items: recordItems,
      },
    ]);
    setCart([]);
    setIsCartOpen(false);
    alert("結帳完成！");
  };

  // --- 報表 ---
  const getTodayStats = () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const todaySales = salesHistory.filter((record) =>
      record.date.startsWith(todayStr)
    );
    const totalRevenue = todaySales.reduce(
      (acc, record) => acc + record.total,
      0
    );
    const totalOrders = todaySales.length;

    const itemSummary = {};
    todaySales.forEach((record) => {
      record.items.forEach((item) => {
        if (!itemSummary[item.name])
          itemSummary[item.name] = { qty: 0, revenue: 0 };
        itemSummary[item.name].qty += item.cartQty;
        itemSummary[item.name].revenue +=
          item.finalSubtotal || item.price * item.cartQty;
      });
    });
    const topItems = Object.entries(itemSummary)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.qty - a.qty);
    return { totalRevenue, totalOrders, topItems };
  };
  const todayStats = getTodayStats();
  const sortedHistory = [...salesHistory].sort((a, b) => b.id - a.id);

  const downloadReport = () => {
    const headers = "日期,訂單編號,商品名稱,數量,單價,成交小計\n";
    const rows = salesHistory
      .flatMap((record) =>
        record.items.map((item) => {
          const subtotal =
            item.finalSubtotal || calculateItemSubtotal(item, item.cartQty);
          return `${new Date(record.date).toLocaleString()},${record.id},${
            item.name
          },${item.cartQty},${item.price},${subtotal}`;
        })
      )
      .join("\n");
    const blob = new Blob(["\uFEFF" + headers + rows], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `銷售報表_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 確保每個分類都顯示，即使該分類目前沒有商品 (為了讓空的分類也能在倉庫模式顯示，方便管理)
  // 如果您只想顯示有商品的分類，可以改回 old logic。這裡使用 categories 作為主要循環依據。
  const displayCategories = categories;

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#fdfbf7] font-sans text-slate-700 pb-32">
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-100/60 rounded-full blur-3xl opacity-60 mix-blend-multiply"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-100/60 rounded-full blur-3xl opacity-60 mix-blend-multiply"></div>
      </div>

      <div className="relative z-10 max-w-md mx-auto min-h-screen flex flex-col p-5">
        {/* Header */}
        <header className="mb-6 flex justify-between items-start">
          <div className="flex-1">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  className="text-2xl font-bold bg-white/80 border border-emerald-300 rounded px-2 py-1 w-full focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={() => {
                    if (tempTitle.trim()) setAppTitle(tempTitle);
                    setIsEditingTitle(false);
                  }}
                  className="p-2 bg-emerald-500 text-white rounded-full"
                >
                  <Check size={16} />
                </button>
              </div>
            ) : (
              <h1
                className="text-3xl font-bold text-slate-800 flex items-center gap-2"
                style={{ fontFamily: '"Noto Serif TC", serif' }}
              >
                <span className="text-emerald-500 text-2xl">
                  <Store />
                </span>
                <span
                  onClick={() => {
                    setTempTitle(appTitle);
                    setIsEditingTitle(true);
                  }}
                  className="cursor-pointer hover:underline decoration-emerald-300 underline-offset-4 decoration-2"
                >
                  {appTitle}
                </span>
                <button
                  onClick={() => {
                    setTempTitle(appTitle);
                    setIsEditingTitle(true);
                  }}
                  className="text-slate-300 hover:text-emerald-500"
                >
                  <Edit3 size={16} />
                </button>
              </h1>
            )}
            <div className="flex items-center justify-between mt-1">
              <p className="text-slate-400 text-xs flex items-center gap-1">
                {activeTab === "pos" && "🛒 收銀模式"}
                {activeTab === "inventory" && "📦 倉庫管理"}
                {activeTab === "report" && "📊 營收報表"}
              </p>
              {/* 分類管理按鈕 (只在倉庫模式顯示) */}
              {activeTab === "inventory" && (
                <button
                  onClick={() => setIsCategoryManagerOpen(true)}
                  className="text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-lg flex items-center gap-1 hover:bg-emerald-100 transition-colors"
                >
                  <FolderCog size={14} /> 管理分類
                </button>
              )}
            </div>
          </div>
          {activeTab === "report" && (
            <button
              onClick={downloadReport}
              className="p-2 bg-white/60 hover:bg-white/90 backdrop-blur-sm rounded-full shadow-sm text-slate-500"
            >
              <Download size={20} />
            </button>
          )}
        </header>

        {/* 主列表 */}
        {(activeTab === "pos" || activeTab === "inventory") && (
          <div className="flex-1 space-y-8">
            {displayCategories.map((category) => {
              const itemsInCat = inventory.filter(
                (item) => item.category === category
              );
              // POS模式下，如果不顯示空分類，可以取消註解下面這行
              // if (activeTab === 'pos' && itemsInCat.length === 0) return null;

              return (
                <div key={category}>
                  <h2 className="text-sm font-bold text-slate-400 mb-3 pl-2 border-l-4 border-emerald-200/50 flex items-center gap-2">
                    {category}
                  </h2>
                  {itemsInCat.length === 0 ? (
                    <div className="text-slate-300 text-xs italic pl-4 mb-4">
                      此分類暫無商品
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {itemsInCat.map((item) => (
                        <div
                          key={item.id}
                          onClick={() =>
                            activeTab === "pos" ? addToCart(item) : null
                          }
                          className={`
                            bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border transition-all duration-200 relative
                            ${
                              activeTab === "pos"
                                ? "cursor-pointer active:scale-95 hover:border-emerald-300 hover:shadow-md"
                                : "border-slate-100"
                            }
                            ${item.quantity === 0 ? "opacity-60 grayscale" : ""}
                          `}
                        >
                          {activeTab === "inventory" && (
                            <div
                              className="absolute top-3 right-3 flex gap-1 z-20"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => openEditModal(item)}
                                className="p-2 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-full"
                              >
                                <Edit3 size={18} />
                              </button>
                              <button
                                onClick={() => deleteItem(item.id, item.name)}
                                className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          )}
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg text-slate-800 leading-tight pr-20">
                              {item.name}
                            </h3>
                          </div>
                          {item.discounts && item.discounts.length > 0 && (
                            <div className="mb-2 flex flex-wrap gap-1">
                              {item.discounts.map((d, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 bg-rose-100 text-rose-600 text-[10px] px-2 py-0.5 rounded-full font-bold"
                                >
                                  <Tag size={10} /> {d.qty}件${d.price}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-sm font-mono text-emerald-700 font-bold">
                                ${item.price}{" "}
                                {activeTab === "inventory" && (
                                  <span className="text-slate-400 text-xs font-normal ml-2">
                                    成本: ${item.cost}
                                  </span>
                                )}
                              </p>
                            </div>
                            <div className="text-right">
                              {activeTab === "pos" ? (
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    item.quantity > 0
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-rose-100 text-rose-700"
                                  }`}
                                >
                                  剩餘: {item.quantity}
                                </span>
                              ) : (
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingStockId(item.id);
                                    setTempStockQty(item.quantity.toString());
                                  }}
                                  className="flex items-center gap-2 cursor-pointer group"
                                >
                                  <PenLine
                                    size={14}
                                    className="text-slate-300 group-hover:text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                  />
                                  <span
                                    className={`text-2xl font-bold border-b-2 border-transparent hover:border-emerald-300 ${
                                      item.quantity === 0
                                        ? "text-rose-400"
                                        : "text-slate-700"
                                    }`}
                                  >
                                    {item.quantity}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          {activeTab === "inventory" && (
                            <div
                              className="mt-3 flex items-center gap-3 bg-slate-50/50 rounded-lg p-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="flex-1 py-2 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-400 hover:text-emerald-600"
                              >
                                <Minus size={16} />
                              </button>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="flex-1 py-2 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-400 hover:text-emerald-600"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* 處理未分類 (如果有商品分類不在 categories 列表中) */}
            {(() => {
              const orphanedItems = inventory.filter(
                (item) => !categories.includes(item.category)
              );
              if (orphanedItems.length > 0) {
                return (
                  <div>
                    <h2 className="text-sm font-bold text-slate-400 mb-3 pl-2 border-l-4 border-slate-200 flex items-center gap-2">
                      其他 / 未分類
                    </h2>
                    <div className="space-y-3">
                      {/* 這裡重複上面的 Item 渲染邏輯，為了簡化代碼省略，實際使用建議封裝成 Component */}
                      {orphanedItems.map((item) => (
                        <div
                          key={item.id}
                          className="bg-slate-100 p-4 rounded-xl text-center text-slate-500 text-sm"
                        >
                          <p className="font-bold">{item.name}</p>
                          <p className="text-xs">
                            此商品分類「{item.category}」已被刪除或不存在
                          </p>
                          {activeTab === "inventory" && (
                            <button
                              onClick={() => openEditModal(item)}
                              className="mt-2 text-emerald-600 underline"
                            >
                              編輯並重新分類
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
            })()}
          </div>
        )}

        {/* 報表 */}
        {activeTab === "report" && (
          <div className="flex-1 animate-in fade-in duration-300 pb-20">
            <div className="bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl p-6 text-white shadow-lg mb-6 relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-violet-100 text-sm mb-1 flex items-center gap-2">
                  <TrendingUp size={16} /> 今日營業額
                </p>
                <h2 className="text-4xl font-bold mb-4">
                  ${todayStats.totalRevenue.toLocaleString()}
                </h2>
                <div className="flex gap-4 text-sm border-t border-white/20 pt-4">
                  <div>
                    <p className="text-violet-200">訂單數</p>
                    <p className="font-bold text-xl">
                      {todayStats.totalOrders}
                    </p>
                  </div>
                  <div>
                    <p className="text-violet-200">售出數</p>
                    <p className="font-bold text-xl">
                      {todayStats.topItems.reduce((acc, i) => acc + i.qty, 0)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute right-[-20px] bottom-[-20px] opacity-20 text-white">
                <BarChart3 size={150} />
              </div>
            </div>
            <h3 className="text-slate-500 font-bold mb-3 flex items-center gap-2">
              <History size={18} /> 今日熱銷
            </h3>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-100 overflow-hidden mb-8">
              {todayStats.topItems.length > 0 ? (
                todayStats.topItems.map((item, index) => (
                  <div
                    key={item.name}
                    className="flex justify-between items-center p-4 border-b last:border-b-0 border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                          index < 3
                            ? "bg-amber-100 text-amber-600"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-bold text-slate-700">{item.name}</p>
                        <p className="text-xs text-slate-400">
                          售出 {item.qty}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-emerald-600">
                      ${item.revenue}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-400 text-sm">
                  尚無資料
                </div>
              )}
            </div>
            <h3 className="text-slate-500 font-bold mb-3 flex items-center gap-2">
              <Clock size={18} /> 近期交易紀錄
            </h3>
            <div className="space-y-3">
              {sortedHistory.length > 0 ? (
                sortedHistory.map((record) => (
                  <div
                    key={record.id}
                    className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center"
                  >
                    <div>
                      <p className="text-xs text-slate-400 mb-1">
                        {new Date(record.date).toLocaleString()}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700 text-lg">
                          ${record.total}
                        </span>
                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full">
                          {record.items.length} 項商品
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 truncate w-40">
                        {record.items.map((i) => i.name).join(", ")}
                      </p>
                    </div>
                    <button
                      onClick={() => openEditTransaction(record)}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-slate-50 rounded-lg flex flex-col items-center gap-1 transition-colors"
                    >
                      <FileEdit size={18} />
                      <span className="text-[10px] font-bold">編輯</span>
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-400 py-10">
                  暫無交易紀錄
                </div>
              )}
            </div>
          </div>
        )}

        {/* 底部導航 */}
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-md p-1 rounded-full shadow-2xl border border-slate-100 flex gap-1 z-40">
          <button
            onClick={() => setActiveTab("pos")}
            className={`flex items-center gap-2 px-4 py-3 rounded-full transition-all ${
              activeTab === "pos"
                ? "bg-emerald-500 text-white shadow-lg"
                : "text-slate-400 hover:bg-slate-100"
            }`}
          >
            <ShoppingCart size={20} />{" "}
            <span className="font-bold text-sm hidden sm:block">收銀</span>
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`flex items-center gap-2 px-4 py-3 rounded-full transition-all ${
              activeTab === "inventory"
                ? "bg-amber-400 text-white shadow-lg"
                : "text-slate-400 hover:bg-slate-100"
            }`}
          >
            <Package size={20} />{" "}
            <span className="font-bold text-sm hidden sm:block">倉庫</span>
          </button>
          <button
            onClick={() => setActiveTab("report")}
            className={`flex items-center gap-2 px-4 py-3 rounded-full transition-all ${
              activeTab === "report"
                ? "bg-violet-500 text-white shadow-lg"
                : "text-slate-400 hover:bg-slate-100"
            }`}
          >
            <BarChart3 size={20} />{" "}
            <span className="font-bold text-sm hidden sm:block">報表</span>
          </button>
        </div>

        {/* 分類管理 Modal */}
        {isCategoryManagerOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsCategoryManagerOpen(false)}
          >
            <div
              className="bg-white w-4/5 max-w-sm p-6 rounded-2xl shadow-2xl h-[60vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                  <FolderCog size={20} /> 分類管理
                </h3>
                <button
                  onClick={() => setIsCategoryManagerOpen(false)}
                  className="p-1 text-slate-400 hover:bg-slate-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="新增分類名稱..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-400 text-sm"
                />
                <button
                  onClick={addCategory}
                  className="bg-emerald-500 text-white p-2 rounded-lg"
                >
                  <Plus size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {categories.map((cat) => (
                  <div
                    key={cat}
                    className="flex justify-between items-center bg-slate-50 p-3 rounded-lg group"
                  >
                    {editingCategory.original === cat ? (
                      <div className="flex items-center gap-2 w-full">
                        <input
                          type="text"
                          value={editingCategory.current}
                          onChange={(e) =>
                            setEditingCategory({
                              ...editingCategory,
                              current: e.target.value,
                            })
                          }
                          className="flex-1 p-1 border rounded text-sm"
                          autoFocus
                        />
                        <button
                          onClick={saveEditCategory}
                          className="text-emerald-600"
                        >
                          <Check size={18} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="font-bold text-slate-700">{cat}</span>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEditCategory(cat)}
                            className="text-slate-400 hover:text-emerald-600"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => deleteCategory(cat)}
                            className="text-slate-400 hover:text-rose-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-4 text-center">
                提示：修改分類名稱會同步更新相關商品
              </p>
            </div>
          </div>
        )}

        {/* 交易編輯 Modal */}
        {editingTransaction && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setEditingTransaction(null)}
          >
            <div
              className="bg-white w-full max-w-md h-[80vh] rounded-t-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <FileEdit className="text-emerald-500" /> 修正訂單
                </h3>
                <button
                  onClick={() => setEditingTransaction(null)}
                  className="p-2 bg-slate-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 bg-amber-50 border-b border-amber-100 text-xs text-amber-700 flex gap-2 items-center">
                <RotateCcw size={14} />
                <span>系統將自動計算差額並修正庫存。</span>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {editingTransaction.items.map((item) => {
                  const subtotal = calculateItemSubtotal(item, item.cartQty);
                  return (
                    <div
                      key={item.id}
                      className="flex justify-between items-center bg-slate-50 p-4 rounded-xl"
                    >
                      <div>
                        <h4 className="font-bold text-slate-700">
                          {item.name}
                        </h4>
                        <span className="text-slate-400 text-xs font-mono">
                          ${item.price}/個
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center bg-white rounded-lg border">
                          <button
                            onClick={() =>
                              updateTransactionItemQty(item.id, -1)
                            }
                            className="p-2 text-slate-400 hover:text-emerald-600"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center font-bold">
                            {item.cartQty}
                          </span>
                          <button
                            onClick={() => updateTransactionItemQty(item.id, 1)}
                            className="p-2 text-slate-400 hover:text-emerald-600"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <p className="text-emerald-600 font-bold text-lg">
                          ${subtotal}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-6 bg-white border-t shadow-[0_-4px_20px_rgba(0,0,0,0.05)] space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">修正後總金額</span>
                  <span className="text-3xl font-bold text-slate-800">
                    ${editingTransaction.total}
                  </span>
                </div>
                <button
                  onClick={saveTransactionEdit}
                  className="w-full py-4 bg-emerald-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-600 active:scale-95 transition-all"
                >
                  儲存變更 (修正庫存)
                </button>
                <button
                  onClick={deleteTransactionInModal}
                  className="w-full py-3 bg-white text-rose-500 border border-rose-200 font-bold rounded-xl hover:bg-rose-50 transition-all"
                >
                  刪除此訂單 (退貨)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* POS 購物車浮動按鈕 */}
        {activeTab === "pos" && cart.length > 0 && !editingTransaction && (
          <div className="fixed bottom-24 left-6 right-6 z-30">
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-full bg-slate-800 text-white p-4 rounded-2xl shadow-xl flex justify-between items-center transform transition-transform active:scale-95"
            >
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                  {cart.reduce((acc, i) => acc + i.cartQty, 0)}
                </div>
                <span className="font-bold">查看購物車</span>
              </div>
              <span className="text-xl font-bold">${cartTotal}</span>
            </button>
          </div>
        )}

        {/* Cart Modal */}
        {isCartOpen && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsCartOpen(false)}
          >
            <div
              className="bg-white w-full max-w-md h-[80vh] rounded-t-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <ShoppingBag className="text-emerald-500" /> 結帳清單
                </h3>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 bg-slate-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.map((item) => {
                  const subtotal = calculateItemSubtotal(item, item.cartQty);
                  return (
                    <div
                      key={item.id}
                      className="flex justify-between items-center bg-slate-50 p-4 rounded-xl"
                    >
                      <div>
                        <h4 className="font-bold text-slate-700">
                          {item.name}
                        </h4>
                        <span className="text-slate-400 text-xs font-mono">
                          ${item.price}/個
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              setCart(cart.filter((c) => c.id !== item.id))
                            }
                            className="text-rose-400 p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                          <div className="flex items-center bg-white rounded-lg border">
                            <button
                              onClick={() => updateCartQty(item.id, -1)}
                              className="p-2 text-slate-400 hover:text-emerald-600"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center font-bold">
                              {item.cartQty}
                            </span>
                            <button
                              onClick={() => updateCartQty(item.id, 1)}
                              className="p-2 text-slate-400 hover:text-emerald-600"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                        <p className="text-emerald-600 font-bold text-lg">
                          ${subtotal}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-6 bg-white border-t shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-500">總金額</span>
                  <span className="text-3xl font-bold text-slate-800">
                    ${cartTotal}
                  </span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full py-4 bg-emerald-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-600 active:scale-95 transition-all"
                >
                  確認結帳
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stock Edit Modal */}
        {editingStockId !== null && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setEditingStockId(null)}
          >
            <div
              className="bg-white w-4/5 max-w-sm p-6 rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-slate-700 mb-4">
                修改庫存數量
              </h3>
              <input
                type="number"
                value={tempStockQty}
                onChange={(e) => setTempStockQty(e.target.value)}
                className="w-full p-4 text-3xl text-center font-bold bg-slate-50 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-none mb-6"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setEditingStockId(null)}
                  className="flex-1 py-3 bg-slate-100 text-slate-500 font-bold rounded-xl"
                >
                  取消
                </button>
                <button
                  onClick={saveStockEdit}
                  className="flex-1 py-3 bg-emerald-500 text-white font-bold rounded-xl"
                >
                  儲存
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 新增/編輯商品 Modal (使用下拉選單) */}
        {modalMode !== "closed" && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/20 backdrop-blur-sm"
            onClick={() => setModalMode("closed")}
          >
            <div
              className="bg-white w-full max-w-md p-6 rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom-10 overflow-y-auto max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-700">
                  {modalMode === "add" ? "進貨入庫" : "編輯商品內容"}
                </h3>
                <button
                  onClick={() => setModalMode("closed")}
                  className="p-1 text-slate-400 hover:bg-slate-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                {/* 分類選擇改為下拉選單 */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    分類
                  </label>
                  <div className="relative">
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full p-3 bg-slate-50 border-none rounded-xl outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-400 appearance-none"
                    >
                      <option value="" disabled>
                        請選擇分類...
                      </option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-400">
                      ▼
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    商品名稱
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="例如: 300g 水彩紙"
                    className="w-full p-3 bg-slate-50 border-none rounded-xl outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      成本 ($)
                    </label>
                    <input
                      type="number"
                      value={formData.cost}
                      onChange={(e) =>
                        setFormData({ ...formData, cost: e.target.value })
                      }
                      className="w-full p-3 bg-slate-50 border-none rounded-xl outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      單價 ($)
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="w-full p-3 bg-slate-50 border-none rounded-xl outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                </div>
                <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
                  <h4 className="text-sm font-bold text-rose-600 mb-2 flex items-center gap-1">
                    <Tag size={14} /> 多重優惠設定 (選填)
                  </h4>
                  {formDiscounts.length > 0 && (
                    <div className="mb-3 space-y-2">
                      {formDiscounts.map((d, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center bg-white p-2 rounded-lg text-sm shadow-sm"
                        >
                          <span className="text-slate-600 font-medium">
                            {d.qty} 件總價 ${d.price}
                          </span>
                          <button
                            onClick={() => removeDiscountRule(index)}
                            className="text-rose-400 hover:text-rose-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="block text-[10px] font-medium text-slate-500 mb-1">
                        件數
                      </label>
                      <input
                        type="number"
                        placeholder="例如 3"
                        value={tempDiscount.qty}
                        onChange={(e) =>
                          setTempDiscount({
                            ...tempDiscount,
                            qty: e.target.value,
                          })
                        }
                        className="w-full p-2 bg-white border-none rounded-lg outline-none ring-1 ring-rose-200 focus:ring-2 focus:ring-rose-400 text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] font-medium text-slate-500 mb-1">
                        總價
                      </label>
                      <input
                        type="number"
                        placeholder="例如 100"
                        value={tempDiscount.price}
                        onChange={(e) =>
                          setTempDiscount({
                            ...tempDiscount,
                            price: e.target.value,
                          })
                        }
                        className="w-full p-2 bg-white border-none rounded-lg outline-none ring-1 ring-rose-200 focus:ring-2 focus:ring-rose-400 text-sm"
                      />
                    </div>
                    <button
                      onClick={addDiscountRule}
                      className="p-2 bg-rose-500 text-white rounded-lg shadow hover:bg-rose-600 mb-[1px]"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleSaveForm}
                  className="w-full mt-2 py-3 bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  {modalMode === "add" ? "確認新增" : "儲存修改"}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "inventory" && modalMode === "closed" && (
          <div className="fixed bottom-24 right-6 z-30">
            <button
              onClick={openAddModal}
              className="bg-slate-800 text-white p-4 rounded-full shadow-lg shadow-slate-300/50"
            >
              <PlusCircle size={24} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryApp;
