import React from "react";
import Header from "../components/Header";
import TopDocs from "../components/TopDocs";
import Banner from "../components/Banner";

const Home = () => {
  return (
    <div className="w-full">
      <div className="relative z-10">
        <Header />
      </div>
      {/* <div className="mt-10 md:mt-16">
        <SpecialityMenu />
      </div> */}
      <div className="mt-12 md:mt-20">
        <TopDocs />
      </div>
      <div className="mt-12 md:mt-20 mb-16">
        <Banner />
      </div>
    </div>
  );
};

export default Home;
