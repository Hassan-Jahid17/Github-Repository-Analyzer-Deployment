import axios from 'axios';
import { Provider } from '../../const/User';
import { Request, Response, NextFunction } from 'express';
import { TokenPayload } from '../../models/interfaces/TokenPayload';
import { User } from '../../models/interfaces/User';
import { UserToken } from '../../models/interfaces/UserToken';
import { UserModel } from '../../models/UserModel';
import { UserTokenModel } from '../../models/UserTokenModel';
import qs from "qs";
import { getUserClaimsFromGithubUser } from '../../services/githubOauth';
import { generateAccessToken, generateRefreshToken } from '../../services/JwtTokenService';
import { addMinutes } from "date-fns";
import { encrypt } from '../../services/EncryptDecrypt';


async function githubOauthLogin(req: Request, res: Response, next: NextFunction) {

	console.log("/github/callback");

	const requestToken = req.query.code;
	const redirectUrl = req.query.state;


	try {
		const response = await axios.post(`https://github.com/login/oauth/access_token?client_id=${process.env.GITHUB_OAUTH2_CLIENT_ID}&client_secret=${process.env.GITHUB_OAUTH2_CLIENT_SECRET}&code=${requestToken}`, {
			headers: {
				accept: 'application/x-www-form-urlencoded'
			}
		});


		let accessToken = qs.parse(response.data).access_token;
		
		res.redirect(`${process.env.APP_URL}/github/success?token=${accessToken}&redirectUrl=${redirectUrl}`)
	}catch(e) {
		console.log("Error occured");
		console.log(e);
	}
}


async function githubOauthLoginSuccess(req: Request, res: Response, next: NextFunction) {

	console.log("/github/success");

	const accessToken: string = req.query.token as string;
	const redirectUrl = req.query.redirectUrl as string;

	console.log(accessToken, redirectUrl);

	res.redirect(redirectUrl);

	try {

		let response;
		try{
			response = await axios.get(`https://api.github.com/user`, {
				headers: {
					Authorization: 'token ' + accessToken
				}
			});
		}catch(error) {
			console.log(error);
		}


		let currentUserData = response?.data;
		console.log("currentUserData");
		console.log(currentUserData);


		const userClaims: TokenPayload = getUserClaimsFromGithubUser(currentUserData);
		console.log("userClaims", userClaims);


		let user = await UserModel.findOne<User>({
			UserName: userClaims.UserName,
			Provider: Provider.GITHUB
		})

		console.log("user", user);
	
		if(!user) {
			user = await new UserModel<User>({...userClaims} as User).save();

			console.log("New User", user);
		}


		const AccessToken = generateAccessToken(userClaims);

		const RefreshToken = generateRefreshToken();

		console.log("AccessToken", "RefreshToken");
		console.log(AccessToken, RefreshToken);

		const refreshTokenExpiryTime = process.env.REFRESH_TOKEN_EXPIRY_TIME as unknown;
		console.log("refreshTokenExpiryTime",refreshTokenExpiryTime);

		await UserTokenModel.updateOne<UserToken>(
			{UserId : user._id},
			{$set : {
				RefreshToken: RefreshToken,
				GithubAccessToken: encrypt(accessToken),
				RefreshTokenExpiryTime: addMinutes(Date.now(), refreshTokenExpiryTime as number)
			}},
			{upsert: true}
		);


		res.cookie('AccessToken', AccessToken);
		res.cookie('RefreshToken', RefreshToken);

		res.redirect(redirectUrl);
		
	}catch(error) {
		console.log(error);
	}
}



export {
	githubOauthLogin,
	githubOauthLoginSuccess
}