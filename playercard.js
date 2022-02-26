export default class PlayerCard {
	constructor(x, y, owner) {
		this.x = x;
		this.y = y;
		this.width = 155;
		this.height = 40;
		this.owner = owner;

		this.img = new Image(owner + "-head", "https://www.mc-heads.net/avatar/" + owner);
		this.background = new Rectangle(Renderer.color(0, 0, 0, 100), x, y, this.width, 40);
		this.hoverBackground = new Rectangle(Renderer.color(0, 0, 0, 50), x, y, this.width, 40);
		this.selected = false;
		this.imgWidth = 20;
		this.imgHeight = 20;
		this.ownerText = new Text(owner, this.x + 35, this.y + 17.5);

		this.xShapeColor = Renderer.color(150,150,150);
		this.isHovered = false;

		this.unreadCircle = new Shape(Renderer.color(255,85,85)).setCircle(this.x + 30, (this.y + (this.imgHeight/2)) + 20, 3, 360);
	}

	draw(yOffset) {
		let dataFilePath = `${Config.modulesFolder}/BetterPMManager/playercards.json`;
		let playerCards = JSON.parse(FileLib.read(dataFilePath));
		this.background.width = 155
		this.y += yOffset;
		this.ownerText.y += yOffset;
		this.background.y += yOffset;
		if (playerCards.selected === this.owner) {
			this.background.draw();
			if (playerCards.unread.includes(this.owner)) {
				playerCards.unread.splice(playerCards.unread.indexOf(this.owner),1);
				FileLib.write(dataFilePath, JSON.stringify(playerCards));
			}
		}
		this.y -= yOffset;
		this.img.draw(this.x + 10, (this.y + (this.imgHeight/2)) + yOffset, this.imgWidth, this.imgHeight);
		this.ownerText.draw();
		if (this.isHovered) {
			Renderer.drawLine(
				this.xShapeColor,
				this.x + 135,
				this.y + (this.height/2) - 5,
				this.x + 145,
				this.y + (this.height/2) + 5,
				1
			);
			Renderer.drawLine(
				this.xShapeColor,
				this.x + 135,
				this.y + (this.height/2) + 5,
				this.x + 145,
				this.y + (this.height/2) - 5,
				1
			)
		}
		this.ownerText.y -= yOffset;
		this.background.y -= yOffset;
		if (playerCards.unread.includes(this.owner)) this.unreadCircle.draw();
	}

	clicked(x, y, yOffset) {
		this.y += yOffset;
		if ((x > this.x + 133 && x < this.x + 148)&& (y > this.y + (this.height/2) - 8 && y < this.y + (this.height/2) + 8)) {
			this.close();
		}
		else if ((x > this.x && x < 155) && (y > this.y && y < this.y + 40)) {
			let dataFilePath = `${Config.modulesFolder}/BetterPMManager/playercards.json`;
			let cards = JSON.parse(FileLib.read(dataFilePath));
			cards.selected = this.owner;
			FileLib.write(dataFilePath, JSON.stringify(cards));
		}
		this.y -= yOffset;
	}

	hover(x, y, yOffset) {
		this.y += yOffset;
		if ((x > this.x && x < this.width) && (y > this.y && y < this.y + 40)) {
			this.hoverBackground.y = this.y;
			let dataFilePath = `${Config.modulesFolder}/BetterPMManager/playercards.json`;
			let cards = JSON.parse(FileLib.read(dataFilePath));
			if (cards.selected !== this.owner) {
				this.hoverBackground.draw();
			}
			if ((x > this.x + 133 && x < this.x + 148)&& (y > this.y + (this.height/2) - 8 && y < this.y + (this.height/2) + 8)) {
				this.xShapeColor = Renderer.color(225,225,225);
			} else {
				this.xShapeColor = Renderer.color(150,150,150);
			}
			this.isHovered = true;
		} else this.isHovered = false;
		this.y -= yOffset;
	}

	close() {
		let dataFilePath = `${Config.modulesFolder}/BetterPMManager/playercards.json`;
		let cards = JSON.parse(FileLib.read(dataFilePath));
		if (this.owner === cards.selected) cards.selected = cards.cards[cards.cards.length - 1];
		cards.selected = "";
		cards.cards.splice(cards.cards.indexOf(this.owner),1);
		FileLib.write(dataFilePath, JSON.stringify(cards));
	}

	static read(filter) {
		let output = [];
		let playerCards = JSON.parse(FileLib.read(`${Config.modulesFolder}/BetterPMManager/playercards.json`));
		for (let i = 0; i < playerCards.cards.length; i++) {
			if (playerCards.cards[i].includes(filter)) {
				output.push(new PlayerCard(0, (((playerCards.cards.length - 1) - i) * 40) + 20, playerCards.cards[i]));
			}
		}
		return output;
	}
}