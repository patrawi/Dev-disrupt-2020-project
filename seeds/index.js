const mongoose = require('mongoose');
const Station = require('../models/traininfo');
const {level} = require('./crowd-level');
const data = require('./data');

mongoose.connect('mongodb+srv://usertest:VTAFqNqnUk5nF8EL@cluster0.jodck.mongodb.net/Station?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error"));
db.once("open", () =>{
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async() => {
    await Station.deleteMany({});
    for (let i = 0; i < 40; i++) {
        const station = new Station({
            location: 'Bangkok, Thailand' ,
            level: `${sample(level)}`,
            population: `${data[i].population}`,
            name: `${data[i].name}`,
            geometry: {
                type: "Point",
               
            },
            lat: `${data[i].latitude}`,
            long: `${data[i].longitude}`
            
        })
        await station.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})