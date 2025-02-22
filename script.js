// Store the clocks that are currently displayed
let activeClocks = [
    { timezone: 'America/New_York', name: 'New York' },
    { timezone: 'Europe/London', name: 'London' },
    { timezone: 'Asia/Tokyo', name: 'Tokyo' },
    { timezone: 'Australia/Sydney', name: 'Sydney' }
];

// Emoji map for regions
const regionEmojis = {
    'America': '🌎',
    'Europe': '🌍',
    'Asia': '🌏',
    'Australia': '🌏',
    'Pacific': '🌏',
    'Africa': '🌍'
};

// Get region from timezone
function getRegionFromTimezone(timezone) {
    const region = timezone.split('/')[0];
    return regionEmojis[region] || '🌐';
}

// Function to create a clock element with more details and analog clock
function createClockElement(timezone, cityName) {
    const clockDiv = document.createElement('div');
    clockDiv.className = 'clock';
    clockDiv.dataset.timezone = timezone;

    // Add background icon element
    const bgIcon = document.createElement('div');
    bgIcon.className = 'clock-background';
    bgIcon.innerHTML = getRegionFromTimezone(timezone);
    clockDiv.appendChild(bgIcon);

    // Create city heading with flag/region emoji
    const cityDiv = document.createElement('div');
    cityDiv.className = 'city';
    cityDiv.innerHTML = `${getRegionFromTimezone(timezone)} ${cityName}`;
    clockDiv.appendChild(cityDiv);

    // Add timezone info
    const timezoneDiv = document.createElement('div');
    timezoneDiv.className = 'timezone';
    timezoneDiv.textContent = timezone.replace('_', ' ');
    clockDiv.appendChild(timezoneDiv);

    // Add digital time and date display
    const timeDiv = document.createElement('div');
    timeDiv.className = 'time';
    clockDiv.appendChild(timeDiv);

    const dateDiv = document.createElement('div');
    dateDiv.className = 'date';
    clockDiv.appendChild(dateDiv);

    // Create analog clock
    const analogClock = document.createElement('div');
    analogClock.className = 'analog-clock';

    // Add clock markers (hour marks)
    for (let i = 1; i <= 12; i++) {
        const marker = document.createElement('div');
        marker.className = i % 3 === 0 ? 'clock-marker main' : 'clock-marker';
        analogClock.appendChild(marker);
    }

    // Add clock hands
    const hourHand = document.createElement('div');
    hourHand.className = 'hour-hand';

    const minuteHand = document.createElement('div');
    minuteHand.className = 'minute-hand';

    const secondHand = document.createElement('div');
    secondHand.className = 'second-hand';

    const clockCenter = document.createElement('div');
    clockCenter.className = 'clock-center';

    analogClock.appendChild(hourHand);
    analogClock.appendChild(minuteHand);
    analogClock.appendChild(secondHand);
    analogClock.appendChild(clockCenter);

    // Add time difference indicator
    const clockFooter = document.createElement('div');
    clockFooter.className = 'clock-footer';

    const timeDifference = document.createElement('div');
    timeDifference.className = 'time-difference';
    clockFooter.appendChild(timeDifference);

    // Add clock actions
    const clockActions = document.createElement('div');
    clockActions.className = 'clock-actions';

    const favoriteBtn = document.createElement('button');
    favoriteBtn.className = 'btn-icon';
    favoriteBtn.innerHTML = '<i class="far fa-star"></i>';
    favoriteBtn.title = 'Add to favorites';
    favoriteBtn.addEventListener('click', () => {
        const icon = favoriteBtn.querySelector('i');
        if (icon.classList.contains('far')) {
            icon.classList.replace('far', 'fas');
            icon.style.color = '#f6ad55';
        } else {
            icon.classList.replace('fas', 'far');
            icon.style.color = '';
        }
    });
    clockActions.appendChild(favoriteBtn);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'btn-icon';
    removeBtn.innerHTML = '<i class="fas fa-times"></i>';
    removeBtn.title = 'Remove clock';
    removeBtn.addEventListener('click', () => {
        clockDiv.style.animation = 'fadeIn 0.5s ease-out reverse forwards';
        setTimeout(() => {
            clockDiv.remove();
            activeClocks = activeClocks.filter(clock => clock.timezone !== timezone);
            updateWorldMapMarkers(map); // Update markers after removing clock
        }, 500);
    });
    clockActions.appendChild(removeBtn);

    clockFooter.appendChild(clockActions);

    // Add all elements to the clock div
    clockDiv.appendChild(analogClock);
    clockDiv.appendChild(clockFooter);

    return clockDiv;
}

