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
    this.things = [];
    this.interactions = [];
    this.takeInteraction = null;
    this.goInteraction = null;
    this.location=[];
    this.image= null;
  }

  load(properties){
    for (const [key,value] of Object.entries(properties)){
      this[key] = value;
    }
    if (! this.name || ! this.description) {
      return false;
    }
  }

  add_interaction(name,attrs){
    var i = new Interaction;
    i.load(attrs);
    this.interactions[name] = i;
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
    this.id =null;
    this.interactOnce = true;
    this.interacted = false;
    this.action = "";
    this.requires = null;
    this.requiresFail = "";
    this.effects = [];
    this.description = "";
    this.type = "";
    this.hidden = false;
  }

  load(properties){
    for (const[key,value] of Object.entries(properties)){
      this[key] = value;
    }
    if (this.id == null){
      console.log("Interaction must have id.");
      console.log(this);
    }
  }
}