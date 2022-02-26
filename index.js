//----------------------------------------------
//--------------------IMPORTS-------------------
//----------------------------------------------
import FileUtilities from '../FileUtilities/main'
//import { removeRank } from "HypixelUtilities/utils";
import Settings from "./configfile";

import PlayerCard from "./playercard.js";
import MessageIcon from "./messageicon.js";
import Button from "./button.js";
import ClickableX from "./clickablex.js";
import InputBar from "./inputbar.js";



//------------------------------------------------
//--------------------CONSTANTS-------------------
//------------------------------------------------
const playerCardSidebarWidth = 165;
const gui = new Gui();
const typeableKeys = "`1234567890-=qwertyuiop[]asdfghjkl;'zxcvbnm,./ ~!@#$%^&*()_+QWERTYUIOP{}|ASDFGHJKL:\"ZXCVBNM<>?";
const nameableChars = "`1234567890-=qwertyuiop[]asdfghjkl;'zxcvbnm,./ ~!@#$%^&*()_+QWERTYUIOP{}|ASDFGHJKL:\"ZXCVBNM<>?";

const createConditionaly = (name, contents) => {
	if (FileUtilities.exists(`${dataFilePath}`)) return 1;
	FileLib.write(`${dataFilePath}`, contents)
	return 1;
}

const createDirectoryConditionally = (path) => {
	if (FileUtilities.exists(path)) return;
	FileUtilities.newDirectory(path);
	return;
};

createDirectoryConditionally(`${Config.modulesFolder}/BetterPMManager/MessageLogs`);

const jsonifiedTemplate = JSON.stringify(
	{
		messages: [

    	]
 	}
)

const channels = ["all", "guild", "party", "officer", "skyblock-coop"];


//------------------------------------------------
//--------------------VARIABLES-------------------
//------------------------------------------------
let dataFilePath = "";

//-----Player head-----
let playerHeads = [
	{
		name: Player.getName(),
		img: new Image(Player.getName() + "-head","https://www.mc-heads.net/avatar/" + Player.getName())
	}
];

createPlayerHeadImages();

//-----GUI Backgrounds-----
let guiBackground = new Rectangle(Renderer.color(0, 0, 0, 150), 0, 0, Renderer.screen.getWidth(), Renderer.screen.getHeight());
let playerCardsBackground = new Rectangle(Renderer.color(0, 0, 0, 100), 0, 0, playerCardSidebarWidth - 10, Renderer.screen.getHeight());
let prevScreenSize = {
	width: Renderer.screen.getWidth(),
	height: Renderer.screen.getHeight()
};

//-----Filters-----
//These technically shouldn't be constants so I have them in the variables section
//Filter functionality is not implemented yet
const messageFilter = "";
const cardsFilter = "";

//-----Player cards-----
let talkingTo = JSON.parse(FileLib.read(`${Config.modulesFolder}/BetterPMManager/playercards.json`)).selected;
let lastTalkingTo = JSON.parse(FileLib.read(`${Config.modulesFolder}/BetterPMManager/playercards.json`)).selected;
let scroll = 0;
let playerCardsScroll = 0;
let playerCards = PlayerCard.read(cardsFilter);

//-----Input bar-----
let inputRows = 1;
//let inputBar = new InputBar((playerCardSidebarWidth) + 25, Renderer.screen.getHeight() - 30, Renderer.screen.getWidth() - 200, 10000, typeableKeys);
let inputBars = playerCards.map((card) => {
	return {
		name: card.owner,  
		bar: new InputBar(playerCardSidebarWidth + 25, Renderer.screen.getHeight() - 32, Renderer.screen.getWidth() - 200, 10000, typeableKeys)
	};
});
let topOfBar = Renderer.screen.getHeight() - 30;

//-----Message rendering-----
let messageList;
let buildMessageArrBool = false;
let offscreenText = new Text("", Renderer.screen.getWidth(), -20);
//let offscreenText = new Text("", 0, 50)
offscreenText.setMaxLines(100);
let topMessageY;

