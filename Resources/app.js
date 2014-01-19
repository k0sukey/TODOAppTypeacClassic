if (Ti.version < 1.8) {
  alert('Sorry - this application template requires Titanium Mobile SDK 1.8 or later');
}

(function() {
  // 初回起動時にデータベースを生成
  var db = Ti.Database.open('myTODO');
  db.execute('CREATE TABLE IF NOT EXISTS todos (' +
    'id INTEGER PRIMARY KEY, ' +
    'task TEXT NOT NULL, ' +
    'done NUMERIC DEFAULT 0 NOT NULL, ' +
    'created_at TEXT DEFAULT \'0000-00-00 00:00:00\' NOT NULL, ' +
    'deleted_at TEXT DEFAULT \'0000-00-00 00:00:00\' NOT NULL' +
    ')');
  db.close();

  var Window;
  // iOS/Androidで処理を振り分け
  if (Ti.Platform.osname === 'android') {
    Window = require('/ui/handheld/android/ApplicationWindow');
  } else {
    Window = require('/ui/handheld/ApplicationWindow');
  }
  new Window().open();
})();