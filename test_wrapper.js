var game;
var gamefiles = ['test.json'];

help_output = `You can enter "help" at any time to see this message.<br>
<br>
Most of the time you can interact with the game world by using a simple [noun] [verb] construction. If you "look" at something, the output will include the list of verbs that can be used with it. For example:<br>
<br>
<blockquote>
\>\> look sign<br>
It says something in a strange language. If only you could read it. [look] [read]</blockquote>
Some verbs will work almost all the time, like "look". Others are associated with the object. "read" in this case.<br>
<br>
When you're in a conversation, the game expects you to enter the index of the item in the menu you'd like to choose:<br>

<blockquote>
\>\> talk Uncle<br>
What do you want to say?<br>
1. say, "How are you?"<br>
2. say, "Can I go to the cellar?"<br>
3. Quit conversation.<br>
<br>
\>\> 1<br>
You say, "How are you?"<br>
He says, "Well, I'd be better if you made dinner."</blockquote>
The "help" command should work all the time (even in conversation mode).`

document.onkeypress = function (e) { //basically the game loop
    if (e.keyCode == 0x0D){ //return key
      var proginput = document.getElementById('commandline');
      update_command_output(">> " + proginput.value + "<br>");
      if (proginput.value.startsWith('help')){
        print_game_help(proginput.value);
      } else {
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
      }
      proginput.value = '';
      update_ui();
    }
};

function print_game_help(command){
  update_command_output(help_output + "<br><br>");
}

function process_convo_command(command){
  var selection = parseInt(command);
  if(selection == game.conversationPrompts.length){
    game.mode = "";
    update_command_output('You leave the converstaion.<br><br>');
    return;
  }else{
    update_command_output('You ' + game.conversationPrompts[selection -1] + '<br>');
    update_command_output(game.interact(game.playerid,game.receiverID,game.conversationPrompts[selection - 1]).replaceAll('\n','<br>')+"<br><br>");
  }
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
          if (game.get_interactions(thingid).includes(verb)){
            switch(verb){
              case 'go':
                game.go(thingid);
                break;
              case 'talk':
                game.interact(game.playerid,thingid,verb);
                break
              case 'look':
                var out_str = thing.look() + " ";
                for(const inter_str of game.get_interactions(thingid)){
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

function update_graphics_display(image_path){
  var graphics_div = document.getElementById('graphicsdisplay');
  if (image_path) {
    graphics_div.innerHTML = '<img style="height: 100%;width: 100%;object-fit:contain;" src="' + image_path + '"/>';
  }else {
    graphics_div.innerHTML = ''
  }
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
  var descDiv = document.getElementById('currentdescription');
  var choiceDiv = document.getElementById('currentchoices');
  var playerDiv = document.getElementById('playerstuff');

  switch(game.mode){
  case 'talk':
    descDiv.innerHTML = "You are talking to " + game.things[game.receiverID].name;
    choiceDiv.innerHTML = game.interact(game.playerid,game.receiverID,'talk').replaceAll('\n','<br>')+'<br><br>';
    break
  case 'fight':
    console.log("Not Implemented.")
    break
  default:
    descDiv.innerHTML = game.location_description();
    var loc_things = "You see:<br><br>";
    for(const[key,value] of Object.entries(game.location_things())){
      loc_things += "- " + value + "<br>";
    }
    choiceDiv.innerHTML = loc_things;
  }
  var player_stuff = game.things[game.playerid].name + "'s stuff:<br><br>"
  for(const[key,value] of Object.entries(game.player_inventory())){
    player_stuff += "- " + value + "<br>"
  }
  playerDiv.innerHTML = player_stuff;
}