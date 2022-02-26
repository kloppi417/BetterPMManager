export default class MessageIcon {
	constructor(x, y, scale) {
		this.x = x;
		this.y = y;
		this.scale = scale;

		this.emptyShape = new Shape(Renderer.color(186, 186, 186))

		this.msg = new Shape(Renderer.color(186, 186, 186))
			.setDrawMode(GL11.GL_POLYGON)
			.addVertex(x, (10 * scale) + y)
			.addVertex(x, y)
			.addVertex((10 * scale) + x, y)
			.addVertex((10 * scale) + x, (7 * scale) + y)
			.addVertex((3 * scale) + x, (7 * scale) + y)
		this.crossV = new Rectangle(Renderer.color(66, 135, 245), x + (7.5 * scale), y + (2 * scale), 2 * scale, 6 * scale);
		this.crossH = new Rectangle(Renderer.color(66, 135, 245), x + (5.25 * scale), y + (4.25 * scale), 6 * scale, 2 * scale);


	}

	draw() {
		//console.log(this.msg.getVertexes().length);
		//for (let i = 0; i < this.msg.getVertexes().length; i++) {
			//this.msg.removeVertex(i);
		//}
		this.msg = this.emptyShape;
		//console.log(this.msg.getVertexes().length);
		this.msg
			.addVertex(this.x, (10 * this.scale) + this.y)
			.addVertex(this.x, this.y)
			.addVertex((10 * this.scale) + this.x, this.y)
			.addVertex((10 * this.scale) + this.x, (7 * this.scale) + this.y)
			.addVertex((3 * this.scale) + this.x, (7 * this.scale) + this.y);
		this.msg.draw();

		this.crossV.x = this.x + (7.5 * this.scale);
		this.crossV.y = this.y + (2 * this.scale);
		this.crossV.draw();

		this.crossH.x = this.x + (5.25 * this.scale);
		this.crossH.y = this.y + (4.25 * this.scale);
		this.crossH.draw();
	}

	hover(x, y) {
		if ((x > this.x - 2 && x < this.x + (10 * this.scale)) && (y > this.y - 2 && y < this.y + (7.5 * this.scale))) this.emptyShape.color = Renderer.color(215, 215, 215); 
		else this.emptyShape.color = Renderer.color(186, 186, 186);
	}

	clicked(x, y) {
		if ((x > this.x - 2 && x < this.x + (30 * this.scale)) && (y > this.y - 2 && y < this.y + (15 * this.scale))) return true;
		else return false;
	}
}