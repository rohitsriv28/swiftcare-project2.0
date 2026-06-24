import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import userModel from "../models/userModel.js";
import connectDB from "../config/db.js";

dotenv.config();

const usersData = [
  {
    "name": "Rohit Raj",
    "email": "rohit.raj@example.com",
    "phone": "9876543210",
    "dob": "2004-03-28",
    "gender": "Male",
    "address": {
      "line1": "Ward 12, Main Road",
      "line2": "Raxaul, Bihar, India"
    }
  },
  {
    "name": "Priya Kumari",
    "email": "priya.kumari@example.com",
    "phone": "9876543211",
    "dob": "1998-07-15",
    "gender": "Female",
    "address": {
      "line1": "Gandak Colony",
      "line2": "Raxaul, Bihar, India"
    }
  },
  {
    "name": "Sandeep Yadav",
    "email": "sandeep.yadav@example.com",
    "phone": "9876543212",
    "dob": "1987-11-22",
    "gender": "Male",
    "address": {
      "line1": "Station Road",
      "line2": "Raxaul, Bihar, India"
    }
  },
  {
    "name": "Anjali Sharma",
    "email": "anjali.sharma@example.com",
    "phone": "9876543213",
    "dob": "2001-04-09",
    "gender": "Female",
    "address": {
      "line1": "Adarsh Nagar",
      "line2": "Raxaul, Bihar, India"
    }
  },
  {
    "name": "Aman Gupta",
    "email": "aman.gupta@example.com",
    "phone": "9876543214",
    "dob": "1992-12-03",
    "gender": "Male",
    "address": {
      "line1": "Bank Road",
      "line2": "Raxaul, Bihar, India"
    }
  },
  {
    "name": "Sunita Devi",
    "email": "sunita.devi@example.com",
    "phone": "9876543215",
    "dob": "1981-05-18",
    "gender": "Female",
    "address": {
      "line1": "Ward 8",
      "line2": "Raxaul, Bihar, India"
    }
  },
  {
    "name": "Rahul Mishra",
    "email": "rahul.mishra@example.com",
    "phone": "9876543216",
    "dob": "2007-02-14",
    "gender": "Male",
    "address": {
      "line1": "New Bazaar",
      "line2": "Raxaul, Bihar, India"
    }
  },
  {
    "name": "Neha Singh",
    "email": "neha.singh@example.com",
    "phone": "9876543217",
    "dob": "1995-08-30",
    "gender": "Female",
    "address": {
      "line1": "Shiv Mandir Chowk",
      "line2": "Raxaul, Bihar, India"
    }
  },
  {
    "name": "Bikash Thapa",
    "email": "bikash.thapa@example.com",
    "phone": "9801000001",
    "dob": "1997-06-12",
    "gender": "Male",
    "address": {
      "line1": "Adarsh Nagar",
      "line2": "Birgunj, Nepal"
    }
  },
  {
    "name": "Sushmita Karki",
    "email": "sushmita.karki@example.com",
    "phone": "9801000002",
    "dob": "2003-09-21",
    "gender": "Female",
    "address": {
      "line1": "Ghantaghar Area",
      "line2": "Birgunj, Nepal"
    }
  },
  {
    "name": "Prakash Chaudhary",
    "email": "prakash.chaudhary@example.com",
    "phone": "9801000003",
    "dob": "1984-01-11",
    "gender": "Male",
    "address": {
      "line1": "Resham Kothi",
      "line2": "Birgunj, Nepal"
    }
  },
  {
    "name": "Manisha Shrestha",
    "email": "manisha.shrestha@example.com",
    "phone": "9801000004",
    "dob": "2005-10-04",
    "gender": "Female",
    "address": {
      "line1": "Link Road",
      "line2": "Birgunj, Nepal"
    }
  },
  {
    "name": "Ramesh Adhikari",
    "email": "ramesh.adhikari@example.com",
    "phone": "9801000005",
    "dob": "1989-07-28",
    "gender": "Male",
    "address": {
      "line1": "Parwanipur Road",
      "line2": "Birgunj, Nepal"
    }
  },
  {
    "name": "Sabina Rai",
    "email": "sabina.rai@example.com",
    "phone": "9801000006",
    "dob": "1999-12-19",
    "gender": "Female",
    "address": {
      "line1": "Murli Area",
      "line2": "Birgunj, Nepal"
    }
  },
  {
    "name": "Dipesh Mahato",
    "email": "dipesh.mahato@example.com",
    "phone": "9801000007",
    "dob": "2002-03-07",
    "gender": "Male",
    "address": {
      "line1": "Birta",
      "line2": "Birgunj, Nepal"
    }
  },
  {
    "name": "Pooja Sah",
    "email": "pooja.sah@example.com",
    "phone": "9801000008",
    "dob": "1994-11-25",
    "gender": "Female",
    "address": {
      "line1": "Power House Chowk",
      "line2": "Birgunj, Nepal"
    }
  },
  {
    "name": "Karan Patel",
    "email": "karan.patel@example.com",
    "phone": "9876543218",
    "dob": "1986-04-16",
    "gender": "Male",
    "address": {
      "line1": "Hospital Road",
      "line2": "Raxaul, Bihar, India"
    }
  },
  {
    "name": "Asha Jha",
    "email": "asha.jha@example.com",
    "phone": "9876543219",
    "dob": "1991-09-02",
    "gender": "Female",
    "address": {
      "line1": "Ward 5",
      "line2": "Raxaul, Bihar, India"
    }
  },
  {
    "name": "Nabin Gautam",
    "email": "nabin.gautam@example.com",
    "phone": "9801000009",
    "dob": "1983-02-26",
    "gender": "Male",
    "address": {
      "line1": "Chapkaiya",
      "line2": "Birgunj, Nepal"
    }
  },
  {
    "name": "Rekha KC",
    "email": "rekha.kc@example.com",
    "phone": "9801000010",
    "dob": "2000-05-13",
    "gender": "Female",
    "address": {
      "line1": "Maisthan",
      "line2": "Birgunj, Nepal"
    }
  }
];

const seedDB = async () => {
  try {
    await connectDB();
    console.log("Connected to database");

    // Generate a default hashed password for all seeded users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    const usersToInsert = usersData.map(user => ({
      ...user,
      password: hashedPassword
    }));

    await userModel.insertMany(usersToInsert);
    console.log("Users inserted successfully");

    mongoose.disconnect();
    console.log("Disconnected from database");
  } catch (error) {
    console.error("Error seeding data:", error);
    mongoose.disconnect();
  }
};

seedDB();
