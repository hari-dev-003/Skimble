import { Download, ArrowUpDown, Share2 } from "lucide-react";
import { motion, LayoutGroup } from "framer-motion";

const FilterBar = ({ selectedCategory, setSelectedCategory, selectedSort, setSelectedSort, onExport }) => {
  const categories  = ["All", "Work", "Personal", "Urgent", "Completed"];
  const sortOptions = ["Date", "Priority", "Alphabetical"];

  return (
    <div className="w-full mt-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

        {/* Category segmented control */}
        <div className="flex items-center overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
          <div className="flex items-center gap-1 p-1 bg-sk-raised border border-sk-subtle rounded-xl">
            <LayoutGroup id="categories">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`relative px-4 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 whitespace-nowrap
                    ${selectedCategory === cat ? 'text-sk-base' : 'text-sk-2 hover:text-sk-1'}`}
                >
                  {selectedCategory === cat && (
                    <motion.div
                      layoutId="active-cat"
                      className="absolute inset-0 bg-sk-accent rounded-lg"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                    />
                  )}
                  <span className="relative z-10">{cat}</span>
                </button>
              ))}
            </LayoutGroup>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Sort */}
          <div className="flex items-center gap-2 px-3 py-2 bg-sk-raised border border-sk-subtle rounded-xl">
            <ArrowUpDown size={12} className="text-sk-3 shrink-0" strokeWidth={2.5} />
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="bg-transparent text-xs font-medium text-sk-2 outline-none border-none cursor-pointer appearance-none pr-3"
            >
              {sortOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div className="h-5 w-px bg-sk-subtle" />

          {/* Export */}
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-3.5 py-2 bg-sk-raised border border-sk-subtle text-sk-2 hover:text-sk-accent hover:border-sk-accent/25 transition-all rounded-xl group"
          >
            <Download className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
            <span className="text-xs font-medium">Export</span>
          </button>

          <button className="flex items-center justify-center w-9 h-9 bg-sk-raised border border-sk-subtle text-sk-3 hover:text-sk-1 hover:border-sk-strong transition-all rounded-xl">
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