//-----Error messages-----
//Should make these one variable and set the text property of the variable
let notOnlineText = new Text("That player is not online!",playerCardSidebarWidth + 25,Renderer.screen.getHeight() - 11);
let notOnlineTextAlpha = 0;
notOnlineText.setColor(Renderer.color(255,85,85,notOnlineTextAlpha));

let twoMessagesText = new Text("You cannot say the same message twice!",playerCardSidebarWidth + 25,Renderer.screen.getHeight() - 11);
let twoMessagesTextAlpha = 0;
twoMessagesText.setColor(Renderer.color(255,85,85,twoMessagesTextAlpha));

let halfSecondText = new Text("You can only send a message once every half second!",playerCardSidebarWidth + 25,Renderer.screen.getHeight() - 11);
let halfSecondTextAlpha = 0;
halfSecondText.setColor(Renderer.color(255,85,85,halfSecondTextAlpha));


//-----Top padding-----
let messageShape = new MessageIcon(playerCardSidebarWidth - 36,2,1.6);
let topPadding = new Rectangle(Renderer.color(50, 50, 50, 255), 0,0,Renderer.screen.getWidth(),20);

let infoText = new Text("BetterPMManager v1.0.0 by loppers", ((Renderer.screen.getWidth() - playerCardSidebarWidth) / 2) + playerCardSidebarWidth, 2).setAlign("center").setMaxWidth(120).setMaxLines(2).setColor(Renderer.color(150, 150, 150));

//-----New DM Screen-----
let newDMBg = guiBackground;
let creatingNewDM = false;
let newDMInput = "";
let newDMBox = new Rectangle(Renderer.color(50, 50, 50), 
	Renderer.screen.getWidth()/2 - 150, 
	Renderer.screen.getHeight()/2 - 35, 
	300, 
	70);
let newDMTitle = new Text("Enter the player you want to message:", newDMBox.x + 20, newDMBox.y + 10).setScale(1.3);
let newDMInputBox = new Rectangle(Renderer.color(0, 0, 30),newDMBox.x + 20, newDMBox.y + 30, 110, 20);
let newDMInputText = new Text(newDMInput, newDMBox.x + 30, newDMBox.y + 35);
let messageButton = new Button(newDMBox.x + 140, newDMBox.y + 30, 60, 20, Renderer.color(66, 135, 245), Renderer.color(47, 96, 173), "Message");
let cancelMessageButton = new Button(newDMBox.x + 210, newDMBox.y + 30, 60, 20, Renderer.color(150,150,150), Renderer.color(100,100,100), "Cancel");
let cantDMAlpha = 0;
let cantDMText = new Text("Cant dm!",100,100).setColor(Renderer.color(255, 85, 85, cantDMAlpha));

let requestingNewDM = false;
let justCreatedNewDM = false;

//-----Track what channel the player is in-----
let currentChannel = "all";

//-----Clear the input box-----
let clearChatX = new ClickableX(playerCardSidebarWidth + 25 - 15, Renderer.screen.getHeight() - 25, 10, Renderer.color(150,150,150), Renderer.color(225, 225, 225), 1);

//-----



