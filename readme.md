## MancJS December: Perf Golf
The server used to run the MancJS perf golf game.

### How to run server

* Clone the repo
* `npm install`
* `npm start`

### URLs

`/`
The main submission page where players can repeatedly submit new solutions to the current game.
Players need to enter an email address (used for gravatar images) and a team name.

`/admin`
Page to start predefined games.

The admin page is protected with HTTP basic auth (user `admin` pass `admin`). You can modify
the credentials by changing the file
[routes/admin.js](https://github.com/martinrue/mancjs-code-golf/blob/master/routes/admin.js#L5).