function formatTime(milliseconds) {
    
    let hours = Math.floor(milliseconds / (1000 * 60 * 60));
    if (hours < 10) hours = "0" + hours;
    milliseconds %= (1000 * 60 * 60);

    let minutes = "" + Math.floor(milliseconds / (1000 * 60));
    if (minutes < 10) minutes = "0" + minutes;
    milliseconds %= (1000 * 60);
    
    let seconds = "" + Math.floor(milliseconds / 1000);
    if (seconds < 10) seconds = "0" + seconds;

    return `${hours}:${minutes}:${seconds}`;
}

// Any elements that have a `time` attribute with milliseconds will be formmated.
function formatTimes() {
  document.querySelectorAll("[time]").forEach((timeElement) => {
    const time = parseInt(timeElement.getAttribute("time"), 10);

    timeElement.innerText = formatTime(time)
  });
}

// Any elements with the class `markdown` will convert to HTML.
function convertMarkdown() {
  let converter = new showdown.Converter();
  document.querySelectorAll('.markdown').forEach((e) => {
    let md = e.innerHTML;
    md = md.replaceAll("&gt;", ">");
    md = md.replaceAll("&lt;", "<");
    e.innerHTML = converter.makeHtml(md);
  });
}

// Any form groups that have a date attribute will fill the the child date and time inputs
// With appropriate default values.
function fillDateInputs() {
  document.querySelectorAll('.date.fields').forEach((dateField) => {
    let values = dateField.getAttribute('date').split(' ');

    dateField.querySelector('input[type=date]').value = values[0];
    dateField.querySelector('input[type=time]').value = values[1].substring(0, 5); // Cut of seconds
  })
}

document.addEventListener("DOMContentLoaded", () => {
  formatTimes();
  convertMarkdown();
  fillDateInputs();
});