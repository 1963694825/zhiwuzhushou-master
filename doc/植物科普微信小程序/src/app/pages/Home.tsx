import { useState } from "react";
import { useNavigate } from "react-router";
import { Search, Camera, Flower2, BookOpen, Calendar, Award } from "lucide-react";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleImageUpload = () => {
    // 模拟图片上传功能
    alert("图片上传功能（需要真实环境支持）");
  };

  const quickActions = [
    { icon: Flower2, label: "花草识别", color: "bg-blue-500" },
    { icon: BookOpen, label: "养护指南", color: "bg-green-500" },
    { icon: Calendar, label: "每日一花", color: "bg-orange-500" },
    { icon: Award, label: "植物医生", color: "bg-red-500" },
  ];

  const recommendations = [
    {
      id: 1,
      title: "多肉养护指南",
      description: "新手也能轻松掌握的秘籍",
      image: "https://images.unsplash.com/photo-1759422714268-0805b53525b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRvb3IlMjBwbGFudCUyMGNhcmUlMjBndWlkZXxlbnwxfHx8fDE3NzAwMDQ4MTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      badge: "推荐",
    },
    {
      id: 2,
      title: "春季室内植物图",
      description: "带你发现身边的美天",
      image: "https://images.unsplash.com/photo-1763784436630-629fd9a4e0e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdWNjdWxlbnQlMjBjYWN0dXMlMjBwb3R0ZWQlMjBwbGFudHxlbnwxfHx8fDE3NzAwMDQ4MTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      badge: "推荐",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Logo和标题区域 */}
      <div className="flex flex-col items-center pt-8 pb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
          <Flower2 className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-xl mb-1">植物百科</h1>
        <p className="text-sm text-gray-500">探索大自然的奥秘</p>
      </div>

      {/* 搜索框 */}
      <div className="px-5 mb-8">
        <form onSubmit={handleSearch} className="relative">
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-3 shadow-sm">
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="搜索植物名称，例如：兰花"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-400"
            />
            <button
              type="button"
              onClick={handleImageUpload}
              className="ml-2 p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
            >
              <Camera className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </form>
      </div>

      {/* 快捷功能 */}
      <div className="px-5 mb-6">
        <div className="grid grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className="flex flex-col items-center"
            >
              <div className={`${action.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-2 shadow-md hover:scale-105 transition-transform`}>
                <action.icon className="w-7 h-7 text-white" />
              </div>
              <span className="text-xs text-gray-700">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 今日推荐 */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-2">
              <span className="text-orange-500 text-sm">☀</span>
            </div>
            <h2 className="text-base">今日推荐</h2>
          </div>
          <button className="text-sm text-gray-500">查看更多</button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {recommendations.map((item) => (
            <div
              key={item.id}
              className="bg-gradient-to-br from-pink-50 to-blue-50 rounded-2xl overflow-hidden shadow-sm"
            >
              <div className="relative">
                {item.badge && (
                  <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-32 object-cover"
                />
              </div>
              <div className="p-3">
                <h3 className="text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
