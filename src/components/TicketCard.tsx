import { TicketIcon, CalendarIcon, ClockIcon, MapPinIcon, UserIcon, QrCodeIcon } from "@heroicons/react/24/outline";

interface TicketCardProps {
  eventName: string;
  eventDate: string;
  eventTime: string;
  seats: string[];
  userName: string;
}

export const TicketCard = ({ eventName, eventDate, eventTime, seats, userName }: TicketCardProps) => {
  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_30px_hsl(var(--ted-red)/0.1)]">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-widest">TEDxAUC Event Ticket</p>
            <h3 className="text-2xl font-bold gradient-text mt-1">{eventName}</h3>
          </div>
          <TicketIcon className="h-8 w-8 text-muted-foreground" />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-start space-x-2">
            <UserIcon className="h-4 w-4 mt-1 text-primary flex-shrink-0" />
            <div>
              <p className="font-semibold text-muted-foreground">Attendee</p>
              <p className="font-bold text-foreground">{userName}</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            {/* FIX APPLIED: Removed the extra <p> tag that was mis-used for seat count */}
            <div className="h-4 w-4 mt-1 text-primary flex-shrink-0 flex items-center justify-center">
                <span className="text-sm font-bold">{seats.length}</span>
            </div>
            <div>
              <p className="font-semibold text-muted-foreground">Seat(s)</p>
              <p className="font-bold text-foreground">{seats.join(", ")}</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <CalendarIcon className="h-4 w-4 mt-1 text-primary flex-shrink-0" />
            <div>
              <p className="font-semibold text-muted-foreground">Date</p>
              <p className="font-bold text-foreground">{eventDate}</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <ClockIcon className="h-4 w-4 mt-1 text-primary flex-shrink-0" />
            <div>
              <p className="font-semibold text-muted-foreground">Time</p>
              <p className="font-bold text-foreground">{eventTime}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-muted/30 px-6 py-4 flex items-center justify-between">
        <p className="text-xs text-muted-foreground max-w-xs">
          <strong>Note:</strong> Please show this ticket or your confirmation email at the event gate. Both are valid for entry.
        </p>
        <QrCodeIcon className="h-10 w-10 text-muted-foreground" />
      </div>
    </div>
  );
};