// Calculate time difference between local time and another timezone
function calculateTimeDifference(timezone) {
    const localTime = new Date();
    const localOffset = localTime.getTimezoneOffset() * 60000;
    const targetTime = new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));

    // Get UTC timestamps and calculate difference in hours
    const utcLocal = localTime.getTime() + localOffset;
    const utcTarget = targetTime.getTime() + localOffset;
    const diffHours = Math.round((utcTarget - utcLocal) / 3600000);

    if (diffHours === 0) {
        return 'Same time as local';
    } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ahead`;
    } else {
        return `${Math.abs(diffHours)} hour${Math.abs(diffHours) !== 1 ? 's' : ''} behind`;
    }
}

// Update all clocks
function updateClocks() {
    const now = new Date();

    // Update each clock
    activeClocks.forEach(clock => {
        // Find the clock element
        const clockElement = document.querySelector(`.clock[data-timezone="${clock.timezone}"]`);
        if (!clockElement) return;

        // Format the time for the specific timezone
        const options = {
            timeZone: clock.timezone,
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        };

        const timeString = now.toLocaleTimeString('en-US', options);

        // Format the date for the specific timezone
        const dateOptions = {
            timeZone: clock.timezone,
            weekday: 'long',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };

        const dateString = now.toLocaleDateString('en-US', dateOptions);

        // Update the digital clock display
        clockElement.querySelector('.time').textContent = timeString;
        clockElement.querySelector('.date').textContent = dateString;

        // Update the time difference
        const timeDiff = calculateTimeDifference(clock.timezone);
        clockElement.querySelector('.time-difference').textContent = timeDiff;

        // Get time components for analog clock
        const timeParts = now.toLocaleString('en-US', {
            timeZone: clock.timezone,
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: false
        }).split(/[:\s]/);

        let hours = parseInt(timeParts[0]);
        if (timeParts.length > 3 && timeParts[3].toLowerCase() === 'pm' && hours < 12) {
            hours += 12;
        }
        const minutes = parseInt(timeParts[1]);
        const seconds = parseInt(timeParts[2]);

        // Calculate angles for clock hands
        const hourAngle = (hours % 12) * 30 + minutes * 0.5;
        const minuteAngle = minutes * 6;
        const secondAngle = seconds * 6;

        // Update analog clock hands
        const hourHand = clockElement.querySelector('.hour-hand');
        const minuteHand = clockElement.querySelector('.minute-hand');
        const secondHand = clockElement.querySelector('.second-hand');

        hourHand.style.transform = `rotate(${hourAngle}deg)`;
        minuteHand.style.transform = `rotate(${minuteAngle}deg)`;
        secondHand.style.transform = `rotate(${secondAngle}deg)`;
    });

    // Update local time in footer
    const localTimeElement = document.getElementById('localTime');
    localTimeElement.textContent = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// Initialize the Leaflet map
let map; // Global map variable

function initializeWorldMap() {
    // Initialize the map
    map = L.map('world-map').setView([20, 0], 2);

    // Add a tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add markers for active clocks
    updateWorldMapMarkers(map);
}

// Update clock markers on the map
function updateWorldMapMarkers(map) {
    // Remove existing markers (if any)
    if (map.markers) {
        map.markers.forEach(marker => marker.remove());
    }
    map.markers = [];

    // Approximate coordinates for common timezones
    const timezoneCoordinates = {
        'America/New_York': { lat: 40.7128, lng: -74.0060 },
        'Europe/London': { lat: 51.5074, lng: -0.1278 },
        'Asia/Tokyo': { lat: 35.6895, lng: 139.6917 },
        'Australia/Sydney': { lat: -33.8688, lng: 151.2093 }
    };

    // Add markers for active clocks
    activeClocks.forEach(clock => {
        const coords = timezoneCoordinates[clock.timezone];
        if (coords) {
            const marker = L.marker([coords.lat, coords.lng]).addTo(map);
            marker.bindPopup(`${clock.name}<br>${clock.timezone}`);
            map.markers.push(marker);
        }
    });
}

// Initialize the clocks container
function initializeClocks() {
    const clocksContainer = document.getElementById('clocksContainer');
    clocksContainer.innerHTML = '';

    activeClocks.forEach(clock => {
        const clockElement = createClockElement(clock.timezone, clock.name);
        clocksContainer.appendChild(clockElement);
    });
}

// Handle adding new clocks
function handleAddClock() {
    const timezoneSelect = document.getElementById('timezoneSelect');
    const customName = document.getElementById('customName');

    const selectedTimezone = timezoneSelect.value;
    if (!selectedTimezone) {
        alert('Please select a timezone');
        return;
    }

    // Check if clock already exists
    if (activeClocks.some(clock => clock.timezone === selectedTimezone)) {
        alert('This timezone is already displayed');
        return;
    }

    const cityName = customName.value.trim() ||
                    timezoneSelect.options[timezoneSelect.selectedIndex].text;

    // Add to active clocks
    activeClocks.push({
        timezone: selectedTimezone,
        name: cityName
    });

    // Create and add new clock element
    const clockElement = createClockElement(selectedTimezone, cityName);
    document.getElementById('clocksContainer').appendChild(clockElement);

    // Update map markers
    updateWorldMapMarkers(map);

    // Reset form
    timezoneSelect.value = '';
    customName.value = '';
}

// Handle theme toggle
function handleThemeToggle() {
    const body = document.body;
    const themeToggle = document.getElementById('themeToggle');
    const icon = themeToggle.querySelector('i');
    const text = themeToggle.querySelector('span');

    body.classList.toggle('dark-theme');

    if (body.classList.contains('dark-theme')) {
        icon.classList.replace('fa-moon', 'fa-sun');
        text.textContent = 'Light Mode';
    } else {
        icon.classList.replace('fa-sun', 'fa-moon');
        text.textContent = 'Dark Mode';
    }
}

// Save clock preferences to localStorage
function saveClockPreferences() {
    localStorage.setItem('activeClocks', JSON.stringify(activeClocks));
    localStorage.setItem('theme', document.body.classList.contains('dark-theme'));
}

// Load clock preferences from localStorage
function loadClockPreferences() {
    const savedClocks = localStorage.getItem('activeClocks');
    const savedTheme = localStorage.getItem('theme');

    if (savedClocks) {
        activeClocks = JSON.parse(savedClocks);
    }

    if (savedTheme === 'true') {
        document.body.classList.add('dark-theme');
        const themeToggle = document.getElementById('themeToggle');
        const icon = themeToggle.querySelector('i');
        const text = themeToggle.querySelector('span');
        icon.classList.replace('fa-moon', 'fa-sun');
        text.textContent = 'Light Mode';
    }
}

// Initialize the application
function initializeApp() {
    // Load saved preferences
    loadClockPreferences();

    // Initialize clocks and map
    initializeClocks();
    initializeWorldMap();

    // Start clock updates
    updateClocks();
    setInterval(updateClocks, 1000);

    // Add event listeners
    document.getElementById('addClockBtn').addEventListener('click', handleAddClock);
    document.getElementById('themeToggle').addEventListener('click', handleThemeToggle);

    // Save preferences when closing/reloading
    window.addEventListener('beforeunload', saveClockPreferences);
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);