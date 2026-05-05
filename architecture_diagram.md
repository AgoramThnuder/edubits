# EduBits Architecture Diagram

This diagram illustrates the high-level architecture of the EduBits platform, showing the interactions between the frontend, Supabase services, and the Google Gemini AI.

## Mermaid Diagram

```mermaid
graph TD
    subgraph Client ["Client Side (Browser)"]
        UI["Vite + React Frontend"]
        RC["React Query / Supabase Client"]
        FM["Framer Motion / shadcn-ui"]
    end

    subgraph Supabase ["Supabase Platform"]
        Auth["Supabase Auth"]
        DB[(PostgreSQL Database)]
        Storage["Supabase Storage"]
        
        subgraph EF ["Edge Functions (Deno)"]
            GC["/generate-course"]
            CC["/course-chat"]
            WA["/wipe-activity"]
        end
    end

    subgraph AI ["External Services"]
        Gemini["Google Gemini API"]
    end

    %% Interactions
    UI --> Auth
    UI --> RC
    RC --> DB
    RC --> EF
    
    GC --> Gemini
    CC --> Gemini
    
    GC --> DB
    WA --> DB
    
    UI -- "Structured Course Content" --> DB
    UI -- "Real-time Chat" --> CC
    
    %% Styles
    style Client fill:#f9f,stroke:#333,stroke-width:2px
    style Supabase fill:#bbf,stroke:#333,stroke-width:2px
    style AI fill:#bfb,stroke:#333,stroke-width:2px
    style DB fill:#fff,stroke:#333,stroke-width:4px
```

## PlantUML Diagram

```plantuml
@startuml EduBits Architecture

!define RECTANGLE component

package "Client Side (Browser)" {
    RECTANGLE "Vite + React Frontend" as UI
    RECTANGLE "React Query / Supabase Client" as RC
    RECTANGLE "Framer Motion / shadcn-ui" as FM
}

package "Supabase Platform" {
    package "Edge Functions (Deno)" as EF {
        RECTANGLE "/generate-course" as GC
        RECTANGLE "/course-chat" as CC
        RECTANGLE "/wipe-activity" as WA
    }
    database "PostgreSQL" as DB
    RECTANGLE "Supabase Auth" as Auth
}

package "External Services" {
    RECTANGLE "Google Gemini API" as Gemini
}

UI --> Auth : Authenticate
UI --> RC : Data Access
RC --> DB : Fetch/Update
RC --> EF : Call AI Features

GC --> Gemini : Generate JSON
CC --> Gemini : Stream Chat

GC --> DB : Insert Content
WA --> DB : Clear Progress

@enduml
```

## Component Breakdown

### 1. Frontend (Vite + React)
- **Framework**: React 18 with TypeScript.
- **Styling**: Tailwind CSS and shadcn-ui components.
- **Animations**: Framer Motion for smooth transitions.
- **Data Fetching**: TanStack Query for caching and synchronization with Supabase.

### 2. Backend (Supabase)
- **Auth**: Handles user registration, login, and session management.
- **Database (PostgreSQL)**: Stores courses, modules, lessons, quizzes, and user progress. Uses Row Level Security (RLS) to ensure data privacy.
- **Edge Functions**: Serverless Deno functions that handle complex logic and external API calls.
  - `generate-course`: Orchestrates the AI course creation flow.
  - `course-chat`: Provides a streaming interface for the in-lesson AI tutor.

### 3. AI Integration
- **Provider**: Google Gemini API (`gemini-3.0-pro`).
- **Use Cases**:
  - Structured data generation for multi-module courses.
  - Context-aware tutoring with content restrictions (only answers course-related questions).