//---------------------------------------------------
//--------------------GUI TRIGGERS-------------------
//---------------------------------------------------
gui.registerDraw((mouseX, mouseY, partialTicks) => {
	//inputRows = inputBar.textArr.length;

	guiBackground.width = Renderer.screen.getWidth();
	guiBackground.height = Renderer.screen.getHeight();
	newDMBg = guiBackground;
	guiBackground.draw();

	playerCardsBackground.width = playerCardSidebarWidth - 10;
	playerCardsBackground.height = Renderer.screen.getHeight();
	playerCardsBackground.draw();
	for (let card of playerCards) {
		if (!creatingNewDM) card.hover(mouseX, mouseY, playerCardsScroll);
		card.draw(playerCardsScroll);
	}

	notOnlineText.x = playerCardSidebarWidth + 25;
	notOnlineText.y = Renderer.screen.getHeight() - 11;
	if (notOnlineTextAlpha > 0) {
		notOnlineText.setColor(Renderer.color(255,85,85,notOnlineTextAlpha));
		notOnlineTextAlpha -= 1;
	}
	notOnlineText.draw();

	twoMessagesText.x = playerCardSidebarWidth + 25;
	twoMessagesText.y = Renderer.screen.getHeight() - 11;
	if (twoMessagesTextAlpha > 0) {
		twoMessagesText.setColor(Renderer.color(255,85,85,twoMessagesTextAlpha));
		twoMessagesTextAlpha -= 1;
	}
	twoMessagesText.draw();

	halfSecondText.x = playerCardSidebarWidth + 25;
	halfSecondText.y = Renderer.screen.getHeight() - 11;
	if (halfSecondTextAlpha > 0) {
		halfSecondText.setColor(Renderer.color(255,85,85,halfSecondTextAlpha));
		halfSecondTextAlpha -= 1;
	}
	halfSecondText.draw();

	for (let inputBar of inputBars) {
		if (inputBar.name === talkingTo) {
			inputBar.bar.draw();
			inputRows = inputBar.bar.textObj.getLines().length;
			topOfBar = inputBar.bar.background.y;
		}
	}

	renderMessages();

	topPadding.width = Renderer.screen.getWidth();
	topPadding.draw();

	infoText.x = ((Renderer.screen.getWidth() - playerCardSidebarWidth) / 2) + playerCardSidebarWidth;
	//infoText.x = Renderer.screen.getWidth() / 2;
	infoText.draw();

	if (!creatingNewDM) messageShape.hover(mouseX, mouseY);
	messageShape.x = playerCardSidebarWidth - 28;
	messageShape.y = 2;
	messageShape.draw();

	if (creatingNewDM) {
		//inputBar.selected = false;

		newDMBg.width = Renderer.screen.getWidth();
		newDMBg.height = Renderer.screen.getHeight();
		newDMBg.draw();

		newDMBox.x = Renderer.screen.getWidth()/2 - 150, 
		newDMBox.y = Renderer.screen.getHeight()/2 - 35,
		newDMBox.draw();

		newDMTitle.x = newDMBox.x + 20;
		newDMTitle.y = newDMBox.y + 10;
		newDMTitle.draw();

		newDMInputBox.x = newDMBox.x + 20;
		newDMInputBox.y = newDMBox.y + 30;
		newDMInputBox.draw();

		newDMInputText.string = newDMInput
		newDMInputText.x = newDMBox.x + 25
		newDMInputText.y = newDMBox.y + 37
		newDMInputText.draw();

		messageButton.x = newDMBox.x + 140;
		messageButton.y = newDMBox.y + 30;
		messageButton.hover(mouseX, mouseY);
		messageButton.draw();

		cancelMessageButton.x = newDMBox.x + 210;
		cancelMessageButton.y = newDMBox.y + 30
		cancelMessageButton.hover(mouseX, mouseY);
		cancelMessageButton.draw();

		if (cantDMAlpha > 0) {
			cantDMAlpha -= 1;
			cantDMText.setColor(Renderer.color(255, 85, 85, cantDMAlpha));
		}
		cantDMText.x = newDMInputBox.x;
		cantDMText.y = newDMInputBox.y + 25;
		cantDMText.draw();
	}

	clearChatX.x = (playerCardSidebarWidth + 25) - 15;
	clearChatX.y = Renderer.screen.getHeight() - 27;
	if (!creatingNewDM) clearChatX.hover(mouseX, mouseY);
	if (JSON.parse(FileLib.read(`${Config.modulesFolder}/BetterPMManager/playercards.json`)).selected !== "") clearChatX.draw();

});

gui.registerScrolled((mouseX, mouseY, dir) => {
	if (creatingNewDM) return;
	if (mouseX > playerCardSidebarWidth - 10) {
		let renderTextAtY = (Renderer.screen.getHeight() - (40 + (inputRows * 10))) + scroll; 
		if (dir === 1 && topMessageY + scroll < 0) scroll += 10;
		if (dir === -1 && renderTextAtY > topOfBar - 20) scroll -= 10;
	} else {
		if (dir === 1 && playerCardsScroll <= -10) playerCardsScroll += 10;
		if (dir === -1 && playerCardsScroll >= (playerCards.length * -40) + Renderer.screen.getHeight() - 10) playerCardsScroll -= 10;
	}
});

