import { EventEmitter2 } from '@nestjs/event-emitter';
import { DomainEvent } from '../../domain/domain-event';
import { Identifier } from '../../domain/identifier';
import { EventEmitter2DomainEventPublisher } from './event-emitter2-domain-event-publisher';

class TestEvent extends DomainEvent {}

describe('EventEmitter2DomainEventPublisher', () => {
  it('notifies a listener subscribed to the event class name', async () => {
    const eventEmitter = new EventEmitter2();
    const publisher = new EventEmitter2DomainEventPublisher(eventEmitter);
    const listener = jest.fn();
    const event = new TestEvent(Identifier.generate(), new Date());

    eventEmitter.on('TestEvent', listener);
    await publisher.publish([event]);

    expect(listener).toHaveBeenCalledWith(event);
  });

  it('does not notify a listener subscribed to a different event class', async () => {
    const eventEmitter = new EventEmitter2();
    const publisher = new EventEmitter2DomainEventPublisher(eventEmitter);
    const listener = jest.fn();
    const event = new TestEvent(Identifier.generate(), new Date());

    eventEmitter.on('OtherEvent', listener);
    await publisher.publish([event]);

    expect(listener).not.toHaveBeenCalled();
  });

  it('publishes multiple events in order', async () => {
    const eventEmitter = new EventEmitter2();
    const publisher = new EventEmitter2DomainEventPublisher(eventEmitter);
    const seen: DomainEvent[] = [];
    const first = new TestEvent(Identifier.generate(), new Date());
    const second = new TestEvent(Identifier.generate(), new Date());

    eventEmitter.on('TestEvent', (event: DomainEvent) => seen.push(event));
    await publisher.publish([first, second]);

    expect(seen).toEqual([first, second]);
  });
});
