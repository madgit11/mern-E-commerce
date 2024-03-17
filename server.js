import express from "express";
import colors from "colors";
import dotenv from "dotenv";
import morgan from "morgan";
import bodyParser from "body-parser";
import cors from 'cors';
import connectDB from "./config/db.js";
import authRoutes from './routes/authRoute.js'
import categoryRoutes from './routes/categoryRoutes.js'
import productRoutes from './routes/productRoutes.js'
dotenv.config({path:'.env'})
connectDB();

const app=express();
//middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'))
app.use(bodyParser.urlencoded({ extended: true }));
//routes
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use('/api/v1/auth',authRoutes)
app.use('/api/v1/category',categoryRoutes)
app.use('/api/v1/product',productRoutes)
app.get("/",(req,res)=>{
    res.send("<h1>Hello world!</h1>")
})
const PORT =process.env.PORT||8080;
app.listen(PORT,()=>{
    console.log(`server is starting at ${PORT}`.bgCyan.white)
})