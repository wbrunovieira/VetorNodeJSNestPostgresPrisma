import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcryptjs';

class MockPrismaService {
  user = {
    findUnique: vi.fn().mockResolvedValue(null),
  };
}

class MockJwtService {
  sign = vi.fn().mockReturnValue('mockedJwtToken');
}

describe('AuthService', () => {
  let authService: AuthService;
  let mockPrismaService: MockPrismaService;
  let mockJwtService: MockJwtService;

  beforeEach(() => {
    mockPrismaService = new MockPrismaService();
    mockJwtService = new MockJwtService();
    authService = new AuthService(
      mockPrismaService as unknown as PrismaService,
      mockJwtService as unknown as JwtService,
    );
  });

  it('deve retornar null quando não encontrar o usuário', async () => {
    const result = await authService.validateUser(
      'email@inexistente.com',
      'senha123',
    );
    expect(result).toBeNull();
  });

  it('deve retornar null quando a senha não corresponder', async () => {
    mockPrismaService.user.findUnique.mockResolvedValueOnce({
      email: 'email@existente.com',
      password: await bcrypt.hash('senhaCorreta123', 10),
    });

    const result = await authService.validateUser(
      'email@existente.com',
      'senhaIncorreta123',
    );
    expect(result).toBeNull();
  });

  it('deve retornar dados do usuário (exceto senha) quando email e senha são válidos', async () => {
    const userMock = {
      id: '1',
      email: 'email@existente.com',
      password: await bcrypt.hash('senha123', 10),
      licenses: [{ valid: true }],
    };
    mockPrismaService.user.findUnique.mockResolvedValueOnce(userMock);

    const result = await authService.validateUser(
      'email@existente.com',
      'senha123',
    );
    expect(result).toMatchObject({
      id: userMock.id,
      email: userMock.email,
    });
  });

  it('deve retornar um token de acesso válido ao fazer login com um usuário válido', async () => {
    const userMock = {
      id: '1',
      email: 'usuario@valido.com',
    };

    const loginResult = await authService.login(userMock);

    expect(loginResult).toHaveProperty('access_token', 'mockedJwtToken');

    expect(mockJwtService.sign).toHaveBeenCalledWith(
      {
        email: userMock.email,
        sub: userMock.id,
      },
      expect.objectContaining({
        expiresIn: '60m',
        privateKey: expect.any(String),
      }),
    );
  });
});
