import { DaySheetReportPage } from '@renderer/pages/day-sheet-report-page';
import { FolioReportPage } from '@renderer/pages/folio-report-page';
import { GuestFormPage } from '@renderer/pages/guest-form-page';
import { GuestsListPage } from '@renderer/pages/guests-list-page';
import { HomePage } from '@renderer/pages/home-page';
import { ReservationFormPage } from '@renderer/pages/reservation-form-page';
import { ReservationsListPage } from '@renderer/pages/reservations-list-page';
import { RoomFormPage } from '@renderer/pages/room-form-page';
import { RoomsListPage } from '@renderer/pages/rooms-list-page';
import { devRouteDefinitions, isDevRoutesEnabled } from '@renderer/routes/dev-routes';
import type { JSX } from 'react';
import { Fragment } from 'react';
import { Route } from 'react-router-dom';

/**
 * Authenticated + AppShell subtree. Kept separate from {@link App} to reduce merge friction on route changes.
 */
export function AuthenticatedAppShellRoutes(): JSX.Element {
  return (
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
      <Route path="/reports/folio/:reservationId" element={<FolioReportPage />} />
      <Route path="/reports/day-sheet" element={<DaySheetReportPage />} />
      {isDevRoutesEnabled
        ? devRouteDefinitions.map(({ path, Page }) => (
            <Route key={path} path={path} element={<Page />} />
          ))
        : null}
    </Fragment>
  );
}
