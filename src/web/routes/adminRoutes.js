import express from 'express';
// Ensuring only admins access these routes
import { isAdmin } from '../middleware/authMiddleware.js';
import { 
    getAdminDashboard, getProgrammes, getOfficers, assignOfficer, 
    deleteOfficer, addOfficer, deleteProgramme, editProgramme, addProgramme 
} from '../controllers/adminController.js';

const router = express.Router();

// Middleware applied individually to prevent intercepting officer traffic

//The admin dashboard
router.get('/admin-dashboard', isAdmin, getAdminDashboard);

// Programme management
router.get('/admin/programmes', isAdmin, getProgrammes);
router.post('/admin/programmes/delete/:id', isAdmin, deleteProgramme);
router.post('/admin/programmes/edit/:id', isAdmin, editProgramme);
router.post('/admin/programmes/add', isAdmin, addProgramme);

// Officer Management
router.get('/admin/officers', isAdmin, getOfficers);
router.post('/admin/assign-officer', isAdmin, assignOfficer);
router.post('/admin/officers/delete/:id', isAdmin, deleteOfficer);
router.post('/admin/officers/add', isAdmin, addOfficer);


export default router;