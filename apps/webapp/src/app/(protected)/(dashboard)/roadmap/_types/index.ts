export type StepAnswers = { focus?: string; [key: string]: unknown };

export type QuestionType = 'radio' | 'checkbox' | 'textarea' | 'input';

export interface QuestionOption {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  label: string;
  options?: QuestionOption[];
  placeholder?: string;
}

export interface Branch {
  condition: (answers: StepAnswers) => boolean;
  title: string;
  questions: Question[];
}

export interface Step {
  id: string;
  label: string;
  title: string;
  description?: string;
  questions?: Question[];
  branches?: Branch[];
}
