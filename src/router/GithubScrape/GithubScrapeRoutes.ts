import { SearchReposController } from "../../controller/GithubScrape/SearchReposController";
import { Router } from "express";
import { githubAccessToken } from "../../middlewares/githubOauth";
import { RepositoryTimelineController } from "../../controller/GithubScrape/RepositoryTimelineController";

const router = Router();

router.post('/search/repository', githubAccessToken, SearchReposController);
router.post('/timeline/repository', githubAccessToken, RepositoryTimelineController);
// router.get('/success', githubOauthLoginSuccess);

export default router;