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
            updateWorldMapMarkers(); // Update markers after removing clock
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

// World map visualization with active clock locations
function initializeWorldMap() {
    const worldMap = document.querySelector('.world-map');
    
    // Create a simple world map SVG
    const mapSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    mapSvg.setAttribute('viewBox', '0 0 1000 500');
    mapSvg.style.width = '100%';
    mapSvg.style.height = '100%';
    
    // Add a simplified world map outline
    const mapPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    mapPath.setAttribute('d', 'M179,176.1c-11.3,0.7-22.3,1-33-0.5c-9.9-1.4-18.9-1.5-28.1-1.4c-4.5,0.1-8.9,0-13-0.6c-9.1-1.3-18.2-2-27.4-2 c-8.6,0-17.1,0.6-25.5,1.4c-11.9,1.2-23,2.3-35.2,2.3c-0.6,1.9-1.3,3.8-1.9,5.7l-0.2,0.6c-2.6,7.6-5.2,15.5-7.8,23.2 c-2.9,8.5-5.7,17.1-8.6,25.7c8.4,3.9,16.7,7.7,25.1,11.6c8.4,3.9,16.8,7.8,25.2,11.7c9.1,4.2,18.2,8.5,27.3,12.7 c8.8,4.1,15.6,1.9,21.8-5c1.6-1.8,3.1-3.6,4.6-5.4c3.8-4.6,7.4-9,13.9-9c0.6,0,1.3,0,1.9,0.1c1.9,0.3,3.8,0.5,5.7,0.5 c5,0,10-1.4,15-2.8c4.9-1.4,10-2.8,15-2.8c5,0,10,1.4,15,2.8c4.9,1.4,9.9,2.7,14.8,2.8l0.4,0c6.5,0,10-4.2,13.8-8.6 c1.5-1.7,3-3.5,4.7-5.1c3.3-3.2,7.3-3.1,9.7-1.8c0.7-2.5,1.4-5,2.1-7.6c3.4-12.6,6.9-25.6,10.3-38.4c0.3-1.1,0.6-2.2,0.8-3.4 l-15.7-4.8L179,176.1z');
    mapPath.setAttribute('fill', 'rgba(58, 110, 165, 0.3)');
    mapPath.setAttribute('stroke', 'rgba(58, 110, 165, 0.5)');
    mapPath.setAttribute('stroke-width', '1');
    
    // Add a larger continent representation
    const continent1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    continent1.setAttribute('d', 'M288.9,249.7c-13.8-5.1-16.7-13.5-18.3-18.6c-1.3-4.1-1.1-9.7,2.6-14.1c3.6-4.3,8.5-4.6,12.4-3.7 c3.7,0.8,6.2,2.7,6.9,5.4c1,3.8-0.4,4.8-1.7,5.7c-1.4,1-2.8,2-2.2,5.5c0.4,2.2,2.3,4.1,5.5,5.4c3.7,1.5,7.6,1.6,10.8,0.2 c1.8-0.8,3.9-2.2,4.6-4.7c0.5-1.8,0.3-3.9-0.9-6.3c-0.9-1.8-2-4-2-6.8c0-3.6,1.2-6.7,3.5-9.2c6.5-6.9,16.8-5.8,17.1-5.8 c0.4,0.1,0.7,0.4,0.7,0.8c0.1,0.4-0.2,0.8-0.6,0.9c-0.1,0-9.5-1-15.3,5.1c-1.9,2-2.8,4.5-2.8,7.4c0,2.2,0.9,4,1.8,5.7 c1.4,2.8,1.6,5.6,0.9,8c-0.9,3.3-3.5,5.2-5.7,6.2c-3.9,1.7-8.7,1.6-13.1-0.2c-4-1.6-6.5-4.4-7-7.5c-0.8-4.8,1.5-6.5,3.1-7.7 c1.1-0.8,1.6-1.1,1-3.2c-0.4-1.6-2.2-2.7-4.9-3.3c-3.2-0.7-7,0-9.7,3.2c-2.9,3.5-3,8-2,11.3c1.4,4.4,3.8,11.8,16.4,16.3 c12.6,4.6,23.8,0.8,26-0.3l0.3-0.1c0.4-0.1,0.8,0.1,0.9,0.5c0.1,0.4-0.1,0.8-0.5,0.9l-0.3,0.1C320.7,251.5,302.7,255,288.9,249.7z');
    continent1.setAttribute('fill', 'rgba(58, 110, 165, 0.3)');
    continent1.setAttribute('stroke', 'rgba(58, 110, 165, 0.5)');
    continent1.setAttribute('stroke-width', '1');
    
    const continent2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    continent2.setAttribute('d', 'M712.7,183.3c-10.6,0.7-21.2,0-31.6-2.1c-10.5-2.1-20.8-5.3-30.8-9.4c-19.9-8.1-38.6-19.5-55.2-33.8 c-16.5-14.1-30.9-30.4-42.4-48.6c-5.8-9.1-10.7-18.7-14.9-28.8c-4.1-9.9-7.3-20.2-9.3-30.9l-0.8-4.4c-0.2-1.4-0.5-2.8-0.7-4.2 c-0.4-2.9-0.9-5.9-1.1-8.8c-0.1-1.5-0.1-3,0-4.6c0.1-1.5,0.3-3.1,0.7-4.5c0.7-3,2.5-5.6,4.9-7.5c2.4-1.9,5.3-3,8.3-3.4 c6-0.8,12,1.4,16.7,5.5c2.3,2.1,4.3,4.6,5.9,7.3c1.6,2.7,2.8,5.7,3.7,8.7c0.9,3,1.5,6.1,2.1,9.2c0.3,1.5,0.5,3.1,0.8,4.6l0.9,4.6 c1.2,6.1,2.9,12.1,4.9,17.9c4.1,11.6,9.8,22.6,16.9,32.6c7.1,10,15.5,19,24.9,26.8c18.9,15.6,41.2,26.7,64.9,32.9 c11.9,3.1,24.1,4.9,36.4,5.6c12.3,0.6,24.6,0,36.7-1.7c0.6-0.1,1.2,0.3,1.3,0.9c0.1,0.6-0.3,1.2-0.9,1.3c-2.5,0.4-5,0.7-7.5,1 C725.4,182.5,719,183,712.7,183.3z');
    continent2.setAttribute('fill', 'rgba(58, 110, 165, 0.3)');
    continent2.setAttribute('stroke', 'rgba(58, 110, 165, 0.5)');
    continent2.setAttribute('stroke-width', '1');
    
    mapSvg.appendChild(mapPath);
    mapSvg.appendChild(continent1);
    mapSvg.appendChild(continent2);
    
    // Clear placeholder and add map
    worldMap.innerHTML = '';
    worldMap.appendChild(mapSvg);
    
    // Add markers for active clocks
    updateWorldMapMarkers();
}

