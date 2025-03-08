import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

const HomeLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      {/* Footer intentionally omitted */}
    </div>
  );
};

export default HomeLayout;
