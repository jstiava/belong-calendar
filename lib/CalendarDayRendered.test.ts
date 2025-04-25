import '@testing-library/jest-dom';
import CalendarDay from './CalendarDay';
import MinHeap from './MinHeap';
import { Event, EventData, Schedule } from "@/schema";
import Chronos from './utils/chronos';
import dayjs from 'dayjs';
import CalendarDayRendered from './CalendarDayRendered';
import { CalendarDays } from './CalendarDays';



test('load schedules into Calendar Days', () => {
    const days = new CalendarDays<CalendarDay>(dayjs(), dayjs().add(1, 'month'), (x) => new CalendarDay(x));

    for (const eventData of exampleData) {
        const event = new Event(eventData, true)
        days.add(event);
    }

    console.log(exampleData)

    const today = days.getOrCreate(dayjs().yyyymmdd())

    expect(today.events.length).toBe(5)
});


test('load schedules into Calendar Days, and then Calendar Day Rendered', () => {
    const days = new CalendarDays<CalendarDay>(dayjs(), dayjs().add(1, 'month'), (x) => new CalendarDay(x));
    for (const eventData of exampleData) {
        const event = new Event(eventData, true)
        days.add(event);
    }

    const today = days.getOrCreate(dayjs().yyyymmdd());
    const renderedDay = new CalendarDayRendered(dayjs().yyyymmdd(), today);

    console.log(renderedDay.chaos)

    expect(renderedDay.chaos.length).toBeGreaterThan(0)
});



