import mongoose from "mongoose";
import bcrypt from "bcrypt";
const { Schema } = mongoose;

const hotelSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      required: "Title is required",
    },
    content: {
      type: String,
      trim: true,
      required: "Content is required",
      maxlength:10000
      
    },
    location: {
      type: String,
      required: 'Location is Required',
    
    },
    
    price: {
        type:Number,
        required:'Price IS Required',
        trim :true
    },
    postedBy: {
        type:mongoose.Types.ObjectId,
        ref:'User'

    },
    image: {
        data:Buffer,
        contentType:String
    },
    from : {
        type:Date
    },
    to : {
        type:Date
    },
    bed: {
        type:Number
    }

      },
  { timestamps: true }
);



export default mongoose.model("Hotel", hotelSchema);
