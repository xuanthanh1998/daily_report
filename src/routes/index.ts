import express, {Router} from 'express';
import {getListStudentByClass} from '../controllers/studentController';
import {
    createSuggestByTeacher,
    deleteSuggestByTeacher,
    getSuggestByTeacher,
    updateSuggestByTeacher
} from '../controllers/suggestController';
import {
    getDailyReportsByParent,
    getDailyReportsByPrincipal,
    getDailyReportsByTeacher,
    sendDailyReport
} from "../controllers/dailyReportController";

const router: Router = express.Router();

router.get('/list-student', getListStudentByClass);

//api suggest
router.get('/list-suggest-by-teacher', getSuggestByTeacher);
router.post('/update-suggest-by-teacher', updateSuggestByTeacher);
router.post('/create-suggest-by-teacher', createSuggestByTeacher);
router.delete('/delete-suggest-by-teacher', deleteSuggestByTeacher);

//api send daily report
router.post('/send-daily-report', sendDailyReport);
router.get('/get-daily-report-by-parent', getDailyReportsByParent);
router.get('/get-daily-report-by-teacher', getDailyReportsByTeacher);
router.get('/get-daily-report-by-principal', getDailyReportsByPrincipal);


export default router;
