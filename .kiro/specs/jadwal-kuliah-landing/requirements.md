# Requirements Document

## Introduction

This document defines the requirements for the Jadwal Kuliah marketing/landing website. Jadwal Kuliah is a course schedule viewing application designed for Indonesian university students (mahasiswa). The landing website will introduce the application, explain how it works, and provide a clear path for students to start using it. The website follows a minimalist, human-centered design philosophy that prioritizes clarity, accessibility, and simplicity.

## Glossary

- **Website**: The marketing/landing page for Jadwal Kuliah
- **User**: An Indonesian university student visiting the landing page
- **Course_Schedule**: A collection of course information including course names, times, and locations
- **Hero_Section**: The first section of the landing page containing the main value proposition
- **How_It_Works_Section**: The section explaining the three-step process
- **Example_Section**: The section showing a real input/output demonstration
- **Footer_Section**: The bottom section containing repository link and contact information
- **CTA**: Call-to-action button or link that directs users to the application
- **Viewport**: The visible area of the webpage in the browser
- **Focus_State**: The visual indicator shown when an interactive element receives keyboard focus
- **Layout_Shift**: Unexpected movement of page content during loading

## Requirements

### Requirement 1: Hero Section Content

**User Story:** As a student visiting the landing page, I want to immediately understand what Jadwal Kuliah does and who it's for, so that I can decide if it's relevant to me.

#### Acceptance Criteria

1. THE Hero_Section SHALL contain one sentence explaining what the application does
2. THE Hero_Section SHALL contain one sentence explaining who the application is for
3. THE Hero_Section SHALL contain exactly one primary CTA
4. THE Hero_Section SHALL use concrete verbs in all sentences
5. THE Hero_Section SHALL NOT use filler words including "revolutionize", "seamless", "cutting-edge", "unlock", "empower", or "leverage"

### Requirement 2: How It Works Section Content

**User Story:** As a student, I want to understand how the application works in simple steps, so that I know what to expect before using it.

#### Acceptance Criteria

1. THE How_It_Works_Section SHALL present exactly three steps
2. THE How_It_Works_Section SHALL present each step as prose text
3. THE How_It_Works_Section SHALL NOT present steps as feature cards
4. THE How_It_Works_Section SHALL use short sentences with a maximum of 20 words per sentence
5. THE How_It_Works_Section SHALL use concrete verbs in all step descriptions

### Requirement 3: Example Section Content

**User Story:** As a student, I want to see a real example of input and output, so that I can understand exactly what the application produces.

#### Acceptance Criteria

1. THE Example_Section SHALL display actual input data
2. THE Example_Section SHALL display actual output data corresponding to the input
3. THE Example_Section SHALL present the example as text or code block format
4. THE Example_Section SHALL NOT use invented or placeholder data that cannot be verified

### Requirement 4: Footer Section Content

**User Story:** As a student, I want to find the repository link and contact information, so that I can access the code or reach out with questions.

#### Acceptance Criteria

1. THE Footer_Section SHALL contain a link to the code repository
2. THE Footer_Section SHALL contain contact information
3. THE Footer_Section SHALL NOT contain invented testimonials
4. THE Footer_Section SHALL NOT contain unverifiable statistics or claims

### Requirement 5: Visual System - Color Palette

**User Story:** As a student, I want the website to use a calm and readable color scheme, so that I can comfortably read the content without visual strain.

#### Acceptance Criteria

1. THE Website SHALL use exactly one background color
2. THE Website SHALL use exactly one primary text color
3. THE Website SHALL use exactly one muted text color
4. THE Website SHALL use exactly one accent color
5. THE Website SHALL use warm off-white or soft neutral tones
6. THE Website SHALL NOT use pure black color with hex value #000000
7. THE Website SHALL NOT use pure white color with hex value #FFFFFF
8. THE Website SHALL NOT use gradient color transitions

### Requirement 6: Visual System - Typography

**User Story:** As a student, I want the text to be easy to read, so that I can quickly understand the information without eye strain.

#### Acceptance Criteria

1. THE Website SHALL use a maximum of two typeface families
2. WHERE two typeface families are used, THE Website SHALL use one serif and one sans-serif typeface
3. THE Website SHALL define a fixed type scale
4. THE Website SHALL set body text line-height to 1.6 or greater
5. THE Website SHALL limit text line length to a maximum of 65 characters
6. THE Website SHALL NOT use gradient effects on text

### Requirement 7: Visual System - Spacing and Layout

**User Story:** As a student, I want the content to be well-spaced and easy to scan, so that I can quickly find the information I need.

#### Acceptance Criteria

1. THE Website SHALL use a single spacing scale
2. THE Website SHALL separate sections using whitespace
3. THE Website SHALL NOT separate sections using borders
4. THE Website SHALL use a single-column layout
5. THE Website SHALL use a narrow content width
6. THE Website SHALL present exactly one focal point per section
7. THE Website SHALL provide generous whitespace between content elements

