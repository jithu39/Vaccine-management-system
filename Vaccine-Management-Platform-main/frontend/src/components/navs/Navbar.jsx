import { Link, NavLink } from "react-router-dom";

const Navbar = () => {
  const linkClass = ({ isActive }) =>
    isActive
      ? "text-black border-b-2 border-black px-3 py-2"
      : "text-gray-700 hover:text-black px-3 py-2";

  return (
    <nav className="bg-white">
      <div className="bg-cta h-1 w-full"></div>
      <div className="py-4 px-8 flex justify-between items-center">
        <div className="text-2xl font-bold">
          <NavLink to="/" className={linkClass}>
            <span className="text-black">EpiSheild</span>
            <span className="text-cta">.</span>
          </NavLink>

        </div>
        <div className="flex space-x-6 items-center text-lg">
          <NavLink to="/" className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/about" className={linkClass}>
            About us
          </NavLink>
          <NavLink to="/contact" className={linkClass}>
            Contact us
          </NavLink>
        </div>
        <NavLink
          to="/account"
          className={({ isActive }) =>
            isActive
              ? "bg-black text-white px-6 py-2 rounded-full shadow-md"
              : "bg-black text-white px-6 py-2 rounded-full hover:bg-gray-900"
          }
        >
          Account
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;
