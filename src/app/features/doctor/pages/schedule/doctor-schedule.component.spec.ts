import { of } from 'rxjs';
import { ScheduleService } from '../../../../core/services/schedule.service';
import { DoctorScheduleComponent } from './doctor-schedule.component';
import { clinicInstant } from '../../../../core/services/schedule-planning.service';
describe('Doctor schedule time states', () => {
    let component: DoctorScheduleComponent;
    beforeEach(() => { component = new DoctorScheduleComponent({ getMySchedules: () => of({ data: [] }) } as unknown as ScheduleService); component.now = clinicInstant('2030-01-01T10:00:00'); });
    it('does not label a past active schedule as open', () => {
        const ca = { id: 1, startAt: '2030-01-01T08:00:00', endAt: '2030-01-01T09:00:00', active: true, slots: [{ id: 1, startAt: '2030-01-01T08:00:00', endAt: '2030-01-01T08:30:00', status: 'AVAILABLE' as const }] };
        expect(component.scheduleLabel(ca)).toBe('Đã kết thúc');
        expect(component.slotLabel(ca.slots[0])).toBe('Đã qua giờ');
        expect(component.remaining(ca)).toBe(0);
        component.schedules = [ca];
        expect(component.visible).toEqual([]);
        component.filter = 'history';
        expect(component.visible).toEqual([ca]);
    });
    it('keeps booked history and excludes slots starting exactly now', () => {
        expect(component.slotLabel({ id: 1, startAt: '2030-01-01T09:00:00', endAt: '2030-01-01T09:30:00', status: 'BOOKED' })).toBe('Đã đặt');
        const ca = { id: 1, startAt: '2030-01-01T09:00:00', endAt: '2030-01-01T11:00:00', active: true, slots: [{ id: 2, startAt: '2030-01-01T10:00:00', endAt: '2030-01-01T10:30:00', status: 'AVAILABLE' as const }] };
        expect(component.scheduleLabel(ca)).toBe('Đang diễn ra');
        expect(component.remaining(ca)).toBe(0);
    });
    it('parses clinic timestamps independently from browser timezone', () => { expect(clinicInstant('2030-01-01T10:00:00')).toBe(Date.parse('2030-01-01T03:00:00Z')); });
});
