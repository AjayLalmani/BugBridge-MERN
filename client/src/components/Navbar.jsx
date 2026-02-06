import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  
  const token = localStorage.getItem("token");
  let user = {};

  try {
    const storedUser = localStorage.getItem("user");
    
    if (storedUser && storedUser !== "undefined") {
      user = JSON.parse(storedUser);
    }
  } catch (err) {
    console.error("Corrupt user data found in NavBar, resetting...", err);
    localStorage.removeItem("user"); 
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  
  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  return (
    <nav className="bg-white shadow-md p-4 relative z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {}

        <Link to="/" className="flex items-center gap-1 group select-none">
          {}
          <span className="pt-[2.2px] material-symbols-outlined text-blue-600 text-4xl group-hover:scale-110 transition-transform duration-200">
            bug_report
          </span>

          {}
          <span className="text-2xl font-extrabold text-gray-900 tracking-tighter ">
            Bug<span className="text-blue-600">Bridge</span>
          </span>
        </Link>

        {}
        <div className="flex gap-6 items-center">
          {token ? (
            <>
              {}
              {location.pathname !== "/dashboard" && (
                <Link
                  to="/dashboard"
                  className="text-gray-600 hover:text-blue-600 font-medium transition"
                >
                  Dashboard
                </Link>
              )}

              {}
              <div className="relative" ref={dropdownRef}>
                {}
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold border border-blue-200">
                    {getInitials(user.name)}
                  </div>
                </button>

                {}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 animate-fade-in-down">
                    {}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-800">
                        {user.name || "User"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email || "user@example.com"}
                      </p>
                    </div>

                

                    {}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition font-medium"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            
            <div className="flex gap-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-blue-600 font-medium px-3 py-2"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition font-medium shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
