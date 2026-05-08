const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const { protect, authorize } = require('../middleware/auth');
const Intern = require('../models/Intern');
const { Task, Submission } = require('../models/ProjectTask');
const { Attendance } = require('../models/Others');

router.use(protect, authorize('admin'));

router.get('/interns/excel', async (req, res) => {
  try {
    const interns = await Intern.find().populate('user', 'name email phone');
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Interns');
    sheet.columns = [
      { header: 'Intern ID', key: 'internId', width: 15 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Start Date', key: 'start', width: 15 },
      { header: 'End Date', key: 'end', width: 15 },
      { header: 'Performance', key: 'score', width: 15 }
    ];
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1D4ED8' } };
    interns.forEach(i => sheet.addRow({
      internId: i.internId, name: i.user?.name, email: i.user?.email,
      department: i.department, status: i.status,
      start: i.internshipStart?.toDateString(), end: i.internshipEnd?.toDateString(),
      score: i.performanceScore
    }));

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=interns.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/attendance/excel', async (req, res) => {
  try {
    const { month, year } = req.query;
    const start = new Date(year || new Date().getFullYear(), (month || new Date().getMonth() + 1) - 1, 1);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    const records = await Attendance.find({ date: { $gte: start, $lte: end } })
      .populate({ path: 'intern', populate: { path: 'user', select: 'name email' } });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Attendance');
    sheet.columns = [
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Login', key: 'login', width: 15 },
      { header: 'Logout', key: 'logout', width: 15 },
      { header: 'Hours', key: 'hours', width: 10 }
    ];
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1D4ED8' } };
    records.forEach(r => sheet.addRow({
      name: r.intern?.user?.name, date: r.date?.toDateString(),
      status: r.status, login: r.loginTime ? new Date(r.loginTime).toLocaleTimeString() : '-',
      logout: r.logoutTime ? new Date(r.logoutTime).toLocaleTimeString() : '-', hours: r.workHours
    }));
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
