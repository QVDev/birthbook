// client-side js
// run by the browser each time your view template is loaded
// our default array of dreams

// define variables that reference elements on our page
const dreamsForm = document.getElementById('add-birthday');
const nameInput = dreamsForm.elements['name'];
const dateInput = dreamsForm.elements['date'];
const idInput = dreamsForm.elements['id'];

nameInput.focus();

// listen for the form to be submitted and add a new dream when it is
dreamsForm.onsubmit = function(event) {

  // stop our form submission from refreshing the page
  event.preventDefault();

  // get dream value and add it to the list
  var nameDate = nameInput.value + ";" + dateInput.value;
  var data = JSON.stringify({ id: idInput.value, name: nameInput.value, date: dateInput.value});
  // reset form 
  nameInput.value = '';
  dateInput.value = '';

  var xhr = new XMLHttpRequest();  
  
  xhr.open('POST', '/', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onload = function () {
    const body = document.body;
    body.innerHTML = this.responseText;     
  };
  xhr.send(data);
};