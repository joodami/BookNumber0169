const GAS_URL = "https://script.google.com/macros/s/AKfycbyjIwILkcHCnPbhBE9RSkHXjKGKRPfNQK2_5ZoPpxn24nj04Mu2MVU8qSK7MyNXVPEV/exec";

const loginBtn = document.getElementById("loginBtn");
const phoneInput = document.getElementById("phone");
const userInput = document.getElementById("user");

const formCard = document.querySelector(".form");
const loginCard = document.querySelector(".login");

const dateEl = document.getElementById("date");
const subjectEl = document.getElementById("subject");
const toDeptEl = document.getElementById("toDept");
const deptEl = document.getElementById("department");
const deptOtherEl = document.getElementById("departmentOther");
const requestBtn = document.getElementById("requestBtn");

let currentUser = null;

// ---- Login ----
loginBtn.onclick = async () => {
  try {
    const phoneVal = phoneInput.value.trim();
    if (!phoneVal) return swal("กรุณากรอกหมายเลขโทรศัพท์");

    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", phone: phoneVal })
    });

    const text = await res.text();
    console.log("RAW RESPONSE:", text);
    const data = JSON.parse(text);

    if (!data.success) return swal(data.message);

    currentUser = data.user;
    userInput.value = currentUser;

    loginCard.classList.add("hidden");
    formCard.classList.remove("hidden");
  } catch (err) {
    console.error(err);
    swal("เชื่อมต่อระบบไม่ได้");
  }
};

// ---- Dept other ----
deptEl.onchange = () => {
  deptOtherEl.classList.toggle("hidden", deptEl.value !== "others");
};

// ---- Request number ----
requestBtn.onclick = async () => {
  if (!dateEl.value || !subjectEl.value || !toDeptEl.value || !deptEl.value) {
    return swal("กรุณากรอกข้อมูลให้ครบถ้วน");
  }

  swal({ title:"กำลังออกเลข...", buttons:false, closeOnClickOutside:false });

  const lockRes = await fetch(GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action:"getBookNumber", user: currentUser })
  });
  const lockText = await lockRes.text();
  const lockData = JSON.parse(lockText);

  if (!lockData.success) return swal(lockData.message);

  const bookNo = lockData.bookNumber;

  await fetch(GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action:"submitForm",
      formData:{
        bookNumber: bookNo,
        date: dateEl.value,
        subject: subjectEl.value,
        toDept: toDeptEl.value,
        department: deptEl.value==="others" ? deptOtherEl.value : deptEl.value,
        user: currentUser
      }
    })
  });

  swal("สำเร็จ", `เลขหนังสือออก\nที่ ศธ 04338.51/${bookNo}`);
  location.reload();
};
