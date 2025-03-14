const User = require('../models').users
const jwt = require('jsonwebtoken')
const fs = require('express-fileupload')
const { ServerError, WebName, GlobalImageUploads, GlobalDeleteSingleImage } = require('../utils/utils')
const bcrypt = require('bcryptjs')
const otpgenerator = require('otp-generator')
const Notify = require('../models').notifications
const SendMail = require('../emails/mailConfig')
const moment = require('moment')



exports.signUp = async (req, res) => {
    try {
        const { firstname, lastname, phone, role, email, gender, password, confirm_password } = req.body
        const regFields = [firstname, lastname, phone, email, gender, role, password, confirm_password]
        if (regFields.some((field) => !field)) return res.json({ status: 400, msg: "All fields are required" })
        const findMail = await User.findOne({ where: { email } })
        if (findMail) return res.json({ status: 400, msg: "Email already exists, kindly login" })
        const findPhone = await User.findOne({ where: { phone } })
        const validatePassword = (password) => {
            const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;
            return regex.test(password);
        }
        if (!validatePassword(password)) return res.json({ status: 400, msg: "Password must be at least 6 characters long, contain at least one uppercase letter, one number, and one special character." })
        if (password !== confirm_password) return res.json({ status: 400, msg: "Password(s) mismatch" })
        if (findPhone) return res.json({ status: 400, msg: "Phone number already exists" })
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const code = otpgenerator.generate(6, { specialChars: false, lowerCaseAlphabets: false })
        const unique_id = otpgenerator.generate(6, { specialChars: false, lowerCaseAlphabets: false })
        const newUser = await User.create({ firstname, unique_id, lastname, role, gender, email, password: hashedPassword, code })
        await SendMail({
            code: code,
            mailTo: email,
            subject: 'Account Verification Code',
            username: firstname,
            fullname: `${firstname} ${lastname}`,
            message: 'Copy and paste your account verification code below',
            template: 'verification',
            email: email,
            date: moment().format('DD MMMM YYYY hh:mm A')
        })

        await Notify.create({
            userid: newUser.id,
            type: 'Successful Signup',
            message: `Welcome to ${WebName}! Your account has been successfully created. Start exploring, learning, and connecting with the educational opportunities waiting for you!`,
        })
        return res.json({ status: 201, msg: 'user created successfully', data: newUser })
    } catch (error) {
        ServerError(res, error)
    }
}

exports.singIn = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) return res.json({ status: 400, msg: "Incomplete request" })
        const user = await User.findOne({ where: { email } })
        if (!user) return res.json({ status: 400, msg: "Invalid email or password" })
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) return res.json({ status: 400, msg: "Invalid email or password" })
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '10h' })
        return res.json({ status: 200, msg: 'logged in successfully', token })
    } catch (error) {
        ServerError(res, error)
    }
}

exports.VerifyEmail = async (req, res) => {

    try {
        const { code, email } = req.body
        if (!code || !email) return res.json({ status: 404, msg: 'Incomplete Request' })
        const FindEmail = await User.findOne({ where: { email } })
        if (!FindEmail) return res.json({ status: 404, msg: 'Account not found' })
        if (code !== FindEmail.code) return res.json({ status: 404, msg: 'Invalid code' })
        FindEmail.code = null
        FindEmail.verified = 'verified'
        await FindEmail.save()
        await SendMail({
            mailTo: email,
            fullname: `${FindEmail.firstname} ${FindEmail.lastname}`,
            subject: 'Successful SignUp',
            dateJoined: moment(FindEmail.createdAt).format('DD MMMM YYYY hh:mm A'),
            role: FindEmail.role,
            username: FindEmail.firstname,
            date: moment().format('DD MMMM YYYY hh:mm A'),
            template: 'welcome',
            Webname: WebName
        })
        return res.json({ status: 200, msg: 'Email verified successfully' })

    } catch (error) {
        return res.json({ status: 500, msg: error.message })
    }
}

exports.resendOtp = async (req, res) => {
    try {
        const { email, tag } = req.body
        if (!tag) return res.json({ status: 400, msg: "Tag missing" })
        const tags = ['password', 'email']
        if (!tags.includes(tag)) return res.json({ status: 400, msg: "Imvalid Tag Found" })
        if (!email) return res.json({ status: 400, msg: 'User email is missing' })
        const FindEmail = await User.findOne({ where: { email } })
        if (FindEmail.verified === 'verified') return res.json({ status: 400, msg: 'Account already verified' })
        if (!FindEmail) return res.json({ status: 404, msg: 'Account not found' })
        const otp = otpgenerator.generate(6, { specialChars: false, lowerCaseAlphabets: false })
        FindEmail.code = otp
        await FindEmail.save()
        await SendMail({
            code: otp,
            mailTo: email,
            subject: tag === 'email' ? 'Account Verification Code' : 'OTP For Change Of Password',
            username: FindEmail.firstname,
            fullname: `${FindEmail.firstname} ${FindEmail.lastname}`,
            message: 'Copy and paste your account verification code below',
            template: 'verification',
            email: email,
            date: moment().format('DD MMMM YYYY hh:mm A')
        })
        return res.json({ status: 200, msg: 'Otp sent successfully' })
    } catch (error) {
        ServerError(res, error)
    }
}

