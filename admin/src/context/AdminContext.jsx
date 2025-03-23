import { createContext, useState } from "react";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
  const [aToken, setAToken] = useState(
    localStorage.getItem("aToken") ? localStorage.getItem("aToken") : ""
  );
  const backendURL = import.meta.env.VITE_BACKEND_URL;
  const logout = () => {
    localStorage.removeItem("aToken");
    setAToken("");
  };
  const value = { aToken, setAToken, backendURL, logout };
  return (
    <AdminContext.Provider value={value}>
      {props.children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;