gui.registerClicked((x, y) => { //CLEAN THIS FUNCTION UP
	if (creatingNewDM) {
		if (messageButton.clicked(x, y) && newDMInput !== "") requestNewDM(newDMInput);
		if (cancelMessageButton.clicked(x, y)) {
			creatingNewDM = false;
			newDMInput = "";
		}
	} else {
		if (messageShape.clicked(x, y)) creatingNewDM = true;
		for (let inputBar of inputBars) if (inputBar.name === talkingTo) {
			if (inputBar.bar.clicked(x, y)) inputBar.bar.selected = true;
			else inputBar.bar.selected = false;
		}
		playerCards.forEach(element => element.clicked(x, y, playerCardsScroll));
		for (let inputBar of inputBars) if (inputBar.name === talkingTo) if (clearChatX.clicked(x, y)) {
			inputBar.bar.clear();
			inputBar.bar.selected = true;
		}
	}

	playerCards = PlayerCard.read(cardsFilter);
});

gui.registerKeyTyped((typedChar, keyCode) => {
	console.log(keyCode);
	if (!creatingNewDM) {
		let curInputBar;
		for (let inputBar of inputBars) if (inputBar.name === talkingTo) curInputBar = inputBar;
		if (keyCode >= 2 && keyCode <= 10 && !curInputBar.bar.selected) {
			let dataFilePath = `${Config.modulesFolder}/BetterPMManager/playercards.json`;
			let playerCardsObj = JSON.parse(FileLib.read(dataFilePath));
			if (keyCode - 1 <= playerCardsObj.cards.length) playerCardsObj.selected = playerCardsObj.cards[(playerCardsObj.cards.length - 1) - (keyCode - 2)];
			FileLib.write(dataFilePath,JSON.stringify(playerCardsObj));
			playerCards = PlayerCard.read(cardsFilter);
		}
		else if (curInputBar !== undefined) curInputBar.bar.typed(typedChar, keyCode);
		if (keyCode === 14) curInputBar.bar.delete();
		if (keyCode === 28 && curInputBar.bar.getText() !== "") {
			ChatLib.command(`msg ${talkingTo} ${curInputBar.bar.getText()}`);
			for (let inputBar of inputBars) if (inputBar.name === talkingTo) inputBar.bar.clear();
		}
	} else {
		if (nameableChars.indexOf(typedChar) !== -1) {
			if (newDMInput.length < 16) newDMInput += typedChar;
		} 
		else if (keyCode === 14) newDMInput = newDMInput.slice(0,-1);
		else if (keyCode === 28 && newDMInput !== "") requestNewDM(newDMInput);
		if (keyCode === 1) {
			gui.open();
			creatingNewDM = false;	
		}
	}
});

register("command", openGUI).setName("betterpm");
register("command", openGUI).setName("bpm");
register("command",() => { Settings.openGUI(); }).setName("betterpmm");

function openGUI(name) {
	gui.open();
	for (let inputBar of inputBars) if (inputBar.name === talkingTo) inputBar.bar.selected = true;
	if (name !== undefined) {
		let dataFilePath = `${Config.modulesFolder}/BetterPMManager/playercards.json`;
		let playerCardsObj = JSON.parse(FileLib.read(dataFilePath));
		if (playerCardsObj.cards.indexOf(name) !== -1) playerCardsObj.selected = name;
		FileLib.write(dataFilePath,JSON.stringify(playerCardsObj));
		playerCards = PlayerCard.read(cardsFilter);
	}
	buildMessageArr();
}




//------------------------------------------------------------
//--------------------REGEX-BASED FUNCTIONS-------------------
//------------------------------------------------------------

