class Game {
  constructor(gameData){
    this.currentSection = gameData.sections["0"];
    this.currentLocation = this.currentSection.locations["0"];
    this.sections = gameData.sections;
    this.things = {};
    this.npcs = [];
    this.player = null;
    for (const [key,value] of Object.entries(gameData.things)){
      if ('isCharacter' in value){
        var character = new Character;
        character.load(value);
        this.things[key] = character
        if('isPlayer' in value){
          this.player = parseInt(key);
        }else{
          this.npcs.push(parseInt(key));
        }
      }
        var thing = new Thing;
        thing.load(value);
        this.things[key] = thing;
    }
  }

  //set value of key object in receiving thing
  set(receiver,key,value){
    this.things[receiver].set(key,value);
  }

  //remove from one inventory and put in the other
  exchange(initiatorid, receiverid, thingid){
    var initiator = this.things[initiatorid];
    var receiver = this.things[receiverid];
    if (initiator.inventory.includes(thingid)){
      receiver.inventory.push(thingid);
      var delIndex = initiator.inventory.indexOf(thingid);
      initiator.inventory.splice(delIndex,1);
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
      initiator.inventory.push(thingid);
      var delIndex = location.things.indexOf(thingid);
      location.things.splice(delIndex,1);
    }

  }

  //take from initiator inventory and put in location
  put(initiatorid,thingid,locationCoords){
    var location;
    var initiator = this.things[initiatorid];
    if (initiator.inventory.includes(thingid)){
      console.log(thingid);
      if (locationCoords == null){
        location = this.currentLocation;
      } else{
        location = this.sections[locationCoords[0]].locations[locationCoords[1]];
      }
      location.things.push(thingid);
      var delIndex = initiator.inventory.indexOf(thingid);
      initiator.inventory.splice(delIndex,1);
    }
  }

  //initiator does something to receiver
  interact(initiator, receiver, interaction){
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
        if ((req[0] == "inventory")){
          if (! initiator.inventory.includes(req[1])){
            return i.requiresFail;
          }
        }else if (req[0] == "skill"){
          return "Not yet implemented.";
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
        return i.action + "\n" + i.description;
      }
    }
  }
}
