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
    this.interactions = {};
    this.takeInteraction = null;
    this.goInteraction = null;
    this.location=[];
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
    var interactions = ['look'];
    if (this.canTake){
      interactions.push('take');
    }
    if (this.goesTo){
      interactions.push('go');
    }
    var talk = false;
    for (const [key,value] of Object.entries(this.interactions)){
      if(value.type == "talk"){
        talk = true;
      }else{
        interactions.push(key);
      }
    }
    if(talk){
      interactions.push('talk');
    }
    return interactions;
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
    this.type = "";
  }

  load(properties){
    for (const[key,value] of Object.entries(properties)){
      this[key] = value;
    }
  }
}