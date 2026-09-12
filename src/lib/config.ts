import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  UPLOADTHING_SECRET: z.string().optional(),
  UPLOADTHING_APP_ID: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  REDIS_URL: z.string().url().optional(),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  AI_API_KEY: z.string().optional(),
  AI_API_URL: z.string().url().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  APP_NAME: z.string().default("AI Media Platform"),
  APP_DESCRIPTION: z.string().default("AI-powered media and content platform"),
  APP_VERSION: z.string().default("2.0.0"),
  MAX_UPLOAD_SIZE: z.coerce.number().default(104857600),
  ALLOWED_VIDEO_TYPES: z
    .string()
    .default("video/mp4,video/webm,video/quicktime"),
  ALLOWED_IMAGE_TYPES: z
    .string()
    .default("image/jpeg,image/png,image/webp,image/gif"),
  CDN_URL: z.string().url().optional(),
  ANALYTICS_ENABLED: z.coerce.boolean().default(true),
  MAINTENANCE_MODE: z.coerce.boolean().default(false),
});

function validateEnv() {
  if (process.env.NEXT_PUBLIC_ENV_VALIDATED === "true") {
    return envSchema.parse(process.env);
  }

  try {
    const parsed = envSchema.safeParse(process.env);
    if (parsed.success) {
      process.env.NEXT_PUBLIC_ENV_VALIDATED = "true";
      return parsed.data;
    }
    console.error(
      "Invalid environment variables:",
      parsed.error.flatten().fieldErrors
    );
    return envSchema.parse({});
  } catch (e) {
    if (process.env.NODE_ENV === "production") {
      throw e;
    }
    return envSchema.parse({});
  }
}

export const env = validateEnv();

export const config = {
  app: {
    name: env.APP_NAME,
    description: env.APP_DESCRIPTION,
    version: env.APP_VERSION,
    url: env.NEXTAUTH_URL || "http://localhost:3000",
    isProduction: env.NODE_ENV === "production",
    isDevelopment: env.NODE_ENV === "development",
    isTest: env.NODE_ENV === "test",
    maintenanceMode: env.MAINTENANCE_MODE,
  },
  upload: {
    maxFileSize: env.MAX_UPLOAD_SIZE,
    allowedVideoTypes: env.ALLOWED_VIDEO_TYPES.split(","),
    allowedImageTypes: env.ALLOWED_IMAGE_TYPES.split(","),
  },
  cdn: {
    url: env.CDN_URL,
  },
  analytics: {
    enabled: env.ANALYTICS_ENABLED,
  },
  ai: {
    apiKey: env.AI_API_KEY,
    apiUrl: env.AI_API_URL,
  },
  auth: {
    secret: env.NEXTAUTH_SECRET,
    providers: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
      },
    },
  },
  storage: {
    s3: {
      bucket: env.S3_BUCKET,
      region: env.S3_REGION,
      accessKey: env.S3_ACCESS_KEY,
      secretKey: env.S3_SECRET_KEY,
    },
    uploadthing: {
      secret: env.UPLOADTHING_SECRET,
      appId: env.UPLOADTHING_APP_ID,
    },
  },
  email: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
  redis: {
    url: env.REDIS_URL,
  },
  stripe: {
    secretKey: env.STRIPE_SECRET_KEY,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET,
  },
} as const;

export type Config = typeof config;
