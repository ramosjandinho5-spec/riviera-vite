import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Substitua com os seus dados do Supabase
const supabaseUrl = 'https://vfsvvauxgrebasiibnzp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmc3Z2YXV4Z3JlYmFzaWlibnpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNDc2MzQsImV4cCI6MjA5NjYyMzYzNH0.7ikhOdxF9D1j-0Zcd4km6W_9SsCqDaUQbuoP5_6gG-E';

export const supabase = createClient(supabaseUrl, supabaseKey);