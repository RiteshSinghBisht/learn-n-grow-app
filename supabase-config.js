// ===========================
// SUPABASE CONFIGURATION
// ===========================

// Same config as Admin app
const supabaseUrl = "https://svixbpbbbroresngmqeb.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2aXhicGJiYnJvcmVzbmdtcWViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMjE4NDMsImV4cCI6MjA4Njg5Nzg0M30.Ae7hKm6dau6vMuAlZlmHs8UrOozS7vW1KcovEY2l3S8";

// Initialize Supabase client and attach to window
window.supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

console.log("Supabase initialized:", window.supabase);
