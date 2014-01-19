function ApplicationWindow() {
	// ウィンドウを生成
	var win = Ti.UI.createWindow({
		backgroundColor: '#fff',
		title: 'myTODO'
	});

	// iOS用の大元となるウィンドウを生成
	var self = Ti.UI.iOS.createNavigationWindow({
		window: win
	});

	// 画面を生成
	var FirstView = require('ui/common/FirstView');
	var firstView = new FirstView();
	win.add(firstView);

	// 画面をレンダリング
	firstView.fireEvent('rendering', {
		display: 'incomplete'
	});

	return self;
}

module.exports = ApplicationWindow;