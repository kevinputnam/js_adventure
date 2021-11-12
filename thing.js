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
    this.inventory = [];
    this.interactions = {};
  }

  load(properties){
    for (const [key,value] of Object.entries(properties)){
      if(key == "interactions"){
        this.load_interactions(value);
      }else{
        this[key] = value;
      }
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

  go(){
    return this.goesTo;
  }

  get_interactions(){
    return Object.keys(this.interactions);
  }

  load_interactions(ints){
    for (const [key,value] of Object.entries(ints)){
      var i = new Interaction;
      i.load(value);
      this.interactions[key] = i;
    }
  }
}

class Interaction {
  constructor(){
    this.interacted = false;
    this.action = "";
    this.requires = null;
    this.requiresFail = "";
    this.effects = [];
    this.description = "";
  }

  load(properties){
    for (const[key,value] of Object.entries(properties)){
      this[key] = value;
    }
  }
}