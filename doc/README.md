# DoraScript Language Specification

Version 0.0.1

## Basic Concepts

DoraScriptは、コミュケーションロボット用のスクリプトです。

下記は、スライドをめくりながら解説をするスクリプトの例です。

```
みなさん、こんにちは。
それでは、サイエンス講座を始めたいと思います。

今回は、夕焼けの話です。

/quiz.slide/images/sunset/002.jpeg

夕焼けは、日没の頃に西の空が赤く見える現象のことです。


/quiz.slide/images/sunset/003.jpeg

地球の大気は、太陽からの青いろの光を拡散する性質を持っています。
```

スクリプトの各行は、実行時にノードオブジェクト化されます。
各ノードオブジェクトは、Node-REDの様にmsgオブジェクトを受け渡します。

msgオブジェクトに値を代入するには、コマンド行に続いてピリオドでアトリビュートを指定します。例えば、下記のように記述すると、msg.payloadに「こんにちは」という文字列を代入することができます。

```
/.payload/こんにちは
```

代入した、文字列を使用するには、次の様に{{{ ... }}}で囲みます。

```
{{{payload}}}、私はダンボール頭のおしゃべりロボットです。
```

実行時に{{{payload}}}の部分が入れ替わって「こんにちは、私はダンボール頭のおしゃべりロボットです」とロボットが話します。


スクリプトのサンプルは下記URLに置いてます。

