import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import generateVerficationToken from "../utils/generateVerificationCode.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";

export const signup = async (req, res, next) => {
    try {
        // extract the body
        const { email, password, name } = req.body;
        // check if all fields are provided
        if ( !email || !password || !name ) {
            throw new Error("all fields are required!");
        }
        // check that the email is unique
        const userAlreadyExists = await User.findOne({ email });
        if ( userAlreadyExists ) {
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
