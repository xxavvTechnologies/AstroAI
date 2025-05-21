# Firebase to Supabase Migration

This project has been migrated from Firebase Authentication to Supabase Authentication.

## Migration Details

1. Added Supabase client
2. Updated AuthContext to use Supabase auth methods
3. Updated LoginPage component to handle Supabase auth flow
4. Removed Firebase dependencies

## Setup Requirements

To use the application with Supabase authentication, you need to:

1. Create a Supabase project at [https://supabase.com](https://supabase.com)
2. Set up Authentication in your Supabase project
3. Enable Email/Password, Google, and GitHub providers in the Auth settings
4. Configure OAuth providers (Google, GitHub) with the appropriate credentials
5. Add the following environment variables:

```
REACT_APP_SUPABASE_URL=your-supabase-project-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Using Supabase Auth

The authentication flow remains the same from a user perspective. Behind the scenes, Supabase is now handling:

- Email/password authentication
- OAuth authentication with Google and GitHub
- Session management
- Auth state changes

## Rollback Strategy

If needed, the Firebase authentication can be restored by:
1. Reverting the changes in AuthContext.tsx
2. Reinstating the Firebase dependency in package.json
3. Removing the Supabase configuration

A backup of the Firebase configuration has been retained in `/src/config/firebase.backup.ts`