//-----Detect hypixel-formatted messages and log them-----
register("chat", (name, message, event) => { readMsg(name, message, event, "t") }).setCriteria("To ${name}: ${message}");;
register("chat", (name, message, event) => { readMsg(name, message, event, "f") }).setCriteria("From ${name}: ${message}");;

function readMsg(name, message, event, direction) {
	if (name === "stash") return;
	if (gui.isOpen() && Settings.hidedms) cancel(event);
	if (!gui.isOpen() && Settings.clickdms) {
		cancel(event);
		let msgToSend = new Message(new TextComponent(ChatLib.getChatMessage(event, true)).setClick("run_command","/betterpm " + removeRank(name).replace(" ","")));
		ChatLib.chat(msgToSend);
	}
	dataFilePath = `${Config.modulesFolder}/BetterPMManager/MessageLogs/${removeRank(name).replace(" ","")}.json`;
	createConditionaly(`${removeRank(name).replace(" ","")}.json`, jsonifiedTemplate);
	let messageList = JSON.parse(FileLib.read(dataFilePath));
	messageList.messages.push(
	{
		msg: message,
		dir: direction
	});
	createPlayerHeadImages();
	FileLib.write(dataFilePath, JSON.stringify(messageList));
	createNewPlayerCardConditionally(removeRank(name).replace(" ",""));
	reorderPlayerCards(removeRank(name).replace(" ",""));
	buildMessageArr();

	dataFilePath = `${Config.modulesFolder}/BetterPMManager/playercards.json`;
	let cards = JSON.parse(FileLib.read(dataFilePath));
	if (direction === "f") cards.unread.push(removeRank(name).replace(" ",""));
	FileLib.write(dataFilePath, JSON.stringify(cards));
}

//-----Error messages-----
register("chat", function (event) {
	if (gui.isOpen()) {
		if (requestingNewDM) cantOpenDM("That player is not online!", event);
		else notOnlineTextAlpha = 350;
		cancel(event);
	}
}).setCriteria("&cThat player is not online!&r");

register("chat", function (event) {
	if (gui.isOpen()) {
		twoMessagesTextAlpha = 350;
		cancel(event);
	}
}).setCriteria("&cYou cannot say the same message twice!&r");

register("chat", function (event) {
	if (gui.isOpen()) {
		halfSecondTextAlpha = 350;
		cancel(event);
	}
}).setCriteria("&cYou can only send a message once every half second!&r");

//-----Track what chat channel the player is in-----
register("chat", setChannel).setCriteria("&aYou are now in the &r&6${channel}&r&a channel&r");
register("chat", setChannel).setCriteria("&cYou are ${*}moved${*}to the ${channel} channel.&r");
register("chat", setChannel).setCriteria("&cThe conversation you were in expired and you have been moved back to the ${channel} channel.&r");

function setChannel(channel, event) {
	if (justCreatedNewDM) {
		cancel(event);
		justCreatedNewDM = false;
	}
	else if (creatingNewDM) cancel(event);
	else currentChannel = ChatLib.removeFormatting(channel.toLowerCase().replace(" ","-"));
}

register("chat", (player, event) => {
	if (justCreatedNewDM) {
		cancel(event);
		justCreatedNewDM = false;
	}
	else if (!requestingNewDM) {
		if (creatingNewDM) {
			cancel(event);
		}
		else currentChannel = ChatLib.removeFormatting(player);
	} else {
		createNewDM(player);
		cancel(event);
	}
}).setCriteria("&aOpened a chat conversation with &r${player}&a for the next 5 minutes. Use &r&b/chat a&r&a to leave&r");



