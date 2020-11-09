const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Station = require('./models/traininfo');
const Review = require('./models/review')
const ExpressError = require('./utils/ExpressError');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geocoder = mbxGeocoding({ accessToken: 'pk.eyJ1IjoicGF0cmF3aSIsImEiOiJja2d4b2tsMG4wNW5wMnNxdmdpcTdpYXdyIn0.8Czahd6OMIWbV7J6iNCv0w'});
const bodyParser = require('body-parser')
mongoose.connect('mongodb+srv://usertest:VTAFqNqnUk5nF8EL@cluster0.jodck.mongodb.net/Station?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/', (req, res) => {
    res.render('home')
});
app.get('/map',  (req, res) => {
    res.render('Map/Show') 
});

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

app.get('/map/sukhumvit', async (req, res)=> {
  
     const stations = await Station.find({});
     res.render('Map/sukhumvit', { stations } );
});

app.get('/map/:id', async (req, res) => {
    const station = await Station.findById(req.params.id);
    res.render('./Map/station', {station});
    
});

app.post('/map/:id/reviews', async(req, res)=> {
    const station = await Station.findById(req.params.id);
    const review = new Review(req.body.review);
    station.reviews.push(review);
    await review.save();
    await station.save();
    res.redirect(`/Map/${station._id}`);

})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})

