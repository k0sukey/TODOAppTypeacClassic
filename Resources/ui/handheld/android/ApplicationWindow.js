function ApplicationWindow() {
	// ウィンドウを生成
	var self = Ti.UI.createWindow({
		backgroundColor:'#ffffff',
		title: 'myTODO',
		windowSoftInputMode: Ti.UI.Android.SOFT_INPUT_ADJUST_PAN,
		exitOnClose: true
	});

	// アクションバーのボタンを生成
	self.activity.onCreateOptionsMenu = function(e){
		var incomplete = e.menu.add({
			title: '未完了',
			showAsAction: Ti.Android.SHOW_AS_ACTION_ALWAYS
		});
		incomplete.addEventListener('click', function(){
			// 画面を描画
			firstView.fireEvent('rendering', {
				display: 'incomplete'
			});
		});

		var complete = e.menu.add({
			title: '完了',
			showAsAction: Ti.Android.SHOW_AS_ACTION_ALWAYS
		});
		complete.addEventListener('click', function(){
			// 画面を描画
			firstView.fireEvent('rendering', {
				display: 'complete'
			});
		});

		var all = e.menu.add({
			title: '全て',
			showAsAction: Ti.Android.SHOW_AS_ACTION_ALWAYS
		});
		all.addEventListener('click', function(){
			// 画面を描画
			firstView.fireEvent('rendering', {
				display: 'all'
			});
		});
	};

	// 画面を生成
	var FirstView = require('ui/common/android/FirstView');
	var firstView = new FirstView();
	self.add(firstView);

	// 画面をレンダリング
	firstView.fireEvent('rendering', {
		display: 'incomplete'
	});

	return self;
}

module.exports = ApplicationWindow;