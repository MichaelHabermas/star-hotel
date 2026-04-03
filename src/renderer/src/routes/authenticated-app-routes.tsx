import { ChangePasswordPage } from '@renderer/pages/change-password-page';
import { DaySheetReportPage } from '@renderer/pages/day-sheet-report-page';
import { FolioReportPage } from '@renderer/pages/folio-report-page';
import { GuestFormPage } from '@renderer/pages/guest-form-page';
import { GuestsListPage } from '@renderer/pages/guests-list-page';
import { HomePage } from '@renderer/pages/home-page';
import { ModuleAccessListPage } from '@renderer/pages/module-access-list-page';
import { ReportsHubPage } from '@renderer/pages/reports-hub-page';
import { ReservationFormPage } from '@renderer/pages/reservation-form-page';
import { ReservationsListPage } from '@renderer/pages/reservations-list-page';
import { RoomFormPage } from '@renderer/pages/room-form-page';
import { RoomsListPage } from '@renderer/pages/rooms-list-page';
import { UserModuleAccessPage } from '@renderer/pages/user-module-access-page';
import { UsersAdminPage } from '@renderer/pages/users-admin-page';
import { devRouteDefinitions, isDevRoutesEnabled } from '@renderer/routes/dev-routes';
import { RequireAdmin } from '@renderer/routes/require-auth';
import { Fragment } from 'react';
import { Route } from 'react-router-dom';

/**
 * Route elements for the authenticated + AppShell subtree (must be a fragment of {@link Route} nodes, not a wrapper component — React Router only accepts `<Route>` or `<Fragment>` here).
 */
export const authenticatedAppShellRoutes = (
  <Fragment>
    <Route path="/" element={<HomePage />} />
    <Route path="/reservations" element={<ReservationsListPage />} />
    <Route path="/reservations/new" element={<ReservationFormPage mode="create" />} />
    <Route path="/reservations/:reservationId" element={<ReservationFormPage mode="edit" />} />
    <Route path="/rooms" element={<RoomsListPage />} />
    <Route path="/rooms/new" element={<RoomFormPage mode="create" />} />
    <Route path="/rooms/:roomId" element={<RoomFormPage mode="edit" />} />
    <Route path="/guests" element={<GuestsListPage />} />
    <Route path="/guests/new" element={<GuestFormPage mode="create" />} />
    <Route path="/guests/:guestId" element={<GuestFormPage mode="edit" />} />
    <Route path="/reports" element={<ReportsHubPage />} />
    <Route path="/reports/folio/:reservationId" element={<FolioReportPage />} />
    <Route path="/reports/day-sheet" element={<DaySheetReportPage />} />
    <Route path="/account/password" element={<ChangePasswordPage />} />
    <Route element={<RequireAdmin />}>
      <Route path="/admin/users" element={<UsersAdminPage />} />
      <Route path="/admin/module-access" element={<ModuleAccessListPage />} />
      <Route path="/admin/users/:userId/access" element={<UserModuleAccessPage />} />
    </Route>
    {isDevRoutesEnabled
      ? devRouteDefinitions.map(({ path, Page }) => (
          <Route key={path} path={path} element={<Page />} />
        ))
      : null}
  </Fragment>
);