//-----------------------------------------------------------------
//--------------------DISPLAY MESSAGES FUNCTIONS-------------------
//-----------------------------------------------------------------
function renderMessages() {
	let renderTextAtY = (Renderer.screen.getHeight() - (40 + (inputRows * 10))) + scroll;
	topMessageY = (Renderer.screen.getHeight() - (40 + (inputRows * 10)));
	if (buildMessageArrBool === true) {
		buildMessageArr();
		buildMessageArrBool = false;
	}

	talkingTo = JSON.parse(FileLib.read(`${Config.modulesFolder}/BetterPMManager/playercards.json`)).selected;
	if (talkingTo !== "") {
		if (talkingTo !== lastTalkingTo) {
			buildMessageArr();
			scroll = 0;
		}
		lastTalkingTo = talkingTo;

		for (let i = messageList.messages.length - 1; i > -1; i--) {
			let currentMsg = messageList.messages[i];
			if (currentMsg.msg.includes(messageFilter)) {
				nextDir = null;
				if (i !== 0) nextDir = messageList.messages[i - 1].dir;
				if (renderTextAtY <= Renderer.screen.getHeight() - (30 + (inputRows * 10)) && renderTextAtY > -40) Renderer.drawString(currentMsg.msg, (playerCardSidebarWidth) + 25, renderTextAtY);
				if (nextDir === currentMsg.dir && messageFilter === "") {
					renderTextAtY -= 10;
					topMessageY -= 10;
				}
				else {
					renderTextAtY -= 30;
					topMessageY -= 30;
					if (renderTextAtY <= Renderer.screen.getHeight() - (60 + (inputRows * 10)) && renderTextAtY > -40) {
						if (currentMsg.dir === "t") {
							Renderer.drawString("&l" + Player.getName(),(playerCardSidebarWidth) + 25,renderTextAtY + 20);

							let headToDraw = playerHeads.filter(head => head.name === Player.getName());
							headToDraw[0].img.draw(playerCardSidebarWidth,renderTextAtY + 20,20,20);
						}
						if (currentMsg.dir === "f") {
							Renderer.drawString("&l" + talkingTo,(playerCardSidebarWidth) + 25,renderTextAtY + 20);

							let headToDraw = playerHeads.filter(head => head.name === talkingTo);
							headToDraw[0].img.draw(playerCardSidebarWidth,renderTextAtY + 20,20,20);
						}
					}
				}
			}
		}

		if (prevScreenSize.width !== Renderer.screen.getWidth() || prevScreenSize.height !== Renderer.screen.getHeight()) {
			for (let inputBar of inputBars) {
				inputBar.bar.x = (playerCardSidebarWidth) + 25;
				inputBar.bar.y = Renderer.screen.getHeight() - 32;
				inputBar.bar.width = Renderer.screen.getWidth() - 200;
				//inputBar.resize();
			}
			buildMessageArr();

		}
		prevScreenSize = {
			width: Renderer.screen.getWidth(),
			height: Renderer.screen.getHeight()
		}
	}
}

function buildMessageArr() {
	if (talkingTo === "") return;
	dataFilePath = `${Config.modulesFolder}/BetterPMManager/MessageLogs/${talkingTo}.json`;
	messageList = JSON.parse(FileLib.read(dataFilePath));
	let output = [];
	let msgArr = [];


	offscreenText.setMaxWidth(Renderer.screen.getWidth() - playerCardSidebarWidth - 40);
	for (const item of messageList.messages) {
		if (item.msg.length * 32 < Renderer.screen.getWidth() * 0.6) {
			msgArr.push( {msg: item.msg, dir: item.dir} );
		} else {
			offscreenText.string = item.msg;
			offscreenText.draw();
			offscreenText.getLines().forEach(element => msgArr.push({msg: element, dir: item.dir}))
		}
	}
	messageList.messages = msgArr;
}

function createPlayerHeadImages() {
	let logs = FileUtilities.listFiles(`${Config.modulesFolder}/BetterPMManager/MessageLogs`);
	for (let log of logs) { 
		if (!log.includes(".DS_Store")) { //I HATE CODING ON A MAC :C WHY DOES IT MAKE THESE FILES
			if (log.includes("/")) log = log.substring(log.lastIndexOf("/") + 1,log.lastIndexOf(".json"));
			if (log.includes("\\")) log = log.substring(log.lastIndexOf("\\") + 1,log.lastIndexOf(".json"));
			if (playerHeads.filter(head => head.name === log).length === 0) {
				playerHeads.push(
					{
						name: log,
						img: new Image(log + "-head","https://www.mc-heads.net/avatar/" + log)
					}
				)
			}
		}
	}
}



