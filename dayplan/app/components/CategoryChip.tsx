import { Category } from "../types";

const CHIP_STYLES: Record<Category, string> = {
  bedding: "bg-blue-100 text-blue-800 border-blue-200",
  pharmacy: "bg-red-100 text-red-800 border-red-200",
  garden: "bg-green-100 text-green-800 border-green-200",
  household: "bg-yellow-100 text-yellow-800 border-yellow-200",
  food: "bg-orange-100 text-orange-800 border-orange-200",
  leisure: "bg-purple-100 text-purple-800 border-purple-200",
};

const CHIP_LABELS: Record<Category, string> = {
  bedding: "🛏 Bedding",
  pharmacy: "💊 Pharmacy",
  garden: "🌱 Garden",
  household: "🏠 Household",
  food: "🍜 Food",
  leisure: "🛍 Leisure",
};

interface Props {
  category: Category;
  active?: boolean;
  onClick?: () => void;
}

export default function CategoryChip({ category, active, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border
        transition-all duration-150
        ${CHIP_STYLES[category]}
        ${active ? "ring-2 ring-offset-1 ring-current scale-105" : "opacity-80 hover:opacity-100"}
        ${onClick ? "cursor-pointer" : "cursor-default"}
      `}
    >
      {CHIP_LABELS[category]}
    </button>
  );
}

export { CHIP_LABELS, CHIP_STYLES };
