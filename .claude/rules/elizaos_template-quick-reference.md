---
trigger: always_on
---

Add these workflows to your common slash-command allowlist (if you use auto-exec).
Want me to add quick “References” sections to all existing workflows for full cross-linking to rul*** Begin Patch
*** Update File: /.windsurf/rules/elizaos_template-quick-reference.md
@@
 ### 5. replyTemplate
 **Purpose**: Generates character dialog responses
 
 **Response Format**:
 ```xml
 <response>
   <thought>Your thought here</thought>
   <message>Your message here</message>
 </response>
 ```
 
 **Usage**: For simple reply actions
-
+ 
+### 6. imageGenerationTemplate
+**Purpose**: Creates prompts for image generation
+
+**Response Format**:
+```xml
+<response>
+  <prompt>Your image generation prompt here</prompt>
+</response>
+```
+
+**Usage**: Use when generating an image prompt to pass to the IMAGE model
+
+### 7. booleanFooter
+**Purpose**: Footer directive to constrain response to a strict YES or NO
+
+**Usage**: Append to prompts that must yield a boolean decision
+
+## Built-in Actions
+- REPLY
+- GENERATE_IMAGE
+- CHOICE
+- FOLLOW_ROOM
+- IGNORE
+- MUTE_ROOM
+- NONE
+- UPDATE_ROLE
+- SEND_MESSAGE
+- UPDATE_SETTINGS
+- UNFOLLOW_ROOM
+- UNMUTE_ROOM
+- UPDATE_ENTITY
+
+## Action Interface Structure
+Each action implements the `Action` interface and includes:
+- name: string
+- description: string
+- validate(runtime): Promise<boolean>
+- handler(runtime, message, state, options, callback): Promise<ActionResult>
+- examples: ActionExample[][]
+
 ## Critical Rules Quick Reference
*** End Patch
es/knowledge?