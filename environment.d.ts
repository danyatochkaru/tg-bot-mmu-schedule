declare namespace NodeJS {
  interface ProcessEnv {
    TOKEN: string;
    AUTH: string;
    URL: string;
    TYPEORM_HOST: string;
    TYPEORM_USER: string;
    TYPEORM_PASS: string;
    TYPEORM_DB: string;
    TYPEORM_PORT: number;
  }
}
