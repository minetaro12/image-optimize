const targetFile = document.getElementById('targetFile');
const formatOp = document.getElementById('formatOp');
const resizeOp = document.getElementById('resizeOp');
const qualityOp = document.getElementById('qualityOp');
const removemetaOp = document.getElementById('removemetaOp');
const grayOp = document.getElementById('grayOp');

const statusArea = document.getElementById('statusArea');

const submitButton = document.getElementById('submitButton');

const waitHtml = '<button class="btn btn-primary" type="button" disabled>\
  <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>\
  Please Wait...\
  </button>';

const dlHtml = '<button class="btn btn-primary" type="button" disabled>\
  <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>\
  Downloading...\
  </button>';

const defHtml = '<input type="button" class="btn btn-outline-primary" value="圧縮" onclick="submit()">';

const sizeChange = function(size) {
  resizeOp.value = size;
};

const submit = function() {
  statusArea.innerHTML = '';

  //何も選択されていないとき
  if(!formatOp.value || !resizeOp.value || !qualityOp.value) {
    statusArea.innerHTML = '<div class="alert alert-warning" role="alert">未入力の項目があります</div>';
    return;
  };

  if(!targetFile.files[0]) {
    statusArea.innerHTML = '<div class="alert alert-warning" role="alert">ファイルが選択されていません</div>';
    return;
  };

  const fd = new FormData();

  //フォームデータのセット
  fd.append('file', targetFile.files[0]);
  fd.append('format', formatOp.value);
  fd.append('size', resizeOp.value);
  fd.append('quality', qualityOp.value);
  if(removemetaOp.checked == true) {
    fd.append('removemeta', '1');
  };
  if(grayOp.checked == true) {
    fd.append('gray', '1');
  };

  //送信
  submitButton.innerHTML = waitHtml;
  fetch('/upload', {
    method: 'POST',
    body: fd
  })
  .then((res) => {
    if (!res.ok) {
      throw new Error;
    };
    submitButton.innerHTML = dlHtml;
    const header = res.headers.get('Content-Disposition');
    const parts = header.split(';');
    fileName = decodeURIComponent(parts[1].split('=')[1]);
    console.log(fileName)
    return res.blob();
  })
  .then((data) => {
    submitButton.innerHTML = defHtml;
    const a = document.createElement("a");
    a.href = window.URL.createObjectURL(data);
    a.download = fileName;
    a.click();
    a.remove();
  })
  .catch((error) => {
    submitButton.innerHTML = defHtml;
    statusArea.innerHTML = '<div class="alert alert-danger" role="alert">エラーが発生しました</div>';
    return;
  });

};
