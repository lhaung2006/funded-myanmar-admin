# Funded Myanmar Trading Challenge Dashboard

A professional trading challenge management platform with a dark theme, green accents, and real-time dashboard updates. Built with React, TypeScript, Tailwind CSS, and Express.js.

## Features

### Trader Dashboard
- **Live Account Metrics**: Real-time display of balance, equity, and profit/loss
- **Challenge Status**: Visual indicators for Active, Passed, or Failed status with colored banners
- **Progress Tracking**: 
  - Profit target progress bar
  - Daily and maximum drawdown monitoring
  - Trading days counter
  - Win rate and total trades statistics
- **Challenge Countdown Timer**: Real-time countdown to challenge end date
- **Responsive Design**: Optimized for desktop and mobile devices

### Admin Panel
- **Secure Login**: JWT-based authentication with demo credentials
- **Trader Management**:
  - Create new trader accounts
  - View all traders with quick selection
  - Edit trader details and metrics
- **Real-Time Metric Updates**:
  - Update balance and equity
  - Manage profit targets
  - Set and monitor drawdown limits
  - Track trading days
  - Adjust win rate and trade counts
  - Change challenge status (Active/Passed/Failed)
- **Instant Save**: All changes are persisted immediately to the database
- **Audit Trail**: Admin actions are logged for compliance

### Design
- **Dark Theme**: Professional dark interface with green accent colors (similar to FTMO)
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Professional Styling**: Gradient backgrounds, smooth transitions, and polished interactions
- **Mobile Responsive**: Fully optimized for smartphones and tablets

## Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling with OKLCH color format
- **shadcn/ui** - Component library
- **Wouter** - Lightweight routing
- **Lucide React** - Icon library

### Backend
- **Express.js** - Web server
- **Node.js** - Runtime
- **Drizzle ORM** - Database toolkit
- **MySQL** - Database
- **JWT** - Authentication tokens
- **TypeScript** - Type safety

## Getting Started

### Prerequisites
- Node.js 22.13.0+
- pnpm 10.4.1+
- MySQL database (TiDB Cloud or local)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd funded_myanmar_admin
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   - The project uses automatic environment variable injection
   - Database URL is configured in `.project-config.json`
   - JWT_SECRET is automatically provided

4. **Seed demo data**
   ```bash
   node seed-db.mjs
   ```
   This creates:
   - Demo trader account (ACC-001)
   - Sample trading metrics with realistic data

### Running the Application

**Development Mode**
```bash
pnpm dev
```
The application will start on `http://localhost:3000`

**Production Build**
```bash
pnpm build
pnpm start
```

**Running Tests**
```bash
pnpm test
```

## Usage

### For Traders

1. **Access the Dashboard**
   - Navigate to `/trader/dashboard`
   - View your live trading metrics and challenge progress
   - Monitor profit targets, drawdown limits, and trading days

2. **Key Metrics**
   - **Account Balance**: Your current account balance
   - **Current Equity**: Real-time equity value
   - **Profit Target**: Progress towards your challenge goal
   - **Drawdown Limits**: Daily and maximum drawdown tracking
   - **Trading Days**: Days used vs. total available
   - **Win Rate**: Percentage of winning trades
   - **Challenge Status**: Active, Passed, or Failed

### For Admins

1. **Login to Admin Panel**
   - Navigate to `/admin/login`
   - Use demo credentials:
     - Email: `admin@fundedmyammer.com`
     - Password: `password123`

2. **Manage Traders**
   - **View Traders**: See all active traders in the sidebar
   - **Create Trader**: Click the "+" button to add a new trader
   - **Select Trader**: Click any trader to view/edit their metrics

3. **Update Trading Metrics**
   - Navigate to the "Trading Metrics" tab
   - Edit any metric value:
     - Balance and Equity
     - Profit Target
     - Daily/Max Drawdown (current and limits)
     - Trading Days (used and limit)
     - Win Rate and Total Trades
   - Change Challenge Status (Active/Passed/Failed)
   - Click "Save Changes" to persist updates

4. **View Account Details**
   - Navigate to the "Account Details" tab
   - View trader information and current status
   - Audit trail of changes is automatically logged

## Database Schema

### Users Table
- Core user authentication (auto-created by framework)
- Supports OAuth integration

### Traders Table
- `id`: Unique trader identifier
- `userId`: Link to user account
- `traderName`: Trader's display name
- `email`: Trader's email address
- `accountNumber`: Unique account identifier
- `challengeStatus`: Current status (active/passed/failed)
- `createdAt`, `updatedAt`: Timestamps

### Trading Metrics Table
- `id`: Unique metric record identifier
- `traderId`: Link to trader
- `balance`: Current account balance (in cents)
- `equity`: Current equity value (in cents)
- `profitTarget`: Challenge profit goal (in cents)
- `dailyDrawdown`: Current daily loss (in cents)
- `dailyDrawdownLimit`: Daily loss limit (in cents)
- `maxDrawdown`: Maximum loss from peak (in cents)
- `maxDrawdownLimit`: Maximum loss limit (in cents)
- `tradingDaysUsed`: Days used in challenge
- `tradingDaysLimit`: Total days allowed
- `winRate`: Winning trade percentage (0-100)
- `totalTrades`: Total number of trades
- `challengeStartDate`: Challenge start timestamp
- `challengeEndDate`: Challenge end timestamp (nullable)
- `createdAt`, `updatedAt`: Timestamps

