import { useState } from "react";
import { Search, ChevronDown, BookOpen } from "lucide-react";

export default function Knowledge() {
  const [selectedCategory, setSelectedCategory] = useState("全部知识");

  const categories = [
    "养护技巧",
    "病虫防治",
    "品种介绍",
    "季节管理",
    "土壤肥料",
    "繁殖方法",
    "修剪造型",
    "常见问题",
  ];

  const articles = [
    {
      id: 1,
      title: "兰花养护完全指南",
      badge: "养护技巧",
      description: "从选购到日常养护，让你的兰花健康成长",
      image: "https://images.unsplash.com/photo-1694903734775-d7fb295f4e00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmNoaWQlMjBmbG93ZXIlMjBpbmRvb3IlMjBwbGFudHxlbnwxfHx8fDE3NzAwMDQ4MTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      views: "2.3k",
      time: "2天前",
    },
    {
      id: 2,
      title: "多肉植物浇水的黄金法则",
      badge: "养护技巧",
      description: "掌握浇水技巧，避免多肉烂根",
      image: "https://images.unsplash.com/photo-1763784436630-629fd9a4e0e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdWNjdWxlbnQlMjBjYWN0dXMlMjBwb3R0ZWQlMjBwbGFudHxlbnwxfHx8fDE3NzAwMDQ4MTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      views: "5.1k",
      time: "3天前",
    },
    {
      id: 3,
      title: "春季室内植物施肥指南",
      badge: "土壤肥料",
      description: "春天到了，给植物补充营养正当时",
      image: "https://images.unsplash.com/photo-1651807193045-1b366e7f347f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGFudCUyMGZlcnRpbGl6ZXIlMjBwb3R8ZW58MXx8fHwxNzcwMDA0ODE1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      views: "1.8k",
      time: "5天前",
    },
    {
      id: 4,
      title: "室内植物常见病虫害识别",
      badge: "病虫防治",
      description: "及时发现问题，让植物远离病虫害",
      image: "https://images.unsplash.com/photo-1759422714268-0805b53525b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRvb3IlMjBwbGFudCUyMGNhcmUlMjBndWlkZXxlbnwxfHx8fDE3NzAwMDQ4MTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      views: "3.2k",
      time: "1周前",
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
              placeholder="搜索种植知识"
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
            全部知识
          </button>
          <button className="px-4 py-1.5 text-gray-600 rounded-full text-sm whitespace-nowrap">
            热门推荐
          </button>
          <button className="px-4 py-1.5 text-gray-600 rounded-full text-sm whitespace-nowrap">
            最新发布
          </button>
          <button className="px-3 py-1.5 text-gray-600">
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex">
        {/* 左侧分类 */}
        <div className="w-24 bg-white border-r border-gray-100">
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

        {/* 右侧文章列表 */}
        <div className="flex-1 p-3">
          <div className="space-y-3">
            {articles.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-lg p-3 flex gap-3 shadow-sm"
              >
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <span className="inline-block px-2 py-0.5 bg-green-50 text-green-600 text-xs rounded mb-1">
                      {article.badge}
                    </span>
                    <h3 className="text-sm mb-1">{article.title}</h3>
                    <p className="text-xs text-gray-500">{article.description}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {article.views}
                      </span>
                      <span>{article.time}</span>
                    </div>
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