[https://github.com/yamagame/dora-script-sample](https://github.com/yamagame/dora-script-sample)


### コマンド

コマンドは行頭が/(スラッシュ)です。

```
/goto/:ラベル
```

### ラベル

ラベルは行頭が:(コロン)です。

```
:ラベル
```

### コメント

コメントはC言語ライクなコメントが使用できますが、C言語と違って行の途中からコメントにすることはできません。

```
//コメント
```

```
/*
  コメント
*/
```

## Core Module

コアモジュールは基本的な機能を提供するモジュールです。

- log

      /log/Hello

  console.log()を使ってログを出力します。ブラウザのデベロッパーツールのコンソールに出力されます。

      /log/{{{payload}}

  mustache記法を使って、msgのメンバを出力することもできます。

      /log

  省略するとmsgオブジェクト全体を出力します。

- error

      /error/エラーです

  強制的にエラーを発生させます。

- comment

      /comment/コメントです

  コメントです。特に何もしません。

- label

      /label/ラベル

  ラベルです。通常は、:(コロン)を使います。

- if

      /if/あいさつ/:あいさつ
      さようなら
      /end

      :あいさつ
      こんにちは
      /end

      /check/天気/5

  payloadに指定した文字が含まれていれば分岐します。

- goto

      /goto/:ラベル

  指定したラベルへジャンプします。

- goto.random

      /goto.random/:ラベルA/:ラベルB/:ラベルC

  指定したラベルのどれかへジャンプします。

- goto.sequece

      /goto.sequece/:ラベルA/:ラベルB/:ラベルC

  指定したラベルの一つへ順番にジャンプします。

- delay

      /delay/3

  指定した秒数だけ待ちます。以下のように、delayを省略することもできます。

      /3

- end

      /end

  フローを終了させます。

- fork

      /fork/:制御1/:制御2/:制御3/...

  フローを並列実行します。

- push

      /push/100

  メッセージのスタックに値をプッシュします。

      /push

  値を省略するとmsg.payloadの値をスタックへプッシュします。

- pop

      /pop

  メッセージのスタックから値をポップします。値はpayloadに設定されます。

- check

      /check/天気

  payloadに指定したキーワードが含まれていればメッセージのプライオリティに1を加算します。

      /check/天気/晴れ/雨

  複数のキーワードを「/」区切りで指定することもできます。一致するキーワードが1つ含まれている毎にプライオリティに1が加算されます。

- join

      /join

  並列実行したメッセージをまとめます。プライオリティが一番高いメッセージが次へ進みます。

      /join/:ラベル

  ラベルが追加されているときは次へ進まずに指定したラベルへジャンプします。

- joinLoop

      :ループ
      /join
      /joinLoop/:ループ
      /other/:その他の話題

  forkコマンドが複数回実行された場合に必要な数だけjoinコマンドを呼ぶためにループします。

- joinAll

      /joinAll/:その他の話題

  下記コードと同じ意味のコマンドです。

      :ループ
      /join
      /joinLoop/:ループ
      /other/:その他の話題

- priority

      /priority/10

  メッセージのプライオリティに指定した値を加算します。

      /priority

  パラメータを省略した場合は10が足されます。

- topic

      /topic/パソコンの話について

  メッセージの話題を指定します。

- other

      /other/:その他の話

  話題が見つからないときは指定したラベルへジャンプします。

- sound

      /sound/クイズスタート.wav

  Soundフォルダに入っているサウンドファイルをaplayを使って再生します。

- set

      /set/.title/夕焼けの話

  メッセージのアトリビュートに値を代入します。以下のように省略できます。

      /.title/夕焼けの話

- get

      /get/.title

  メッセージのアトリビュートをmsg.payloadに代入します。

- change

      /change/.payload/.payload.status

  メッセージのアトリビュートを入れ替えます。上記例は、下記プログラムと等価です。

      msg.payload = clone(msg.payload.status);

- text-to-speech

      /text-to-speech

  payloadに入っている文字を発話します。発話した文字はpayloadに代入されます。次のようにして、指定した文字を発話することもできます。

      /text-to-speech/こんにちは

  行頭に/(スラッシュ)がない行はtext-to-speechコマンドとして実行されます。

      こんにちは

  - AquesTalk Pi向けパラメータ

    - .speech.speed

          /.speech.speed/150

      発話の速さを変更します。

    - .speech.volume

          /.speech.volume/30

      発話の音量を変更します。

    - .speech.voice

          /.speech.voice/marisa

      発話の声を変更します。デフォルトはreimuで、marisaに変更することができます。

- silence / silence.end

      /silence
      こんにちは
      /silence.end

  /silenceと/silence.endに囲まれた部分は発話せず、発話内容をpayloadにテキストとして記録します。

- speech-to-text

      /speech-to-text/:例外発生

  音声認識を待ちます。音声認識に成功すると認識した音声が文字となってpayloadに代入され次へ処理が移ります。

  タイムアウトやキャンセルメッセージを受信するとpayloadに以下の文字が代入され指定したラベルへジャンプします。

    - timeout
    - canceled
    - button

- wait-event

      /wait-event

  タイムアウトやキャンセルメッセージを受信するとpayloadに以下の文字が代入され次へ処理が移ります。

    - canceled
    - button

- chat

      /chat/こんにちは

  雑談対話APIにdoraEngine経由で問い合わせます。payloadに対話文字列が返ってきます。

      /chat

  パラメータを省略するとmsg.payloadの文字列がAPIに渡されます。

- switch

      /switch/こんにちは/:あいさつ

  payloadが指定した文字だったら指定したラベルへ制御を移します。

- payload

      /payload/こんにちは

  メッセージのpayloadに値を代入します。

- call

      /call/quiz-play.dora

  指定したスクリプトを呼び出します。

- run

      /run/other_script.dora

  フローを終了させ、指定したスクリプトを実行します。

- eval

      /eval/msg.payload="こんにちは"

  Javascriptを実行します。このコマンドは機能しません。

- select

      /select/晩御飯のおかずに最適なものはどれ？

  クイズの設問を追加します。quiz.initコマンドと共に使用します。

- ok

      /ok/ポテトサラダ

  クイズの正解となる選択肢です。quiz.initコマンドと共に使用します。

- ng

      /ng/スパゲッティ

  クイズの不正解となる選択肢です。quiz.initコマンドと共に使用します。

## HTTP Module

HTTPモジュールはNode-REDとの連携を想定しています。テキストまたはJSONを送信し、テキストまたはJSONを受診します。

- http.post

      /.payload/2018:05:01
      /http.post/http://localhost:1880/weather

  POSTリクエストします。レスポンスはpayloadに代入されます。

  タイムアウトはフォルトで3秒です。下記のようにするとタイムアウトを10秒に変更できます。

      /.httpTimeout/10000
      /.payload/2018:05:01
      /http.post/http://localhost:1880/weather

- http.get

      /http.get/http://localhost:1880/weather

   GETリクエストします。レスポンスはpayloadに代入されます。

- http.error

      /http.error/:HTTPエラー
      /http.get/http://localhost:1880/weather
      HTTPリクエストに成功しました。
      /end

      :HTTPエラー
      HTTPエラーです
      /end

   HTTPリクエストでエラーが発生したら、指定したラベルへ遷移します。

## Quiz Module

プレゼンテーションとクイズの機能を提供するモジュールです。

- quiz.greeting

      /quiz.greeting

  午前11時以降であれば、msg.quiz.greetingに「こんにちは」が代入されます。11時前なら「おはようございます」が代入されます。

- quiz.entry

      /quiz.message.open
      /quiz.message.title/このURLをブラウザで開いてください。
      /quiz.message.content/http://localhost:3090
      /quiz.entry

  クイズ参加登録受付画面を表示します。

- quiz.title

      /quiz.title/夕焼けの話

  クイズのタイトルをmsg.quiz.titleに代入します。

- quiz.slideURL

      /quiz.slideURL/http://slideurl....

  クイズのスライドのURLをmsg.quiz.slideURLに代入します。

- quiz.slide

      /quiz.slide/images/sunset/001.jpeg

  クイズのスライド画像を画面に表示します。
  imagesから始まった画像はPicturesフォルダに入っているファイルを表示します。
  httpから始まった画像はそのURLの画像を表示します。

      /quiz.slide/https://upload.wikimedia.org/wikipedia/commons/d/df/Televox_and_R._J._Wensley_1928.jpg

- quiz.preload

      /quiz.preload/images/sunset/001.jpeg

  クイズのスライド画像を読み込みます。画面には表示しません。
  imagesから始まった画像はPicturesフォルダに入っているファイルを読み込みます。
  httpから始まった画像はそのURLの画像を読み込みます。

- quiz.startScreen

      /quiz.startScreen/images/sunset/001.jpeg
      /wait-event

  スタートボタンのついたクイズのスライド画像を画面に表示します。画像はPicturesフォルダに入っているファイルを表示します。

  スタートボタンをクリックすると、canceledイベントを発行します。

- quiz.init

      /quiz.init/夕焼けの話

  クイズの初期化を行います。/(スラッシュ)以降の文字はクイズIDになります。

- quiz.id

      /quiz.id/夕焼けの話

  クイズIDをmsg.quiz.quizIdに代入します。

- quiz.shuffle

      /quiz.shuffle

  選択肢のシャッフルメッセージを参加者に送信します。このメッセージを送信すると参加者の選択肢の順番がそれぞれ変わります。

- quiz.timeLimit

      /quiz.timeLimit/120

  クイズの回答時間を秒単位で指定します。msg.quiz.timeLimitに代入されます。

- quiz.select

      /quiz.select/晩御飯のおかずに最適なものはどれ？

  クイズの設問を追加します。quiz.は省略できます。

      /select/晩御飯のおかずに最適なものはどれ？

- quiz.ok

      /quiz.ok/ポテトサラダ

  クイズの正解となる選択肢です。quiz.initコマンドと共に使用します。quiz.は省略できます。

      /ok/ポテトサラダ

- quiz.ng

      /quiz.ng/スパゲッティ

  クイズの不正解となる選択肢です。quiz.initコマンドと共に使用します。quiz.は省略できます。

      /ng/スパゲッティ

- quiz.messagePage

      /quiz.messagePage/次の問題は注意してください。

  クイズ中にメッセージページを追加します。

- quiz.slidePage

      /quiz.slidePage/images/sunset/001.jpeg

  クイズ中に画像ページを追加します。

- quiz.lastPage

      /quiz.lastPage

  クイズの最後のページを追加します。

- quiz.open

      /quiz.open

  クイズを参加者の画面に表示します。

- quiz.yesno

      /quiz.open

  ２択質問を参加者の画面に表示します。

- quiz.wait

      :カウントダウン
      /quiz.wait/:タイムオーバー
      /goto/:カウントダウン
      :タイムオーバー

  1秒待ちます。制限時間に到達すると指定ラベルへジャンプします。制限時間はquiz.timeLimitで指定します。

- quiz.timeCheck

      :カウントダウン
      /quiz.wait/:タイムオーバー
      /quiz.timeCheck/30/:30秒経過
      /quiz.timeCheck/-30/:残り30秒
      /goto/:カウントダウン
      :30秒経過
      30秒経過しました
      /end
      :残り30秒
      残り30秒です
      /end
      :タイムオーバー
      /end

  回答時間が指定した時間になれば指定したラベルへ並列ジャンプします。

- quiz.stop

      /quiz.stop

  クイズの回答を終了します。

- quiz.result

      /quiz.result/

  クイズの回答を発表します。

- quiz.ranking

      /quiz.ranking/:全問正解者なし/:全問正解者あり
      :全問正解者なし
      残念、全問正解者はいませんでした
      /end
      :全問正解者あり
      おめでとうございます
      /end

  クイズの全問正解者を発表します。

- quiz.answerCheck

      /quiz.answerCheck/100/:全員
      /quiz.answerCheck/90/:ほとんど
      /quiz.answerCheck/50/:半分
      /quiz.answerCheck/30/:解説
      /goto/:知らない

      :全員
      全員知っていたみたいですね。
      /goto/:おわり

      :ほとんど
      ほとんどの人が知っていたみたいですね。
      /goto/:おわり

      :半分
      半分以上の人が知っていたみたいですね。
      /goto/:おわり

      :知らない
      知らない人が多いみたいですね。
      /goto/:おわり

      :おわり
      /end

  quiz.yesnoの判定を行います。

- quiz.message.open

      /quiz.message.open

  メッセージの初期化を行います。

- quiz.message.title

      /quiz.message.title/スライドはここからダウンロードできます。

  メッセージのタイトルを設定します。使用前にquiz.message.openで初期化してください。

- quiz.message.content

      /quiz.message.content/こんにちは

  メッセージ文章を追加します。使用前にquiz.message.openで初期化してください。

- quiz.message.url

      /quiz.message.url/{{{quiz.slideURL}}}

  メッセージのリンク先を指定します。使用前にquiz.message.openで初期化してください。

- quiz.message.link

      /quiz.message.link/{{{quiz.title}}}

  メッセージのリンクの名前を指定します。使用前にquiz.message.openで初期化してください。

- quiz.message

      /quiz.message.open
      /quiz.message.title/スライドはここからダウンロードできます。
      /quiz.message.url/{{{quiz.slideURL}}}
      /quiz.message.link/{{{quiz.title}}}
      /quiz.message

  メッセージを表示します。

- quiz.movie.play

      /quiz.movie.play/sample.mp4

  omxplayerを使ってMovieフォルダに入っている動画を再生します。

- quiz.movie.check

      /quiz.movie.play/sample.mp4
      :再生中
      /quiz.movie.check/:再生中
      :再生終了

  1秒待って動画が再生中か動画を調べます。再生が終了したら処理を抜けます。

- quiz.movie.cancel

      /quiz.movie.cancel

  動画の再生を停止します。

## LED Module

- led.auto

      /led.auto

  LEDボタンを点灯を自動モードにします。自動モードでは、音声認識中にLEDボタンは点灯します。通常は自動モードです。

- led.on

      /led.on

  LEDボタンを点灯させます。

- led.off

      /led.off

  LEDボタンを消灯させます。

- led.blink

      /led.blink

  LEDボタンを点滅させます。

## Operation Module

- op.add

      /.payload/10
      /op.add/100

    payloadに指定した値を加算する。

- op.sub

      /.payload/10
      /op.sub/5

    payloadから指定した値を減算する。

- op.mul

      /.payload/10
      /op.mul/2

    payloadに指定した値を乗算する。

- op.div

      /.payload/15
      /op.div/3

    payloadに指定した値を除算する。

- op.inc

      /.payload/10
      /op.inc

    payloadに1加算する。

- op.dec

      /.payload/10
      /op.dec

      payloadに1減算する。

- op.toInt

      /.payload/10
      /op.toInt

    payloadの値を整数にする。

- op.toFloat

      /.payload/10.123
      /op.toFloat

    payloadの値を浮動小数にする。

- op.==

      /op.==/100/:ラベル

    payloadの値が指定した値ならラベルへ遷移する。

- op.!=

      /op.!=/100/:ラベル

    payloadの値が指定した値でなければラベルへ遷移する。

- op.>=

      /op.>=/100/:ラベル

    payloadの値が指定した値以上ならラベルへ遷移する。

- op.<=

      /op.<=/100/:ラベル

    payloadの値が指定した値以下ならラベルへ遷移する。

- op.>

      /op.>/100/:ラベル

    payloadの値が指定した値より大きいならラベルへ遷移する。

- op.<

      /op.</100/:ラベル

    payloadの値が指定した値より小さいならラベルへ遷移する。

## Bar Module

- bar.create

  スケジューラにバーを作成します。

- bar.update

  指定したバーを更新します。

- bar.time

  作成するバーの時刻を指定します。

- bar.find.title

  タイトルを指定してバーを検索します。

- bar.find.time

  時間を指定してバーを検索します。

- bar.eval.title

  タイトルを指定してバーを検索し、検索して見つかったバーの内容をJavascriptとして実行します。

- bar.eval.time

  時間を指定してバーを検索し、検索して見つかったバーの内容をJavascriptとして実行します。

- bar.delete

  指定したバーを削除します。

- bar.move.screen

  指定したバーを画面の中央に移動します。

## カスタムモジュールの追加方法

### カスタムモジュールの例

下記のようにプログラムすると、DoraScriptに任意のコマンドを追加することができます。

```js
const dora = new Dora();

function CustomModule(DORA, config) {
    function Hello(node, options) {
        node.on("input", async function(msg) {
            msg.payload = 'Hello World';
            node.send(msg);
        });
    }
    DORA.registerType('hello', Hello);
}

dora.loadModule('custom', CustomModule, {});
```

上記、例では次のようなコマンドが使える様になります。

```
/custom.hello
```

### オプション文字列の取得方法

コマンド文字列の２つめの/(スラッシュ)以降は、オプション文字列として扱われます。

```
/custom.hello/こんにちは
```

オプション文字列はregisterTypeで登録する関数の２つ目の引数で取得できます。下記例では、オプション文字列をmsg.payloadに代入しています。

```js
const dora = new Dora();

function CustomModule(DORA, config) {
    function Hello(node, options) {
        node.on("input", async function(msg) {
            msg.payload = options;
            node.send(msg);
        });
    }
    DORA.registerType('hello', Hello);
}

dora.loadModule('custom', CustomModule, {});
```
