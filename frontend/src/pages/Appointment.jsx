import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";
import RelatedDoctors from "../components/RelatedDoctors";
import {
  Calendar,
  Clock,
  Info,
  Check,
  ChevronRight,
  Medal,
  ChevronLeft,
} from "lucide-react";

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol, backendUrl, token, getDoctorsData } =
    useContext(AppContext);

  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [mobileViewIndex, setMobileViewIndex] = useState(0); // For tracking which group of 3 dates is shown on mobile
  const datesPerMobileView = 3;
  const totalMobileViews = Math.ceil(docSlots.length / datesPerMobileView);
  const navigate = useNavigate();

  const fetchDocInfo = async () => {
    if (!doctors.length) return;
    setLoading(true);
    const doctor = doctors.find((doc) => doc._id === docId);
    if (doctor) {
      setDocInfo(doctor);
    } else {
      console.warn("No matching doctor found for ID:", docId);
      toast.error("Doctor not found");
    }
    setLoading(false);
  };

  const getAvailableSlots = async () => {
    if (!docInfo) return;

    setDocSlots([]);
    let today = new Date();

    for (let index = 0; index < 7; index++) {
      let currentDate = new Date(today);
      currentDate.setDate(today.getDate() + index);

      let endTime = new Date();
      endTime.setDate(today.getDate() + index);
      endTime.setHours(19, 0, 0, 0);

      if (today.getDate() === currentDate.getDate()) {
        const hour =
          currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10;
        const minute = currentDate.getMinutes() > 30 ? 30 : 0;
        currentDate.setHours(hour);
        currentDate.setMinutes(minute);
      } else {
        currentDate.setHours(10);
        currentDate.setMinutes(0);
      }

      let timeSlots = [];

      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        let day = currentDate.getDate();
        let month = currentDate.getMonth() + 1;
        let year = currentDate.getFullYear();

        const slotDate = `${day}_${month}_${year}`;
        const slotTime = formattedTime;

        const isSlotAvailable = docInfo.slots_booked?.[slotDate]?.includes(
          slotTime
        )
          ? false
          : true;

        if (isSlotAvailable) {
          timeSlots.push({
            datetime: new Date(currentDate),
            time: formattedTime,
          });
        }

        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }

      setDocSlots((prev) => [...prev, timeSlots]);
    }
  };

  const bookAppointment = async () => {
    if (!token) {
      toast.warn("Login to book appointment");
      return navigate("/login");
    }

    if (!slotTime) {
      toast.error("Please select a time slot");
      return;
    }

    try {
      const date = docSlots[slotIndex][0].datetime;
      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();
      const slotDate = `${day}_${month}_${year}`;

      const { data } = await axios.post(
        backendUrl + "/api/user/book-appointment",
        { docId, slotDate, slotTime },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        getDoctorsData();
        navigate("/my-appointments");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (doctors.length) {
      fetchDocInfo();
    }
  }, [doctors, docId]);

  useEffect(() => {
    if (docInfo) {
      getAvailableSlots();
    }
  }, [docInfo]);

  // Calculate total pages for time slots pagination
  const totalPages =
    docSlots.length > 0 && docSlots[slotIndex]
      ? Math.ceil(docSlots[slotIndex].length / 9)
      : 0;

  // Get current page slots
  const getCurrentPageSlots = () => {
    if (!docSlots.length || !docSlots[slotIndex]) return [];
    const startIndex = currentSlotPage * 9;
    const endIndex = startIndex + 9;
    return docSlots[slotIndex].slice(startIndex, endIndex);
  };

  // For mobile date navigation
  const getVisibleDatesForMobile = () => {
    const startIndex = mobileViewIndex * datesPerMobileView;
    const endIndex = Math.min(startIndex + datesPerMobileView, docSlots.length);
    return docSlots.slice(startIndex, endIndex);
  };

  // Handle pagination for slots
  const goToNextPage = () => {
    if (currentSlotPage < totalPages - 1) {
      setCurrentSlotPage(currentSlotPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentSlotPage > 0) {
      setCurrentSlotPage(currentSlotPage - 1);
    }
  };

  // Handle navigation for mobile date view
  const goToNextDateGroup = () => {
    if (mobileViewIndex < totalMobileViews - 1) {
      setMobileViewIndex(mobileViewIndex + 1);
    }
  };

  const goToPreviousDateGroup = () => {
    if (mobileViewIndex > 0) {
      setMobileViewIndex(mobileViewIndex - 1);
    }
  };

  // Reset pagination when date changes
  useEffect(() => {
    setCurrentSlotPage(0);
  }, [slotIndex]);

  const [currentSlotPage, setCurrentSlotPage] = useState(0);

  // Show login message if not logged in
  if (!token) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 text-center bg-white rounded-2xl shadow-lg">
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 p-4 rounded-full">
            <Calendar className="h-12 w-12 text-red-500" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-red-500 mb-4">
          You are not logged in!
        </h2>
        <p className="text-gray-600 mb-6">
          Please log in to view doctor details and book an appointment.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="px-8 py-3 bg-primary text-white rounded-full hover:bg-primary-dark transition-all duration-300 flex items-center justify-center mx-auto gap-2 shadow-md"
        >
          Go to Login <ChevronRight size={16} />
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    docInfo && (
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* -----Doctor Details----- */}
        <div className="flex flex-col sm:flex-row gap-6 mb-8">
          <div className="flex-shrink-0">
            <div className="relative">
              <img
                src={docInfo.image}
                alt={docInfo.name}
                className="w-full sm:w-72 h-72 object-cover rounded-2xl shadow-md"
              />
              <div className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-full shadow-lg">
                <Check size={20} />
              </div>
            </div>
          </div>

          <div className="flex-1 border border-gray-200 rounded-2xl p-6 bg-white shadow-md relative sm:mt-0 z-10">
            {/* Removed negative margin that was causing the overlap on mobile */}
            <div className="flex justify-between flex-wrap gap-2">
              <div>
                <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                  {docInfo.name}
                  <Check size={20} className="text-primary" />
                </h2>
                <div className="flex items-center gap-2 text-sm mt-1 text-gray-600">
                  <p className="font-medium">
                    {docInfo.degree} - {docInfo.speciality}
                  </p>
                  <span className="flex items-center py-1 px-3 bg-blue-50 text-blue-600 text-xs rounded-full border border-blue-100">
                    <Medal size={12} className="mr-1" /> {docInfo.experience}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-sm font-medium">
                  Appointment Fee
                </p>
                <p className="text-xl font-bold text-primary">
                  {currencySymbol} {docInfo.fee}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="flex items-center gap-1 text-md font-semibold text-gray-900 mb-2">
                <Info size={16} className="text-primary" /> About Doctor
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {docInfo.about}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500 mb-1">Specialization</p>
                <p className="font-medium">{docInfo.speciality}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500 mb-1">Experience</p>
                <p className="font-medium">{docInfo.experience}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500 mb-1">Qualification</p>
                <p className="font-medium">{docInfo.degree}</p>
              </div>
            </div>
          </div>
        </div>

        {/* -----Booking Slots----- */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <h3 className="flex items-center gap-2 text-xl font-semibold text-gray-800 mb-6">
            <Calendar size={20} className="text-primary" /> Available Booking
            Slots
          </h3>

          {/* Date selection - Mobile view (3 dates with arrows) */}
          <div className="md:hidden flex items-center justify-between gap-2 mb-6">
            {/* Left arrow */}
            <button
              onClick={goToPreviousDateGroup}
              disabled={mobileViewIndex === 0}
              className={`p-2 rounded-full ${
                mobileViewIndex === 0
                  ? "text-gray-300"
                  : "text-primary hover:bg-blue-50"
              }`}
            >
              <ChevronLeft size={24} />
            </button>

            {/* Display 3 dates for mobile */}
            <div className="flex-1 flex justify-center gap-2">
              {getVisibleDatesForMobile().map((dateSlots, index) => {
                if (!dateSlots[0]) return null;

                const dateItem = dateSlots[0];
                const actualIndex =
                  mobileViewIndex * datesPerMobileView + index;

                return (
                  <div
                    key={index}
                    onClick={() => setSlotIndex(actualIndex)}
                    className={`flex-1 text-center py-3 px-1 rounded-xl cursor-pointer transition-all duration-300 ${
                      slotIndex === actualIndex
                        ? "bg-primary text-white shadow-md"
                        : "bg-blue-50 hover:bg-blue-100"
                    }`}
                  >
                    <p className="font-semibold">
                      {daysOfWeek[dateItem.datetime.getDay()]}
                    </p>
                    <p className="text-lg">{dateItem.datetime.getDate()}</p>
                    <p className="text-xs">
                      {dateItem.datetime.toLocaleDateString(undefined, {
                        month: "short",
                      })}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Right arrow */}
            <button
              onClick={goToNextDateGroup}
              disabled={mobileViewIndex >= totalMobileViews - 1}
              className={`p-2 rounded-full ${
                mobileViewIndex >= totalMobileViews - 1
                  ? "text-gray-300"
                  : "text-primary hover:bg-blue-50"
              }`}
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Date selection - Desktop view (all 7 days) */}
          <div className="hidden md:flex md:gap-3 md:items-center md:w-full md:mb-6">
            {docSlots.length > 0 &&
              docSlots.map((item, index) => (
                <div
                  onClick={() => setSlotIndex(index)}
                  key={index}
                  className={`text-center py-4 px-2 flex-1 rounded-xl cursor-pointer transition-all duration-300 ${
                    slotIndex === index
                      ? "bg-primary text-white shadow-md transform scale-105"
                      : "border border-gray-200 hover:border-primary hover:bg-blue-50"
                  }`}
                >
                  {item[0] && (
                    <>
                      <p className="font-semibold">
                        {daysOfWeek[item[0].datetime.getDay()]}
                      </p>
                      <p className="text-lg mt-1">
                        {item[0].datetime.getDate()}
                      </p>
                      <p className="text-xs">
                        {item[0].datetime.toLocaleDateString(undefined, {
                          month: "short",
                        })}
                      </p>
                    </>
                  )}
                </div>
              ))}
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h4 className="flex items-center gap-2 text-gray-700">
                <Clock size={16} className="text-primary" /> Select Time
              </h4>

              {/* Mobile pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center gap-2 md:hidden">
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentSlotPage === 0}
                    className={`p-1 rounded-full ${
                      currentSlotPage === 0 ? "text-gray-300" : "text-primary"
                    }`}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-sm text-gray-600">
                    {currentSlotPage + 1}/{totalPages}
                  </span>
                  <button
                    onClick={goToNextPage}
                    disabled={currentSlotPage >= totalPages - 1}
                    className={`p-1 rounded-full ${
                      currentSlotPage >= totalPages - 1
                        ? "text-gray-300"
                        : "text-primary"
                    }`}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3 w-full">
              {/* Show all slots on desktop, but paginate on mobile */}
              {docSlots.length > 0 && (
                <>
                  {/* Mobile view (paginated in 3x3 grid) */}
                  <div className="grid grid-cols-3 gap-2 w-full md:hidden">
                    {getCurrentPageSlots().map((item, index) => (
                      <button
                        onClick={() => setSlotTime(item.time)}
                        key={index}
                        className={`px-2 py-2 rounded-lg text-sm transition-all duration-300 ${
                          item.time === slotTime
                            ? "bg-primary text-white shadow-md transform scale-105"
                            : "bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-primary border border-gray-200"
                        }`}
                      >
                        {item.time.toLowerCase()}
                      </button>
                    ))}
                  </div>

                  {/* Desktop view (all slots) */}
                  <div className="hidden md:flex md:flex-wrap gap-3 w-full">
                    {docSlots[slotIndex]?.map((item, index) => (
                      <button
                        onClick={() => setSlotTime(item.time)}
                        key={index}
                        className={`px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                          item.time === slotTime
                            ? "bg-primary text-white shadow-md transform scale-105"
                            : "bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-primary border border-gray-200"
                        }`}
                      >
                        {item.time.toLowerCase()}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <button
            onClick={bookAppointment}
            className="w-full sm:w-auto bg-primary text-white font-medium px-8 py-3 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Calendar size={16} /> Book Appointment
          </button>
        </div>

        {/* -----Related Doctors----- */}
        <div className="mb-8">
          <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
        </div>
      </div>
    )
  );
};

export default Appointment;
