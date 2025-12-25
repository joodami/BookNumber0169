const GAS_URL = "https://script.google.com/macros/s/AKfycbyjIwILkcHCnPbhBE9RSkHXjKGKRPfNQK2_5ZoPpxn24nj04Mu2MVU8qSK7MyNXVPEV/exec";

// ===== DOM =====
const loginBtn = document.getElementById("loginBtn");
const phoneInput = document.getElementById("phone");
const userInput = document.getElementById("user");

const loginCard = document.querySelector(".login");
const formCard = document.querySelector(".form");

const dateInput = document.getElementById("date");
const subjectInput = document.getElementById("subject");
const toDeptInput = document.getElementById("toDept");
const deptSelect = document.getElementById("department");
const deptOtherInput = document.getElementById("departmentOther");
const requestBtn = document.getElementById("requestBtn");

let currentUser = null;

// ===== Login =====
loginBtn.onclick = async () => {
  try {
    const phoneVal = phoneInput.value.trim();
    if (!phoneVal) {
      swal("กรุณากรอกหมายเลขโทรศัพท์");
      return;
    }

    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "login",
        phone: phoneVal
      })
    });

    const text = await res.text();
    console.log("RAW RESPONSE:", text);

    const data = JSON.parse(text);
    if (!data.success) {
      swal(data.message);
      return;
    }

    currentUser = data.user;
    userInput.value = currentUser;

    loginCard.classList.add("hidden");
    formCard.classList.remove("hidden");

  } catch (err) {
    console.error(err);
    swal("ไม่สามารถเชื่อมต่อระบบได้");
  }
};

// ===== Department other =====
deptSelect.onchange = () => {
  deptOtherInput.classList.toggle("hidden", deptSelect.value !== "others");
};

// ===== Request Book Number =====
requestBtn.onclick = async () => {
  if (
    !dateInput.value ||
    !subjectInput.value ||
    !toDeptInput.value ||
    !deptSelect.value ||
    (deptSelect.value === "others" && !deptOtherInput.value)
  ) {
    swal("กรุณากรอกข้อมูลให้ครบถ้วน");
    return;
  }

  swal({
    title: "กำลังออกเลข...",
    buttons: false,
    closeOnClickOutside: false
  });

  // lock + get number
  const lockRes = await fetch(GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "getBookNumber",
      user: currentUser
    })
  });

  const lockText = await lockRes.text();
  const lockData = JSON.parse(lockText);

  if (!lockData.success) {
    swal(lockData.message);
    return;
  }

  const bookNo = lockData.bookNumber;

  // submit
  await fetch(GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "submitForm",
      formData: {
        bookNumber: bookNo,
        date: dateInput.value,
        subject: subjectInput.value,
        toDept: toDeptInput.value,
        department:
          deptSelect.value === "others"
            ? deptOtherInput.value
            : deptSelect.value,
        user: currentUser
      }
    })
  });

  swal("สำเร็จ", `เลขหนังสือออก\nที่ ศธ 04338.51/${bookNo}`);
  location.reload();
};
