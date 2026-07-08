const { body } = require('express-validator');

exports.loginValidation = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

exports.registrationValidation = [
  body('student_name').trim().notEmpty().withMessage('Student name is required').isLength({ min: 2, max: 255 }),
  body('register_number').trim().notEmpty().withMessage('Register number is required'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('year').trim().notEmpty().withMessage('Year is required'),
  body('college_name').trim().notEmpty().withMessage('College name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('phone').trim().matches(/^[6-9]\d{9}$/).withMessage('Valid 10-digit phone number is required'),
  body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Gender is required'),
  body('event_id').isInt({ min: 1 }).withMessage('Valid event is required'),
];

exports.eventValidation = [
  body('name').trim().notEmpty().withMessage('Event name is required'),
  body('department_id').isInt({ min: 1 }).withMessage('Department is required'),
  body('venue').trim().notEmpty().withMessage('Venue is required'),
  body('event_date').isDate().withMessage('Valid date is required'),
  body('event_time').notEmpty().withMessage('Time is required'),
  body('registration_fee').isFloat({ min: 0 }).withMessage('Valid fee is required'),
  body('max_participants').isInt({ min: 1 }).withMessage('Max participants is required'),
];

exports.departmentValidation = [
  body('name').trim().notEmpty().withMessage('Department name is required'),
  body('code').trim().notEmpty().withMessage('Department code is required'),
  body('venue').trim().notEmpty().withMessage('Venue is required'),
];

exports.contactValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
];
