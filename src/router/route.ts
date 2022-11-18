import authRoutes from "./identity/auth";
import githubOauthRoutes from "./identity/githubOauth";
import tokenRoutes from "./identity/token";
import userRoutes from "./identity/token";
import githubUserInfoRoutes from "./GithubScrape/GithubScrapeRoutes"
import { Router } from "express";


const router = Router();


/* Auth Identity Related Route */
router.use("/api/identity", authRoutes);
router.use("/api/identity/refresh", tokenRoutes);
router.use("/github", githubOauthRoutes);


/* Github Scrapping Related Route */
router.use("/api/user", userRoutes);
router.use("/api/github", githubUserInfoRoutes);

export default router;