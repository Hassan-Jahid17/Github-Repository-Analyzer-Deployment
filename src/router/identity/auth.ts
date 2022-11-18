// import { signup } from "./controller/Identity/AuthController";
import {login, signup} from "../../controller/Identity/AuthController";
import { Router } from "express";

const router1 = Router();

router1.post('/signup', signup);

router1.post('/login', login);

export default router1;