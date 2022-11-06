const jwt = require("jsonwebtoken");
require("dotenv").config();


const authentication=(req,res,next)=>{
    const token = req.headers?.authorization?.split(" ")[1]
    if(!token){
        res.send("Please login")
    }
    const decode = jwt.verify(token,process.env.SECRET_KEY)
    const userId = decode.userId
    if(decode){
        req.body.userId = userId;
        next()
    }
    else{
        res.send("Please Login")
    }
}

module.exports = authentication