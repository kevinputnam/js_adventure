var game;

fetch("test.json").then(response => response.text()).then(respText => start_game(respText));

function start_game(text){
  var jstuff = JSON.parse(text);
  game = new Game(jstuff);
}