// client-side js
// run by the browser each time your view template is loaded
// our default array of dreams

// define variables that reference elements on our page
const createForm = document.getElementById('create-birthday');
const emailInput = createForm.elements['email'];

createForm.onsubmit = function(event) {  
  console.log("create");
  event.preventDefault();
    if(emailInput.value != null && emailInput.value != "") {
    var data = JSON.stringify({ email: emailInput.value});
    var xhr = new XMLHttpRequest();  

    xhr.open('POST', '/create', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function () {
      const body = document.body;
      body.innerHTML = this.responseText;     
    };
    xhr.send(data);
  } else {
    alert("No email adress provided");
  }
};