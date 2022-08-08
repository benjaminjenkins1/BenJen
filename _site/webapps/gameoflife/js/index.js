'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var width = 18;
var height = 9;
var board = 'board9';
var size = 'sm';
var interval = 200;
var newState = [];
var intervalID;
buildState();

function Square(props) {
	return React.createElement(
		'button',
		{ className: props.className, onClick: function onClick() {
				return props.onClick();
			} },
		' '
	);
}
function StepButton(props) {
	return React.createElement(
		'button',
		{ className: 'start btn btn-primary', onClick: function onClick() {
				return props.onClick();
			} },
		'Step'
	);
}
function StartButton(props) {
	return React.createElement(
		'button',
		{ className: 'start btn btn-primary', onClick: function onClick() {
				return props.onClick();
			} },
		'Start'
	);
}
function ResizeButton(props) {
	return React.createElement(
		'button',
		{ className: 'resize btn btn-primary', onClick: function onClick() {
				return props.onClick();
			} },
		'Resize'
	);
}
function SpeedButton(props) {
	return React.createElement(
		'button',
		{ className: 'resize btn btn-primary', onClick: function onClick() {
				return props.onClick();
			} },
		'Change Speed'
	);
}
function StopButton(props) {
	return React.createElement(
		'button',
		{ className: 'resize btn btn-primary', onClick: function onClick() {
				return props.onClick();
			} },
		'Stop'
	);
}

var Board = function (_React$Component) {
	_inherits(Board, _React$Component);

	function Board(props) {
		_classCallCheck(this, Board);

		var _this = _possibleConstructorReturn(this, _React$Component.call(this, props));

		_this.state = {
			board: newState,
			timer: null
		};
		return _this;
	}

	Board.prototype.renderSquare = function renderSquare(val, num) {
		var _this2 = this;

		return React.createElement(Square, { className: val, value: num, onClick: function onClick() {
				return _this2.handleClick(num);
			} });
	};

	Board.prototype.renderStepButton = function renderStepButton() {
		var _this3 = this;

		return React.createElement(StepButton, { onClick: function onClick() {
				return _this3.handleStep();
			} });
	};

	Board.prototype.renderStartButton = function renderStartButton() {
		var _this4 = this;

		return React.createElement(StartButton, { onClick: function onClick() {
				return _this4.handleStart();
			} });
	};

	Board.prototype.renderResizeButton = function renderResizeButton() {
		var _this5 = this;

		return React.createElement(ResizeButton, { onClick: function onClick() {
				return _this5.resizeBoard();
			} });
	};

	Board.prototype.renderSpeedButton = function renderSpeedButton() {
		var _this6 = this;

		return React.createElement(SpeedButton, { onClick: function onClick() {
				return _this6.changeSpeed();
			} });
	};

	Board.prototype.renderStopButton = function renderStopButton() {
		var _this7 = this;

		return React.createElement(StopButton, { onClick: function onClick() {
				return _this7.stop();
			} });
	};

	Board.prototype.handleClick = function handleClick(num) {
		if (newState[num] == 'empty') {
			newState[num] = 'new';
		} else if (newState[num] == 'new') {
			newState[num] = 'old';
		} else {
			newState[num] = 'empty';
		}
		this.updateState();
	};

	Board.prototype.updateState = function updateState() {
		this.setState(function (prevState) {
			return { board: newState };
		});
	};

	Board.prototype.handleStep = function handleStep() {
		this.tick();
	};

	Board.prototype.handleStart = function handleStart() {
		this.tick();
		intervalID = setInterval(this.tick.bind(this), interval);
	};

	Board.prototype.changeSpeed = function changeSpeed() {
		switch (interval) {
			case 200:
				clearInterval(intervalID);
				interval = 100;
				intervalID = setInterval(this.tick.bind(this), interval);
				break;
			case 100:
				clearInterval(intervalID);
				interval = 50;
				intervalID = setInterval(this.tick.bind(this), interval);
				break;
			case 50:
				clearInterval(intervalID);
				interval = 200;
				intervalID = setInterval(this.tick.bind(this), interval);
				break;
		}
	};

	Board.prototype.stop = function stop() {
		clearInterval(intervalID);
	};

	Board.prototype.tick = function tick() {
		var neighbors = 0;
		var newNewState = newState.slice();
		for (var i = 0; i < newState.length; i++) {
			neighbors = countNeighbors(i);
			if (newState[i] == 'new') {
				newNewState[i] = 'old';
			}
			if (newState[i] == 'new' || newState[i] == 'old') {
				if (neighbors < 2) {
					newNewState[i] = 'empty';
				}
				if (neighbors == 2 || neighbors == 3) {
					newNewState[i] = 'old';
				}
				if (neighbors > 3) {
					newNewState[i] = 'empty';
				}
			}
			if (newState[i] == 'empty' && neighbors == 3) {
				newNewState[i] = 'new';
			}
		}
		newState = newNewState.slice();
		this.updateState();
	};

	Board.prototype.resizeBoard = function resizeBoard() {
		if (size == 'sm') {
			width = 36;
			height = 18;
			board = 'board18';
			size = 'med';
		} else if (size == 'med') {
			width = 70;
			height = 30;
			board = 'board27';
      size = 'lg';
		} else if (size == 'lg') {
			width = 18;
			height = 9;
			board = 'board9';
			size = 'sm';
		}
		buildState();
		this.updateState();
	};

	Board.prototype.render = function render() {
		var _this8 = this;

		var toRender = this.state.board.map(function (val, num) {
			return _this8.renderSquare(val, num);
		});
		return React.createElement(
			'div',
			null,
			React.createElement(
				'div',
				{ className: board },
				toRender
			),
			this.renderStartButton(),
			this.renderSpeedButton(),
			this.renderStepButton(),
			this.renderStopButton(),
			this.renderResizeButton()
		);
	};

	return Board;
}(React.Component);

function countNeighbors(i) {
	var num = 0;
	//left and right
	if ((newState[i + 1] == 'new' || newState[i + 1] == 'old') && (i + 1) % width !== 0) {
		num++;
	}
	if ((newState[i - 1] == 'new' || newState[i - 1] == 'old') && i % width !== 0) {
		num++;
	}
	//above & below
	if (newState[i + width] == 'new' || newState[i + width] == 'old') {
		num++;
	}
	if (newState[i - width] == 'new' || newState[i - width] == 'old') {
		num++;
	}
	//top-right
	if ((newState[i - width + 1] == 'new' || newState[i - width + 1] == 'old') && (i + 1) % width !== 0) {
		num++;
	}
	//top-left
	if ((newState[i - width - 1] == 'new' || newState[i - width - 1] == 'old') && i % width !== 0) {
		num++;
	}
	//botom-right
	if ((newState[i + width + 1] == 'new' || newState[i + width + 1] == 'old') && (i + 1) % width !== 0) {
		num++;
	}
	//bottom-left
	if ((newState[i + width - 1] == 'new' || newState[i + width - 1] == 'old') && i % width !== 0) {
		num++;
	}
	return num;
}
function buildState() {
	newState = [];
	for (var i = 0; i < width * height; i++) {
		newState.push('empty');
	}
}

ReactDOM.render(React.createElement(Board, null), document.getElementById('game-container'));
