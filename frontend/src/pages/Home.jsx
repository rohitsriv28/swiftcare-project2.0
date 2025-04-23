import React from "react";
import Header from "../components/Header";
import SpecialityMenu from "../components/SpecialityMenu";
import TopDocs from "../components/TopDocs";
import Banner from "../components/Banner";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <div>
      <Header />
      <SpecialityMenu />
      <TopDocs />
      <Banner />
    </div>
  );
};

export default Home;