### Requirement 8: Visual System - Motion and Animation

**User Story:** As a student with motion sensitivity, I want minimal animations, so that I can use the website comfortably.

#### Acceptance Criteria

1. THE Website SHALL use minimal motion effects
2. WHERE motion effects are used, THE Website SHALL limit them to subtle fades
3. WHERE fade animations are used, THE Website SHALL set duration between 150ms and 250ms
4. WHEN the User has prefers-reduced-motion enabled, THE Website SHALL disable all motion effects
5. THE Website SHALL NOT use floating blob animations
6. THE Website SHALL NOT use emoji icons as visual elements
7. THE Website SHALL NOT use stock illustrations
8. THE Website SHALL NOT use glassmorphism visual effects
9. THE Website SHALL NOT use card grid layouts

### Requirement 9: Content Guidelines

**User Story:** As a student, I want the copy to feel natural and honest, so that I can trust the information provided.

#### Acceptance Criteria

1. THE Website SHALL use short sentences in all copy
2. THE Website SHALL use concrete verbs in all copy
3. THE Website SHALL write headings that state something specific
4. THE Website SHALL NOT write headings as slogans
5. WHERE first-person perspective is natural, THE Website SHALL use first-person pronouns
6. THE Website SHALL NOT use the word "revolutionize" in any copy
7. THE Website SHALL NOT use the word "seamless" in any copy
8. THE Website SHALL NOT use the word "cutting-edge" in any copy
9. THE Website SHALL NOT use the word "unlock" in any copy
10. THE Website SHALL NOT use the word "empower" in any copy
11. THE Website SHALL NOT use the word "leverage" in any copy
12. WHERE facts are missing, THE Website SHALL use the placeholder text "TODO"

### Requirement 10: Responsive Design

**User Story:** As a student using a mobile device, I want the website to work well on my screen size, so that I can access information on any device.

#### Acceptance Criteria

1. THE Website SHALL render correctly at a viewport width of 360 pixels
2. THE Website SHALL render correctly at all viewport widths above 360 pixels
3. THE Website SHALL NOT cause horizontal scrolling at any supported viewport width

### Requirement 11: Accessibility - Contrast and Focus

**User Story:** As a student with visual impairments, I want sufficient color contrast and visible focus indicators, so that I can navigate and read the content.

#### Acceptance Criteria

1. THE Website SHALL meet WCAG AA contrast ratio requirements for all text
2. THE Website SHALL meet WCAG AA contrast ratio requirements for all interactive elements
3. THE Website SHALL display visible focus states on all interactive elements
4. WHEN an interactive element receives keyboard focus, THE Website SHALL display a visible focus indicator

### Requirement 12: Accessibility - Semantic Structure

**User Story:** As a student using a screen reader, I want properly structured HTML, so that I can navigate the content efficiently.

#### Acceptance Criteria

1. THE Website SHALL use semantic HTML elements
2. THE Website SHALL use heading elements in hierarchical order
3. THE Website SHALL use appropriate landmark elements for page sections
4. THE Website SHALL provide alternative text for all images

### Requirement 13: Performance - Layout Stability

**User Story:** As a student on a slow connection, I want the page to load without content jumping around, so that I don't accidentally click the wrong element.

#### Acceptance Criteria

1. WHEN the Website loads, THE Website SHALL NOT cause layout shift
2. THE Website SHALL reserve space for all content before it loads
3. THE Website SHALL load fonts without causing text reflow

### Requirement 14: Asset Management

**User Story:** As a student with limited bandwidth, I want the website to load quickly with minimal external dependencies, so that I can access it even on slow connections.

#### Acceptance Criteria

1. THE Website SHALL load fonts from self-hosted files
2. WHERE self-hosting is not possible, THE Website SHALL load fonts from a single external source
3. THE Website SHALL NOT load external assets beyond the chosen font
4. THE Website SHALL NOT depend on external JavaScript libraries for core functionality

### Requirement 15: Language Support

**User Story:** As an Indonesian student, I want the website to work naturally in my language context, so that I can understand all the content.

#### Acceptance Criteria

1. THE Website SHALL display all primary content in Indonesian language
2. THE Website SHALL set the HTML lang attribute to "id" for Indonesian
3. THE Website SHALL use appropriate Indonesian terminology for educational contexts
4. THE Website SHALL properly render Indonesian text including diacritical marks

### Requirement 16: Page Structure

**User Story:** As a student, I want a clear page structure that guides me through the information, so that I can understand the application without confusion.

#### Acceptance Criteria

1. THE Website SHALL present sections in this order: Hero_Section, How_It_Works_Section, Example_Section, Footer_Section
2. THE Website SHALL display the Hero_Section as the first visible content
3. THE Website SHALL display the Footer_Section as the last visible content
4. THE Website SHALL maintain consistent visual hierarchy across all sections
