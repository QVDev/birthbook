// client-side js
// run by the browser each time your view template is loaded
// our default array of dreams

// define variables that reference elements on our page
const createForm = document.getElementById('create_quicklink');
const quicklink = createForm.elements['quicklink'];
const recoverlink = createForm.elements['recoverId'];
const id = createForm.elements['id'];

createForm.onsubmit = function(event) {  
  var data = JSON.stringify({ id: id.value, quicklink: quicklink.value});
  event.preventDefault();      
  
  var xhr = new XMLHttpRequest();  

  xhr.open('POST', '/quicklink', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onload = function () {
    window.location.href = "/view/" + quicklink.value;
  };
  xhr.send(data);
};