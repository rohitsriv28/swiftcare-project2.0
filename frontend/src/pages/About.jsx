import React from "react";
import { Heart, Clock, Users, Shield, Award, Stethoscope } from "lucide-react";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="bg-gradient-to-b from-white to-blue-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-16 pb-24">
        <div className="flex flex-col items-center justify-center text-center mb-12">
          <div className="inline-block mb-4">
            <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4 mx-auto">
              <Stethoscope className="text-white" size={32} />
            </div>
            <h1 className="text-5xl font-bold tracking-tight">
              <span className="text-gray-800">About</span>
              <span className="text-primary ml-2">SwiftCare</span>
            </h1>
          </div>
          <div className="h-1 w-24 bg-primary mx-auto mb-8"></div>
          <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">
            Our mission is to provide affordable and accessible healthcare to
            everyone. We connect patients with doctors in a secure and safe
            environment, committed to delivering exceptional care.
          </p>
        </div>

        {/* Values Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <div className="bg-white p-8 rounded-2xl shadow-lg transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="bg-primary/10 p-4 rounded-2xl inline-block mb-6">
              <Heart className="text-primary" size={36} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Our Mission
            </h3>
            <p className="text-gray-600">
              To revolutionize healthcare access by providing a seamless digital
              platform that connects patients with quality healthcare
              professionals.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="bg-primary/10 p-4 rounded-2xl inline-block mb-6">
              <Shield className="text-primary" size={36} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Our Values
            </h3>
            <p className="text-gray-600">
              We operate with integrity, compassion, and innovation at our core,
              prioritizing patient well-being and healthcare excellence in
              everything we do.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="bg-primary/10 p-4 rounded-2xl inline-block mb-6">
              <Award className="text-primary" size={36} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Our Vision
            </h3>
            <p className="text-gray-600">
              To create a world where quality healthcare is accessible to
              everyone, anywhere, anytime through innovative technology
              solutions.
            </p>
          </div>
        </div>
      </div>

      {/* About Us Content Section */}
      <div className="bg-white py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="w-full md:w-1/2 order-2 md:order-1">
              <h2 className="text-3xl font-bold mb-6 text-gray-800">
                Transforming Healthcare Experience
              </h2>
              <div className="h-1 w-16 bg-primary mb-8"></div>

              <div className="space-y-6 text-gray-600">
                <p className="text-lg leading-relaxed">
                  Welcome to SwiftCare, your trusted partner in managing your
                  healthcare needs conveniently and efficiently. At SwiftCare,
                  we understand the challenges individuals face when it comes to
                  scheduling doctor appointments and managing their health
                  records.
                </p>

                <p className="text-lg leading-relaxed">
                  SwiftCare is committed to excellence in healthcare technology.
                  We continuously strive to enhance our platform, integrating
                  the latest advancements to improve user experience and deliver
                  superior service. Whether you're booking your first
                  appointment or managing ongoing care, SwiftCare is here to
                  support you every step of the way.
                </p>

                <div className="pt-2">
                  <h3 className="text-2xl font-bold text-primary mb-4">
                    Our Approach
                  </h3>
                  <p className="text-lg leading-relaxed">
                    Our approach combines cutting-edge technology with a deep
                    understanding of healthcare needs. We believe in creating
                    solutions that are not just innovative but also practical,
                    accessible, and user-friendly.
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full md:w-1/2 order-1 md:order-2 mb-10 md:mb-0">
              <div className="relative">
                <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary/10 rounded-full z-0"></div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/20 rounded-full z-0"></div>
                <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center p-8">
                    <img src={assets.about_image} alt="" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 text-white">
                    <h3 className="text-2xl font-bold">
                      Patient-Centered Care
                    </h3>
                    <p>Your health is our priority</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            <span className="text-gray-800">Why</span>
            <span className="text-primary ml-2">Choose Us</span>
          </h2>
          <div className="h-1 w-24 bg-primary mx-auto mb-8"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We stand out with our commitment to excellence, innovative approach,
            and patient-focused services.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Card 1 */}
          <div className="group">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-500 group-hover:-translate-y-3 group-hover:shadow-2xl h-full">
              <div className="p-1 bg-gradient-to-r from-blue-400 to-primary"></div>
              <div className="p-8">
                <div className="bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6 group-hover:bg-primary transition-all duration-300">
                  <Clock
                    className="text-primary group-hover:text-white transition-all duration-300"
                    size={30}
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-primary transition-all duration-300">
                  Efficiency
                </h3>
                <p className="text-gray-600">
                  Streamlined appointment scheduling that fits seamlessly into
                  your busy lifestyle, saving you time and reducing hassle.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="group">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-500 group-hover:-translate-y-3 group-hover:shadow-2xl h-full">
              <div className="p-1 bg-gradient-to-r from-blue-400 to-primary"></div>
              <div className="p-8">
                <div className="bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6 group-hover:bg-primary transition-all duration-300">
                  <Users
                    className="text-primary group-hover:text-white transition-all duration-300"
                    size={30}
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-primary transition-all duration-300">
                  Convenience
                </h3>
                <p className="text-gray-600">
                  Access to a network of trusted healthcare professionals in
                  your area, making quality care just a few clicks away.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="group">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-500 group-hover:-translate-y-3 group-hover:shadow-2xl h-full">
              <div className="p-1 bg-gradient-to-r from-blue-400 to-primary"></div>
              <div className="p-8">
                <div className="bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6 group-hover:bg-primary transition-all duration-300">
                  <Heart
                    className="text-primary group-hover:text-white transition-all duration-300"
                    size={30}
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-primary transition-all duration-300">
                  Personalization
                </h3>
                <p className="text-gray-600">
                  Tailored recommendations and health reminders designed
                  specifically for your needs, helping you stay on top of your
                  health.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-white max-w-xl">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Experience Better Healthcare?
              </h2>
              <p className="text-lg opacity-90">
                Join thousands of satisfied patients who've transformed their
                healthcare experience with SwiftCare.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link to={'/doctors'} className="bg-white text-primary px-8 py-3 rounded-lg font-semibold shadow-md hover:bg-gray-100 transition-all duration-300">
                Find a Doctor
              </Link>
              <button className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-all duration-300">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
