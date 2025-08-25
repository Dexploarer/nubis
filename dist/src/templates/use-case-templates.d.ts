/**
 * Use Case Templates
 * Templates for specific use cases and scenarios that elizaos supports
 */
/**
 * Community Management Template
 * Template for community management tasks and interactions
 */
export declare const communityManagementTemplate = "<task>Handle community management tasks for {{agentName}}.</task>\n\n<providers>\n{{providers}}\n</providers>\n\n<instructions>\nHandle community management tasks effectively:\n\n1. **Member Engagement**: Foster positive member interactions\n2. **Conflict Resolution**: Mediate disputes and conflicts\n3. **Growth Strategies**: Develop community growth plans\n4. **Moderation**: Maintain community standards and rules\n\nCOMMUNITY MANAGEMENT RULES:\n- Foster positive interactions\n- Resolve conflicts fairly\n- Develop growth strategies\n- Maintain community standards\n- Encourage participation\n- Build strong relationships\n\nGenerate a response that effectively manages community needs.\n</instructions>\n\n<output>\nRespond using XML format:\n<response>\n    <thought>Your community management analysis</thought>\n    <actions>ENGAGE_MEMBERS,RESOLVE_CONFLICTS,PROVIDE_GUIDANCE</actions>\n    <providers>COMMUNITY,RELATIONSHIPS</providers>\n    <text>Your community management response</text>\n</response>\n</output>";
/**
 * Content Creation Template
 * Template for creating various types of content
 */
export declare const contentCreationTemplate = "<task>Create content for {{agentName}} based on requirements.</task>\n\n<providers>\n{{providers}}\n</providers>\n\n<instructions>\nCreate engaging and valuable content:\n\n1. **Content Planning**: Plan content structure and flow\n2. **Writing**: Write engaging and informative content\n3. **Formatting**: Apply appropriate formatting and styling\n4. **Optimization**: Optimize content for target audience\n\nCONTENT CREATION RULES:\n- Plan content structure\n- Write engaging content\n- Apply appropriate formatting\n- Optimize for audience\n- Include relevant hashtags\n- Maintain brand voice\n\nGenerate high-quality content that meets requirements.\n</instructions>\n\n<output>\nRespond using XML format:\n<response>\n    <thought>Your content creation analysis</thought>\n    <actions>PLAN_CONTENT,WRITE_CONTENT,FORMAT_CONTENT</actions>\n    <providers>CONTENT,CREATIVITY</providers>\n    <text>Your created content</text>\n</response>\n</output>";
/**
 * Data Analysis Template
 * Template for analyzing data and providing insights
 */
export declare const dataAnalysisTemplate = "<task>Analyze data for {{agentName}} and provide insights.</task>\n\n<providers>\n{{providers}}\n</providers>\n\n<instructions>\nAnalyze data and provide valuable insights:\n\n1. **Data Collection**: Gather relevant data from sources\n2. **Data Processing**: Process and clean data as needed\n3. **Analysis**: Perform appropriate analysis\n4. **Insights**: Extract meaningful insights and recommendations\n\nDATA ANALYSIS RULES:\n- Collect relevant data\n- Process data accurately\n- Perform appropriate analysis\n- Extract meaningful insights\n- Provide actionable recommendations\n- Present results clearly\n\nGenerate data-driven insights and recommendations.\n</instructions>\n\n<output>\nRespond using XML format:\n<response>\n    <thought>Your data analysis process</thought>\n    <actions>COLLECT_DATA,ANALYZE_DATA,EXTRACT_INSIGHTS</actions>\n    <providers>DATA,ANALYTICS</providers>\n    <text>Your data analysis results and insights</text>\n</response>\n</output>";
/**
 * Problem Solving Template
 * Template for solving problems and providing solutions
 */
export declare const problemSolvingTemplate = "<task>Solve problems for {{agentName}} using systematic approach.</task>\n\n<providers>\n{{providers}}\n</providers>\n\n<instructions>\nSolve problems using a systematic approach:\n\n1. **Problem Analysis**: Understand the problem thoroughly\n2. **Solution Generation**: Generate potential solutions\n3. **Solution Evaluation**: Evaluate and rank solutions\n4. **Implementation Plan**: Create implementation plan\n\nPROBLEM SOLVING RULES:\n- Analyze problems thoroughly\n- Generate multiple solutions\n- Evaluate solutions objectively\n- Create implementation plans\n- Consider long-term implications\n- Provide clear guidance\n\nGenerate effective problem-solving solutions.\n</instructions>\n\n<output>\nRespond using XML format:\n<response>\n    <thought>Your problem-solving analysis</thought>\n    <actions>ANALYZE_PROBLEM,GENERATE_SOLUTIONS,EVALUATE_OPTIONS</actions>\n    <providers>PROBLEM_SOLVING,LOGIC</providers>\n    <text>Your problem-solving solution and plan</text>\n</response>\n</output>";
/**
 * Learning and Education Template
 * Template for educational interactions and knowledge sharing
 */
