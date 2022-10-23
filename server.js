require('dotenv').config() 
const express = require('express')
const app = express()
const ejs = require('ejs')
const path = require('path')
const expressLayout = require('express-ejs-layouts')
const PORT = process.env.PORT || 3000
const mongoose = require('mongoose')
const fs = require('fs')
const session= require('express-session')
const flash = require('express-flash')
const MongoDbStore = require('connect-mongo');
const passport = require('passport')
const Emitter = require('events')

// // databse conection

const username="vchandanshive";
const password ="book";
const Cluster ="Cluster0";
const dbname="book";

// setting up env
app.use(express.json());
app.use(express());  

// db connection
const url =`mongodb+srv://${username}:${password}@${Cluster}.zdax2.mongodb.net/${dbname}?retryWrites=true&w=majority`;
// const url = process.env.MONGO_CONNECTION_URL
mongoose.connect(url,
{
    useNewUrlParser: true,
    // useFindAndModify: false,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
}); 


// // session store
let mongoStore = new MongoDbStore({
    mongoUrl:url,
    mongooseConnection: db,
    secret: 'thisshouldbeabettersecret!',
    colection:'sessions'
});

// event emitter
const eventEmitter = new Emitter()
app.set('eventEmitter', eventEmitter) 

// //session config
app.use(session({ 
    secret: 'thisismysecret',
    resave: false,
    store:mongoStore,
    saveUninitialized: false,
    cookie: { maxAge:1000*60*60} //  24 hours
}));

// // passport config
const passportinit =require('./app/config/passport')
passportinit(passport)
app.use(passport.initialize())
app.use(passport.session())


app.use(flash())
// //assets
app.use(express.static('public'))
app.use(express.urlencoded({extended: false }))
app.use(express.json())

// // global middleware
app.use((req,res,next)=>{
    res.locals.session = req.session
    res.locals.user=req.user
    next()
})



// // set template engine
app.use(expressLayout)
app.set('views', path.join(__dirname, '/resources/views'))
app.set('view engine', 'ejs')

require('./rautes/web')(app)
app.use((req, res) => {
    res.status(404).render('errors/404')
})


const server = app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
}) 

const io = require('socket.io')(server)
io.on('connection',(socket)=>{
    //join
    socket.on('join', (orderId) => {
        socket.join(orderId)
  
      })
})
    
eventEmitter.on('orderUpdated',(data)=>{
    io.to(`order_${data.id}`).emit('orderUpdated', data)
})

eventEmitter.on('orderPlaced',(data)=>{
    io.to('adminRoom').emit('orderPlaced',data)
})