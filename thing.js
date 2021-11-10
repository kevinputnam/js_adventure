class Thing {
  constructor() {
    this.id = null;
    this.name = null;
    this.hidden = false;
    this.description = null;
    this.canTake = false;
    this.locks = false;
    this.goesTo = null;
    this.isAttack = false;
    this.fight = false;
    this.prompts = [];
    this.responses = [];
    this.inventory = {};
    this.interactions = {};
  }

  load(properties){
    for (const [key,value] of Object.entries(properties)){
      this[key] = value;
    }
    if (! this.name || ! this.description) {
      return false;
    }
  }

  set(key,value){
    this[key] = value;
  }

  look(){
    return this.description;
  }

  interact(interaction, inventory, things){
    if (interaction in this.interactions){
      console.log("Interaction: " + interaction);
      var i = this.interactions[interaction];
    }else{
      return "I'd rather not.";
    }

    if (i.interacted){
      return "Not again ...";
    } else {
      if (i.requires){
        console.log("ToDo");
      }
      if (i.effects){
        for (const e of i.effects){
          var eid = e[0];
          var emethod = e[1];
          var eargs = e[2];
          if (eid in things){
            i.interacted = true;
            //call method with args on target thing
            things[eid][emethod](...eargs);
            return i.action + "\n" + i.description;
          }
        }
      }
    }
  }

  go(){
    return this.goesTo;
  }
}