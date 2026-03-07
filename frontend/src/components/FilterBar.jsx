import { useState } from "react";
import { Download, Filter, ArrowUpDown, Tag, Share2 } from "lucide-react";
import { motion, LayoutGroup } from "framer-motion";

const FilterBar = ({
  selectedCategory,
  setSelectedCategory,
  selectedSort,
  setSelectedSort,
  onExport
}) => {
  const categories = ["All", "Work", "Personal", "Urgent", "Completed"];
  const sortOptions = ["Date", "Priority", "Alphabetical"];

  return (
    <div className="w-full mt-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Categories Segmented Control */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/50 shadow-inner">
            <LayoutGroup id="categories">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`relative px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap
                    ${selectedCategory === category
                      ? "text-white"
                      : "text-slate-500 hover:text-slate-800"
                    }`}
                >
                  {selectedCategory === category && (
                    <motion.div
                      layoutId="active-cat"
                      className="absolute inset-0 bg-slate-900 rounded-xl shadow-lg shadow-slate-900/20"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">{category}</span>
                </button>
              ))}
            </LayoutGroup>
          </div>
        </div>

        {/* Action Group */}
        <div className="flex items-center gap-3">
          {/* Sorting Control */}
          <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="pl-3 pr-1 text-slate-400">
              <ArrowUpDown size={14} strokeWidth={2.5} />
            </div>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="pl-1 pr-8 py-2 bg-transparent text-xs font-bold text-slate-700 outline-none border-none focus:ring-0 cursor-pointer appearance-none"
            >
              {sortOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="h-8 w-px bg-slate-200 mx-1" />

          {/* Export Button */}
          <button 
            onClick={onExport} 
            className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all rounded-2xl shadow-sm group"
          >
            <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Export</span>
          </button>

          <button 
            className="flex items-center justify-center w-11 h-11 bg-white border border-slate-200 text-slate-400 hover:text-slate-800 transition-all rounded-2xl shadow-sm"
            title="More Options"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
