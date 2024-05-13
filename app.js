const express = require("express")
const morgan = require('morgan')  // HTTP request logger middleware for Express
const cors = require('cors')  //Cross-Origin Resource Sharing
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
require('dotenv').config()
//import routes
const authRouts = require('./Routes/auth')

const app = express();
//connect to database
const url = process.env.DATABASE_URL
mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(()=>console.log('mongo connected'))
.catch(err=>console.log(err)) 

//app middleware
app.use(morgan('dev'));
app.use(bodyParser.json())
// app.use(cors()); //allow acess from all domain (origin)
if(process.env.NODE_ENV = 'development'){
  app.use(cors({origin: 'http://localhost:3000'}));
}
//using midle ware
app.use(authRouts);

//app middleware


const port =  process.env.PORT || 8000;
app.listen(port, ()=>{
  console.log(`app is runing in port ${port}`)
})