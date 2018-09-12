
var xhr = new XMLHttpRequest();  

xhr.open('GET', '/count', true);
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.onload = function () {
  const footer = document.getElementsByTagName("footer")[0]
  footer.innerHTML += this.responseText;   
};
xhr.send();