# Astro Canvas Feature - Usage Examples

This document provides examples of how Astro should use the interactive Canvas feature in different contexts. These examples help illustrate the ideal ways to utilize the Canvas feature for different types of content.

## Code Examples

When Astro provides code examples, they should be wrapped in the canvas format:

```
Here's a React component that demonstrates a simple counter:

&& 
// Counter.jsx
import React, { useState } from 'react';

const Counter = () => {
  const [count, setCount] = useState(0);
  
  // Increment function
  const increment = () => setCount(prev => prev + 1);
  
  // Decrement function with a minimum value of 0
  const decrement = () => setCount(prev => Math.max(0, prev - 1));
  
  return (
    <div className="counter">
      <h2>Count: {count}</h2>
      <button onClick={decrement}>-</button>
      <button onClick={increment}>+</button>
    </div>
  );
};

export default Counter;
&&

You can edit this code directly in the canvas to customize it for your needs.
```

## Writing Templates

For writing assistance, Astro can provide editable templates:

```
Here's a template for a professional email requesting information:

&&
Subject: Request for Information Regarding [Specific Topic]

Dear [Recipient's Name],

I hope this email finds you well. My name is [Your Name], and I am [your position/role] at [your organization].

I am reaching out to inquire about [specific information you're seeking]. We are currently [brief explanation of why you need this information], and your expertise in this area would be invaluable.

Specifically, I would like to know:
1. [Question 1]
2. [Question 2]
3. [Question 3]

If possible, could you please provide this information by [desired date]? If you are not the appropriate person to contact regarding this matter, I would greatly appreciate it if you could direct me to the right individual.

Thank you for your time and assistance. I look forward to your response.

Best regards,
[Your Full Name]
[Your Position/Title]
[Your Contact Information]
&&

You can edit this template directly in the canvas to personalize it for your specific situation.
```

## Data Structures

For analytical content, Astro can provide structured data in canvas format:

```
Here's a structured template for project planning:

&&
# Project Plan: [Project Name]

## Project Overview
- **Project Goal**: [Brief description of the main objective]
- **Timeline**: [Start date] to [End date]
- **Budget**: [Budget amount]
- **Team Lead**: [Name]

## Key Milestones
1. [Milestone 1] - [Date] - [Owner]
2. [Milestone 2] - [Date] - [Owner]
3. [Milestone 3] - [Date] - [Owner]

## Resource Requirements
- **Personnel**: [List of team members/roles]
- **Equipment**: [List of necessary equipment]
- **Software**: [List of required software]

## Risk Assessment
| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| [Risk 1] | [Low/Medium/High] | [Low/Medium/High] | [Strategy] |
| [Risk 2] | [Low/Medium/High] | [Low/Medium/High] | [Strategy] |

## Success Criteria
- [Criterion 1]
- [Criterion 2]
- [Criterion 3]
&&

You can adapt this project planning template in the interactive canvas.
```

## Creative Content

For creative tasks, Astro can provide frameworks for brainstorming:

```
Here's a brainstorming framework for your new product idea:

&&
# Product Concept Development

## Target Audience
- Primary: [describe main user demographic]
- Secondary: [describe secondary users]
- Excluded segments: [who is this NOT for]

## Problem Statement
[What critical problem does this product solve?]

## Unique Value Proposition
[What makes this product different from existing solutions?]

## Feature Brainstorm
1. [Feature idea 1]
2. [Feature idea 2]
3. [Feature idea 3]
4. [Feature idea 4]
5. [Feature idea 5]

## Potential Names
- [Name idea 1]
- [Name idea 2]
- [Name idea 3]

## Next Steps
- [ ] Research competitors
- [ ] Create simple mockup
- [ ] Test concept with potential users
- [ ] Estimate development costs
- [ ] Outline marketing strategy
&&

Use this canvas to develop your product concept further.
```

## Search Results

For search-based tasks, Astro can organize findings in an editable format:

```
Based on your search for renewable energy trends, here's a summary of the latest developments:

&& 
# Renewable Energy Trends 2025

## Key Technologies
1. **Perovskite Solar Cells** - Approaching 30% efficiency in lab settings
   Source: [Energy Science Journal]
   
2. **Offshore Floating Wind** - New installations increased by 45% this year
   Source: [Global Wind Report 2025]
   
3. **Green Hydrogen** - Production costs decreased by 38% since 2023
   Source: [Hydrogen Council]

## Market Developments
- **Investment**: Global investment in renewables reached $892 billion in 2024
- **Growth Regions**: Southeast Asia showing fastest adoption rate (27% YoY)
- **Policy Trends**: 65 countries now have net-zero targets codified in law

## Challenges
- Grid integration for variable renewable sources
- Supply chain constraints for critical minerals
- Regulatory harmonization across jurisdictions

## Promising Startups
| Company | Technology | Funding |
|---------|------------|---------|
| EnerVolt | Grid-scale storage | $120M |
| SolarFlex | Flexible PV panels | $87M |
| HydroGen | Green hydrogen | $215M |
&&

Feel free to edit or expand this summary based on specific areas you'd like to focus on.
```
