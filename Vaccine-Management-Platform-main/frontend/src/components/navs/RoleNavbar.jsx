import React from "react";
import { useAuth } from "../Auth.jsx";
import AdminNavbar from "./AdminNavbar.jsx";
import ResidentNavbar from "./ResidentNavbar.jsx";
import Navbar from "./Navbar.jsx";

const RoleNavbar = () => {
  const { user } = useAuth();
  if (user?.role === "admin") return <AdminNavbar />;
  if (user?.role === "resident") return <ResidentNavbar />;
  return <Navbar />;
};

export default RoleNavbar;


