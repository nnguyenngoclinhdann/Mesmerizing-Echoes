
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const lowerCase = /[a-z]/;
const upperCase = /[A-Z]/;
const number = /[0-9]/;
const form = document.querySelector("form");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const usernameInput = document.getElementById("username").value.trim();
  const emailInput = document.getElementById("email").value.trim();
  const passwordInput = document.getElementById("password").value.trim();
  const username = usernameInput.toLowerCase();
  const email = emailInput.toLowerCase();
  const password = passwordInput;
  const users = JSON.parse(localStorage.getItem("users")) || [];
  if (username.length < 6) {
    alert("Username phải ít nhất 6 ký tự");
    return;
  }

  if (users.some(user => user.username === username)) {
    alert("Username đã được đăng ký");
    return;
  }

  if (!emailPattern.test(email)) {
    alert("Email không hợp lệ");
    return;
  }

  if (users.some(user => user.email === email)) {
    alert("Email đã được đăng ký");
    return;
  }

  if (password.length < 8) {
    alert("Password phải ít nhất 8 ký tự");
    return;
  }

  if (!lowerCase.test(password)) {
    alert("Password phải có chữ thường");
    return;
  }

  if (!upperCase.test(password)) {
    alert("Password phải có chữ hoa");
    return;
  }

  if (!number.test(password)) {
    alert("Password phải có số");
    return;
  }

  users.push({
    username,
    email,
    password,
    createdAt: new Date().toISOString()
  });

  localStorage.setItem("users", JSON.stringify(users));

  alert("🎉 Tạo tài khoản thành công, vui lòng đăng nhập");
  location.href = "./login.html";
});
