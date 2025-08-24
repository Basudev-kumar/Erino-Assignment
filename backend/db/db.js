import mongoose from "mongoose";

const connectDB = async ()=>{

    try {
        await mongoose.connect(process.env.MONGODB);
        console.log("MongoDB connected");
    } catch (error) {
        
        console.log("MongoDB failed",error);
        process.exit(1);
    }
}



export default connectDB