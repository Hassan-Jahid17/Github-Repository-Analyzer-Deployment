import { githubOauthLogin, githubOauthLoginSuccess } from "../../controller/Identity/GithubOauthController";
import { Router } from "express";

const router = Router();

router.get('/callback', githubOauthLogin);

router.get('/success', githubOauthLoginSuccess);

export default router;