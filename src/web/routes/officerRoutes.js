import express from 'express';
import { isOfficer } from '../middleware/authMiddleware.js';
import { 
    getOfficerDashboard, getStudentRoster, getStudentProfile, 
    calculateGrades, addStudent, overrideClassification, editGrade 
} from '../controllers/officerController.js';

const router = express.Router();

router.get('/officer-dashboard', isOfficer, getOfficerDashboard);
router.get('/officer/programme/:id/students', isOfficer, getStudentRoster);
router.get('/officer/student/:id', isOfficer, getStudentProfile);
router.post('/officer/programme/:id/calculate', isOfficer, calculateGrades);
router.post('/officer/programme/:id/student/add', isOfficer, addStudent);
router.post('/officer/student/:id/override', isOfficer, overrideClassification);
router.post('/officer/student/:studentId/grade/:gradeId/edit', isOfficer, editGrade);

export default router;