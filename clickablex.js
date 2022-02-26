export default class ClickableX {
	constructor(x, y, length, color, hoverColor, weight) {
		this.x = x;
		this.y = y;
		this.length = length;
		this.color = color;
		this.hoverColor = hoverColor;
		this.weight = weight;

		this.currentColor = this.color;

		/*this.shape = [
			new Shape(color).setLine(x, y, x + length, y + length, weight),
			new Shape(color).setLine(x + length, y, x, y + length, weight)
		];*/
	}

	draw() {
		Renderer.drawLine(this.currentColor, this.x, this.y, this.x + this.length, this.y + this.length, this.weight)
		Renderer.drawLine(this.currentColor, this.x + this.length, this.y, this.x, this.y + this.length, this.weight)
	}

	hover(x, y) {
		if ((x > this.x && x < this.x + this.length) && (y > this.y && y < this.y + this.length)) {
			this.currentColor = this.hoverColor;
		}
		else {
			this.currentColor = this.color;
		}
	}

	clicked(x, y) {
		if ((x > this.x && x < this.x + this.length) && (y > this.y && y < this.y + this.length)) return true;
		else return false;
	}
}