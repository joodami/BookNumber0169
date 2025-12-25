const GAS_URL = "https://script.google.com/macros/s/AKfycbyjIwILkcHCnPbhBE9RSkHXjKGKRPfNQK2_5ZoPpxn24nj04Mu2MVU8qSK7MyNXVPEV/exec";

const loginBtn = document.getElementById("loginBtn");
const phoneInput = document.getElementById("phone");
const userInput = document.getElementById("user");

const loginCard = document.querySelector(".login");
const formCard = document.querySelector(".form");

const dateEl = document.getElementById("date");
const subjectEl = document.getElementById("subject");
const toDeptEl = document.getElementById("toDept");
const deptEl = document.getElementById("department");
const deptOtherEl = document.getElementById("departmentOther");
const requestBtn = document.getElementById("requestBtn");

let currentUser = null;

// ================= Login =================
loginBtn.onclick = async () => {
  try {
    const phoneVal = phoneInput.value.trim();
    if (!phoneVal) return swal("กรุณากรอกหมายเลขโทรศัพท์");

    const body = new URLSearchParams();
    body.append("action", "login");
    body.append("phone", phoneVal);

    const res = await fetch(GAS_URL, {
      method: "POST",
      body: body
    });

    const data = JSON.parse(await res.text());
    if (!data.success) return swal(data.message);

    currentUser = data.user;
    userInput.value = currentUser;

    loginCard.classList.add("hidden");
    formCard.classList.remove("hidden");

  } catch (e) {
    console.error(e);
    swal("เชื่อมต่อระบบไม่ได้");
  }
};

// ================= Department other =================
deptEl.onchange = () => {
  deptOtherEl.classList.toggle("hidden", deptEl.value !== "others");
};

// ================= Request Book Number =================
requestBtn.onclick = async () => {
  if (
    !dateEl.value ||
    !subjectEl.value ||
    !toDeptEl.value ||
    !deptEl.value ||
    (deptEl.value === "others" && !deptOtherEl.value)
  ) {
    return swal("กรุณากรอกข้อมูลให้ครบถ้วน");
  }

  swal({ title: "กำลังออกเลข...", buttons: false });

  // ---- lock + get number ----
  const lockBody = new URLSearchParams();
  lockBody.append("action", "getBookNumber");
  lockBody.append("user", currentUser);

  const lockRes = await fetch(GAS_URL, {
    method: "POST",
    body: lockBody
  });

  const lockData = JSON.parse(await lockRes.text());
  if (!lockData.success) return swal(lockData.message);

  const bookNo = lockData.bookNumber;

  // ---- submit ----
  const submitBody = new URLSearchParams();
  submitBody.append("action", "submitForm");
  submitBody.append("formData", JSON.stringify({
    bookNumber: bookNo,
    date: dateEl.value,
    subject: subjectEl.value,
    toDept: toDeptEl.value,
    department: deptEl.value === "others" ? deptOtherEl.value : deptEl.value,
    user: currentUser
  }));

  await fetch(GAS_URL, {
    method: "POST",
    body: submitBody
  });

  swal("สำเร็จ", `เลขหนังสือออก\nที่ ศธ 04338.51/${bookNo}`);
  location.reload();
};
