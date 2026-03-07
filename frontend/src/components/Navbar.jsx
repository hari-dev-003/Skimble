import { useState, useEffect } from 'react';
import { PenTool, Sparkles,Search,User,LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import axios from 'axios';

const Navbar = ({ onFavouritesClick }) => {
    const [notesNumber, setNotesNumber] = useState(0);
    const [favoritesNumber, setFavoritesNumber] = useState(0);
    const auth = useAuth();
    // Signout function to redirect to Cognito logout
   const signOutRedirect = () => {
    const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
    const logoutUri = import.meta.env.VITE_COGNITO_REDIRECT_URI;
    const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN;
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

    // Fetch notes and favorites count from the backend or state management
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

    const fetchNotesAndFavoritesCount = async () => {
        axios.get(`${BACKEND_URL}/api/details/`)
            .then(response => {
                setNotesNumber(response.data.length);
                const favoritesCount = response.data.filter(note => note.favourite).length;
                setFavoritesNumber(favoritesCount);

            })
            .catch(error => {
                console.error("Error fetching notes:", error);
            });
    };

    useEffect(() => {
        fetchNotesAndFavoritesCount();
    }, []);


    return (
        <>
        {/* Navbar */}
            <nav className="min-w-screen h-[80px] bg-white border-gray-700 shadow-sm backdrop-blur-md fixed top-0 left-0 right-0 z-50">
                <div className="flex justify-around items-center h-full px-6 py-4">
                    {/* Left Container */}
                    <div className="flex items-center justify-around space-x-5 ml-4">
                        <div className="flex items-center space-x-2 animate-fade-in">
                            <PenTool className="w-8 h-8 text-purple-500" />
                            <span className="text-3xl font-bold">Skimble</span>
                        </div>
                        
                        <div className=' px-3 py-1 rounded-3xl bg-purple-100 text-center text-purple-700 font-medium '>
                            {notesNumber} Notes
                        </div>
                        <button
                            className='px-3 py-1 rounded-3xl bg-yellow-100 text-center text-yellow-700 font-medium flex items-center hover:bg-yellow-200 transition-colors duration-200'
                            onClick={onFavouritesClick}
                        >
                            <span className="mr-1">⭐</span>{favoritesNumber} Favourites
                        </button>
                        <div className="flex items-center  space-x-2">
                            <Sparkles className="w-5 h-5 text-yellow-500" />
                            <span className="text-lg">Premium</span>
                        </div>
                    </div>

                        {/* Right Container */}
                    <div className="flex items-center justify-around space-x-4">
                        <div className="relative group">
                            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-purple-500 transition-colors`} />
                            <input
                                type="text"
                                placeholder="Search notes, tags..."
                                //   value={searchTerm}
                                //   onChange={(e) => setSearchTerm(e.target.value)}
                                className={`pl-10 pr-4 py-2 border border-gray-300 bg-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 w-64 shadow-sm`}
                            />
                        </div>
                        {/* User Profile */}
                        <div className={`flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200`}>
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                                <User className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <div className={`text-sm font-semibold text-gray-900`}>{auth.user?.profile.email}</div>
                                <div className={`text-xs text-gray-500`}>{auth.user?.profile.email}</div>
                            </div>
                        </div>

                        <button
                            onClick={()=>{signOutRedirect()}}
                            className={`flex items-center space-x-2 px-4 py-2 text-gray-600 cursor-pointer hover:text-red-600 transition-colors duration-200 rounded-lg hover:bg-red-50`}
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                        </button>
                    </div>
                    
                </div>
            </nav>
        </>
    )
}

export default Navbar;