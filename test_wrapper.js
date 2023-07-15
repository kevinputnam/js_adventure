var game;

var gamefiles = ['test.json'];

document.onkeypress = function (e) { //basically the game loop
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
      update_ui();
    }
};

function process_convo_command(command){
  var selection = parseInt(command);
  update_command_output(">> " + command + "<br>");
  if(selection == game.conversationPrompts.length){
    game.mode = "";
    update_command_output("OK.<br><br>");
    return;
  }else{
    update_command_output(game.interact(game.playerid,game.receiverID,game.conversationPrompts[selection - 1]).replaceAll('\n','<br>')+"<br><br>");
  }
  update_command_output(game.interact(game.playerid,game.receiverID,'talk').replaceAll('\n','<br>')+'<br><br>')
}

function process_fight_command(command){

}

function process_command(command){
  var words = command.split(" ");
  var nounWords = command.replace(words[0]+" ","");
  var verb = words[0];
  update_command_output(">> " + command + "<br>");
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
                break;
              case 'look':
                var out_str = thing.look() + " ";
                for(const inter_str of thing.get_interactions()){
                  out_str += "[" + inter_str + "] "
                }
                update_command_output(out_str + "<br><br>");
                break;
              case 'take':
                update_command_output(game.take(game.playerid,thingid,game.currentCoords) + "<br><br>");
                break;
              default:
                update_command_output(game.interact(game.playerid,thingid,verb).replaceAll('\n','<br>')+"<br><br>");
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
        }
      }
    }
  }
  if (verb == 'inventory'){
    var invout = game.things[game.playerid].name + "'s inventory:<br>";
    for(const[key,value] of Object.entries(game.player_inventory())){
      invout += "- " + value + "<br>";
    }
    update_command_output(invout + "<br>");
  }
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
  output.innerHTML = output.innerHTML + cmdout;
  output.scrollTop = output.scrollHeight
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
  update_ui();
}

function update_ui(){
  update_location();
  update_command_prompt();
}

function update_command_prompt(){
  var proginput = document.getElementById('commandline');
  switch(game.mode){
    case 'talk':
    case 'fight':
      proginput.placeholder="Enter command: [integer selection]";
      break;
    default:
      proginput.placeholder="Enter command: [verb] [noun]";
  }
}

function update_location(){
  var output = document.getElementById('locationdescription');
  var loc_desc = ""
  loc_desc += game.location_description()
  output.innerHTML = loc_desc;
  var thingDiv = document.getElementById('locationthings');
  console.log(thingDiv);
  var playerDiv = document.getElementById('playerstuff');
  console.log(playerDiv)
  var loc_things = "You see:<br><br>";
  for(const[key,value] of Object.entries(game.location_things())){
    loc_things += "- " + value + "<br>";
  }
  thingDiv.innerHTML = loc_things;
  var player_stuff = game.things[game.playerid].name + "'s stuff:<br><br>"
  for(const[key,value] of Object.entries(game.player_inventory())){
    player_stuff += "- " + value + "<br>"
  }
  playerDiv.innerHTML = player_stuff;
}