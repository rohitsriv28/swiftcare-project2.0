const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

async function test() {
    await mongoose.connect(process.env.MONGODB_URI + '/swiftcare');
    const appointmentModel = require('./models/appointmentModel.js').default;
    const userModel = require('./models/userModel.js').default;
    
    const apps = await appointmentModel.find({});
    console.log("Total appointments:", apps.length);
    for (let app of apps) {
        console.log(`App ${app._id} | User: ${app.userData?.name} | UserId: ${app.userId}`);
    }

    const users = await userModel.find({});
    for (let user of users) {
        console.log(`User ${user._id} | Name: ${user.name}`);
    }

    mongoose.disconnect();
}

test();
