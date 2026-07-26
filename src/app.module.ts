import { Module } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { PrismaClient } from '@prisma/client';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { UploadModule } from './upload/upload.module';
import { SeminarFormatsModule } from './seminar-formats/seminar-formats.module';
import { LecturersModule } from './lecturers/lecturers.module';
import { SeminarsModule } from './seminars/seminars.module';
import { CartModule } from './cart/cart.module';
import { BookingsModule } from './bookings/bookings.module';
import { FavoritesModule } from './favorites/favorites.module';
import { PushTokensModule } from './push-tokens/push-tokens.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { buildAdminResources } from './admin/admin-resources.config';
import { ADMIN_LOCALE_RU } from './admin/admin-locale.config';
import { join } from 'path';

type AdminUser = {
  readonly email: string;
};

type AdminAuthOptions = {
  readonly authenticate: (
    email: string,
    password: string,
  ) => Promise<AdminUser | null>;
  readonly cookieName: string;
  readonly cookiePassword: string;
};

type AdminSessionOptions = {
  readonly resave: boolean;
  readonly saveUninitialized: boolean;
  readonly secret: string;
};

type AdminConfig = {
  readonly email: string;
  readonly password: string;
  readonly cookieSecret: string;
  readonly sessionSecret: string;
  readonly rootPath: string;
};

type AdminModuleOptions = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly adminJsOptions: Record<string, any>;
  readonly auth?: AdminAuthOptions;
  readonly sessionOptions?: AdminSessionOptions;
};

type AdminJsPrismaModule = {
  readonly Database: unknown;
  readonly Resource: unknown;
  readonly getModelByName: (modelName: string) => unknown;
};

type AdminJsModule = {
  readonly default: {
    readonly registerAdapter: (options: {
      readonly Database: unknown;
      readonly Resource: unknown;
    }) => void;
  };
};

const getAvailableModelNames = (): Set<string> => {
  const modelNames: string[] = Prisma.dmmf.datamodel.models.map(
    (model) => model.name,
  );
  return new Set<string>(modelNames);
};

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    HealthModule,
    AuthModule,
    ProfileModule,
    UploadModule,
    SeminarFormatsModule,
    LecturersModule,
    SeminarsModule,
    CartModule,
    BookingsModule,
    FavoritesModule,
    PushTokensModule,
    import('@adminjs/nestjs').then(({ AdminModule }) =>
      AdminModule.createAdminAsync({
        imports: [ConfigModule, PrismaModule],
        inject: [ConfigService, PrismaService],
        useFactory: async (
          configService: ConfigService,
          prismaService: PrismaService,
        ): Promise<AdminModuleOptions> => {
          const appConfig = configService.getAppConfig();
          const adminConfig: AdminConfig = appConfig.admin;
          const adminJsModule: AdminJsModule =
            (await import('adminjs')) as AdminJsModule;
          const adminJsPrismaModule: AdminJsPrismaModule =
            (await import('@adminjs/prisma')) as AdminJsPrismaModule;
          const AdminJS = adminJsModule.default;
          const { ComponentLoader: CL } = adminJsModule as unknown as {
            ComponentLoader: new () => {
              add: (name: string, path: string) => string;
            };
          };
          const componentLoader = new CL();
          const dashboardComponent: string = componentLoader.add(
            'Dashboard',
            join(__dirname, '..', 'src/admin/components/dashboard'),
          );
          const photoPreviewComponent: string = componentLoader.add(
            'PhotoPreview',
            join(__dirname, '..', 'src/admin/components/photo-preview'),
          );
          const { Database, Resource, getModelByName } = adminJsPrismaModule;
          AdminJS.registerAdapter({ Database, Resource });
          const prismaClient: PrismaClient = prismaService.getClient();
          const availableModelNames: Set<string> = getAvailableModelNames();
          const resources = buildAdminResources(
            getModelByName,
            prismaClient,
            availableModelNames,
            photoPreviewComponent,
          );
          const authenticate = (
            email: string,
            password: string,
          ): Promise<AdminUser | null> => {
            const isEmailValid: boolean = email === adminConfig.email;
            const isPasswordValid: boolean = password === adminConfig.password;
            if (!isEmailValid || !isPasswordValid) {
              return Promise.resolve(null);
            }
            return Promise.resolve({ email: adminConfig.email });
          };
          const shouldSkipBundle: boolean =
            process.env.ADMIN_JS_SKIP_BUNDLE === 'true';
          const adminJsOptions: Record<string, unknown> = {
            rootPath: adminConfig.rootPath,
            loginPath: `${adminConfig.rootPath}/login`,
            logoutPath: `${adminConfig.rootPath}/logout`,
            resources,
            componentLoader,
            dashboard: {
              component: dashboardComponent,
            },
            branding: {
              companyName: 'Dental Admin',
              logo: false,
              softwareBrothers: false,
            },
            locale: ADMIN_LOCALE_RU,
          };
          if (shouldSkipBundle) {
            const baseUrl = appConfig.appUrl || 'http://localhost:3000';
            adminJsOptions.assetsCDN = `${baseUrl.replace(/\/$/, '')}/admin-assets/`;
          }
          return {
            adminJsOptions,
            auth: {
              authenticate,
              cookieName: 'adminjs',
              cookiePassword: adminConfig.cookieSecret,
            },
            sessionOptions: {
              resave: true,
              saveUninitialized: true,
              secret: adminConfig.sessionSecret,
            },
          };
        },
      }),
    ),
  ],
  controllers: [AppController],
  providers: [AppService],
})
/**
 * Root application module.
 */
export class AppModule {}
