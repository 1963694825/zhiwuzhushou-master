import { useState } from "react";
import { Search, ChevronDown, ShoppingCart } from "lucide-react";

export default function Shop() {
  const [selectedCategory, setSelectedCategory] = useState("全部商品");

  const categories = [
    "分销摄像机",
    "分销球机",
    "分销NVR",
    "工具/辅材",
    "显示产品",
    "操作系统",
    "交换机",
    "解码/处理器",
  ];

  const products = [
    {
      id: 1,
      name: "蝴蝶兰盆栽",
      badge: "天地伟业",
      specs: "TC-C13DU 配置:W/E/Y/4...",
      price: 219.0,
      image: "https://images.unsplash.com/photo-1694903734775-d7fb295f4e00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmNoaWQlMjBmbG93ZXIlMjBpbmRvb3IlMjBwbGFudHxlbnwxfHx8fDE3NzAwMDQ4MTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      id: 2,
      name: "多肉组合盆栽",
      badge: "天地伟业",
      specs: "TC-C15DU 配置:W/Y/6m...",
      price: 348.0,
      image: "https://images.unsplash.com/photo-1763784436630-629fd9a4e0e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdWNjdWxlbnQlMjBjYWN0dXMlMjBwb3R0ZWQlMjBwbGFudHxlbnwxfHx8fDE3NzAwMDQ4MTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      id: 3,
      name: "室内绿植套装",
      badge: "天地伟业",
      specs: "TC-C13DU 配置:W/Y/4m...",
      price: 200.0,
      image: "https://images.unsplash.com/photo-1651807193045-1b366e7f347f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGFudCUyMGZlcnRpbGl6ZXIlMjBwb3R8ZW58MXx8fHwxNzcwMDA0ODE1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      id: 4,
      name: "养护工具套装",
      badge: "天地伟业",
      specs: "TC-C15DU 配置:W/E/Y/4...",
      price: 368.0,
      image: "https://images.unsplash.com/photo-1759422714268-0805b53525b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRvb3IlMjBwbGFudCUyMGNhcmUlMjBndWlkZXxlbnwxfHx8fDE3NzAwMDQ4MTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 搜索栏 */}
      <div className="bg-white px-4 pt-3 pb-3 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 py-2">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="请输入商品名称"
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-400"
            />
          </div>
          <button className="p-2">
            <div className="w-5 h-5 grid grid-cols-2 gap-0.5">
              <div className="w-2 h-2 bg-gray-400 rounded-sm"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-sm"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-sm"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-sm"></div>
            </div>
          </button>
        </div>

        {/* 分类标签 */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button className="px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-sm whitespace-nowrap border border-green-200">
            全部商品
          </button>
          <button className="px-4 py-1.5 text-gray-600 rounded-full text-sm whitespace-nowrap">
            超黑光
          </button>
          <button className="px-4 py-1.5 text-gray-600 rounded-full text-sm whitespace-nowrap">
            电商专用
          </button>
          <button className="px-3 py-1.5 text-gray-600">
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex">
        {/* 左侧分类 */}
        <div className="w-24 bg-white border-r border-gray-100 min-h-[calc(100vh-180px)]">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`w-full py-4 text-xs text-center border-b border-gray-50 transition-colors ${
                selectedCategory === category
                  ? "bg-gray-50 text-green-600"
                  : "text-gray-600"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* 右侧商品列表 */}
        <div className="flex-1 p-3">
          <div className="space-y-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg p-3 flex gap-3 shadow-sm"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <span className="inline-block px-2 py-0.5 bg-green-50 text-green-600 text-xs rounded mb-1">
                      {product.badge}
                    </span>
                    <h3 className="text-sm mb-1">{product.name}</h3>
                    <p className="text-xs text-gray-500">{product.specs}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline">
                      <span className="text-red-500 text-xs">¥</span>
                      <span className="text-red-500 text-xl">{product.price.toFixed(2)}</span>
                    </div>
                    <button className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                      <ShoppingCart className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}