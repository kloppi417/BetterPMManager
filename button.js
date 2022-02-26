export default class Button {
	constructor(x, y, width, height, color, hoverColor, label) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.color = color;
		this.hoverColor = hoverColor;
		this.label = new Text(label, this.width/2 + this.x, this.height/2 + this.y - 4).setAlign("center");

		this.background = new Rectangle(this.color, this.x, this.y, this.width, this.height);
		this.hovered = false;
	}

	draw() {
		this.background.x = this.x;
		this.background.y = this.y;
		this.label.x = this.width/2 + this.x;
		this.label.y = this.height/2 + this.y - 4;
		
		this.background.color = (this.hovered)? this.hoverColor : this.color;
		this.background.draw();
		this.label.draw();
	}

	hover(x, y) {
		if ((x > this.x && x < this.x + this.width) && (y > this.y && y < this.y + this.height)) this.hovered = true;
		else this.hovered = false;
	}

	clicked(x, y) {
		if ((x > this.x && x < this.x + this.width) && (y > this.y && y < this.y + this.height)) return true;
		else return false;
	}
}