// Update clock markers on the map
function updateWorldMapMarkers() {
    const worldMap = document.querySelector('.world-map svg');
    if (!worldMap) return;
    
    // Remove existing markers
    const existingMarkers = worldMap.querySelectorAll('.clock-marker');
    existingMarkers.forEach(marker => marker.remove());
    
    // Approximate coordinates for common timezones (simplified)
    const timezoneCoordinates = {
        'America/New_York': {x: 250, y: 180},
        'America/Chicago': {x: 220, y: 180},
        'America/Denver': {x: 190, y: 180},
        'America/Los_Angeles': {x: 150, y: 180},
        'America/Toronto': {x: 260, y: 160},
        'America/Vancouver': {x: 150, y: 150},
        'America/Mexico_City': {x: 200, y: 230},
        'America/Sao_Paulo': {x: 330, y: 310},
        'America/Buenos_Aires': {x: 300, y: 350},
        'Europe/London': {x: 470, y: 150},
        'Europe/Paris': {x: 490, y: 160},
        'Europe/Berlin': {x: 510, y: 150},
        'Europe/Rome': {x: 510, y: 180},
        'Europe/Madrid': {x: 470, y: 180},
        'Europe/Moscow': {x: 570, y: 130},
        'Asia/Tokyo': {x: 800, y: 180},
        'Asia/Shanghai': {x: 750, y: 200},
        'Asia/Hong_Kong': {x: 750, y: 220},
        'Asia/Singapore': {x: 730, y: 260},
        'Asia/Dubai': {x: 600, y: 220},
        'Asia/Kolkata': {x: 650, y: 220},
        'Asia/Seoul': {x: 780, y: 170},
        'Australia/Sydney': {x: 850, y: 320},
        'Australia/Melbourne': {x: 840, y: 340},
        'Pacific/Auckland': {x: 930, y: 350},
        'Africa/Cairo': {x: 550, y: 210},
        'Africa/Johannesburg': {x: 540, y: 320},
        'Africa/Lagos': {x: 480, y: 250}
    };
    
    // Add markers for active clocks
    activeClocks.forEach(clock => {
        const coords = timezoneCoordinates[clock.timezone];
        
        if (coords) {
            // Create marker group
            const marker = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            marker.classList.add('clock-marker');
            
            // Create marker circle
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', coords.x);
            circle.setAttribute('cy', coords.y);
            circle.setAttribute('r', '6');
            circle.setAttribute('fill', 'rgba(255, 107, 107, 0.7)');
            circle.setAttribute('stroke', 'white');
            circle.setAttribute('stroke-width', '2');
            
            // Create pulse animation effect
            const pulse = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            pulse.setAttribute('cx', coords.x);
            pulse.setAttribute('cy', coords.y);
            pulse.setAttribute('r', '6');
            pulse.setAttribute('fill', 'rgba(255, 107, 107, 0.3)');
            pulse.setAttribute('stroke', 'rgba(255, 107, 107, 0.5)');
            pulse.setAttribute('stroke-width', '1');
            
            // Add animation
            const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
            animate.setAttribute('attributeName', 'r');
            animate.setAttribute('from', '6');
            animate.setAttribute('to', '15');
            animate.setAttribute('dur', '1.5s');
            animate.setAttribute('begin', '0s');
            animate.setAttribute('repeatCount', 'indefinite');
            
            const animateOpacity = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
            animateOpacity.setAttribute('attributeName', 'opacity');
            animateOpacity.setAttribute('from', '1');
            animateOpacity.setAttribute('to', '0');
            animateOpacity.setAttribute('dur', '1.5s');
            animateOpacity.setAttribute('begin', '0s');
            animateOpacity.setAttribute('repeatCount', 'indefinite');
            
            pulse.appendChild(animate);
            pulse.appendChild(animateOpacity);
            
            // Create text label
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', coords.x + 10);
            text.setAttribute('y', coords.y - 10);
            text.setAttribute('fill', '#3a6ea5');
            text.setAttribute('font-size', '12');
            text.setAttribute('font-weight', 'bold');
            text.textContent = clock.name;
            
            // Add all elements to marker group
            marker.appendChild(pulse);
            marker.appendChild(circle);
            marker.appendChild(text);
            
            // Add interactivity
            marker.addEventListener('mouseover', () => {
                circle.setAttribute('r', '8');
                circle.setAttribute('fill', 'rgba(255, 107, 107, 1)');
                text.setAttribute('font-size', '14');
            });
            
            marker.addEventListener('mouseout', () => {
                circle.setAttribute('r', '6');
                circle.setAttribute('fill', 'rgba(255, 107, 107, 0.7)');
                text.setAttribute('font-size', '12');
            });
            
            worldMap.appendChild(marker);
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
    updateWorldMapMarkers();
    
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