import express, {Router} from 'express';
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
import {
    statisticDailyReportByClass,
    statisticDailyReportByTeacher,
    getSystemStatistic, reportViewByClass,
} from "../controllers/statisticController";
import {getListClassByTeacher, getListSchoolByPrincipal} from "../controllers/teacherController";

const router: Router = express.Router();

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

router.get('/get-list-school-by-principal', getListSchoolByPrincipal)
router.get('/get-list-class-by-teacher', getListClassByTeacher)
//api thống kê
router.get('/statistic-daily-report-teacher', statisticDailyReportByTeacher);
router.get('/statistic-daily-report-class', statisticDailyReportByClass);
router.get('/system-statistic', getSystemStatistic);
router.get('/report-view-by-class', reportViewByClass);
export default router;
