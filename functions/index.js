//const request = require('request');
const admin = require("firebase-admin");
const config = require("./config.json");

const firebaseConfig = {
  databaseURL: config.databaseURL
};
admin.initializeApp(firebaseConfig);


const functions = require('firebase-functions');

//初期処理（都道府県のデータを取得できるが、遅いので呼ばれていません。（javascriptでjsonを直に取得））
//こういった使い方はNGっぽい
exports.Init = functions.https.onRequest(async (request, response) => {

  let db = admin.database();

  await db.ref("/todofuken").once("value", (snapshot) => {
    let jsonList = JSON.parse(snapshot.val());

    let jsonReturn = {};
    jsonReturn["todofuken"] = jsonList;
    //response.writeHead(200,{'Content-Type':'application/json;charset=utf-8'});
    response.json(jsonReturn);

  });

});


//検索
exports.Search = functions.https.onRequest(async (request, response) => {

  let db = admin.database();


  //全く関係ないソース(いたずらデータ防止処理)
  let now = new Date();
  let last = '';

  await db.ref("/lastupdate").once("value", (snapshot) => {

    snapshot.forEach((children) => {
      last = children.val();
      return;
    });

  }
  );


  let testDataInsert = false;
  if (last == null || last.length == 0) {
    testDataInsert = true;
  }
  else {
    let compereDate = new Date(last);
    let msDiff = now.getTime() - compereDate.getTime();
    let daysDiff = Math.floor(msDiff / (1000 * 60 * 60 * 24));

    //最後から二日たっている場合初期化（変なデータをクリアするため）
    if (daysDiff > 2) {
      testDataInsert = true;
    }
  }

  if (testDataInsert == true) {
    await db.ref("/lastupdate").update({ last: now });

    await db.ref("/data").set({});

    //テスト用データ再作成
    let data = '';

    data = '{"11111":{"扶養家族区分": [1], "性別区分": 1, "都道府県CD": "34", "市区町村CD": "", "社員コード": "11111", "社員名": "テスト　太郎", "入社年月日": "2000/04/01 00:00:00"}}';
    await db.ref("/data").update(JSON.parse(data));

    data = '{"11112":{"扶養家族区分": [1], "性別区分": 1, "都道府県CD": "34", "市区町村CD": "", "社員コード": "11112", "社員名": "テスト　太郎2", "入社年月日": "2000/04/01 00:00:00"}}';
    await db.ref("/data").update(JSON.parse(data));

    //削除
    //data = '{"11112":null}';
    //db.ref("/data").update(JSON.parse(data));

  }
  //全く関係ないソース(いたずらデータ防止処理)　終

  let jsonList = [];
  await db.ref("/data").once("value", (snapshot) => {

    snapshot.forEach((children) => {
      let json = children.val();

      //配列の[]が消えるので別途制御（突き詰めるとこういった細かい制御必要となってくる）
      if (json["扶養家族区分"] == null) {
        json["扶養家族区分"] = []
      }
      jsonList.push(json);
    });

  });

  //条件（既にjsonになっている模様）
  let whereItem = request.body;

  //条件のフィルタ
  jsonList = jsonList.filter(
    function (item) {
      let findFlag = true;

      if (findFlag == true && whereItem.社員コード && whereItem.社員コード.length > 0) {
        if (item.社員コード == whereItem.社員コード) {
          findFlag = false;
        }
      }

      if (findFlag == true && whereItem.社員名 && whereItem.社員名.length > 0) {
        if (item.社員名.indexOf(whereItem.社員名) == -1) {
          findFlag = false;
        }
      }

      if (findFlag == true && whereItem.都道府県CD && whereItem.都道府県CD.toString().length > 0) {
        if (item.都道府県CD != whereItem.都道府県CD) {
          findFlag = false;
        }
      }

      if (findFlag == true && whereItem.都道府県CD複数 && whereItem.都道府県CD複数.length > 0) {
        //都道府県CD複数(or検索)
        let todofukenFind = false;
        for (let itemtodofuken in whereItem.都道府県CD複数) {
          if (item.都道府県CD == whereItem.都道府県CD複数[itemtodofuken]) {
            todofukenFind = true;
            break;
          }
        }
        findFlag = todofukenFind;
      }

      return findFlag;
    }
  );

  let jsonReturn = {};
  jsonReturn["search"] = jsonList;
  response.json(jsonReturn);


});

//確定
exports.Submit = functions.https.onRequest(async (request, response) => {
  let db = admin.database();

  let json = request.body;

  //console.log(json);

  for (let item in json) {
    let data = '';

    //削除の場合はnullをセット
    if (json[item]["DELETE_FLAG"] == true) {
      data = '{"' + json[item]["社員コード"] + '":null}';

    }
    //追加
    else if (json[item]["UPDATE_FLAG"] == true) {
      //とりあえず勝手に追加した項目の削除
      delete json[item]["DELETE_FLAG"];
      delete json[item]["UPDATE_FLAG"];
      delete json[item]["ERROR_FLAG"];
      delete json[item]["IDENTITY_ID"];
      delete json[item]["NEW_FLAG"];

      data = '{"' + json[item]["社員コード"] + '":' + JSON.stringify(json[item]) + '}';
    }

    //更新
    if (data.length > 0) {
      await db.ref("/data").update(JSON.parse(data));
    }
  }


  let jsonReturn = {};
  response.json(jsonReturn);

});
