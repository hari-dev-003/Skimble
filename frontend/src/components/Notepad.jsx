
import { useState, useEffect } from "react";
import axios from "axios";
import NoteModal from "./NoteModal";
import { Star } from "lucide-react";
import FilterBar from "./FilterBar";

const Notepad = ({ showFavourites, searchTerm = '' }) => {
    const [data, setData] = useState(null);
    const [filteredData, setFilteredData] = useState(null);
    const [selectedNote, setSelectedNote] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedSort, setSelectedSort] = useState("Date");

    const noteColors = [
    'bg-gradient-to-br from-yellow-100 to-yellow-200',
    'bg-gradient-to-br from-blue-100 to-blue-200',
    'bg-gradient-to-br from-green-100 to-green-200',
    'bg-gradient-to-br from-purple-100 to-purple-200',
    'bg-gradient-to-br from-pink-100 to-pink-200',
    'bg-gradient-to-br from-indigo-100 to-indigo-200',
    'bg-gradient-to-br from-orange-100 to-orange-200',
    'bg-gradient-to-br from-rose-100 to-rose-200',
  ];


    const fetchdata = async () => {
        axios.get("http://localhost:3000/api/details")
            .then((res) => {
                setData(res.data);
            })
            .catch((err) => {
                console.error("Error fetching data:", err);
            });
    };

    useEffect(() => {
        if (!data) {
            setFilteredData([]);
            return;
        }
        let filtered = [...data];
        if (showFavourites) {
            filtered = filtered.filter(note => note.favourite);
        }
        if (searchTerm.trim()) {
            const lower = searchTerm.toLowerCase();
            filtered = filtered.filter(note =>
                (note.title || '').toLowerCase().includes(lower) ||
                (note.content || '').toLowerCase().includes(lower)
            );
        }
        if (selectedCategory !== "All") {
            filtered = filtered.filter(note => note.category === selectedCategory);
        }
        if (selectedSort === "Date") {
            filtered.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        } else if (selectedSort === "Alphabetical") {
            filtered.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        } else if (selectedSort === "Priority") {
            filtered.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        }
        setFilteredData(filtered);
    }, [data, selectedCategory, selectedSort, showFavourites, searchTerm]);

    // Export functionality (CSV)
    const handleExport = () => {
        if (!filteredData || filteredData.length === 0) return;
        const csvRows = [
            ["Title", "Content", "Favourite", "Updated At"].join(",")
        ];
        filteredData.forEach(note => {
            csvRows.push([
                `"${note.title || ""}"`,
                `"${note.content || ""}"`,
                note.favourite ? "Yes" : "No",
                note.updatedAt || ""
            ].join(","));
        });
        const csvContent = csvRows.join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "notes.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        fetchdata();
    }, []);

    const handleNoteClick = (note) => {
        setSelectedNote(note);
        setModalMode("edit");
        setModalOpen(true);
    };

    return (
        <>
            <NoteModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                note={selectedNote}
                mode={modalMode}
                onSave={fetchdata}
            />
            <FilterBar
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedSort={selectedSort}
                setSelectedSort={setSelectedSort}
                onExport={handleExport}
            />
            <div className=" lg:mx-[5rem] px-2 sm:px-4 py-6 sm:py-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                    <h1 className="text-3xl sm:text-4xl font-bold">Your Notes <span className="text-blue-500">({filteredData ? filteredData.length : 0})</span></h1>
                    {/* Add Note button removed as requested */}
                </div>
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {filteredData && filteredData.map((note, idx) => (
                        <div
                            key={note.boardId}
                            className={`${noteColors[idx % noteColors.length]} p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 group cursor-pointer relative overflow-hidden backdrop-blur-sm border-2 border-transparent`}
                            onClick={() => handleNoteClick(note)}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-base sm:text-lg font-semibold truncate max-w-[80%]">{note.title}</h2>
                                {note.favourite && (
                                    <Star className="text-yellow-400" fill="#facc15" size={20} />
                                )}
                            </div>
                            <p className="text-gray-700 line-clamp-4 min-h-[48px] sm:min-h-[64px]">{note.content}</p>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );

}

export default Notepad;
