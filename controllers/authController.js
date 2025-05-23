import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import userModel from '../models/userModel.js';
dotenv.config();

export const register = async (req, res) => {
  try {

    const { email } = req.body;
     
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success : false,  statusCode: 400,error: "Email already exists" });
    }
  
    const user = await userModel.create(req.body);
    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({success : true,  statusCode: 201,
      message: 'Users Created successfully', user: userObj});
  } catch (err) {
    res.status(400).json({success : false,  statusCode: 400, error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, timeZone } = req.body;
    const user = await userModel.findOne({ email }).select('-password');
  
    if (!user) {
      return res.status(404).json({ success: false, statusCode: 404, message: 'User not found' });
    }

       user.timeZone = timeZone; 
    await user.save();
   
    // Generate JWT token
    const token = jwt.sign({ _id: user._id, role: user.role,timeZone}, process.env.JWT_SECRET,{ expiresIn: '9h' }) ;
    res.json({
      success : true,  
      statusCode: 200,
       token,
       user,
       });
  } catch (err) {
    res.status(400).json({success : false,  statusCode: 400, error: err.message });
  }
};
