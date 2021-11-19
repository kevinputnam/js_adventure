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
  }

  location_description(){
    var description = 'You are in ' + this.currentLocation.name + ". ";
    description += this.currentLocation.description + "\n";
    description += '\nYou see: \n\n'
    for(const thingid of this.currentLocation.things){
      var thing = this.things[thingid];
      if (! thing.hidden){
        description += "- (" + thingid + ") " + thing.name;
        var interactions = thing.get_interactions;
        for(const interaction of thing.get_interactions()){
          description += " [" + interaction + "] ";
        }
        description += "\n";
      }
    }
    for(const charid of this.npcs){
      var character = this.things[charid];
      if (character.location[0] == this.currentCoords[0] && character.location[1] == this.currentCoords[1]){
        description += "- (" + charid + ") " + character.name;
        for(const interaction of character.get_interactions()){
          description += " [" + interaction + "] ";

        }
        description += "\n";
      }
    }
    return description + "\n";
  }

  go(thingid){
    if(this.things[thingid].go()){
      var locationCoords = this.things[thingid].go();
      console.log(locationCoords);
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

  //set value of key object in receiving thing
  set(receiverid,key,value){
    this.things[receiverid].set(key,value);
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
      console.log(thingid);
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
    for (const [key,value] of Object.entries(receiver.interactions)){
      if (value.type == "talk"){
        promptCount ++;
        this.conversationPrompts.push(key);
        output += promptCount + ". " + key + "\n";
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
    var initiator = this.things[initiatorid];
    var receiver = this.things[receiverid];
    if (interaction in receiver.interactions){
      var i = receiver.interactions[interaction];
    }else{
      return "I'd rather not.";
    }

    if (i.interacted){
      return "Not again ...";
    } else {
      if (i.requires){
        var req = i.requires;
        if ((req[0] == "things")){
          if (! initiator.things.includes(req[1])){
            return i.requiresFail;
          }
        }else if (req[0] == "skill"){
          if(! req[1] in initiator.skills || initiator.skills[req[1]] < req[2]){
            return i.requiresFail;
          }
        }else if (req[0] == "attribute"){
          return "Not yet implemented";
        }
      }
      if (i.effects){
        for (const e of i.effects){
          var emethod = e[0];
          var eargs = e[1];
            //call method with args on target thing
          this[emethod](...eargs);
        }
        i.interacted = true;
        return i.action + " " + i.description;
      }
    }
  }
}