const exampleData : EventData[] = [
    {
      "uuid": "4fa36667-1e45-4753-bad5-c2f6455c48f0",
      "name": "Coffeestamp at Grounds for Change",
      "location_name": null,
      "location_address": null,
      "location_place_id": null,
      "end_location_name": null,
      "end_location_address": null,
      "end_location_place_id": null,
      "start_time": null,
      "end_time": null,
      "date": null,
      "end_date": null,
      "cover_img": null,
      "icon_img": {
        "path": "groups/f2ea4a41-a7d8-4666-95ec-f4575b000d6a/3df87b85-aa13-4721-a077-11a022005cbc.png",
        "path_quick": "null",
        "display_type": "portrait",
        "blur_hash": "null",
        "storage": "s3_media"
      },
      "wordmark_img": {
        "path": "groups/f2ea4a41-a7d8-4666-95ec-f4575b000d6a/f8132eb6-e044-4ed9-8684-6eca1fca6f13.webp",
        "path_quick": "null",
        "display_type": "wordmark",
        "blur_hash": "null",
        "storage": "s3_media"
      },
      "attachment_img": null,
      "theme_color": "#dbb88c",
      "search_vectors": null,
      "event_type": "standard",
      "link": null,
      "quantity": null,
      "capacity": null,
      "junctions": [
        {
          "uuid": "67ccc695-8076-440e-80a0-dc9abb306212",
          "group_id": null,
          "event_id": "f2ea4a41-a7d8-4666-95ec-f4575b000d6a",
          "child_event_id": "4fa36667-1e45-4753-bad5-c2f6455c48f0",
          "location_id": null,
          "certificate_id": null,
          "certificate_wild_card": true,
          "directionality": "from_child_event_to",
          "is_public": false,
          "status": "accepted",
          "is_expanded": false,
          "order_index": null,
          "is_shown": true,
          "created_on": "2025-03-20T17:17:36.737244",
          "last_updated_on": "2025-03-20T17:17:49.041288",
          "from": {
            "uuid": "4fa36667-1e45-4753-bad5-c2f6455c48f0",
            "type": "Event",
            "column": "child_event_id",
            "directionality": "from_child_event_to"
          },
          "to": {
            "uuid": "f2ea4a41-a7d8-4666-95ec-f4575b000d6a",
            "type": "Event",
            "column": "event_id",
            "directionality": "from_event_to"
          }
        }
      ],
      "schedules": [
        {
          "junctions": {},
          "metadata": {},
          "theme_color": null,
          "type": "Schedule",
          "days": [
            0,
            2,
            2,
            2,
            2,
            2,
            0
          ],
          "uuid": "73e6db56-d4fc-4440-8aa0-61daa719672c",
          "name": "Regular Hours",
          "start_date": 20250319,
          "end_date": null,
          "schedule_type": "regular",
          "event_id": "4fa36667-1e45-4753-bad5-c2f6455c48f0",
          "location_id": null,
          "as_text": "Mon-Fri: 8am-4pm",
          "hours": [
            {
              "min": 8,
              "max": 16,
              "breaks": []
            }
          ]
        }
      ],
      "type": "Event",
      "children": null,
      "metadata": {},
      "isVisible": false,
      "version": 0,
      "attendees": null
    },
    {
      "uuid": "a1df1f2e-94f9-4021-aa1c-9f3909e1a1d1",
      "name": "The Fattened Caf",
      "location_name": null,
      "location_address": null,
      "location_place_id": null,
      "end_location_name": null,
      "end_location_address": null,
      "end_location_place_id": null,
      "start_time": null,
      "end_time": null,
      "date": null,
      "end_date": null,
      "cover_img": null,
      "icon_img": {
        "path": "groups/f2ea4a41-a7d8-4666-95ec-f4575b000d6a/25081852-24f8-4200-bdcd-c56e4c37cf69.png",
        "path_quick": "null",
        "display_type": "portrait",
        "blur_hash": "null",
        "storage": "s3_media"
      },
      "wordmark_img": {
        "path": "groups/a1df1f2e-94f9-4021-aa1c-9f3909e1a1d1/104e4bbb-2da7-4775-bf31-6a30022f028f.png",
        "path_quick": "null",
        "display_type": "wordmark",
        "blur_hash": "null",
        "storage": "s3_media"
      },
      "attachment_img": null,
      "theme_color": "#32736f",
      "search_vectors": null,
      "event_type": "standard",
      "link": null,
      "quantity": null,
      "capacity": null,
      "junctions": [
        {
          "uuid": "2438c6e6-2b4d-48e5-8dd8-5baf396c8970",
          "group_id": null,
          "event_id": "f2ea4a41-a7d8-4666-95ec-f4575b000d6a",
          "child_event_id": "a1df1f2e-94f9-4021-aa1c-9f3909e1a1d1",
          "location_id": null,
          "certificate_id": null,
          "certificate_wild_card": true,
          "directionality": "from_child_event_to",
          "is_public": false,
          "status": "accepted",
          "is_expanded": false,
          "order_index": null,
          "is_shown": true,
          "created_on": "2025-03-20T17:17:36.737244",
          "last_updated_on": "2025-03-20T17:17:49.041288",
          "from": {
            "uuid": "a1df1f2e-94f9-4021-aa1c-9f3909e1a1d1",
            "type": "Event",
            "column": "child_event_id",
            "directionality": "from_child_event_to"
          },
          "to": {
            "uuid": "f2ea4a41-a7d8-4666-95ec-f4575b000d6a",
            "type": "Event",
            "column": "event_id",
            "directionality": "from_event_to"
          }
        }
      ],
      "schedules": [
        {
          "junctions": {},
          "metadata": {},
          "theme_color": null,
          "type": "Schedule",
          "days": [
            0,
            2,
            2,
            2,
            2,
            2,
            0
          ],
          "uuid": "da2e25b2-42d8-4af2-8a8f-0790ec05c436",
          "name": "Regular Hours",
          "start_date": 20250319,
          "end_date": null,
          "schedule_type": "regular",
          "event_id": "a1df1f2e-94f9-4021-aa1c-9f3909e1a1d1",
          "location_id": null,
          "as_text": "Mon-Fri: 8am-4pm",
          "hours": [
            {
              "min": 8,
              "max": 16,
              "breaks": []
            }
          ]
        }
      ],
      "type": "Event",
      "children": null,
      "metadata": {},
      "isVisible": false,
      "version": 0,
      "attendees": null
    },
    {
      "uuid": "b87c8c00-6d8b-466c-ad0b-76a13c15af8c",
      "name": "Bears' Den",
      "location_name": null,
      "location_address": null,
      "location_place_id": null,
      "end_location_name": null,
      "end_location_address": null,
      "end_location_place_id": null,
      "start_time": null,
      "end_time": null,
      "date": null,
      "end_date": null,
      "cover_img": null,
      "icon_img": {
        "path": "groups/f2ea4a41-a7d8-4666-95ec-f4575b000d6a/e57baaa3-fa69-4aa0-bc4d-391d54deda2c.png",
        "path_quick": "null",
        "display_type": "portrait",
        "blur_hash": "null",
        "storage": "s3_media"
      },
      "wordmark_img": null,
      "attachment_img": null,
      "theme_color": "#f3a01b",
      "search_vectors": null,
      "event_type": "standard",
      "link": null,
      "quantity": null,
      "capacity": null,
      "junctions": [
        {
          "uuid": "421e57cd-f8e5-4102-ad8b-ec2524107d10",
          "group_id": null,
          "event_id": "f2ea4a41-a7d8-4666-95ec-f4575b000d6a",
          "child_event_id": "b87c8c00-6d8b-466c-ad0b-76a13c15af8c",
          "location_id": null,
          "certificate_id": null,
          "certificate_wild_card": true,
          "directionality": "from_child_event_to",
          "is_public": false,
          "status": "accepted",
          "is_expanded": false,
          "order_index": null,
          "is_shown": true,
          "created_on": "2025-03-20T17:17:36.737244",
          "last_updated_on": "2025-03-20T17:17:49.041288",
          "from": {
            "uuid": "b87c8c00-6d8b-466c-ad0b-76a13c15af8c",
            "type": "Event",
            "column": "child_event_id",
            "directionality": "from_child_event_to"
          },
          "to": {
            "uuid": "f2ea4a41-a7d8-4666-95ec-f4575b000d6a",
            "type": "Event",
            "column": "event_id",
            "directionality": "from_event_to"
          }
        }
      ],
      "schedules": [
        {
          "junctions": {},
          "metadata": {},
          "theme_color": null,
          "type": "Schedule",
          "days": [
            0,
            2,
            2,
            2,
            2,
            2,
            0
          ],
          "uuid": "56aa2118-52c3-49f9-9398-cf81f530d0d4",
          "name": "Regular Hours",
          "start_date": 20250319,
          "end_date": null,
          "schedule_type": "regular",
          "event_id": "b87c8c00-6d8b-466c-ad0b-76a13c15af8c",
          "location_id": null,
          "as_text": "Mon – Fri: 7:30 AM – 9:00 PM\nSat – Sun: Closed",
          "hours": [
            {
              "min": 7.5,
              "max": 21,
              "breaks": []
            }
          ]
        }
      ],
      "type": "Event",
      "children": null,
      "metadata": {},
      "isVisible": false,
      "version": 0,
      "attendees": null
    },
    {
      "uuid": "bdb031a4-736b-40cc-b347-ada32663caa5",
      "name": "Village Cafe",
      "location_name": null,
      "location_address": null,
      "location_place_id": null,
      "end_location_name": null,
      "end_location_address": null,
      "end_location_place_id": null,
      "start_time": null,
      "end_time": null,
      "date": null,
      "end_date": null,
      "cover_img": null,
      "icon_img": null,
      "wordmark_img": null,
      "attachment_img": null,
      "theme_color": "#a51417",
      "search_vectors": null,
      "event_type": "standard",
      "link": null,
      "quantity": null,
      "capacity": null,
      "junctions": [
        {
          "uuid": "105862ed-bb5e-4c9e-8032-029c3c6094e7",
          "group_id": null,
          "event_id": "f2ea4a41-a7d8-4666-95ec-f4575b000d6a",
          "child_event_id": "bdb031a4-736b-40cc-b347-ada32663caa5",
          "location_id": null,
          "certificate_id": null,
          "certificate_wild_card": true,
          "directionality": "from_child_event_to",
          "is_public": false,
          "status": "accepted",
          "is_expanded": false,
          "order_index": null,
          "is_shown": true,
          "created_on": "2025-03-20T17:17:36.737244",
          "last_updated_on": "2025-03-20T17:17:49.041288",
          "from": {
            "uuid": "bdb031a4-736b-40cc-b347-ada32663caa5",
            "type": "Event",
            "column": "child_event_id",
            "directionality": "from_child_event_to"
          },
          "to": {
            "uuid": "f2ea4a41-a7d8-4666-95ec-f4575b000d6a",
            "type": "Event",
            "column": "event_id",
            "directionality": "from_event_to"
          }
        }
      ],
      "schedules": [
        {
          "junctions": {},
          "metadata": {},
          "theme_color": null,
          "type": "Schedule",
          "days": [
            0,
            2,
            2,
            2,
            2,
            2,
            0
          ],
          "uuid": "da406266-3400-44d5-b984-cd6b1203d9ef",
          "name": "Regular Hours",
          "start_date": 20250324,
          "end_date": null,
          "schedule_type": "regular",
          "event_id": "bdb031a4-736b-40cc-b347-ada32663caa5",
          "location_id": null,
          "as_text": "Mon-Fri: 8am-5pm",
          "hours": [
            {
              "min": 8,
              "max": 17,
              "breaks": []
            }
          ]
        }
      ],
      "type": "Event",
      "children": null,
      "metadata": {},
      "isVisible": false,
      "version": 0,
      "attendees": null
    },
    {
      "uuid": "d47ae3c6-c043-4fdd-811c-2ee4cb96080c",
      "name": "Collins Farms \nat Law Cafe",
      "location_name": null,
      "location_address": null,
      "location_place_id": null,
      "end_location_name": null,
      "end_location_address": null,
      "end_location_place_id": null,
      "start_time": null,
      "end_time": null,
      "date": null,
      "end_date": null,
      "cover_img": {
        "path": "groups/dining_services/e05388d0-b768-418d-9d4c-23ef448ea593.jpg",
        "path_quick": "null",
        "display_type": "cover",
        "blur_hash": "null",
        "storage": "s3_media"
      },
      "icon_img": {
        "path": "groups/d47ae3c6-c043-4fdd-811c-2ee4cb96080c/86f9fc6e-7969-4044-b4a5-fc10a84a31cc.png",
        "path_quick": "null",
        "display_type": "portrait",
        "blur_hash": "null",
        "storage": "s3_media"
      },
      "wordmark_img": {
        "path": "groups/d47ae3c6-c043-4fdd-811c-2ee4cb96080c/3f5eebb6-e82e-4ee5-8531-553f13a1df21.png",
        "path_quick": "null",
        "display_type": "wordmark",
        "blur_hash": "null",
        "storage": "s3_media"
      },
      "attachment_img": null,
      "theme_color": "#d67f7d",
      "search_vectors": null,
      "event_type": "standard",
      "link": null,
      "quantity": null,
      "capacity": null,
      "junctions": [
        {
          "uuid": "2c085cb8-d96f-435f-9b77-fa6c7b956d17",
          "group_id": null,
          "event_id": "f2ea4a41-a7d8-4666-95ec-f4575b000d6a",
          "child_event_id": "d47ae3c6-c043-4fdd-811c-2ee4cb96080c",
          "location_id": null,
          "certificate_id": null,
          "certificate_wild_card": true,
          "directionality": "from_child_event_to",
          "is_public": false,
          "status": "accepted",
          "is_expanded": false,
          "order_index": null,
          "is_shown": true,
          "created_on": "2025-03-20T17:17:36.737244",
          "last_updated_on": "2025-03-20T17:17:49.041288",
          "from": {
            "uuid": "d47ae3c6-c043-4fdd-811c-2ee4cb96080c",
            "type": "Event",
            "column": "child_event_id",
            "directionality": "from_child_event_to"
          },
          "to": {
            "uuid": "f2ea4a41-a7d8-4666-95ec-f4575b000d6a",
            "type": "Event",
            "column": "event_id",
            "directionality": "from_event_to"
          }
        }
      ],
      "schedules": [
        {
          "junctions": {},
          "metadata": {},
          "theme_color": null,
          "type": "Schedule",
          "days": [
            0,
            2,
            2,
            2,
            2,
            2,
            0
          ],
          "uuid": "d3c87339-97d5-4a1c-8e7d-67f0a8fe46ed",
          "name": "Regular Hours",
          "start_date": 20250319,
          "end_date": null,
          "schedule_type": "regular",
          "event_id": "d47ae3c6-c043-4fdd-811c-2ee4cb96080c",
          "location_id": null,
          "as_text": "Mon – Fri: 7:30 AM – 3:00 PM\nSat – Sun: Closed",
          "hours": [
            {
              "min": 7.5,
              "max": 15,
              "breaks": []
            }
          ]
        }
      ],
      "type": "Event",
      "children": null,
      "metadata": {},
      "isVisible": false,
      "version": 0,
      "attendees": null
    }
  ]