 <style>
        /* --- Grundläggande Stil & Tillgänglighet --- */
        :root {
            --color-text: #212529; --color-primary: #005A9C; --color-primary-light: #E6F0F6; --color-border: #DEE2E6; --color-focus-outline: #007BFF; --color-success: #198754; --color-danger: #DC3545; --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        body { font-family: var(--font-family); background-color: #E9ECEF; color: var(--color-text); line-height: 1.6; margin: 0; }
        main { max-width: 900px; margin: 2rem auto; background-color: #FFFFFF; padding: 2rem; border-radius: 8px; border: 1px solid var(--color-border); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); }
        h1, h2 { color: var(--color-primary); }
        :focus-visible { outline: 3px solid var(--color-focus-outline); outline-offset: 2px; border-radius: 4px; }

        /* --- Inloggningsskärm --- */
        .login-wrapper { display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 1rem; box-sizing: border-box; }
        .login-box { width: 100%; max-width: 450px; padding: 2.5rem; background-color: #FFFFFF; border-radius: 8px; border: 1px solid var(--color-border); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); text-align: center; }
        .login-box h1 { margin-top: 0; }
        .login-box form { margin-top: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
        .login-box label { font-weight: bold; text-align: left; font-size: 0.9rem; }
        .login-box input { padding: 0.8rem; font-size: 1.2rem; border: 1px solid var(--color-border); border-radius: 4px; }
        .login-box button { padding: 1rem; font-size: 1.1rem; border: none; border-radius: 4px; background-color: var(--color-primary); color: white; font-weight: bold; cursor: pointer; margin-top: 0.5rem; }

        /* --- Kalendervy --- */
        .calendar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .calendar-header h2 { margin: 0; font-size: 1.5rem; text-transform: capitalize; }
        .calendar-nav-btn { background: none; border: 1px solid var(--color-border); border-radius: 50%; width: 40px; height: 40px; cursor: pointer; display: flex; justify-content: center; align-items: center; }
        .calendar-nav-btn:hover { background-color: var(--color-primary-light); }
        .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.5rem; text-align: center; }
        .weekday-header { font-weight: bold; color: #6C757D; font-size: 0.9rem; }
        .day-cell { padding: 0.5rem 0; border: 1px solid transparent; border-radius: 4px; cursor: pointer; position: relative; }
        .day-cell:not(.empty):hover { background-color: var(--color-primary-light); border-color: var(--color-primary); }
        .day-cell.empty { cursor: default; }
        .day-cell .day-number { font-size: 1.1rem; }
        .day-cell .fully-booked-indicator { position: absolute; bottom: 5px; left: 50%; transform: translateX(-50%); width: 6px; height: 6px; background-color: var(--color-danger); border-radius: 50%; }

        /* --- Schemavy --- */
        .schedule-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
        .back-to-calendar-btn { padding: 0.5rem 1rem; background-color: #F1F3F5; border: 1px solid var(--color-border); border-radius: 4px; cursor: pointer; }
        .schedule-container { display: grid; grid-template-columns: 60px repeat(2, 1fr); gap: 0.5rem; }
        .header { font-weight: bold; padding: 0.5rem; text-align: center; }
        .time-label { grid-column: 1 / 2; text-align: right; padding-right: 1rem; font-size: 0.9rem; align-self: center; }
        .time-slot { padding: 1.2rem 0.5rem; border: 1px solid var(--color-border); border-radius: 4px; font-family: inherit; font-size: 1rem; cursor: pointer; text-align: center; }
        .time-slot.free { background-color: #FFFFFF; color: var(--color-primary); font-weight: bold; }
        .time-slot.free:hover { background-color: var(--color-primary-light); }
        .time-slot.booked { background-color: var(--color-danger); color: #FFFFFF; border-color: #B02A37; font-weight: bold; cursor: not-allowed; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
        .time-slot.blocked { background-color: #FAFAFA; border-style: dashed; color: #ADB5BD; cursor: not-allowed; }
        
        /* --- Diverse --- */
        .booking-dialog { border: 1px solid var(--color-border); border-radius: 8px; padding: 2rem; width: clamp(300px, 90vw, 500px); }
        .booking-dialog::backdrop { background-color: rgba(0, 0, 0, 0.5); }
        .booking-dialog h2 { margin-top: 0; }
        .booking-dialog form { display: flex; flex-direction: column; gap: 1rem; }
        .booking-dialog label { font-weight: bold; }
        .booking-dialog input { padding: 0.75rem; font-size: 1rem; border: 1px solid var(--color-border); border-radius: 4px; }
        .dialog-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }
        .dialog-actions button { padding: 0.75rem 1.5rem; border-radius: 4px; border: none; font-size: 1rem; cursor: pointer; }
        .dialog-actions .confirm-btn { background-color: var(--color-primary); color: white; }
        .dialog-actions .cancel-btn { background-color: #F1F3F5; color: var(--color-text); }
        .sr-announcement { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0; }
        
        /* --- Adminpanel --- */
        #admin-container { padding-top: 2rem; }
        .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
        .admin-header h1 { margin: 0; }
        .logout-btn { padding: 0.6rem 1.2rem; font-size: 1rem; background-color: #6C757D; color: white; border: none; border-radius: 4px; cursor: pointer; }
        .association-list { display: flex; flex-direction: column; }
        .association-row { display: flex; flex-direction: column; align-items: stretch; gap: 0.5rem; padding-bottom: 1.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--color-border); }
        .association-name { font-weight: bold; margin-bottom: 0.25rem; }
        .association-row input, .association-row .save-btn { padding: 0.75rem; font-size: 1rem; border-radius: 4px; }
        .association-row input { border: 1px solid var(--color-border); }
        .association-row .save-btn { background-color: var(--color-success); color: white; border: none; cursor: pointer; }
        
        /* --- Desktop-anpassningar --- */
        @media (min-width: 768px) {
            html { font-size: 115%; }
            main { max-width: 1200px; padding: 3rem; }
            body { padding: 2rem; }
            .schedule-container { grid-template-columns: 80px repeat(2, 1fr); gap: 1rem; }
            .time-slot { padding: 1.8rem; font-size: 1.2rem; }
            .booking-dialog { width: 600px; }
            .association-list { gap: 1.5rem; }
            .association-row { flex-direction: row; align-items: center; padding-bottom: 0; margin-bottom: 0; border-bottom: none; gap: 1rem; }
            .association-name { flex-basis: 250px; flex-shrink: 0; margin-bottom: 0; }
        }
    </style