function myFunction() {
  var baz = document.getElementById("root").innerHTML;

  document.getElementById("demo").innerHTML = "Paragraph changed." + baz;
}

module.exports = myFunction;
