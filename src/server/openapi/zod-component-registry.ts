import { OpenApiGeneratorV3, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import {
  guestCreateBodySchema,
  guestResponseSchema,
  guestUpdateBodySchema,
} from '../../shared/schemas/guest';
import {
  daySheetLineSchema,
  daySheetReportResponseSchema,
  folioGuestSchema,
  folioReportResponseSchema,
  folioReservationDetailSchema,
  folioRoomSchema,
} from '../../shared/schemas/report';
import {
  reservationCreateBodySchema,
  reservationResponseSchema,
  reservationUpdateBodySchema,
} from '../../shared/schemas/reservation';
import {
  roomCreateBodySchema,
  roomResponseSchema,
  roomUpdateBodySchema,
} from '../../shared/schemas/room';

const registry = new OpenAPIRegistry();

registry.register('Guest', guestResponseSchema);
registry.register('GuestCreate', guestCreateBodySchema);
registry.register('GuestPatch', guestUpdateBodySchema);

registry.register('Room', roomResponseSchema);
registry.register('RoomCreate', roomCreateBodySchema);
registry.register('RoomPatch', roomUpdateBodySchema);

registry.register('Reservation', reservationResponseSchema);
registry.register('ReservationCreate', reservationCreateBodySchema);
registry.register('ReservationPatch', reservationUpdateBodySchema);

registry.register('FolioReport', folioReportResponseSchema);
registry.register('FolioReservationDetail', folioReservationDetailSchema);
registry.register('FolioGuest', folioGuestSchema);
registry.register('FolioRoom', folioRoomSchema);
registry.register('DaySheetReport', daySheetReportResponseSchema);
registry.register('DaySheetLine', daySheetLineSchema);

const generator = new OpenApiGeneratorV3(registry.definitions);

/** OpenAPI `components` object built from shared Zod schemas (single source of truth for DTO shapes). */
export function getStarHotelZodOpenApiComponents(): NonNullable<
  ReturnType<OpenApiGeneratorV3['generateComponents']>['components']
> {
  const { components } = generator.generateComponents();
  if (!components) {
    throw new Error('[star-hotel] OpenAPI component generation produced empty components');
  }
  return components;
}
