// import jwt from 'jsonwebtoken';
// import User from '../models/User.js';

// export const protect = async (req, res, next) => {
//   let token;

//   // Check authorization header
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith('Bearer')
//   ) {
//     try {
//       token = req.headers.authorization.split(' ')[1];

//       // Decode token
//       const decoded = jwt.verify(token, process.env.JWT_SECRET || 'creatorhub_jwt_secret_super_secret_key_2026');

//       // Get user from token, exclude password
//       req.user = await User.findById(decoded.id).select('-password');
//       if (!req.user) {
//         return res.status(401).json({ success: false, message: 'User not found' });
//       }

//       next();
//     } catch (error) {
//       console.error('JWT verification error:', error.message);
//       return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
//     }
//   }

//   if (!token) {
//     return res.status(401).json({ success: false, message: 'Not authorized, no token' });
//   }
// };

// export const admin = (req, res, next) => {
//   if (req.user && req.user.role === 'admin') {
//     next();
//   } else {
//     res.status(403).json({ success: false, message: 'Not authorized as an admin' });
//   }
// };



import jwt from "jsonwebtoken";
import User from "../models/User.js";


export const protect = async (req, res, next) => {

  try {

    let token;


    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {

      token = req.headers.authorization.split(" ")[1];

    }


    if (!token) {
      return res.status(401).json({
        success:false,
        message:"Not authorized, no token"
      });
    }


    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "creatorhub_jwt_secret_super_secret_key_2026"
    );


    req.user = await User.findById(decoded.id)
      .select("-password");


    if (!req.user) {
      return res.status(401).json({
        success:false,
        message:"User not found"
      });
    }


    next();


  } catch(error) {

    console.log("Auth Error:", error.message);

    return res.status(401).json({
      success:false,
      message:"Invalid token"
    });

  }

};



export const admin = (req,res,next)=>{

  if(!req.user){

    return res.status(401).json({
      success:false,
      message:"Login required"
    });

  }


  if(req.user.role !== "admin"){

    return res.status(403).json({
      success:false,
      message:"Admin access only"
    });

  }


  next();

};