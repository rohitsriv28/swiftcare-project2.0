import React, { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";
import axios from "axios";
import Switch from "react-switch";

const DoctorsList = () => {
  const { doctors, aToken, getAllDoctors, backendURL, changeAvailability } =
    useContext(AdminContext);
  useEffect(() => {
    if (aToken) {
      getAllDoctors();
    }
  }, [aToken]);

  return (
    <div className="m-5 max-h-[90vh] overflow-y-scroll">
      <h1 className="text-lg font-medium">All Doctors</h1>
      <div className="flex flex-wrap gap-4 pt-5 gap-y-6">
        {doctors.map((item, index) => (
          <div
            key={index}
            className="border border-indigo-200 rounded-xl max-w-56 overflow-hidden cursor-pointer group"
          >
            <img
              src={item.image}
              alt=""
              className="bg-indigo-50 group-hover:bg-primary transition-all duration-500"
            />
            <div className="p-4">
              <p className="text-neutral-800 text-lg font-medium">
                {item.name}
              </p>
              <p className="text-zinc-600 text-sm">{item.speciality}</p>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <Switch
                  onChange={() => changeAvailability(item._id)}
                  checked={item.availability}
                  height={20}
                  width={40}
                  className=""
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorsList;
