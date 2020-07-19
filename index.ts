const { SESSIONS_PER_PAGE } = require("./config/app.json");

import express from "express";
import cors from "cors";
import socket from "socket.io";
import _SessionManager from "./controllers/Session";

import { generateUuid } from "./utils";

const app = express();

app.use(express.json());
app.use(cors());

app.get("/health", (_, res) => {
  console.log("HEALTH ENDPOINT HIT");

  res.status(200).json({
    success: true,
    err: null,
    msg: "Server is running!",
    data: null,
  });
});

const SessionManager = new _SessionManager();

// ========== SESSION ENDPOINTS ========== //
app.get("/api/v1/session/list", (req, res) => {
  const { cursor = 0, count = SESSIONS_PER_PAGE } = req.body;

  let sessions = SessionManager.listGames(cursor, count);

  console.log(`${sessions.length} sessions have been sent to a user`);

  sessions = sessions.map((game) => {
    delete game.admin;

    return game;
  });

  res.status(200).json({
    success: true,
    error: null,
    data: {
      cursor,
      count: sessions.length,
      sessions,
    },
  });
}); // done || find all sessions in range

app.get("/api/v1/session/find", (req, res) => {
  const { id } = req.body;

  const game = SessionManager.findGame(id);

  if (game) {
    delete game.admin;
  }

  res.status(200).json({
    success: true,
    err: null,
    data: game || "No game found",
  });
}); // done || find single session by id

// ========== ADMIN ENDPOINTS ========== //
app.post("/api/v1/admin/session", (req, res) => {
  try {
    req.body.admin.id = generateUuid();

    const game = SessionManager.addGame(req.body);

    console.log(
      `New game created: ${game.id} by ${game.admin.name} (${game.admin.id})`
    );

    delete game.admin;

    res.status(200).json({
      success: true,
      err: null,
      data: game,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      err: err.msg,
      data: null,
    });
  }
}); // done || admin create session

app.delete("/api/v1/admin/session", (req, res) => {
  const { id } = req.body;

  const game = SessionManager.removeGame(id);

  if (game) {
    delete game.admin;

    console.log(`The game ${game.id} has been removed`);

    // TODO if there are players in the game, notify them they've been kicked
  }

  res.status(200).json({
    success: true,
    err: null,
    data: game,
  });
}); // done || admin delete session

app.post("/api/v1/admin/question", (req, res) => {
  try {
    const { gameId, title, choices } = req.body;

    const game = SessionManager.findGame(gameId);

    game.createQuestion({ title, choices });

    // TODO: notify users in session of new question

    res.status(200).json({
      success: true,
      err: null,
      data: game,
    });
  } catch (err) {
    res.status(err.statusCode).json({
      success: false,
      err: err.msg,
      data: null,
    });
  }
}); // create question

app.patch("/api/v1/admin/answer", (req, res) => {
  try {
    const { gameId, questionId, correct_answer } = req.body;

    const game = SessionManager.findGame(gameId);

    // this function also calculates scores for each user in the session (including those who did not answer)
    const question = game.updateQuestion({ id: questionId, correct_answer });

    // TODO: notify users in session of correct answer
    // TODO: notify users and admin of scores

    res.status(200).json({
      success: true,
      err: null,
      data: question,
    });
  } catch (err) {
    res.status(err.statusCode).json({
      success: false,
      err: err.msg,
      data: null,
    });
  }
  // update session to calculate user scores
  //
  // notify users of correct answer
  // notify admin of user scores
}); // update question with correct answer

const PORT = process.env.PORT || 4000;
const io = socket(
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  })
);

// ========== USER ENDPOINTS ========== //
io.on("connection", (socket) => {
  console.log("socket connected:", socket);

  socket.on("join session", (data) => {
    // notify all users and admins of joined user in session
  });

  socket.on("leave session", (data) => {
    // notify all users and admins of removed user in session
  });

  socket.on("answer question", (data) => {
    // verify that the question is still accepting answers
  });
});
