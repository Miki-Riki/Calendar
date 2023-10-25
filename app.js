const calendar = document.getElementById('calendar');
const displayMonth = document.getElementById('month');
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const STORYBLOK_URL =
  'https://api.storyblok.com/v2/cdn/stories?starts_with=events&token=API_KEY';
let events;
const today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();

const updateURL = () => {
  const newURL = `?month=${currentMonth + 1}&year=${currentYear}`;
  window.history.pushState({}, '', newURL);
};

const loadEvents = async () => {
  const res = await fetch(STORYBLOK_URL);
  const { stories } = await res.json();
  events = stories.reduce((accumulator, event) => {
    const eventTime = new Date(event.content.time);
    const eventDate = new Date(eventTime.toDateString());
    accumulator[eventDate] = event.content;
    return accumulator;
  }, {});
  updateCalendar(currentMonth, currentYear, events);
};

loadEvents();

const makeCalendar = () => {
  const calendarHeader = document.getElementById('calendar_header');
  days.forEach((dayName) => {
    const day = document.createElement('div');
    day.classList.add('day_name');
    day.innerText = dayName;
    calendarHeader.appendChild(day);
  });

  for (let i = 0; i < 35; i++) {
    const day = document.createElement('div');
    day.classList.add('day');

    const dayText = document.createElement('p');
    dayText.classList.add("day_text");
    dayText.innerText = days[i % 7];

    const dayNumber = document.createElement('p');
    dayNumber.classList.add('day_number');

    const eventName = document.createElement('small');
    eventName.classList.add('event_name');

    const eventTime = document.createElement('small');
    eventTime.classList.add('event_time');

    day.appendChild(dayText);
    day.appendChild(dayNumber);
    day.appendChild(eventName);
    day.appendChild(eventTime);
    calendar.appendChild(day);
  }
};

const updateCalendar = (month, year, events) => {
  const dayElements = document.querySelectorAll('.day');
  const theFirst = new Date(year, month, 1);
  const theFirstDayOfWeek = theFirst.getDay();
  const monthName = theFirst.toLocaleString('en-US', { month: 'long' });
  const monthWithYear = `${year} - ${monthName}`;
  displayMonth.innerText = monthWithYear;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let dayCounter = 1;
  for (let i = 0; i < dayElements.length; i++) {
    const day = dayElements[i];
    const dayNumber = day.querySelector('.day_number');
    const eventName = day.querySelector('.event_name');
    const eventTime = day.querySelector('.event_time');

    day.classList.remove('current_day');
    if (i >= theFirstDayOfWeek && dayCounter <= daysInMonth) {
      const thisDate = new Date(year, month, dayCounter);

      if (events[thisDate]) {
        const event = events[thisDate];
        eventName.innerText = event.text; 
        eventName.classList.add('event-bg');

        eventTime.innerText = event.time.match(/\d{2}:\d{2}/);
        eventTime.classList.add('event-time-bg'); 
      } else {
        eventName.innerText = '';
        eventName.classList.remove('event-bg');
        
        eventTime.innerText = '';
        eventTime.classList.remove('event-time-bg');
      }

      dayNumber.innerText = dayCounter;
      dayCounter++;

      if (
        thisDate.getFullYear() === today.getFullYear() &&
        thisDate.getMonth() === today.getMonth() &&
        thisDate.getDate() === today.getDate()
      ) {
        day.classList.add('current_day');
      }
    } else {
      dayNumber.innerText = '';
      eventName.innerText = '';
      eventTime.innerText = '';
      eventName.classList.remove('event-bg');
    }
  }
};

const previousMonth = () => {
  if (currentMonth === 0) {
    currentMonth = 12;
    currentYear--;
  }
  updateCalendar(--currentMonth, currentYear, events);
  updateURL();
};

const nextMonth = () => {
  if (currentMonth === 11) {
    currentMonth = -1;
    currentYear++;
  }
  updateCalendar(++currentMonth, currentYear, events);
   updateURL();
};

const load = async () => {
  makeCalendar();
  updateCalendar(currentMonth, currentYear, {});
  await loadEvents();
  const urlParams = new URLSearchParams(window.location.search);
  const monthParam = urlParams.get('month');
  const yearParam = urlParams.get('year');
  if (monthParam && yearParam) {
    currentMonth = parseInt(monthParam) - 1;
    currentYear = parseInt(yearParam);
    updateCalendar(currentMonth, currentYear, events);
  }
};

load();