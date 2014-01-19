// moment.jsを読み込み
var Moment = require('/libs/moment');

function FirstView() {
	// 土台となるビューを生成
	var self = Ti.UI.createView();

	// タスクリストの初期表示（未完了）
	var display = 'incomplete';

	// タスクリストのテーブルビューを生成
	var tableView = Ti.UI.createTableView({
		top: 0,
		right: 0,
		bottom: 0,
		left: 0
	});
	self.add(tableView);

	// 長押しイベントを登録（削除）
	tableView.addEventListener('longpress', function(e){
		// 最初の行はタスク登録フィールドなので無視
		if (e.index === 0) {
			return;
		}

		var index = e.index;
		var id = e.rowData.id;
		// 確認用ダイアログを生成
		var dialog = Ti.UI.createOptionDialog({
			cancel: 1,
			options: ['タスクを削除', 'キャンセル']
		});
		dialog.show();

		// 確認ダイアログのタップイベントを登録
		dialog.addEventListener('click', function(e){
			// キャンセルの場合は削除処理を終了
			if (e.index === 1) {
				return;
			}

			// データベースを更新（削除フラグを立てる）
			var db = Ti.Database.open('myTODO');
			db.execute('UPDATE todos SET deleted_at = ? WHERE id = ?',
				Moment().format('YYYY-MM-DD HH:mm:ss'),
				id);
			db.close();

			// 対象のタスクの行をリストから削除
			tableView.deleteRow(index);
		});
	});

	// スワイプイベントを登録（完了/未完了）
	tableView.addEventListener('swipe', function(e){
		// 最初の行はタスク登録フィールドなので無視
		if (e.index === 0) {
			return;
		}

		var index = e.index;
		var id = e.rowData.id;

		// 対象のタスクをデータベースから参照して、完了/未完了のどちらかをチェック
		var db = Ti.Database.open('myTODO');
		var result = db.execute('SELECT done ' +
			'FROM todos ' +
			'WHERE id = ? ' +
			'AND deleted_at = \'0000-00-00 00:00:00\'', id);

		if (!result.isValidRow()) {
			result.close();
			db.close();

			return;
		}

		var done = false;
		if (result.fieldByName('done') === 1) {
			done = true;
		}

		result.close();
		db.close();

		// 確認ダイアログを生成
		var dialog = Ti.UI.createOptionDialog({
			cancel: 1,
			options: done ? ['未完了に戻す', 'キャンセル'] : ['タスクを完了', 'キャンセル']
		});
		dialog.show();

		// 確認ダイアログのタップイベントを登録
		dialog.addEventListener('click', function(e){
			// キャンセルの場合は削除処理を終了
			if (e.index === 1) {
				return;
			}

			// データベースを更新（完了/未完了フラグを立てる）
			var db = Ti.Database.open('myTODO');
			db.execute('UPDATE todos SET done = ? WHERE id = ?',
				done ? 0 : 1,
				id);
			db.close();

			// リストを再描画
			self.fireEvent('rendering');
		});
	});

	// 画面の描画イベント
	self.addEventListener('rendering', function(e){
		// タスクリストの格納するための配列を初期化
		var rows = [];

		// タスク登録フィールドを配列へ追加
		rows.push(createAddRow(self));

		// データベースからタスクリストを取得
		var done = '';
		display = e.display || display;
		switch (display) {
			case 'incomplete':
				done = 'AND done = 0 ';
				break;
			case 'complete':
				done = 'AND done = 1 ';
				break;
		}

		var db = Ti.Database.open('myTODO');
		var result = db.execute('SELECT id, task, done, created_at ' +
			'FROM todos ' +
			'WHERE deleted_at = \'0000-00-00 00:00:00\' ' +
			done +
			'ORDER BY id ASC');

		while (result.isValidRow()) {
			// タスクリストを配列へ追加
			rows.push(createTaskRow(result));
			result.next();
		}

		result.close();
		db.close();

		// テーブルビューへタスクリストをセット
		tableView.setData(rows);
	});

	return self;
}

// 入力フィールド生成関数
function createAddRow(parent) {
	// 入力フィールドの行を生成
	var self = Ti.UI.createTableViewRow({
		width: Ti.UI.FILL,
		height: 44,
		id: 'add'
	});

	// 入力フィールドを生成
	var textField = Ti.UI.createTextField({
		right: 60,
		left: 0,
		width: Ti.UI.FILL,
		height: 44,
		hintText: 'New task'
	});
	self.add(textField);

	// 登録ボタンを生成
	var addButton = Ti.UI.createButton({
		right: 0,
		width: 60,
		height: 44,
		title: '登録'
	});
	self.add(addButton);

	// 登録ボタンをタップした際のイベントを登録
	addButton.addEventListener('click', function(){
		// 入力チェック
		if (textField.getValue() === '') {
			// 入力フィールドが空の場合、エラーのダイアログを表示
			var dialog = Ti.UI.createAlertDialog({
				title: 'エラー',
				message: '新しいタスクを入力してください'
			});
			dialog.show();
			return;
		}

		// データベースへタスクを登録
		var db = Ti.Database.open('myTODO');
		db.execute('INSERT INTO todos (task, created_at) VALUES (?, ?)',
			textField.getValue(),
			Moment().format('YYYY-MM-DD HH:mm:ss'));
		db.close();

		// タスクリストの再描画イベントを発火
		parent.fireEvent('rendering');
	});

	return self;
}

// タスクリスト生成関数
function createTaskRow(row) {
	// タスクリストの行を生成
	var self = Ti.UI.createTableViewRow({
		width: Ti.UI.FILL,
		height: 44,
		id: row.fieldByName('id')
	});

	// タスク内容のラベルを生成
	self.add(Ti.UI.createLabel({
		top: 4,
		left: 15,
		color: '#000',
		text: row.fieldByName('task')
	}));

	// タスク登録日のラベルを生成
	self.add(Ti.UI.createLabel({
		bottom: 4,
		left: 15,
		color: '#ccc',
		font: {
			fontSize: 12
		},
		text: Moment(row.fieldByName('created_at')).format('YYYY-MM-DD HH:mm')
	}));

	// 完了タスクの場合チェックマークを表示
	if (row.fieldByName('done')) {
		self.add(Ti.UI.createLabel({
			right: 10,
			color: '#ccc',
			font: {
				fontSize: 12
			},
			text: '✓'
		}));
	}

	return self;
}

module.exports = FirstView;