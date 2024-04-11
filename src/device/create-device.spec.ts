import { DeviceService } from './device.service';
import { PrismaService } from '@/prisma.service';

class MockPrismaService {
  user = {
    findUnique: vi.fn((query) => {
      if (query.where.id === 'b57aa5f4-8723-4f8f-8ec4-0a6316dd7824') {
        return Promise.resolve({
          id: 'b57aa5f4-8723-4f8f-8ec4-0a6316dd7824',
          email: 'user@example.com',
          name: 'Existing User',
        });
      }
      return Promise.resolve(null);
    }),
    create: vi.fn().mockResolvedValue({
      userId: 'b57aa5f4-8723-4f8f-8ec4-0a6316dd7824',
    }),
    findMany: vi.fn(),
  };
  device = {
    findUnique: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({
      id: 'device1',
      name: 'Device 1',
      hostname: 'hostname1',
      os: 'OS1',
      version: 'v1.0',
      macNumber: '00:1A:22:3B:44:55',
      userId: 'b57aa5f4-8723-4f8f-8ec4-0a6316dd7824',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    findMany: vi.fn(),
  };
}

let deviceService: DeviceService;
let mockPrismaService: MockPrismaService;

beforeEach(() => {
  mockPrismaService = new MockPrismaService();
  deviceService = new DeviceService(
    mockPrismaService as unknown as PrismaService,
  );
});

describe('DeviceService', () => {
  it('deve criar um dispositivo com sucesso', async () => {
    const deviceData = {
      name: 'Device 1',
      hostname: 'hostname1',
      os: 'OS1',
      version: 'v1.0',
      macNumber: '00:1A:22:3B:44:55',
      userId: 'b57aa5f4-8723-4f8f-8ec4-0a6316dd7824',
    };

    const device = await deviceService.createDevice(deviceData);
    expect(device).toHaveProperty('id');
    expect(device.macNumber).toBe(deviceData.macNumber);
  });

  it('deve falhar ao tentar criar um dispositivo com MAC já existente', async () => {
    mockPrismaService.device.findUnique.mockResolvedValueOnce({
      id: 'device2',
      macNumber: '00:1A:22:3B:44:55',
    });

    const deviceData = {
      name: 'Device 2',
      hostname: 'hostname2',
      os: 'OS2',
      version: 'v2.0',
      macNumber: '00:1A:22:3B:44:55',
      userId: 'b57aa5f4-8723-4f8f-8ec4-0a6316dd7824',
    };

    await expect(deviceService.createDevice(deviceData)).rejects.toThrow(
      'Endereço de mac já está em uso',
    );
  });

  it('deve retornar uma lista de dispositivos', async () => {
    mockPrismaService.device.findMany.mockResolvedValueOnce([
      {
        id: 'device1',
        name: 'Device 1',
        hostname: 'hostname1',
        os: 'OS1',
        version: 'v1.0',
        macNumber: '00:1A:22:3B:44:55',
        userId: 'b57aa5f4-8723-4f8f-8ec4-0a6316dd7824',
      },
      {
        id: 'device2',
        name: 'Device 2',
        hostname: 'hostname2',
        os: 'OS2',
        version: 'v2.0',
        macNumber: '00:1A:22:3B:44:56',
        userId: 'b57aa5f4-8723-4f8f-8ec4-0a6316dd7824',
      },
    ]);

    const devices = await deviceService.getDevices();
    expect(Array.isArray(devices)).toBe(true);
    expect(devices).toHaveLength(2);
  });
});
