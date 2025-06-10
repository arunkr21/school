document.addEventListener("DOMContentLoaded", () => {
  const printBtn = document.getElementById("print-btn");
  const downloadBtn = document.getElementById("download-btn");

  printBtn.addEventListener("click", () => {
    alert("hi");
    window.print();
  });

  function downloadCSV() {
    const encodedUri = encodeURI("data:text/csv;charset=utf-8,\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "school_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  document
    .getElementById("upload-csv")
    .addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (file) {
        console.log("File selected:", file.name);
        alert("CSV file selected: " + file.name);
      }
    });
});
