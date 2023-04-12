
document.addEventListener('click', function (event) {
    if (event.target.tagName === 'A' && event.target.href) {
        setTimeout(function () {
            location.reload();
        }, 4000); // Sets a delay (e.g., 5000ms) to give the download and file deletion enough time to complete
    }
}, false);

