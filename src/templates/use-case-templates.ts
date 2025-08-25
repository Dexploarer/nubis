/**
 * Use Case Templates
 * Templates for specific use cases and scenarios that elizaos supports
 */

/**
 * Community Management Template
 * Template for community management tasks and interactions
 */
export const communityManagementTemplate = `<task>Handle community management tasks for {{agentName}}.</task>

<providers>
{{providers}}
</providers>

<instructions>
Handle community management tasks effectively:

1. **Member Engagement**: Foster positive member interactions
2. **Conflict Resolution**: Mediate disputes and conflicts
3. **Growth Strategies**: Develop community growth plans
4. **Moderation**: Maintain community standards and rules

COMMUNITY MANAGEMENT RULES:
- Foster positive interactions
- Resolve conflicts fairly
- Develop growth strategies
- Maintain community standards
- Encourage participation
- Build strong relationships

Generate a response that effectively manages community needs.
</instructions>

<output>
Respond using XML format:
<response>
    <thought>Your community management analysis</thought>
    <actions>ENGAGE_MEMBERS,RESOLVE_CONFLICTS,PROVIDE_GUIDANCE</actions>
    <providers>COMMUNITY,RELATIONSHIPS</providers>
    <text>Your community management response</text>
</response>
</output>`;

/**
 * Content Creation Template
 * Template for creating various types of content
 */
export const contentCreationTemplate = `<task>Create content for {{agentName}} based on requirements.</task>

<providers>
{{providers}}
</providers>

<instructions>
Create engaging and valuable content:

1. **Content Planning**: Plan content structure and flow
2. **Writing**: Write engaging and informative content
3. **Formatting**: Apply appropriate formatting and styling
4. **Optimization**: Optimize content for target audience

CONTENT CREATION RULES:
- Plan content structure
- Write engaging content
- Apply appropriate formatting
- Optimize for audience
- Include relevant hashtags
- Maintain brand voice

Generate high-quality content that meets requirements.
</instructions>

<output>
Respond using XML format:
<response>
    <thought>Your content creation analysis</thought>
    <actions>PLAN_CONTENT,WRITE_CONTENT,FORMAT_CONTENT</actions>
    <providers>CONTENT,CREATIVITY</providers>
    <text>Your created content</text>
</response>
</output>`;

/**
 * Data Analysis Template
 * Template for analyzing data and providing insights
 */
export const dataAnalysisTemplate = `<task>Analyze data for {{agentName}} and provide insights.</task>

<providers>
{{providers}}
</providers>

<instructions>
Analyze data and provide valuable insights:

1. **Data Collection**: Gather relevant data from sources
2. **Data Processing**: Process and clean data as needed
3. **Analysis**: Perform appropriate analysis
4. **Insights**: Extract meaningful insights and recommendations

DATA ANALYSIS RULES:
- Collect relevant data
- Process data accurately
- Perform appropriate analysis
- Extract meaningful insights
- Provide actionable recommendations
- Present results clearly

Generate data-driven insights and recommendations.
</instructions>

<output>
Respond using XML format:
<response>
    <thought>Your data analysis process</thought>
    <actions>COLLECT_DATA,ANALYZE_DATA,EXTRACT_INSIGHTS</actions>
    <providers>DATA,ANALYTICS</providers>
    <text>Your data analysis results and insights</text>
</response>
</output>`;

/**
 * Problem Solving Template
 * Template for solving problems and providing solutions
 */
export const problemSolvingTemplate = `<task>Solve problems for {{agentName}} using systematic approach.</task>

<providers>
{{providers}}
</providers>

<instructions>
Solve problems using a systematic approach:

1. **Problem Analysis**: Understand the problem thoroughly
2. **Solution Generation**: Generate potential solutions
3. **Solution Evaluation**: Evaluate and rank solutions
4. **Implementation Plan**: Create implementation plan

PROBLEM SOLVING RULES:
- Analyze problems thoroughly
- Generate multiple solutions
- Evaluate solutions objectively
- Create implementation plans
- Consider long-term implications
- Provide clear guidance

Generate effective problem-solving solutions.
</instructions>

<output>
Respond using XML format:
<response>
    <thought>Your problem-solving analysis</thought>
    <actions>ANALYZE_PROBLEM,GENERATE_SOLUTIONS,EVALUATE_OPTIONS</actions>
    <providers>PROBLEM_SOLVING,LOGIC</providers>
    <text>Your problem-solving solution and plan</text>
</response>
</output>`;

