# CampusLoop — Synthesis Project

CampusLoop is a multi-page student marketplace and Lost & Found platform built with HTML, CSS, and vanilla JavaScript.

## Pages
- index.html — Home
- marketplace.html — Marketplace browsing, search and filters
- item.html — Marketplace item details
- sell.html — Create a marketplace listing
- lost-found.html — Lost & Found hub
- found-item.html — Lost/Found report details
- report.html — Create a Lost/Found report
- saved.html — Saved marketplace items
- dashboard.html — Local user activity
- about.html — Product explanation and safety guidance

## Core functionality
- Responsive desktop/tablet/mobile layout
- Dark and light theme with localStorage persistence
- Font Awesome icons via CDN
- Mobile navigation
- Marketplace search and filtering
- Marketplace detail pages
- Saved items using localStorage
- Create-listing form
- Lost / Found / Returned filters
- Lost & Found detail pages
- Sensitive-item handling UI
- Lost & Found report form
- Dashboard statistics and locally created posts
- Subtle scroll and hover animations
- Reduced-motion accessibility support

## Run locally
Open the project folder in VS Code and use Live Server.

Or run:

python -m http.server 5500

Then open:

http://localhost:5500

## Important
The project is frontend-only. localStorage is used to simulate persistent data. Do not store real confidential information in it.

The sample listing images are loaded from Unsplash, and Font Awesome icons are loaded from cdnjs, so an internet connection is needed for those external assets.