export declare const learningEducationTemplate = "<task>Provide educational content and learning support for {{agentName}}.</task>\n\n<providers>\n{{providers}}\n</providers>\n\n<instructions>\nProvide educational content and learning support:\n\n1. **Knowledge Assessment**: Assess current knowledge level\n2. **Content Creation**: Create educational content\n3. **Learning Path**: Develop learning path and progression\n4. **Progress Tracking**: Track learning progress\n\nLEARNING AND EDUCATION RULES:\n- Assess knowledge levels\n- Create educational content\n- Develop learning paths\n- Track progress effectively\n- Provide clear explanations\n- Encourage active learning\n\nGenerate educational content and learning support.\n</instructions>\n\n<output>\nRespond using XML format:\n<response>\n    <thought>Your educational analysis</thought>\n    <actions>ASSESS_KNOWLEDGE,CREATE_CONTENT,DEVELOP_PATH</actions>\n    <providers>EDUCATION,KNOWLEDGE</providers>\n    <text>Your educational content and guidance</text>\n</response>\n</output>";
/**
 * Creative Writing Template
 * Template for creative writing and storytelling
 */
export declare const creativeWritingTemplate = "<task>Create creative content for {{agentName}}.</task>\n\n<providers>\n{{providers}}\n</providers>\n\n<instructions>\nCreate engaging creative content:\n\n1. **Story Development**: Develop compelling storylines\n2. **Character Creation**: Create interesting characters\n3. **World Building**: Build immersive worlds and settings\n4. **Narrative Flow**: Ensure smooth narrative flow\n\nCREATIVE WRITING RULES:\n- Develop compelling stories\n- Create interesting characters\n- Build immersive worlds\n- Ensure smooth flow\n- Engage audience emotions\n- Maintain consistency\n\nGenerate creative and engaging content.\n</instructions>\n\n<output>\nRespond using XML format:\n<response>\n    <thought>Your creative writing process</thought>\n    <actions>DEVELOP_STORY,CREATE_CHARACTERS,BUILD_WORLD</actions>\n    <providers>CREATIVITY,STORYTELLING</providers>\n    <text>Your creative content</text>\n</response>\n</output>";
/**
 * Technical Support Template
 * Template for providing technical support and assistance
 */
export declare const technicalSupportTemplate = "<task>Provide technical support for {{agentName}}.</task>\n\n<providers>\n{{providers}}\n</providers>\n\n<instructions>\nProvide effective technical support:\n\n1. **Issue Diagnosis**: Diagnose technical issues accurately\n2. **Solution Development**: Develop appropriate solutions\n3. **Step-by-Step Guidance**: Provide clear step-by-step instructions\n4. **Follow-up Support**: Ensure issue resolution\n\nTECHNICAL SUPPORT RULES:\n- Diagnose issues accurately\n- Develop appropriate solutions\n- Provide clear instructions\n- Ensure issue resolution\n- Maintain patience and clarity\n- Document solutions\n\nGenerate effective technical support and solutions.\n</instructions>\n\n<output>\nRespond using XML format:\n<response>\n    <thought>Your technical support analysis</thought>\n    <actions>DIAGNOSE_ISSUE,DEVELOP_SOLUTION,PROVIDE_GUIDANCE</actions>\n    <providers>TECHNICAL_SUPPORT,KNOWLEDGE</providers>\n    <text>Your technical support response and solution</text>\n</response>\n</output>";
/**
 * Strategic Planning Template
 * Template for strategic planning and long-term thinking
 */
export declare const strategicPlanningTemplate = "<task>Provide strategic planning for {{agentName}}.</task>\n\n<providers>\n{{providers}}\n</providers>\n\n<instructions>\nProvide strategic planning and long-term thinking:\n\n1. **Goal Setting**: Define clear goals and objectives\n2. **Strategy Development**: Develop comprehensive strategies\n3. **Resource Planning**: Plan resource allocation\n4. **Implementation Roadmap**: Create implementation roadmap\n\nSTRATEGIC PLANNING RULES:\n- Define clear goals\n- Develop comprehensive strategies\n- Plan resource allocation\n- Create implementation roadmaps\n- Consider long-term implications\n- Maintain flexibility\n\nGenerate strategic planning and guidance.\n</instructions>\n\n<output>\nRespond using XML format:\n<response>\n    <thought>Your strategic planning analysis</thought>\n    <actions>SET_GOALS,DEVELOP_STRATEGY,PLAN_RESOURCES</actions>\n    <providers>STRATEGY,PLANNING</providers>\n    <text>Your strategic planning and roadmap</text>\n</response>\n</output>";
declare const _default: {
    communityManagementTemplate: string;
    contentCreationTemplate: string;
    dataAnalysisTemplate: string;
    problemSolvingTemplate: string;
    learningEducationTemplate: string;
    creativeWritingTemplate: string;
    technicalSupportTemplate: string;
    strategicPlanningTemplate: string;
};
export default _default;
