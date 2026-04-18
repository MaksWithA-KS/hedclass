import express from 'express';
// Destructuring controllers
import { getHomePage, getLoginPage, processLogin, processLogout, dashboardRedirect } from '../controllers/authController.js';

const router = express.Router();


// Landing page
router.get('/', getHomePage);

// --- Authentication Gateway ---
// Log in form
router.get('/login', getLoginPage);
// Processes credentials submitted
router.post('/login', processLogin);
// Destroys the session and redirects to landing page
router.get('/logout', processLogout);

// --- State and Role routing ---
// Directs user to respective dashboard according to their role based on their session details
router.get('/dashboard', dashboardRedirect);

export default router;