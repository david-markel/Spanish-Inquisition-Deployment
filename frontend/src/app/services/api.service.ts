import { Injectable } from '@angular/core';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';

// *****************
// TYPES
// *****************
type UserBase = {
  firstName: string;
  lastName: string;
  username: string;
  userType: string; //"teacher" | "student",
};

export type NewUser = UserBase & { password: string };

export type User = UserBase & { token: string };

export type Quiz = {
  id: number;
  title: string;
  isActive: boolean;
  joinCode: string | null;
  owningTeacher: User;
  firstPlace: User | null;
  secondPlace: User | null;
  thirdPlace: User | null;
  questions: Question[];
};

export type NewQuestion = {
  prompt: string;
  choiceA: string;
  choiceB: string;
  choiceC: string;
  choiceD: string;
  correctChoice: 'a' | 'b' | 'c' | 'd';
  promptDisplayTime: number;
  timeLimit: number;
  quizId: number;
  sequence: number;
};

export type Question = NewQuestion & { id: number };

type Error = { error: string };

// the type returned from an API call
export type Response<T> = {
  ok: T | null;
  err: string | null;
};

// base URL for all API endpoints
const BASE_URL = 'http://localhost:8000/api'; // "/api"

// allowed HTTP methods
type Method = 'POST' | 'GET' | 'PUT' | 'DELETE';

// just a map from names to axios functions
const axiosFuncTable = {
  POST: axios.post,
  GET: axios.get,
  PUT: axios.put,
  DELETE: axios.delete,
};

// for the request base
type Config<T> = {
  data?: T;
  token?: string;
};

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor() {}

  private async requestBase<ArgType, ReturnType>(
    method: Method,
    url: string,
    { data, token }: Config<ArgType>
  ): Promise<Response<ReturnType>> {
    try {
      let res;

      const config: AxiosRequestConfig = {};

      if (token) {
        config.headers = {
          Authorization: `Bearer ${token}`,
        };
      }

      if (method === 'POST' || method == 'PUT')
        res = await axiosFuncTable[method](`${BASE_URL}${url}`, data, config);
      // takes a payload
      else res = await axiosFuncTable[method](`${BASE_URL}${url}`, config); // no payload

      return {
        ok: res.data as ReturnType,
        err: null,
      };
    } catch (e) {
      if (e instanceof AxiosError) {
        const error = e as AxiosError;
        const data = error.response?.data as Error;
        return {
          ok: null,
          err: data.error,
        };
      }
      return {
        ok: null,
        err: `unknown error: ${e}`,
      };
    }
  }

  async register(newUser: NewUser): Promise<Response<User>> {
    return await this.requestBase<NewUser, User>('POST', '/auth/register/', {
      data: newUser,
    });
  }

  async login(username: string, password: string): Promise<Response<User>> {
    return await this.requestBase<{ username: string; password: string }, User>(
      'POST',
      '/auth/login/',
      { data: { username, password } }
    );
  }

  async allQuizzes(token: string): Promise<Response<Quiz[]>> {
    return await this.requestBase<void, Quiz[]>('GET', '/quizzes/', { token });
  }

  async getQuiz(token: string, id: number): Promise<Response<Quiz>> {
    return await this.requestBase<void, Quiz>('GET', `/quizzes/${id}`, {
      token,
    });
  }

  async createQuiz(token: string, title: string): Promise<Response<Quiz>> {
    return await this.requestBase<{ title: string }, Quiz>(
      'POST',
      '/quizzes/',
      {
        data: { title },
        token,
      }
    );
  }

  async updateQuiz(
    token: string,
    id: number,
    title: string
  ): Promise<Response<Quiz>> {
    return await this.requestBase<{ title: string }, Quiz>(
      'PUT',
      `/quizzes/${id}/`,
      { data: { title }, token }
    );
  }

  async deleteQuiz(token: string, id: number): Promise<Response<Quiz>> {
    return await this.requestBase<void, Quiz>('DELETE', `/quizzes/${id}/`, {
      token,
    });
  }

  async singleQuestion(token: string, id: number): Promise<Response<Question>> {
    return await this.requestBase<void, Question>('GET', `/questions/${id}/`, {
      token,
    });
  }

  async createQuestion(
    token: string,
    question: NewQuestion
  ): Promise<Response<Question>> {
    return await this.requestBase<NewQuestion, Question>(
      'POST',
      '/questions/',
      {
        data: question,
        token,
      }
    );
  }

  async updateQuestion(
    token: string,
    id: number,
    question: Partial<NewQuestion>
  ): Promise<Response<Question>> {
    return await this.requestBase<Partial<NewQuestion>, Question>(
      'PUT',
      `/questions/${id}`,
      { data: question, token }
    );
  }

  async deleteQuestion(token: string, id: number): Promise<Response<Question>> {
    return await this.requestBase<void, Question>(
      'DELETE',
      `/questions/${id}`,
      { token }
    );
  }
}
