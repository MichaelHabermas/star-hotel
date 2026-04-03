import { Button } from '@renderer/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@renderer/components/ui/card';
import { FileText, Table2 } from 'lucide-react';
import type { JSX } from 'react';
import { Link } from 'react-router-dom';

export function ReportsHubPage(): JSX.Element {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="font-display text-foreground text-2xl font-semibold tracking-tight">
          Report desk
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Operational print views for the legacy F2 report path.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-border/80 border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="font-ui flex items-center gap-2 text-base">
              <Table2 className="size-4" aria-hidden />
              Day sheet
            </CardTitle>
            <CardDescription>Occupancy and arrivals for a calendar date.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="button" asChild>
              <Link to="/reports/day-sheet">Open day sheet</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="font-ui flex items-center gap-2 text-base">
              <FileText className="size-4" aria-hidden />
              Guest folio
            </CardTitle>
            <CardDescription>
              Open from a reservation row (receipt / folio for one stay).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="button" variant="secondary" asChild>
              <Link to="/reservations">Pick a reservation</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