### Admin Logs Table
- `id`: Unique log entry identifier
- `adminId`: Admin who made the change
- `traderId`: Affected trader
- `action`: Description of action
- `changes`: JSON of changed values
- `createdAt`: Timestamp

## API Endpoints

### Authentication
- `POST /api/admin/login` - Admin login (returns JWT token)

### Traders
- `GET /api/admin/traders` - List all traders (requires auth)
- `POST /api/admin/traders` - Create new trader (requires auth)
- `GET /api/trader/dashboard` - Get trader dashboard data (public)

### Trading Metrics
- `GET /api/admin/trader/:traderId/metrics` - Get trader metrics (requires auth)
- `PUT /api/admin/trader/:traderId/metrics` - Update trader metrics (requires auth)

## Currency Format

All monetary values in the database are stored in **cents** (smallest currency unit):
- $1.00 = 100 cents
- $10,000.00 = 1,000,000 cents

The frontend automatically converts to/from dollars for display.

## Security Considerations

### Current Implementation
- JWT-based authentication with 24-hour token expiration
- Admin credentials stored in environment variables
- CORS protection
- Input validation on forms

### Future Enhancements
- Implement password hashing (bcrypt)
- Add rate limiting on login attempts
- Enable HTTPS/SSL in production
- Implement refresh token rotation
- Add 2FA for admin accounts
- Implement proper session management
- Add CSRF protection

## Deployment

### Manus Platform
The application is optimized for deployment on Manus with:
- Automatic environment variable injection
- Built-in database connectivity
- Static file serving
- Custom domain support

### Custom Deployment
For external hosting:
1. Set environment variables (DATABASE_URL, JWT_SECRET)
2. Build the application: `pnpm build`
3. Deploy the built files
4. Ensure database connectivity

## Future Enhancements

### Planned Features
- MT5 Integration for live trading data
- Telegram notifications for status changes
- Advanced analytics and reporting
- Multi-language support
- Two-factor authentication
- Payment processing for challenge fees
- Leaderboard system
- Performance optimization for large trader bases

### MT5 Integration
Structure is designed to support MT5 integration:
- Metrics can be auto-updated from MT5 API
- Real-time balance and equity sync
- Automatic drawdown calculation
- Live trade monitoring

### Telegram Notifications
Ready for Telegram bot integration:
- Challenge status change notifications
- Drawdown limit warnings
- Profit target achievement alerts
- Daily summary reports

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check MySQL credentials
- Ensure database is accessible
- Run `node seed-db.mjs` to initialize tables

### Login Issues
- Verify admin credentials are correct
- Check JWT_SECRET is set
- Clear browser localStorage and try again
- Check server logs for authentication errors

### Metrics Not Updating
- Verify admin is logged in (token in localStorage)
- Check browser console for API errors
- Ensure trader exists in database
- Verify all required fields are filled

### Mobile Display Issues
- Clear browser cache
- Try a different mobile browser
- Check viewport settings
- Ensure CSS is loading properly

## Development

### Project Structure
```
funded_myanmar_admin/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── App.tsx        # Main app component
│   │   └── index.css      # Global styles
│   └── index.html         # HTML entry point
├── server/                 # Express backend
│   ├── api.ts             # API routes
│   ├── db.ts              # Database utilities
│   ├── routers.ts         # tRPC routers
│   └── _core/             # Core server utilities
├── drizzle/               # Database schema and migrations
│   ├── schema.ts          # Table definitions
│   └── migrations/        # SQL migrations
├── seed-db.mjs            # Demo data seeder
└── package.json           # Dependencies
```

### Adding New Features

1. **Database Changes**
   - Update `drizzle/schema.ts`
   - Run `pnpm drizzle-kit generate`
   - Review and execute the migration

2. **API Endpoints**
   - Add routes to `server/api.ts`
   - Implement request/response handling
   - Add authentication where needed

3. **Frontend Pages**
   - Create new component in `client/src/pages/`
   - Add route to `client/src/App.tsx`
   - Import necessary components

4. **Styling**
   - Use Tailwind CSS classes
   - Follow existing color scheme (dark theme with green accents)
   - Ensure mobile responsiveness

## Support & Feedback

For issues, feature requests, or feedback:
- Check existing documentation
- Review API endpoint specifications
- Consult the troubleshooting section
- Contact the development team

## License

This project is proprietary software for Funded Myanmar.

## Changelog

### Version 1.0.0 (Initial Release)
- ✅ Trader dashboard with live metrics
- ✅ Admin panel with trader management
- ✅ Real-time metric updates
- ✅ JWT authentication
- ✅ Mobile responsive design
- ✅ Dark theme with green accents
- ✅ Database schema and migrations
- ✅ Demo data seeding

---

**Last Updated**: June 19, 2026
**Status**: Production Ready
