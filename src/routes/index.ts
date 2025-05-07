import express, { Router } from 'express';
import { getListStudentByClass} from '../controllers/studentController';

const router: Router = express.Router();

// @ts-ignore
router.get('/list-student', getListStudentByClass);

export default router;
