var game;

var gamefiles = ['test.json'];

document.onkeypress = function (e) {
    if (e.keyCode == 0x0D){ //return key
      var proginput = document.getElementById('commandline');
      switch(game.mode){
        case 'talk':
          process_convo_command(proginput.value);
          break;
        case 'fight':
          process_fight_command(proginput.value);
          break;
        default:
          process_command(proginput.value);
      }
      proginput.value = '';
    }
};

function process_convo_command(command){
  var selection = parseInt(command);
  if(selection == game.conversationPrompts.length){
    game.mode = "";
    update_command_output("OK.<br><br>");
    return;
  }else{
    update_command_output(game.interact(game.playerid,game.receiverID,game.conversationPrompts[selection - 1]).replaceAll('\n','<br>')+"<br><br>");
  }
  update_location();
  update_command_output(">> " + command + "<br>");
  update_command_output(game.interact(game.playerid,game.receiverID,'talk').replaceAll('\n','<br>')+'<br><br>')
}

function process_fight_command(command){

}

function process_command(command){
  var words = command.split(" ");
  var nounWords = command.replace(words[0]+" ","");
  var verb = words[0];
  if (words.length >= 2){
    // is the noun here?
    var localthings = game.currentLocation.things.concat(get_local_npcs());
    for (const thingid of localthings){
      var thing = game.things[thingid];
      if (! thing.hidden){
        if(nounWords == thing.name){
          if (thing.get_interactions().includes(verb)){
            switch(verb){
              case 'go':
                game.go(thingid);
                update_location();
                break;
              case 'look':
                update_command_output(thing.look() + "<br><br>");
                break;
              case 'take':
                update_command_output(game.take(game.playerid,thingid,game.currentCoords) + "<br><br>");
                update_location();
                break;
              default:
                update_command_output(game.interact(game.playerid,thingid,verb).replaceAll('\n','<br>')+"<br><br>");
                update_location();
            }
          }
        }
      }
    }
    if (verb == 'put'){
      for(const thingid of game.things[game.playerid].things){
        var thing = game.things[thingid];
        if (nounWords == thing.name){
          update_command_output(game.put(game.playerid,thingid,game.currentCoords) + "<br><br>");
          update_location();
        }
      }
    }
  }
  if (verb == 'inventory'){
    var invout = game.things[game.playerid].name + "'s inventory:<br>";
    for(const thingid of game.things[game.playerid].things){
        invout += "- " + game.things[thingid].name + "<br>";
    }
    update_command_output(invout + "<br>");
  }
  update_command_output(">> " + command + "<br>");
}

function get_local_npcs(){
  var localnpcs = [];
  for(const npcid of game.npcs){
    if(game.currentCoords[0] == game.things[npcid].location[0] && game.currentCoords[1] == game.things[npcid].location[1]){
      localnpcs.push(npcid);
    }
  }
  return localnpcs;
}

function update_command_output(cmdout){
  var output = document.getElementById('gameoutput');
  output.innerHTML = cmdout + output.innerHTML;
}

function populate_game_picker(){
  var gameselector = document.getElementById('gamefilepicker');
  for (const gamefile of gamefiles){
    var opt = new Option;
    opt.value = gamefile;
    opt.innerHTML = gamefile;
    gameselector.appendChild(opt);
  }
}

function load_game(){
  var gameselector = document.getElementById('gamefilepicker');
  fetch(gameselector.value).then(response => response.text()).then(respText => start_game(respText));
}

function start_game(text){
  var jstuff = JSON.parse(text);
  game = new Game(jstuff);
  document.getElementById('gamename').innerHTML = game.name;
  document.getElementById('gamedescription').innerHTML = game.description;
  update_location();
}

function update_location(){
  var output = document.getElementById('locationdescription');
  output.innerHTML = game.location_description().replaceAll('\n','<br>');
}