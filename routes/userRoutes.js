const { userMiddleware } = require('../auth/userAuth');
const { signUp, singIn, VerifyEmail, resendOtp, findAccount, OtpForPasswordChange, VerifyPasswordChange, ChangeUserPassword, getUserProfile, UpdateProfile, testdb } = require('../controllers/userControllers');
const router = require('express').Router();

/** 
 * @swagger
 * /api/v1/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Non-Authenticated]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullname:
 *                 type: string
 *                 description: Full name of the user
 *               phone_number:
 *                 type: string
 *                 description: User's phone number
 *               role:
 *                 type: string
 *                 description: Role of the user (e.g., student, teacher)
 *               level:
 *                 type: string
 *                 description: User's level (e.g., beginner, intermediate)
 *               dob:
 *                 type: string
 *                 format: date
 *                 description: Date of birth of the user
 *               location:
 *                 type: string
 *                 description: User's location
 *               email:
 *                 type: string
 *                 description: User's email address
 *               gender:
 *                 type: string
 *                 description: Gender of the user
 *               password:
 *                 type: string
 *                 description: User's password
 *               confirm_password:
 *                 type: string
 *                 description: Confirmation of the user's password
 *             required:
 *               - fullname
 *               - phone_number
 *               - role
 *               - level
 *               - dob
 *               - location
 *               - email
 *               - gender
 *               - password
 *               - confirm_password
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 msg:
 *                   type: string
 *                 data:
 *                   type: object
 *                   description: The newly created user object
 *       400:
 *         description: Bad request (e.g., missing fields, email/phone already exists, password mismatch, or invalid password)
 *       500:
 *         description: Internal server error
 */
router.post('/signup', signUp);

/**
 * @swagger
 * /api/v1/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Non-Authenticated]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: integer }
 *                 msg: { type: string }
 *                 token: { type: string }
 *       400:
 *         description: Invalid credentials
 */
router.post('/login', singIn);

/**
 * @swagger
 * /api/v1/verify-email:
 *   post:
 *     summary: Verify user email with OTP
 *     tags: [Non-Authenticated]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               code:
 *                 type: string
 *             required:
 *               - email
 *               - code
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid OTP or email
 */
router.post('/verify-email', VerifyEmail);

// Non-Auth Email and Password Verifications

/**
 * @swagger
 * /api/v1/find-account/{email}:
 *   get:
 *     summary: Check if an account exists by email
 *     tags: [Non-Authenticated]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: User email to find
 *     responses:
 *       200:
 *         description: Account found
 *       404:
 *         description: Account not found
 */
router.get('/find-account/:email', findAccount);

/**
 * @swagger
 * /api/v1/resend_otp:
 *   post:
 *     summary: Resend OTP for email verification
 *     tags: [Non-Authenticated]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *       400:
 *         description: Invalid email
 */
router.post('/resend_otp', resendOtp);

/**
 * @swagger
 * /api/v1/otp_for_password:
 *   post:
 *     summary: Request OTP for password reset
 *     tags: [Non-Authenticated]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: OTP sent for password reset
 *       400:
 *         description: Invalid email
 */
router.post('/otp_for_password', OtpForPasswordChange);

// Auth Password Verifications

/**
 * @swagger
 * /api/v1/verify-password:
 *   post:
 *     summary: Verify OTP and change password
 *     tags: [Non-Authenticated]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *               new_password:
 *                 type: string
 *               confirm_password:
 *                 type: string
 *             required:
 *               - email
 *               - otp
 *               - new_password
 *               - confirm_password
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid OTP or password mismatch
 */
router.post('/verify-password', VerifyPasswordChange);

/**
 * @swagger
 * /api/v1/resend_Otp_for_password:
 *   post:
 *     summary: Resend OTP for password reset (authenticated)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *       401:
 *         description: Unauthorized (missing or invalid token)
 */
router.post('/resend_Otp_for_password', userMiddleware, OtpForPasswordChange);


/** 
@swagger
 * /api/v1/verify-code:
 *   post:
 *     summary: Verify code for user change of password (authenticated)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code: { type: 'string' }
 *               email: { type: 'string' }
 *             required: [code, email]
 *     responses:
 *       200:
 *         description: Code verified successfully
 *       400:
 *         description: Incomplete request or invalid code
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       404:
 *         description: Account not found
 *       500:
 *         description: Internal server error
 */
router.post('/verify-code', userMiddleware, VerifyPasswordChange)

/** 
@swagger
 * /api/v1/change-password:
 *   post:
 *     summary: Change user current password (authenticated)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: 'string' }
 *               new_password: { type: 'string' }
 *               confirm_password: { type: 'string' }
 *             required: [email,new_password,confirm_password]
 *     responses:
 *       200:
 *         description: Password changed succesfully, login account
 *       400:
 *         description: Incomplete request or invalid code
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       404:
 *         description: Account not found
 *       500:
 *         description: Internal server error
 */
router.post('/change-password', userMiddleware, ChangeUserPassword)

 /* 
 * @swagger
 * /api/v1/update-profile:
 *   put:
 *     summary: Update the user's profile (authenticated)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fullname:
 *                 type: string
 *                 description: Full name of the user
 *               phone_number:
 *                 type: string
 *                 description: User's phone number
 *               level:
 *                 type: string
 *                 description: User's level (e.g., beginner, intermediate)
 *               dob:
 *                 type: string
 *                 format: date
 *                 description: Date of birth of the user
 *               location:
 *                 type: string
 *                 description: User's location
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Profile picture of the user (optional)
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 msg:
 *                   type: string
 *                 data:
 *                   type: object
 *                   description: Updated user profile data
 *       400:
 *         description: Bad request (e.g., invalid file format, file size too large)
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/profile', userMiddleware, getUserProfile)


/** 
 * @swagger
 * /api/v1/update-profile:
 *   put:
 *     summary: Update user's profile (authenticated)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               phone:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: integer }
 *                 msg: { type: string }
 *                 data: 
 *                   type: object
 *                   properties:
 *                     id: { type: integer }
 *                     firstname: { type: string }
 *                     lastname: { type: string }
 *                     email: { type: string }
 *                     phone: { type: string }
 *                     gender: { type: string }
 *                     avatar: { type: string }
 *       400:
 *         description: Bad request (e.g., file size too large, invalid file format)
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Internal server error
 */
router.put('/update-profile', userMiddleware, UpdateProfile)
router.get('/test-db', testdb);

module.exports = router; 