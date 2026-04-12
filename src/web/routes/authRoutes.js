import express from 'express';
import { getHomePage, getLoginPage, processLogin, processLogout } from '../controllers/authController.js';

const router = express.Router();

router.get('/', getHomePage);
router.get('/login', getLoginPage);
router.post('/login', processLogin);
router.get('/logout', processLogout);

export default router;