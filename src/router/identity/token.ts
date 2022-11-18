import { refresh } from "../../controller/Identity/TokenController";
import { Router } from "express";

const router = Router();

router.post('/', refresh);

// router.delete('/', revoke);

export default router;