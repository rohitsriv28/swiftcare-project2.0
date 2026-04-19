import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { CircleCheck, Calendar, UserRound } from "lucide-react";

const RelatedDoctors = ({ docId, speciality }) => {
    const { doctors } = useContext(AppContext);
    const [relatedDoctors, setRelatedDoctors] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (doctors.length > 0 && speciality) {
            const doctorsData = doctors.filter(
                (doc) => doc.speciality === speciality && doc._id !== docId
            );
            setRelatedDoctors(doctorsData);
        }
    }, [doctors, docId, speciality]);

    return (
        <div className="flex flex-col items-center gap-6 my-16 text-gray-900 md:mx-10">
            <h1 className="text-3xl font-bold text-gray-800">Related Doctors</h1>
            <p className="text-gray-600 text-center max-w-lg mb-4">
                Simply browse through our extensive list of trusted doctors.
            </p>

            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {relatedDoctors.slice(0, 5).map((item, index) => (
                    <div
                        onClick={() => {
                            navigate(`/appointment/${item._id}`);
                            scrollTo(0, 0);
                        }}
                        key={index}
                        className="bg-white shadow-sm hover:shadow-md rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:translate-y-[-8px] border border-gray-100 flex flex-col h-full"
                    >
                        <div className="relative h-48 overflow-hidden bg-blue-50">
                            {item.image ? (
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-blue-50">
                                    <UserRound size={64} className="text-blue-300" />
                                </div>
                            )}
                        </div>

                        <div className="p-5 flex flex-col flex-grow">
                            <div className="flex items-center gap-2 text-sm mb-2">
                                <CircleCheck size={16} className="text-green-500" />
                                <p className="text-green-600 font-medium">Available</p>
                            </div>

                            <p className="text-gray-800 text-lg font-bold mb-1">
                                {item.name}
                            </p>
                            <p className="text-blue-600 text-sm font-medium mb-3">
                                {item.speciality}
                            </p>

                            <div className="mt-auto">
                                <button className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2">
                                    <Calendar size={16} />
                                    Book Appointment
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={() => {
                    navigate("/doctors");
                    scrollTo(0, 0);
                }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-8 py-3 rounded-full mt-10 font-medium transition-colors duration-200"
            >
                more
            </button>
        </div>
    );
};

export default RelatedDoctors;
