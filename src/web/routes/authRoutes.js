import express from 'express';
import { getHomePage, getLoginPage, processLogin, processLogout, dashboardRedirect } from '../controllers/authController.js';

const router = express.Router();

router.get('/', getHomePage);
router.get('/login', getLoginPage);
router.post('/login', processLogin);
router.get('/logout', processLogout);
router.get('/dashboard', dashboardRedirect);

export default router;