String.prototype.splice = function(start, delCount, newSubStr) {
	if (delCount === 0) {
		if (start === -1) return this + newSubStr;
		if (start < -1) start++;
	}
    return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));
};

export default class InputBar {
	constructor(x, y, width, charLimit, allowedChars, noInputMsg) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.charLimit = charLimit;
		this.allowedChars = allowedChars;
		this.noInputMsg = noInputMsg;

		this.text = "";

		this.background = new Rectangle(Renderer.color(0, 0, 30), x, y, width, 20);

		this.textObj = new Text("", Renderer.screen.getWidth() + 20, Renderer.screen.getHeight() + 20);
		this.textObj.setMaxWidth(this.width - 20);
		this.textObj.setMaxLines(100);

		this.temp = new Text("", Renderer.screen.getWidth() + 20, Renderer.screen.getHeight() + 20);

		this.inputIndex = 0;
		this.cursorIndicator = new Rectangle(Renderer.color(255,255,255), x, y, 1, 12);

		this.lines;
		this.lineIndex = 0;

	}

	draw() {
		this.background.x = this.x;
		this.background.y = this.y - ((this.textObj.getLines().length - 1) * 10);
		this.background.width = this.width;
		this.background.height = 20 + ((this.textObj.getLines().length - 1) * 10);
		this.background.draw();
		//console.log(this.background.height);

		this.textObj.x = Renderer.screen.getWidth() + 20;
		this.textObj.y = Renderer.screen.getHeight() + 20;
		this.textObj.setMaxWidth(this.width - 20);
		this.textObj.string = this.text;
		this.textObj.draw();

		this.lines = this.textObj.getLines().map((line, index) => {
			if (index === this.textObj.getLines().length - 1) return line;
			this.temp.string = line + this.textObj.getLines()[index + 1].slice(0,1);
			this.temp.draw();
			if (this.temp.getWidth() < this.width - 20) line = line + " ";
			return line;
		});

		this.lineIndex = 0;
		let temp = this.inputIndex;
		let done = false;
		for (let line of this.lines) {
			if (temp > line.length && !done) {
				temp -= line.length;
				this.lineIndex++;
			} else done = true;
		}

		let y = this.y + 15 - (9 * this.lines.length);
		for (let line of this.lines) {
			Renderer.drawString(line, this.background.x + 5, y);
			y += 9;
		}

		this.temp.string = this.lines[this.lineIndex].substring(0, temp);
		this.temp.x = Renderer.screen.getWidth() + 20;
		this.temp.y = Renderer.screen.getHeight() + 20;
		this.temp.draw();

		this.cursorIndicator.x = this.background.x + 5 + this.temp.getWidth();
		this.cursorIndicator.y = this.background.y + 4 + (9 * this.lineIndex);
		if (this.selected) this.cursorIndicator.draw();

		
	}

	typed(char, keycode) {
		this.selected = true;

		switch (keycode) {
			case 200: //up arrow
				determinePlace(1, this);
				break;
			case 203:
				this.inputIndex--;
				break;
			case 205:
				this.inputIndex++;
				break;
			case 208:
				determinePlace(-1, this);
				break;

		}

		if (this.inputIndex < 0) this.inputIndex = 0;
		if (this.inputIndex > this.text.length) this.inputIndex = this.text.length;

		if (this.allowedChars.indexOf(char) !== -1 && !(this.text.slice(-1) === " " && ChatLib.removeFormatting(char) === " ")) {
			this.text = this.text.splice(this.inputIndex, 0, char);
			this.inputIndex++;
		}
	}

	delete() {
		if (this.textObj.getLines().length === 1 && this.inputIndex === 0) return;
		this.text = this.text.substring(0, this.inputIndex - 1) + this.text.substring(this.inputIndex,this.text.length);
		this.inputIndex--;
	}

	clear() {
		this.text = "";
		this.inputIndex = 0;
	}

	clicked(x,y) {
		if ((x > this.background.x && x < this.background.x + this.background.width) && (y > this.background.y && y < this.background.y + this.background.height)) {
			let tempY = this.y + 24 - (9 * this.lines.length);
			let lineClicked = 0;
			while (tempY < y && lineClicked < this.lines.length - 1) {
				lineClicked++;
				tempY += 9;
			}

			let lineCharArr = this.lines[lineClicked].split("");
			let clickedChar = 0;
			this.temp.string = "";
			for (let char of lineCharArr) {
				this.temp.string += char;
				this.temp.draw();
				if (x - (this.background.x + 5) > this.temp.getWidth()) clickedChar++;
			}

			this.inputIndex = 0;
			for (let i = 0; i < lineClicked; i++) {
				this.inputIndex += this.lines[i].length;
			}
			this.inputIndex += clickedChar;

			if (clickedChar !== this.lines[lineClicked].length) {
				console.log(clickedChar);
				console.log(this.lines[lineClicked].length);
				this.temp.string = this.lines[lineClicked].slice(0,clickedChar);
				this.temp.draw();
				x -= (this.background.x + 5) + this.temp.getWidth();
				this.temp.string = this.lines[lineClicked].slice(clickedChar, clickedChar + 1);
				this.temp.draw();
				if (x > this.temp.getWidth() / 2) this.inputIndex++;
			}



			//console.log(`clickedChar: ${clickedChar}, lineClicked: ${lineClicked}`);

			return true;
		} else return false;
	}

	getText() {
		return this.text;
		this.inputIndex = 0;
	}
}

function determinePlace(dir, obj) {//.....idek wtf this function is
	if (dir === 1 && obj.lineIndex === 0) return;
	if (dir === -1 && obj.lineIndex === obj.lines.length - 1) return;
	let temp = obj.inputIndex;
	let done = false;
	for (let line of obj.lines) {
		if (temp > line.length && !done) {
			temp -= line.length;
		} else done = true;
	}
	obj.temp.string = obj.lines[obj.lineIndex].slice(0,temp);
	obj.temp.draw();
	const width = obj.temp.getWidth();
	const lineCharArr = obj.lines[obj.lineIndex - dir].split("");

	done = false;
	obj.temp.string = "";
	for (let char of lineCharArr) {
		if (!done) {
			obj.temp.string += char;
			obj.temp.draw();
			if (obj.temp.getWidth() > width) done = true;
		}
	}
	obj.temp.string = obj.temp.string.slice(0, obj.temp.string.length - 1); //dk why but its getting an extra char soooooo
	if (dir === 1) {
		obj.inputIndex -= (temp + obj.lines[obj.lineIndex - dir].length);
		obj.inputIndex += obj.temp.string.length;
	}
	if (dir === -1) {
		obj.inputIndex -= temp;
		obj.inputIndex += (obj.temp.string.length + obj.lines[obj.lineIndex].length);
		if (obj.inputIndex === obj.lines.join("").length - 1) obj.inputIndex = obj.lines.join("").length;
	}

}