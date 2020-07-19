export interface GameInput {
  name: String;
  image_url?: String;
  admin: Admin;
}

export interface Game extends GameInput {
  id: String;
  active_users: Player[];
  created_at: Date;
  expired_at?: Date | null;
  questions: Question[];

  createQuestion(input: QuestionInput): Question;
  updateQuestion(input: UpdateQuestionInput): Question;
}

export interface Admin {
  id: String;
  name: String;
}

export interface Answer {
  question_id: String;
  value?: Number;
  is_correct: Boolean;
  score: Number;
}

export interface Player {
  id: String;
  name: String;
  answers: Answer[];
}

export interface QuestionInput {
  title: String;
  choices: String[];
}

export interface UpdateQuestionInput {
  id: String;
  correct_answer?: Number;
}

export interface Question extends QuestionInput, UpdateQuestionInput {
  id: String;
  created_at: Date;
  expiration_date: Date;
  updated_at?: Date;
}
