export interface typeofUser {
  name: string;
  email: string;
  password: string;
  role?: "contributor" | "maintainer";
}
