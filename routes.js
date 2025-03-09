const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_PASSWORD,
  },
});

// 📌 Order Placement API
router.post("/order", async (req, res) => {
  const { userDetails, product } = req.body;
  
  if (!userDetails || !product) {
    return res.status(400).json({ message: "Invalid order details" });
  }

  const orderDetails = `
    <h2>Order Confirmation</h2>
    <p><strong>Product:</strong> ${product.name}</p>
    <p><strong>Price:</strong> ${product.price}</p>
    <p><strong>Customer Name:</strong> ${userDetails.name}</p>
    <p><strong>Email:</strong> ${userDetails.email}</p>
    <p><strong>Phone:</strong> ${userDetails.phone}</p>
    <p><strong>Address:</strong> ${userDetails.address}</p>
    <p><strong>Payment Method:</strong> ${userDetails.paymentMethod}</p>
    <img src="${product.images[0]}" width="200" />
  `;

  try {
    // Send Email to Customer
    await transporter.sendMail({
      from: process.env.ADMIN_EMAIL,
      to: userDetails.email,
      subject: "Your Order is Confirmed!",
      html: `<h1>Thank You for Your Purchase! 🎉</h1>${orderDetails}`,
    });

    // Send Email to Admin
    await transporter.sendMail({
      from: process.env.ADMIN_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: "New Order Received!",
      html: `<h1>New Order Received 📦</h1>${orderDetails}`,
    });

    res.status(200).json({ message: "Order placed successfully and emails sent!" });
  } catch (error) {
    console.error("Email sending failed:", error);
    res.status(500).json({ message: "Error sending email" });
  }
});
// Signup Route with OTP////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
router.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  console.log("Signup request received:", email);
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists");
      return res.status(400).json({ message: "User already exists" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000); 
    otpStore[email] = otp;
    const mailOptions = {
      from: process.env.ADMIN_EMAIL,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending OTP:", error.message);
        return res.status(500).json({ message: "Failed to send OTP", error: error.message });
      }
      console.log("OTP sent to:", email);  
      res.status(200).json({ message: "OTP sent to email. Please verify." });
    });    
  } catch (error) {
    console.error("Error during signup:", error);  
    res.status(500).json({ message: "Error during signup", error });
  }
});
router.post("/verify-otp", async (req, res) => {
  const { email, password, otp } = req.body;
  console.log("OTP verification request received:", email); 
  if (otpStore[email] !== parseInt(otp)) {
    console.log("Invalid OTP for email:", email);  
    return res.status(400).json({ message: "Invalid OTP" });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();
    delete otpStore[email];

    const mailOptions = {
      from: process.env.ADMIN_EMAIL,
      to: 'dimplesehal5@gmail.com', // Admin's email
      subject: 'New User Signup Notification',
      text: `A new user has signed up!\n\nUsername: ${username}\nEmail: ${email}`
  };

    console.log("User created successfully:", email); 
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error); 
    res.status(500).json({ message: "Error verifying OTP", error });
  }
});
// Login Route/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }
    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
});
// Request password reset and send OTP//////////////////////////////////////////////////////////////////////////////////////////////////////
router.post("/request-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000); 
    const expiryTime = Date.now() + 30000; 
    otpStore[email] = { otp, expiryTime };  
    console.log(`Generated OTP for ${email}: ${otp}`);
    const mailOptions = {
      from: "dimplesehal5@gmail.com",
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP code is ${otp}. It will expire in 30 seconds.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending OTP:", error);
        return res.status(500).json({ message: "Failed to send OTP", error });
      }
      console.log(`OTP sent to ${email}`);
      res.status(200).json({ message: "OTP sent to email" });
    });
  } catch (error) {
    res.status(500).json({ message: "Error sending OTP", error });
  }
});
router.post("/verifie-otp", (req, res) => {
  const { email, otp } = req.body;
  const storedOtpData = otpStore[email];
  if (!storedOtpData) {
    return res.status(400).json({ message: "OTP not found or expired" });
  }
  const { otp: storedOtp, expiryTime } = storedOtpData;
  if (Date.now() > expiryTime) {
    delete otpStore[email];
    return res.status(400).json({ message: "OTP expired" });
  }
  if (parseInt(otp) !== storedOtp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }
  console.log(`OTP for ${email} is verified successfully`);
  res.status(200).json({ message: "OTP verified successfully" });
});
router.post("/resend-otp", async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000);
  const expiryTime = Date.now() + 30000; 
  otpStore[email] = { otp, expiryTime }; 

  const mailOptions = {
    from: "dimplesehal5@gmail.com",
    to: email,
    subject: "Resent OTP for Password Reset",
    text: `Your new OTP code is ${otp}. It will expire in 30 seconds.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error resending OTP:", error);
      return res.status(500).json({ message: "Failed to resend OTP", error });
    }
    console.log(`OTP resent to ${email}`);
    res.status(200).json({ message: "OTP resent successfully" });
  });
  
});
router.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error resetting password", error });
  }
});


module.exports = router;
