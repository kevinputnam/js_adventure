class Character extends Thing {
  constructor() {
    super();
    this.hp = 10;
    this.actions = 1;
    this.fight = true;
    this.alive = true;
    this.abilities = {'strength':3 ,'stamina':3 ,'agility':3,'reaction':3,'intelligence':3,'logic':3,'personality':3,'leadership':3};
  }

  load(properties){
    super.load(properties);
  }
}