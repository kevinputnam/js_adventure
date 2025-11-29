class Game {
  constructor(gameData){
    this.currentCoords = gameData.start;
    this.description = gameData.description;
    this.name = gameData.name;
    this.currentSection = gameData.sections["0"];
    this.currentLocation = this.currentSection.locations["0"];
    this.sections = gameData.sections;
    this.things = {};
    this.npcs = [];
    this.playerid = null;
    this.mode = "";
    this.conversationPrompts = [];
    this.receiverID = null;
    this.interactions = [];
    for (const [key,value] of Object.entries(gameData.things)){
      if ('isCharacter' in value){
        var character = new Character;
        character.load(value);
        this.things[key] = character
        if('isPlayer' in value){
          this.playerid = parseInt(key);
        }else{
          this.npcs.push(parseInt(key));
        }
      }else{
        var thing = new Thing;
        thing.load(value);
        this.things[key] = thing;
      }
    }
    for (const [key,value] of Object.entries(gameData.interactions)){
      var interaction = new Interaction;
      interaction.load(value);
      this.interactions[key] = interaction
    }
  }

  /*return string description of location*/
  location_description(){
    var description = 'You are in ' + this.currentLocation.name + ". ";
    description += this.currentLocation.description + "\n";
    return description + "\n";
  }

  /*return dictionary of things in location*/
  location_things(){
    var loc_things = {};
    for(const thingid of this.currentLocation.things){
      var thing = this.things[thingid];
      if (! thing.hidden){
        loc_things[thingid] = thing.name;
      }
    }
    for(const charid of this.npcs){
      var character = this.things[charid];
      if (character.location[0] == this.currentCoords[0] && character.location[1] == this.currentCoords[1]){
        loc_things[charid] = character.name;
      }
    }

    return loc_things;
  }

  /*return dictionary of things in player inventory*/
  player_inventory(){
    var inv_things = {};
    for(const thingid of this.things[this.playerid].things){
      inv_things[thingid] = this.things[thingid].name
    }
    return inv_things
  }

  go(thingid){
    if(this.things[thingid].go()){
      var locationCoords = this.things[thingid].go();
      var secid = locationCoords[0];
      var locid = locationCoords[1];
      if (secid in game.sections){
        if (locid in this.sections[secid].locations){
          this.currentSection = this.sections[secid];
          this.currentLocation = this.currentSection.locations[locid];
          this.currentCoords = locationCoords;
          return "Success";
        }
      }
    }
    return "You may want to rethink that.";
  }

  update_skill(receiverid,values){
    var receiver = this.things[receiverid];
    var skill = values[0];
    var operator = values[1];
    var change = values[2];

    if(operator == "+"){
      receiver.skills[skill] += change;
    }else if(operator == "-"){
      receiver.skills[skill] -= change;
    }
  }

  //set value of key object in receiving thing
  set(receiverid,key,value){
    if(key=="skills"){
      this.update_skill(receiverid,value);
    }else{
      this.things[receiverid].set(key,value);
    }
  }

  add_interactions(receiverid,ints){
    var receiver = this.things[receiverid];
    for (var i of ints){
      receiver.interactions.push(i);
    }
  }

  remove_interactions(receiverid,ints){
    var receiver = this.things[receiverid];
    for (var i of ints){
      var index = receiver.interactions.indexOf(i);
      if (index != -1){
        receiver.interactions.splice(index, 1);
      }
    }
  }

  add_interaction(receiverid,name,attrs){
    this.things[receiverid].add_interaction(name,attrs);
  }

  //remove from one inventory and put in the other
  exchange(initiatorid, receiverid, thingid){
    var initiator = this.things[initiatorid];
    var receiver = this.things[receiverid];
    if (initiator.things.includes(thingid)){
      receiver.things.push(thingid);
      var delIndex = initiator.things.indexOf(thingid);
      initiator.things.splice(delIndex,1);
    }
  }

  //take from location and put in initiator inventory
  take(initiatorid,thingid,locationCoords){
    var location
    if (locationCoords == null){
      location = this.currentLocation;
    } else{
      location = this.sections[locationCoords[0]].locations[locationCoords[1]];
    }
    if(location.things.includes(thingid)){
      var initiator = this.things[initiatorid];
      initiator.things.push(thingid);
      var delIndex = location.things.indexOf(thingid);
      location.things.splice(delIndex,1);
      var thing = this.things[thingid];
      if(thing.takeInteraction){
        this.interact(initiatorid,thingid,thing.takeInteraction);
      }
      return this.things[initiatorid].name + " takes " + thing.name + ".";
    }
    return "Um, no.";
  }

  //take from initiator inventory and put in location
  put(initiatorid,thingid,locationCoords){
    var location;
    var initiator = this.things[initiatorid];
    if (initiator.things.includes(thingid)){
      if (locationCoords == null){
        location = this.currentLocation;
      } else{
        location = this.sections[locationCoords[0]].locations[locationCoords[1]];
      }
      location.things.push(thingid);
      var delIndex = initiator.things.indexOf(thingid);
      initiator.things.splice(delIndex,1);
      return this.things[initiatorid].name + " puts " + this.things[thingid].name + ".";
    }
    return "Nope.";
  }

  talk(initiatorid,receiverid){
    this.mode = "talk";
    this.conversationPrompts = [];
    this.receiverID = receiverid;
    var output = "";
    var receiver = this.things[receiverid];
    var initiator = this.things[initiatorid];
    var promptCount = 0;
    for (var int_id of receiver.interactions){
      var value = this.interactions[int_id];
      var key = value.action;
      if (!value.hidden){
        if (value.name == "talk"){
          promptCount ++;
          this.conversationPrompts.push(key);
          output += promptCount + ". " + key + "\n";
        }
      }
    }
    if (output != ""){
      promptCount ++;
      this.conversationPrompts.push('Quit conversation.');
      output = "What do you want to say?\n" + output + promptCount + ". Quit conversation.";
    }
    return output;
  }

  fight(initiatorid,receiverid){
    this.mode = "fight";
  }

  //initiator does something to receiver
  interact(initiatorid, receiverid, interaction){
    switch(interaction){
      case 'talk':
        return this.talk(initiatorid,receiverid);
    }
    var action_out = "";
    var result_out = "";
    var initiator = this.things[initiatorid];
    var receiver = this.things[receiverid];
    var i = null;
    for (var int_id of receiver.interactions){
      var temp_i = this.interactions[int_id];
      if (temp_i.name == "talk"){
        if (temp_i.action == interaction){
          i = temp_i;
          action_out = 'You say, "' + i.action + '"';
          result_out = receiver.name + ' says, "' + i.description + '"';
        }
      }else{
        if (interaction == temp_i.name){
          i = temp_i;
          action_out = i.action;
          result_out = i.description;
        }
      }
    }
    var success = true;
    if (i == null){
      result_out =  "I'd rather not.";
    }else{
      if (i.interacted && i.interactOnce){
        result_out =  "Not again ...";
      } else {
        if (i.requires){
          var req = i.requires;
          if ((req[0] == "things")){
            if (! initiator.things.includes(req[1])){
              result_out = i.requiresFail;
              success = false;
            }
          }else if (req[0] == "skill"){
            if(! req[1] in initiator.skills || initiator.skills[req[1]] < req[2]){
              result_out = i.requiresFail;
              success = false;
            }
          }else if (req[0] == "attribute"){
            result_out = "Not yet implemented";
          }
        }
        if (success){
          if (i.effects){
            for (const e of i.effects){
              var emethod = e[0];
              var eargs = e[1];
                //call method with args on target thing
              this[emethod](...eargs);
            }
            i.interacted = true;
          }
        }

      }
    }
    return action_out + "<br>" + result_out;
  }

  get_interactions(thingid){
    var interactions = ['look'];
    if (this.things[thingid].canTake){
      interactions.push('take');
    }
    if (this.things[thingid].goesTo){
      interactions.push('go');
    }
    var talk = false;
    for (var id of this.things[thingid].interactions){
      var value = this.interactions[id];
      if(!value.hidden){
        if(value.name == "talk"){
          talk = true;
        }else{
          interactions.push(value.name);
        }
      }
    }
    if(talk){
      interactions.push('talk');
    }
    return interactions;
  }
}