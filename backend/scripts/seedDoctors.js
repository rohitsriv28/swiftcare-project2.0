import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import doctorModel from "../models/doctorModel.js";
import connectDB from "../config/db.js";

dotenv.config();

const doctorsData = [
  {
    "name": "Dr. Suresh Adhikari",
    "email": "suresh.adhikari@swiftcare.com",
    "password": "doctor123",
    "image": "https://randomuser.me/api/portraits/men/1.jpg",
    "speciality": "Cardiology",
    "experience": "18 Years",
    "degree": "MBBS, MD (Cardiology)",
    "about": "Experienced cardiologist specializing in hypertension, heart failure, preventive cardiology, and cardiac risk assessment.",
    "fee": 1800,
    "address": {
      "line1": "Narayani Heart Center",
      "line2": "Birgunj, Nepal"
    }
  },
  {
    "name": "Dr. Sabina Karki",
    "email": "sabina.karki@swiftcare.com",
    "password": "doctor123",
    "image": "https://randomuser.me/api/portraits/women/2.jpg",
    "speciality": "Gynecology",
    "experience": "12 Years",
    "degree": "MBBS, MD (Obstetrics & Gynecology)",
    "about": "Dedicated gynecologist providing prenatal care, reproductive health consultations, and women's wellness services.",
    "fee": 1500,
    "address": {
      "line1": "Birgunj Women's Clinic",
      "line2": "Birgunj, Nepal"
    }
  },
  {
    "name": "Dr. Bikash Shrestha",
    "email": "bikash.shrestha@swiftcare.com",
    "password": "doctor123",
    "image": "https://randomuser.me/api/portraits/men/3.jpg",
    "speciality": "Orthopedics",
    "experience": "15 Years",
    "degree": "MBBS, MS (Orthopedics)",
    "about": "Orthopedic surgeon focused on fracture management, sports injuries, and joint replacement procedures.",
    "fee": 1700,
    "address": {
      "line1": "Metro Orthopedic Center",
      "line2": "Birgunj, Nepal"
    }
  },
  {
    "name": "Dr. Manisha Gautam",
    "email": "manisha.gautam@swiftcare.com",
    "password": "doctor123",
    "image": "https://randomuser.me/api/portraits/women/4.jpg",
    "speciality": "Dermatology",
    "experience": "9 Years",
    "degree": "MBBS, MD (Dermatology)",
    "about": "Provides advanced treatment for skin, hair, nail disorders, and cosmetic dermatology procedures.",
    "fee": 1400,
    "address": {
      "line1": "Skin Health Clinic",
      "line2": "Birgunj, Nepal"
    }
  },
  {
    "name": "Dr. Prakash Thapa",
    "email": "prakash.thapa@swiftcare.com",
    "password": "doctor123",
    "image": "https://randomuser.me/api/portraits/men/5.jpg",
    "speciality": "Neurology",
    "experience": "16 Years",
    "degree": "MBBS, DM (Neurology)",
    "about": "Neurologist specializing in migraine treatment, epilepsy management, stroke prevention, and nerve disorders.",
    "fee": 2000,
    "address": {
      "line1": "Neuro Care Center",
      "line2": "Birgunj, Nepal"
    }
  },
  {
    "name": "Dr. Rina Poudel",
    "email": "rina.poudel@swiftcare.com",
    "password": "doctor123",
    "image": "https://randomuser.me/api/portraits/women/6.jpg",
    "speciality": "Pediatrics",
    "experience": "11 Years",
    "degree": "MBBS, MD (Pediatrics)",
    "about": "Experienced pediatrician providing comprehensive healthcare for infants, children, and adolescents.",
    "fee": 1200,
    "address": {
      "line1": "Child Wellness Center",
      "line2": "Birgunj, Nepal"
    }
  },
  {
    "name": "Dr. Nabin Chaudhary",
    "email": "nabin.chaudhary@swiftcare.com",
    "password": "doctor123",
    "image": "https://randomuser.me/api/portraits/men/7.jpg",
    "speciality": "General Medicine",
    "experience": "14 Years",
    "degree": "MBBS, MD (Internal Medicine)",
    "about": "Treats diabetes, hypertension, infections, and chronic medical conditions with patient-centered care.",
    "fee": 1000,
    "address": {
      "line1": "Narayani Medical Clinic",
      "line2": "Birgunj, Nepal"
    }
  },
  {
    "name": "Dr. Asha Rai",
    "email": "asha.rai@swiftcare.com",
    "password": "doctor123",
    "image": "https://randomuser.me/api/portraits/women/8.jpg",
    "speciality": "Ophthalmology",
    "experience": "10 Years",
    "degree": "MBBS, MS (Ophthalmology)",
    "about": "Eye specialist experienced in cataract surgery, glaucoma management, and retinal disease diagnosis.",
    "fee": 1300,
    "address": {
      "line1": "Vision Eye Hospital",
      "line2": "Birgunj, Nepal"
    }
  },
  {
    "name": "Dr. Deepak Mahato",
    "email": "deepak.mahato@swiftcare.com",
    "password": "doctor123",
    "image": "https://randomuser.me/api/portraits/men/9.jpg",
    "speciality": "ENT",
    "experience": "13 Years",
    "degree": "MBBS, MS (ENT)",
    "about": "Provides treatment for ear, nose, throat disorders, sinus problems, and hearing-related conditions.",
    "fee": 1200,
    "address": {
      "line1": "ENT Specialty Center",
      "line2": "Birgunj, Nepal"
    }
  },
  {
    "name": "Dr. Sushmita KC",
    "email": "sushmita.kc@swiftcare.com",
    "password": "doctor123",
    "image": "https://randomuser.me/api/portraits/women/10.jpg",
    "speciality": "Psychiatry",
    "experience": "8 Years",
    "degree": "MBBS, MD (Psychiatry)",
    "about": "Mental health professional specializing in anxiety, depression, stress management, and behavioral disorders.",
    "fee": 1600,
    "address": {
      "line1": "Mind Wellness Clinic",
      "line2": "Birgunj, Nepal"
    }
  },
  {
    "name": "Dr. Roshan Acharya",
    "email": "roshan.acharya@swiftcare.com",
    "password": "doctor123",
    "image": "https://randomuser.me/api/portraits/men/11.jpg",
    "speciality": "Urology",
    "experience": "17 Years",
    "degree": "MBBS, MCh (Urology)",
    "about": "Expert in kidney stones, urinary tract disorders, prostate diseases, and minimally invasive surgeries.",
    "fee": 1800,
    "address": {
      "line1": "Advanced Urology Center",
      "line2": "Birgunj, Nepal"
    }
  },
  {
    "name": "Dr. Nisha Bhandari",
    "email": "nisha.bhandari@swiftcare.com",
    "password": "doctor123",
    "image": "https://randomuser.me/api/portraits/women/12.jpg",
    "speciality": "Endocrinology",
    "experience": "12 Years",
    "degree": "MBBS, DM (Endocrinology)",
    "about": "Specializes in diabetes management, thyroid disorders, hormonal imbalances, and metabolic diseases.",
    "fee": 1700,
    "address": {
      "line1": "Hormone Care Clinic",
      "line2": "Birgunj, Nepal"
    }
  },
  {
    "name": "Dr. Kiran Regmi",
    "email": "kiran.regmi@swiftcare.com",
    "password": "doctor123",
    "image": "https://randomuser.me/api/portraits/men/13.jpg",
    "speciality": "Pulmonology",
    "experience": "15 Years",
    "degree": "MBBS, DM (Pulmonology)",
    "about": "Respiratory specialist treating asthma, COPD, sleep disorders, and chronic lung diseases.",
    "fee": 1600,
    "address": {
      "line1": "Lung Care Institute",
      "line2": "Birgunj, Nepal"
    }
  },
  {
    "name": "Dr. Menuka Nepal",
    "email": "menuka.nepal@swiftcare.com",
    "password": "doctor123",
    "image": "https://randomuser.me/api/portraits/women/14.jpg",
    "speciality": "Dentistry",
    "experience": "7 Years",
    "degree": "BDS, MDS",
    "about": "Dental surgeon providing preventive, restorative, cosmetic, and oral surgery services.",
    "fee": 900,
    "address": {
      "line1": "Smile Dental Care",
      "line2": "Birgunj, Nepal"
    }
  },
  {
    "name": "Dr. Arjun Lamichhane",
    "email": "arjun.lamichhane@swiftcare.com",
    "password": "doctor123",
    "image": "https://randomuser.me/api/portraits/men/15.jpg",
    "speciality": "Gastroenterology",
    "experience": "14 Years",
    "degree": "MBBS, DM (Gastroenterology)",
    "about": "Specializes in digestive disorders, liver diseases, endoscopy procedures, and gastrointestinal health.",
    "fee": 1900,
    "address": {
      "line1": "Digestive Health Center",
      "line2": "Birgunj, Nepal"
    }
  },
  {
    "name": "Dr. Sarita Oli",
    "email": "sarita.oli@swiftcare.com",
    "password": "doctor123",
    "image": "https://randomuser.me/api/portraits/women/16.jpg",
    "speciality": "Radiology",
    "experience": "10 Years",
    "degree": "MBBS, MD (Radiology)",
    "about": "Diagnostic imaging expert with experience in MRI, CT scan, ultrasound, and radiological interpretation.",
    "fee": 1500,
    "address": {
      "line1": "Advanced Imaging Center",
      "line2": "Birgunj, Nepal"
    }
  },
  {
    "name": "Dr. Ritesh Gurung",
    "email": "ritesh.gurung@swiftcare.com",
    "password": "doctor123",
    "image": "https://randomuser.me/api/portraits/men/17.jpg",
    "speciality": "Nephrology",
    "experience": "13 Years",
    "degree": "MBBS, DM (Nephrology)",
    "about": "Kidney specialist treating chronic kidney disease, dialysis patients, hypertension, and electrolyte disorders.",
    "fee": 1750,
    "address": {
      "line1": "Renal Care Institute",
      "line2": "Birgunj, Nepal"
    }
  }
];

const seedDB = async () => {
  try {
    await connectDB();
    console.log("Connected to database");

    const salt = await bcrypt.genSalt(10);

    const doctorsToInsert = await Promise.all(
      doctorsData.map(async (doctor) => {
        const hashedPassword = await bcrypt.hash(doctor.password, salt);
        return {
          ...doctor,
          password: hashedPassword
        };
      })
    );

    await doctorModel.insertMany(doctorsToInsert);
    console.log("Doctors inserted successfully");

    mongoose.disconnect();
    console.log("Disconnected from database");
  } catch (error) {
    console.error("Error seeding doctors data:", error);
    mongoose.disconnect();
  }
};

seedDB();
