export type AdvancedPromptOptions = {
	system: string;
	context: Array<{ role: "user" | "assistant"; content: string }>;
	instruction?: string;
	maxTokens?: number;
	constraints?: string[];
};

export function composeAdvancedPrompt(opts: AdvancedPromptOptions): string {
	const header = opts.system ? `[SYSTEM]\n${opts.system}` : "";
	const ctx = opts.context
		.map((m) => `[${m.role.toUpperCase()}] ${m.content}`)
		.join("\n");
	const instr = opts.instruction ? `\n[INSTRUCTION]\n${opts.instruction}` : "";
	const constraints =
		opts.constraints && opts.constraints.length
			? `\n[CONSTRAINTS]\n${opts.constraints.join("\n")}`
			: "";
	return [header, ctx].filter(Boolean).join("\n") + instr + constraints;
}
