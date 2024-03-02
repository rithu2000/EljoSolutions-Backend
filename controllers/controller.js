import bcrypt from 'bcrypt';
import { sendMail } from "../middleware/nodeMailer.js";
import Employee from "../models/employeeModel.js";
import { generateTokens } from '../jwt/generateToken.js';
import { getSingleImage, imageUpload } from '../middleware/imageUploadS3.js';

export const getEmployee = async (req, res, next) => {
  const employeeId = req.user.id;
  try {
    const employeeDetails = await Employee.findByPk(employeeId);
    const employee = await getSingleImage(employeeDetails);
    if (!employee) {
      return res.status(404).json({ success: false, error: "Employee not found" });
    }
    return res.status(200).json(employee);
  } catch (error) {
    next(error);
  }
};

export const getEmployeeById = async (req, res, next) => {
  const { employeeId } = req.body;
  try {
    const employeeDetails = await Employee.findByPk(employeeId);
    const employee = await getSingleImage(employeeDetails);
    if (!employee) {
      return res.status(404).json({ success: false, error: "Employee not found" });
    }
    return res.status(200).json(employee);
  } catch (error) {
    next(error);
  }
};

export const getAllEmployees = async (req, res, next) => {
  try {
    const allEmployees = await Employee.findAll();

    const employeesArray = allEmployees.map(employee => employee.dataValues);

    return res.status(200).json({ success: true, data: employeesArray });
  } catch (error) {
    next(error);
  }
};


// Function to generate a random password
const generateRandomPassword = () => {
  const length = 10;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
};

export const addEmployee = async (req, res, next) => {
  const { employeeCode, firstName, lastName, emailId, contactNo, department } = req.body;
  try {
    const existingEmployee = await Employee.findOne({ where: { emailId } });
    if (existingEmployee) {
      return res.status(401).json({ success: false, message: 'Employee with this email already exists.' });
    }
    // Generate a random password
    const randomPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(randomPassword, 10);
    const newEmployeeData = {
      employeeCode,
      firstName,
      lastName,
      emailId,
      password: hashedPassword,
      contactNo,
      department,
    }
    const newEmployee = await Employee.create(newEmployeeData);
    const subject = 'Login Credentials';
    const text = `Your username is ${emailId} and your password is ${randomPassword}`;
    const result = await sendMail(
      `${firstName} ${lastName} <${emailId}>`,
      subject,
      text,
    );
    if (result.success) {
      return res.status(201).json({ success: true, message: 'New Employee Created', data: newEmployee });
    } else {
      return res.status(400).json({ success: false, message: 'Failed to send OTP' });
    }
  } catch (error) {
    next(error);
  }
};

export const editEmployee = async (req, res, next) => {
  const imageName = req.file;
  const { id, employeeCode, firstName, lastName, emailId, ContactNo, department } = req.body;

  try {
    const employeeToUpdate = await Employee.findByPk(id);
    if (!employeeToUpdate) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    let imageUrl = null;
    if (imageName) {
      imageUrl = await imageUpload(imageName);
    }
    // Update employee details
    if (imageUrl) {
      employeeToUpdate.imageUrl = imageUrl;
    }
    employeeToUpdate.employeeCode = employeeCode;
    employeeToUpdate.firstName = firstName;
    employeeToUpdate.lastName = lastName;
    employeeToUpdate.emailId = emailId;
    employeeToUpdate.ContactNo = ContactNo;
    employeeToUpdate.department = department;

    // Save the changes
    await employeeToUpdate.save();

    return res.status(200).json({ success: true, message: 'Employee details updated successfully', data: employeeToUpdate });
  } catch (error) {
    next(error);
  }
};


export const deleteEmployee = async (req, res, next) => {
  const { employeeId } = req.body;

  try {
    const employeeToDelete = await Employee.findByPk(employeeId);
    if (!employeeToDelete) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    await employeeToDelete.destroy();
    return res.status(200).json({ success: true, message: 'Employee deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const loginEmployee = async (req, res, next) => {
  const { emailId, password } = req.body;

  try {
    const employee = await Employee.findOne({ where: { emailId } });
    if (!employee) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, employee.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const accessToken = generateTokens(employee);
    console.log(accessToken, 'accessToken');

    return res.status(200).json({ success: true, message: 'Login successful', accessToken, data: employee });
  } catch (error) {
    next(error);
  }
};