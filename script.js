const GAS_URL = "https://script.google.com/macros/s/AKfycbyjIwILkcHCnPbhBE9RSkHXjKGKRPfNQK2_5ZoPpxn24nj04Mu2MVU8qSK7MyNXVPEV/exec";
let currentUser = null;
let bookNumber = null;

// Login
document.getElementById("loginBtn").addEventListener("click", async () => {
  const phone = document.getElementById("phone").value.trim();
  if (!phone) return swal("กรุณากรอกหมายเลขโทรศัพท์");

  const res = await fetch(GAS_URL, {
    method:"POST",
    body: JSON.stringify({action:"login", phone}),
    headers: {"Content-Type":"application/json"}
  });
  const data = await res.json();
  if (!data.success) return swal(data.message);

  currentUser = data.user;
  document.getElementById("user").value = currentUser;
  document.querySelector(".login-card").classList.add("hidden");
  document.querySelector(".form-card").classList.remove("hidden");

  startAutoClearTimer();
});

// Show/Hide "other department"
document.getElementById("department").addEventListener("change", (e)=>{
  document.getElementById("departmentOther").classList.toggle("hidden", e.target.value !== "others");
});

// Request Book Number
document.getElementById("requestBtn").addEventListener("click", async () => {
  if (!validateForm()) return;
  swal({title:"กำลังรอคิว...", text:"โปรดรอสักครู่", buttons:false, closeOnClickOutside:false});
  
  // ดึงเลขหนังสือ
  const res = await fetch(GAS_URL, {
    method:"POST",
    body: JSON.stringify({action:"getBookNumber"}),
    headers: {"Content-Type":"application/json"}
  });
  const data = await res.json();
  if (!data.success) return swal(data.message);

  bookNumber = data.bookNumber;
  const formData = {
    bookNumber: bookNumber,
    date: document.getElementById("date").value,
    subject: document.getElementById("subject").value,
    toDept: document.getElementById("toDept").value,
    department: document.getElementById("department").value === "others" ? document.getElementById("departmentOther").value : document.getElementById("department").value,
    user: currentUser
  };

  // Submit Form
  const submitRes = await fetch(GAS_URL, {
    method:"POST",
    body: JSON.stringify({action:"submitForm", formData}),
    headers: {"Content-Type":"application/json"}
  });
  const submitData = await submitRes.json();
  if (!submitData.success) return swal(submitData.message);

  swal(`✅ ขอเลขหนังสือสำเร็จ`, `เลขหนังสือออก: ที่ ศธ 04338.51/${bookNumber}`);
  resetForm();
});

// Form Validation
function validateForm() {
  if(!document.getElementById("date").value ||
     !document.getElementById("subject").value ||
     !document.getElementById("toDept").value ||
     !document.getElementById("department").value ||
     (document.getElementById("department").value==="others" && !document.getElementById("departmentOther").value)
  ) {
    swal("กรุณากรอกข้อมูลให้ครบถ้วน");
    return false;
  }
  return true;
}

function resetForm(){
  document.getElementById("date").value="";
  document.getElementById("subject").value="";
  document.getElementById("toDept").value="";
  document.getElementById("department").value="";
  document.getElementById("departmentOther").value="";
  document.querySelector(".login-card").classList.remove("hidden");
  document.querySelector(".form-card").classList.add("hidden");
  currentUser=null;
  bookNumber=null;
}

// Auto-clear user after 5 min
function startAutoClearTimer(){
  setTimeout(async ()=>{
    if(currentUser){
      await fetch(GAS_URL, {
        method:"POST",
        body: JSON.stringify({action:"submitForm", formData:{user:currentUser, bookNumber:"-expired"}}),
        headers: {"Content-Type":"application/json"}
      });
      swal("⏰ หมดเวลาใช้งาน กรุณาเข้าสู่ระบบใหม่");
      resetForm();
    }
  }, 5*60*1000);
}
