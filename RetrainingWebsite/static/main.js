
document.addEventListener('click', function (event) {
    if (event.target.tagName === 'A' && event.target.href) {
        setTimeout(function () {
            location.reload();
        }, 4000); // Sets a delay (e.g., 5000ms) to give the download and file deletion enough time to complete
    }
}, false);


    function displayFileName(input) {
        const fileNameDisplay = document.getElementById('file-name-display');
        if (input.files && input.files[0]) {
            fileNameDisplay.textContent = input.files[0].name;
        } else {
            fileNameDisplay.textContent = '';
        }
    }

