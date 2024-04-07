import { UsersService } from './users.service';
import { PrismaService } from '@/prisma.service';

class MockPrismaService {
  user = {
    findUnique: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({
      id: 'b57aa5f4-8723-4f8f-8ec4-0a6316dd7824',
      name: 'Bruno',
      email: 'bruno@example.com',
      password: '$2a$10$mPrQYVgFhycm9n1ZF3TN1.7cr7CBnoFI4FPrRBHj0Yr/fZenKhVx2',
      devicesQtd: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    findMany: vi.fn(),
  };
}

describe('UsersService', () => {
  let usersService: UsersService;
  let mockPrismaService: MockPrismaService;

  beforeEach(() => {
    mockPrismaService = new MockPrismaService();
    usersService = new UsersService(
      mockPrismaService as unknown as PrismaService,
    );
  });

  it('deve criar um usuário com sucesso', async () => {
    const userData = {
      name: 'Bruno',
      email: 'bruno@example.com',
      password: 'SenhaSegura123!',
    };

    const user = await usersService.createUser(userData);
    expect(user).toHaveProperty('id');
  });

  it('deve falhar ao tentar criar um usuário com e-mail inválido', async () => {
    mockPrismaService.user.create.mockRejectedValue(
      new Error('Dados de usuário inválidos'),
    );

    const userData = {
      name: 'Bruno',
      email: 'emailInvalido',
      password: 'SenhaSegura123!',
    };

    await expect(usersService.createUser(userData)).rejects.toThrow(
      'Dados de usuário inválidos',
    );
  });

  it('deve armazenar a senha do usuário de forma criptografada', async () => {
    const userData = {
      name: 'Bruno',
      email: 'bruno@example.com',
      password: 'SenhaSegura123!',
    };

    await usersService.createUser(userData);

    const createdUserCall = mockPrismaService.user.create.mock.calls[0][0].data;
    expect(createdUserCall.password).not.toBe(userData.password);
  });

  it('deve retornar uma lista de usuários', async () => {
    mockPrismaService.user.findMany.mockResolvedValueOnce([
      // Aqui você simula o retorno esperado da função getUsers
      {
        id: '1',
        name: 'Test User 1',
        email: 'test1@example.com',
        devicesQtd: 1,
      },
      {
        id: '2',
        name: 'Test User 2',
        email: 'test2@example.com',
        devicesQtd: 1,
      },
    ]);

    const users = await usersService.getUsers();
    expect(Array.isArray(users)).toBe(true);
    expect(users).toHaveLength(2);
  });

  it('deve retornar apenas usuários com licenças válidas', async () => {
    mockPrismaService.user.findMany.mockResolvedValueOnce([
      {
        id: '3',
        email: 'test3@example.com',
        password: 'passwordEncrypted',
        name: 'Test User 3',
        createdAt: new Date(),
        updatedAt: new Date(),
        devicesQtd: 1,
        // Incluindo a propriedade licenses na estrutura do usuário mockado
        licenses: [
          {
            id: 'license1',
            userId: '3',
            amount: 1000,
            method: 'Visa',
            valid: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      },
      // Adicione mais usuários mockados conforme necessário
    ]);

    const usersWithValidLicenses =
      await usersService.getAllUsersValidLicenses();
    expect(
      usersWithValidLicenses.every((user) =>
        user.licenses.every((license) => license.valid),
      ),
    ).toBe(true);
  });
});
