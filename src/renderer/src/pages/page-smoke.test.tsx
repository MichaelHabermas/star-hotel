import { AuthTestRoot } from '@renderer/lib/auth-context';
import { StarHotelAppProvider } from '@renderer/lib/star-hotel-app-provider';
import { asStarHotelApp, createMockStarHotelApp } from '@renderer/test-utils/mock-star-hotel-app';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GuestFormPage } from './guest-form-page';
import { GuestsListPage } from './guests-list-page';
import { HomePage } from './home-page';
import { LoginPage } from './login-page';
import { RoomFormPage } from './room-form-page';
import { RoomsListPage } from './rooms-list-page';

vi.mock('@renderer/features/dashboard/room-dashboard', () => ({
  RoomDashboard: () => <div data-testid="room-dashboard" />,
}));

describe('page smoke (StarHotelApp boundary)', () => {
  afterEach(() => {
    cleanup();
  });

  it('LoginPage shows sign-in heading', () => {
    const app = createMockStarHotelApp();
    render(
      <MemoryRouter>
        <StarHotelAppProvider app={asStarHotelApp(app)}>
          <AuthTestRoot
            value={{
              token: null,
              user: null,
              setToken: vi.fn(),
              logout: vi.fn().mockResolvedValue(undefined),
            }}
          >
            <LoginPage />
          </AuthTestRoot>
        </StarHotelAppProvider>
      </MemoryRouter>,
    );
    expect(screen.getByRole('textbox', { name: /username/i })).toBeInTheDocument();
    expect(screen.getAllByText(/^Sign in$/i).length).toBeGreaterThanOrEqual(1);
  });

  it('HomePage shows room board', async () => {
    const app = createMockStarHotelApp();
    render(
      <MemoryRouter>
        <StarHotelAppProvider app={asStarHotelApp(app)}>
          <HomePage />
        </StarHotelAppProvider>
      </MemoryRouter>,
    );
    expect(await screen.findByRole('heading', { name: /room board/i })).toBeInTheDocument();
  });

  it('RoomsListPage shows room list heading', async () => {
    const app = createMockStarHotelApp();
    app.api.rooms.list.mockResolvedValue([]);
    render(
      <MemoryRouter initialEntries={['/rooms']}>
        <StarHotelAppProvider app={asStarHotelApp(app)}>
          <Routes>
            <Route path="/rooms" element={<RoomsListPage />} />
          </Routes>
        </StarHotelAppProvider>
      </MemoryRouter>,
    );
    expect(await screen.findByText(/room list/i)).toBeInTheDocument();
  });

  it('GuestsListPage shows guest directory heading', async () => {
    const app = createMockStarHotelApp();
    app.api.guests.list.mockResolvedValue([]);
    render(
      <MemoryRouter initialEntries={['/guests']}>
        <StarHotelAppProvider app={asStarHotelApp(app)}>
          <Routes>
            <Route path="/guests" element={<GuestsListPage />} />
          </Routes>
        </StarHotelAppProvider>
      </MemoryRouter>,
    );
    expect(await screen.findByText(/guest directory/i)).toBeInTheDocument();
  });

  it('RoomFormPage create shows New room', async () => {
    const app = createMockStarHotelApp();
    render(
      <MemoryRouter initialEntries={['/rooms/new']}>
        <StarHotelAppProvider app={asStarHotelApp(app)}>
          <Routes>
            <Route path="/rooms/new" element={<RoomFormPage mode="create" />} />
          </Routes>
        </StarHotelAppProvider>
      </MemoryRouter>,
    );
    expect(await screen.findByText(/^New room$/i)).toBeInTheDocument();
  });

  it('GuestFormPage create shows New guest', async () => {
    const app = createMockStarHotelApp();
    render(
      <MemoryRouter initialEntries={['/guests/new']}>
        <StarHotelAppProvider app={asStarHotelApp(app)}>
          <Routes>
            <Route path="/guests/new" element={<GuestFormPage mode="create" />} />
          </Routes>
        </StarHotelAppProvider>
      </MemoryRouter>,
    );
    expect(await screen.findByText(/^New guest$/i)).toBeInTheDocument();
  });
});
