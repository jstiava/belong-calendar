import '@testing-library/jest-dom';
import { Hours } from './medici';
import dayjs from 'dayjs';
import Chronos from './chronos';

test('test remove', () => {


    const first = new Hours("Mon-Fri: 8am-5pm");
    const second = new Hours("Mon-Thu: 8am-4pm");

    const third = first.add({
        start_time: new Chronos(6),
        end_time: new Chronos(10),
    });

    console.log(third);

    expect(1).toBe(1);
});

