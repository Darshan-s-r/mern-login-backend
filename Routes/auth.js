const express = require('express');

const router = express.Router()

//importing signup  [ and we destructureing it bcz in auth file we export it like object ]
const {signup, accountActivation, signin, forgotPassword, resetPassword } = require('../controllers/auth');

//import validators
const {userSignupValidation, userSigninValidation, forgotPasswordValidation, resetPasswordValidation} = require('../validators/auth');
const {runValidation} = require('../validators');   //hear {../validators/index actually but if the file name is index u can leave it }

//here we are using router from express.Router insted of app.get
router.post("/signup", userSignupValidation, runValidation, signup);
router.post("/accountActivation", accountActivation);
router.post("/signin", userSigninValidation, runValidation, signin);

//forgot reset password
router.put("/forgot-password", forgotPasswordValidation, runValidation, forgotPassword);
router.put("/reset-password", resetPasswordValidation, runValidation, resetPassword);


module.exports = router