/**
 * Learning and Education Template
 * Template for educational interactions and knowledge sharing
 */
export const learningEducationTemplate = `<task>Provide educational content and learning support for {{agentName}}.</task>

<providers>
{{providers}}
</providers>

<instructions>
Provide educational content and learning support:

1. **Knowledge Assessment**: Assess current knowledge level
2. **Content Creation**: Create educational content
3. **Learning Path**: Develop learning path and progression
4. **Progress Tracking**: Track learning progress

LEARNING AND EDUCATION RULES:
- Assess knowledge levels
- Create educational content
- Develop learning paths
- Track progress effectively
- Provide clear explanations
- Encourage active learning

Generate educational content and learning support.
</instructions>

<output>
Respond using XML format:
<response>
    <thought>Your educational analysis</thought>
    <actions>ASSESS_KNOWLEDGE,CREATE_CONTENT,DEVELOP_PATH</actions>
    <providers>EDUCATION,KNOWLEDGE</providers>
    <text>Your educational content and guidance</text>
</response>
</output>`;

/**
 * Creative Writing Template
 * Template for creative writing and storytelling
 */
export const creativeWritingTemplate = `<task>Create creative content for {{agentName}}.</task>

<providers>
{{providers}}
</providers>

<instructions>
Create engaging creative content:

1. **Story Development**: Develop compelling storylines
2. **Character Creation**: Create interesting characters
3. **World Building**: Build immersive worlds and settings
4. **Narrative Flow**: Ensure smooth narrative flow

CREATIVE WRITING RULES:
- Develop compelling stories
- Create interesting characters
- Build immersive worlds
- Ensure smooth flow
- Engage audience emotions
- Maintain consistency

Generate creative and engaging content.
</instructions>

<output>
Respond using XML format:
<response>
    <thought>Your creative writing process</thought>
    <actions>DEVELOP_STORY,CREATE_CHARACTERS,BUILD_WORLD</actions>
    <providers>CREATIVITY,STORYTELLING</providers>
    <text>Your creative content</text>
</response>
</output>`;

/**
 * Technical Support Template
 * Template for providing technical support and assistance
 */
export const technicalSupportTemplate = `<task>Provide technical support for {{agentName}}.</task>

<providers>
{{providers}}
</providers>

<instructions>
Provide effective technical support:

1. **Issue Diagnosis**: Diagnose technical issues accurately
2. **Solution Development**: Develop appropriate solutions
3. **Step-by-Step Guidance**: Provide clear step-by-step instructions
4. **Follow-up Support**: Ensure issue resolution

TECHNICAL SUPPORT RULES:
- Diagnose issues accurately
- Develop appropriate solutions
- Provide clear instructions
- Ensure issue resolution
- Maintain patience and clarity
- Document solutions

Generate effective technical support and solutions.
</instructions>

<output>
Respond using XML format:
<response>
    <thought>Your technical support analysis</thought>
    <actions>DIAGNOSE_ISSUE,DEVELOP_SOLUTION,PROVIDE_GUIDANCE</actions>
    <providers>TECHNICAL_SUPPORT,KNOWLEDGE</providers>
    <text>Your technical support response and solution</text>
</response>
</output>`;

/**
 * Strategic Planning Template
 * Template for strategic planning and long-term thinking
 */
export const strategicPlanningTemplate = `<task>Provide strategic planning for {{agentName}}.</task>

<providers>
{{providers}}
</providers>

<instructions>
Provide strategic planning and long-term thinking:

1. **Goal Setting**: Define clear goals and objectives
2. **Strategy Development**: Develop comprehensive strategies
3. **Resource Planning**: Plan resource allocation
4. **Implementation Roadmap**: Create implementation roadmap

STRATEGIC PLANNING RULES:
- Define clear goals
- Develop comprehensive strategies
- Plan resource allocation
- Create implementation roadmaps
- Consider long-term implications
- Maintain flexibility

Generate strategic planning and guidance.
</instructions>

<output>
Respond using XML format:
<response>
    <thought>Your strategic planning analysis</thought>
    <actions>SET_GOALS,DEVELOP_STRATEGY,PLAN_RESOURCES</actions>
    <providers>STRATEGY,PLANNING</providers>
    <text>Your strategic planning and roadmap</text>
</response>
</output>`;

export default {
  communityManagementTemplate,
  contentCreationTemplate,
  dataAnalysisTemplate,
  problemSolvingTemplate,
  learningEducationTemplate,
  creativeWritingTemplate,
  technicalSupportTemplate,
  strategicPlanningTemplate
};
