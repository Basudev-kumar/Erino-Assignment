import express from "express";
import dotenv from 'dotenv';
import cors from "cors";
import connectDB from "./db/db.js";
import cookieParser from "cookie-parser";
import authRoutes from './routes/auth.routes.js';
import leadRoutes from './routes/lead.routes.js';
import authenticate from './middlewares/auth.middleware.js';







dotenv.config({path:"./.env"})


const app = express();
const PORT = process.env.PORT || 5001;



// 'http://localhost:5173'

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));


app.use(express.json());
app.use(cookieParser());


app.use('/api/auth',authRoutes);
app.use('/api/leads',authenticate,leadRoutes);




app.get('/', (req, res) => {
    res.send('API is running!');
});



connectDB().then(()=>{
app.listen(PORT,()=>{
    console.log(`Server running on PORT : ${PORT} `)
});
}).catch((err)=>{
    console.log("MongoDB connection failed", err);
})

