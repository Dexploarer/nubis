declare module 'telegraf' {
  export class Telegraf {
    constructor(token: string, options?: any);
    launch(): Promise<void>;
    stop(): Promise<void>;
    on(event: string, handler: Function): this;
    use(middleware: Function): this;
    command(command: string, handler: Function): this;
    action(action: string | RegExp, handler: Function): this;
    hears(trigger: string | RegExp, handler: Function): this;
  }

  export default Telegraf;
}

declare module 'telegraf/types' {
  export interface Context {
    message?: any;
    callbackQuery?: any;
    chat?: any;
    from?: any;
    reply(text: string, extra?: any): Promise<any>;
    replyWithHTML(text: string, extra?: any): Promise<any>;
    replyWithMarkdown(text: string, extra?: any): Promise<any>;
    replyWithPhoto(photo: string | Buffer, extra?: any): Promise<any>;
    answerCbQuery(text?: string, options?: any): Promise<any>;
    editMessageText(text: string, extra?: any): Promise<any>;
    editMessageReplyMarkup(markup: any): Promise<any>;
    deleteMessage(): Promise<any>;
  }
}