"use client";

export type CategoryFilter = "all" | "CREACIONAL" | "ESTRUCTURAL" | "COMPORTAMIENTO";

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeCategory: CategoryFilter;
  onCategoryChange: (category: CategoryFilter) => void;
}

const filters: Array<{
  label: string;
  value: CategoryFilter;
  icon: string;
}> = [
  { label: "Todos", value: "all", icon: "all_inclusive" },
  { label: "Creacionales", value: "CREACIONAL", icon: "architecture" },
  { label: "Estructurales", value: "ESTRUCTURAL", icon: "account_tree" },
  { label: "Comportamiento", value: "COMPORTAMIENTO", icon: "sync_alt" },
];

export default function SearchFilterBar({
  searchQuery,
  onSearchChange,
  activeCategory,
  onCategoryChange,
}: SearchFilterBarProps) {
  return (
    <div className="bg-carbon-surface/80 backdrop-blur-md rounded-lg p-4 border border-outline-variant/20 shadow-lg flex flex-col lg:flex-row gap-6 justify-between items-center relative z-20">
      {/* Search */}
      <div className="relative w-full lg:w-96 group">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors">
          search
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-surface-container-low border-b border-outline-variant focus:border-secondary text-on-surface pl-10 pr-4 py-2 outline-none transition-all focus:shadow-[0_1px_15px_-3px_rgba(93,230,255,0.2)] placeholder:text-text-dim"
          placeholder="Buscar patrón o keyword..."
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 animate-pulse hidden group-focus-within:block">
          _
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 w-full lg:w-auto">
        {filters.map((filter) => {
          const isActive = activeCategory === filter.value;
          return (
            <button
              key={filter.value}
              onClick={() => onCategoryChange(filter.value)}
              className={`px-4 py-1.5 rounded-full border transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? "bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(190,242,100,0.3)]"
                  : "bg-surface-container border-outline-variant/30 text-on-surface-variant hover:border-secondary hover:text-secondary"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {filter.icon}
              </span>
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
