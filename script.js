let userName = null;
let phoneNumber = null;
let timer = null;

$('#btnLogin').click(() => {
  const phone = $('#phone').val().trim();
  if(!phone){ alert('กรุณากรอกหมายเลขโทรศัพท์'); return; }

  google.script.run.withSuccessHandler((data)=>{
    if(data.length > 0){
      userName = data[0][1];
      phoneNumber = data[0][0];
      $('#user').val(userName);
      $('#loginCard').addClass('invisible');
      $('#formCard').removeClass('invisible');
      startTimer();
    } else {
      swal("ผิดพลาด","ไม่พบผู้ใช้","error");
    }
  }).processForm(phone);
});

$('#btnRequest').click(() => {
  $('#progress').removeClass('invisible');
  google.script.run.withSuccessHandler((count)=>{
    if(count>0){
      swal("รอคิว","มีผู้กำลังขอเลขอยู่ กรุณารอ 5 นาที","warning");
      $('#progress').addClass('invisible');
      return;
    }

    const formData = {
      birthday: $('#birthday').val(),
      detail: $('#detail').val(),
      detail1: $('#detail1').val(),
      department: $('#department').val(),
      user: userName
    };

    google.script.run.withSuccessHandler((newNum)=>{
      swal("สำเร็จ", `เลขหนังสือออก = ที่ ศธ 04338.51/${newNum}`, "success");
      $('#progress').addClass('invisible');
      clearForm();
    }).addNewRow(formData);

  }).getOnlineCount();
});

function clearForm(){
  $('#birthday').val('');
  $('#detail').val('');
  $('#detail1').val('');
  $('#department').val('');
}

function startTimer(){
  if(timer) clearTimeout(timer);
  timer = setTimeout(()=>{
    swal("หมดเวลา","กรุณาเข้าสู่ระบบใหม่","warning");
    $('#formCard').addClass('invisible');
    $('#loginCard').removeClass('invisible');
    google.script.run.clearOnlineUser(phoneNumber);
  },5*60*1000);
}
