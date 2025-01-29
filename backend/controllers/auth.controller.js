import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import generateVerficationToken from "../utils/generateVerificationCode.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendResetSuccessfulEmail } from "../mailtrap/email.js";
import crypto from "crypto";

export const signup = async (req, res, next) => {
    try {
        // extract the body
        const { email, password, name } = req.body;
        // check if all fields are provided
        if (!email || !password || !name) {
            throw new Error("all fields are required!");
        }
        // check that the email is unique
        const userAlreadyExists = await User.findOne({ email });
        if (userAlreadyExists) {
            throw new Error("user already exists");
        }
        // hash the password and save it in the database
        const hashedPassword = await bcrypt.hash(password, 10);
        // ganerate the verfication code
        const verificationToken = generateVerficationToken();
        const user = new User({
            email: email,
            password: hashedPassword,
            name: name,
            verficationToken: verificationToken,
            verficationTokenExpiresAt: Date.now() + 10 * 60 * 1000, // expires in 10 minutes
        });
        await user.save();

        // authenticate the user by creating a token by jwt 
        generateTokenAndSetCookie(res, user._id);

        // verify email
        await sendVerificationEmail(user.email, verificationToken);

        // return the user authenticated
        res.status(200).json({
            success: true,
            message: "user created successfully",
            user: {
                ...user._doc,
                password: undefined,
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `error in signup controller : ${error.message}`,
        })
    }
};

export const verifyEmail = async (req, res) => {
    const { code } = req.body;
    try {
        // find the sent verification code from the database, and check if it is still valid (not expired)
        const user = await User.findOne({
            verficationToken: code,
            verficationTokenExpiresAt: { $gt: Date.now() },
        });
        if (!user) {
            return res.status(400).json({ message: "Invalid or expired verification code" });
        }
        // if user is found, verify = true and delete the code from the database
        user.isVerified = true;
        user.verficationToken = undefined;
        user.verficationTokenExpiresAt = undefined;

        // save the changes to the database
        await user.save();

        // send welcome email
        await sendWelcomeEmail(user.email, user.name);

        return res.status(200).json({ message: "user verified!" })
    } catch (error) {

    }

};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        generateTokenAndSetCookie(res, user._id);

        user.lastLogin = new Date();
        await user.save();

        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user: {
                ...user._doc,
                password: undefined,
            },
        });
    } catch (error) {
        console.log("Error in login ", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

export const logout = async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "user not found!" });
        }
        // generate reset token
        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // expires in 1 hour
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = resetTokenExpiresAt;

        // update the database
        await user.save();
        // send reset email
        await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

        res.status(200).json({ message: "Reset password email sent successfully!" });
    } catch (error) {
        console.log("Error in forgotPassword: ", error.message)
    }
};

export const resetPawssord = async (req, res) => {
    const { password } = req.body;
    const { token } = req.params;
    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: { $gt: Date.now() },
        });
        console.log(user);
        if(!user){
            return res.status(400).json({ message: "Invalid or expired reset password token!" });
        }
        //update password, hash it first
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        // remove the tokens from the database
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;
        await user.save();
        await sendResetSuccessfulEmail(user.email);

        return res.status(200).json({ message:"password updated successfuly"})
    } catch (error) {
        console.log("Error in forgotPassword: ", error.message);
    }
};