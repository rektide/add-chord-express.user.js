// ==UserScript==
// @description Twiddler Tuner Add Chord Express - add chords in no time
// @include http://twiddler.tekgear.com/tuner/config.xhtml
// @downloadURL https://raw.githubusercontent.com/rektide/twiddler-tuner-add-chord-express/master/add-chord-express.pb
// @version 1.0
// @namespace com.voodoowarez
// ==/UserScript==

// So I had like 100 key mappings to enter. There's an old human readable .ini format for 
// Twiddler mappings, but I have no idea if those old files are usable or convertible
// into the Twiddler 3 era.

// The web page editor makes you manually click from step, and this script automates the process:
// 1. Click 'add new chord' button
// 2. Click the chord mapping text area to focus on it
// 3. Type your desired output
// 4. Click the chord you want to map from
// 5. Click 'apply' to set
// 6. Wait for page to reload then start again.

// Add Chord Express attempts to add a new binding every page load, and adds
// a shortcut control-space to apply the current binding (& go to the next)

var DELAY = 300

// Page keeps changing elements out from under us, so build a getter
// for everything we'll want
var el= {
  add: "form:addRowButton2",
  edit: "form:chordsDataTable:0:editChordButtonId",
  mapping: "keyMappingForm:keyMapping",
  insertSpecial: "keyMappingForm:insertSpecialKeyCommandButton",
  apply: "keyMappingForm:applyChord"
}
for(var i in el){
	var id= el[i]
	el[i]= document.getElementById.bind(document, id)
}
el.specialSelect = function(){
	return document.getElementById("keyMappingForm:keyMappingPanel").querySelector("select")
}

// edit the first chord in the chords table, focus on in it's mapping
function editChord(){
	el.edit().click()
	setTimeout(function(){
		el.mapping().focus()
	}, DELAY)
}

function delayedAddChord(){
	setTimeout(editChord, DELAY)
}
// next time we would add a chord, don"t
// some ui controls (insert special char) will cause reloads that we don't want to immediately 
// begin editing a new chord-mapping in
function skipNextAdd(){
	GM_setValue("skipNextAdd", 1)
	GM_log("skipping next add:"+GM_getValue("skipNextAdd"))
}

// Cleanup the special character, which if present would skip our addBlock on start
function clearSpecial(){	
	el.specialSelect().value = ""
}
// if we do anything else, it'll blow up our binding by repainting over all controls
// keep rebinding the controls we care about
function bindAll(){
	var add = el.add()
	// we don't know whether the binding exists now or not- maybe wiped out since last or maybe not
	// so remove possible bindings, set one binding
	add.removeEventListener("click", delayedAddChord)
	add.addEventListener("click", delayedAddChord)

	// This codepath doesnt work in Scriptish- GM_setValue doesn't seem to endure reloads
	//var insertSpecial= el.insertSpecial()
	//insertSpecial.removeEventListener("click", skipNextAdd)
	//insertSpecial.addEventListener("click", skipNextAdd)

	var apply = el.apply()
	apply.removeEventListener("click", clearSpecial)
	apply.addEventListener("click", clearSpecial)
}
setInterval(bindAll, 350)
bindAll()

// Control-Space
// Apply the current in progress mapping, advance to next to add
document.addEventListener('keydown', function(e){
	if(e.keyCode !== 32 || !e.ctrlKey) return
	e.preventDefault()
	el.apply().click()
})

// add a chord as soon as page starts. We kind of have to do this, since 'apply'
// jumps to a new page and we need _something_ to get us back to making the next
// mapping
var skip = GM_getValue("skipNextAdd") || el.specialSelect().value
if(!skip){
	GM_log("add:"+skip)
	el.add().click()
}else{
	// unless we're told not to 
	GM_log("we skipped:"+skip)
	GM_deleteValue("skipNextAdd")
}
