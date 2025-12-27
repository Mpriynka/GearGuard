import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import MainLayout from '../layouts/MainLayout';
import { requestService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const localizer = momentLocalizer(moment);

const CalendarPage = () => {
    const [events, setEvents] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEvents = async () => {
            const start = moment().startOf('month').format('YYYY-MM-DD');
            const end = moment().endOf('month').format('YYYY-MM-DD');
            // Assuming getCalendar takes optional range or just use getAll and filter client side for now if calendar endpoint is strict
            // Actually getCalendar endpoint expects query params.
            try {
                const data = await requestService.getCalendar(start, end);
                // Transform to calendar events
                const mappedEvents = data.map(req => ({
                    id: req.id,
                    title: req.title,
                    start: new Date(req.scheduled_date || req.created_at),
                    end: new Date(req.scheduled_date || req.created_at), // Assuming 1 hr or daily
                    allDay: true,
                    resource: req
                }));
                setEvents(mappedEvents);
            } catch (e) {
                console.error(e);
            }
        };
        fetchEvents();
    }, []);

    const handleSelectEvent = (event) => {
        navigate(`/maintenance/${event.id}`);
    };

    return (
        <MainLayout>
            <div className="city" style={{ height: '80vh', background: 'white', padding: '1rem', borderRadius: '4px' }}>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    onSelectEvent={handleSelectEvent}
                />
            </div>
        </MainLayout>
    );
};

export default CalendarPage;
