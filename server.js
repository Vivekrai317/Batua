const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const colors = require('colors');
const connectDb = require('./config/connectDb');
dotenv.config();

//calling db
connectDb();
//rest object
const app=express();

//middlewares
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

//user routes
app.use('/api/v1/users',require('./routes/userRoute'));

//transaction routes
app.use('/api/v1/transactions',require('./routes/transactionRoute'));


//port
const PORT=8080||process.env.PORT

//listen
app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`);
});