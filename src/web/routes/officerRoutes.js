import express from 'express';
// Ensuring only officers access these routes
import { isOfficer } from '../middleware/authMiddleware.js';
import { 
    getOfficerDashboard, getStudentRoster, getStudentProfile, 
    calculateGrades, addStudent, addModuleGrade, overrideClassification, editGrade, exportRoster
} from '../controllers/officerController.js';

const router = express.Router();

// The officer dashboard
router.get('/officer-dashboard', isOfficer, getOfficerDashboard);

// Programme Level Operations
router.get('/officer/programme/:id/students', isOfficer, getStudentRoster);
router.get('/officer/programme/:id/export', isOfficer, exportRoster);
router.post('/officer/programme/:id/calculate', isOfficer, calculateGrades);
router.post('/officer/programme/:id/student/add', isOfficer, addStudent);

// Individual Student Level Operations
router.get('/officer/student/:id', isOfficer, getStudentProfile);
router.post('/officer/student/:id/module/add', isOfficer, addModuleGrade);
router.post('/officer/student/:id/override', isOfficer, overrideClassification);
router.post('/officer/student/:studentId/grade/:gradeId/edit', isOfficer, editGrade);

export default router;