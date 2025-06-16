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
// if(process.env.NODE_ENV = 'development'){
//   app.use(cors({origin: 'http://localhost:3000'}));
// }

app.use(cors());  //to anable acces from any where
//using midle ware
app.get("/sayhi", (req, res)=>{
  return res.json({message:"hi everyone"})
})

setInterval(() => {
  const fetchData = async () => {
    try {
      const res = await fetch(
          "https://chess-0-2-backend.onrender.com/sayhello"
      );
      const data = await res.json();
      console.log(data.message);
    } catch (e) {
      console.error("Error fetching:", e);
    }
  };

  fetchData();
}, 1000 * 60 * 10);
app.use(authRouts);

//app middleware


const port =  process.env.PORT || 8000;
app.listen(port, ()=>{
  console.log(`app is runing in port ${port}`)
})