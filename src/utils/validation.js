const validator = require("validator");

const validateSignUpData = (req) => {
  const { firstName, lastName, emailId, password } = req.body || {};
  console.log(req.body);
  if (!firstName?.trim() || !lastName?.trim()) {
    throw new Error("Name is not valid!");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Email is not valid!");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Enter a strong password!");
  }

  return true;
};

const validateEditProfileData = (req) => {
  const { firstName, lastName, age, gender, photoURL, skills, about } =
    req.body || {};
  const allowedEditFields = [
    "firstName",
    "lastName",
    "age",
    "gender",
    "skills",
    "about",
    "photoURL",
  ];

  const isEditAllowed = Object.keys(req.body).every((field) =>
    allowedEditFields.includes(field)
  );

  if (!isEditAllowed) {
    throw new Error("Invalid fields in the edit request.");
  }

  if (
    firstName &&
    (typeof firstName !== "string" ||
      firstName.trim().length < 4 ||
      firstName.trim().length > 50)
  ) {
    throw new Error("First name must be a string between 4 and 50 characters.");
  }

  if (
    lastName &&
    (typeof lastName !== "string" || lastName.trim().length > 50)
  ) {
    throw new Error("Last name must be a string between 4 and 50 characters.");
  }

  if (age && (typeof age !== "number" || age < 18)) {
    throw new Error("Age must be a number and at least 18.");
  }

  if (gender && !["male", "female", "others"].includes(gender)) {
    throw new Error(
      "Gender must be one of the following: male, female, others."
    );
  }

  if (photoURL && !validator.isURL(photoURL)) {
    throw new Error("Invalid photoURL.");
  }

  if (skills) {
    if (!Array.isArray(skills)) {
      throw new Error("Skills must be an array of strings.");
    }
    if (skills.length >= 10) {
      throw new Error("Skills must contain less than 10 items.");
    }
    const uniqueSkills = new Set(skills);
    if (uniqueSkills.size !== skills.length) {
      throw new Error("Skills must be unique.");
    }
  }

  if (about && typeof about !== "string") {
    throw new Error("About must be a string.");
  }

  return true;
};

module.exports = {
  validateSignUpData: validateSignUpData,
  validateEditProfileData: validateEditProfileData,
};
