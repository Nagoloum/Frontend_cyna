import React from "react";
import Navbar from "../Home/Navbar";

export default function Layout({ children }) {
  return (
    <div className="bg-background mt-2">
      <Navbar />
      <main className="mx-auto max-w-7xl lg:px-8 ">{children}</main>
    </div>
  );
}
