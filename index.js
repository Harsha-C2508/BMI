const express = require("express");
const cors = require("cors")
const connection = require("./config/db");
const UserModel = require("./models/UserModel");
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken");
const authentication = require("./middlewares/authentication");
const BMIModel = require("./models/BMImodel");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 8080

app.use(cors())
app.use(express.json());

app.get("/",(req,res)=>{
    res.send("Welcome to BMI")
})

app.post("/signup",async (req,res) =>{
    const {username,email,password} = req.body
    const isUser = await UserModel.findOne({email});
    if(isUser){
        res.send("Already exists,Please Login")
    }
    else{
        bcrypt.hash(password,4,async function(err,hash){
            if(err){
                res.send({"message":"Something went wrong, Please try again later"})
            }
            const new_user = new UserModel({
                username,
                email,
                password : hash
            })
           try{
               await new_user.save()
                res.send({"message":"SignUp successful"})
           }
           catch(err){
            res.send({"message":"Something went wrong"});
           }
        });
    }
})


app.post("/login",async (req,res)=>{
    const {email,password} = req.body;
    const user = await UserModel.findOne({email});
    const hashed_Password = user.password
    const userId = user._id;
    bcrypt.compare(password,hashed_Password,function(err,result){
        if(err){
            res.send({"message":"Something went wrong,Please try again"})
        }
        if(result){
            const token = jwt.sign({userId},process.env.SECRET_KEY)
            res.send({"message":"Login Successfull",token})
        }
        else{
            res.send({"message":"Wrong Credential"})
        }
    })
})


app.get("/getProfile",authentication , async(req,res)=>{
        const {userId} = req.body
        const user = await UserModel.findOne({_id: userId})
       const {username,email} = user
        res.send({username,email})
})


app.post("/calculateBMI",authentication,async (req,res)=>{
    const {height,weight,userId} = req.body;
    const height_in_meter = Number(height)*0.3048;
    const BMI = Number(weight)/(height_in_meter)**2
    const new_bmi = new BMIModel({
        BMI,
        height : height_in_meter,
        weight,
        userId 
    })
    await new_bmi.save();
    res.send({BMI})
});


app.get("/getCalculation",authentication,async (req,res)=>{
       const {userId} = req.body;
       const all_bmi = await BMIModel.find({userId : userId})

       res.send({history:all_bmi})
})
app.listen(PORT, async () =>{
    try{
        await connection
        console.log("connected to DB")
 
     }
     catch(err){
       console.log("connection falied");
       console.log(err)
     }
     console.log(`Running server is PORT ${PORT}`)
})