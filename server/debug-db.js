const mongoose = require('mongoose');
const Project = require('./models/Project'); 
require('dotenv').config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to DB");

        const projects = await Project.find({});
        console.log("Projects in DB:", projects.length);
        projects.forEach(p => {
            console.log(`ID: ${p._id} (Type: ${typeof p._id}), Title: ${p.title}, User: ${p.user}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};

run();