//Non Auth Password Change

exports.findAccount = async (req, res) => {
    try {
        const { email } = req.params
        if (!email) return res.json({ status: 400, msg: 'Email is missing' })
        const findemail = await User.findOne({
            where: { email },
            attributes: ['firstname', 'lastname']
        })
        if (!findemail) return res.json({ status: 400, msg: 'Email not found' })
        return res.json({ status: 200, msg: 'Account found', data: findemail })
    } catch (error) {
        ServerError(res, error)
    }
}

exports.OtpForPasswordChange = async (req, res) => {
    try {
        const { email } = req.body
        if (!email) return res.json({ status: 400, msg: 'User email is missing' })
        const FindEmail = await User.findOne({ where: { email } })
        if (!FindEmail) return res.json({ status: 404, msg: 'Account not found' })
        const otp = otpgenerator.generate(6, { specialChars: false, lowerCaseAlphabets: false, upperCaseAlphabets: false })
        FindEmail.code = otp
        await FindEmail.save()
        await SendMail({
            code: otp,
            mailTo: email,
            subject: 'Account Verification For Change Of Password',
            username: FindEmail.firstname,
            fullname: `${FindEmail.firstname} ${FindEmail.lastname}`,
            message: 'Copy and paste your account verification code below',
            template: 'verification',
            email: email,
            Webname: WebName,
            date: moment().format('DD MMMM YYYY hh:mm A')
        })
        return res.json({ status: 200, msg: 'Otp sent successfully' })
    } catch (error) {
        ServerError(res, error)
    }
}





//Auth Password change

exports.VerifyPasswordChange = async (req, res) => {
    try {
        const { code, email } = req.body
        if (!code || !email) return res.json({ status: 404, msg: 'Incomplete Request' })
        const FindEmail = await User.findOne({ where: { email } })
        if (!FindEmail) return res.json({ status: 404, msg: 'Account not found' })
        if (code !== FindEmail.code) return res.json({ status: 404, msg: 'Invalid code' })
        FindEmail.code = null
        await FindEmail.save()
        return res.json({ status: 200, msg: 'Code verified successfully' })
    } catch (error) {
        return res.json({ status: 500, msg: error.message })
    }
}



exports.ChangeUserPassword = async (req, res) => {
    try {
        const { email, new_password, confirm_password } = req.body
        if (!email || !new_password || !confirm_password) return res.json({ status: 404, msg: 'Incomplete rquest to change password' })
        const finduser = await User.findOne({ where: { email } })
        if (!finduser) return res.json({ status: 400, msg: 'Account not found ' })
        if (new_password !== confirm_password) return res.json({ status: 404, msg: 'Password(s) mismatched' })
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/;

        if (!passwordRegex.test(new_password)) {
            return res.json({
                status: 400,
                message:
                    "Password must be at least 6 characters long, contain at least one uppercase letter, one number, and one special character.",
            });
        }

        const saltrounds = 10
        const hashedPassword = await bcrypt.hash(new_password, saltrounds)
        finduser.password = hashedPassword
        await finduser.save()
        await Notify.create({
            type: 'Account Password Change',
            message: `Your request to change your account password was successful.`,
            userid: finduser.id
        })
        await SendMail({
            mailTo: finduser.email,
            subject: 'Password Change Successful',
            username: finduser.firstname,
            message: 'Your request to change your account password was successful, login to your account with the new password',
            template: 'emailpass',
            date: moment().format('DD MMMM YYYY hh:mm A')
        })
        return res.json({ status: 200, msg: "Password changed succesfully, login account" })
    } catch (error) {
        return res.json({ status: 404, msg: error })
    }
}


exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findOne({
            where: { id: req.user },
            attributes: {
                exclude: ['password', 'code',]
            }
        })
        if (!user) return res.json({ status: 404, msg: "User not found" })
        return res.json({ status: 200, msg: "User found", data: user })
    } catch (error) {
        ServerError(res, error)
    }
}

exports.UpdateProfile = async (req, res) => {
    try {
        const { firstname, lastname, phone } = req.body
        const findUser = await User.findOne({ where: { id: req.user } })
        if (!findUser) return res.json({ status: 404, msg: "User not found" })
        const avatar = req?.files?.avatar
        if (avatar) {
            if (avatar.size > 1000000) return res.json({ status: 400, msg: "File size too large" })
            if (!avatar.mimetype.startsWith('image/')) return res.json({ status: 400, msg: "Invalid file format" })
            if (findUser.avatar) {
                await GlobalDeleteSingleImage(findUser.avatar)
            }
            const image = await GlobalImageUploads([avatar], 'avatars', findUser.unique_id)
            findUser.avatar = image[0]
        }
        if (firstname) findUser.firstname = firstname
        if (lastname) findUser.lastname = lastname
        if (phone) findUser.phone = phone
        await findUser.save()
        await Notify.create({
            userid: findUser.id,
            type: 'Profile Update',
            message: `Your profile has been successfully updated. Kindly check to confirm the changes made.`,
        })
        return res.json({ status: 200, msg: "Profile updated successfully", data: findUser })

    } catch (error) {
        ServerError(res, error)
    }
}