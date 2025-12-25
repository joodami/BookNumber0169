const GAS_URL = "https://script.google.com/macros/s/AKfycbyjIwILkcHCnPbhBE9RSkHXjKGKRPfNQK2_5ZoPpxn24nj04Mu2MVU8qSK7MyNXVPEV/exec";
let currentUser = null;

loginBtn.onclick = async () => {
  const phone = phone.value.trim();
  if (!phone) return swal("กรอกหมายเลขโทรศัพท์");

  const res = await fetch(GAS_URL, {
    method:"POST",
    body: JSON.stringify({ action:"login", phone })
  });
  const data = await res.json();
  if (!data.success) return swal(data.message);

  currentUser = data.user;
  user.value = currentUser;
  document.querySelector(".login").classList.add("hidden");
  document.querySelector(".form").classList.remove("hidden");
};

department.onchange = () => {
  departmentOther.classList.toggle("hidden", department.value !== "others");
};

requestBtn.onclick = async () => {
  if (!date.value || !subject.value || !toDept.value || !department.value) {
    return swal("กรอกข้อมูลให้ครบ");
  }

  swal({ title:"กำลังออกเลข...", buttons:false });

  const lockRes = await fetch(GAS_URL, {
    method:"POST",
    body: JSON.stringify({ action:"getBookNumber", user:currentUser })
  });
  const lockData = await lockRes.json();
  if (!lockData.success) return swal(lockData.message);

  const bookNo = lockData.bookNumber;

  await fetch(GAS_URL, {
    method:"POST",
    body: JSON.stringify({
      action:"submitForm",
      formData:{
        bookNumber:bookNo,
        date:date.value,
        subject:subject.value,
        toDept:toDept.value,
        department:department.value==="others"?departmentOther.value:department.value,
        user:currentUser
      }
    })
  });

  swal("สำเร็จ", `เลขหนังสือออก\nที่ ศธ 04338.51/${bookNo}`);
  location.reload();
};
