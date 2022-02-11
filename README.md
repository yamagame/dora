# Dora Script

[DoraEngine](https://github.com/yamagame/dora-engine)で使用するスクリプトです。

## 準備

```
$ npm i
```

## 使い方

別に[DoraEngine](https://github.com/yamagame/dora-engine)を起動させておきます。接続したい[DoraEngine](https://github.com/yamagame/dora-engine)と実行したいスクリプトを下記のように指定して実行します。

```
$ node index.js [DoraEngineのホスト] [実行したいスクリプト]
```

例：

```
$ node index.js http://localhost:3090 ./tests/samples/sample.dora
```

## ダミーサーバー

以下の手順で Dora Engine の代わりのダミーサーバーを利用して発話させることができます。ダミーサーバーは mac 用です。

```
$ npm run dev-server
```

ダミーサーバを起動した後、以下のコマンドで発話のサンプルを実行できます。

```
$ npm run sample
```

## 言語仕様

特殊行以外はロボットが読み上げる文章です。空行は 1 秒のウエイトとして機能します。

下記はスライドをめくりながら解説するスクリプトの例です。

```
みなさん、こんにちは。
それでは、サイエンス講座を始めたいと思います。

今回は、夕焼けの話です。

/quiz.slide/images/sunset/002.jpeg

夕焼けは、日没の頃に西の空が赤く見える現象のことです。


/quiz.slide/images/sunset/003.jpeg

地球の大気は、太陽からの青いろの光を拡散する性質を持っています。
```

スクリプトのサンプルは[こちら](https://github.com/yamagame/https://github.com/yamagame/dora-script-sample)

[https://github.com/yamagame/dora-script-sample](https://github.com/yamagame/dora-script-sample)

スクリプトの詳細は doc フォルダを参照してください。

[DoraScript Language Specification](./doc/README.md)

### コメント

行頭が//だとコメント行になります。

```
//ここはコメント
```

/_ ---- _/ でコメントすることもできます。

### コマンド

行頭が/から始まるとコマンド行になります。

```
/.payload/おはようございます
```

### ラベル

行頭が:から始まるとラベル行になります。

## License

[MIT](LICENSE)
