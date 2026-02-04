import { useSearchParams, useNavigate } from "react-router";
import { ArrowLeft, Flower2 } from "lucide-react";

export default function SearchResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";

  // 模拟植物品种数据
  const plantVarieties: Record<string, Array<{ name: string; latinName: string; image: string; description: string }>> = {
    "兰花": [
      {
        name: "蝴蝶兰",
        latinName: "Phalaenopsis",
        image: "https://images.unsplash.com/photo-1694903734775-d7fb295f4e00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmNoaWQlMjBmbG93ZXIlMjBpbmRvb3IlMjBwbGFudHxlbnwxfHx8fDE3NzAwMDQ4MTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        description: "花形优美，色彩艳丽，是最受欢迎的兰花品种之一",
      },
      {
        name: "鬼兰",
        latinName: "Dendrophylax lindenii",
        image: "https://images.unsplash.com/photo-1694903734775-d7fb295f4e00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmNoaWQlMjBmbG93ZXIlMjBpbmRvb3IlMjBwbGFudHxlbnwxfHx8fDE3NzAwMDQ4MTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        description: "珍稀濒危品种，花朵洁白神秘",
      },
      {
        name: "卡特兰",
        latinName: "Cattleya",
        image: "https://images.unsplash.com/photo-1694903734775-d7fb295f4e00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmNoaWQlMjBmbG93ZXIlMjBpbmRvb3IlMjBwbGFudHxlbnwxfHx8fDE3NzAwMDQ4MTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        description: "被誉为'兰花之王'，花大色艳，香气浓郁",
      },
      {
        name: "石斛兰",
        latinName: "Dendrobium",
        image: "https://images.unsplash.com/photo-1694903734775-d7fb295f4e00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmNoaWQlMjBmbG93ZXIlMjBpbmRvb3IlMjBwbGFudHxlbnwxfHx8fDE3NzAwMDQ4MTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        description: "药用价值高，观赏性强",
      },
      {
        name: "文心兰",
        latinName: "Oncidium",
        image: "https://images.unsplash.com/photo-1694903734775-d7fb295f4e00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmNoaWQlMjBmbG93ZXIlMjBpbmRvb3IlMjBwbGFudHxlbnwxfHx8fDE3NzAwMDQ4MTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        description: "花朵小巧密集，色彩鲜艳",
      },
      {
        name: "兜兰",
        latinName: "Paphiopedilum",
        image: "https://images.unsplash.com/photo-1694903734775-d7fb295f4e00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmNoaWQlMjBmbG93ZXIlMjBpbmRvb3IlMjBwbGFudHxlbnwxfHx8fDE3NzAwMDQ4MTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        description: "花形独特，似拖鞋状",
      },
    ],
    "多肉": [
      {
        name: "景天",
        latinName: "Sedum",
        image: "https://images.unsplash.com/photo-1763784436630-629fd9a4e0e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdWNjdWxlbnQlMjBjYWN0dXMlMjBwb3R0ZWQlMjBwbGFudHxlbnwxfHx8fDE3NzAwMDQ4MTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        description: "叶片肥厚，易于养护",
      },
      {
        name: "生石花",
        latinName: "Lithops",
        image: "https://images.unsplash.com/photo-1763784436630-629fd9a4e0e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdWNjdWxlbnQlMjBjYWN0dXMlMjBwb3R0ZWQlMjBwbGFudHxlbnwxfHx8fDE3NzAwMDQ4MTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        description: "形似石头，造型奇特",
      },
      {
        name: "芦荟",
        latinName: "Aloe",
        image: "https://images.unsplash.com/photo-1763784436630-629fd9a4e0e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdWNjdWxlbnQlMjBjYWN0dXMlMjBwb3R0ZWQlMjBwbGFudHxlbnwxfHx8fDE3NzAwMDQ4MTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        description: "药用价值高，美容护肤",
      },
      {
        name: "仙人掌",
        latinName: "Cactaceae",
        image: "https://images.unsplash.com/photo-1763784436630-629fd9a4e0e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdWNjdWxlbnQlMjBjYWN0dXMlMjBwb3R0ZWQlMjBwbGFudHxlbnwxfHx8fDE3NzAwMDQ4MTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        description: "耐旱抗旱，形态多样",
      },
    ],
  };

  // 查找匹配的植物品种
  const findVarieties = () => {
    const lowerQuery = query.toLowerCase();
    for (const [key, varieties] of Object.entries(plantVarieties)) {
      if (key.includes(lowerQuery) || lowerQuery.includes(key)) {
        return { category: key, varieties };
      }
    }
    // 如果没有精确匹配，返回兰花作为默认示例
    return { category: "搜索结果", varieties: plantVarieties["兰花"] };
  };

  const { category, varieties } = findVarieties();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="bg-white px-4 py-4 flex items-center sticky top-0 z-10 shadow-sm">
        <button onClick={() => navigate(-1)} className="mr-4">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-base flex-1">
          搜索 "{query}" - {category}品种
        </h1>
      </div>

      {/* 搜索结果统计 */}
      <div className="px-4 py-3 bg-green-50 border-b border-green-100">
        <p className="text-sm text-green-700">
          为您找到 <span className="font-semibold">{varieties.length}</span> 个相关品种
        </p>
      </div>

      {/* 品种列表 */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {varieties.map((variety, index) => (
            <div
              key={index}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative">
                <img
                  src={variety.image}
                  alt={variety.name}
                  className="w-full h-40 object-cover"
                />
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                  {category}
                </div>
              </div>
              <div className="p-3">
                <h3 className="text-base mb-1 flex items-center">
                  <Flower2 className="w-4 h-4 mr-1 text-green-500" />
                  {variety.name}
                </h3>
                <p className="text-xs text-gray-400 italic mb-2">{variety.latinName}</p>
                <p className="text-xs text-gray-600 line-clamp-2">{variety.description}</p>
                <button className="mt-3 w-full bg-green-50 text-green-600 py-2 rounded-lg text-sm hover:bg-green-100 transition-colors">
                  查看详情
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 底部提示 */}
      <div className="px-4 py-6 text-center">
        <p className="text-sm text-gray-400">已经到底了～</p>
      </div>
    </div>
  );
}
