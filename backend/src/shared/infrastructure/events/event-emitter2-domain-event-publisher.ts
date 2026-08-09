import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DomainEventPublisher } from '../../application/ports/domain-event-publisher';
import { DomainEvent } from '../../domain/domain-event';

@Injectable()
export class EventEmitter2DomainEventPublisher extends DomainEventPublisher {
  // EventEmitter2 is registered globally by EventEmitterModule.forRoot() in
  // AppModule, so this single instance is shared app-wide: any context can
  // inject it (or just use `@OnEvent()`) to listen, regardless of which
  // context published the event. That's the whole point — publishing stays
  // behind our port (swappable later for a real broker), listening is plain
  // Nest-idiomatic `@OnEvent()`, no coupling to this adapter required.
  constructor(private readonly eventEmitter: EventEmitter2) {
    super();
  }

  // Not `async`: this in-process emit is sync, nothing to await. A future
  // broker adapter genuinely awaiting network I/O would use `async` here.
  publish(events: DomainEvent[]): Promise<void> {
    // Event name = constructor name (e.g. "UserRegisteredEvent") so a
    // listener anywhere in the app can subscribe by class name without a
    // hand-kept string registry.
    for (const event of events) {
      this.eventEmitter.emit(event.constructor.name, event);
    }
    return Promise.resolve();
  }
}