//------------------------------------------------------------
//--------------------PLAYER CARD FUNCTIONS-------------------
//------------------------------------------------------------
function reorderPlayerCards(top) {
	let cardsJSONObj = JSON.parse(FileLib.read(`${Config.modulesFolder}/BetterPMManager/playercards.json`));
	cardsJSONObj.cards.splice(cardsJSONObj.cards.indexOf(top),1);
	cardsJSONObj.cards.push(top);
	FileLib.write(`${Config.modulesFolder}/BetterPMManager/playercards.json`,JSON.stringify(cardsJSONObj));
	playerCards = PlayerCard.read(cardsFilter);
}

function createNewPlayerCardConditionally(owner) { //this name thoooooooo
	let cardsJSONObj = JSON.parse(FileLib.read(`${Config.modulesFolder}/BetterPMManager/playercards.json`));
	if (!cardsJSONObj.cards.includes(owner)) {
		cardsJSONObj.cards.push(owner);
		inputBars.push({
			name: owner,  
			bar: new InputBar(playerCardSidebarWidth + 25, Renderer.screen.getHeight() - 32, Renderer.screen.getWidth() - 200, 10000, typeableKeys)
		});
	}
	FileLib.write(`${Config.modulesFolder}/BetterPMManager/playercards.json`,JSON.stringify(cardsJSONObj));
	playerCards = PlayerCard.read(cardsFilter);
}



//-------------------------------------------------------
//--------------------NEW DM FUNCTIONS-------------------
//-------------------------------------------------------

function requestNewDM(player) {
	requestingNewDM = true;
	ChatLib.command(`msg ${player}`);
}

function createNewDM(player) {
	if (player === "stash") return;
	player = ChatLib.removeFormatting(removeRank(player).replace(" ",""));
	creatingNewDM = false;
	requestingNewDM = false;
	let alreadyHasBar = false;
	for (let inputBar of inputBars) if (inputBar.name === player) alreadyHasBar = true;
	if (!alreadyHasBar) {
		inputBars.push({
			name: player,  
			bar: new InputBar(playerCardSidebarWidth + 25, Renderer.screen.getHeight() - 32, Renderer.screen.getWidth() - 200, 10000, typeableKeys)
		});
	}
	for (let inputBar of inputBars) if (inputBar.name === player) inputBar.bar.selected = true;
	dataFilePath = `${Config.modulesFolder}/BetterPMManager/MessageLogs/${player}.json`;
	createConditionaly(`${player}.json`, jsonifiedTemplate);
	createPlayerHeadImages();
	createNewPlayerCardConditionally(player);
	buildMessageArr();

	dataFilePath = `${Config.modulesFolder}/BetterPMManager/playercards.json`
	let cards = JSON.parse(FileLib.read(dataFilePath));
	cards.selected = player;
	FileLib.write(dataFilePath, JSON.stringify(cards));

	newDMInput = "";

	if (channels.includes(currentChannel)) ChatLib.command(`chat ${currentChannel}`);
	else ChatLib.command(`msg ${currentChannel}`);
	justCreatedNewDM = true;
}

register("chat",(player, event) => {
	cantOpenDM(`Can't find a player by the name of '${player}'`, event);
}).setCriteria("&cCan't find a player by the name of '${player}'&r");

register("chat",(event) => {
	cantOpenDM("You cannot message this player.", event);
}).setCriteria("&cYou cannot message this player.&r");

function cantOpenDM(error, event) {
	if (requestingNewDM) {
		cancel(event);
		newDMInput = "";
		cantDMText.string = error;
		cantDMAlpha = 350;
		requestingNewDM = false;
	}
}

//--------------------------------------------------------
//--------------------UTILITY FUNCTIONS-------------------
//--------------------------------------------------------
function removeRank(name) {
	name = ChatLib.removeFormatting(name);
	return name.slice(name.lastIndexOf("]") + 1, name.length);
}



