const {check} = require('express-validator')

exports.userSignupValidation = [
  check('name')
  .isLength({min:2})
  .withMessage('name is required and it must be at least 2 charactors'),
  check('email')
  .isEmail()
  .withMessage('Must be a valid email'),
  check('password')
  .isLength({min:8})
  .withMessage('password must be atleast 8 charactors')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
  .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character'),

];

exports.userSigninValidation = [
  check('email')
  .isEmail()
  .withMessage('Must be a valid email'),
  check('password')
  .isLength({min:8})
  .withMessage('password must be atleast 8 charactors')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
  .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character'),

];

exports.forgotPasswordValidation = [
  check('email')
  .notEmpty()
  .isEmail()
  .withMessage('Must be a valid email')
  
];

exports.resetPasswordValidation = [
  check('newPassword')
  .isLength({min:8})
  .withMessage('password must be atleast 8 charactors')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
  .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character'),
  
];