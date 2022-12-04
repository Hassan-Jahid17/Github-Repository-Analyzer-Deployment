import crypto from "crypto";
import jwt from "jsonwebtoken";
import { TokenPayload } from "../models/interfaces/TokenPayload";

const generateAccessToken = (claims : TokenPayload) => {
	const accessToken = jwt.sign(
		claims,
		`${process.env.ACCESS_TOKEN_SECRET_KEY}`,
		{
			expiresIn: process.env.ACCESS_TOKEN_EXPIRY_TIME
		}
	);


	return accessToken;
}

const generateRefreshToken = () => {
	return crypto.randomBytes(32).toString('hex');
}

const getClaimsFromToken = (token: string) : TokenPayload | null => {
	try{
		return jwt.verify(token, `${process.env.ACCESS_TOKEN_SECRET_KEY}`, {
			ignoreExpiration : true,
		}) as TokenPayload;
	}catch(error: any) {
		console.log("problem occured when token decoded");
	}
	return null;
}

export {
	generateAccessToken,
	generateRefreshToken,
	getClaimsFromToken
}