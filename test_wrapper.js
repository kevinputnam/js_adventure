var allthings = {}
var currentSection;
var currentLocation;

fetch("test.json").then(response => response.text()).then(respText => do_something(respText));

function do_something(text){
    var stuff = JSON.parse(text);
    currentSection = stuff.sections["0"];
    currentLocation = currentSection.locations["0"];
    for (const [key,value] of Object.entries(stuff.things)){
        var thingy = new Thing;
        thingy.load(value);
        allthings[key] = thingy;
    }
    console.log(allthings);
}

class Location {
    constructor(){
        this.thingIDs = [];
        this.description = '';
        this.name = '';
    }

    load(properties){
        this.thingIDs = properties.things;
        this.description = properties.description;
        this.name = properties.name;
    }

    describe(){
        return this.description;
    }

}