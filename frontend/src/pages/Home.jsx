import React from "react";
import Header from "../components/Header";
import TopDocs from "../components/TopDocs";
import Banner from "../components/Banner";
import RecommendedDocs from "../components/RecommendedDocs";

const Home = () => {
  return (
    <div className="w-full">
      <div className="relative z-10">
        <Header />
      </div>
      <div className="mt-8">
        <RecommendedDocs />
      </div>
      <div className="mt-8 md:mt-16">
        <TopDocs />
      </div>
      <div className="mt-12 md:mt-20 mb-16">
        <Banner />
      </div>
    </div>
  );
};

export default Home;
