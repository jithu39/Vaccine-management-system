import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
    name: { 
      type: String,
       required: true
       },
    email: { 
      type: String,
      required: true, 
      unique: true
     },
    password: {
       type: String,
        required: true,
        minlength: 8,
        select: false
       },
    mobile: {
       type: String,
      required: true
     },
  role: {
     type: String,
      enum: ["resident", "admin"],
      default: "resident"
     }
}, {
   timestamps: true
   });

// Hash the password before saving, only if it was modified (new user or password change)
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Comparing the user password entered by user with the hashed password saved in DB
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Generating a JWT token when a user registers or logins
UserSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

const User = mongoose.model("User", UserSchema);

export default User;