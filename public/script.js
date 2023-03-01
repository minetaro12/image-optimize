const fileForm = document.querySelector("#file")
const displayFileName = document.querySelector("#selected-filename")

fileForm.addEventListener("change", (e) => {
  displayFileName.innerText = fileForm.files[0].name
})

const type = document.querySelector("#type")
const size = document.querySelector("#size")
const quality = document.querySelector("#quality")

const errDiag = document.querySelector("#errDiag")
const submitButton = document.querySelector("#submitButton")

function submit() {
  submitButton.setAttribute("disabled", true)
  errDiag.classList.add("hide")

  const fd = new FormData()
  fd.append("file", fileForm.files[0])
  fd.append("type", type.value)
  fd.append("size", size.value)
  fd.append("quality", quality.value)

  fetch("/upload", {
    method: "POST",
    body: fd
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error
      }
      const header = res.headers.get('Content-Disposition');
      const parts = header.split(';');
      fileName = decodeURIComponent(parts[1].split('=')[1]);
      console.log(fileName)
      return res.blob();
    })
    .then((data) => {
      const a = document.createElement("a");
      a.href = window.URL.createObjectURL(data);
      a.download = fileName;
      a.click();
      a.remove();
      submitButton.removeAttribute("disabled")
    })
    .catch((error) => {
      errDiag.classList.remove("hide")
      submitButton.removeAttribute("disabled")
      return
    })
}