import { Router } from "express";
import { addEmployee, deleteEmployee, editEmployee, getAllEmployees, getEmployee, getEmployeeById, loginEmployee } from "../controllers/controller.js";
import { authenticateToken } from "../jwt/authenticateToken.js";
import { upload } from "../middleware/imageUploadS3.js";

const router = Router();

router.get('/all-employee', getAllEmployees);
router.post('/get-employee', getEmployeeById);
router.post('/add-employee', addEmployee);
router.post('/edit-employee', upload.single('image'), editEmployee);
router.post('/delete-employee', deleteEmployee);
router.post('/login-employee', loginEmployee);
router.get('/single-employee', authenticateToken, getEmployee);

export default router;