const {
  QUESTION_ANSWER_THRESHOLD,
  POINTS_PER_QUESTION,
} = require("../config/app.json");

import {
  GameInput,
  Game,
  Player,
  Admin,
  QuestionInput,
  UpdateQuestionInput,
  Question,
} from "../types";

import { generateUuid } from "../utils";

export default class GameManager implements Game {
  public id: String;
  public name: String;
  public image_url?: String;
  public active_users: Player[];
  public created_at: Date;
  public expired_at?: Date;
  public questions: Question[];
  public admin: Admin;

  constructor({ admin, name, image_url }: GameInput) {
    this.id = generateUuid();
    this.admin = admin;
    this.name = name;
    this.image_url = image_url;
    this.active_users = [];
    this.questions = [];
    this.created_at = new Date();
    this.expired_at = null;
  }

  // ========== SYSTEM ACTIONS ========== //
  addMember() {}

  removeMember() {}

  calculateScores(question: Question) {
    this.active_users = this.active_users.map((user) => {
      const answer = user.answers.find(
        (answer) => answer.question_id === question.id
      );

      // user did not answer the question
      if (!answer) {
        user.answers.push({
          question_id: question.id,
          value: null,
          is_correct: false,
          score: 0,
        });

        return user;
      }

      if (answer.value === question.correct_answer) {
        answer.is_correct = true;
        answer.score = POINTS_PER_QUESTION;
      } else {
        answer.is_correct = false;
        answer.score = 0;
      }

      return user;
    });
  }

  // ========== ADMIN ACTIONS ========== //
  createQuestion({ title, choices }: QuestionInput): Question {
    let expiration_date = new Date();
    expiration_date.setSeconds(
      expiration_date.getSeconds() + QUESTION_ANSWER_THRESHOLD
    );

    const question = {
      id: generateUuid(),
      created_at: new Date(),
      title,
      choices,
      expiration_date,
    };

    this.questions.push(question);

    return question;
  }

  updateQuestion({ id, correct_answer }: UpdateQuestionInput): Question {
    const question = this.questions.find((question) => question.id === id);

    if (!question) {
      throw {
        statusCode: 400,
        msg: "Invalid Question Id",
      };
    }

    question.correct_answer = correct_answer;
    question.updated_at = new Date();

    this.calculateScores(question);

    return question;
  }

  // ========== USER ACTIONS ========== //
  answerQuestion() {}
}
