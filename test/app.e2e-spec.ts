import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import { AuthDto } from '../src/auth/dto';
import { EditLoggedInCoachDto } from 'src/coach/dto';

describe('App (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'test1@gmail.com',
      password: '123456',
    };

    describe('Signup', () => {
      it('should throw if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ password: dto.password })
          .expectStatus(400);
      });

      it('should throw if password is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ email: dto.email })
          .expectStatus(400);
      });

      it('should throw if no body is provided', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });

      it('should signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe('Signin', () => {
      it('should throw if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ password: dto.password })
          .expectStatus(400);
      });

      it('should throw if password is empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ email: dto.email })
          .expectStatus(400);
      });

      it('should throw if no body is provided', () => {
        return pactum.spec().post('/auth/signin').expectStatus(400);
      });

      it('should signin', () => {
        return (
          pactum
            .spec()
            .post('/auth/signin')
            .withBody(dto)
            .expectStatus(200)
            // store the access token inside the userAccessToken variable, in the pactum store
            .stores('userAccessToken', 'access_token')
        );
      });
    });
  });

  describe('Coach', () => {
    describe('Get the logged in coach', () => {
      it('should get the logged in coach', () => {
        return pactum
          .spec()
          .get('/coach')
          .withHeaders({
            Authorization: `Bearer $S{userAccessToken}`,
          })
          .expectStatus(200)
          .stores('coachId', 'id');
      });
    });

    describe('Edit the logged in coach', () => {
      it('should edit the logged in coach', () => {
        const dto: EditLoggedInCoachDto = {
          firstName: 'Georgie',
          lastName: 'Dominique',
        };

        return pactum
          .spec()
          .patch('/coach')
          .withHeaders({
            Authorization: `Bearer $S{userAccessToken}`,
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.lastName);
      });
    });

    describe('Get a coach by id', () => {
      it('should get a coach by id', () => {
        return pactum
          .spec()
          .get('/coach/{id}')
          .withPathParams('id', '$S{coachId}')
          .withHeaders({
            Authorization: `Bearer $S{userAccessToken}`,
          })
          .expectStatus(200)
          .expectBodyContains('$S{coachId}');
      });

      it('should throw if the id param is incorrect', () => {
        return pactum
          .spec()
          .get('/coach/{id}')
          .withPathParams('id', 'myfakeid')
          .withHeaders({
            Authorization: `Bearer $S{userAccessToken}`,
          })
          .expectStatus(404);
      });
    });
  });
});
