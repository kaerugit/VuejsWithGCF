# vue.js + Google Cloud Storage firebase(database)サンプル

## 動くサンプル
https://vuetest-d36fd.firebaseapp.com/  
入力して確定したものがfirebaseのdatabaseに登録される  
登録したデータを検索することも可  
（全世界に公開されているので、変なデータは入力しないで下さい）  

## vue.js
元ネタ  
https://github.com/kaerugit/VuejsTableInput  
から拝借（ちょっと改造）   
※Vueの内容については上記プロジェクトを参考してください。  

## 動かしてみたい人へ
firebaseでプロジェクトを作成しdatabase(firebase realtime databaseを使用)を登録  

functions フォルダに  
config.json を新規追加し(const config = require("./config.json"))  
firebaseで取得できる以下情報を張り付けて下さい。  
{  
    "apiKey": "xxx",  
    "authDomain": "xxx",  
    "databaseURL": "xxx",  
    "projectId": "xxx",  
    "storageBucket": "xxx",  
    "messagingSenderId": "xxx"  
}  

その後  
cd functions  
npm update  

ローカルでの動作確認  
firebase serve　

## 見どころ
ほどんどfirebaseのテンプレ  

(nodejs)  
functions  
 index.js  

(vue.js)  
public内  
 sampleフォルダ内  

