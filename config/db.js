import mongoose from "mongoose"

const connectDb = mongoose.connect(process.env.MONGO_URI).then(()=>{
    console.log("db Connected")
}).catch((e)=>{
    console.log("db diconnected")
})

export  {connectDb}