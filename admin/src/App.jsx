import React, { useContext } from "react";
import Login from "./pages/Login";
import { ToastContainer } from "react-toastify";
import { AdminContext } from "./context/AdminContext";

const App = () => {
  const { aToken } = useContext(AdminContext);
  // console.log("App rendering, token status:", !!aToken, "Token value:", aToken);

  return aToken ? (
    <div>
      <ToastContainer />
    </div>
  ) : (
    <>
      <Login />
      <ToastContainer />
    </>
  );
};

export default App;
