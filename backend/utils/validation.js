const validateEmail = (email) => {
  const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(String(email).toLowerCase());
};

const validatePassword = (password) => {
  return typeof password === 'string' && password.length >= 6;
};

module.exports = {
  validateEmail,
  validatePassword,
};
