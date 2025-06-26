# Weekly Activity Planner

A React/Next.js application for planning children's weekly extracurricular activities with drag-and-drop date selection, conflict detection, and notes.

## Features

- **Multi-day, multi-week scheduling**: Schedule activities across any days of the week for multiple weeks
- **Drag and drop interface**: Easily add/remove activity dates by dragging across calendar cells
- **Conflict detection**: Visual indicators for time conflicts between activities
- **Date-specific notes**: Add notes for specific dates (e.g., "special guest", "makeup class")
- **Professional UI**: Clean, pastel rainbow theme with excellent UX
- **Real-time updates**: All changes are saved to Supabase database

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel (recommended)

## Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd extracurricular
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once your project is created, go to Settings > API
3. Copy your Project URL and anon/public key

### 4. Create environment variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Set up the database table

In your Supabase dashboard, go to the SQL Editor and run this query to create the activities table:

```sql
CREATE TABLE activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  dates TEXT[] NOT NULL DEFAULT '{}',
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  location TEXT,
  contact TEXT,
  attendee TEXT NOT NULL,
  notes TEXT,
  notes_dates JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (for demo purposes)
-- In production, you should implement proper authentication and authorization
CREATE POLICY "Allow all operations" ON activities FOR ALL USING (true);

-- Create an index on dates for better performance
CREATE INDEX idx_activities_dates ON activities USING GIN (dates);

-- Create an index on notes_dates for better performance
CREATE INDEX idx_activities_notes_dates ON activities USING GIN (notes_dates);
```

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Database Schema

The `activities` table has the following structure:

- `id`: Unique identifier (UUID)
- `name`: Activity name
- `dates`: Array of date strings (YYYY-MM-DD format)
- `start_time`: Start time (HH:MM format)
- `end_time`: End time (HH:MM format)
- `location`: Activity location
- `contact`: Contact information
- `notes`: General notes for the activity
- `notes_dates`: JSON object mapping date strings to specific notes
- `created_at`: Timestamp when record was created
- `updated_at`: Timestamp when record was last updated

## Usage

1. **Add Activities**: Use the "Add Activity" form to create new activities
2. **Schedule Dates**: Click or drag on calendar cells to add/remove activity dates
3. **Add Notes**: When adding/removing dates, you can also add notes for specific dates
4. **View Conflicts**: Time conflicts are highlighted with red borders and warning icons
5. **Expand Details**: Click on activity names to view detailed information

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set these environment variables in your production environment:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
