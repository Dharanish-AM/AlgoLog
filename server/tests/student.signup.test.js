/**
 * Student Signup Tests - Comprehensive test suite
 */
const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Student = require('../models/studentSchema');
const Class = require('../models/classSchema');
const Department = require('../models/departmentSchema');
const helpers = require('../utils/helpers');

// Ensure we wait for DB before any operations
async function connectTestDb() {
  const url = process.env.MONGO_TEST_URL || 'mongodb://127.0.0.1:27017/algolog_test';
  if (mongoose.connection.readyState !== 0) return; // already connecting/connected
  await mongoose.connect(url, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    maxPoolSize: 5,
  });
  await mongoose.connection.asPromise();
}

// Helper function to create valid test student data
function createStudent(overrides = {}) {
  return {
    name: 'Test User',
    email: 'test@example.com',
    rollNo: 'TST001',
    year: '2027-2031',
    leetcode: 'guruvishal',
    hackerrank: 'guruvishal',
    codechef: 'guruvishal30',
    codeforces: 'guruvishal_30',
    skillrack: 'https://www.skillrack.com/profile/484190/42ef372b4d2bf93df484367b9cae243b12482b37',
    github: 'https://github.com/guru-vishal',
    password: 'sece@123',
    ...overrides
  };
}

describe('Student Signup Tests', () => {
  let app;
  let testDept;
  let testCls;

  beforeAll(async () => {
    app = require('../index');

    await connectTestDb();

    await Student.deleteMany({});
    await Class.deleteMany({});
    await Department.deleteMany({});

    testDept = await Department.create({
      name: 'Computer Science',
      classes: [],
      password: await bcrypt.hash('test@123', 10),
    });

    testCls = await Class.create({
      username: 'CSE2A0001',
      email: 'cse2a@test.com',
      password: await bcrypt.hash('sece@123', 10),
      department: testDept._id,
      section: 'A',
      year: '2027-2031',
      students: [],
    });

    testDept.classes.push(testCls._id);
    await testDept.save();
  });

  afterAll(async () => {
    await Student.deleteMany({});
    await Class.deleteMany({});
    await Department.deleteMany({});
    await mongoose.disconnect();
  });

  describe('✅ Valid Signup', () => {
    test('Should register with all fields', async () => {
      const data = createStudent({
        rollNo: 'CSE001',
        email: 'cse001@test.com',
        department: testDept._id.toString(),
        section: 'A',
      });
      
      const response = await request(app)
        .post('/api/students')
        .send(data);
      
      if (response.status !== 201) {
        console.log('Error:', response.body);
      }
      
      expect(response.status).toBe(201);
      expect(response.body._id).toBeDefined();
    });

    test('Should hash password', async () => {
      const response = await request(app)
        .post('/api/students')
        .send(createStudent({
          rollNo: 'CSE002',
          email: 'cse002@test.com',
          department: testDept._id.toString(),
          section: 'A',
        }))
        .expect(201);

      const student = await Student.findOne({ rollNo: 'CSE002' });
      expect(student.password).not.toBe('sece@123');
      expect(await bcrypt.compare('sece@123', student.password)).toBe(true);
    });

    test('Should link to class', async () => {
      const response = await request(app)
        .post('/api/students')
        .send(createStudent({
          rollNo: 'CSE003',
          email: 'cse003@test.com',
          department: testDept._id.toString(),
          section: 'A',
        }))
        .expect(201);

      const student = await Student.findOne({ rollNo: 'CSE003' });
      expect(student.classId.toString()).toBe(testCls._id.toString());
    });

    test('Should persist data', async () => {
      const response = await request(app)
        .post('/api/students')
        .send(createStudent({
          rollNo: 'CSE004',
          email: 'cse004@test.com',
          name: 'John Doe',
          department: testDept._id.toString(),
          section: 'A',
        }))
        .expect(201);

      const student = await Student.findById(response.body._id);
      expect(student.name).toBe('John Doe');
      expect(student.email).toBe('cse004@test.com');
    });

    test('Should accept valid Skillrack URL', async () => {
      const response = await request(app)
        .post('/api/students')
        .send(createStudent({
          rollNo: 'CSE005',
          email: 'cse005@test.com',
          skillrack: 'https://www.skillrack.com/profile/484190/42ef372b4d2bf93df484367b9cae243b12482b37',
          department: testDept._id.toString(),
          section: 'A',
        }))
        .expect(201);

      const student = await Student.findOne({ rollNo: 'CSE005' });
      expect(student.skillrack).toBe('https://www.skillrack.com/profile/484190/42ef372b4d2bf93df484367b9cae243b12482b37');
    });
  });

  describe('❌ Missing Fields', () => {
    test('Should reject without name', async () => {
      const response = await request(app)
        .post('/api/students')
        .send(createStudent({
          rollNo: 'CSE006',
          email: 'cse006@test.com',
          name: undefined,
          department: testDept._id.toString(),
          section: 'A',
        }))
        .expect(400);

      expect(response.body.error).toContain('Name, email, and roll number are required');
    });

    test('Should reject without email', async () => {
      const response = await request(app)
        .post('/api/students')
        .send(createStudent({
          rollNo: 'CSE007',
          email: undefined,
          department: testDept._id.toString(),
          section: 'A',
        }))
        .expect(400);

      expect(response.body.error).toContain('Name, email, and roll number are required');
    });

    test('Should reject without rollNo', async () => {
      const response = await request(app)
        .post('/api/students')
        .send(createStudent({
          rollNo: undefined,
          email: 'cse008@test.com',
          department: testDept._id.toString(),
          section: 'A',
        }))
        .expect(400);

      expect(response.body.error).toContain('Name, email, and roll number are required');
    });
  });

  describe('❌ Invalid Academic Year', () => {
    test('Should reject invalid year', async () => {
      const response = await request(app)
        .post('/api/students')
        .send(createStudent({
          rollNo: 'CSE009',
          email: 'cse009@test.com',
          year: '2099-2100',
          department: testDept._id.toString(),
          section: 'A',
        }))
        .expect(400);

      expect(response.body.error).toContain('Invalid academic year');
    });

    test('Should reject without year', async () => {
      const response = await request(app)
        .post('/api/students')
        .send(createStudent({
          rollNo: 'CSE010',
          email: 'cse010@test.com',
          year: undefined,
          department: testDept._id.toString(),
          section: 'A',
        }))
        .expect(400);

      expect(response.body.error).toContain('Invalid academic year');
    });
  });

  describe('❌ Invalid Skillrack URL', () => {
    test('Should reject invalid URL format', async () => {
      const response = await request(app)
        .post('/api/students')
        .send(createStudent({
          rollNo: 'CSE011',
          email: 'cse011@test.com',
          skillrack: 'not-a-url',
          department: testDept._id.toString(),
          section: 'A',
        }))
        .expect(400);

      expect(response.body.error).toContain('Invalid Skillrack URL');
    });

    test('Should reject malformed Skillrack profile URL', async () => {
      const response = await request(app)
        .post('/api/students')
        .send(createStudent({
          rollNo: 'CSE012A',
          email: 'cse012a@test.com',
          skillrack: 'https://www.skillrack.com/profile',
          department: testDept._id.toString(),
          section: 'A',
        }))
        .expect(400);

      expect(response.body.error).toContain('Invalid Skillrack URL');
    });

    test('Should handle URL variations', async () => {
      const response = await request(app)
        .post('/api/students')
        .send(createStudent({
          rollNo: 'CSE012',
          email: 'cse012@test.com',
          skillrack: 'https://skillrack.com/users/john',
          department: testDept._id.toString(),
          section: 'A',
        }));

      expect([200, 201, 400]).toContain(response.status);
    });
  });

  describe('❌ Invalid Department/Class', () => {
    test('Should reject invalid department', async () => {
      const response = await request(app)
        .post('/api/students')
        .send(createStudent({
          rollNo: 'CSE013',
          email: 'cse013@test.com',
          department: new mongoose.Types.ObjectId().toString(),
          section: 'A',
        }));

      // Could return 404 or 400 depending on validation order
      expect([404, 400]).toContain(response.status);
      expect(response.body.error).toMatch(/Department not found|Invalid/);
    });

    test('Should reject non-existent class', async () => {
      const response = await request(app)
        .post('/api/students')
        .send(createStudent({
          rollNo: 'CSE014',
          email: 'cse014@test.com',
          department: testDept._id.toString(),
          section: 'Z',
        }));

      expect([404, 400]).toContain(response.status);
      expect(response.body.error).toMatch(/Class not found|not found/);
    });
  });

  describe('❌ Duplicate Data', () => {
    test('Should reject duplicate roll number', async () => {
      const rollNo = `DUP${Date.now()}`;
      const createResp = await request(app)
        .post('/api/students')
        .send(createStudent({
          rollNo,
          email: `dup1${Date.now()}@test.com`,
          department: testDept._id.toString(),
          section: 'A',
        }));

      expect(createResp.status).toBe(201);

      const response = await request(app)
        .post('/api/students')
        .send(createStudent({
          rollNo,  // Same roll number
          email: `dup2${Date.now()}@test.com`,
          department: testDept._id.toString(),
          section: 'A',
        }));

      expect([409, 400]).toContain(response.status);
      if (response.body.error) {
        expect(response.body.error).toContain('Duplicate');
      }
    });
  });

  describe('🔍 Scraping & Validation', () => {
    test('Should call stats scraper with signup data', async () => {
      helpers.getStatsForStudent.mockClear();

      const payload = createStudent({
        rollNo: `SCRAPE${Date.now()}`,
        email: `scrape${Date.now()}@test.com`,
        department: testDept._id.toString(),
        section: 'A',
      });

      const response = await request(app)
        .post('/api/students')
        .send(payload);

      expect([200, 201]).toContain(response.status);
      expect(helpers.getStatsForStudent).toHaveBeenCalledTimes(1);

      const callArgs = helpers.getStatsForStudent.mock.calls[0][0];
      expect(callArgs.leetcode).toBe(payload.leetcode);
      expect(callArgs.skillrack).toBe(payload.skillrack);
      expect(callArgs.github).toBe(payload.github);
    });

    test('Should still create student when scraper fails', async () => {
      helpers.getStatsForStudent.mockImplementationOnce(() => {
        throw new Error('scrape failure');
      });

      const payload = createStudent({
        rollNo: `SCRAPEFAIL${Date.now()}`,
        email: `scrapefail${Date.now()}@test.com`,
        department: testDept._id.toString(),
        section: 'A',
      });

      const response = await request(app)
        .post('/api/students')
        .send(payload);

      expect([200, 201]).toContain(response.status);

      const student = await Student.findOne({ rollNo: payload.rollNo });
      expect(student).toBeDefined();
      expect(student.stats).toBeDefined();
    });
  });

  describe('✅ Data Integrity', () => {
    test('Should initialize stats object', async () => {
      const response = await request(app)
        .post('/api/students')
        .send(createStudent({
          rollNo: `STATS${Date.now()}`,
          email: `stats${Date.now()}@test.com`,
          department: testDept._id.toString(),
          section: 'A',
        }));

      expect(response.status).toBe(201);
      if (response.body._id) {
        const student = await Student.findById(response.body._id);
        expect(student.stats).toBeDefined();
      }
    });

    test('Should return hashed password in response payload', async () => {
      const plain = 'sece@123';
      const response = await request(app)
        .post('/api/students')
        .send(createStudent({
          rollNo: `PWD${Date.now()}`,
          email: `pwd${Date.now()}@test.com`,
          department: testDept._id.toString(),
          section: 'A',
          password: plain,
        }));

      expect(response.status).toBe(201);
      expect(response.body.password).toBeDefined();
      expect(response.body.password).not.toBe(plain);
      expect(response.body.password.length).toBeGreaterThan(20);
    });
  });

  describe('⚡ Performance', () => {
    test('Should complete within 5 seconds', async () => {
      const start = Date.now();
      
      const response = await request(app)
        .post('/api/students')
        .send(createStudent({
          rollNo: `CSE${Date.now()}`,  // Unique roll number
          email: `cse${Date.now()}@test.com`,
          department: testDept._id.toString(),
          section: 'A',
        }));

      const duration = Date.now() - start;
      expect([200, 201]).toContain(response.status);
      expect(duration).toBeLessThan(5000);
    });
  });
});
