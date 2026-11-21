const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env
dotenv.config({ path: __dirname + '/../.env', override: true });

// Models
const User = require('../src/models/User');
const Student = require('../src/models/Student');
const Teacher = require('../src/models/Teacher');
const Class = require('../src/models/Class');
const Section = require('../src/models/Section');
const Subject = require('../src/models/Subject');
const Admission = require('../src/models/Admission');
const Attendance = require('../src/models/Attendance');
const Homework = require('../src/models/Homework');
const HomeworkSubmission = require('../src/models/HomeworkSubmission');
const FeeStructure = require('../src/models/FeeStructure');
const StudentFee = require('../src/models/StudentFee');
const Payment = require('../src/models/Payment');
const Fine = require('../src/models/Fine');
const Timetable = require('../src/models/Timetable');
const Announcement = require('../src/models/Announcement');

const seedData = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_management');
    console.log(`Connected to MongoDB: ${conn.connection.host}`);

    console.log('Clearing old data...');
    try { await Attendance.collection.dropIndexes(); } catch (e) {}
    await User.deleteMany();
    await Student.deleteMany();
    await Teacher.deleteMany();
    await Class.deleteMany();
    await Section.deleteMany();
    await Subject.deleteMany();
    await Admission.deleteMany();
    await Attendance.deleteMany();
    await Homework.deleteMany();
    await HomeworkSubmission.deleteMany();
    await FeeStructure.deleteMany();
    await StudentFee.deleteMany();
    await Payment.deleteMany();
    await Fine.deleteMany();
    await Timetable.deleteMany();
    await Announcement.deleteMany();

    console.log('1. Creating Admin...');
    const adminUser = await User.create({
      name: 'Dr. Ramesh Narayan (Principal)',
      email: 'admin@school.com',
      password: 'Admin@123',
      role: 'admin',
      phone: '+91 98200 11223',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    });

    console.log('2. Creating Classes & Sections...');
    const classNames = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
    const createdClasses = [];
    const createdSections = [];

    for (let i = 0; i < classNames.length; i++) {
      const cls = await Class.create({
        name: classNames[i],
        numericGrade: 6 + i,
        description: `Academic standard for Grade ${6 + i}`,
      });
      createdClasses.push(cls);

      // Create Section A and B
      const secA = await Section.create({
        name: 'A',
        classId: cls._id,
        roomNumber: `Room ${101 + i * 2}`,
        capacity: 40,
      });
      const secB = await Section.create({
        name: 'B',
        classId: cls._id,
        roomNumber: `Room ${102 + i * 2}`,
        capacity: 40,
      });
      createdSections.push(secA, secB);
    }

    console.log('3. Creating Teachers...');
    const teacherData = [
      {
        fullName: 'Anita Desai',
        email: 'teacher@school.com',
        phone: '+91 98765 43210',
        gender: 'Female',
        qualification: 'M.Sc. Mathematics, B.Ed',
        experience: '8 Years',
        salary: 55000,
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
      },
      {
        fullName: 'Rajesh Kumar',
        email: 'rajesh.kumar@school.com',
        phone: '+91 98111 22334',
        gender: 'Male',
        qualification: 'M.Sc. Physics, M.Ed',
        experience: '10 Years',
        salary: 62000,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
      },
      {
        fullName: 'Priya Sharma',
        email: 'priya.sharma@school.com',
        phone: '+91 98222 33445',
        gender: 'Female',
        qualification: 'M.A. English Literature, B.Ed',
        experience: '6 Years',
        salary: 48000,
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250',
      },
      {
        fullName: 'Suresh Patel',
        email: 'suresh.patel@school.com',
        phone: '+91 98333 44556',
        gender: 'Male',
        qualification: 'MCA, B.Ed',
        experience: '7 Years',
        salary: 52000,
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
      },
      {
        fullName: 'Meenakshi Sundaram',
        email: 'meenakshi.s@school.com',
        phone: '+91 98444 55667',
        gender: 'Female',
        qualification: 'M.A. History, B.Ed',
        experience: '9 Years',
        salary: 54000,
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
      },
    ];

    const createdTeachers = [];
    for (let i = 0; i < teacherData.length; i++) {
      const td = teacherData[i];
      const u = await User.create({
        name: td.fullName,
        email: td.email,
        password: 'Teacher@123',
        role: 'teacher',
        phone: td.phone,
        avatar: td.avatar,
      });

      const tch = await Teacher.create({
        user: u._id,
        teacherId: `TCH-${String(i + 1).padStart(3, '0')}`,
        fullName: td.fullName,
        profileImage: td.avatar,
        email: td.email,
        phone: td.phone,
        gender: td.gender,
        dob: new Date('1988-06-15'),
        address: `${20 + i}, Teachers Colony, South Extension, New Delhi - 110049`,
        qualification: td.qualification,
        experience: td.experience,
        joiningDate: new Date('2020-07-01'),
        salary: td.salary,
        employmentStatus: 'active',
      });
      createdTeachers.push(tch);
    }

    // Set class teachers
    createdClasses[0].classTeacher = createdTeachers[0]._id;
    await createdClasses[0].save();
    createdClasses[4].classTeacher = createdTeachers[1]._id; // Class 10
    await createdClasses[4].save();

    console.log('4. Creating 8 Subjects across Classes...');
    const subjectList = [
      { name: 'Mathematics', code: 'MATH' },
      { name: 'Science', code: 'SCI' },
      { name: 'English', code: 'ENG' },
      { name: 'Social Studies', code: 'SST' },
      { name: 'Hindi', code: 'HIN' },
      { name: 'Computer Science', code: 'CS' },
      { name: 'Sanskrit', code: 'SKT' },
      { name: 'Physical Education', code: 'PHE' },
    ];

    const createdSubjects = [];
    for (const cls of createdClasses) {
      for (let sIdx = 0; sIdx < subjectList.length; sIdx++) {
        const sub = subjectList[sIdx];
        const teacher = createdTeachers[sIdx % createdTeachers.length];
        const s = await Subject.create({
          name: sub.name,
          code: `${sub.code}-${cls.numericGrade}`,
          classId: cls._id,
          teacherId: teacher._id,
          weeklyPeriods: 5,
        });
        createdSubjects.push(s);
      }
    }

    // Update teacher assigned classes
    for (let i = 0; i < createdTeachers.length; i++) {
      const t = createdTeachers[i];
      const assigned = [];
      createdClasses.forEach((cls) => {
        const sec = createdSections.find((s) => s.classId.toString() === cls._id.toString());
        const sub = createdSubjects.find(
          (s) => s.classId.toString() === cls._id.toString() && s.teacherId?.toString() === t._id.toString()
        );
        if (sec && sub) {
          assigned.push({
            classId: cls._id,
            sectionId: sec._id,
            subjectId: sub._id,
          });
        }
      });
      t.assignedClasses = assigned;
      await t.save();
    }

    console.log('5. Creating 50 Students...');
    const firstNames = [
      'Aarav', 'Diya', 'Vivaan', 'Ananya', 'Kabir', 'Ishaan', 'Sai', 'Riya', 'Advait', 'Aditi',
      'Vihaan', 'Myra', 'Reyansh', 'Saanvi', 'Krishna', 'Isha', 'Arjun', 'Aadhya', 'Aryan', 'Kiara',
      'Dhruv', 'Avani', 'Rohan', 'Pooja', 'Tanvi', 'Manish', 'Neha', 'Karan', 'Sneha', 'Nikhil',
      'Bhavya', 'Varun', 'Divya', 'Harsh', 'Kavya', 'Siddharth', 'Meera', 'Gaurav', 'Shreya', 'Mohit',
      'Nandini', 'Pranav', 'Riddhi', 'Dev', 'Tara', 'Ayush', 'Simran', 'Akash', 'Komal', 'Yash'
    ];
    const lastNames = [
      'Sharma', 'Verma', 'Patel', 'Iyer', 'Kumar', 'Singh', 'Gupta', 'Reddy', 'Deshmukh', 'Chopra',
      'Bose', 'Nair', 'Mehta', 'Joshi', 'Mukherjee', 'Pillai', 'Rao', 'Bhat', 'Pandey', 'Saxena'
    ];

    const bloodGroups = ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-'];
    const createdStudents = [];

    // The primary demo student (Aarav Sharma in Class 10-A)
    const demoStudentClass = createdClasses[4]; // Class 10
    const demoStudentSection = createdSections.find(
      (s) => s.classId.toString() === demoStudentClass._id.toString() && s.name === 'A'
    );

    const demoStudentUser = await User.create({
      name: 'Aarav Sharma',
      email: 'student@school.com',
      password: 'Student@123',
      role: 'student',
      phone: '+91 98765 12345',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250',
    });

    const demoStudent = await Student.create({
      user: demoStudentUser._id,
      admissionNo: 'ADM-2026-0001',
      firstName: 'Aarav',
      lastName: 'Sharma',
      dob: new Date('2010-04-12'),
      gender: 'Male',
      email: 'student@school.com',
      phone: '+91 98765 12345',
      address: 'B-402, Lotus Greens, Sector 78, Noida, Uttar Pradesh',
      parentName: 'Vikram Sharma',
      parentPhone: '+91 98100 54321',
      parentEmail: 'vikram.sharma@example.com',
      classId: demoStudentClass._id,
      sectionId: demoStudentSection._id,
      rollNumber: '01',
      admissionDate: new Date('2021-04-01'),
      previousSchool: 'Delhi Public School',
      bloodGroup: 'O+',
      profileImage: demoStudentUser.avatar,
      status: 'active',
    });
    createdStudents.push(demoStudent);

    // Create 49 remaining students distributed across the 5 classes
    for (let i = 1; i < 50; i++) {
      const fName = firstNames[i % firstNames.length];
      const lName = lastNames[i % lastNames.length];
      const targetClass = createdClasses[i % createdClasses.length];
      const sectionsForClass = createdSections.filter(
        (s) => s.classId.toString() === targetClass._id.toString()
      );
      const targetSection = sectionsForClass[i % sectionsForClass.length];
      const admNo = `ADM-2026-${String(i + 1).padStart(4, '0')}`;
      const email = `student${i + 1}@school.com`;
      const roll = String(Math.floor(i / 5) + 1).padStart(2, '0');

      const u = await User.create({
        name: `${fName} ${lName}`,
        email,
        password: 'Student@123',
        role: 'student',
        phone: `+91 98${String(10000000 + i).slice(0, 8)}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fName}${i}`,
      });

      const stu = await Student.create({
        user: u._id,
        admissionNo: admNo,
        firstName: fName,
        lastName: lName,
        dob: new Date(2011 + (i % 4), (i % 12), (i % 28) + 1),
        gender: i % 2 === 0 ? 'Male' : 'Female',
        email,
        phone: u.phone,
        address: `${10 + i}, Green Park Extension, New Delhi`,
        parentName: `Rajesh ${lName}`,
        parentPhone: `+91 99${String(20000000 + i).slice(0, 8)}`,
        parentEmail: `parent${i + 1}@example.com`,
        classId: targetClass._id,
        sectionId: targetSection._id,
        rollNumber: roll,
        admissionDate: new Date(2022, 3, 1),
        previousSchool: 'St. Mary Convent High School',
        bloodGroup: bloodGroups[i % bloodGroups.length],
        profileImage: u.avatar,
        status: 'active',
      });
      createdStudents.push(stu);
    }

    console.log('6. Creating Fee Structures...');
    const classFeeValues = [
      { tuition: 3200, admission: 5000, exam: 1000, transport: 1500, other: 500 },
      { tuition: 3400, admission: 5000, exam: 1200, transport: 1500, other: 500 },
      { tuition: 3800, admission: 6000, exam: 1400, transport: 1600, other: 600 },
      { tuition: 4200, admission: 7000, exam: 1600, transport: 1800, other: 800 },
      { tuition: 4800, admission: 8000, exam: 2000, transport: 1800, other: 1000 },
    ];

    for (let i = 0; i < createdClasses.length; i++) {
      const cls = createdClasses[i];
      const fv = classFeeValues[i];
      await FeeStructure.create({
        classId: cls._id,
        academicYear: '2026-2027',
        tuitionFee: fv.tuition,
        admissionFee: fv.admission,
        examFee: fv.exam,
        transportFee: fv.transport,
        otherCharges: fv.other,
        lateFinePerDay: 50,
        dueDateDay: 10,
      });
    }

    console.log('7. Creating Student Fees, Payments, and Fines...');
    let receiptCounter = 1;
    for (let i = 0; i < createdStudents.length; i++) {
      const stu = createdStudents[i];
      const isPaid = i % 4 !== 0; // 75% paid, 25% unpaid/partial
      const totalAmt = 4800;
      const paidAmt = isPaid ? totalAmt : (i % 2 === 0 ? 2000 : 0);
      const status = isPaid ? 'Paid' : (paidAmt > 0 ? 'Partial' : 'Unpaid');

      const sf = await StudentFee.create({
        studentId: stu._id,
        classId: stu.classId,
        academicYear: '2026-2027',
        month: 'April 2026',
        tuitionFee: 3500,
        examFee: 800,
        otherCharges: 500,
        totalAmount: totalAmt,
        paidAmount: paidAmt,
        status,
        dueDate: new Date('2026-04-10'),
      });

      if (paidAmt > 0) {
        await Payment.create({
          receiptNo: `REC-2026-${String(receiptCounter++).padStart(5, '0')}`,
          studentFeeId: sf._id,
          studentId: stu._id,
          amountPaid: paidAmt,
          paymentMethod: i % 3 === 0 ? 'UPI' : (i % 3 === 1 ? 'Cash' : 'Bank Transfer'),
          paymentDate: new Date('2026-04-05'),
          receivedBy: adminUser._id,
          remarks: 'Term 1 Tuition and Examination Fee',
        });
      }

      // Add a couple sample fines
      if (i === 0 || i === 3 || i === 12) {
        await Fine.create({
          studentId: stu._id,
          title: i === 0 ? 'Library Book Overdue (10 days)' : 'Science Lab Beaker Damage',
          amount: i === 0 ? 150 : 350,
          reason: i === 0 ? 'Return overdue for Encyclopedia of Science' : 'Accidental breakage in Chemistry Lab',
          status: i === 0 ? 'Paid' : 'Pending',
          imposedBy: adminUser._id,
          date: new Date('2026-04-08'),
        });
      }
    }

    console.log('8. Generating 30 Days of Attendance Records...');
    const attendanceStatuses = ['Present', 'Present', 'Present', 'Present', 'Present', 'Present', 'Late', 'Absent'];
    const today = new Date();
    const batchAttendance = [];

    // Loop through last 30 days
    for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
      const d = new Date(today);
      d.setDate(today.getDate() - dayOffset);

      // Skip Sunday (day 0)
      if (d.getDay() === 0) continue;

      const dateStr = d.toISOString().split('T')[0];

      // Student Attendance (create sample for first 15 students to keep seed fast)
      for (let sIdx = 0; sIdx < 15; sIdx++) {
        const stu = createdStudents[sIdx];
        const status = (sIdx === 0 && dayOffset <= 2)
          ? 'Present'
          : attendanceStatuses[(sIdx + dayOffset) % attendanceStatuses.length];

        batchAttendance.push({
          type: 'student',
          studentId: stu._id,
          classId: stu.classId,
          sectionId: stu.sectionId,
          date: dateStr,
          status,
          markedBy: createdTeachers[0].user,
        });
      }

      // Teacher Attendance
      for (const tch of createdTeachers) {
        batchAttendance.push({
          type: 'teacher',
          teacherId: tch._id,
          date: dateStr,
          status: dayOffset % 14 === 0 ? 'Late' : 'Present',
          markedBy: adminUser._id,
        });
      }
    }
    await Attendance.insertMany(batchAttendance);

    console.log('9. Creating 15 Homework Assignments and Submissions...');
    const homeworkSamples = [
      { title: 'Algebraic Polynomials Ex 3.2', desc: 'Solve questions 1 through 15 from NCERT Mathematics textbook.', subject: 'Mathematics' },
      { title: 'Newton Laws of Motion Lab Report', desc: 'Write a comprehensive report on 2nd law experiment with friction graph.', subject: 'Science' },
      { title: 'Shakespeare Julius Caesar Act 2 Essay', desc: 'Analyze Mark Antony funeral speech rhetoric in 500 words.', subject: 'English' },
      { title: 'Indian Independence Movement Timeline', desc: 'Create a chronological table from 1857 to 1947 with key leaders.', subject: 'Social Studies' },
      { title: 'Python Loop Patterns & Arrays', desc: 'Implement number pyramid and bubble sort algorithm in Python 3.', subject: 'Computer Science' },
      { title: 'Periodic Table Trends & Valency', desc: 'Explain electronegativity and atomic radius trends across period 3.', subject: 'Science' },
      { title: 'Hindi Nibandh: Paryavaran Sanrakshan', desc: 'Write a 400-word essay on environmental protection in Hindi.', subject: 'Hindi' },
      { title: 'Trigonometric Identities Proofs', desc: 'Prove 10 trigonometric identity problems provided in the worksheet.', subject: 'Mathematics' },
      { title: 'Cell Division: Mitosis vs Meiosis', desc: 'Draw diagrams of all mitosis stages and tabulate differences with meiosis.', subject: 'Science' },
      { title: 'Formal Letter to Municipal Commissioner', desc: 'Draft a complaint letter about waterlogging during monsoon.', subject: 'English' },
      { title: 'Geographical Features of Northern Plains', desc: 'Mark major river basins on an outline map of India.', subject: 'Social Studies' },
      { title: 'Database SQL Queries Exercise', desc: 'Write SELECT queries with GROUP BY and HAVING clauses.', subject: 'Computer Science' },
      { title: 'Statistics: Mean, Median, Mode grouped data', desc: 'Calculate measures of central tendency for the given frequency table.', subject: 'Mathematics' },
      { title: 'Electromagnetic Induction & Faradays Law', desc: 'Explain Lenz law and calculate induced EMF in solenoid coil.', subject: 'Science' },
      { title: 'Yoga Asanas & Physical Fitness Log', desc: 'Document 7 days practice of Surya Namaskar with duration and pulse rate.', subject: 'Physical Education' },
    ];

    for (let i = 0; i < homeworkSamples.length; i++) {
      const hwInfo = homeworkSamples[i];
      const targetClass = createdClasses[i % createdClasses.length];
      const sectionsForClass = createdSections.filter((s) => s.classId.toString() === targetClass._id.toString());
      const targetSection = sectionsForClass[0];
      const subject = createdSubjects.find(
        (s) => s.classId.toString() === targetClass._id.toString() && s.name === hwInfo.subject
      ) || createdSubjects[0];
      const teacher = createdTeachers[i % createdTeachers.length];

      const deadline = new Date();
      deadline.setDate(deadline.getDate() + (i % 7) + 2);

      const hw = await Homework.create({
        title: hwInfo.title,
        description: hwInfo.desc,
        classId: targetClass._id,
        sectionId: targetSection._id,
        subjectId: subject._id,
        teacherId: teacher._id,
        deadline,
        attachments: [
          { name: 'Reference_Worksheet.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }
        ],
        status: 'Active',
      });

      // If this homework belongs to Class 10-A, create submission for demo student
      if (targetClass._id.toString() === demoStudentClass._id.toString()) {
        await HomeworkSubmission.create({
          homeworkId: hw._id,
          studentId: demoStudent._id,
          submissionDate: new Date(),
          content: 'I have completed all the exercises and attached my neat solution sheet.',
          attachments: [
            { name: 'Aarav_Sharma_Solution.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }
          ],
          status: i % 2 === 0 ? 'Reviewed' : 'Submitted',
          marksObtained: i % 2 === 0 ? 94 : null,
          totalMarks: 100,
          feedback: i % 2 === 0 ? 'Outstanding work! Very clear step-by-step logic.' : '',
          reviewedAt: i % 2 === 0 ? new Date() : null,
        });
      }
    }

    console.log('10. Creating Timetables for Classes...');
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const periodTimes = [
      { start: '08:00 AM', end: '08:45 AM' },
      { start: '08:45 AM', end: '09:30 AM' },
      { start: '09:45 AM', end: '10:30 AM' },
      { start: '10:30 AM', end: '11:15 AM' },
      { start: '11:30 AM', end: '12:15 PM' },
      { start: '12:15 PM', end: '01:00 PM' },
    ];

    for (const cls of createdClasses) {
      const clsSections = createdSections.filter((s) => s.classId.toString() === cls._id.toString());
      const clsSubjects = createdSubjects.filter((s) => s.classId.toString() === cls._id.toString());

      for (const sec of clsSections) {
        for (const day of days) {
          const periods = [];
          for (let pIdx = 0; pIdx < 6; pIdx++) {
            const sub = clsSubjects[pIdx % clsSubjects.length];
            periods.push({
              periodNumber: pIdx + 1,
              startTime: periodTimes[pIdx].start,
              endTime: periodTimes[pIdx].end,
              subjectId: sub._id,
              teacherId: sub.teacherId || createdTeachers[0]._id,
              room: sec.roomNumber || 'Room 101',
            });
          }
          await Timetable.create({
            classId: cls._id,
            sectionId: sec._id,
            dayOfWeek: day,
            periods,
          });
        }
      }
    }

    console.log('11. Creating Admissions...');
    const admissionList = [
      { name: 'Kavya Singhania', parent: 'Alok Singhania', phone: '+91 98112 34567', email: 'alok.s@example.com', status: 'Pending', gradeIdx: 2 },
      { name: 'Ritvik Menon', parent: 'Siddharth Menon', phone: '+91 98223 45678', email: 'sid.menon@example.com', status: 'Approved', gradeIdx: 3 },
      { name: 'Ananya Mukherjee', parent: 'Debashis Mukherjee', phone: '+91 98334 56789', email: 'debashis@example.com', status: 'Pending', gradeIdx: 0 },
      { name: 'Tejas Deshpande', parent: 'Nitin Deshpande', phone: '+91 98445 67890', email: 'nitin.d@example.com', status: 'Approved', gradeIdx: 1 },
      { name: 'Sanya Kapoor', parent: 'Manish Kapoor', phone: '+91 98556 78901', email: 'manish.k@example.com', status: 'Rejected', gradeIdx: 4 },
      { name: 'Ayaan Khan', parent: 'Tariq Khan', phone: '+91 98667 89012', email: 'tariq.k@example.com', status: 'Pending', gradeIdx: 0 },
    ];

    for (let i = 0; i < admissionList.length; i++) {
      const adm = admissionList[i];
      const targetClass = createdClasses[adm.gradeIdx];
      const nameParts = adm.name.split(' ');
      await Admission.create({
        applicationNo: `APP-2026-${String(i + 1).padStart(4, '0')}`,
        studentFirstName: nameParts[0],
        studentLastName: nameParts[1],
        dob: new Date('2012-08-20'),
        gender: i % 2 === 0 ? 'Female' : 'Male',
        parentName: adm.parent,
        parentPhone: adm.phone,
        parentEmail: adm.email,
        address: `${100 + i}, Civil Lines, New Delhi`,
        appliedClass: targetClass._id,
        status: adm.status,
        remarks: adm.status === 'Approved' ? 'Documents verified, seat allocated' : 'Application under verification',
      });
    }

    console.log('12. Creating School Announcements...');
    const announcements = [
      {
        title: 'Annual Sports Meet 2026 Scheduled',
        content: 'The Annual Inter-House Athletic Meet will be held on December 15th-16th at the School Sports Complex. Registration for track and field events is open with the Physical Education department.',
        priority: 'High',
        category: 'Sports',
        targetRole: 'all',
      },
      {
        title: 'Mid-Term Examination Datesheet Released',
        content: 'Mid-term examinations for Classes 6 to 10 will commence from the second week of next month. Download syllabus guidelines and preparation schedules from the portal.',
        priority: 'High',
        category: 'Exam',
        targetRole: 'all',
      },
      {
        title: 'Parent-Teacher Meeting (PTM) Notice',
        content: 'Quarterly PTM for all standards will be held this Saturday between 09:00 AM to 01:30 PM. Parents are requested to adhere to their allotted time slots.',
        priority: 'Medium',
        category: 'Academic',
        targetRole: 'all',
      },
      {
        title: 'Diwali & Autumn Vacation Announcement',
        content: 'School will remain closed for Diwali and autumn break from October 28th through November 5th. Classes will resume normally thereafter.',
        priority: 'Medium',
        category: 'Holiday',
        targetRole: 'all',
      },
      {
        title: 'Staff Council & Curriculum Review Meeting',
        content: 'All faculty members must attend the semester curriculum review and lesson planning meeting in the Conference Hall on Friday at 03:00 PM.',
        priority: 'High',
        category: 'General',
        targetRole: 'teacher',
      },
    ];

    for (const ann of announcements) {
      await Announcement.create({
        ...ann,
        author: adminUser._id,
      });
    }

    console.log('✅ Seed completed successfully!');
    console.log('--------------------------------------------------');
    console.log('Demo Credentials:');
    console.log('Admin:   admin@school.com   / Admin@123');
    console.log('Teacher: teacher@school.com / Teacher@123');
    console.log('Student: student@school.com / Student@123');
    console.log('--------------------------------------------------');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
};

seedData();
