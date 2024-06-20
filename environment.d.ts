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
    ADMIN_IDS: string;
    AUTH_TOKEN: string;
    CORS_ORIGIN: string;
    STATIC_BASE_URL: string;
  }
}
