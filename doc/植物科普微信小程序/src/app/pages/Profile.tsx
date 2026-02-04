import { 
  User, 
  ShoppingBag, 
  Heart, 
  Package, 
  Store,
  CreditCard,
  Tag,
  Truck,
  Award,
  MapPin,
  MessageCircle,
  Wallet,
  Gift,
  FileText,
  MoreHorizontal
} from "lucide-react";

export default function Profile() {
  const orderStats = [
    { label: "待付款", icon: CreditCard, count: 0, color: "text-orange-500" },
    { label: "待收货", icon: Package, count: 0, color: "text-blue-500" },
    { label: "待发货", icon: Truck, count: 0, color: "text-green-500" },
    { label: "待评价", icon: MessageCircle, count: 0, color: "text-purple-500" },
    { label: "售后", icon: Award, count: 0, color: "text-red-500" },
  ];

  const serviceTools = [
    { label: "我的钱包", icon: Wallet, color: "text-blue-500" },
    { label: "领券中心", icon: Gift, color: "text-red-500" },
    { label: "售后标准", icon: FileText, color: "text-green-500" },
    { label: "包装费说明", icon: Tag, color: "text-orange-500" },
    { label: "运费查询", icon: Truck, color: "text-cyan-500" },
    { label: "等级标准", icon: Award, color: "text-purple-500" },
    { label: "收货地址", icon: MapPin, color: "text-pink-500" },
    { label: "投诉建议", icon: MessageCircle, color: "text-indigo-500" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部标题栏 */}
      <div className="bg-white px-4 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <h1 className="text-lg">个人中心</h1>
        <button>
          <MoreHorizontal className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* 用户信息区 */}
      <div className="bg-gradient-to-br from-pink-50 to-purple-50 px-5 py-6 mb-2">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mr-4">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <div className="flex-1">
            <button className="text-base mb-1">登录/注册</button>
          </div>
        </div>

        {/* 快捷入口 */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <button className="flex flex-col items-center">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-2 shadow-sm">
              <ShoppingBag className="w-6 h-6 text-gray-600" />
            </div>
            <span className="text-xs text-gray-700">常购清单</span>
          </button>
          <button className="flex flex-col items-center">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-2 shadow-sm">
              <Heart className="w-6 h-6 text-gray-600" />
            </div>
            <span className="text-xs text-gray-700">商品收藏</span>
          </button>
          <button className="flex flex-col items-center">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-2 shadow-sm">
              <Package className="w-6 h-6 text-gray-600" />
            </div>
            <span className="text-xs text-gray-700">常用品种</span>
          </button>
          <button className="flex flex-col items-center">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-2 shadow-sm">
              <Store className="w-6 h-6 text-gray-600" />
            </div>
            <span className="text-xs text-gray-700">店铺收藏</span>
          </button>
        </div>
      </div>

      {/* 优惠信息横幅 */}
      <div className="bg-gradient-to-r from-orange-400 to-red-400 mx-4 mb-2 rounded-xl p-4 flex items-center shadow-sm">
        <div className="w-10 h-10 bg-white bg-opacity-30 rounded-lg flex items-center justify-center mr-3">
          <span className="text-2xl">📢</span>
        </div>
        <p className="flex-1 text-white text-sm">花农直供0加价－专注鲜花供应链</p>
      </div>

      {/* 我的订单 */}
      <div className="bg-white mx-4 rounded-xl p-4 mb-2 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base">我的订单</h2>
          <button className="text-sm text-gray-500 flex items-center">
            全部订单
            <span className="ml-1">›</span>
          </button>
        </div>
        <div className="flex justify-between">
          {orderStats.map((stat, index) => (
            <button key={index} className="flex flex-col items-center flex-1">
              <div className="relative mb-2">
                <stat.icon className={`w-7 h-7 ${stat.color}`} />
                {stat.count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                    {stat.count}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-700">{stat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 客服热线 */}
      <div className="bg-white mx-4 rounded-xl p-4 mb-2 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base">客服热线 (09:00-18:00)</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center flex-shrink-0">
            <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center mr-3">
              <span className="text-red-500">📞</span>
            </div>
            <span className="text-sm tracking-wider whitespace-nowrap">153 9867 5476</span>
          </div>
          <button className="px-3 py-2 bg-green-500 text-white rounded-lg text-sm shadow-sm hover:bg-green-600 transition-colors whitespace-nowrap flex items-center gap-1 flex-shrink-0">
            <MessageCircle className="w-4 h-4" />
            <span>在线客服</span>
          </button>
          <img 
            src="https://images.unsplash.com/photo-1711715337544-e6c99dbd801a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMHBsYW50JTIwbG9nbyUyMGljb258ZW58MXx8fHwxNzcwMDA0ODE0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="客服"
            className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
          />
        </div>
      </div>

      {/* 服务与工具 */}
      <div className="bg-white mx-4 rounded-xl p-4 shadow-sm">
        <h2 className="text-base mb-4">服务与工具</h2>
        <div className="grid grid-cols-4 gap-6">
          {serviceTools.map((tool, index) => (
            <button key={index} className="flex flex-col items-center">
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-2 hover:bg-gray-100 transition-colors">
                <tool.icon className={`w-6 h-6 ${tool.color}`} />
              </div>
              <span className="text-xs text-gray-700 text-center">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}